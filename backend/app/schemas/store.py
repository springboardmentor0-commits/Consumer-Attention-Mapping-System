import uuid
from pydantic import BaseModel, ConfigDict


class StoreCreate(BaseModel):
    name: str
    location: str
    layout_description: str | None = None


class StoreOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    name: str
    location: str
    layout_description: str | None = None


class ZoneCreate(BaseModel):
    store_id: uuid.UUID
    name: str
    description: str | None = None


class ZoneOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    store_id: uuid.UUID
    name: str
    description: str | None = None


class ShelfCreate(BaseModel):
    store_id: uuid.UUID
    zone_id: uuid.UUID | None = None
    code: str
    category: str | None = None
    pos_x: float | None = None
    pos_y: float | None = None


class ShelfOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    store_id: uuid.UUID
    zone_id: uuid.UUID | None = None
    code: str
    category: str | None = None
    pos_x: float | None = None
    pos_y: float | None = None
