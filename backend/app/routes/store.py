from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.store import Store
from app.schemas.store import StoreCreate

router = APIRouter()


@router.post("/stores")
def create_store(store: StoreCreate, db: Session = Depends(get_db)):

    new_store = Store(
        store_name=store.store_name,
        location=store.location
    )

    db.add(new_store)
    db.commit()
    db.refresh(new_store)

    return {
        "message": "Store added successfully!",
        "store": new_store
    }


@router.get("/stores")
def get_stores(db: Session = Depends(get_db)):

    stores = db.query(Store).all()

    return stores