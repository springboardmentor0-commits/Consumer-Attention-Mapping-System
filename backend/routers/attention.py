from fastapi import APIRouter, Depends
from fastapi.responses import FileResponse
from ai.report_generator import generate_product_report
from sqlalchemy.orm import Session
from sqlalchemy import func

from database import SessionLocal
from models import TrackingSession
from ai.behavior import classify_shopper

from ai.attractiveness import generate_product_metrics

from ai.recommendations import generate_recommendation, generate_recommendations

from ai.alerts import generate_alert

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

@router.get("/product-scores")
def get_product_scores(db: Session = Depends(get_db)):

    sessions = db.query(TrackingSession).all()

    product_scores = []

    for session in sessions:

        metrics = generate_product_metrics(
            session.dwell_duration
        )

        recommendation = generate_recommendation(
            attractiveness_score=metrics["attractiveness_score"],
            attention_duration=metrics["attention_duration"],
            pickup_rate=metrics["pickup_rate"],
            conversion_rate=metrics["conversion_rate"],
            repeat_engagement=metrics["repeat_engagement"]
        )

        product_scores.append({
            "tracker_id": session.tracker_id,
            "shelf_id": session.shelf_id,
            **metrics,
            "recommendation": recommendation
        })

    return product_scores

@router.get("/recommendations")
def get_recommendations(db: Session = Depends(get_db)):

    sessions = db.query(TrackingSession).all()

    recommendations = []

    for session in sessions:

        metrics = generate_product_metrics(
            session.dwell_duration
        )

        result = generate_recommendations(
            product_name=f"Product-{session.shelf_id}",
            attractiveness_score=metrics["attractiveness_score"],
            attention_duration=metrics["attention_duration"],
            pickup_rate=metrics["pickup_rate"],
            conversion_rate=metrics["conversion_rate"],
            repeat_engagement=metrics["repeat_engagement"]
        )

        recommendations.append({
            "tracker_id": session.tracker_id,
            "shelf_id": session.shelf_id,
            **result
        })

    return recommendations

@router.get("/alerts")
def get_alerts(db: Session = Depends(get_db)):

    sessions = db.query(TrackingSession).all()

    alerts = []

    for session in sessions:

        metrics = generate_product_metrics(
            session.dwell_duration
        )

        recommendation = generate_recommendation(
            attractiveness_score=metrics["attractiveness_score"],
            attention_duration=metrics["attention_duration"],
            pickup_rate=metrics["pickup_rate"],
            conversion_rate=metrics["conversion_rate"],
            repeat_engagement=metrics["repeat_engagement"]
        )

        alert = generate_alert(
            tracker_id=session.tracker_id,
            attractiveness_score=metrics["attractiveness_score"],
            recommendation=recommendation
        )

        if alert:
            alerts.append(alert)

    return alerts

@router.get("/export-report")
def export_report(db: Session = Depends(get_db)):

    sessions = db.query(TrackingSession).all()

    product_data = []

    for session in sessions:

        metrics = generate_product_metrics(
            session.dwell_duration
        )

        recommendation = generate_recommendation(
            attractiveness_score=metrics["attractiveness_score"],
            attention_duration=metrics["attention_duration"],
            pickup_rate=metrics["pickup_rate"],
            conversion_rate=metrics["conversion_rate"],
            repeat_engagement=metrics["repeat_engagement"]
        )

        product_data.append({
            "tracker_id": session.tracker_id,
            "shelf_id": session.shelf_id,
            **metrics,
            "recommendation": recommendation
        })

    report = generate_product_report(product_data)

    file_path = "product_analytics_report.xlsx"

    report.to_excel(file_path, index=False)

    return FileResponse(
        file_path,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        filename="product_analytics_report.xlsx"
    )