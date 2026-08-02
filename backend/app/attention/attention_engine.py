"""
Attention Analysis Engine
=========================
Gaze estimation, head‑pose analysis, product attention detection,
shelf engagement analysis, and attention duration calculation.

Uses MediaPipe Face Mesh (468 landmarks) for gaze / head‑pose.
Falls back to stub values when mediapipe is not installed so the
rest of the application can still start.
"""

import math
import time
import cv2
import numpy as np
from typing import List, Dict, Optional, Tuple
from collections import defaultdict

from .attention_models import (
    GazeResult,
    HeadPose,
    EngagementLevel,
    AttentionEvent,
    AttentionMetrics,
    ShelfZone,
)

# ── MediaPipe (optional at import time) ──────────────────────────
try:
    import mediapipe as mp

    _mp_face_mesh = mp.solutions.face_mesh
    _face_mesh = _mp_face_mesh.FaceMesh(
        static_image_mode=False,
        max_num_faces=4,
        refine_landmarks=True,      # enables iris landmarks
        min_detection_confidence=0.5,
        min_tracking_confidence=0.5,
    )
    _HAS_MEDIAPIPE = True
except Exception:
    _HAS_MEDIAPIPE = False
    _face_mesh = None


# ═══════════════════════════════════════════════════════════════════
# 1. Gaze Estimation
# ═══════════════════════════════════════════════════════════════════

# Iris landmark indices (refined mesh):
#   Left iris centre  = 468,  Right iris centre = 473
# Eye corner indices:
#   Left eye:  inner=133, outer=33
#   Right eye: inner=362, outer=263

LEFT_IRIS = 468
RIGHT_IRIS = 473
LEFT_EYE_INNER = 133
LEFT_EYE_OUTER = 33
RIGHT_EYE_INNER = 362
RIGHT_EYE_OUTER = 263


class GazeEstimator:
    """Estimate 2‑D gaze direction from iris position relative to eye corners."""

    @staticmethod
    def estimate(landmarks, frame_w: int, frame_h: int) -> GazeResult:
        """Return gaze yaw/pitch and an approximate gaze point on frame."""
        if landmarks is None:
            return GazeResult()

        def _pt(idx):
            lm = landmarks[idx]
            return np.array([lm.x * frame_w, lm.y * frame_h])

        # Left eye ratio
        l_iris = _pt(LEFT_IRIS)
        l_inner = _pt(LEFT_EYE_INNER)
        l_outer = _pt(LEFT_EYE_OUTER)
        l_eye_w = np.linalg.norm(l_inner - l_outer)
        l_ratio = np.linalg.norm(l_iris - l_outer) / max(l_eye_w, 1e-6)

        # Right eye ratio
        r_iris = _pt(RIGHT_IRIS)
        r_inner = _pt(RIGHT_EYE_INNER)
        r_outer = _pt(RIGHT_EYE_OUTER)
        r_eye_w = np.linalg.norm(r_inner - r_outer)
        r_ratio = np.linalg.norm(r_iris - r_outer) / max(r_eye_w, 1e-6)

        # Average horizontal ratio: 0.5 = centre, <0.5 = looking left
        h_ratio = (l_ratio + r_ratio) / 2.0
        yaw = (h_ratio - 0.5) * 90.0        # scale to approx degrees

        # Vertical: use y‑offset of iris vs. eye midline
        l_mid_y = (l_inner[1] + l_outer[1]) / 2.0
        r_mid_y = (r_inner[1] + r_outer[1]) / 2.0
        v_offset_l = (l_iris[1] - l_mid_y) / max(l_eye_w, 1e-6)
        v_offset_r = (r_iris[1] - r_mid_y) / max(r_eye_w, 1e-6)
        pitch = ((v_offset_l + v_offset_r) / 2.0) * 90.0

        # Projected gaze point (linear extrapolation)
        cx = frame_w * (0.5 + (h_ratio - 0.5) * 1.4)
        cy = frame_h * (0.5 + ((v_offset_l + v_offset_r) / 2.0) * 1.4)

        return GazeResult(yaw=round(yaw, 2), pitch=round(pitch, 2),
                          gaze_point=(round(cx, 1), round(cy, 1)))


# ═══════════════════════════════════════════════════════════════════
# 2. Head Pose Analysis
# ═══════════════════════════════════════════════════════════════════

# Six canonical face points (nose tip, chin, left/right eye corner,
# left/right mouth corner) – indices in the 468‑landmark mesh.
_HEAD_POSE_IDX = [1, 152, 33, 263, 61, 291]

# 3‑D model points for those 6 landmarks (generic face model, mm)
_MODEL_POINTS = np.array([
    (0.0,   0.0,    0.0),      # Nose tip
    (0.0,  -330.0, -65.0),     # Chin
    (-225.0, 170.0, -135.0),   # Left eye left corner
    (225.0,  170.0, -135.0),   # Right eye right corner
    (-150.0, -150.0, -125.0),  # Left mouth corner
    (150.0,  -150.0, -125.0),  # Right mouth corner
], dtype=np.float64)


