from pydantic import BaseModel


# ---------------- ROLE ----------------

class RoleBase(BaseModel):
    role_name: str


class Role(RoleBase):
    id: int

    class Config:
        from_attributes = True


# ---------------- REGISTER ----------------

class UserCreate(BaseModel):
    email: str
    password: str
    role_id: int


# ---------------- LOGIN ----------------

class UserLogin(BaseModel):
    email: str
    password: str


# ---------------- RESPONSE ----------------

class User(BaseModel):
    id: int
    email: str
    role_id: int

    class Config:
        from_attributes = True


# ---------------- JWT ----------------

class Token(BaseModel):
    access_token: str
    token_type: str


# ---------------- STORE ----------------

class StoreCreate(BaseModel):
    store_name: str
    location: str


class Store(BaseModel):
    id: int
    store_name: str
    location: str

    class Config:
        from_attributes = True


# ---------------- SHELF ----------------

class ShelfCreate(BaseModel):
    zone_name: str
    store_id: int


class Shelf(BaseModel):
    id: int
    zone_name: str
    store_id: int

    class Config:
        from_attributes = True

# ---------------------------------------------------
# Detection and Tracking Schemas
# ---------------------------------------------------
from typing import List, Optional, Any
from datetime import datetime

class DetectionBase(BaseModel):
    store_id: int
    shelf_id: Optional[int] = None
    bbox: List[int]
    confidence: float
    shopper_id: Optional[int] = None

class DetectionCreate(DetectionBase):
    pass

class Detection(DetectionBase):
    id: int
    timestamp: datetime

    class Config:
        from_attributes = True

class SessionBase(BaseModel):
    store_id: int
    start_time: datetime
    end_time: Optional[datetime] = None
    total_shoppers: int
    path_data: Optional[Any] = None

class SessionCreate(SessionBase):
    pass

class Session(SessionBase):
    id: int

    class Config:
        from_attributes = True

class ZoneBase(BaseModel):
    name: str
    polygon: List[Any]
    store_id: int

class ZoneCreate(ZoneBase):
    pass

class Zone(ZoneBase):
    id: int

    class Config:
        from_attributes = True

class TrafficStatBase(BaseModel):
    zone_id: int
    count: int
    timestamp: datetime

class TrafficStatCreate(TrafficStatBase):
    pass

class TrafficStat(TrafficStatBase):
    id: int

    class Config:
        from_attributes = True


# ---------------------------------------------------
# Attention Analysis Schemas
# ---------------------------------------------------

class AttentionEventBase(BaseModel):
    store_id: int
    shelf_id: Optional[int] = None
    product_zone: Optional[str] = None
    event_type: str = "gaze_fixation"
    gaze_yaw: Optional[float] = None
    gaze_pitch: Optional[float] = None
    head_roll: Optional[float] = None
    head_pitch: Optional[float] = None
    head_yaw: Optional[float] = None
    duration_ms: int = 0
    engagement: Optional[str] = None
    shopper_id: Optional[int] = None

class AttentionEventCreate(AttentionEventBase):
    pass

class AttentionEventResponse(AttentionEventBase):
    id: int
    timestamp: datetime

    class Config:
        from_attributes = True

class AttentionMetricBase(BaseModel):
    store_id: int
    shelf_id: Optional[int] = None
    product_zone: Optional[str] = None
    dwell_time_ms: int = 0
    view_duration_ms: int = 0
    shelf_attention_time_ms: int = 0
    product_focus_ms: int = 0
    repeated_attention_count: int = 0

class AttentionMetricResponse(AttentionMetricBase):
    id: int
    computed_at: datetime

    class Config:
        from_attributes = True

class AttentionSummary(BaseModel):
    """System-wide aggregation of attention metrics."""
    total_events: int = 0
    total_dwell_time_ms: int = 0
    total_view_duration_ms: int = 0
    total_shelf_attention_time_ms: int = 0
    total_product_focus_ms: int = 0
    total_repeated_attention_events: int = 0
    avg_dwell_time_ms: float = 0.0
    avg_view_duration_ms: float = 0.0
    stores_analyzed: int = 0
    shelves_analyzed: int = 0


# ---------------------------------------------------
# Product Interaction Schemas
# ---------------------------------------------------

class ProductInteractionBase(BaseModel):
    store_id: int
    shelf_id: Optional[int] = None
    product_name: Optional[str] = None
    interaction_type: str  # product_viewed | product_picked_up | product_returned | product_purchased | product_compared
    duration_ms: int = 0
    confidence: float = 0.0
    shopper_id: Optional[int] = None
    compared_with: Optional[str] = None

