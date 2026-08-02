from sqlalchemy.orm import Session
from .. import models
from datetime import datetime

def create_detection(db: Session, detection_data: dict):
    db_detection = models.Detection(
        timestamp=datetime.utcnow(),
        store_id=detection_data['store_id'],
        shelf_id=detection_data.get('shelf_id'),
        bbox=detection_data['bbox'],
        confidence=int(detection_data['confidence'] * 100),
        shopper_id=detection_data.get('shopper_id')
    )
    db.add(db_detection)
    db.flush()  # assign id
    return db_detection

def create_session(db: Session, store_id: int, total_shoppers: int, path_data):
    db_session = models.Session(
        start_time=datetime.utcnow(),
        store_id=store_id,
        total_shoppers=total_shoppers,
        path_data=path_data
    )
    db.add(db_session)
    db.flush()
    return db_session

def get_session(db: Session, session_id: int):
    return db.query(models.Session).filter(models.Session.id == session_id).first()
