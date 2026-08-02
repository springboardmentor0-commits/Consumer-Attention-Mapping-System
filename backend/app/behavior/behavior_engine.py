"""
Consumer Behavior Intelligence Engine
=====================================
Shopping pattern analysis, product preference analysis, movement behavior analysis,
consumer segmentation, and journey analytics.
"""

import math
import time
from typing import List, Dict, Optional, Tuple
from collections import defaultdict

from .behavior_models import (
    ConsumerSegmentType,
    ShoppingPattern,
    ProductPreference,
    MovementBehavior,
    JourneyMetrics,
    ShopperBehaviorProfile,
    BehaviorSummaryData,
)


# ═══════════════════════════════════════════════════════════════════
# 1. Shopping Pattern Analyzer
# ═══════════════════════════════════════════════════════════════════

class ShoppingPatternAnalyzer:
    """Analyzes pace, dwell times, and aisle visitation diversity."""

    @staticmethod
    def analyze(
        dwell_time_ms: int,
        categories_visited: List[str],
        movement_speed: float,
    ) -> ShoppingPattern:
        diversity = len(set(categories_visited))
        # pace: ratio of speed to dwell time (high speed & low dwell = rapid)
        pace = min(1.0, max(0.0, (movement_speed * 1.5) / max(1.0, dwell_time_ms / 60000.0)))

        if diversity >= 4 and dwell_time_ms > 180000:
            label = "Deep Exploration"
        elif pace > 0.7:
            label = "Targeted Fast Walk"
        elif dwell_time_ms < 60000:
            label = "Quick Express"
        else:
            label = "Balanced Browsing"

        return ShoppingPattern(
            avg_dwell_time_ms=dwell_time_ms,
            categories_visited=diversity,
            shopping_pace_score=round(pace, 2),
            pattern_label=label,
        )


# ═══════════════════════════════════════════════════════════════════
# 2. Product Preference Analyzer
# ═══════════════════════════════════════════════════════════════════

class ProductPreferenceAnalyzer:
    """Analyzes brand affinity, top categories, and brand loyalty score."""

    @staticmethod
    def analyze(
        brand_interactions: Dict[str, int],
        category_interactions: Dict[str, int],
        view_count: int,
        purchase_count: int,
    ) -> ProductPreference:
        top_brand = max(brand_interactions, key=brand_interactions.get) if brand_interactions else "Generic"
        top_cat = max(category_interactions, key=category_interactions.get) if category_interactions else "Grocery"

        total_brand_hits = sum(brand_interactions.values())
        top_brand_hits = brand_interactions.get(top_brand, 0)
        loyalty_score = top_brand_hits / max(1, total_brand_hits)

        v2p = purchase_count / max(1, view_count)

        return ProductPreference(
            brand_affinity=top_brand,
            top_category=top_cat,
            view_to_purchase_ratio=round(v2p, 2),
            brand_loyalty_score=round(loyalty_score, 2),
        )


# ═══════════════════════════════════════════════════════════════════
# 3. Movement Behavior Analyzer
# ═══════════════════════════════════════════════════════════════════

class MovementBehaviorAnalyzer:
    """Analyzes velocity, path length, backtracking, and stop count from tracking points."""

    @staticmethod
    def analyze(points: List[Tuple[float, float, float]]) -> MovementBehavior:
        """points: list of (x, y, timestamp_ms)"""
        if len(points) < 2:
            return MovementBehavior(0.0, 0.0, 0, 0)

        total_dist = 0.0
        stops = 0
        backtracks = 0
        last_heading = None

        for i in range(1, len(points)):
            p1, p2 = points[i-1], points[i]
            dx = p2[0] - p1[0]
            dy = p2[1] - p1[1]
            dt = (p2[2] - p1[2]) / 1000.0  # seconds
            dist = math.sqrt(dx*dx + dy*dy)
            total_dist += dist

            speed = dist / max(0.001, dt)
            if speed < 0.2:
                stops += 1

            if dist > 0.5:
                heading = math.atan2(dy, dx)
                if last_heading is not None:
                    diff = abs(heading - last_heading)
                    if diff > math.pi * 0.75:  # sharp turn / backtrack
                        backtracks += 1
                last_heading = heading

        total_time_s = max(1.0, (points[-1][2] - points[0][2]) / 1000.0)
        avg_vel = total_dist / total_time_s

        return MovementBehavior(
            path_length_m=round(total_dist, 1),
            avg_velocity_m_s=round(avg_vel, 2),
            backtrack_count=backtracks,
            stop_count=stops,
        )


