from pydantic import BaseModel, Field


class AttractivenessRequest(BaseModel):

    product_name: str

    attention_duration: float = Field(
        ge=0,
        le=100
    )

    interaction_frequency: float = Field(
        ge=0,
        le=100
    )

    pickup_rate: float = Field(
        ge=0,
        le=100
    )

    conversion_rate: float = Field(
        ge=0,
        le=100
    )

    repeat_engagement: float = Field(
        ge=0,
        le=100
    )


class AttractivenessResponse(BaseModel):

    product_name: str

    attractiveness_score: float