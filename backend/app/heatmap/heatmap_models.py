"""
Internal data structures for the Attention Heatmap Generation Engine.
"""

from dataclasses import dataclass, field
from enum import Enum
from typing import Optional, List, Dict, Any


class HeatmapType(str, Enum):
    """Supported heatmap generation types."""
    STORE_HEATMAP = "store_heatmap"
    SHELF_HEATMAP = "shelf_heatmap"
    PRODUCT_ATTENTION_HEATMAP = "product_attention_heatmap"
    CUSTOMER_TRAFFIC_HEATMAP = "customer_traffic_heatmap"
    ENGAGEMENT_HOTSPOT = "engagement_hotspot"


@dataclass
class HotspotZone:
    """Detected peak intensity hotspot or cold zone."""
    zone_id: str
    label: str
    x: int
    y: int
    intensity: float  # 0.0 to 1.0
    zone_type: str    # "hotspot" | "coldspot"


@dataclass
class HeatmapGrid:
    """2D spatial grid representation of normalized heat values."""
    width: int = 20
    height: int = 15
    grid: List[List[float]] = field(default_factory=list)
    max_raw_value: float = 0.0


@dataclass
class HeatmapDataResponse:
    """Response structure for generated heatmaps."""
    heatmap_type: HeatmapType
    grid: HeatmapGrid
    hotspots: List[HotspotZone] = field(default_factory=list)
    total_data_points: int = 0
    generated_at_ms: float = 0.0