# ═══════════════════════════════════════════════════════════════════
# 4. Consumer Segmenter
# ═══════════════════════════════════════════════════════════════════

class ConsumerSegmenter:
    """
    Classifies a consumer into one of the 5 segments:
    1. Explorers
    2. Quick Buyers
    3. Comparison Shoppers
    4. Impulse Buyers
    5. Brand Loyal Customers
    """

    @staticmethod
    def classify(
        pattern: ShoppingPattern,
        preference: ProductPreference,
        movement: MovementBehavior,
        compared_count: int,
        impulse_pickup_count: int,
    ) -> Tuple[ConsumerSegmentType, float]:
        """Returns (Segment, Confidence)."""

        # 1. Brand Loyal Check: High brand loyalty score & specific brand focus
        if preference.brand_loyalty_score >= 0.75:
            return (ConsumerSegmentType.BRAND_LOYAL, 0.92)

        # 2. Comparison Shoppers Check: Multi-item handling & comparisons
        if compared_count >= 2:
            return (ConsumerSegmentType.COMPARISON_SHOPPERS, 0.90)

        # 3. Quick Buyers Check: Rapid velocity, short dwell time, few stops
        if movement.avg_velocity_m_s >= 1.1 and pattern.avg_dwell_time_ms < 90000:
            return (ConsumerSegmentType.QUICK_BUYERS, 0.88)

        # 4. Impulse Buyers Check: Rapid view-to-purchase, impulse pickups
        if impulse_pickup_count >= 2 or preference.view_to_purchase_ratio >= 0.7:
            return (ConsumerSegmentType.IMPULSE_BUYERS, 0.86)

        # 5. Explorers Check (default for high dwell / category traversal)
        if pattern.categories_visited >= 3 or movement.path_length_m >= 35.0:
            return (ConsumerSegmentType.EXPLORERS, 0.94)

        # Default fallback
        return (ConsumerSegmentType.EXPLORERS, 0.80)


# ═══════════════════════════════════════════════════════════════════
# 5. Journey Analytics Engine
# ═══════════════════════════════════════════════════════════════════

class JourneyAnalyticsEngine:
    """Tracks end-to-end consumer journey from entrance to checkout."""

    @staticmethod
    def map_journey(
        entry_zone: str,
        touchpoints: List[str],
        checkout_converted: bool,
        duration_ms: int,
    ) -> JourneyMetrics:
        return JourneyMetrics(
            entry_zone=entry_zone,
            touchpoints_visited=touchpoints,
            checkout_converted=checkout_converted,
            journey_duration_ms=duration_ms,
        )


# ═══════════════════════════════════════════════════════════════════
# Global Tracker State
# ═══════════════════════════════════════════════════════════════════

