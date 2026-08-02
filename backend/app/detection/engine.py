from typing import List, Dict, Generator
from ..yolo import (
    get_yolo_model,
    predict_frame,
    annotate_frame,
    stream_cctv_video,
    process_video_file
)

def load_model(model_name: str = "yolov8n.pt"):
    """Load Ultralytics YOLO model from local backend yolo module."""
    return get_yolo_model(model_name)

def infer_frame(frame, target_class: str = "person", conf_threshold: float = 0.3) -> List[Dict]:
    """Run object/person detection on a single frame."""
    return predict_frame(frame, target_class=target_class, conf_threshold=conf_threshold)

def draw_detections(frame, detections: List[Dict]):
    """Draw bounding boxes and labels on the frame for CCTV/video view."""
    return annotate_frame(frame, detections)

def generate_cctv_frames(source=0) -> Generator[bytes, None, None]:
    """Generator that captures frames from CCTV / video source, runs YOLO, and yields MJPEG stream."""
    return stream_cctv_video(source=source)

def process_video(video_path: str) -> List[Dict]:
    """Iterate over video frames and collect detections."""
    return process_video_file(video_path)


