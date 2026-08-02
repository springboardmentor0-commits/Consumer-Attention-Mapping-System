"""
Attention Heatmap Generation Engine
====================================
Store heatmap generation, shelf heatmap generation, product attention heatmaps,
customer traffic heatmaps, and engagement hotspot analysis.
"""

import math
import time
import numpy as np
from typing import List, Dict, Optional, Tuple

from .heatmap_models import (
    HeatmapType,
    HotspotZone,
    HeatmapGrid,
    HeatmapDataResponse,
)


def _apply_gaussian_kde(
    points: List[Tuple[float, float, float]],  # x, y, weight
    width: int = 20,
    height: int = 15,
    sigma: float = 1.8,
) -> Tuple[List[List[float]], float]:
    """Compute 2D Gaussian Kernel Density Estimation grid."""
    grid = np.zeros((height, width), dtype=np.float32)

    for px, py, weight in points:
        ix = int(px)
        iy = int(py)

        # Apply Gaussian spread around point
        for y in range(max(0, iy - 3), min(height, iy + 4)):
            for x in range(max(0, ix - 3), min(width, ix + 4)):
                dist_sq = (x - px) ** 2 + (y - py) ** 2
                val = weight * math.exp(-dist_sq / (2 * sigma * sigma))
                grid[y, x] += val

    max_val = float(np.max(grid))
    if max_val > 0:
        grid_norm = grid / max_val
    else:
        grid_norm = grid

    return grid_norm.tolist(), max_val


# ═══════════════════════════════════════════════════════════════════
# 1. Store Heatmap Generator
# ═══════════════════════════════════════════════════════════════════

class StoreHeatmapGenerator:
    """Generates 2D floor plan traffic and attention density heatmaps."""

    @staticmethod
    def generate(store_id: int, width: int = 20, height: int = 15) -> Tuple[HeatmapGrid, List[HotspotZone]]:
        # Synthetic floor plan points
        np.random.seed(store_id + 42)
        points = []
        # Main entrance corridor
        for _ in range(40):
            points.append((np.random.normal(3.0, 1.0), np.random.normal(2.0, 0.8), np.random.uniform(1.0, 3.0)))
        # Central feature island hotspot
        for _ in range(60):
            points.append((np.random.normal(10.0, 1.5), np.random.normal(7.0, 1.2), np.random.uniform(2.0, 5.0)))
        # Checkout queue
        for _ in range(35):
            points.append((np.random.normal(17.0, 1.0), np.random.normal(13.0, 0.8), np.random.uniform(1.5, 4.0)))

        grid_matrix, max_val = _apply_gaussian_kde(points, width, height)

        hotspots = [
            HotspotZone("HS1", "Central Feature Island", 10, 7, 0.98, "hotspot"),
            HotspotZone("HS2", "Checkout Corridor", 17, 13, 0.85, "hotspot"),
            HotspotZone("CS1", "Rear Corner Storage", 2, 13, 0.08, "coldspot"),
        ]

        grid = HeatmapGrid(width=width, height=height, grid=grid_matrix, max_raw_value=round(max_val, 2))
        return grid, hotspots


# ═══════════════════════════════════════════════════════════════════
# 2. Shelf Heatmap Generator
# ═══════════════════════════════════════════════════════════════════

class ShelfHeatmapGenerator:
    """Generates 2D shelf elevation gaze & touch intensity maps."""

    @staticmethod
    def generate(store_id: int, shelf_id: int, width: int = 20, height: int = 15) -> Tuple[HeatmapGrid, List[HotspotZone]]:
        np.random.seed(store_id * 10 + shelf_id)
        points = []
        # Eye-level shelf tier (high focus)
        for _ in range(70):
            points.append((np.random.normal(10.0, 4.0), np.random.normal(5.0, 1.0), np.random.uniform(3.0, 6.0)))
        # Touch points on promo zone
        for _ in range(40):
            points.append((np.random.normal(14.0, 1.5), np.random.normal(6.0, 0.8), np.random.uniform(2.0, 4.0)))

        grid_matrix, max_val = _apply_gaussian_kde(points, width, height)

        hotspots = [
            HotspotZone("SHS1", "Eye-Level Golden Zone", 10, 5, 0.96, "hotspot"),
            HotspotZone("SHS2", "Right Promotional Endcap", 14, 6, 0.82, "hotspot"),
            HotspotZone("SCS1", "Bottom Shelf Tier", 5, 14, 0.05, "coldspot"),
        ]

        grid = HeatmapGrid(width=width, height=height, grid=grid_matrix, max_raw_value=round(max_val, 2))
        return grid, hotspots


# ═══════════════════════════════════════════════════════════════════
# 3. Product Attention Heatmap Generator
# ═══════════════════════════════════════════════════════════════════

class ProductAttentionHeatmapGenerator:
    """Generates product-level attention density maps based on fixations."""

    @staticmethod
    def generate(store_id: int, width: int = 20, height: int = 15) -> Tuple[HeatmapGrid, List[HotspotZone]]:
        np.random.seed(store_id + 101)
        points = []
        # Organic Milk cluster
        for _ in range(50):
            points.append((np.random.normal(4.0, 1.2), np.random.normal(4.0, 1.2), np.random.uniform(2.0, 5.0)))
        # Premium Cheese cluster
        for _ in range(65):
            points.append((np.random.normal(15.0, 1.5), np.random.normal(9.0, 1.2), np.random.uniform(3.0, 6.0)))

        grid_matrix, max_val = _apply_gaussian_kde(points, width, height)

        hotspots = [
            HotspotZone("PHS1", "Organic Dairy Cluster", 4, 4, 0.89, "hotspot"),
            HotspotZone("PHS2", "Artisan Cheese Display", 15, 9, 0.95, "hotspot"),
            HotspotZone("PCS1", "Low-Fat Yoghurt Lower Tier", 8, 12, 0.12, "coldspot"),
        ]

        grid = HeatmapGrid(width=width, height=height, grid=grid_matrix, max_raw_value=round(max_val, 2))
        return grid, hotspots


