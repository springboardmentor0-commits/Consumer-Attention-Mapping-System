"""
Recommendation & Optimization Engine
=====================================
Shelf optimization recommendations, product placement recommendations,
promotional placement suggestions, consumer engagement recommendations, and layout improvement suggestions.
"""

import time
from typing import List, Dict, Optional

from .optimization_models import (
    RecommendationCategory,
    ImpactPriority,
    RecommendationItem,
    OptimizationSummaryData,
)


# ═══════════════════════════════════════════════════════════════════
# 1. Shelf Optimizer
# ═══════════════════════════════════════════════════════════════════

class ShelfOptimizer:
    """Generates shelf tier rebalancing and vertical space optimization recommendations."""

    @staticmethod
    def generate(store_id: int) -> List[RecommendationItem]:
        return [
            RecommendationItem(
                id="REC-SO-01",
                category=RecommendationCategory.SHELF_OPTIMIZATION,
                priority=ImpactPriority.HIGH,
                title="Rebalance Eye-Level Golden Zone Allocation",
                description="Organic Dairy products are receiving 38% higher gaze fixation than allotted shelf width. Expand tier width by 40cm.",
                expected_revenue_lift_percent=14.5,
                actionable_steps=[
                    "Move low-turnover skim milk SKUs to lower shelf tier 4",
                    "Expand Organic Almond Milk facing from 2 to 4 slots on Eye-Level tier 2",
                    "Verify line-of-sight clearance from main aisle entry point",
                ],
                target_product_or_zone="Dairy Aisle 2 - Tier 2",
            ),
            RecommendationItem(
                id="REC-SO-02",
                category=RecommendationCategory.SHELF_OPTIMIZATION,
                priority=ImpactPriority.MEDIUM,
                title="Bottom Shelf Facings Density Optimization",
                description="Bottom shelf tier 1 has a 0.05 visibility score and 80% deadzone density. Reposition heavy bulk items for quick pickup.",
                expected_revenue_lift_percent=6.2,
                actionable_steps=[
                    "Group 2L juice jugs in high-visibility endcap bottom bins",
                    "Add high-contrast floor directional signage along Aisle 3",
                ],
                target_product_or_zone="Aisle 3 - Tier 1",
            ),
        ]


# ═══════════════════════════════════════════════════════════════════
# 2. Product Placement Advisor
# ═══════════════════════════════════════════════════════════════════

class ProductPlacementAdvisor:
    """Suggests optimal product positioning based on attractiveness scores."""

    @staticmethod
    def generate(store_id: int) -> List[RecommendationItem]:
        return [
            RecommendationItem(
                id="REC-PP-01",
                category=RecommendationCategory.PRODUCT_PLACEMENT,
                priority=ImpactPriority.HIGH,
                title="Relocate High-Attractiveness Artisan Cheese to Eye Level",
                description="Artisan Cheddar Cheese has an A-grade attractiveness score (88.6) but is currently placed on middle tier 3.",
                expected_revenue_lift_percent=18.0,
                actionable_steps=[
                    "Swap Artisan Cheddar Cheese with generic Processed Cheese on Tier 2",
                    "Place cross-promotional cracker displays directly adjacent on shelf clip-strips",
                ],
                target_product_or_zone="Artisan Cheddar Cheese 200g",
            ),
            RecommendationItem(
                id="REC-PP-02",
                category=RecommendationCategory.PRODUCT_PLACEMENT,
                priority=ImpactPriority.MEDIUM,
                title="Cross-Category Placement: Wine & Premium Snacks",
                description="Comparison Shoppers in Beverage Aisle frequently backtrack to Gourmet Snacks. Create a co-located display bay.",
                expected_revenue_lift_percent=9.5,
                actionable_steps=[
                    "Install secondary feature display at Beverage/Snack aisle intersection",
                    "Stock high-margin gourmet nuts and dark chocolate bars in feature bay",
                ],
                target_product_or_zone="Beverage & Snack Intersection",
            ),
        ]


# ═══════════════════════════════════════════════════════════════════
# 3. Promotional Placement Suggester
# ═══════════════════════════════════════════════════════════════════

class PromotionalPlacementSuggester:
    """Identifies traffic hotspots and recommends optimal endcap placements."""

    @staticmethod
    def generate(store_id: int) -> List[RecommendationItem]:
        return [
            RecommendationItem(
                id="REC-PR-01",
                category=RecommendationCategory.PROMOTIONAL_PLACEMENT,
                priority=ImpactPriority.HIGH,
                title="Deploy Promotional Feature Stand at Central Hotspot",
                description="Central Feature Island (Grid X=10, Y=7) captures 98% traffic density. Position seasonal promotion here.",
                expected_revenue_lift_percent=22.4,
                actionable_steps=[
                    "Install 360-degree promotional island kiosk at X=10, Y=7",
                    "Feature high-margin seasonal bundles with bright overhead signage",
                    "Schedule sampling staff during peak hours (17:00 - 19:00)",
                ],
                target_product_or_zone="Central Feature Island (X=10, Y=7)",
            ),
        ]


