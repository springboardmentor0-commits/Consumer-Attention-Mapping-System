from pydantic import BaseModel, ConfigDict, Field


# ==========================================================
# Store Creation Request
# ==========================================================

class StoreCreate(BaseModel):
    """
    Request model for creating a new retail store.
    """

    store_name: str = Field(
        ...,
        min_length=2,
        max_length=150,
        description="Name of the retail store",
    )

    location: str = Field(
        ...,
        min_length=2,
        max_length=255,
        description="Physical location of the store",
    )


# ==========================================================
# Store Response
# ==========================================================

class StoreResponse(BaseModel):
    """
    Response model returned after creating or retrieving a store.
    """

    id: int = Field(
        ...,
        description="Unique identifier for the store",
    )

    store_name: str = Field(
        ...,
        description="Name of the retail store",
    )

    location: str = Field(
        ...,
        description="Physical location of the store",
    )

    model_config = ConfigDict(
        from_attributes=True
    )