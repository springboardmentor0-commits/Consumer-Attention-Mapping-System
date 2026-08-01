from __future__ import annotations

import time
from datetime import datetime, timezone
from typing import Any

import cv2
import numpy as np

from app.ai.detector import PersonDetector
from app.ai.models import FrameData
from app.ai.tracker import ByteTrackerEngine
from app.analytics.domain.attention.cv.gaze_projection import HeadPoseGazeEstimator
from app.analytics.domain.dwell.services.dwell_service import DwellTimeTracker
from app.repositories.analytics_repository import AnalyticsRepository


class FrameProcessor:

    def __init__(
        self,
        shelves_config: dict[Any, list[int]] | None = None,
        store_id: int = 1,
    ) -> None:
        self.detector = PersonDetector()
        self.tracker = ByteTrackerEngine()
        self.gaze_estimator = HeadPoseGazeEstimator()
        self.dwell_tracker = DwellTimeTracker()
        self.store_id = store_id
        self.shelves_config = (
            shelves_config if shelves_config is not None else {}
        )

    def process(
        self,
        frame: np.ndarray,
        store_id: int | None = None,
        repo: AnalyticsRepository | None = None,
        frame_number: int = 0,
        stream_start: float | None = None,
        **kwargs: Any,
    ) -> FrameData:
        """Synchronous entry point and frame processor."""
        effective_store_id = store_id if store_id is not None else self.store_id
        frame_h, frame_w = frame.shape[:2]

        current_time = datetime.now(timezone.utc)
        timestamp = (
            time.time() - stream_start
            if stream_start is not None and stream_start > 0
            else current_time.timestamp()
        )

        # 1. Person Detection
        detections = self.detector.detect(frame)

        present_shopper_ids: set[int] = set()

        # Handle case where no persons are detected
        if detections is not None and len(detections) > 0:
            # 2. Multi-Object Tracking
            tracked_shoppers = self.tracker.update(detections, timestamp=timestamp)

            for shopper in tracked_shoppers:
                shopper_id = shopper.shopper_id
                bbox = shopper.bbox
                present_shopper_ids.add(shopper_id)

                px1, py1, px2, py2 = map(int, bbox)

                # --- 1. Draw Outer Person Box (Green) ---
                cv2.rectangle(frame, (px1, py1), (px2, py2), (0, 255, 0), 2)
                cv2.putText(
                    frame,
                    f"ID: {shopper_id}",
                    (px1, max(15, py1 - 8)),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.5,
                    (0, 255, 0),
                    2,
                )

                # --- 2. Extract Head Bounding Box (Upper 35% Crop) ---
                head_h = int((py2 - py1) * 0.35)
                hx1, hy1 = max(0, px1), max(0, py1)
                hx2, hy2 = min(frame_w, px2), min(frame_h, py1 + head_h)

                cv2.rectangle(frame, (hx1, hy1), (hx2, hy2), (255, 165, 0), 2)

                active_shelf_id = None
                gaze_point = None

                # Ensure valid head crop boundaries before pose calculation
                if (hx2 - hx1) > 10 and (hy2 - hy1) > 10:
                    head_crop = frame[hy1:hy2, hx1:hx2]

                    # 3. Gaze Estimation & Landmark Extraction
                    estimator_output = self.gaze_estimator.estimate_head_pose(
                        frame, head_crop
                    )

                    if estimator_output is not None:
                        local_gaze, landmarks_2d = estimator_output

                        if local_gaze is not None:
                            gaze_point = (hx1 + local_gaze[0], hy1 + local_gaze[1])

                        # --- Draw Inner Box: Face Mesh Landmark Bounds (Yellow) ---
                        if landmarks_2d is not None and len(landmarks_2d) > 0:
                            fx1 = hx1 + int(np.min(landmarks_2d[:, 0]))
                            fy1 = hy1 + int(np.min(landmarks_2d[:, 1]))
                            fx2 = hx1 + int(np.max(landmarks_2d[:, 0]))
                            fy2 = hy1 + int(np.max(landmarks_2d[:, 1]))

                            cv2.rectangle(frame, (fx1, fy1), (fx2, fy2), (0, 255, 255), 1)

                            # Nose Tip for Gaze Ray Starting Point
                            nose_tip_global = (
                                hx1 + int(landmarks_2d[0][0]),
                                hy1 + int(landmarks_2d[0][1]),
                            )

                            # --- Shelf Intersection Mapping ---
                            if gaze_point is not None:
                                for shelf_id, shelf_bbox in self.shelves_config.items():
                                    if (
                                        shelf_bbox[0] <= gaze_point[0] <= shelf_bbox[2]
                                        and shelf_bbox[1] <= gaze_point[1] <= shelf_bbox[3]
                                    ):
                                        active_shelf_id = shelf_id
                                        break

                                # --- Draw Gaze Vector Arrow ---
                                vector_color = (0, 255, 0) if active_shelf_id else (0, 0, 255)
                                cv2.arrowedLine(
                                    frame,
                                    nose_tip_global,
                                    gaze_point,
                                    vector_color,
                                    2,
                                    tipLength=0.2,
                                )

                # Update Dwell Tracking State for each tracked shopper (Sync Call)
                self.dwell_tracker.update_shopper_state(
                    shopper_id=shopper_id,
                    store_id=effective_store_id,
                    shelf_id=active_shelf_id,
                    current_time=current_time,
                )

        # 4. Flush completed/expired sessions (Sync Call)
        completed_sessions = self.dwell_tracker.flush_expired_sessions(
            present_shopper_ids=present_shopper_ids, current_time=current_time
        )

        if repo is not None:
            for session in completed_sessions:
                repo.save_dwell_session(
                    store_id=getattr(session, "store_id", effective_store_id),
                    shopper_id=session.track_id,
                    shelf_id=getattr(session, "shelf_id", None),
                    dwell_seconds=session.dwell_time,
                    entry_time=session.entry_time,
                    exit_time=session.exit_time,
                )

        return FrameData(
            frame=frame,
            frame_number=frame_number,
            timestamp=timestamp,
        )