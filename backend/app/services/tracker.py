import cv2
from ultralytics import YOLO
from app.services.head_pose import HeadPoseEstimator
from app.services.shelf_mapper import ShelfMapper
from app.services.dwell_time import DwellTimeTracker
from app.services.attention_tracker import AttentionTracker
from app.services.analytics_service import AnalyticsService

model = YOLO("yolov8n.pt")
dwell_tracker = DwellTimeTracker()
head_pose = HeadPoseEstimator()
shelf_mapper = ShelfMapper()
attention_tracker = AttentionTracker()
analytics = AnalyticsService()

video_path = "app/services/videos/shopping1.mp4"
cap = cv2.VideoCapture(video_path)

if not cap.isOpened():
    print("Unable to open video.")
    exit()

while True:
    ret, frame = cap.read()

    if not ret:
        break

    current_video_time = cap.get(cv2.CAP_PROP_POS_MSEC) / 1000.0

    frame = cv2.resize(frame, (900, 500))

    results = model.track(
        frame,
        persist=True,
        tracker="app/services/my_bytetrack.yaml",
        classes=[0],
        conf=0.45,
        iou=0.5,
        verbose=False
    )

    annotated_frame = frame.copy()
    track_ids = set()

    if (
        results
        and results[0].boxes is not None
        and results[0].boxes.id is not None
    ):

        boxes = results[0].boxes

        for i in range(len(boxes)):

            x1, y1, x2, y2 = map(int, boxes.xyxy[i].cpu().numpy())

            width = x2 - x1
            height = y2 - y1

            if width < 25 or height < 60:
                continue

            track_id = int(boxes.id[i].cpu().item())
            track_ids.add(track_id)

            cv2.rectangle(
                annotated_frame,
                (x1, y1),
                (x2, y2),
                (0, 255, 0),
                2
            )

            dwell = dwell_tracker.dwell_times.get(track_id, 0)

            # Crop upper portion of the person (head + shoulders)
            head_roi = frame[y1:y1 + int((y2 - y1) * 0.4), x1:x2]

            direction = "NO FACE"
            attention_zone = "Unknown"

            if head_roi.size != 0:
                pitch, yaw, roll = head_pose.estimate(head_roi)
                direction = head_pose.get_direction(yaw)
                person_x = (x1 + x2) // 2

                current_zone = shelf_mapper.get_current_zone(person_x)

                attention_zone = shelf_mapper.get_attention_zone(
                    current_zone,
                    direction
                )
                attention_tracker.update(track_id,attention_zone,current_video_time)
                #print(f"Yaw: {yaw}, Direction: {direction}")

            cv2.putText(
                annotated_frame,
                f"ID {track_id}",
                (x1, y1 - 35),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.6,
                (255, 255, 0),
                2
            )

            cv2.putText(
                annotated_frame,
                f"{dwell:.1f} sec",
                (x1, y1 - 12),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.6,
                (0, 255, 0),
                2
            )

            cv2.putText(
                 annotated_frame,
                 direction,
                 (x1, y2 + 20),
                 cv2.FONT_HERSHEY_SIMPLEX,
                 0.6,
                 (0, 0, 255),
                 2
            )
            cv2.putText(
                annotated_frame,
                f"Viewing: {attention_zone}",
                (x1, y2 + 45),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.55,
                (255, 0, 255),
                2
            )


    finished_sessions = dwell_tracker.update(
        track_ids,
        current_video_time
    )
    #print("Active IDs:", track_ids)
    #print("Finished Sessions:", finished_sessions)

    for session in finished_sessions:

        zone_times = attention_tracker.finish_session(
            session["track_id"]
        )

        print("\n========== SHOPPER SESSION ==========")
        print(f"Shopper ID : {session['track_id']}")
        print(f"Dwell Time : {session['dwell_time']:.2f} sec")

        if zone_times:

            print("\nAttention Summary")

            for zone, seconds in zone_times.items():
                print(f"{zone} : {seconds:.2f} sec")

            most_viewed = max(
                zone_times,
                key=zone_times.get
            )

            print(f"\nMost Viewed : {most_viewed}")

        print("=====================================")

        analytics.save_session(
            shopper_id=session["track_id"],
            dwell_time=session["dwell_time"],
            zone_times=zone_times if zone_times else {}
        )

    cv2.imshow(
        "Consumer Attention Mapping System",
        annotated_frame
    )

    if cv2.waitKey(1) & 0xFF == ord("q"):
        break


# ---------------------------------------
# Video finished
# Force remaining shoppers to exit
# ---------------------------------------

current_video_time = cap.get(cv2.CAP_PROP_POS_MSEC) / 1000.0

finished_sessions = dwell_tracker.update(
    [],
    current_video_time + 5
)

for session in finished_sessions:

    zone_times = attention_tracker.finish_session(
        session["track_id"]
    )

    print("\n========== SHOPPER SESSION ==========")
    print(f"Shopper ID : {session['track_id']}")
    print(f"Dwell Time : {session['dwell_time']:.2f} sec")

    if zone_times:

        print("\nAttention Summary")

        for zone, seconds in zone_times.items():
            print(f"{zone} : {seconds:.2f} sec")

        most_viewed = max(
            zone_times,
            key=zone_times.get
        )

        print(f"\nMost Viewed : {most_viewed}")

    print("=====================================")

    analytics.save_session(
        shopper_id=session["track_id"],
        dwell_time=session["dwell_time"],
        zone_times=zone_times if zone_times else {}
    )

cap.release()
cv2.destroyAllWindows()