class ProductInteractionCreate(ProductInteractionBase):
    pass

class ProductInteractionResponse(ProductInteractionBase):
    id: int
    timestamp: datetime

    class Config:
        from_attributes = True

class InteractionSummary(BaseModel):
    """System-wide summary of product interaction events."""
    total_interactions: int = 0
    total_viewed: int = 0
    total_picked_up: int = 0
    total_returned: int = 0
    total_purchased: int = 0
    total_compared: int = 0
    conversion_rate: float = 0.0
    return_rate: float = 0.0


# ---------------------------------------------------
# Consumer Behavior Intelligence Schemas
# ---------------------------------------------------

class ConsumerProfileBase(BaseModel):
    store_id: int
    shopper_id: int
    segment: str  # explorers | quick_buyers | comparison_shoppers | impulse_buyers | brand_loyal
    confidence: float = 0.0
    avg_velocity_m_s: float = 0.0
    total_dwell_ms: int = 0
    brand_affinity: Optional[str] = None
    journey_path: Optional[Any] = None

class ConsumerProfileCreate(ConsumerProfileBase):
    pass

class ConsumerProfileResponse(ConsumerProfileBase):
    id: int
    timestamp: datetime

    class Config:
        from_attributes = True

class BehaviorSummary(BaseModel):
    """System-wide summary of consumer segments and behavior metrics."""
    total_shoppers_analyzed: int = 0
    total_explorers: int = 0
    total_quick_buyers: int = 0
    total_comparison_shoppers: int = 0
    total_impulse_buyers: int = 0
    total_brand_loyal: int = 0
    avg_journey_duration_ms: float = 0.0
    overall_conversion_rate: float = 0.0


# ---------------------------------------------------
# Attention Heatmap Generation Schemas
# ---------------------------------------------------

class HeatmapRecordBase(BaseModel):
    store_id: int
    shelf_id: Optional[int] = None
    heatmap_type: str  # store_heatmap | shelf_heatmap | product_attention_heatmap | customer_traffic_heatmap | engagement_hotspot
    resolution_w: int = 20
    resolution_h: int = 15
    grid_data: Any
    hotspots: Optional[Any] = None

class HeatmapRecordCreate(HeatmapRecordBase):
    pass

class HeatmapRecordResponse(HeatmapRecordBase):
    id: int
    timestamp: datetime

    class Config:
        from_attributes = True

class HeatmapSummary(BaseModel):
    """System-wide summary of generated heatmaps."""
    total_heatmaps_generated: int = 0
    total_hotspots_detected: int = 0
    total_coldspots_detected: int = 0
    active_stores: int = 0
    active_shelves: int = 0


# ---------------------------------------------------
# Product Attractiveness Scoring Schemas
# ---------------------------------------------------

class ProductScoreRecordBase(BaseModel):
    store_id: int
    product_name: str
    attractiveness_score: float = 0.0
    tier_grade: str = "B"
    visibility_score: float = 0.0
    engagement_score: float = 0.0
    conversion_potential_score: float = 0.0
    marketing_effectiveness_score: float = 0.0
    score_breakdown: Any

class ProductScoreRecordCreate(ProductScoreRecordBase):
    pass

class ProductScoreRecordResponse(ProductScoreRecordBase):
    id: int
    timestamp: datetime

    class Config:
        from_attributes = True

class ScoringSummary(BaseModel):
    """System-wide summary of product scoring engine."""
    total_products_scored: int = 0
    avg_attractiveness_score: float = 0.0
    avg_visibility_score: float = 0.0
    avg_engagement_score: float = 0.0
    avg_conversion_potential: float = 0.0
    avg_marketing_effectiveness: float = 0.0
    top_product_name: str = "None"
    top_product_score: float = 0.0


# ---------------------------------------------------
# Recommendation & Optimization Schemas
# ---------------------------------------------------

class OptimizationRecommendationBase(BaseModel):
    store_id: int
    category: str  # shelf_optimization | product_placement | promotional_placement | consumer_engagement | layout_improvement
    priority: str = "MEDIUM"
    title: str
    description: str
    expected_revenue_lift: float = 0.0
    action_steps: List[str]
    status: str = "pending"

class OptimizationRecommendationCreate(OptimizationRecommendationBase):
    pass

class OptimizationRecommendationResponse(OptimizationRecommendationBase):
    id: int
    timestamp: datetime

    class Config:
        from_attributes = True

class OptimizationSummary(BaseModel):
    """System-wide summary of optimization recommendations."""
    total_recommendations: int = 0
    high_priority_count: int = 0
    medium_priority_count: int = 0
    low_priority_count: int = 0
    projected_total_revenue_lift: float = 0.0