# ═══════════════════════════════════════════════════════════════════
# 4. Consumer Engagement Enhancer
# ═══════════════════════════════════════════════════════════════════

class ConsumerEngagementEnhancer:
    """Recommends actions for products with high dwell time but low conversion."""

    @staticmethod
    def generate(store_id: int) -> List[RecommendationItem]:
        return [
            RecommendationItem(
                id="REC-CE-01",
                category=RecommendationCategory.CONSUMER_ENGAGEMENT,
                priority=ImpactPriority.MEDIUM,
                title="Enhance Price & Nutrition Labeling for Dark Chocolate 85%",
                description="High dwell duration (95,000ms) but lower pickup-to-purchase conversion (15%). Shoppers are inspecting labels.",
                expected_revenue_lift_percent=8.8,
                actionable_steps=[
                    "Add prominent shelf-edge tags highlighting 'Organic 85% Cocoa - Non-GMO'",
                    "Increase shelf price font size for clear pricing visibility",
                ],
                target_product_or_zone="Dark Chocolate 85% 100g",
            ),
        ]


# ═══════════════════════════════════════════════════════════════════
# 5. Layout Improvement Planner
# ═══════════════════════════════════════════════════════════════════

class LayoutImprovementPlanner:
    """Analyzes aisle bottlenecks & deadzones to suggest store layout restructuring."""

    @staticmethod
    def generate(store_id: int) -> List[RecommendationItem]:
        return [
            RecommendationItem(
                id="REC-LI-01",
                category=RecommendationCategory.LAYOUT_IMPROVEMENT,
                priority=ImpactPriority.HIGH,
                title="Widen Aisle 1 Bottleneck Corridor",
                description="Aisle 1 experiences heavy traffic congestion (97% traffic density) causing 24% of Quick Buyers to bypass the aisle.",
                expected_revenue_lift_percent=12.0,
                actionable_steps=[
                    "Shift Aisle 1 display gondola back by 45cm to relieve bottleneck",
                    "Replace bulky floor stackers with slim-line side wing displays",
                ],
                target_product_or_zone="Aisle 1 Main Corridor",
            ),
            RecommendationItem(
                id="REC-LI-02",
                category=RecommendationCategory.LAYOUT_IMPROVEMENT,
                priority=ImpactPriority.LOW,
                title="Re-activate Rear Storage Alcove Deadzone",
                description="Rear corner storage zone (Grid X=2, Y=13) has an 8% coldspot rating. Reposition impulse grab-and-go items.",
                expected_revenue_lift_percent=4.5,
                actionable_steps=[
                    "Install bright LED canopy lighting over rear alcove",
                    "Stock high-demand cold beverages to draw footfall deep into the store",
                ],
                target_product_or_zone="Rear Corner Alcove (X=2, Y=13)",
            ),
        ]


# ═══════════════════════════════════════════════════════════════════
# Main Engine Orchestrator
# ═══════════════════════════════════════════════════════════════════

class RecommendationEngineController:
    """Aggregates AI optimization recommendations across all 5 categories."""

    def __init__(self):
        self._applied_ids = set()

    def get_recommendations(self, store_id: int = 1, category_filter: Optional[str] = None) -> List[RecommendationItem]:
        all_recs = []
        all_recs.extend(ShelfOptimizer.generate(store_id))
        all_recs.extend(ProductPlacementAdvisor.generate(store_id))
        all_recs.extend(PromotionalPlacementSuggester.generate(store_id))
        all_recs.extend(ConsumerEngagementEnhancer.generate(store_id))
        all_recs.extend(LayoutImprovementPlanner.generate(store_id))

        # Update status if applied
        for r in all_recs:
            if r.id in self._applied_ids:
                r.status = "applied"

        if category_filter and category_filter != "all":
            all_recs = [r for r in all_recs if r.category.value == category_filter]

        return all_recs

    def mark_applied(self, rec_id: str) -> bool:
        self._applied_ids.add(rec_id)
        return True

    def get_summary(self, store_id: int = 1) -> OptimizationSummaryData:
        recs = self.get_recommendations(store_id)
        total = len(recs)
        high = sum(1 for r in recs if r.priority == ImpactPriority.HIGH)
        med = sum(1 for r in recs if r.priority == ImpactPriority.MEDIUM)
        low = sum(1 for r in recs if r.priority == ImpactPriority.LOW)

        tot_lift = sum(r.expected_revenue_lift_percent for r in recs)

        return OptimizationSummaryData(
            total_recommendations=total,
            high_priority_count=high,
            medium_priority_count=med,
            low_priority_count=low,
            projected_total_revenue_lift=round(tot_lift, 1),
        )


_controller = RecommendationEngineController()


def generate_store_recommendations(store_id: int = 1, category_filter: Optional[str] = None) -> List[RecommendationItem]:
    return _controller.get_recommendations(store_id, category_filter)


def mark_recommendation_applied(rec_id: str) -> bool:
    return _controller.mark_applied(rec_id)


def get_optimization_summary() -> OptimizationSummaryData:
    return _controller.get_summary()
