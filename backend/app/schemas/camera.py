import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict

from app.models.enums import CameraTypeEnum, CameraStatusEnum


class CameraCreate(BaseModel):
    store_id: uuid.UUID
    zone_id: uuid.UUID | None = None
    name: str
    camera_type: CameraTypeEnum = CameraTypeEnum.IP_CCTV
    stream_url: str


class CameraOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    store_id: uuid.UUID
    zone_id: uuid.UUID | None = None
    name: str
    camera_type: CameraTypeEnum
    status: CameraStatusEnum
    last_heartbeat: datetime | None = None


class CameraStatusUpdate(BaseModel):
    status: CameraStatusEnum
