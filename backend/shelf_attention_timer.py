import cv2
from ultralytics import YOLO
import supervision as sv
import time

model = YOLO("yolov8n.pt")
tracker = sv.ByteTrack()

cap = cv2.VideoCapture("store_video.mp4")

if not cap.isOpened():
    print("Cannot open video")
    exit()

# Track shopper attention
shopper_shelf = {}
shopper_entry = {}

while True:

    ret, frame = cap.read()

    if not ret:
        break

    h, w, _ = frame.shape

    results = model(frame)[0]

    detections = sv.Detections.from_ultralytics(results)
    detections = detections[detections.class_id == 0]
    detections = tracker.update_with_detections(detections)

    # Draw shelf boundaries
    cv2.line(frame, (w//3, 0), (w//3, h), (255,0,0), 2)
    cv2.line(frame, (2*w//3, 0), (2*w//3, h), (255,0,0), 2)

    cv2.putText(frame,"Shelf A",(30,35),
                cv2.FONT_HERSHEY_SIMPLEX,1,(255,0,0),2)

    cv2.putText(frame,"Shelf B",(w//3+30,35),
                cv2.FONT_HERSHEY_SIMPLEX,1,(255,0,0),2)

    cv2.putText(frame,"Shelf C",(2*w//3+30,35),
                cv2.FONT_HERSHEY_SIMPLEX,1,(255,0,0),2)

    for i, box in enumerate(detections.xyxy):

        if detections.tracker_id[i] is None:
            continue

        shopper_id = int(detections.tracker_id[i])

        x1,y1,x2,y2 = map(int, box)

        center_x = (x1+x2)//2

        # Determine shelf
        if center_x < w//3:
            shelf = "Shelf A"

        elif center_x < 2*w//3:
            shelf = "Shelf B"

        else:
            shelf = "Shelf C"

        # First appearance
        if shopper_id not in shopper_entry:

            shopper_entry[shopper_id] = time.time()
            shopper_shelf[shopper_id] = shelf

        # Shopper moved to another shelf
        elif shopper_shelf[shopper_id] != shelf:

            shopper_entry[shopper_id] = time.time()
            shopper_shelf[shopper_id] = shelf

        attention_time = time.time() - shopper_entry[shopper_id]

        cv2.rectangle(frame,(x1,y1),(x2,y2),(0,255,255),2)

        cv2.putText(
            frame,
            f"ID:{shopper_id}",
            (x1,y1-40),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.7,
            (0,255,255),
            2
        )

        cv2.putText(
            frame,
            shelf,
            (x1,y1-20),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.7,
            (0,255,0),
            2
        )

        cv2.putText(
            frame,
            f"{attention_time:.1f}s",
            (x1,y2+20),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.7,
            (0,0,255),
            2
        )

    cv2.imshow("Shelf Attention Analytics", frame)

    if cv2.waitKey(25) & 0xFF == ord("q"):
        break

cap.release()
cv2.destroyAllWindows()