from pydantic import BaseModel, ConfigDict, Field


# ==========================================================
# Shelf Creation Request
# ==========================================================

class ShelfCreate(BaseModel):
    """
    Request model for creating a new shelf.
    """

    store_id: int = Field(
        ...,
        gt=0,
        description="Unique identifier of the store",
    )

    shelf_name: str = Field(
        ...,
        min_length=2,
        max_length=100,
        description="Name of the shelf",
    )

    zone_coordinates: str = Field(
        ...,
        min_length=5,
        max_length=50,
        description="Shelf location as (x,y) coordinates. Example: (100,200)",
    )


# ==========================================================
# Shelf Response
# ==========================================================

class ShelfResponse(BaseModel):
    """
    Response model returned after creating or retrieving a shelf.
    """

    id: int = Field(
        ...,
        description="Unique identifier for the shelf",
    )

    store_id: int = Field(
        ...,
        description="Store to which the shelf belongs",
    )

    shelf_name: str = Field(
        ...,
        description="Name of the shelf",
    )

    zone_coordinates: str = Field(
        ...,
        description="Shelf location stored as (x,y) coordinates",
    )

    model_config = ConfigDict(
        from_attributes=True
    )