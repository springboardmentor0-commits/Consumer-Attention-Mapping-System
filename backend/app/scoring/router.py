"""
Product Attractiveness Scoring API Router
===========================================
Endpoints for fetching product attractiveness scores, sub-score breakdowns, and shelf visibility ratings.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime
from typing import List, Optional

from ..database import get_db
from .. import models, schemas
from . import scoring_engine
from .scoring_models import ScoringWeights


router = APIRouter(prefix="/scoring", tags=["Product Attractiveness Scoring"])


# ------------------------------------------------------------------
# GET /scoring/products/{store_id} — All product scores
# ------------------------------------------------------------------

@router.get("/products/{store_id}")
def get_store_product_scores(
    store_id: int,
    db: Session = Depends(get_db),
):
    """
    Retrieve ranked Product Attractiveness Scores for all products in a store.
    """
    results = scoring_engine.calculate_store_product_scores(store_id)

    # Persist top scores to DB
    for res in results:
        db_rec = models.ProductScoreRecord(
            timestamp=datetime.utcnow(),
            store_id=store_id,
            product_name=res.product_name,
            attractiveness_score=res.total_attractiveness_score,
            tier_grade=res.tier_grade,
            visibility_score=res.shelf_visibility_score,
            engagement_score=res.engagement_score,
            conversion_potential_score=res.conversion_potential_score,
            marketing_effectiveness_score=res.marketing_effectiveness_score,
            score_breakdown={
                "attention_duration_35%": res.sub_scores.attention_duration_score,
                "interaction_frequency_25%": res.sub_scores.interaction_frequency_score,
                "pickup_rate_20%": res.sub_scores.pickup_rate_score,
                "purchase_conversion_15%": res.sub_scores.purchase_conversion_score,
                "repeat_engagement_5%": res.sub_scores.repeat_engagement_score,
            },
        )
        db.add(db_rec)
    db.commit()

    return {
        "store_id": store_id,
        "scoring_model_weights": {
            "attention_duration": "35%",
            "interaction_frequency": "25%",
            "pickup_rate": "20%",
            "purchase_conversion": "15%",
            "repeat_engagement": "5%",
        },
        "total_products": len(results),
        "products": [
            {
                "product_id": r.product_id,
                "product_name": r.product_name,
                "attractiveness_score": r.total_attractiveness_score,
                "tier_grade": r.tier_grade,
                "sub_scores": {
                    "attention_duration": r.sub_scores.attention_duration_score,
                    "interaction_frequency": r.sub_scores.interaction_frequency_score,
                    "pickup_rate": r.sub_scores.pickup_rate_score,
                    "purchase_conversion": r.sub_scores.purchase_conversion_score,
                    "repeat_engagement": r.sub_scores.repeat_engagement_score,
                },
                "shelf_visibility_score": r.shelf_visibility_score,
                "engagement_score": r.engagement_score,
                "conversion_potential_score": r.conversion_potential_score,
                "marketing_effectiveness_score": r.marketing_effectiveness_score,
            }
            for r in results
        ],
    }


# ------------------------------------------------------------------
# GET /scoring/product/{store_id}/{product_id} — Single product detail
# ------------------------------------------------------------------

@router.get("/product/{store_id}/{product_id}")
def get_product_score_detail(
    store_id: int,
    product_id: str,
    db: Session = Depends(get_db),
):
    """Retrieve detailed score breakdown for a specific product."""
    all_scores = scoring_engine.calculate_store_product_scores(store_id)
    matched = next((p for p in all_scores if p.product_id == product_id), None)

    if not matched:
        raise HTTPException(status_code=404, detail="Product score not found")

    return {
        "store_id": store_id,
        "product": {
            "product_id": matched.product_id,
            "product_name": matched.product_name,
            "total_attractiveness_score": matched.total_attractiveness_score,
            "tier_grade": matched.tier_grade,
            "sub_scores": matched.sub_scores,
            "shelf_visibility_score": matched.shelf_visibility_score,
            "engagement_score": matched.engagement_score,
            "conversion_potential_score": matched.conversion_potential_score,
            "marketing_effectiveness_score": matched.marketing_effectiveness_score,
        },
    }


# ------------------------------------------------------------------
# GET /scoring/shelves/{store_id} — Shelf visibility ratings
# ------------------------------------------------------------------

@router.get("/shelves/{store_id}")
def get_shelf_visibility_scores(
    store_id: int,
    db: Session = Depends(get_db),
):
    """Retrieve shelf visibility ratings for a store."""
    all_scores = scoring_engine.calculate_store_product_scores(store_id)
    return {
        "store_id": store_id,
        "average_visibility_score": round(sum(p.shelf_visibility_score for p in all_scores) / max(1, len(all_scores)), 1),
        "shelves": [
            {"product_name": p.product_name, "visibility_score": p.shelf_visibility_score}
            for p in all_scores
        ],
    }


# ------------------------------------------------------------------
# GET /scoring/summary — System-wide summary
# ------------------------------------------------------------------

@router.get("/summary", response_model=schemas.ScoringSummary)
def get_scoring_summary(db: Session = Depends(get_db)):
    """System-wide summary of product scoring engine."""
    data = scoring_engine.get_scoring_summary()
    return schemas.ScoringSummary(
        total_products_scored=data.total_products_scored,
        avg_attractiveness_score=data.avg_attractiveness_score,
        avg_visibility_score=data.avg_visibility_score,
        avg_engagement_score=data.avg_engagement_score,
        avg_conversion_potential=data.avg_conversion_potential,
        avg_marketing_effectiveness=data.avg_marketing_effectiveness,
        top_product_name=data.top_product_name,
        top_product_score=data.top_product_score,
    )
