"""
Attention Analysis API Router
==============================
Endpoints for running the attention analysis pipeline and querying metrics.
"""

from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime
import tempfile
import os
import cv2
import numpy as np

from ..database import get_db
from .. import models, schemas
from . import attention_engine


router = APIRouter(prefix="/attention", tags=["Attention Analysis"])


# ------------------------------------------------------------------
# POST /attention/analyze  —  analyse a video or image
# ------------------------------------------------------------------

@router.post("/analyze")
async def analyze_attention(
    store_id: int,
    shelf_id: int = None,
    image: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """
    Accept an image frame, run the full attention analysis pipeline,
    persist the resulting events, and return them.
    """
    contents = await image.read()
    nparr = np.frombuffer(contents, np.uint8)
    frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if frame is None:
        raise HTTPException(status_code=400, detail="Invalid image file")

    # Run the attention pipeline
    events = attention_engine.process_attention_frame(frame)

    saved_ids = []
    for evt in events:
        db_event = models.AttentionEvent(
            timestamp=datetime.utcnow(),
            store_id=store_id,
            shelf_id=shelf_id or evt.shelf_id,
            product_zone=evt.product_zone,
            event_type=evt.event_type,
            gaze_yaw=evt.gaze.yaw,
            gaze_pitch=evt.gaze.pitch,
            head_roll=evt.head_pose.roll,
            head_pitch=evt.head_pose.pitch,
            head_yaw=evt.head_pose.yaw,
            duration_ms=evt.duration_ms,
            engagement=evt.engagement.value if evt.engagement else None,
            shopper_id=evt.shopper_id,
        )
        db.add(db_event)
        db.flush()
        saved_ids.append(db_event.id)

    db.commit()

    return {
        "faces_detected": len(events),
        "events_saved": len(saved_ids),
        "events": [
            {
                "event_type": e.event_type,
                "gaze_yaw": e.gaze.yaw,
                "gaze_pitch": e.gaze.pitch,
                "head_yaw": e.head_pose.yaw,
                "head_pitch": e.head_pose.pitch,
                "head_roll": e.head_pose.roll,
                "engagement": e.engagement.value if e.engagement else None,
                "duration_ms": e.duration_ms,
                "product_zone": e.product_zone,
            }
            for e in events
        ],
    }


# ------------------------------------------------------------------
# GET /attention/metrics/{store_id}  —  store‑level metrics
# ------------------------------------------------------------------

@router.get("/metrics/{store_id}")
def get_store_metrics(
    store_id: int,
    db: Session = Depends(get_db),
):
    """Aggregate attention metrics for a specific store."""
    rows = (
        db.query(
            func.count(models.AttentionEvent.id).label("total_events"),
            func.coalesce(func.sum(models.AttentionEvent.duration_ms), 0).label("total_duration"),
            func.count(func.distinct(models.AttentionEvent.shelf_id)).label("shelves_analyzed"),
        )
        .filter(models.AttentionEvent.store_id == store_id)
        .first()
    )

    total_events = rows.total_events or 0
    total_duration = rows.total_duration or 0

    # Count repeated attention events (same shopper revisiting)
    repeated = (
        db.query(func.count())
        .filter(
            models.AttentionEvent.store_id == store_id,
            models.AttentionEvent.event_type == "repeated_attention",
        )
        .scalar() or 0
    )

    # Gaze-only duration (product focus)
    product_focus = (
        db.query(func.coalesce(func.sum(models.AttentionEvent.duration_ms), 0))
        .filter(
            models.AttentionEvent.store_id == store_id,
            models.AttentionEvent.event_type.in_(["gaze_fixation", "product_focus"]),
        )
        .scalar() or 0
    )

    # Shelf attention time
    shelf_time = (
        db.query(func.coalesce(func.sum(models.AttentionEvent.duration_ms), 0))
        .filter(
            models.AttentionEvent.store_id == store_id,
            models.AttentionEvent.shelf_id.isnot(None),
        )
        .scalar() or 0
    )

    return {
        "store_id": store_id,
        "total_events": total_events,
        "dwell_time_ms": total_duration,
        "view_duration_ms": product_focus,
        "shelf_attention_time_ms": shelf_time,
        "product_focus_ms": product_focus,
        "repeated_attention_count": repeated,
        "shelves_analyzed": rows.shelves_analyzed or 0,
        "avg_dwell_time_ms": round(total_duration / max(total_events, 1), 1),
    }


# ------------------------------------------------------------------
# GET /attention/metrics/{store_id}/{shelf_id}  —  shelf‑level
# ------------------------------------------------------------------

@router.get("/metrics/{store_id}/{shelf_id}")
def get_shelf_metrics(
    store_id: int,
    shelf_id: int,
    db: Session = Depends(get_db),
):
    """Aggregate attention metrics for a specific shelf within a store."""
    rows = (
        db.query(
            func.count(models.AttentionEvent.id).label("total_events"),
            func.coalesce(func.sum(models.AttentionEvent.duration_ms), 0).label("total_duration"),
        )
        .filter(
            models.AttentionEvent.store_id == store_id,
            models.AttentionEvent.shelf_id == shelf_id,
        )
        .first()
    )

    total_events = rows.total_events or 0
    total_duration = rows.total_duration or 0

    product_focus = (
        db.query(func.coalesce(func.sum(models.AttentionEvent.duration_ms), 0))
        .filter(
            models.AttentionEvent.store_id == store_id,
            models.AttentionEvent.shelf_id == shelf_id,
            models.AttentionEvent.event_type.in_(["gaze_fixation", "product_focus"]),
        )
        .scalar() or 0
    )

    repeated = (
        db.query(func.count())
        .filter(
            models.AttentionEvent.store_id == store_id,
            models.AttentionEvent.shelf_id == shelf_id,
            models.AttentionEvent.event_type == "repeated_attention",
        )
        .scalar() or 0
    )

    return {
        "store_id": store_id,
        "shelf_id": shelf_id,
        "total_events": total_events,
        "dwell_time_ms": total_duration,
        "view_duration_ms": product_focus,
        "shelf_attention_time_ms": total_duration,
        "product_focus_ms": product_focus,
        "repeated_attention_count": repeated,
        "avg_dwell_time_ms": round(total_duration / max(total_events, 1), 1),
    }


# ------------------------------------------------------------------
# GET /attention/summary  —  system‑wide summary
# ------------------------------------------------------------------

@router.get("/summary", response_model=schemas.AttentionSummary)
def get_attention_summary(db: Session = Depends(get_db)):
    """System-wide summary of all attention data."""
    rows = (
        db.query(
            func.count(models.AttentionEvent.id).label("total_events"),
            func.coalesce(func.sum(models.AttentionEvent.duration_ms), 0).label("total_duration"),
            func.count(func.distinct(models.AttentionEvent.store_id)).label("stores"),
            func.count(func.distinct(models.AttentionEvent.shelf_id)).label("shelves"),
        )
        .first()
    )

    total_events = rows.total_events or 0
    total_duration = rows.total_duration or 0

    product_focus = (
        db.query(func.coalesce(func.sum(models.AttentionEvent.duration_ms), 0))
        .filter(models.AttentionEvent.event_type.in_(["gaze_fixation", "product_focus"]))
        .scalar() or 0
    )

    shelf_time = (
        db.query(func.coalesce(func.sum(models.AttentionEvent.duration_ms), 0))
        .filter(models.AttentionEvent.shelf_id.isnot(None))
        .scalar() or 0
    )

    repeated = (
        db.query(func.count())
        .filter(models.AttentionEvent.event_type == "repeated_attention")
        .scalar() or 0
    )

    return schemas.AttentionSummary(
        total_events=total_events,
        total_dwell_time_ms=total_duration,
        total_view_duration_ms=product_focus,
        total_shelf_attention_time_ms=shelf_time,
        total_product_focus_ms=product_focus,
        total_repeated_attention_events=repeated,
        avg_dwell_time_ms=round(total_duration / max(total_events, 1), 1),
        avg_view_duration_ms=round(product_focus / max(total_events, 1), 1),
        stores_analyzed=rows.stores or 0,
        shelves_analyzed=rows.shelves or 0,
    )
