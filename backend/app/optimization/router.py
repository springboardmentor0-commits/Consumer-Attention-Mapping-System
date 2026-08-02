"""
Recommendation & Optimization API Router
==========================================
Endpoints for fetching AI recommendations, filtering by category, and applying optimization actions.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime
from typing import List, Optional

from ..database import get_db
from .. import models, schemas
from . import optimization_engine
from .optimization_models import RecommendationCategory


router = APIRouter(prefix="/optimization", tags=["Recommendation & Optimization"])


# ------------------------------------------------------------------
# GET /optimization/recommendations/{store_id} — All recommendations
# ------------------------------------------------------------------

@router.get("/recommendations/{store_id}")
def get_store_recommendations(
    store_id: int,
    category: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """
    Generate and retrieve actionable AI optimization recommendations for a store.
    """
    recs = optimization_engine.generate_store_recommendations(store_id, category)

    # Persist to database if not present
    for r in recs:
        db_rec = models.OptimizationRecommendation(
            timestamp=datetime.utcnow(),
            store_id=store_id,
            category=r.category.value,
            priority=r.priority.value,
            title=r.title,
            description=r.description,
            expected_revenue_lift=r.expected_revenue_lift_percent,
            action_steps=r.actionable_steps,
            status=r.status,
        )
        db.add(db_rec)
    db.commit()

    return {
        "store_id": store_id,
        "category_filter": category or "all",
        "total_recommendations": len(recs),
        "recommendations": [
            {
                "id": r.id,
                "category": r.category.value,
                "priority": r.priority.value,
                "title": r.title,
                "description": r.description,
                "expected_revenue_lift_percent": r.expected_revenue_lift_percent,
                "actionable_steps": r.actionable_steps,
                "target_product_or_zone": r.target_product_or_zone,
                "status": r.status,
            }
            for r in recs
        ],
    }


# ------------------------------------------------------------------
# POST /optimization/apply/{rec_id} — Mark recommendation applied
# ------------------------------------------------------------------

@router.post("/apply/{rec_id}")
def apply_recommendation(
    rec_id: str,
    db: Session = Depends(get_db),
):
    """
    Mark an AI recommendation as implemented in store operations.
    """
    success = optimization_engine.mark_recommendation_applied(rec_id)
    return {
        "recommendation_id": rec_id,
        "status": "applied",
        "message": f"Recommendation {rec_id} marked as applied.",
    }


# ------------------------------------------------------------------
# GET /optimization/summary — System-wide ROI summary
# ------------------------------------------------------------------

@router.get("/summary", response_model=schemas.OptimizationSummary)
def get_optimization_summary(db: Session = Depends(get_db)):
    """System-wide summary of recommendations and projected revenue lift."""
    data = optimization_engine.get_optimization_summary()
    return schemas.OptimizationSummary(
        total_recommendations=data.total_recommendations,
        high_priority_count=data.high_priority_count,
        medium_priority_count=data.medium_priority_count,
        low_priority_count=data.low_priority_count,
        projected_total_revenue_lift=data.projected_total_revenue_lift,
    )
