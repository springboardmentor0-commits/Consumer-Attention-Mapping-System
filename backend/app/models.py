from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship

from .database import Base
from sqlalchemy import JSON, DateTime
from datetime import datetime


# ------------------ ROLE ------------------

class Role(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, index=True)
    role_name = Column(String(100), unique=True, nullable=False)

    users = relationship("User", back_populates="role")


# ------------------ USER ------------------

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    email = Column(String(100), unique=True, nullable=False)

    password = Column(String(255), nullable=False)

    role_id = Column(Integer, ForeignKey("roles.id"))

    role = relationship("Role", back_populates="users")


# ------------------ STORE ------------------

class Store(Base):
    __tablename__ = "stores"

    id = Column(Integer, primary_key=True, index=True)

    store_name = Column(String(100), nullable=False)

    location = Column(String(150), nullable=False)

    shelves = relationship("Shelf", back_populates="store")


# ------------------ SHELF ------------------

class Shelf(Base):
    __tablename__ = "shelves"

    id = Column(Integer, primary_key=True, index=True)

    zone_name = Column(String(100), nullable=False)

    store_id = Column(Integer, ForeignKey("stores.id"))

    store = relationship("Store", back_populates="shelves")

# ---------------------------------------------------
# Detection and Tracking ORM models
# ---------------------------------------------------

class Detection(Base):
    __tablename__ = "detections"
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    store_id = Column(Integer, ForeignKey("stores.id"))
    shelf_id = Column(Integer, ForeignKey("shelves.id"), nullable=True)
    bbox = Column(JSON)  # [x1, y1, x2, y2]
    confidence = Column(Integer)
    shopper_id = Column(Integer, nullable=True)  # Assigned by tracking algorithm
    store = relationship("Store", backref="detections")
    shelf = relationship("Shelf", backref="detections")

class Session(Base):
    __tablename__ = "sessions"
    id = Column(Integer, primary_key=True, index=True)
    start_time = Column(DateTime, default=datetime.utcnow)
    end_time = Column(DateTime, nullable=True)
    store_id = Column(Integer, ForeignKey("stores.id"))
    total_shoppers = Column(Integer, default=0)
    path_data = Column(JSON)  # List of shopper paths
    store = relationship("Store", backref="sessions")

class Zone(Base):
    __tablename__ = "zones"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    polygon = Column(JSON)  # Coordinates defining zone area
    store_id = Column(Integer, ForeignKey("stores.id"))
    store = relationship("Store", backref="zones")

class TrafficStat(Base):
    __tablename__ = "traffic_stats"
    id = Column(Integer, primary_key=True, index=True)
    zone_id = Column(Integer, ForeignKey("zones.id"))
    timestamp = Column(DateTime, default=datetime.utcnow)
    count = Column(Integer, default=0)
    zone = relationship("Zone", backref="traffic_stats")


# ---------------------------------------------------
# Attention Analysis ORM models
# ---------------------------------------------------

from sqlalchemy.orm import relationship, synonym

class AttentionEvent(Base):
    """Individual attention observation from the analysis engine."""
    __tablename__ = "attention_events"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    store_id = Column(Integer, ForeignKey("stores.id"))
    shelf_id = Column(Integer, ForeignKey("shelves.id"), nullable=True)
    product_zone = Column(String(100), nullable=True)
    event_type = Column(String(50))   # gaze_fixation | head_turn | product_focus | repeated_attention
    gaze_yaw = Column(Float, nullable=True)
    gaze_pitch = Column(Float, nullable=True)
    head_roll = Column(Float, nullable=True)
    head_pitch = Column(Float, nullable=True)
    head_yaw = Column(Float, nullable=True)
    duration_ms = Column("duration", Integer, default=0)
    duration = synonym("duration_ms")
    engagement = Column(String(20), nullable=True)   # scanning | browsing | focused
    shopper_id = Column(Integer, nullable=True)

    store = relationship("Store", backref="attention_events")
    shelf = relationship("Shelf", backref="attention_events")



class AttentionMetricRecord(Base):
    """Aggregated attention metrics per store / shelf / product zone."""
    __tablename__ = "attention_metrics"

    id = Column(Integer, primary_key=True, index=True)
    store_id = Column(Integer, ForeignKey("stores.id"))
    shelf_id = Column(Integer, ForeignKey("shelves.id"), nullable=True)
    product_zone = Column(String(100), nullable=True)
    dwell_time_ms = Column(Integer, default=0)
    view_duration_ms = Column(Integer, default=0)
    shelf_attention_time_ms = Column(Integer, default=0)
    product_focus_ms = Column(Integer, default=0)
    repeated_attention_count = Column(Integer, default=0)
    computed_at = Column(DateTime, default=datetime.utcnow)

    store = relationship("Store", backref="attention_metrics")
    shelf = relationship("Shelf", backref="attention_metrics")


