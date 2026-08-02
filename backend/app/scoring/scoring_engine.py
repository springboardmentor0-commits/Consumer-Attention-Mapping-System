"""
Product Attractiveness Scoring Engine
======================================
Product attractiveness scoring, shelf visibility scoring, engagement scoring,
conversion potential scoring, and marketing effectiveness scoring.

Weighted Scoring Model:
  Product Attractiveness Score =
    - Attention Duration: 35%
    - Product Interaction Frequency: 25%
    - Product Pickup Rate: 20%
    - Purchase Conversion Rate: 15%
    - Repeat Engagement Rate: 5%
"""

import time
import math
from typing import List, Dict, Optional, Tuple

from .scoring_models import (
    ScoringWeights,
    SubScores,
    ProductAttractivenessResult,
    ScoringSummaryData,
)


# ═══════════════════════════════════════════════════════════════════
# 1. Product Attractiveness Scorer
# ═══════════════════════════════════════════════════════════════════

class ProductAttractivenessScorer:
    """Calculates overall score based on the 5-component weighted model."""

    WEIGHTS = ScoringWeights()  # 35%, 25%, 20%, 15%, 5%

    @classmethod
    def calculate(
        cls,
        attention_dur_ms: int,        # raw attention ms
        interaction_freq: int,        # count of hand/gaze interactions
        pickup_count: int,            # count of pickups
        purchase_count: int,          # count of purchases
        repeat_count: int,            # count of repeat visits
        view_count: int = 10,
    ) -> Tuple[float, SubScores, str]:
        """Returns (total_score_0_to_100, sub_scores, tier_grade)."""

        # Normalize sub-scores to 0-100 scale
        # 1. Attention Duration (35%): benchmark ~120,000ms (2 min) = 100
        s_att = min(100.0, (attention_dur_ms / 120000.0) * 100.0)

        # 2. Interaction Frequency (25%): benchmark ~50 interactions = 100
        s_int = min(100.0, (interaction_freq / 50.0) * 100.0)

        # 3. Pickup Rate (20%): (pickups / max(1, views)) * 100
        s_pick = min(100.0, (pickup_count / max(1, view_count)) * 100.0)

        # 4. Purchase Conversion Rate (15%): (purchases / max(1, pickups)) * 100
        s_conv = min(100.0, (purchase_count / max(1, pickup_count)) * 100.0)

        # 5. Repeat Engagement Rate (5%): (repeats / max(1, views)) * 100
        s_rep = min(100.0, (repeat_count / max(1, view_count)) * 100.0)

        sub = SubScores(
            attention_duration_score=round(s_att, 1),
            interaction_frequency_score=round(s_int, 1),
            pickup_rate_score=round(s_pick, 1),
            purchase_conversion_score=round(s_conv, 1),
            repeat_engagement_score=round(s_rep, 1),
        )

        # Apply Weighted Model
        total = (
            cls.WEIGHTS.attention_duration * sub.attention_duration_score +
            cls.WEIGHTS.interaction_frequency * sub.interaction_frequency_score +
            cls.WEIGHTS.pickup_rate * sub.pickup_rate_score +
            cls.WEIGHTS.purchase_conversion * sub.purchase_conversion_score +
            cls.WEIGHTS.repeat_engagement * sub.repeat_engagement_score
        )

        total_score = round(total, 1)

        # Letter grade classification
        if total_score >= 90.0:
            grade = "A+"
        elif total_score >= 80.0:
            grade = "A"
        elif total_score >= 70.0:
            grade = "B"
        elif total_score >= 60.0:
            grade = "C"
        else:
            grade = "D"

        return total_score, sub, grade


# ═══════════════════════════════════════════════════════════════════
# 2. Shelf Visibility Scorer
# ═══════════════════════════════════════════════════════════════════

class ShelfVisibilityScorer:
    """Calculates visibility rating based on tier height and lighting exposure."""

    @staticmethod
    def calculate(shelf_tier: str = "Eye-Level", line_of_sight_percent: float = 85.0) -> float:
        tier_multipliers = {
            "Eye-Level": 1.25,
            "Top Tier": 1.0,
            "Middle Tier": 0.9,
            "Bottom Tier": 0.65,
        }
        mult = tier_multipliers.get(shelf_tier, 1.0)
        score = min(100.0, line_of_sight_percent * mult)
        return round(score, 1)


# ═══════════════════════════════════════════════════════════════════
# 3. Engagement Scorer
# ═══════════════════════════════════════════════════════════════════

class EngagementScorer:
    """Evaluates depth of engagement (handling vs passive gaze)."""

    @staticmethod
    def calculate(sub: SubScores) -> float:
        score = (sub.attention_duration_score * 0.4) + (sub.interaction_frequency_score * 0.6)
        return round(min(100.0, score), 1)


# ═══════════════════════════════════════════════════════════════════
# 4. Conversion Potential Scorer
# ═══════════════════════════════════════════════════════════════════

class ConversionPotentialScorer:
    """Evaluates likelihood of high-intent shoppers converting to purchase."""

    @staticmethod
    def calculate(sub: SubScores) -> float:
        score = (sub.pickup_rate_score * 0.5) + (sub.purchase_conversion_score * 0.5)
        return round(min(100.0, score), 1)


