from sqlalchemy import Column, Integer, String

from app.models.base import Base


class Store(Base):
    __tablename__ = "stores"

    id = Column(Integer, primary_key=True, index=True)

    store_name = Column(String, nullable=False)

    location = Column(String, nullable=False)

from pydantic import BaseModel


class StoreCreate(BaseModel):
    store_name: str
    location: str