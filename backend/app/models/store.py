import uuid
from datetime import datetime

from sqlalchemy import String, DateTime, ForeignKey, Float, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from app.db.database import Base


class Store(Base):
    __tablename__ = "stores"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    location: Mapped[str] = mapped_column(String(255), nullable=False)
    layout_description: Mapped[str | None] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    zones: Mapped[list["Zone"]] = relationship(back_populates="store", cascade="all, delete-orphan")
    shelves: Mapped[list["Shelf"]] = relationship(back_populates="store", cascade="all, delete-orphan")
    cameras: Mapped[list["Camera"]] = relationship(back_populates="store", cascade="all, delete-orphan")


class Zone(Base):
    """A named area of a store, e.g. 'Beverages Aisle', 'Checkout'."""
    __tablename__ = "zones"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    store_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("stores.id"), nullable=False)
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    store: Mapped["Store"] = relationship(back_populates="zones")
    shelves: Mapped[list["Shelf"]] = relationship(back_populates="zone")


class Shelf(Base):
    __tablename__ = "shelves"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    store_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("stores.id"), nullable=False)
    zone_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("zones.id"), nullable=True)

    code: Mapped[str] = mapped_column(String(50), nullable=False)  # e.g. "A1-03"
    category: Mapped[str | None] = mapped_column(String(100), nullable=True)

    # Position on the store's layout, used later for heatmap overlays
    pos_x: Mapped[float | None] = mapped_column(Float, nullable=True)
    pos_y: Mapped[float | None] = mapped_column(Float, nullable=True)

    store: Mapped["Store"] = relationship(back_populates="shelves")
    zone: Mapped["Zone"] = relationship(back_populates="shelves")
    products: Mapped[list["Product"]] = relationship(back_populates="shelf")
