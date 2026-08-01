from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Tuple

# ==========================================================
# Type Aliases
# ==========================================================

BoundingBox = Tuple[int, int, int, int]
Point2D = Tuple[int, int]


# ==========================================================
# Frame
# ==========================================================

@dataclass(slots=True)
class FrameData:
    """Represents one processed frame entering the AI pipeline."""

    frame: Any
    frame_number: int
    timestamp: float


# ==========================================================
# Detection
# ==========================================================

@dataclass(slots=True, frozen=True)
class Detection:
    """Output of the YOLO detector. Represents a single detected person before tracking."""

    bbox: BoundingBox
    confidence: float
    class_id: int

    @property
    def width(self) -> int:
        return self.bbox[2] - self.bbox[0]

    @property
    def height(self) -> int:
        return self.bbox[3] - self.bbox[1]

    @property
    def area(self) -> int:
        return self.width * self.height

    @property
    def center(self) -> Point2D:
        return (
            (self.bbox[0] + self.bbox[2]) // 2,
            (self.bbox[1] + self.bbox[3]) // 2,
        )


# ==========================================================
# Tracked Person
# ==========================================================

@dataclass(slots=True)
class TrackedPerson:
    """Represents one tracked shopper.

    Produced by the tracking engine and consumed by downstream analytics modules.
    """

    track_id: int
    bbox: BoundingBox
    confidence: float
    timestamp: float

    # --- Backward Compatibility & Helper Properties ---

    @property
    def shopper_id(self) -> int:
        """Alias for `track_id` to support legacy modules expecting `shopper_id`."""
        return self.track_id

    @property
    def id(self) -> int:
        """Alias for `track_id`."""
        return self.track_id

    def __getitem__(self, key: str) -> Any:
        """Allows dictionary-style lookup (e.g. shopper["shopper_id"]) to prevent KeyError/TypeError in legacy code."""
        if key in ("shopper_id", "track_id", "id"):
            return self.track_id
        if key == "bbox":
            return self.bbox
        if key == "confidence":
            return self.confidence
        if key == "timestamp":
            return self.timestamp
        raise KeyError(f"'TrackedPerson' object has no key '{key}'")

    # --- Geometric Properties ---

    @property
    def center(self) -> Point2D:
        return (
            (self.bbox[0] + self.bbox[2]) // 2,
            (self.bbox[1] + self.bbox[3]) // 2,
        )

    @property
    def width(self) -> int:
        return self.bbox[2] - self.bbox[0]

    @property
    def height(self) -> int:
        return self.bbox[3] - self.bbox[1]

    @property
    def area(self) -> int:
        return self.width * self.height


# ==========================================================
# Tracking Result
# ==========================================================

@dataclass(slots=True)
class TrackingResult:
    """Output of the complete tracking pipeline. Returned once per processed frame."""

    frame: Any
    frame_number: int
    timestamp: float
    detections: list[Detection] = field(default_factory=list)
    tracked_people: list[TrackedPerson] = field(default_factory=list)