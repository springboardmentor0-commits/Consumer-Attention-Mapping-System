import cv2
import time
import supervision as sv
from ultralytics import YOLO

from shelf_loader import load_shelves
from database import SessionLocal
from models import ShelfAnalytics , ShopperSession
from behavior_classifier import classify_behavior
from gaze_estimation import estimate_gaze
from heatmap_generator import generate_heatmap
from attractiveness_score import calculate_score
from recommendation_engine import generate_recommendation


# =====================================
# YOLO Model
# =====================================

model = YOLO("yolov8n.pt")


# =====================================
# ByteTrack
# =====================================

tracker = sv.ByteTrack()


# =====================================
# Annotators
# =====================================

box_annotator = sv.BoxAnnotator()
label_annotator = sv.LabelAnnotator()


# =====================================
# Load Video
# =====================================

cap = cv2.VideoCapture("store_video.mp4")

if not cap.isOpened():
    print("❌ Cannot open video")
    exit()


# =====================================
# Dictionaries
# =====================================

entry_times = {}
current_shelf = {}
current_shelf_id = {}
active_ids = set()
track_history = {}
path_lengths = {}
last_direction = {}
gaze_changes = {}
heatmap_points = []

print("🚀 Consumer Attention Analytics Started")
previous_time = time.time()
fps = 0

SHELF_COLORS = {
    "Shelf A": (255, 100, 50),     # Blue/Orange tone (BGR)
    "Shelf B": (0, 180, 255),      # Orange
    "Shelf C": (255, 0, 255)       # Purple
}

# =====================================
# Main Loop
# =====================================

