from __future__ import annotations

import logging
from dataclasses import dataclass
from typing import Optional

from app.ai.tracker import TrackedPerson
from app.services.camera_services.services.registry import ServiceRegistry
from app.services.camera_services.source.camera_source import CameraSource

logger = logging.getLogger(__name__)


# ==========================================================
# Result
# ==========================================================

@dataclass(slots=True)
class FrameStepResult:
    """
    Result of processing one video frame.
    """

    success: bool
    frame_number: int
    original_size: Optional[tuple[int, int]] = None


# ==========================================================
# Private Helpers
# ==========================================================

def _update_heatmap(
    tracked_people: list[TrackedPerson],
    timestamp: float,
) -> None:
    """
    Update the global heatmap using the tracked shopper positions.
    """

    if not tracked_people:
        return

    try:
        centers = [
            (
                (person.bbox[0] + person.bbox[2]) / 2.0,
                (person.bbox[1] + person.bbox[3]) / 2.0,
            )
            for person in tracked_people
        ]

    except Exception:
        logger.exception("Failed to update heatmap.")


def _run_analytics(
    services: ServiceRegistry,
    tracked_people: list[TrackedPerson],
    timestamp: float,
):
    """
    Execute the analytics pipeline and synchronize completed sessions.
    """

    analytics_result = services.analytics_pipeline.process(
        tracked_people=tracked_people,
        timestamp=timestamp,
    )

    services.analytics_pipeline.synchronize(
        services.analytics_sync,
    )

    return analytics_result


# ==========================================================
# Main Frame Processing
# ==========================================================

def process_one_frame(
    camera: CameraSource,
    services: ServiceRegistry,
    current_frame_number: int,
    stream_start: float,
    known_original_size: Optional[tuple[int, int]],
) -> FrameStepResult:
    """
    Process one frame through the complete camera pipeline.
    """

    timer = services.performance.start_timer()

    success, frame = camera.read()

    if not success:
        logger.info("End of video stream reached.")

        return FrameStepResult(
            success=False,
            frame_number=current_frame_number,
        )

    frame_number = current_frame_number + 1

    original_size = (
        known_original_size
        if known_original_size is not None
        else (frame.shape[1], frame.shape[0])
    )

    # --------------------------------------------------
    # Computer Vision Pipeline
    # --------------------------------------------------

    frame_result = services.frame_pipeline.process(
        frame=frame,
        frame_number=frame_number,
        stream_start=stream_start,
    )

    tracked_people = frame_result.tracked_people
    timestamp = frame_result.metadata["timestamp"]

    # --------------------------------------------------
    # Heatmap
    # --------------------------------------------------

    _update_heatmap(
        tracked_people=tracked_people,
        timestamp=timestamp,
    )

    # --------------------------------------------------
    # Analytics
    # --------------------------------------------------

    analytics_result = _run_analytics(
        services=services,
        tracked_people=tracked_people,
        timestamp=timestamp,
    )

    # --------------------------------------------------
    # Performance
    # --------------------------------------------------

    processing_time = services.performance.stop_timer(timer)
    fps = services.performance.current_fps()

    services.performance.update_memory()

    # --------------------------------------------------
    # Rendering
    # --------------------------------------------------

    rendered_frame = services.render_pipeline.render(
        frame=frame_result.frame,
        analytics_result=analytics_result,
        fps=fps,
    )

    services.display_pipeline.show(rendered_frame)

    # --------------------------------------------------
    # Diagnostics
    # --------------------------------------------------

    services.performance.print_frame_statistics(
        frame_number=frame_number,
        metadata=frame_result.metadata,
        detections=len(frame_result.detections),
        tracked=len(tracked_people),
        processing_time=processing_time,
    )

    return FrameStepResult(
        success=True,
        frame_number=frame_number,
        original_size=original_size,
    )