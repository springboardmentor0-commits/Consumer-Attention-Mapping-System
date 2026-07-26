from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.analytics import Analytics


def create_session(db: Session, session_data: dict):

    analytics = Analytics(**session_data)

    db.add(analytics)

    db.commit()

    db.refresh(analytics)

    return analytics


def get_all_sessions(db: Session):

    return db.query(Analytics).all()


def get_summary(db: Session):

    total = db.query(Analytics).count()

    avg = db.query(func.avg(Analytics.dwell_time)).scalar() or 0

    left = db.query(Analytics).filter(
        Analytics.focus == "Left Display"
    ).count()

    right = db.query(Analytics).filter(
        Analytics.focus == "Right Display"
    ).count()

    return {
        "total_shoppers": total,
        "average_dwell_time": round(avg, 2),
        "left_display_views": left,
        "right_display_views": right,
    }