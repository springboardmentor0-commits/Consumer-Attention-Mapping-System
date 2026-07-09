import uuid
from datetime import datetime, timezone
from typing import Optional, List, Any
from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy import Column, ForeignKey
from sqlalchemy.dialects.postgresql import JSON


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
        sa_column=Column("metadata", JSON, nullable=True)
    )
    
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column_kwargs={"default": lambda: datetime.now(timezone.utc)},
        nullable=False
    )
    
    # Cascade delete shelves when the store is deleted
    shelves: List["Shelf"] = Relationship(
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
    zone_coordinates: Any = Field(sa_column=Column(JSON, nullable=False))
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        nullable=False
    )
    
    # Relationship to Store
    store: Optional[Store] = Relationship(back_populates="shelves")
