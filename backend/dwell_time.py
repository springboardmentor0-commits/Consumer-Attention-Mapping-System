import cv2
from ultralytics import YOLO
import supervision as sv
import time

from database import SessionLocal
from models import AttentionLog
from datetime import datetime

# Load YOLO model
model = YOLO("yolov8n.pt")

# Create ByteTrack tracker
tracker = sv.ByteTrack()

# Stores when each shopper first appeared
entry_times = {}

# Stores currently active shoppers
active_ids = set()

# Create annotators
bounding_box_annotator = sv.BoxAnnotator()
label_annotator = sv.LabelAnnotator()

video_path = "store_video.mp4"

cap = cv2.VideoCapture(video_path)

if not cap.isOpened():
    print("Error opening video")
    exit()

print("Starting Shopper Tracking...")

while True:

    ret, frame = cap.read()

    if not ret:
        print("Video Finished")
        break

    # YOLO Detection
    result = model(frame)[0]

    # Convert YOLO results
    detections = sv.Detections.from_ultralytics(result)

    # Keep only PERSON class (COCO = 0)
    detections = detections[detections.class_id == 0]

    # Track people
    detections = tracker.update_with_detections(detections)

    
    
    current_ids = set()

    for tracker_id in detections.tracker_id:

        if tracker_id is None:
            continue

        current_ids.add(int(tracker_id))

        # New shopper detected
        if tracker_id not in entry_times:

            entry_times[int(tracker_id)] = time.time()

            print(f"🟢 Shopper {int(tracker_id)} Entered")


    # Find shoppers who disappeared
    left_ids = active_ids - current_ids

    for shopper_id in left_ids:

        start_time = entry_times.pop(int(shopper_id))

        dwell_time = time.time() - start_time

        print(f"🔴 Shopper {shopper_id} Left | Dwell Time: {dwell_time:.2f} seconds")


        db = SessionLocal()

        log = AttentionLog(

            shopper_id=int(shopper_id),

            store_id=1,

            shelf_id=1,

            entry_time=datetime.fromtimestamp(start_time),

            exit_time=datetime.now(),

            dwell_time=float(dwell_time))

        db.add(log)

        db.commit()

        db.close()

    # Update active shoppers
    active_ids = current_ids

    # Labels
    labels = [
        f"ID {tracker_id}"
        for tracker_id in detections.tracker_id
    ]

    # Draw bounding boxes
    annotated_frame = bounding_box_annotator.annotate(
        scene=frame.copy(),
        detections=detections
    )

    # Draw IDs
    annotated_frame = label_annotator.annotate(
        scene=annotated_frame,
        detections=detections,
        labels=labels
    )

    cv2.imshow("Consumer Tracking Engine", annotated_frame)

    if cv2.waitKey(25) & 0xFF == ord("q"):
        break

cap.release()
cv2.destroyAllWindows()