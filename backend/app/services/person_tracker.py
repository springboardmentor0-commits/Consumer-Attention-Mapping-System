import logging
import time
from typing import Optional, Tuple, Dict, Any, List
import cv2
import numpy as np

try:
    from ultralytics import YOLO
    import supervision as sv
    SUPERVISION_AVAILABLE = True
except ImportError:
    SUPERVISION_AVAILABLE = False
    YOLO = None
    sv = None

import warnings
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

# Suppress ByteTrack deprecation notice from supervision module
warnings.filterwarnings("ignore", category=FutureWarning, module="supervision")

class PersonTracker:
    """
    YOLOv8 + ByteTrack Shopper/Person Tracker with occlusion persistence.
    
    Features:
    - Filters detections strictly to class 0 ("person").
    - ByteTrack tracking via supervision library.
    - Persistent tracker ID assignment across frames.
    - Occlusion resilience via configurable lost track buffer.
    - Real-time video frame annotation (bounding box + persistent shopper ID).
    """

    def __init__(
        self,
        model_weights: str = "yolov8n.pt",
        conf_threshold: float = 0.3,
        iou_threshold: float = 0.5,
        track_buffer: int = 60,
        track_thresh: float = 0.25,
        match_thresh: float = 0.8,
        frame_rate: int = 30,
        device: str = ""
    ):
        """
        Initialize the PersonTracker module.

        :param model_weights: Path or name of YOLOv8 model weights (e.g. 'yolov8n.pt', 'yolov8s.pt').
        :param conf_threshold: Detection confidence threshold (0.0 to 1.0).
        :param iou_threshold: NMS IoU threshold.
        :param track_buffer: Number of frames a lost track is kept alive (occlusion buffer).
        :param track_thresh: Detection confidence threshold to activate tracking.
        :param match_thresh: Matching threshold for data association.
        :param frame_rate: Target frame rate of video input.
        :param device: Hardware device ('cpu', 'cuda', 'mps', or '').
        """
        if not SUPERVISION_AVAILABLE:
            raise ImportError(
                "Required packages 'ultralytics' and 'supervision' are not installed. "
                "Please run: pip install ultralytics supervision"
            )

        logger.info(f"Loading YOLOv8 model: {model_weights}...")
        self.model = YOLO(model_weights)
        self.conf_threshold = conf_threshold
        self.iou_threshold = iou_threshold
        self.device = device

        # Initialize ByteTrack with occlusion persistence settings
        # lost_track_buffer retains tracks when objects pass behind obstacles or briefly leave frame
        self.track_buffer = track_buffer
        self.tracker = sv.ByteTrack(
            track_activation_threshold=track_thresh,
            lost_track_buffer=track_buffer,
            minimum_matching_threshold=match_thresh,
            frame_rate=frame_rate
        )

        # Supervision Annotators for rendering
        self.box_annotator = sv.BoxAnnotator(
            thickness=2
        )
        self.label_annotator = sv.LabelAnnotator(
            text_scale=0.6,
            text_thickness=1,
            text_padding=6
        )

        # Tracker stats
        self.active_ids: set = set()
        self.total_unique_shoppers: set = set()

    def process_frame(
        self,
        frame: np.ndarray,
        draw_annotations: bool = True
    ) -> Tuple[np.ndarray, Any]:
        """
        Process a single image frame through YOLOv8 and ByteTrack.

        :param frame: BGR image frame (np.ndarray).
        :param draw_annotations: Whether to render bounding boxes and IDs on the frame.
        :return: (annotated_frame, supervision.Detections)
        """
        # Run YOLOv8 detection
        results = self.model(
            frame,
            conf=self.conf_threshold,
            iou=self.iou_threshold,
            device=self.device if self.device else None,
            verbose=False
        )[0]

        # Convert YOLO results to Supervision Detections
        detections = sv.Detections.from_ultralytics(results)

        # Filter strictly for Class 0 ("person")
        detections = detections[detections.class_id == 0]

        # Update ByteTrack tracker state with current frame detections
        detections = self.tracker.update_with_detections(detections)

        # Track active and historical unique IDs
        if detections.tracker_id is not None and len(detections.tracker_id) > 0:
            current_ids = set(detections.tracker_id.tolist())
            self.active_ids = current_ids
            self.total_unique_shoppers.update(current_ids)
        else:
            self.active_ids = set()

        annotated_frame = frame.copy()

        if draw_annotations and len(detections) > 0:
            # Build clean label strings showing persistent Tracker ID and Confidence
            labels = []
            for tracker_id, confidence in zip(
                detections.tracker_id if detections.tracker_id is not None else [None] * len(detections),
                detections.confidence if detections.confidence is not None else [0.0] * len(detections)
            ):
                if tracker_id is not None:
                    labels.append(f"Shopper #{tracker_id} ({confidence:.2f})")
                else:
                    labels.append(f"Person ({confidence:.2f})")

            # Annotate bounding boxes and text labels
            try:
                annotated_frame = self.box_annotator.annotate(
                    scene=annotated_frame,
                    detections=detections
                )
                annotated_frame = self.label_annotator.annotate(
                    scene=annotated_frame,
                    detections=detections,
                    labels=labels
                )
            except Exception as e:
                # Fallback to direct OpenCV rendering if supervision annotator fails
                annotated_frame = self._fallback_draw(annotated_frame, detections, labels)

        return annotated_frame, detections

    def _fallback_draw(
        self,
        frame: np.ndarray,
        detections: Any,
        labels: List[str]
    ) -> np.ndarray:
        """
        Fallback renderer using OpenCV cv2.rectangle and cv2.putText.
        """
        out = frame.copy()
        if detections.xyxy is None:
            return out

        for bbox, label in zip(detections.xyxy, labels):
            x1, y1, x2, y2 = map(int, bbox)
            cv2.rectangle(out, (x1, y1), (x2, y2), (0, 255, 0), 2)
            
            # Label banner
            (tw, th), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 1)
            cv2.rectangle(out, (x1, max(0, y1 - th - 10)), (x1 + tw + 10, max(th + 10, y1)), (0, 255, 0), -1)
            cv2.putText(
                out,
                label,
                (x1 + 5, max(th + 2, y1 - 5)),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.6,
                (0, 0, 0),
                1,
                cv2.LINE_AA
            )
        return out

    def get_stats(self) -> Dict[str, Any]:
        """
        Returns tracker summary metrics.
        """
        return {
            "currently_tracked_shoppers": len(self.active_ids),
            "total_unique_shoppers_seen": len(self.total_unique_shoppers),
            "active_tracker_ids": sorted(list(self.active_ids)),
            "lost_track_buffer_frames": self.track_buffer
        }