class HeadPoseAnalyzer:
    """Compute head roll / pitch / yaw via PnP solve."""

    @staticmethod
    def analyze(landmarks, frame_w: int, frame_h: int) -> HeadPose:
        if landmarks is None:
            return HeadPose()

        image_points = np.array([
            (landmarks[idx].x * frame_w, landmarks[idx].y * frame_h)
            for idx in _HEAD_POSE_IDX
        ], dtype=np.float64)

        focal_length = frame_w
        centre = (frame_w / 2.0, frame_h / 2.0)
        camera_matrix = np.array([
            [focal_length, 0, centre[0]],
            [0, focal_length, centre[1]],
            [0, 0, 1],
        ], dtype=np.float64)
        dist_coeffs = np.zeros((4, 1))

        success, rvec, tvec = cv2.solvePnP(
            _MODEL_POINTS, image_points, camera_matrix, dist_coeffs,
            flags=cv2.SOLVEPNP_ITERATIVE,
        )
        if not success:
            return HeadPose()

        rmat, _ = cv2.Rodrigues(rvec)
        angles, _, _, _, _, _ = cv2.RQDecomp3x3(rmat)

        return HeadPose(
            roll=round(float(angles[2]), 2),
            pitch=round(float(angles[0]), 2),
            yaw=round(float(angles[1]), 2),
        )


# ═══════════════════════════════════════════════════════════════════
# 3. Product Attention Detection
# ═══════════════════════════════════════════════════════════════════

class ProductAttentionDetector:
    """Determine which shelf zone / product a gaze point falls in."""

    DWELL_THRESHOLD_MS: int = 300   # minimum ms to count as genuine interest

    @staticmethod
    def detect(
        gaze_point: Tuple[float, float],
        zones: List[ShelfZone],
    ) -> Optional[ShelfZone]:
        """Return the zone the gaze point is inside, or None."""
        gx, gy = gaze_point
        for z in zones:
            if z.x1 <= gx <= z.x2 and z.y1 <= gy <= z.y2:
                return z
        return None


# ═══════════════════════════════════════════════════════════════════
# 4. Shelf Engagement Analysis
# ═══════════════════════════════════════════════════════════════════

class ShelfEngagementAnalyzer:
    """
    Track how a shopper interacts with a shelf zone over a sliding
    time window and classify engagement as SCANNING, BROWSING, or FOCUSED.
    """

    _WINDOW_MS: int = 3000     # sliding window size
    _FOCUS_RATIO: float = 0.6  # ≥60 % of window on one zone → FOCUSED
    _BROWSE_RATIO: float = 0.3 # ≥30 % → BROWSING, else SCANNING

    def __init__(self):
        # zone_id → list of (timestamp_ms, duration_ms) hits
        self._history: Dict[str, list] = defaultdict(list)

    def update(
        self, zone_id: str, timestamp_ms: float, duration_ms: int
    ) -> EngagementLevel:
        """Feed an observation and return the current engagement level."""
        bucket = self._history[zone_id]
        bucket.append((timestamp_ms, duration_ms))

        # Prune entries older than the window
        cutoff = timestamp_ms - self._WINDOW_MS
        self._history[zone_id] = [
            (t, d) for t, d in bucket if t >= cutoff
        ]
        bucket = self._history[zone_id]

        total_focus = sum(d for _, d in bucket)
        ratio = total_focus / self._WINDOW_MS

        if ratio >= self._FOCUS_RATIO:
            return EngagementLevel.FOCUSED
        if ratio >= self._BROWSE_RATIO:
            return EngagementLevel.BROWSING
        return EngagementLevel.SCANNING


# ═══════════════════════════════════════════════════════════════════
# 5. Attention Duration Calculator
# ═══════════════════════════════════════════════════════════════════

