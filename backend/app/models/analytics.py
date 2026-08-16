from sqlalchemy import Column, Integer, String, Float, DateTime
from app.core.database import Base


class Analytics(Base):
    __tablename__ = "analytics"

    id = Column(Integer, primary_key=True, index=True)

    shopper_id = Column(Integer, nullable=False)

    region = Column(String, nullable=False)

    focus = Column(String, nullable=False)

    dwell_time = Column(Float, nullable=False)

    path_length = Column(Float, nullable=False)

    shelf_visits = Column(Integer, nullable=False)

    gaze_shifts = Column(Integer, nullable=False)

    segment = Column(String, nullable=True)

    entry_time = Column(DateTime, nullable=False)

    exit_time = Column(DateTime, nullable=False)

    timestamp = Column(DateTime, nullable=False)