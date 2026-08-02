"""
Internal data structures for the Product Interaction Analysis Module.
"""

from dataclasses import dataclass, field
from enum import Enum
from typing import Optional, List, Tuple, Dict


class InteractionType(str, Enum):
    """Supported interaction event types."""
    PRODUCT_VIEWED = "product_viewed"
    PRODUCT_PICKED_UP = "product_picked_up"
    PRODUCT_RETURNED = "product_returned"
    PRODUCT_PURCHASED = "product_purchased"
    PRODUCT_COMPARED = "product_compared"


@dataclass
class ProductRegion:
    """Bounding box for a product on a shelf."""
    product_id: str
    product_name: str
    shelf_id: int
    bbox: Tuple[int, int, int, int]  # x1, y1, x2, y2


@dataclass
class InteractionEvent:
    """One product interaction observation."""
    timestamp_ms: float = 0.0
    shopper_id: Optional[int] = None
    product_id: Optional[str] = None
    product_name: Optional[str] = None
    shelf_id: Optional[int] = None
    interaction_type: InteractionType = InteractionType.PRODUCT_VIEWED
    duration_ms: int = 0
    confidence: float = 0.0
    compared_with: Optional[str] = None


@dataclass
class ProductEngagementState:
    """Tracking state for a single shopper's interaction with products."""
    shopper_id: int
    current_handled_product: Optional[str] = None
    handled_shelf_id: Optional[int] = None
    pickup_time_ms: Optional[float] = None
    view_start_ms: Optional[float] = None
    handled_history: List[str] = field(default_factory=list)


@dataclass
class InteractionSummaryData:
    """Summary metrics of all recorded product interactions."""
    total_interactions: int = 0
    total_viewed: int = 0
    total_picked_up: int = 0
    total_returned: int = 0
    total_purchased: int = 0
    total_compared: int = 0
    conversion_rate: float = 0.0  # (Purchased / Picked Up) * 100
    return_rate: float = 0.0      # (Returned / Picked Up) * 100
