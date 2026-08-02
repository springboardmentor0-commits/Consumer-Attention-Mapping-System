"""
Internal data structures for the Attention Analysis Engine.

These are plain Python dataclasses used within the engine pipeline.
They are *not* SQLAlchemy ORM models (those live in app/models.py).
"""

from dataclasses import dataclass, field
from enum import Enum
from typing import Optional, Tuple, List


# ------------------------------------------------------------------
# Gaze estimation result
# ------------------------------------------------------------------

@dataclass
class GazeResult:
    """Result of gaze estimation for a single face."""
    yaw: float = 0.0          # Horizontal gaze angle in degrees (+ = right)
    pitch: float = 0.0        # Vertical gaze angle in degrees   (+ = up)
    gaze_point: Tuple[float, float] = (0.0, 0.0)  # Projected (x, y) on frame


# ------------------------------------------------------------------
# Head‑pose estimation result
# ------------------------------------------------------------------

@dataclass
class HeadPose:
    """Roll / pitch / yaw of the head in degrees."""
    roll: float = 0.0
    pitch: float = 0.0
    yaw: float = 0.0


# ------------------------------------------------------------------
# Engagement levels
# ------------------------------------------------------------------

class EngagementLevel(str, Enum):
    """Qualitative engagement classification."""
    SCANNING = "scanning"
    BROWSING = "browsing"
    FOCUSED = "focused"


# ------------------------------------------------------------------
# A single attention event (one frame, one shopper)
# ------------------------------------------------------------------

@dataclass
class AttentionEvent:
    """One attention observation produced by the per‑frame pipeline."""
    timestamp_ms: float = 0.0
    shelf_id: Optional[int] = None
    product_zone: Optional[str] = None
    event_type: str = "gaze_fixation"   # gaze_fixation | head_turn | product_focus | repeated_attention
    gaze: GazeResult = field(default_factory=GazeResult)
    head_pose: HeadPose = field(default_factory=HeadPose)
    duration_ms: int = 0
    engagement: EngagementLevel = EngagementLevel.SCANNING
    shopper_id: Optional[int] = None


# ------------------------------------------------------------------
# Product / shelf zone definition
# ------------------------------------------------------------------

@dataclass
class ShelfZone:
    """A rectangular zone on the shelf plane (pixel coordinates)."""
    zone_id: str = ""
    shelf_id: int = 0
    label: str = ""
    x1: int = 0
    y1: int = 0
    x2: int = 0
    y2: int = 0


# ------------------------------------------------------------------
# Aggregated metrics (computed from a stream of AttentionEvents)
# ------------------------------------------------------------------

@dataclass
class AttentionMetrics:
    """Aggregated attention metrics for a shelf / product / store."""
    dwell_time_ms: int = 0               # Total time shoppers spend in a zone
    view_duration_ms: int = 0            # How long eyes are on a product
    shelf_attention_time_ms: int = 0     # Cumulative shelf focus
    product_focus_duration_ms: int = 0   # Per‑product fixation time
    repeated_attention_count: int = 0    # How often shoppers re‑visit
