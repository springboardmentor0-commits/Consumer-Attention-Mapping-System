import cv2
from ultralytics import YOLO
import supervision as sv

model = YOLO("yolov8n.pt")

tracker = sv.ByteTrack()

cap = cv2.VideoCapture("store_video.mp4")

if not cap.isOpened():
    print("Cannot open video")
    exit()

while True:

    ret, frame = cap.read()

    if not ret:
        break

    height, width, _ = frame.shape

    SHELF_A = (0, 0, width//3, height)
    SHELF_B = (width//3, 0, 2*width//3, height)
    SHELF_C = (2*width//3, 0, width, height)

    results = model(frame)[0]

    detections = sv.Detections.from_ultralytics(results)

    detections = detections[detections.class_id == 0]

    detections = tracker.update_with_detections(detections)

    # Draw shelf rectangles
    cv2.rectangle(frame, (SHELF_A[0], SHELF_A[1]), (SHELF_A[2], SHELF_A[3]), (255,0,0),2)
    cv2.rectangle(frame, (SHELF_B[0], SHELF_B[1]), (SHELF_B[2], SHELF_B[3]), (0,255,0),2)
    cv2.rectangle(frame, (SHELF_C[0], SHELF_C[1]), (SHELF_C[2], SHELF_C[3]), (0,0,255),2)

    cv2.putText(frame,"Shelf A",(20,35),cv2.FONT_HERSHEY_SIMPLEX,1,(255,0,0),2)
    cv2.putText(frame,"Shelf B",(width//3+20,35),cv2.FONT_HERSHEY_SIMPLEX,1,(0,255,0),2)
    cv2.putText(frame,"Shelf C",(2*width//3+20,35),cv2.FONT_HERSHEY_SIMPLEX,1,(0,0,255),2)

    for i, box in enumerate(detections.xyxy):

        x1, y1, x2, y2 = map(int, box)

        center_x = (x1 + x2) // 2
        center_y = (y1 + y2) // 2

        tracker_id = detections.tracker_id[i]

        if tracker_id is None:
            continue

        # Determine shelf
        if center_x < width // 3:
            shelf = "Shelf A"

        elif center_x < 2 * width // 3:
            shelf = "Shelf B"

        else:
            shelf = "Shelf C"

        # Draw person
        cv2.rectangle(frame,(x1,y1),(x2,y2),(0,255,255),2)

        cv2.circle(frame,(center_x,center_y),5,(0,0,255),-1)

        cv2.putText(
            frame,
            f"ID {tracker_id} | {shelf}",
            (x1,y1-10),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.6,
            (255,255,255),
            2
        )

        print(f"Shopper {tracker_id} -> {shelf}")

    cv2.imshow("Shelf Tracking", frame)

    if cv2.waitKey(25) & 0xFF == ord("q"):
        break

cap.release()
cv2.destroyAllWindows()