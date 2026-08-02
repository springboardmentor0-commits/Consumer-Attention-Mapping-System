"""
Consumer Behavior Intelligence API Router
==========================================
Endpoints for running consumer behavior analysis and fetching segment & journey metrics.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime
from typing import List, Optional, Dict, Any

from ..database import get_db
from .. import models, schemas
from . import behavior_engine
from .behavior_models import ConsumerSegmentType


router = APIRouter(prefix="/behavior", tags=["Consumer Behavior Intelligence"])


# ------------------------------------------------------------------
# POST /behavior/analyze/{shopper_id} — Run behavior analysis
# ------------------------------------------------------------------

@router.post("/analyze/{shopper_id}")
def analyze_shopper(
    shopper_id: int,
    store_id: int = 1,
    categories: List[str] = Query(default=["Dairy", "Bakery"]),
    brand: str = "Organic Life",
    compared_count: int = 0,
    purchased: bool = True,
    db: Session = Depends(get_db),
):
    """
    Run the Consumer Behavior Intelligence Engine on a shopper's trajectory and interaction log.
    """
    # Demo trajectory points (x, y, timestamp_ms)
    now = datetime.utcnow().timestamp() * 1000.0
    demo_points = [
        (2.0, 3.0, now - 120000),
        (5.0, 8.0, now - 90000),
        (12.0, 15.0, now - 60000),
        (25.0, 28.0, now),
    ]

    brand_hits = {brand: 3, "Generic": 1}

    profile = behavior_engine.analyze_consumer_behavior(
        shopper_id=shopper_id,
        points=demo_points,
        categories_visited=categories,
        brand_hits=brand_hits,
        compared_count=compared_count,
        purchased=purchased,
    )

    # Persist to database
    db_profile = models.ConsumerProfile(
        timestamp=datetime.utcnow(),
        store_id=store_id,
        shopper_id=shopper_id,
        segment=profile.segment.value,
        confidence=profile.confidence,
        avg_velocity_m_s=profile.movement.avg_velocity_m_s,
        total_dwell_ms=profile.pattern.avg_dwell_time_ms,
        brand_affinity=profile.preference.brand_affinity,
        journey_path=profile.journey.touchpoints_visited,
    )
    db.add(db_profile)
    db.commit()
    db.refresh(db_profile)

    return {
        "shopper_id": shopper_id,
        "segment": profile.segment.value,
        "confidence": profile.confidence,
        "pattern": {
            "dwell_time_ms": profile.pattern.avg_dwell_time_ms,
            "categories_visited": profile.pattern.categories_visited,
            "shopping_pace": profile.pattern.shopping_pace_score,
            "label": profile.pattern.pattern_label,
        },
        "preference": {
            "brand_affinity": profile.preference.brand_affinity,
            "top_category": profile.preference.top_category,
            "brand_loyalty_score": profile.preference.brand_loyalty_score,
        },
        "movement": {
            "path_length_m": profile.movement.path_length_m,
            "avg_velocity_m_s": profile.movement.avg_velocity_m_s,
            "backtrack_count": profile.movement.backtrack_count,
        },
        "journey": {
            "entry_zone": profile.journey.entry_zone,
            "touchpoints": profile.journey.touchpoints_visited,
            "converted": profile.journey.checkout_converted,
        },
    }


# ------------------------------------------------------------------
# GET /behavior/segments/{store_id} — Store segment breakdown
# ------------------------------------------------------------------

@router.get("/segments/{store_id}")
def get_store_segments(
    store_id: int,
    db: Session = Depends(get_db),
):
    """Retrieve consumer segment distribution for a given store."""
    profiles = (
        db.query(models.ConsumerProfile)
        .filter(models.ConsumerProfile.store_id == store_id)
        .all()
    )

    total = len(profiles)
    counts = {
        "explorers": sum(1 for p in profiles if p.segment == "explorers"),
        "quick_buyers": sum(1 for p in profiles if p.segment == "quick_buyers"),
        "comparison_shoppers": sum(1 for p in profiles if p.segment == "comparison_shoppers"),
        "impulse_buyers": sum(1 for p in profiles if p.segment == "impulse_buyers"),
        "brand_loyal": sum(1 for p in profiles if p.segment == "brand_loyal"),
    }

    return {
        "store_id": store_id,
        "total_shoppers": total,
        "segment_counts": counts,
        "percentages": {
            k: round((v / max(1, total)) * 100.0, 1) for k, v in counts.items()
        },
    }


# ------------------------------------------------------------------
# GET /behavior/journey/{store_id} — Journey analytics
# ------------------------------------------------------------------

@router.get("/journey/{store_id}")
def get_journey_analytics(
    store_id: int,
    db: Session = Depends(get_db),
):
    """Retrieve journey analytics and funnel metrics for a store."""
    profiles = (
        db.query(models.ConsumerProfile)
        .filter(models.ConsumerProfile.store_id == store_id)
        .all()
    )

    avg_dwell = sum(p.total_dwell_ms for p in profiles) / max(1, len(profiles))
    avg_velocity = sum(p.avg_velocity_m_s for p in profiles) / max(1, len(profiles))

    return {
        "store_id": store_id,
        "shoppers_tracked": len(profiles),
        "avg_dwell_time_ms": round(avg_dwell, 1),
        "avg_velocity_m_s": round(avg_velocity, 2),
        "funnel": {
            "entered": len(profiles),
            "engaged": int(len(profiles) * 0.8),
            "checkout_converted": int(len(profiles) * 0.55),
        },
    }


# ------------------------------------------------------------------
# GET /behavior/summary — System-wide summary
# ------------------------------------------------------------------

@router.get("/summary", response_model=schemas.BehaviorSummary)
def get_behavior_summary(db: Session = Depends(get_db)):
    """System-wide summary of consumer segments and behavior metrics."""
    data = behavior_engine.get_behavior_summary()
    return schemas.BehaviorSummary(
        total_shoppers_analyzed=data.total_shoppers_analyzed,
        total_explorers=data.total_explorers,
        total_quick_buyers=data.total_quick_buyers,
        total_comparison_shoppers=data.total_comparison_shoppers,
        total_impulse_buyers=data.total_impulse_buyers,
        total_brand_loyal=data.total_brand_loyal,
        avg_journey_duration_ms=data.avg_journey_duration_ms,
        overall_conversion_rate=data.overall_conversion_rate,
    )
