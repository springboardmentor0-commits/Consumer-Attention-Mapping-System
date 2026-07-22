import cv2
from ultralytics import YOLO
import supervision as sv

# Load YOLO model
model = YOLO("yolov8n.pt")

# Create ByteTrack tracker
tracker = sv.ByteTrack()

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