from __future__ import annotations

import logging
import time
from dataclasses import dataclass
from typing import Any

import cv2

from app.ai.detector import PersonDetector
from app.ai.frame_processor import FrameProcessor
from app.ai.models import FrameData
from app.ai.tracker import (
    PersonTracker,
    TrackedPerson,
)

logger = logging.getLogger(__name__)


# ==========================================================
# Pipeline Result
# ==========================================================

@dataclass(slots=True)
class FramePipelineResult:
    """Output produced by the computer vision pipeline."""

    frame: cv2.typing.MatLike
    tracked_people: list[TrackedPerson]
    detections: list
    metadata: dict[str, Any]


# ==========================================================
# Frame Pipeline
# ==========================================================

class FramePipeline:

    def __init__(
        self,
        processor: FrameProcessor,
        detector: PersonDetector,
        tracker: PersonTracker,
    ) -> None:
        self._processor = processor
        self._detector = detector
        self._tracker = tracker

    # ======================================================
    # Main Pipeline
    # ======================================================

    def process(
        self,
        frame: Any,
        frame_number: int,
        stream_start: float,
    ) -> FramePipelineResult:

        # -------------------------------
        # Frame Preprocessing & Processing
        # -------------------------------
        # Synchronously invoke FrameProcessor
        processor_output = self._processor.process(
            frame=frame,
            frame_number=frame_number,
            stream_start=stream_start,
        )

        # Unpack output if it returned FrameData or raw ndarray
        if isinstance(processor_output, FrameData):
            processed_frame = processor_output.frame
            timestamp = processor_output.timestamp
        else:
            processed_frame = processor_output
            timestamp = max(0.0, time.time() - stream_start)

        # -------------------------------
        # Person Detection
        # -------------------------------
        detector_start = time.perf_counter()
        detections = self._detector.detect(processed_frame)
        detector_time = time.perf_counter() - detector_start

        # -------------------------------
        # FPS estimation
        # -------------------------------
        fps = (
            frame_number / timestamp
            if timestamp > 0
            else 0.0
        )

        # -------------------------------
        # Person Tracking
        # -------------------------------
        tracker_start = time.perf_counter()

        tracked_people = self._tracker.update(
            detections,
            timestamp=timestamp,
            frame_rate=fps,
        )

        tracker_time = time.perf_counter() - tracker_start

        # -------------------------------
        # Metadata
        # -------------------------------
        metadata = {
            "frame_number": frame_number,
            "timestamp": timestamp,
            "fps": fps,
            "detections": len(detections),
            "tracks": len(tracked_people),
            "stage_times": {
                "detector": detector_time,
                "tracker": tracker_time,
            },
        }

        return FramePipelineResult(
            frame=processed_frame,
            tracked_people=tracked_people,
            detections=detections,
            metadata=metadata,
        )

    # ======================================================
    # Visualization
    # ======================================================

    def draw_tracks(
        self,
        frame: Any,
        tracked_people: list[TrackedPerson],
    ) -> Any:
        return self._tracker.draw_tracks(
            frame,
            tracked_people,
        )