class BehaviorIntelligenceTracker:
    """Manages profiles and summary aggregates across all shoppers."""

    def __init__(self):
        self._profiles: Dict[int, ShopperBehaviorProfile] = {}
        self._seed_demo_data()

    def _seed_demo_data(self):
        """Seed demo profiles for realistic metrics presentation."""
        demo_specs = [
            (101, ConsumerSegmentType.EXPLORERS, "Dairy, Bakery, Snacks, Produce", "Organic Life", 240000, 45.2, 1.2),
            (102, ConsumerSegmentType.QUICK_BUYERS, "Beverages", "AquaPure", 45000, 15.0, 1.4),
            (103, ConsumerSegmentType.COMPARISON_SHOPPERS, "Electronics", "TechCorp", 310000, 28.5, 0.9),
            (104, ConsumerSegmentType.IMPULSE_BUYERS, "Confectionery", "SweetBite", 85000, 18.2, 1.1),
            (105, ConsumerSegmentType.BRAND_LOYAL, "Personal Care", "GlowUp", 120000, 22.0, 1.0),
            (106, ConsumerSegmentType.EXPLORERS, "Apparel, Shoes, Accessories", "UrbanStyle", 420000, 68.0, 0.8),
            (107, ConsumerSegmentType.QUICK_BUYERS, "Frozen Foods", "FrostyFresh", 55000, 12.5, 1.5),
        ]
        for sid, seg, cats, brand, dwell, path, vel in demo_specs:
            cat_list = [c.strip() for c in cats.split(",")]
            prof = ShopperBehaviorProfile(
                shopper_id=sid,
                segment=seg,
                confidence=0.90,
                pattern=ShoppingPattern(
                    avg_dwell_time_ms=dwell,
                    categories_visited=len(cat_list),
                    shopping_pace_score=0.6,
                    pattern_label="Demo Pattern",
                ),
                preference=ProductPreference(
                    brand_affinity=brand,
                    top_category=cat_list[0],
                    view_to_purchase_ratio=0.5,
                    brand_loyalty_score=0.85 if seg == ConsumerSegmentType.BRAND_LOYAL else 0.4,
                ),
                movement=MovementBehavior(
                    path_length_m=path,
                    avg_velocity_m_s=vel,
                    backtrack_count=1,
                    stop_count=3,
                ),
                journey=JourneyMetrics(
                    entry_zone="North Gate",
                    touchpoints_visited=cat_list,
                    checkout_converted=True,
                    journey_duration_ms=dwell + 30000,
                )
            )
            self._profiles[sid] = prof

    def get_profile(self, shopper_id: int) -> ShopperBehaviorProfile:
        if shopper_id not in self._profiles:
            # Create dynamic default profile
            prof = ShopperBehaviorProfile(shopper_id=shopper_id)
            self._profiles[shopper_id] = prof
        return self._profiles[shopper_id]

    def record_analysis(self, profile: ShopperBehaviorProfile):
        self._profiles[profile.shopper_id] = profile

    def get_summary(self) -> BehaviorSummaryData:
        profiles = list(self._profiles.values())
        total = len(profiles)

        explorers = sum(1 for p in profiles if p.segment == ConsumerSegmentType.EXPLORERS)
        quick = sum(1 for p in profiles if p.segment == ConsumerSegmentType.QUICK_BUYERS)
        comp = sum(1 for p in profiles if p.segment == ConsumerSegmentType.COMPARISON_SHOPPERS)
        impulse = sum(1 for p in profiles if p.segment == ConsumerSegmentType.IMPULSE_BUYERS)
        loyal = sum(1 for p in profiles if p.segment == ConsumerSegmentType.BRAND_LOYAL)

        avg_dur = sum(p.journey.journey_duration_ms for p in profiles) / max(1, total)
        converted = sum(1 for p in profiles if p.journey.checkout_converted)
        conv_rate = (converted / max(1, total)) * 100.0

        return BehaviorSummaryData(
            total_shoppers_analyzed=total,
            total_explorers=explorers,
            total_quick_buyers=quick,
            total_comparison_shoppers=comp,
            total_impulse_buyers=impulse,
            total_brand_loyal=loyal,
            avg_journey_duration_ms=round(avg_dur, 1),
            overall_conversion_rate=round(conv_rate, 1),
        )


_tracker = BehaviorIntelligenceTracker()


def analyze_consumer_behavior(
    shopper_id: int,
    points: List[Tuple[float, float, float]],
    categories_visited: List[str],
    brand_hits: Dict[str, int],
    compared_count: int = 0,
    impulse_count: int = 0,
    purchased: bool = False,
) -> ShopperBehaviorProfile:
    """Run end-to-end behavior analysis for a single shopper."""
    movement = MovementBehaviorAnalyzer.analyze(points)
    total_time_ms = int(points[-1][2] - points[0][2]) if len(points) >= 2 else 60000

    pattern = ShoppingPatternAnalyzer.analyze(
        dwell_time_ms=total_time_ms,
        categories_visited=categories_visited,
        movement_speed=movement.avg_velocity_m_s,
    )

    cat_hits = {c: 1 for c in categories_visited}
    preference = ProductPreferenceAnalyzer.analyze(
        brand_interactions=brand_hits,
        category_interactions=cat_hits,
        view_count=len(categories_visited) * 2,
        purchase_count=1 if purchased else 0,
    )

    segment, confidence = ConsumerSegmenter.classify(
        pattern=pattern,
        preference=preference,
        movement=movement,
        compared_count=compared_count,
        impulse_pickup_count=impulse_count,
    )

    journey = JourneyAnalyticsEngine.map_journey(
        entry_zone="Main Entrance",
        touchpoints=categories_visited,
        checkout_converted=purchased,
        journey_duration_ms=total_time_ms + 15000,
    )

    profile = ShopperBehaviorProfile(
        shopper_id=shopper_id,
        segment=segment,
        confidence=confidence,
        pattern=pattern,
        preference=preference,
        movement=movement,
        journey=journey,
    )

    _tracker.record_analysis(profile)
    return profile


def get_behavior_summary() -> BehaviorSummaryData:
    return _tracker.get_summary()
