"""
Internal data structures for the Consumer Behavior Intelligence Engine.
"""

from dataclasses import dataclass, field
from enum import Enum
from typing import Optional, List, Dict, Any


class ConsumerSegmentType(str, Enum):
    """The 5 Consumer Segments."""
    EXPLORERS = "explorers"
    QUICK_BUYERS = "quick_buyers"
    COMPARISON_SHOPPERS = "comparison_shoppers"
    IMPULSE_BUYERS = "impulse_buyers"
    BRAND_LOYAL = "brand_loyal"


@dataclass
class ShoppingPattern:
    """Pattern analysis metrics."""
    avg_dwell_time_ms: int = 0
    categories_visited: int = 0
    shopping_pace_score: float = 0.0  # 0.0 = slow/relaxed, 1.0 = rapid
    pattern_label: str = "Standard"


@dataclass
class ProductPreference:
    """Preference analysis metrics."""
    brand_affinity: str = "Generic"
    top_category: str = "Dairy"
    view_to_purchase_ratio: float = 0.0
    brand_loyalty_score: float = 0.0  # 0.0 to 1.0


@dataclass
class MovementBehavior:
    """Movement behavior tracking metrics."""
    path_length_m: float = 0.0
    avg_velocity_m_s: float = 0.0
    backtrack_count: int = 0
    stop_count: int = 0


@dataclass
class JourneyMetrics:
    """End-to-end journey analytics metrics."""
    entry_zone: str = "Main Entrance"
    touchpoints_visited: List[str] = field(default_factory=list)
    checkout_converted: bool = False
    journey_duration_ms: int = 0


@dataclass
class ShopperBehaviorProfile:
    """Full behavior intelligence profile of a single consumer."""
    shopper_id: int
    segment: ConsumerSegmentType = ConsumerSegmentType.EXPLORERS
    confidence: float = 0.85
    pattern: ShoppingPattern = field(default_factory=ShoppingPattern)
    preference: ProductPreference = field(default_factory=ProductPreference)
    movement: MovementBehavior = field(default_factory=MovementBehavior)
    journey: JourneyMetrics = field(default_factory=JourneyMetrics)


@dataclass
class BehaviorSummaryData:
    """Summary metrics of consumer behavior intelligence across all shoppers."""
    total_shoppers_analyzed: int = 0
    total_explorers: int = 0
    total_quick_buyers: int = 0
    total_comparison_shoppers: int = 0
    total_impulse_buyers: int = 0
    total_brand_loyal: int = 0
    avg_journey_duration_ms: float = 0.0
    overall_conversion_rate: float = 0.0