class AttentionDurationCalculator:
    """
    Accumulates per‑product and per‑shelf time from a stream of
    per‑frame AttentionEvent objects and produces aggregated metrics.
    """

    def __init__(self):
        self._product_focus: Dict[str, int] = defaultdict(int)   # zone → ms
        self._shelf_focus: Dict[int, int] = defaultdict(int)     # shelf_id → ms
        self._visit_count: Dict[str, int] = defaultdict(int)     # zone → count
        self._last_zone: Optional[str] = None

    def feed(self, event: AttentionEvent) -> None:
        """Consume one attention event and update accumulators."""
        zone_key = event.product_zone or f"shelf_{event.shelf_id}"

        self._product_focus[zone_key] += event.duration_ms

        if event.shelf_id is not None:
            self._shelf_focus[event.shelf_id] += event.duration_ms

        # Track repeated attention (zone changes then returns)
        if zone_key != self._last_zone:
            if zone_key in self._visit_count:
                self._visit_count[zone_key] += 1   # revisit
            else:
                self._visit_count[zone_key] = 1
            self._last_zone = zone_key

    def compute(self) -> AttentionMetrics:
        """Return aggregated metrics across all accumulated events."""
        total_product_focus = sum(self._product_focus.values())
        total_shelf_time = sum(self._shelf_focus.values())
        total_repeated = sum(max(0, c - 1) for c in self._visit_count.values())

        return AttentionMetrics(
            dwell_time_ms=total_product_focus + total_shelf_time,
            view_duration_ms=total_product_focus,
            shelf_attention_time_ms=total_shelf_time,
            product_focus_duration_ms=total_product_focus,
            repeated_attention_count=total_repeated,
        )

    def compute_per_zone(self) -> Dict[str, AttentionMetrics]:
        """Return per‑zone metrics."""
        out: Dict[str, AttentionMetrics] = {}
        for zone_key, focus_ms in self._product_focus.items():
            shelf_ms = 0
            # Try to extract shelf id
            if zone_key.startswith("shelf_"):
                try:
                    sid = int(zone_key.split("_")[1])
                    shelf_ms = self._shelf_focus.get(sid, 0)
                except (ValueError, IndexError):
                    pass
            repeat = max(0, self._visit_count.get(zone_key, 1) - 1)
            out[zone_key] = AttentionMetrics(
                dwell_time_ms=focus_ms + shelf_ms,
                view_duration_ms=focus_ms,
                shelf_attention_time_ms=shelf_ms,
                product_focus_duration_ms=focus_ms,
                repeated_attention_count=repeat,
            )
        return out


# ═══════════════════════════════════════════════════════════════════
# 6. Per‑frame pipeline orchestrator
# ═══════════════════════════════════════════════════════════════════

# Module‑level instances (reused across calls)
_gaze_estimator = GazeEstimator()
_head_pose_analyzer = HeadPoseAnalyzer()
_product_detector = ProductAttentionDetector()
_shelf_engagement = ShelfEngagementAnalyzer()
_duration_calculator = AttentionDurationCalculator()


def process_attention_frame(
    frame: np.ndarray,
    shelf_zones: Optional[List[ShelfZone]] = None,
    frame_time_ms: Optional[float] = None,
) -> List[AttentionEvent]:
    """
    Run the full attention pipeline on a single BGR frame.

    Parameters
    ----------
    frame : np.ndarray
        BGR image from OpenCV.
    shelf_zones : list[ShelfZone], optional
        Product / shelf bounding boxes to check gaze against.
    frame_time_ms : float, optional
        Timestamp in milliseconds.  Defaults to wall‑clock time.

    Returns
    -------
    list[AttentionEvent]
        One event per detected face.
    """
    if frame_time_ms is None:
        frame_time_ms = time.time() * 1000.0

    if shelf_zones is None:
        shelf_zones = []

    h, w = frame.shape[:2]
    events: List[AttentionEvent] = []

    if not _HAS_MEDIAPIPE or _face_mesh is None:
        # Without mediapipe we can't detect faces; return empty.
        return events

    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = _face_mesh.process(rgb)

    if not results.multi_face_landmarks:
        return events

    per_frame_duration_ms = 33  # assume ~30 fps

    for face_idx, face_lms in enumerate(results.multi_face_landmarks):
        lms = face_lms.landmark

        # 1. Gaze
        gaze = _gaze_estimator.estimate(lms, w, h)

        # 2. Head pose
        head = _head_pose_analyzer.analyze(lms, w, h)

        # 3. Product zone
        zone = _product_detector.detect(gaze.gaze_point, shelf_zones)

        shelf_id = zone.shelf_id if zone else None
        product_zone = zone.label if zone else None
        zone_key = zone.zone_id if zone else "unknown"

        # 4. Engagement
        engagement = _shelf_engagement.update(
            zone_key, frame_time_ms, per_frame_duration_ms
        )

        # 5. Determine event type
        if abs(head.yaw) > 25:
            event_type = "head_turn"
        elif zone and engagement == EngagementLevel.FOCUSED:
            event_type = "product_focus"
        else:
            event_type = "gaze_fixation"

        evt = AttentionEvent(
            timestamp_ms=frame_time_ms,
            shelf_id=shelf_id,
            product_zone=product_zone,
            event_type=event_type,
            gaze=gaze,
            head_pose=head,
            duration_ms=per_frame_duration_ms,
            engagement=engagement,
            shopper_id=face_idx,
        )

        # 6. Accumulate duration
        _duration_calculator.feed(evt)

        events.append(evt)

    return events


def get_accumulated_metrics() -> AttentionMetrics:
    """Return the running aggregate attention metrics."""
    return _duration_calculator.compute()


def get_per_zone_metrics() -> Dict[str, AttentionMetrics]:
    """Return per‑zone attention metrics."""
    return _duration_calculator.compute_per_zone()


def reset_metrics() -> None:
    """Reset all accumulated metrics (e.g. between sessions)."""
    global _duration_calculator, _shelf_engagement
    _duration_calculator = AttentionDurationCalculator()
    _shelf_engagement = ShelfEngagementAnalyzer()
