from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import (
    get_current_user,
    require_roles,
)

from app.models.database_models import (
    ShelfModel,
    StoreModel,
)

from app.models.shelf import (
    ShelfCreate,
    ShelfResponse,
)

router = APIRouter(
    prefix="/api/shelves",
    tags=["Shelves"],
)


# ==========================================================
# Create Shelf
# ==========================================================

@router.post(
    "/",
    response_model=ShelfResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[
        Depends(
            require_roles(
                "Admin",
                "Store Manager",
            )
        )
    ],
)
def create_shelf(
    shelf: ShelfCreate,
    db: Session = Depends(get_db),
):
    """
    Create a new shelf for an existing store.
    """

    store = (
        db.query(StoreModel)
        .filter(StoreModel.id == shelf.store_id)
        .first()
    )

    if store is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Store not found.",
        )

    new_shelf = ShelfModel(
        store_id=shelf.store_id,
        shelf_name=shelf.shelf_name,
        zone_coordinates=shelf.zone_coordinates,
    )

    db.add(new_shelf)
    db.commit()
    db.refresh(new_shelf)

    return new_shelf


# ==========================================================
# Get All Shelves
# ==========================================================

@router.get(
    "/",
    response_model=List[ShelfResponse],
    dependencies=[Depends(get_current_user)],
)
def get_all_shelves(
    db: Session = Depends(get_db),
):
    """
    Retrieve all shelves.
    """

    return db.query(ShelfModel).all()