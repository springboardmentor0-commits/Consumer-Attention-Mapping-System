import uuid
import logging
from datetime import datetime, timezone
from typing import Dict, List, Tuple, Optional, Any, Union
import cv2
import numpy as np

from app.models.schemas import DwellTime, Zone

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)


def is_point_in_zone(
    point: Tuple[float, float],
    coordinates: Any,
    frame_size: Tuple[int, int]
) -> bool:
    """
    Check if a 2D point (x, y) lies inside a defined zone region.

    :param point: (px, py) coordinates in frame pixel space.
    :param coordinates: Zone polygon definition (list of points, bbox dict/list, or 'full_frame').
    :param frame_size: (frame_width, frame_height) in pixels.
    :return: True if point is inside zone, False otherwise.
    """
    if not coordinates or coordinates == "full_frame":
        return True

    px, py = point
    w, h = frame_size

    # Case 1: Polygon array [[x1, y1], [x2, y2], ...]
    if isinstance(coordinates, list):
        if len(coordinates) == 0:
            return True

        # Check if 4-element bounding box [xmin, ymin, xmax, ymax]
        if len(coordinates) == 4 and all(isinstance(c, (int, float)) for c in coordinates):
            xmin, ymin, xmax, ymax = coordinates
            # Normalize if 0..1 scale
            if xmax <= 1.0 and ymax <= 1.0:
                xmin, xmax = xmin * w, xmax * w
                ymin, ymax = ymin * h, ymax * h
            return xmin <= px <= xmax and ymin <= py <= ymax

        # General polygon: check if list of 2D points
        polygon_pts = []
        for pt in coordinates:
            if isinstance(pt, (list, tuple)) and len(pt) >= 2:
                x, y = float(pt[0]), float(pt[1])
                # Scale if normalized coordinates
                if x <= 1.0 and y <= 1.0 and (w > 1 and h > 1):
                    x *= w
                    y *= h
                polygon_pts.append([x, y])

        if len(polygon_pts) >= 3:
            pts_array = np.array(polygon_pts, dtype=np.int32)
            res = cv2.pointPolygonTest(pts_array, (float(px), float(py)), False)
            return res >= 0

    # Case 2: Bounding Box Dictionary {"x_min": ..., "y_min": ..., "x_max": ..., "y_max": ...}
    elif isinstance(coordinates, dict):
        xmin = coordinates.get("x_min", 0)
        ymin = coordinates.get("y_min", 0)
        xmax = coordinates.get("x_max", w)
        ymax = coordinates.get("y_max", h)

        if xmax <= 1.0 and ymax <= 1.0:
            xmin, xmax = xmin * w, xmax * w
            ymin, ymax = ymin * h, ymax * h

        return xmin <= px <= xmax and ymin <= py <= ymax

    return True


class ZoneSession:
    """
    Represents an active shopper tracking session inside a specific store zone.
    """
    def __init__(
        self,
        shopper_id: int,
        store_id: uuid.UUID,
        zone_id: uuid.UUID,
        camera_id: Optional[uuid.UUID],
        entry_timestamp: datetime,
        initial_frame: int
    ):
        self.shopper_id = shopper_id
        self.store_id = store_id
        self.zone_id = zone_id
        self.camera_id = camera_id
        self.entry_timestamp = entry_timestamp
        self.last_seen_timestamp = entry_timestamp
        self.last_seen_frame = initial_frame
        self.lost_frames_count = 0

    def update(self, current_timestamp: datetime, frame_idx: int):
        self.last_seen_timestamp = current_timestamp
        self.last_seen_frame = frame_idx
        self.lost_frames_count = 0

    def to_dwell_time_record(self, exit_timestamp: Optional[datetime] = None) -> DwellTime:
        final_exit = exit_timestamp if exit_timestamp else self.last_seen_timestamp
        # Ensure exit_timestamp is not earlier than entry_timestamp
        if final_exit < self.entry_timestamp:
            final_exit = self.entry_timestamp

        duration = (final_exit - self.entry_timestamp).total_seconds()
        return DwellTime(
            id=uuid.uuid4(),
            store_id=self.store_id,
            zone_id=self.zone_id,
            camera_id=self.camera_id,
            shopper_id=self.shopper_id,
            entry_timestamp=self.entry_timestamp,
            exit_timestamp=final_exit,
            dwell_duration_seconds=round(max(0.0, duration), 3),
            created_at=datetime.now(timezone.utc)
        )


