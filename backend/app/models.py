from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

from .database import Base


# ------------------ ROLE ------------------

class Role(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, index=True)
    role_name = Column(String(100), unique=True, nullable=False)

    users = relationship("User", back_populates="role")


# ------------------ USER ------------------

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    email = Column(String(100), unique=True, nullable=False)

    password = Column(String(255), nullable=False)

    role_id = Column(Integer, ForeignKey("roles.id"))

    role = relationship("Role", back_populates="users")


# ------------------ STORE ------------------

class Store(Base):
    __tablename__ = "stores"

    id = Column(Integer, primary_key=True, index=True)

    store_name = Column(String(100), nullable=False)

    location = Column(String(150), nullable=False)

    shelves = relationship("Shelf", back_populates="store")


# ------------------ SHELF ------------------

class Shelf(Base):
    __tablename__ = "shelves"

    id = Column(Integer, primary_key=True, index=True)

    zone_name = Column(String(100), nullable=False)

    store_id = Column(Integer, ForeignKey("stores.id"))

    store = relationship("Store", back_populates="shelves")