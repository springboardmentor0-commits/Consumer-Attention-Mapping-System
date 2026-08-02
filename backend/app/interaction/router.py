"""
Product Interaction Analysis API Router
=========================================
Endpoints for running product interaction analysis and retrieving interaction metrics.
"""

from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime
import cv2
import numpy as np
from typing import List, Optional

from ..database import get_db
from .. import models, schemas
from . import interaction_engine
from .interaction_models import InteractionType


router = APIRouter(prefix="/interaction", tags=["Product Interaction Analysis"])


# ------------------------------------------------------------------
# POST /interaction/analyze — Process a frame for interaction events
# ------------------------------------------------------------------

@router.post("/analyze")
async def analyze_interaction_frame(
    store_id: int,
    shelf_id: Optional[int] = None,
    image: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """
    Upload a frame to detect product interaction events (viewed, picked up, returned, compared).
    """
    contents = await image.read()
    nparr = np.frombuffer(contents, np.uint8)
    frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if frame is None:
        raise HTTPException(status_code=400, detail="Invalid image file")

    # Demo hand boxes across frame for testing
    h, w = frame.shape[:2]
    demo_hand_boxes = [
        (int(w * 0.15), int(h * 0.25), int(w * 0.32), int(h * 0.55)),
    ]

    events = interaction_engine.process_interaction_frame(
        frame=frame,
        hand_boxes=demo_hand_boxes,
    )

    saved_events = []
    for evt in events:
        db_evt = models.ProductInteraction(
            timestamp=datetime.utcnow(),
            store_id=store_id,
            shelf_id=shelf_id or evt.shelf_id,
            product_name=evt.product_name,
            interaction_type=evt.interaction_type.value,
            duration_ms=evt.duration_ms,
            confidence=evt.confidence,
            shopper_id=evt.shopper_id,
            compared_with=evt.compared_with,
        )
        db.add(db_evt)
        db.flush()
        saved_events.append(db_evt.id)

    db.commit()

    return {
        "events_detected": len(events),
        "events_saved": len(saved_events),
        "events": [
            {
                "id": se,
                "interaction_type": e.interaction_type.value,
                "product_name": e.product_name,
                "duration_ms": e.duration_ms,
                "confidence": e.confidence,
                "compared_with": e.compared_with,
            }
            for se, e in zip(saved_events, events)
        ],
    }


# ------------------------------------------------------------------
# POST /interaction/event — Record an explicit interaction event
# ------------------------------------------------------------------

@router.post("/event", response_model=schemas.ProductInteractionResponse)
def record_interaction_event(
    evt: schemas.ProductInteractionCreate,
    db: Session = Depends(get_db),
):
    """
    Explicitly log a product interaction event (e.g. product_purchased or product_compared).
    """
    db_evt = models.ProductInteraction(
        timestamp=datetime.utcnow(),
        store_id=evt.store_id,
        shelf_id=evt.shelf_id,
        product_name=evt.product_name,
        interaction_type=evt.interaction_type,
        duration_ms=evt.duration_ms,
        confidence=evt.confidence,
        shopper_id=evt.shopper_id,
        compared_with=evt.compared_with,
    )
    db.add(db_evt)
    db.commit()
    db.refresh(db_evt)
    return db_evt


# ------------------------------------------------------------------
# GET /interaction/events/{store_id} — Store interaction events
# ------------------------------------------------------------------

@router.get("/events/{store_id}")
def get_store_interactions(
    store_id: int,
    db: Session = Depends(get_db),
):
    """Retrieve all product interaction events for a given store."""
    events = (
        db.query(models.ProductInteraction)
        .filter(models.ProductInteraction.store_id == store_id)
        .order_by(models.ProductInteraction.timestamp.desc())
        .all()
    )

    summary = {
        "store_id": store_id,
        "total_events": len(events),
        "product_viewed": sum(1 for e in events if e.interaction_type == "product_viewed"),
        "product_picked_up": sum(1 for e in events if e.interaction_type == "product_picked_up"),
        "product_returned": sum(1 for e in events if e.interaction_type == "product_returned"),
        "product_purchased": sum(1 for e in events if e.interaction_type == "product_purchased"),
        "product_compared": sum(1 for e in events if e.interaction_type == "product_compared"),
    }

    return {
        "summary": summary,
        "events": events,
    }


# ------------------------------------------------------------------
# GET /interaction/events/{store_id}/{shelf_id} — Shelf breakdown
# ------------------------------------------------------------------

@router.get("/events/{store_id}/{shelf_id}")
def get_shelf_interactions(
    store_id: int,
    shelf_id: int,
    db: Session = Depends(get_db),
):
    """Retrieve interaction events for a specific shelf."""
    events = (
        db.query(models.ProductInteraction)
        .filter(
            models.ProductInteraction.store_id == store_id,
            models.ProductInteraction.shelf_id == shelf_id,
        )
        .order_by(models.ProductInteraction.timestamp.desc())
        .all()
    )

    return {
        "store_id": store_id,
        "shelf_id": shelf_id,
        "total_events": len(events),
        "events": events,
    }


# ------------------------------------------------------------------
# GET /interaction/summary — System-wide summary
# ------------------------------------------------------------------

@router.get("/summary", response_model=schemas.InteractionSummary)
def get_interaction_summary(db: Session = Depends(get_db)):
    """System-wide summary of product interaction event counts & rates."""
    total = db.query(func.count(models.ProductInteraction.id)).scalar() or 0
    viewed = db.query(func.count(models.ProductInteraction.id)).filter(models.ProductInteraction.interaction_type == "product_viewed").scalar() or 0
    picked = db.query(func.count(models.ProductInteraction.id)).filter(models.ProductInteraction.interaction_type == "product_picked_up").scalar() or 0
    returned = db.query(func.count(models.ProductInteraction.id)).filter(models.ProductInteraction.interaction_type == "product_returned").scalar() or 0
    purchased = db.query(func.count(models.ProductInteraction.id)).filter(models.ProductInteraction.interaction_type == "product_purchased").scalar() or 0
    compared = db.query(func.count(models.ProductInteraction.id)).filter(models.ProductInteraction.interaction_type == "product_compared").scalar() or 0

    conv_rate = (purchased / max(1, picked)) * 100.0
    ret_rate = (returned / max(1, picked)) * 100.0

    return schemas.InteractionSummary(
        total_interactions=total,
        total_viewed=viewed,
        total_picked_up=picked,
        total_returned=returned,
        total_purchased=purchased,
        total_compared=compared,
        conversion_rate=round(conv_rate, 1),
        return_rate=round(ret_rate, 1),
    )
