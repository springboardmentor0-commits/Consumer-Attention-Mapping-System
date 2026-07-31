from fastapi import APIRouter, Depends
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from sqlalchemy import func

from database import SessionLocal
from models import TrackingSession
from ai.behavior import classify_shopper

router = APIRouter(
    prefix="/analytics",
    tags=["Attention Analytics"]
)


# Database Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/attention")
def get_attention_data(db: Session = Depends(get_db)):

    results = (
        db.query(
            TrackingSession.shelf_id,
            func.avg(TrackingSession.dwell_duration).label("avg_dwell"),
            func.count(TrackingSession.id).label("visits")
        )
        .group_by(TrackingSession.shelf_id)
        .all()
    )

    analytics = []

    for row in results:
        analytics.append({
            "shelf_id": row.shelf_id,
            "average_dwell_time": round(row.avg_dwell, 2),
            "total_visits": row.visits
        })

    return analytics

@router.post("/segment-shoppers")
def segment_shoppers(db: Session = Depends(get_db)):

    sessions = db.query(TrackingSession).all()

    updated_sessions = []

    for session in sessions:
        segment = classify_shopper(
            session.dwell_duration,
            session.tracker_id
        )

    session.segment = segment

    updated_sessions.append({
        "tracker_id": session.tracker_id,
        "segment": segment
    })

    db.commit()

    return {
        "message": "Shopper segmentation completed.",
        "results": updated_sessions
    }

@router.get("/heatmap")
def get_heatmap():

    return FileResponse(
        "heatmaps/store_heatmap.jpg",
        media_type="image/jpeg"
    )