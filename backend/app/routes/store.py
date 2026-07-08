from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.models.shelf import Shelf

from app.auth.dependencies import require_role, get_current_user
from app.database import get_db
from app.models.store import Store
from app.schemas.store import StoreCreate

router = APIRouter()


@router.post("/stores")
def create_store(
    store: StoreCreate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_role(["Admin", "Store Manager"])
    )
):

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
def get_stores(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    stores = db.query(Store).all()

    return stores


@router.delete("/stores/{store_id}")
def delete_store(
    store_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_role(["Admin", "Store Manager"])
    )
):

    store = db.query(Store).filter(
        Store.id == store_id
    ).first()

    if not store:
        raise HTTPException(
            status_code=404,
            detail="Store not found"
        )

    # Delete all shelves belonging to this store
    db.query(Shelf).filter(
        Shelf.store_id == store_id
    ).delete()

    # Delete the store
    db.delete(store)

    db.commit()

    return {
        "message": "Store and associated shelves deleted successfully!"
    }