# ═══════════════════════════════════════════════════════════════════
# 5. Marketing Effectiveness Scorer
# ═══════════════════════════════════════════════════════════════════

class MarketingEffectivenessScorer:
    """Measures promotional lift and campaign performance."""

    @staticmethod
    def calculate(sub: SubScores, promo_active: bool = True) -> float:
        base = (sub.interaction_frequency_score * 0.4) + (sub.repeat_engagement_score * 0.6)
        mult = 1.2 if promo_active else 0.9
        return round(min(100.0, base * mult), 1)


# ═══════════════════════════════════════════════════════════════════
# Main Engine Controller
# ═══════════════════════════════════════════════════════════════════

class ProductScoringEngine:
    """Controller for computing and ranking product scores."""

    def __init__(self):
        self._seed_demo_products()

    def _seed_demo_products(self):
        self._demo_products = [
            {
                "id": "P001", "name": "Organic Almond Milk 1L", "shelf": "Eye-Level",
                "att_ms": 115000, "int_cnt": 48, "pick_cnt": 32, "pur_cnt": 28, "rep_cnt": 8, "views": 35,
            },
            {
                "id": "P002", "name": "Artisan Cheddar Cheese 200g", "shelf": "Eye-Level",
                "att_ms": 138000, "int_cnt": 54, "pick_cnt": 38, "pur_cnt": 31, "rep_cnt": 12, "views": 40,
            },
            {
                "id": "P003", "name": "Greek Style Yogurt 500g", "shelf": "Middle Tier",
                "att_ms": 82000, "int_cnt": 31, "pick_cnt": 22, "pur_cnt": 16, "rep_cnt": 5, "views": 30,
            },
            {
                "id": "P004", "name": "Dark Chocolate 85% 100g", "shelf": "Eye-Level",
                "att_ms": 95000, "int_cnt": 42, "pick_cnt": 30, "pur_cnt": 24, "rep_cnt": 9, "views": 32,
            },
            {
                "id": "P005", "name": "Low-Fat Cottage Cheese 250g", "shelf": "Bottom Tier",
                "att_ms": 42000, "int_cnt": 15, "pick_cnt": 8, "pur_cnt": 4, "rep_cnt": 2, "views": 25,
            },
            {
                "id": "P006", "name": "Fresh Orange Juice 1.5L", "shelf": "Top Tier",
                "att_ms": 78000, "int_cnt": 28, "pick_cnt": 18, "pur_cnt": 12, "rep_cnt": 4, "views": 28,
            },
        ]

    def score_product(self, p_data: dict) -> ProductAttractivenessResult:
        total_score, sub, grade = ProductAttractivenessScorer.calculate(
            attention_dur_ms=p_data["att_ms"],
            interaction_freq=p_data["int_cnt"],
            pickup_count=p_data["pick_cnt"],
            purchase_count=p_data["pur_cnt"],
            repeat_count=p_data["rep_cnt"],
            view_count=p_data["views"],
        )

        vis_score = ShelfVisibilityScorer.calculate(p_data["shelf"])
        eng_score = EngagementScorer.calculate(sub)
        conv_score = ConversionPotentialScorer.calculate(sub)
        mkt_score = MarketingEffectivenessScorer.calculate(sub, promo_active=True)

        return ProductAttractivenessResult(
            product_id=p_data["id"],
            product_name=p_data["name"],
            total_attractiveness_score=total_score,
            tier_grade=grade,
            sub_scores=sub,
            shelf_visibility_score=vis_score,
            engagement_score=eng_score,
            conversion_potential_score=conv_score,
            marketing_effectiveness_score=mkt_score,
        )

    def get_all_scores(self) -> List[ProductAttractivenessResult]:
        results = [self.score_product(p) for p in self._demo_products]
        results.sort(key=lambda r: r.total_attractiveness_score, reverse=True)
        return results

    def get_summary(self) -> ScoringSummaryData:
        all_scores = self.get_all_scores()
        if not all_scores:
            return ScoringSummaryData()

        total = len(all_scores)
        avg_att = sum(r.total_attractiveness_score for r in all_scores) / total
        avg_vis = sum(r.shelf_visibility_score for r in all_scores) / total
        avg_eng = sum(r.engagement_score for r in all_scores) / total
        avg_conv = sum(r.conversion_potential_score for r in all_scores) / total
        avg_mkt = sum(r.marketing_effectiveness_score for r in all_scores) / total

        top = all_scores[0]

        return ScoringSummaryData(
            total_products_scored=total,
            avg_attractiveness_score=round(avg_att, 1),
            avg_visibility_score=round(avg_vis, 1),
            avg_engagement_score=round(avg_eng, 1),
            avg_conversion_potential=round(avg_conv, 1),
            avg_marketing_effectiveness=round(avg_mkt, 1),
            top_product_name=top.product_name,
            top_product_score=top.total_attractiveness_score,
        )


_engine = ProductScoringEngine()


def calculate_store_product_scores(store_id: int = 1) -> List[ProductAttractivenessResult]:
    return _engine.get_all_scores()


def get_scoring_summary() -> ScoringSummaryData:
    return _engine.get_summary()
