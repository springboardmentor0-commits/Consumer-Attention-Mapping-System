from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.core.database import Base


# =====================================================
# Constants
# =====================================================

ROLE_NAME_LENGTH = 50
STORE_NAME_LENGTH = 150
LOCATION_LENGTH = 255
SHELF_NAME_LENGTH = 100
ZONE_COORDINATES_LENGTH = 50
EMAIL_LENGTH = 255
PASSWORD_HASH_LENGTH = 255


# =====================================================
# Roles Table
# =====================================================

class RoleModel(Base):
    """
    Represents an application role.
    """

    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, index=True)

    role_name = Column(
        String(ROLE_NAME_LENGTH),
        unique=True,
        nullable=False,
    )

    users = relationship(
        "UserModel",
        back_populates="role",
    )


# =====================================================
# Stores Table
# =====================================================

class StoreModel(Base):
    """
    Represents a physical retail store.
    """

    __tablename__ = "stores"

    id = Column(Integer, primary_key=True, index=True)

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


# =====================================================
# Shelves Table
# =====================================================

class ShelfModel(Base):
    """
    Represents a shelf inside a store.
    """

    __tablename__ = "shelves"

    id = Column(Integer, primary_key=True, index=True)

    store_id = Column(
        Integer,
        ForeignKey(
            "stores.id",
            ondelete="CASCADE",
        ),
        nullable=False,
    )

    shelf_name = Column(
        String(SHELF_NAME_LENGTH),
        nullable=False,
    )

    zone_coordinates = Column(
        String(ZONE_COORDINATES_LENGTH),
        nullable=False,
    )

    store = relationship(
        "StoreModel",
        back_populates="shelves",
    )


# =====================================================
# Users Table
# =====================================================

class UserModel(Base):
    """
    Represents an application user.
    """

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

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