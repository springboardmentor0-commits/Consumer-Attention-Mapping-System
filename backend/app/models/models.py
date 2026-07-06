import enum
from sqlalchemy import Column, Integer, String, Enum, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class UserRole(str, enum.Enum):
    store_manager = "store_manager"
    retail_analyst = "retail_analyst"
    marketing_manager = "marketing_manager"
    admin = "admin"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(UserRole), default=UserRole.store_manager, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Store(Base):
    __tablename__ = "stores"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    location = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    shelves = relationship("Shelf", back_populates="store", cascade="all, delete-orphan")
    cameras = relationship("Camera", back_populates="store", cascade="all, delete-orphan")


class Shelf(Base):
    __tablename__ = "shelves"

    id = Column(Integer, primary_key=True, index=True)
    store_id = Column(Integer, ForeignKey("stores.id"), nullable=False)
    name = Column(String, nullable=False)
    zone = Column(String, nullable=True)

    store = relationship("Store", back_populates="shelves")


class Camera(Base):
    __tablename__ = "cameras"

    id = Column(Integer, primary_key=True, index=True)
    store_id = Column(Integer, ForeignKey("stores.id"), nullable=False)
    camera_code = Column(String, nullable=False)
    location_description = Column(String, nullable=True)

    store = relationship("Store", back_populates="cameras")