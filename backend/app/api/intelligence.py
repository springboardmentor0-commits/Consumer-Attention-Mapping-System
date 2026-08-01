from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.models import User
from app.services.behavior import segment_shoppers
from app.services.scoring import score_products
from app.services.recommendations import generate_recommendations
import base64
import cv2
import os

router = APIRouter(prefix="/api/intelligence", tags=["Behavioral Intelligence"])


@router.get("/segments")
def get_shopper_segments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get shopper behavior segments"""
    shopper_sessions = [
        {"id": 1, "dwell_time": 90, "path_length": 5, "gaze_shifts": 8},
        {"id": 2, "dwell_time": 20, "path_length": 1, "gaze_shifts": 1},
        {"id": 3, "dwell_time": 60, "path_length": 2, "gaze_shifts": 7},
        {"id": 4, "dwell_time": 35, "path_length": 4, "gaze_shifts": 3},
        {"id": 5, "dwell_time": 45, "path_length": 2, "gaze_shifts": 2},
    ]
    return {"segments": segment_shoppers(shopper_sessions)}


@router.get("/scores")
def get_product_scores(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get product attractiveness scores"""
    products = [
        {"name": "Lays Chips", "attention_duration": 65, "interaction_frequency": 40, "pickup_rate": 25, "conversion_rate": 8, "repeat_engagement": 12},
        {"name": "Coca Cola", "attention_duration": 80, "interaction_frequency": 50, "pickup_rate": 35, "conversion_rate": 25, "repeat_engagement": 15},
        {"name": "Bread", "attention_duration": 30, "interaction_frequency": 15, "pickup_rate": 10, "conversion_rate": 8, "repeat_engagement": 3},
        {"name": "Maggi Noodles", "attention_duration": 55, "interaction_frequency": 35, "pickup_rate": 20, "conversion_rate": 12, "repeat_engagement": 8},
        {"name": "Amul Butter", "attention_duration": 20, "interaction_frequency": 10, "pickup_rate": 5, "conversion_rate": 3, "repeat_engagement": 2},
    ]
    scored = score_products(products)
    return {"products": scored}


@router.get("/recommendations")
def get_recommendations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get product placement recommendations"""
    products = [
        {"name": "Lays Chips", "attention_duration": 65, "interaction_frequency": 40, "pickup_rate": 25, "conversion_rate": 8, "score": 75},
        {"name": "Coca Cola", "attention_duration": 80, "interaction_frequency": 50, "pickup_rate": 35, "conversion_rate": 25, "score": 100},
        {"name": "Bread", "attention_duration": 30, "interaction_frequency": 15, "pickup_rate": 10, "conversion_rate": 8, "score": 53},
        {"name": "Maggi Noodles", "attention_duration": 55, "interaction_frequency": 35, "pickup_rate": 20, "conversion_rate": 12, "score": 96},
        {"name": "Amul Butter", "attention_duration": 20, "interaction_frequency": 10, "pickup_rate": 5, "conversion_rate": 3, "score": 31},
    ]
    return {"recommendations": generate_recommendations(products)}


@router.get("/heatmap")
def get_heatmap(
    current_user: User = Depends(get_current_user)
):
    """Generate and return heatmap as base64 image"""
    from app.services.heatmap import generate_heatmap
    
    # Generate heatmap
    heatmap_path = "heatmap.png"
    generate_heatmap(output_path=heatmap_path)
    
    # Read and encode as base64
    with open(heatmap_path, "rb") as f:
        image_data = base64.b64encode(f.read()).decode("utf-8")
    
    return {
        "heatmap": f"data:image/png;base64,{image_data}",
        "message": "Heatmap generated successfully"
    }