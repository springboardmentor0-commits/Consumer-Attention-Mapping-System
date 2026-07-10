import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from ultralytics import YOLO
import supervision as sv
import cv2
import time

from database import SessionLocal
from models import TrackingSession
from datetime import datetime

# Load YOLO model
model = YOLO("models/yolov8n.pt")

# Initialize ByteTrack
tracker = sv.ByteTrack()

entry_times = {}

db = SessionLocal()

active_ids = set()

# Annotators
box_annotator = sv.BoxAnnotator()
label_annotator = sv.LabelAnnotator()

video_path = "videos/vtest.avi"
cap = cv2.VideoCapture(video_path)

while cap.isOpened():

    success, frame = cap.read()

    if not success:
        break

    # YOLO detection
    results = model(frame, classes=[0], verbose=False)[0]

    # Convert detections
    detections = sv.Detections.from_ultralytics(results)

    # Update tracker
    detections = tracker.update_with_detections(detections)

    current_ids = set()

    for tracker_id in detections.tracker_id:
        current_ids.add(tracker_id)

    # People who left the frame
    left_ids = active_ids - current_ids

    for tracker_id in left_ids:

        entry = datetime.fromtimestamp(entry_times[tracker_id])
        exit_time = datetime.now()

        dwell = (exit_time - entry).total_seconds()

        session = TrackingSession(
            tracker_id=int(tracker_id),
            shelf_id=1,
            entry_time=entry,
            exit_time=exit_time,
            dwell_duration=dwell
        )

        db.add(session)
        db.commit()

        print(f"Saved Shopper {tracker_id} | {dwell:.1f} seconds")

        del entry_times[tracker_id]

    # Create labels
    labels = []

    for tracker_id in detections.tracker_id:

        if tracker_id not in entry_times:
            entry_times[tracker_id] = time.time()

        dwell_time = time.time() - entry_times[tracker_id]

        labels.append(
            f"ID {tracker_id} | {dwell_time:.1f}s"
        )

    # Draw boxes
    annotated_frame = box_annotator.annotate(
        scene=frame,
        detections=detections
    )

    # Draw labels
    annotated_frame = label_annotator.annotate(
        scene=annotated_frame,
        detections=detections,
        labels=labels
    )

    active_ids = current_ids

    cv2.imshow("Consumer Tracking", annotated_frame)

    if cv2.waitKey(1) & 0xFF == ord("q"):
        break
cap.release()
cv2.destroyAllWindows()
db.close()