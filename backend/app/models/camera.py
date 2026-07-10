import uuid
from datetime import datetime

from sqlalchemy import String, DateTime, ForeignKey, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from app.db.database import Base
from app.models.enums import CameraTypeEnum, CameraStatusEnum


class Camera(Base):
    __tablename__ = "cameras"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    store_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("stores.id"), nullable=False)
    zone_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("zones.id"), nullable=True)

    name: Mapped[str] = mapped_column(String(150), nullable=False)
    camera_type: Mapped[CameraTypeEnum] = mapped_column(Enum(CameraTypeEnum), default=CameraTypeEnum.IP_CCTV)

    # RTSP / HTTP stream URL. In production, store credentials in a secrets
    # manager, not directly in the DB.
    stream_url: Mapped[str] = mapped_column(String(500), nullable=False)

    status: Mapped[CameraStatusEnum] = mapped_column(Enum(CameraStatusEnum), default=CameraStatusEnum.OFFLINE)
    last_heartbeat: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    store: Mapped["Store"] = relationship(back_populates="cameras")