# ---------------------------------------------------
# Product Interaction Analysis ORM models
# ---------------------------------------------------

class ProductInteraction(Base):
    """Product interaction event observations (view, pickup, return, purchase, compare)."""
    __tablename__ = "product_interactions"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    store_id = Column(Integer, ForeignKey("stores.id"))
    shelf_id = Column(Integer, ForeignKey("shelves.id"), nullable=True)
    product_name = Column(String(150), nullable=True)
    interaction_type = Column(String(50), nullable=False)  # product_viewed | product_picked_up | product_returned | product_purchased | product_compared
    duration_ms = Column("duration", Integer, default=0)
    duration = synonym("duration_ms")
    confidence = Column(Float, default=0.0)
    shopper_id = Column(Integer, nullable=True)
    compared_with = Column(String(150), nullable=True)

    store = relationship("Store", backref="product_interactions")
    shelf = relationship("Shelf", backref="product_interactions")


# ---------------------------------------------------
# Consumer Behavior Intelligence ORM models
# ---------------------------------------------------

class ConsumerProfile(Base):
    """Behavior intelligence profiles & segmentation classifications."""
    __tablename__ = "consumer_profiles"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    store_id = Column(Integer, ForeignKey("stores.id"))
    shopper_id = Column(Integer, index=True)
    segment = Column(String(50), nullable=False)  # explorers | quick_buyers | comparison_shoppers | impulse_buyers | brand_loyal
    confidence = Column(Float, default=0.0)
    avg_velocity_m_s = Column(Float, default=0.0)
    total_dwell_ms = Column(Integer, default=0)
    brand_affinity = Column(String(100), nullable=True)
    journey_path = Column(JSON, nullable=True)

    store = relationship("Store", backref="consumer_profiles")


# ---------------------------------------------------
# Attention Heatmap Generation ORM models
# ---------------------------------------------------

class HeatmapRecord(Base):
    """Generated spatial heatmap grids and hotspot analysis records."""
    __tablename__ = "heatmap_records"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    store_id = Column(Integer, ForeignKey("stores.id"))
    shelf_id = Column(Integer, ForeignKey("shelves.id"), nullable=True)
    heatmap_type = Column(String(50), nullable=False)  # store_heatmap | shelf_heatmap | product_attention_heatmap | customer_traffic_heatmap | engagement_hotspot
    resolution_w = Column(Integer, default=20)
    resolution_h = Column(Integer, default=15)
    grid_data = Column(JSON, nullable=False)  # 2D matrix
    hotspots = Column(JSON, nullable=True)

    store = relationship("Store", backref="heatmap_records")
    shelf = relationship("Shelf", backref="heatmap_records")


# ---------------------------------------------------
# Product Attractiveness Scoring ORM models
# ---------------------------------------------------

class ProductScoreRecord(Base):
    """Calculated product attractiveness scores & weighted sub-score components."""
    __tablename__ = "product_score_records"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    store_id = Column(Integer, ForeignKey("stores.id"))
    product_name = Column(String(150), nullable=False)
    attractiveness_score = Column(Float, default=0.0)
    tier_grade = Column(String(10), default="B")
    visibility_score = Column(Float, default=0.0)
    engagement_score = Column(Float, default=0.0)
    conversion_potential_score = Column(Float, default=0.0)
    marketing_effectiveness_score = Column(Float, default=0.0)
    score_breakdown = Column(JSON, nullable=False)

    store = relationship("Store", backref="product_score_records")


# ---------------------------------------------------
# Recommendation & Optimization Engine ORM models
# ---------------------------------------------------

class OptimizationRecommendation(Base):
    """AI recommendations for shelf, placement, promo, engagement, and layout optimization."""
    __tablename__ = "optimization_recommendations"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    store_id = Column(Integer, ForeignKey("stores.id"))
    category = Column(String(50), nullable=False)  # shelf_optimization | product_placement | promotional_placement | consumer_engagement | layout_improvement
    priority = Column(String(20), default="MEDIUM")  # HIGH | MEDIUM | LOW
    title = Column(String(150), nullable=False)
    description = Column(String(500), nullable=False)
    expected_revenue_lift = Column(Float, default=0.0)
    action_steps = Column(JSON, nullable=False)
    status = Column(String(20), default="pending")  # pending | applied | dismissed

    store = relationship("Store", backref="optimization_recommendations")



