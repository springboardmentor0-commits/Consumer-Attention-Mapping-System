from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from database import SessionLocal
from models import TrackingSession

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