class ShopperDwellTracker:
    """
    Engine to track shopper entry/exit timestamps per zone, compute dwell duration,
    handle track re-entry, multiple simultaneous shoppers, and session end-of-video flush.
    """
    def __init__(
        self,
        store_id: uuid.UUID,
        zones: List[Zone],
        camera_id: Optional[uuid.UUID] = None,
        lost_track_buffer: int = 60
    ):
        self.store_id = store_id
        self.zones = zones
        self.camera_id = camera_id
        self.lost_track_buffer = lost_track_buffer

        # Active session map: (shopper_id, zone_id) -> ZoneSession
        self.active_sessions: Dict[Tuple[int, uuid.UUID], ZoneSession] = {}
        # Completed dwell records ready for DB persistence
        self.completed_records: List[DwellTime] = []

    def process_frame_detections(
        self,
        detections: Any,
        frame_shape: Tuple[int, int],
        frame_idx: int,
        timestamp: Optional[datetime] = None
    ) -> List[DwellTime]:
        """
        Process frame detections from ByteTrack and update shopper zone sessions.

        :param detections: Supervision Detections object (with xyxy and tracker_id).
        :param frame_shape: (height, width) or (width, height) tuple.
        :param frame_idx: Current frame integer index.
        :param timestamp: Optional frame UTC timestamp (defaults to datetime.now(timezone.utc)).
        :return: List of DwellTime records closed during this frame.
        """
        if timestamp is None:
            timestamp = datetime.now(timezone.utc)

        # Standardize frame_size to (width, height)
        h, w = frame_shape[:2]
        frame_size = (w, h)

        # Map of currently detected shoppers in this frame: shopper_id -> bottom-center point (px, py)
        current_shoppers: Dict[int, Tuple[float, float]] = {}

        if (
            detections is not None
            and hasattr(detections, 'tracker_id')
            and detections.tracker_id is not None
            and len(detections.tracker_id) > 0
            and hasattr(detections, 'xyxy')
            and detections.xyxy is not None
        ):
            for tracker_id, bbox in zip(detections.tracker_id, detections.xyxy):
                if tracker_id is None:
                    continue
                shopper_id = int(tracker_id)
                x1, y1, x2, y2 = bbox
                # Bottom-center coordinate (feet standing location)
                px = (x1 + x2) / 2.0
                py = float(y2)
                current_shoppers[shopper_id] = (px, py)

        # Set of active session keys present in current frame
        matched_session_keys = set()
        newly_closed_records: List[DwellTime] = []

        # 1. Match current shoppers against store zones
        for shopper_id, point in current_shoppers.items():
            for zone in self.zones:
                if is_point_in_zone(point, zone.coordinates, frame_size):
                    key = (shopper_id, zone.id)
                    matched_session_keys.add(key)

                    if key in self.active_sessions:
                        # Existing session: update last_seen
                        self.active_sessions[key].update(timestamp, frame_idx)
                    else:
                        # Entry event: start new session (handles initial entry & re-entry)
                        logger.info(
                            f"[Zone Entry] Shopper #{shopper_id} entered Zone '{zone.zone_name}' (ID: {zone.id}) at {timestamp.isoformat()}"
                        )
                        self.active_sessions[key] = ZoneSession(
                            shopper_id=shopper_id,
                            store_id=self.store_id,
                            zone_id=zone.id,
                            camera_id=self.camera_id,
                            entry_timestamp=timestamp,
                            initial_frame=frame_idx
                        )

        # 2. Check for missing shoppers / zone exits & handle lost track grace period
        all_active_keys = list(self.active_sessions.keys())
        for key in all_active_keys:
            if key not in matched_session_keys:
                session = self.active_sessions[key]
                session.lost_frames_count += 1

                # If lost_frames_count exceeds lost_track_buffer, shopper has exited zone or was lost
                if session.lost_frames_count > self.lost_track_buffer:
                    record = session.to_dwell_time_record()
                    logger.info(
                        f"[Zone Exit] Shopper #{session.shopper_id} exited Zone ID {session.zone_id}. "
                        f"Dwell duration: {record.dwell_duration_seconds}s "
                        f"(Entry: {record.entry_timestamp.isoformat()} | Exit: {record.exit_timestamp.isoformat()})"
                    )
                    newly_closed_records.append(record)
                    self.completed_records.append(record)
                    del self.active_sessions[key]

        return newly_closed_records

    def flush(self, flush_timestamp: Optional[datetime] = None) -> List[DwellTime]:
        """
        End-of-video session flush. Closes all currently in-progress shopper sessions,
        computes dwell duration, and returns generated records.
        """
        if flush_timestamp is None:
            flush_timestamp = datetime.now(timezone.utc)

        flushed_records: List[DwellTime] = []
        for key, session in list(self.active_sessions.items()):
            record = session.to_dwell_time_record(exit_timestamp=flush_timestamp)
            logger.info(
                f"[Flush Session] Finalized in-progress Shopper #{session.shopper_id} for Zone ID {session.zone_id}. "
                f"Dwell duration: {record.dwell_duration_seconds}s"
            )
            flushed_records.append(record)
            self.completed_records.append(record)

        self.active_sessions.clear()
        return flushed_records
