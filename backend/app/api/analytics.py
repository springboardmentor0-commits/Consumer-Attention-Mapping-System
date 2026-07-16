from fastapi import APIRouter
from sqlalchemy import func

from app.core.database import SessionLocal
from app.models.attention_session import AttentionSession
import subprocess
import sys
import os


router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"]
)


@router.get("/summary")
def get_summary():

    db = SessionLocal()

    try:

        total_shoppers = db.query(
            AttentionSession
        ).count()

        average_dwell = db.query(
            func.avg(AttentionSession.dwell_time)
        ).scalar()

        most_viewed = db.query(
            AttentionSession.most_viewed_zone,
            func.count(AttentionSession.id)
        ).group_by(
            AttentionSession.most_viewed_zone
        ).order_by(
            func.count(AttentionSession.id).desc()
        ).first()

        return {
            "total_shoppers": total_shoppers,
            "average_dwell": round(
                average_dwell or 0,
                2
            ),
            "most_viewed_zone":
                most_viewed[0] if most_viewed else "None"
        }

    finally:
        db.close()


@router.get("/sessions")
def get_sessions():

    db = SessionLocal()

    try:

        sessions = db.query(
            AttentionSession
        ).order_by(
            AttentionSession.id.desc()
        ).all()

        return sessions

    finally:
        db.close()

@router.get("/attention")
def get_attention():

    db = SessionLocal()

    try:

        sessions = db.query(AttentionSession).all()

        zone_a = sum(session.zone_a_time for session in sessions)
        zone_b = sum(session.zone_b_time for session in sessions)
        zone_c = sum(session.zone_c_time for session in sessions)

        return {
            "Zone A": round(zone_a, 2),
            "Zone B": round(zone_b, 2),
            "Zone C": round(zone_c, 2)
        }

    finally:
        db.close()

@router.post("/run")
def run_analysis():

    subprocess.Popen(
        [
            sys.executable,
            "-m",
            "app.services.tracker"
        ],
        cwd=os.getcwd()
    )

    return {
        "status": "success",
        "message": "AI analysis started successfully."
    }