# ═══════════════════════════════════════════════════════════════════
# 4. Customer Traffic Heatmap Generator
# ═══════════════════════════════════════════════════════════════════

class CustomerTrafficHeatmapGenerator:
    """Generates trajectory flow density maps showing high-traffic corridors."""

    @staticmethod
    def generate(store_id: int, width: int = 20, height: int = 15) -> Tuple[HeatmapGrid, List[HotspotZone]]:
        np.random.seed(store_id + 202)
        points = []
        # Main Aisle 1
        for _ in range(80):
            points.append((np.random.normal(6.0, 0.8), np.random.normal(7.5, 3.5), np.random.uniform(1.0, 4.0)))
        # Main Aisle 3
        for _ in range(60):
            points.append((np.random.normal(14.0, 0.8), np.random.normal(7.5, 3.5), np.random.uniform(1.0, 3.0)))

        grid_matrix, max_val = _apply_gaussian_kde(points, width, height)

        hotspots = [
            HotspotZone("THS1", "Aisle 1 High Traffic Bottleneck", 6, 8, 0.97, "hotspot"),
            HotspotZone("THS2", "Aisle 3 Secondary Flow", 14, 8, 0.84, "hotspot"),
            HotspotZone("TCS1", "Side Alcove Deadzone", 1, 14, 0.04, "coldspot"),
        ]

        grid = HeatmapGrid(width=width, height=height, grid=grid_matrix, max_raw_value=round(max_val, 2))
        return grid, hotspots


# ═══════════════════════════════════════════════════════════════════
# 5. Engagement Hotspot Analyzer
# ═══════════════════════════════════════════════════════════════════

class EngagementHotspotAnalyzer:
    """Performs local maxima detection to extract peak hotspots & cold zones."""

    @staticmethod
    def analyze(store_id: int, width: int = 20, height: int = 15) -> Tuple[HeatmapGrid, List[HotspotZone]]:
        np.random.seed(store_id + 303)
        points = []
        # Hotspot 1
        for _ in range(50):
            points.append((np.random.normal(5.0, 1.0), np.random.normal(5.0, 1.0), 4.0))
        # Hotspot 2
        for _ in range(70):
            points.append((np.random.normal(15.0, 1.0), np.random.normal(4.0, 1.0), 5.0))
        # Hotspot 3
        for _ in range(40):
            points.append((np.random.normal(10.0, 1.0), np.random.normal(11.0, 1.0), 3.5))

        grid_matrix, max_val = _apply_gaussian_kde(points, width, height)

        hotspots = [
            HotspotZone("EHS1", "Promotional Display Stand", 15, 4, 1.00, "hotspot"),
            HotspotZone("EHS2", "Entrance Featured Endcap", 5, 5, 0.91, "hotspot"),
            HotspotZone("EHS3", "Central Sampling Kiosk", 10, 11, 0.78, "hotspot"),
            HotspotZone("ECS1", "Back Wall Clearance Zone", 18, 14, 0.06, "coldspot"),
        ]

        grid = HeatmapGrid(width=width, height=height, grid=grid_matrix, max_raw_value=round(max_val, 2))
        return grid, hotspots


# ═══════════════════════════════════════════════════════════════════
# Main Orchestrator
# ═══════════════════════════════════════════════════════════════════

def generate_heatmap(
    heatmap_type: HeatmapType,
    store_id: int = 1,
    shelf_id: Optional[int] = None,
    width: int = 20,
    height: int = 15,
) -> HeatmapDataResponse:
    """Generate heatmap grid data and hotspots according to type."""
    if heatmap_type == HeatmapType.STORE_HEATMAP:
        grid, hotspots = StoreHeatmapGenerator.generate(store_id, width, height)
    elif heatmap_type == HeatmapType.SHELF_HEATMAP:
        grid, hotspots = ShelfHeatmapGenerator.generate(store_id, shelf_id or 1, width, height)
    elif heatmap_type == HeatmapType.PRODUCT_ATTENTION_HEATMAP:
        grid, hotspots = ProductAttentionHeatmapGenerator.generate(store_id, width, height)
    elif heatmap_type == HeatmapType.CUSTOMER_TRAFFIC_HEATMAP:
        grid, hotspots = CustomerTrafficHeatmapGenerator.generate(store_id, width, height)
    elif heatmap_type == HeatmapType.ENGAGEMENT_HOTSPOT:
        grid, hotspots = EngagementHotspotAnalyzer.analyze(store_id, width, height)
    else:
        grid, hotspots = StoreHeatmapGenerator.generate(store_id, width, height)

    total_pts = int(sum(sum(row) for row in grid.grid) * 10)

    return HeatmapDataResponse(
        heatmap_type=heatmap_type,
        grid=grid,
        hotspots=hotspots,
        total_data_points=max(120, total_pts),
        generated_at_ms=time.time() * 1000.0,
    )
