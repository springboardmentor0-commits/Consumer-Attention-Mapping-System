import cv2
from ultralytics import YOLO

from tracking.dwell_time import (
    get_shelf_zone,
    update_dwell_time
)

# Load pretrained YOLOv8 model
model = YOLO("yolov8n.pt")
# Map ByteTrack IDs to clean shopper IDs
shopper_id_map = {}
next_shopper_id = 1
frame_count = 0
# Path to retail test video
video_path = "test_videos/retail_test.mp4"

# Open video
cap = cv2.VideoCapture(video_path)

# Get original video properties
width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
fps = cap.get(cv2.CAP_PROP_FPS)

# Create output video writer
fourcc = cv2.VideoWriter_fourcc(*"mp4v")

out = cv2.VideoWriter(
    "tracked_output.mp4",
    fourcc,
    fps,
    (width, height)
)

while cap.isOpened():
    success, frame = cap.read()

    if not success:
        break
    frame_count += 1

    # Detect only persons (COCO class 0)
    results = model.track(
    frame,
    persist=True,
    classes=[0],
    tracker="tracking/custom_bytetrack.yaml",
    verbose=False
)

    # Draw bounding boxes
    # Copy original frame
    annotated_frame = frame.copy()

    # Get shelf zone coordinates
    zone_x1, zone_y1, zone_x2, zone_y2 = get_shelf_zone()

    # Draw shelf zone rectangle
    cv2.rectangle(
        annotated_frame,
        (zone_x1, zone_y1),
        (zone_x2, zone_y2),
        (255, 0, 0),
        3
    )

    # Add shelf zone label
    cv2.putText(
        annotated_frame,
        "Shelf Zone",
        (zone_x1, max(zone_y1 - 10, 30)),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.8,
        (255, 0, 0),
        2
    )

    result = results[0]
    # Check whether tracking IDs exist
    if result.boxes is not None and result.boxes.id is not None:
        boxes = result.boxes.xyxy.cpu().numpy()
        track_ids = result.boxes.id.int().cpu().tolist()

    for box, track_id in zip(boxes, track_ids):
        x1, y1, x2, y2 = map(int, box)

        # Draw bounding box
        cv2.rectangle(
            annotated_frame,
            (x1, y1),
            (x2, y2),
            (0, 255, 0),
            2
        )

        # Custom shopper label
        # Assign a clean sequential shopper ID
        if track_id not in shopper_id_map:
             shopper_id_map[track_id] = next_shopper_id
             next_shopper_id += 1

        clean_id = shopper_id_map[track_id]
        label = f"Shopper #{clean_id}"

        # Calculate live dwell time
        dwell_time = update_dwell_time(
            clean_id,
            (x1, y1, x2, y2)
        
        )

        # Show dwell time only when active
        if dwell_time > 0:
            label = f"Shopper #{clean_id} | Dwell: {dwell_time:.1f}s"
        #print(f"Tracking Shopper #{clean_id}")

        cv2.putText(
            annotated_frame,
            label,
            (x1, max(y1 - 10, 20)),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.7,
            (0, 255, 0),
            2
        )
    
    # Display frame number
    cv2.putText(
        annotated_frame,
        f"Frame: {frame_count}",
        (20, 40),
        cv2.FONT_HERSHEY_SIMPLEX,
        1,
        (0, 255, 0),
        2
)
    # Save tracked frame to output video
    out.write(annotated_frame)



    # Resize only for display
    display_frame = cv2.resize(
    annotated_frame,
    (960, 540)
)

    cv2.imshow("Person Detection", display_frame)

    # Press Q to stop
    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

cap.release()
out.release()
cv2.destroyAllWindows()

print("Tracked output video saved successfully!")