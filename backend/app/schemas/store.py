from typing import List, Optional, Any
from pydantic import BaseModel, ConfigDict, model_validator
from app.schemas.zone import ZoneResponse


class StoreBase(BaseModel):
    name: str
    location: str
    address: str
    city: str
    country: str
    store_type: str
    floor_plan_url: Optional[str] = None
    total_area_sqft: float
    is_active: bool = True
    metadata: Optional[dict] = None


class StoreCreate(StoreBase):
    pass


class StoreUpdate(BaseModel):
    name: Optional[str] = None
    location: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    store_type: Optional[str] = None
    floor_plan_url: Optional[str] = None
    total_area_sqft: Optional[float] = None
    is_active: Optional[bool] = None
    metadata: Optional[dict] = None


class StoreResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    layout_id: str
    name: str
    zones: List[ZoneResponse] = []

    @model_validator(mode="before")
    @classmethod
    def map_fields(cls, v: Any) -> Any:
        if hasattr(v, "id"):
            return {
                "layout_id": v.id,
                "name": v.name,
                "zones": getattr(v, "zones", [])
            }
        if isinstance(v, dict) and "id" in v and "layout_id" not in v:
            v["layout_id"] = v.pop("id")
        return v