while True:

    ret, frame = cap.read()

    if not ret:
        break

    annotated_frame = frame.copy()

    current_time = time.time()
    fps = 1 / (current_time - previous_time) 
    previous_time = current_time

    # Load shelves from database
    shelves = load_shelves()

    # Draw Shelf Zones
    for shelf in shelves:

        x1, y1, x2, y2 = shelf["coords"]

        color = SHELF_COLORS.get(
        shelf["name"],
        (255,255,255)
    )



        cv2.putText(
        annotated_frame,
        shelf["name"],
        (x1 + 10, y1 + 30),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.8,
        color,
        2
    )
    
    for shopper_id in current_shelf:

        viewed_shelf = current_shelf[shopper_id]

        for shelf in shelves:

            if shelf["name"] == viewed_shelf:

                x1, y1, x2, y2 = shelf["coords"]

                cv2.rectangle(
                annotated_frame,
                (x1, y1),
                (x2, y2),
                (0,255,0),
                5
            )

                cv2.putText(
                annotated_frame,
                "VIEWING",
                (x1 + 10, y2 - 20),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.8,
                (0,255,0),
                2
            )
    # -----------------------------
    # YOLO Detection
    # -----------------------------

    results = model(frame)[0]

    detections = sv.Detections.from_ultralytics(results)

    detections = detections[detections.class_id == 0]

    detections = tracker.update_with_detections(detections)

    current_ids = set()

    labels = []

    # -----------------------------
    # Process Each Shopper
    # -----------------------------

    for i, box in enumerate(detections.xyxy):

        tracker_id = detections.tracker_id[i]

        if tracker_id is None:
            continue

        shopper_id = int(tracker_id)

        current_ids.add(shopper_id)

        x1, y1, x2, y2 = map(int, box)

        center_x = (x1 + x2) // 2
        center_y = (y1 + y2) // 2

        center = (center_x, center_y)
        heatmap_points.append(center)

        if shopper_id not in track_history:
            track_history[shopper_id] = []

        if shopper_id not in path_lengths:
            path_lengths[shopper_id] = 0
        track_history[shopper_id].append(center)

        

        
        
        points = track_history[shopper_id]

        if len(points) >= 2:

            x_prev, y_prev = points[-2]
            x_curr, y_curr = points[-1]

            distance = ((x_curr - x_prev) ** 2 + (y_curr - y_prev) ** 2) ** 0.5

            path_lengths[shopper_id] += distance

        if len(track_history[shopper_id]) > 40:
            track_history[shopper_id].pop(0)
        
        points = track_history[shopper_id]

        for j in range(1, len(points)):

            cv2.line(
        annotated_frame,
        points[j - 1],
        points[j],
        (0,255,255),
        2
    )

        # -----------------------------
        # Crop Head
        # -----------------------------

        person_crop = frame[y1:y2, x1:x2]

        if person_crop.size == 0:
            continue

        head_height = int(person_crop.shape[0] * 0.40)

        head_crop = person_crop[:head_height, :]

        direction = estimate_gaze(head_crop)
        if shopper_id not in gaze_changes:
            gaze_changes[shopper_id] = 0

        if shopper_id not in last_direction:
            last_direction[shopper_id] = direction

        if direction != last_direction[shopper_id]:
            gaze_changes[shopper_id] += 1
            last_direction[shopper_id] = direction

        if direction == "LEFT":
            box_color = (255, 0, 0)          # Blue

        elif direction == "RIGHT":
            box_color = (0, 165, 255)        # Orange

        else:
            box_color = (0, 255, 0)          # Green

        cv2.rectangle(
    annotated_frame,
    (x1, y1),
    (x2, y2),
    box_color,
    3
)

        # -----------------------------
        # Find Shelf
        # -----------------------------

        shelf_name = "Unknown"
        shelf_id = None

        for shelf in shelves:

            sx1, sy1, sx2, sy2 = shelf["coords"]

            if sx1 <= center_x <= sx2 and sy1 <= center_y <= sy2:

                shelf_name = shelf["name"]
                shelf_id = shelf["id"]

                break

        # -----------------------------
        # Looking Shelf Logic
        # -----------------------------

        looking_shelf = shelf_name

        if direction == "LEFT":

            if shelf_name == "Shelf B":
                looking_shelf = "Shelf A"

            elif shelf_name == "Shelf C":
                looking_shelf = "Shelf B"

        elif direction == "RIGHT":

            if shelf_name == "Shelf A":
                looking_shelf = "Shelf B"

            elif shelf_name == "Shelf B":
                looking_shelf = "Shelf C"

        # -----------------------------
        # New Shopper
        # -----------------------------

        if shopper_id not in entry_times:

            entry_times[shopper_id] = current_time

        current_shelf[shopper_id] = looking_shelf
        current_shelf_id[shopper_id] = shelf_id

        # -----------------------------
        # Highlight Viewed Shelf
        # -----------------------------

        for shelf in shelves:

            if shelf["name"] == looking_shelf:

                sx1, sy1, sx2, sy2 = shelf["coords"]

                cv2.rectangle(
                    annotated_frame,
                    (sx1, sy1),
                    (sx2, sy2),
                    (0,255,0),
                    4
                )

                cv2.putText(
                    annotated_frame,
                    "VIEWING",
                    (sx1 + 10, sy2 - 20),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.7,
                    (0,255,0),
                    2
                )

                break

        attention = current_time - entry_times[shopper_id]

        labels.append(
            f"ID {shopper_id} | gaze: {direction} | {looking_shelf} | {attention:.1f}s"
        )


    # =====================================
    # Shopper Left → Save to Database
    # =====================================

    left_people = active_ids - current_ids

    for shopper_id in left_people:

        if shopper_id not in entry_times:
            continue

        attention_time = current_time - entry_times[shopper_id]

        shelf_name = current_shelf.get(shopper_id, "Unknown")
        shelf_id = current_shelf_id.get(shopper_id)

        print(
            f"💾 Saving -> Shopper {shopper_id} | {shelf_name} | {attention_time:.2f} sec"
        )


        # ----------------------------
        # Shopper Segmentation
        # ----------------------------

        path = path_lengths.get(shopper_id, 0)
        gaze = gaze_changes.get(shopper_id, 0)

        score = calculate_score(
            attention_time,
            gaze
)
        print(f"Shelf Score : {score}")
        recommendation = generate_recommendation(
        attention_time,
        score
)

        print(recommendation)

        

        segment = classify_behavior(
            attention_time,
            path,
            gaze
            )

        print(f"Behavior Segment: {segment}")

        

        # Save only if a shelf was identified
        if shelf_id is not None:

            db = SessionLocal()

            analytics = ShelfAnalytics(

            shopper_id=int(shopper_id),

            shelf_id=int(shelf_id),

            shelf_name=shelf_name,

            attention_time=float(attention_time),

            attractiveness_score=score
)

            db.add(analytics)

            session = ShopperSession(
                shopper_id=shopper_id,
                total_attention=attention_time,
                path_length=path_lengths[shopper_id],
                gaze_changes=gaze_changes[shopper_id],
                segment=segment
            )

            db.add(session)
            db.commit()
            db.close()

        # Remove shopper from memory
        del entry_times[shopper_id]
        del current_shelf[shopper_id]
        track_history.pop(shopper_id, None)
        path_lengths.pop(shopper_id, None)
        gaze_changes.pop(shopper_id, None)
        last_direction.pop(shopper_id, None)
        del current_shelf_id[shopper_id]

    active_ids = current_ids


    # =====================================
    # Draw Bounding Boxes
    # =====================================

    annotated_frame = box_annotator.annotate(
        scene=annotated_frame,
        detections=detections
    )

    annotated_frame = label_annotator.annotate(
        scene=annotated_frame,
        detections=detections,
        labels=labels
    )


    # =====================================
    # Display Window
    # =====================================

    cv2.rectangle(
    annotated_frame,
    (10, 10),
    (330, 170),
    (40, 40, 40),
    -1
)
    cv2.putText(
    annotated_frame,
    "Consumer Analytics",
    (25, 40),
    cv2.FONT_HERSHEY_SIMPLEX,
    0.75,
    (255,255,255),
    2
)
    cv2.putText(
    annotated_frame,
    f"Active Shoppers : {len(current_ids)}",
    (25,70),
    cv2.FONT_HERSHEY_SIMPLEX,
    0.6,
    (0,255,0),
    2
)
    cv2.putText(
    annotated_frame,
    f"Total Tracked : {len(track_history)}",
    (25,95),
    cv2.FONT_HERSHEY_SIMPLEX,
    0.6,
    (255,255,0),
    2
)
    cv2.putText(
    annotated_frame,
    f"Shelves : {len(shelves)}",
    (25,120),
    cv2.FONT_HERSHEY_SIMPLEX,
    0.6,
    (255,150,0),
    2
)
    cv2.putText(
    annotated_frame,
    f"FPS : {fps:.1f}",
    (25,145),
    cv2.FONT_HERSHEY_SIMPLEX,
    0.6,
    (0,255,255),
    2
)
    
    cv2.putText(
    annotated_frame,
    f"Path: {path_lengths.get(shopper_id,0):.0f}px",
    (x1, y1 - 65),
    cv2.FONT_HERSHEY_SIMPLEX,
    0.55,
    (255,0,255),
    2
)

    cv2.putText(
    annotated_frame,
    f"Gaze: {gaze_changes.get(shopper_id,0)}",
    (x1, y1 - 85),
    cv2.FONT_HERSHEY_SIMPLEX,
    0.55,
    (0,200,255),
    2
)

    heatmap_frame = generate_heatmap(
    annotated_frame,
    heatmap_points
)

    cv2.imshow(
    "Consumer Attention Analytics",
    annotated_frame
)

    cv2.imshow(
    "Store Heatmap",
    heatmap_frame
)


    if cv2.waitKey(20) & 0xFF == ord("q"):
        break

    if len(heatmap_points) > 0:

        heatmap = generate_heatmap(frame, heatmap_points)

        cv2.imwrite("heatmap.png", heatmap)

        print("✅ Heatmap saved as heatmap.png")
# =====================================
# Cleanup
# =====================================

cap.release()
cv2.destroyAllWindows()

print("✅ Consumer Attention Analytics Finished")