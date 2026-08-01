from sqlalchemy import (
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    JSON,
    text,
)
from sqlalchemy.orm import relationship
from app.core.database import Base

# =====================================================
# Constants
# =====================================================

ROLE_NAME_LENGTH = 50
STORE_NAME_LENGTH = 150
LOCATION_LENGTH = 255
SHELF_NAME_LENGTH = 100
EMAIL_LENGTH = 255
PASSWORD_HASH_LENGTH = 255


# =====================================================
# Roles Table
# =====================================================

class RoleModel(Base):
    """
    Application Roles.
    """

    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, index=True)

    role_name = Column(
        String(ROLE_NAME_LENGTH),
        unique=True,
        nullable=False,
    )
    
    description = Column(Text, nullable=True) # <-- Added missing column

    users = relationship(
        "UserModel",
        back_populates="role",
    )


# =====================================================
# Stores Table
# =====================================================

class StoreModel(Base):
    """
    Retail Store.
    """

    __tablename__ = "stores"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    store_name = Column(
        String(STORE_NAME_LENGTH),
        nullable=False,
    )

    location = Column(
        String(LOCATION_LENGTH),
        nullable=False,
    )

    shelves = relationship(
        "ShelfModel",
        back_populates="store",
        cascade="all, delete-orphan",
    )

    attention_sessions = relationship(
        "AttentionSessionModel",
        back_populates="store",
        cascade="all, delete-orphan",
    )


# =====================================================
# Shelves Table
# =====================================================

class ShelfModel(Base):
    """
    Shelf Layout.
    """

    __tablename__ = "shelves"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    store_id = Column(
        Integer,
        ForeignKey(
            "stores.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    shelf_name = Column(
        String(SHELF_NAME_LENGTH),
        nullable=False,
    )

    # Use JSON / JSONB type to match SQL schema
    zone_coordinates = Column(
        JSON,
        nullable=False,
    )

    store = relationship(
        "StoreModel",
        back_populates="shelves",
    )

    attention_sessions = relationship(
        "AttentionSessionModel",
        back_populates="shelf",
    )


# =====================================================
# Users Table
# =====================================================

class UserModel(Base):
    """
    System User.
    """

    __tablename__ = "users"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    email = Column(
        String(EMAIL_LENGTH),
        unique=True,
        nullable=False,
        index=True,
    )

    password_hash = Column(
        String(PASSWORD_HASH_LENGTH),
        nullable=False,
    )

    role_id = Column(
        Integer,
        ForeignKey(
            "roles.id",
            ondelete="SET NULL",
        ),
        nullable=True,
    )

    role = relationship(
        "RoleModel",
        back_populates="users",
    )


# =====================================================
# Attention Sessions Table
# =====================================================

class AttentionSessionModel(Base):
    """
    Stores one completed shopper attention session.
    """

    __tablename__ = "attention_sessions"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    tracker_id = Column(
        Integer,
        nullable=False,
        index=True,
    )

    store_id = Column(
        Integer,
        ForeignKey(
            "stores.id",
            ondelete="SET NULL",
        ),
        nullable=False,
        index=True,
    )

    shelf_id = Column(
        Integer,
        ForeignKey(
            "shelves.id",
            ondelete="SET NULL",
        ),
        nullable=True,
        index=True,
    )

    entry_time = Column(
        DateTime,
        nullable=False,
        index=True,
    )

    exit_time = Column(
        DateTime,
        nullable=False,
        index=True,
    )

    dwell_time_seconds = Column(
        Float,
        nullable=False,
    )

    created_at = Column(
        DateTime,
        nullable=False,
        server_default=text("CURRENT_TIMESTAMP"),
    )

    store = relationship(
        "StoreModel",
        back_populates="attention_sessions",
        lazy="joined",
    )

    shelf = relationship(
        "ShelfModel",
        back_populates="attention_sessions",
        lazy="joined",
    )