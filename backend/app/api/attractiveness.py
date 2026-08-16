from fastapi import APIRouter

from app.schemas.attractiveness import (
    AttractivenessRequest,
    AttractivenessResponse,
)

from app.services.scoring.attractiveness import (
    calculate_attractiveness_score,
)


router = APIRouter(
    prefix="/attractiveness",
    tags=["Product Attractiveness"],
)


@router.post(
    "/score",
    response_model=AttractivenessResponse,
)
def calculate_product_score(
    data: AttractivenessRequest,
):

    score = calculate_attractiveness_score(
        attention_duration=data.attention_duration,
        interaction_frequency=data.interaction_frequency,
        pickup_rate=data.pickup_rate,
        conversion_rate=data.conversion_rate,
        repeat_engagement=data.repeat_engagement,
    )

    return {
        "product_name": data.product_name,
        "attractiveness_score": score,
    }