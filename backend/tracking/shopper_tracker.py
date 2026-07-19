import cv2
from ultralytics import YOLO

from tracking.dwell_time import (
    SHELF_ZONE,
    get_shelf_zone,
    update_dwell_time
)
from tracking.head_pose import (
    detect_face,
    estimate_head_pose,
    get_head_angles,
    get_gaze_endpoint
)
from tracking.head_pose import (
    detect_face,
    estimate_head_pose,
    get_head_angles,
    get_gaze_endpoint,
    gaze_intersects_shelf
)
# Load pretrained YOLOv8 model
model = YOLO("yolov8n.pt")
SHELF_ZONE = (500, 150, 900, 650)
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
    #zone_x1, zone_y1, zone_x2, zone_y2 = get_shelf_zone()

    # Draw shelf zone rectangle
    #cv2.rectangle(
        #annotated_frame,
        #(zone_x1, zone_y1),
        #(zone_x2, zone_y2),
        #(255, 0, 0),
        #3
    #)

    # Add shelf zone label
    #cv2.putText(
        #annotated_frame,
        #"Shelf Zone",
        #(zone_x1, max(zone_y1 - 10, 30)),
        #cv2.FONT_HERSHEY_SIMPLEX,
        #0.8,
        #(255, 0, 0),
        #2
    #)

    result = results[0]
    # Check whether tracking IDs exist
    if result.boxes is not None and result.boxes.id is not None:
        boxes = result.boxes.xyxy.cpu().numpy()
        track_ids = result.boxes.id.int().cpu().tolist()

    for box, track_id in zip(boxes, track_ids):
        x1, y1, x2, y2 = map(int, box)
        # Crop the upper half of the person's bounding box (face/head region)
        face_crop = frame[
            y1 : y1 + (y2 - y1) // 2,
            x1 : x2
    ]
    face_landmarks = detect_face(face_crop)

    pitch = yaw = roll = 0.0
    head_direction = "Unknown"

    if face_landmarks is not None:

        rotation_vector, translation_vector = estimate_head_pose(
            face_landmarks,
            frame.shape[1],
            frame.shape[0]
    )

        if rotation_vector is not None:

            pitch, yaw, roll = get_head_angles(rotation_vector)
            nose = face_landmarks.landmark[1]

            nose_x = int(
                x1 + nose.x * (x2 - x1)
            )

            nose_y = int(
                y1 + nose.y * ((y2 - y1) // 2)
)

            end_x, end_y = get_gaze_endpoint(
                nose_x,
                nose_y,
                yaw,
                pitch
)
            looking_at_shelf = gaze_intersects_shelf(
                end_x,
                end_y,
                SHELF_ZONE
)

            if yaw < -15:
                head_direction = "Left"
            elif yaw > 15:
                head_direction = "Right"
            else:
                head_direction = "Center"

            print("Pitch:", pitch, type(pitch))
            print("Yaw:", yaw, type(yaw))
            print("Roll:", roll, type(roll))
    else:
        print("❌ Face not detected")


    # Draw bounding box
    cv2.rectangle(
        annotated_frame,
        (x1, y1),
        (x2, y2),
        (0, 255, 0),
        2
    )

    # Assign clean shopper ID
    if track_id not in shopper_id_map:
        shopper_id_map[track_id] = next_shopper_id
        next_shopper_id += 1

    clean_id = shopper_id_map[track_id]

    label = (
        f"Shopper #{clean_id} | "
        f"{head_direction}"
    )

    print(f"Tracking Shopper #{clean_id}")

    direction_color = (0, 255, 255)
    cv2.putText(
        annotated_frame,
        f"Looking: {head_direction}",
        (x1, y2 + 20),
        cv2.FONT_HERSHEY_SIMPLEX,
         0.6,
        direction_color,
        2
    )

    cv2.putText(
        annotated_frame,
        f"P:{pitch:.1f}  Y:{yaw:.1f}  R:{roll:.1f}",
        (x1, y2 + 45),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.55,
        (0, 255, 255),
        2
)
    if looking_at_shelf:
        attention_status = "Looking at Shelf"
        color = (0, 255, 0)
    else:
        attention_status = "Not Looking"
        color = (0, 0, 255)

    cv2.putText(
        annotated_frame,
        attention_status,
        (x1, y2 + 70),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.6,
        color,
        2
)
    if face_landmarks is not None and rotation_vector is not None:
        cv2.arrowedLine(
            annotated_frame,
            (nose_x, nose_y),
            (end_x, end_y),
            (0, 0, 255),
            3,
            tipLength=0.3
    )
       

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