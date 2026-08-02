"""
Internal data structures and Weighted Scoring Model for Product Attractiveness Scoring Engine.
"""

from dataclasses import dataclass, field
from typing import Optional, List, Dict, Any


@dataclass
class ScoringWeights:
    """
    Weighted Scoring Model Coefficients:
    - Attention Duration: 35%
    - Product Interaction Frequency: 25%
    - Product Pickup Rate: 20%
    - Purchase Conversion Rate: 15%
    - Repeat Engagement Rate: 5%
    """
    attention_duration: float = 0.35
    interaction_frequency: float = 0.25
    pickup_rate: float = 0.20
    purchase_conversion: float = 0.15
    repeat_engagement: float = 0.05

    def validate(self) -> bool:
        total = self.attention_duration + self.interaction_frequency + self.pickup_rate + self.purchase_conversion + self.repeat_engagement
        return abs(total - 1.0) < 1e-4


@dataclass
class SubScores:
    """Sub-component scores normalized to 0-100 scale."""
    attention_duration_score: float = 0.0      # 35% weight
    interaction_frequency_score: float = 0.0   # 25% weight
    pickup_rate_score: float = 0.0             # 20% weight
    purchase_conversion_score: float = 0.0     # 15% weight
    repeat_engagement_score: float = 0.0       # 5% weight


@dataclass
class ProductAttractivenessResult:
    """Complete scoring breakdown for a single product."""
    product_id: str
    product_name: str
    total_attractiveness_score: float = 0.0  # 0 to 100
    tier_grade: str = "B"                     # A+, A, B, C, D
    sub_scores: SubScores = field(default_factory=SubScores)
    shelf_visibility_score: float = 0.0      # 0 to 100
    engagement_score: float = 0.0            # 0 to 100
    conversion_potential_score: float = 0.0  # 0 to 100
    marketing_effectiveness_score: float = 0.0  # 0 to 100


@dataclass
class ScoringSummaryData:
    """System-wide summary of product attractiveness scores."""
    total_products_scored: int = 0
    avg_attractiveness_score: float = 0.0
    avg_visibility_score: float = 0.0
    avg_engagement_score: float = 0.0
    avg_conversion_potential: float = 0.0
    avg_marketing_effectiveness: float = 0.0
    top_product_name: str = "None"
    top_product_score: float = 0.0
