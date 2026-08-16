from fastapi import APIRouter

from app.services.scoring.attractiveness import calculate_attractiveness_score
from app.services.recommendations import generate_recommendation

router = APIRouter(
    prefix="/recommendations",
    tags=["Recommendations"],
)

@router.post("/")
def get_recommendation(data: dict):

    score = calculate_attractiveness_score(
        attention_duration=data["attention_duration"],
        interaction_frequency=data["interaction_frequency"],
        pickup_rate=data["pickup_rate"],
        conversion_rate=data["conversion_rate"],
        repeat_engagement=data["repeat_engagement"],
    )

    recommendations = generate_recommendation(
        product_name=data["product_name"],
        attention_duration=data["attention_duration"],
        interaction_frequency=data["interaction_frequency"],
        pickup_rate=data["pickup_rate"],
        conversion_rate=data["conversion_rate"],
        repeat_engagement=data["repeat_engagement"],
        attractiveness_score=score,
    )

    return {
        "product_name": data["product_name"],
        "attractiveness_score": score,
        "recommendations": recommendations,
    }