from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db

from app.models.store import (
    StoreCreate,
    StoreResponse,
)

from app.models.shelf import (
    ShelfCreate,
    ShelfResponse,
)

from app.models.database_models import (
    StoreModel,
    ShelfModel,
)


# ==========================================================
# Router Configuration
# ==========================================================

router = APIRouter(
    prefix="/layout",
    tags=["Store & Shelf Management"],
)


# ==========================================================
# Create Store
# ==========================================================

@router.post(
    "/stores",
    response_model=StoreResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_store(
    payload: StoreCreate,
    db: Session = Depends(get_db),
):
    """
    Create a new retail store.
    """

    new_store = StoreModel(
        store_name=payload.store_name,
        location=payload.location,
    )

    db.add(new_store)
    db.commit()
    db.refresh(new_store)

    return new_store


# ==========================================================
# Get All Stores
# ==========================================================

@router.get(
    "/stores",
    response_model=List[StoreResponse],
)
def get_all_stores(
    db: Session = Depends(get_db),
):
    """
    Retrieve all registered stores.
    """

    return db.query(StoreModel).all()


# ==========================================================
# Create Shelf
# ==========================================================

@router.post(
    "/shelves",
    response_model=ShelfResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_shelf(
    payload: ShelfCreate,
    db: Session = Depends(get_db),
):
    """
    Create a new shelf for an existing store.
    """

    # Verify the store exists
    store = (
        db.query(StoreModel)
        .filter(StoreModel.id == payload.store_id)
        .first()
    )

    if store is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Store with ID {payload.store_id} does not exist.",
        )

    new_shelf = ShelfModel(
        store_id=payload.store_id,
        shelf_name=payload.shelf_name,
        zone_coordinates=payload.zone_coordinates,
    )

    db.add(new_shelf)
    db.commit()
    db.refresh(new_shelf)

    return new_shelf


# ==========================================================
# Get All Shelves
# ==========================================================

@router.get(
    "/shelves",
    response_model=List[ShelfResponse],
)
def get_all_shelves(
    db: Session = Depends(get_db),
):
    """
    Retrieve all shelves.
    """

    return db.query(ShelfModel).all()