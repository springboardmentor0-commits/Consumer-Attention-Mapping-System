import uuid
from datetime import datetime, timezone
from typing import Optional, List, Any
from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy import Column, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB


class Role(SQLModel, table=True):
    __tablename__ = "roles"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(unique=True, index=True, nullable=False)
    
    # Relationship to Users
    users: List["User"] = Relationship(back_populates="role")


class User(SQLModel, table=True):
    __tablename__ = "users"
    
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    email: str = Field(unique=True, index=True, nullable=False)
    hashed_password: str = Field(nullable=False)
    role_id: int = Field(foreign_key="roles.id", nullable=False)
    is_active: bool = Field(default=True, nullable=False)
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        nullable=False
    )
    
    # Relationship to Role
    role: Optional[Role] = Relationship(back_populates="users")


class Store(SQLModel, table=True):
    __tablename__ = "stores"
    
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    name: str = Field(nullable=False)
    location: str = Field(nullable=False)
    
    # Avoid collision with SQLAlchemy 'metadata' attribute
    store_metadata: Optional[Any] = Field(
        default=None,
        sa_column=Column("metadata", JSONB, nullable=True)
    )
    
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column_kwargs={"default": lambda: datetime.now(timezone.utc)},
        nullable=False
    )
    
    # Relationships
    shelves: List["Shelf"] = Relationship(
        back_populates="store",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )
    zones: List["Zone"] = Relationship(
        back_populates="store",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )
    cameras: List["Camera"] = Relationship(
        back_populates="store",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )
    products: List["Product"] = Relationship(
        back_populates="store",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )


class Shelf(SQLModel, table=True):
    __tablename__ = "shelves"
    
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    store_id: uuid.UUID = Field(
        sa_column=Column(
            ForeignKey("stores.id", ondelete="CASCADE"),
            nullable=False
        )
    )
    shelf_name: str = Field(nullable=False)
    zone_coordinates: Any = Field(sa_column=Column(JSONB, nullable=False))
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        nullable=False
    )
    
    # Relationship to Store
    store: Optional[Store] = Relationship(back_populates="shelves")


class Zone(SQLModel, table=True):
    __tablename__ = "zones"
    
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    store_id: uuid.UUID = Field(
        sa_column=Column(
            ForeignKey("stores.id", ondelete="CASCADE"),
            nullable=False
        )
    )
    zone_name: str = Field(nullable=False)
    coordinates: Any = Field(sa_column=Column(JSONB, nullable=False))
    zone_type: str = Field(nullable=False)
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        nullable=False
    )
    
    # Relationships
    store: Optional[Store] = Relationship(back_populates="zones")
    cameras: List["Camera"] = Relationship(
        back_populates="zone",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )


class Camera(SQLModel, table=True):
    __tablename__ = "cameras"
    
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    store_id: uuid.UUID = Field(
        sa_column=Column(
            ForeignKey("stores.id", ondelete="CASCADE"),
            nullable=False
        )
    )
    zone_id: Optional[uuid.UUID] = Field(
        sa_column=Column(
            ForeignKey("zones.id", ondelete="SET NULL"),
            nullable=True
        )
    )
    camera_name: str = Field(nullable=False)
    stream_url: str = Field(nullable=False)
    status: str = Field(default="active", nullable=False)
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        nullable=False
    )
    
    # Relationships
    store: Optional[Store] = Relationship(back_populates="cameras")
    zone: Optional[Zone] = Relationship(back_populates="cameras")


class Product(SQLModel, table=True):
    __tablename__ = "products"
    
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    store_id: uuid.UUID = Field(
        sa_column=Column(
            ForeignKey("stores.id", ondelete="CASCADE"),
            nullable=False
        )
    )
    shelf_id: Optional[uuid.UUID] = Field(
        sa_column=Column(
            ForeignKey("shelves.id", ondelete="SET NULL"),
            nullable=True
        )
    )
    name: str = Field(nullable=False)
    sku: str = Field(nullable=False, index=True)
    category: str = Field(nullable=False)
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        nullable=False
    )
    
    # Relationships
    store: Optional[Store] = Relationship(back_populates="products")
    shelf: Optional[Shelf] = Relationship()


class DwellTime(SQLModel, table=True):
    __tablename__ = "dwell_times"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    store_id: uuid.UUID = Field(
        sa_column=Column(
            ForeignKey("stores.id", ondelete="CASCADE"),
            nullable=False
        )
    )
    zone_id: uuid.UUID = Field(
        sa_column=Column(
            ForeignKey("zones.id", ondelete="CASCADE"),
            nullable=False
        )
    )
    camera_id: Optional[uuid.UUID] = Field(
        default=None,
        sa_column=Column(
            ForeignKey("cameras.id", ondelete="SET NULL"),
            nullable=True
        )
    )
    shopper_id: int = Field(nullable=False, index=True)
    entry_timestamp: datetime = Field(nullable=False, index=True)
    exit_timestamp: datetime = Field(nullable=False)
    dwell_duration_seconds: float = Field(nullable=False)
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    # Relationships
    store: Optional[Store] = Relationship()
    zone: Optional[Zone] = Relationship()
    camera: Optional[Camera] = Relationship()


class GazeEvent(SQLModel, table=True):
    __tablename__ = "gaze_events"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    store_id: uuid.UUID = Field(
        sa_column=Column(
            ForeignKey("stores.id", ondelete="CASCADE"),
            nullable=False
        )
    )
    shelf_id: uuid.UUID = Field(
        sa_column=Column(
            ForeignKey("shelves.id", ondelete="CASCADE"),
            nullable=False
        )
    )
    shopper_id: int = Field(nullable=False, index=True)
    pitch: Optional[float] = Field(default=None)
    yaw: Optional[float] = Field(default=None)
    roll: Optional[float] = Field(default=None)
    timestamp: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        nullable=False,
        index=True
    )

    # Relationships
    store: Optional[Store] = Relationship()
    shelf: Optional[Shelf] = Relationship()


