from sqlalchemy.orm import Session
from sqlalchemy import func, or_

from app.models.analytics import Analytics
from app.services.vision.shelf_mapper import LEFT_ZONE, RIGHT_ZONE


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
        Analytics.focus == LEFT_ZONE
    ).count()

    right = db.query(Analytics).filter(
        Analytics.focus == RIGHT_ZONE
    ).count()

    # Response keys stay as-is: the frontend reads them by name, and renaming
    # them would break it. The UI presents these counts as Shelf A / Shelf B.
    return {
        "total_shoppers": total,
        "average_dwell_time": round(avg, 2),
        "left_display_views": left,
        "right_display_views": right,
    }


def get_engagement_metrics(db: Session, zone: str | None = None):
    """
    Average per-session engagement recorded by the vision pipeline.

    zone filters to a single shelf zone using the values the pipeline already
    stores (see LEFT_ZONE / RIGHT_ZONE in shelf_mapper). A session counts for
    a zone if the shopper either stood in it (region) or looked at it (focus).
    Passing None aggregates every session in the store.

    Returns None when there are no sessions to draw on, which is how callers
    tell "no analytics yet" apart from "analytics say zero".
    """

    query = db.query(
        func.avg(Analytics.dwell_time),
        func.avg(Analytics.shelf_visits),
        func.avg(Analytics.gaze_shifts),
        func.count(Analytics.id),
        func.max(Analytics.timestamp),
    )

    if zone is not None:
        query = query.filter(
            or_(
                Analytics.region == zone,
                Analytics.focus == zone,
            )
        )

    avg_dwell, avg_visits, avg_gaze, session_count, last_updated = query.one()

    if not session_count:
        return None

    return {
        "avg_dwell_time": float(avg_dwell or 0),
        "avg_shelf_visits": float(avg_visits or 0),
        "avg_gaze_shifts": float(avg_gaze or 0),
        "session_count": int(session_count),
        # When the pipeline last wrote a session for this zone — the "last
        # updated" the scoring page shows.
        "last_updated": last_updated,
    }