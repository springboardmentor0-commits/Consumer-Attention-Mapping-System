import os
import sys
import cv2
import torch
from typing import List, Dict, Generator

# Set up local Ultralytics path relative to backend root & app directory
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(CURRENT_DIR)

# Insert local backend & app package directories to sys.path
for p in [BACKEND_DIR, CURRENT_DIR]:
    if p not in sys.path:
        sys.path.insert(0, p)

# Import YOLO from local ultralytics package
try:
    from ultralytics import YOLO
    LOCAL_YOLO_AVAILABLE = True
except Exception as e:
    LOCAL_YOLO_AVAILABLE = False
    print(f"[backend.app.yolo] Warning: Failed to import local YOLO ({e})")

_yolo_instance = None


def get_yolo_model(model_name: str = "yolov8n.pt"):
    """Initialize and return the cached YOLO model instance."""
    global _yolo_instance
    if _yolo_instance is None:
        if LOCAL_YOLO_AVAILABLE:
            _yolo_instance = YOLO(model_name)
        else:
            # Fallback to torch hub if local package fails
            _yolo_instance = torch.hub.load('ultralytics/yolov5', 'yolov5s', pretrained=True)
            _yolo_instance.eval()
    return _yolo_instance


def predict_frame(frame, target_class: str = "person", conf_threshold: float = 0.3) -> List[Dict]:
    """Run object detection on a single frame.
    
    Returns list of dicts:
    [
        {
            "bbox": [x1, y1, x2, y2],
            "confidence": 0.95,
            "class": "person"
        }
    ]
    """
    model = get_yolo_model()
    detections = []

    if hasattr(model, 'predict'):
        # Ultralytics YOLO inference
        results = model.predict(source=frame, conf=conf_threshold, verbose=False)
        for r in results:
            boxes = r.boxes
            for box in boxes:
                cls_id = int(box.cls[0].item())
                class_name = model.names.get(cls_id, str(cls_id))

                if target_class is None or class_name.lower() == target_class.lower():
                    xyxy = box.xyxy[0].tolist()
                    conf = float(box.conf[0].item())
                    detections.append({
                        "bbox": [round(x, 2) for x in xyxy],
                        "confidence": round(conf, 4),
                        "class": class_name
                    })
    else:
        # Torch hub fallback
        img = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = model(img)
        for *box, conf, cls in results.xyxy[0].tolist():
            class_name = "person" if int(cls) == 0 else str(int(cls))
            if target_class is None or int(cls) == 0:
                detections.append({
                    "bbox": [round(float(b), 2) for b in box],
                    "confidence": round(float(conf), 4),
                    "class": class_name
                })

    return detections


def annotate_frame(frame, detections: List[Dict]):
    """Draw bounding boxes and class labels onto an image frame."""
    annotated = frame.copy()
    for det in detections:
        bbox = det["bbox"]
        x1, y1, x2, y2 = map(int, bbox)
        conf = det["confidence"]
        cls_name = det.get("class", "person")

        # Draw green bounding box
        cv2.rectangle(annotated, (x1, y1), (x2, y2), (0, 255, 0), 2)

        # Draw label banner
        label = f"{cls_name} {conf:.2f}"
        (w, h), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 1)
        cv2.rectangle(annotated, (x1, max(0, y1 - 20)), (x1 + w, max(0, y1)), (0, 255, 0), -1)
        cv2.putText(annotated, label, (x1, max(12, y1 - 4)),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 0), 1, cv2.LINE_AA)
    return annotated


def stream_cctv_video(source=0) -> Generator[bytes, None, None]:
    """Generator capturing video stream, performing YOLO detection, yielding JPEG bytes."""
    if isinstance(source, str) and source.isdigit():
        source = int(source)

    cap = cv2.VideoCapture(source)
    try:
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break

            detections = predict_frame(frame)
            annotated = annotate_frame(frame, detections)

            ret_encode, buffer = cv2.imencode('.jpg', annotated)
            if not ret_encode:
                continue

            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + buffer.tobytes() + b'\r\n')
    finally:
        cap.release()


def process_video_file(video_path: str) -> List[Dict]:
    """Process entire video file frame by frame and return per-frame detections."""
    cap = cv2.VideoCapture(video_path)
    all_detections = []
    frame_idx = 0
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
        detections = predict_frame(frame)
        all_detections.append({"frame": frame_idx, "detections": detections})
        frame_idx += 1
    cap.release()
    return all_detections
