from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.shelf import Shelf
from app.schemas.shelf import ShelfCreate

router = APIRouter()


@router.post("/shelves")
def create_shelf(shelf: ShelfCreate, db: Session = Depends(get_db)):

    new_shelf = Shelf(
        zone_name=shelf.zone_name,
        store_id=shelf.store_id
    )

    db.add(new_shelf)
    db.commit()
    db.refresh(new_shelf)

    return {
        "message": "Shelf added successfully!",
        "shelf": new_shelf
    }


@router.get("/shelves")
def get_shelves(db: Session = Depends(get_db)):

    return db.query(Shelf).all()