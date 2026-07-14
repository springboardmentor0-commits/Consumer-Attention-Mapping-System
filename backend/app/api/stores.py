from typing import List

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import (
    get_current_user,
    require_roles,
)

from app.models.database_models import StoreModel
from app.models.store import (
    StoreCreate,
    StoreResponse,
)

# ==========================================================
# Router Configuration
# ==========================================================

router = APIRouter(
    prefix="/api/stores",
    tags=["Stores"],
)


# ==========================================================
# Create Store
# ==========================================================

@router.post(
    "/",
    response_model=StoreResponse,
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
def create_store(
    store: StoreCreate,
    db: Session = Depends(get_db),
):
    """
    Create a new store.
    """

    new_store = StoreModel(
        store_name=store.store_name,
        location=store.location,
    )

    db.add(new_store)
    db.commit()
    db.refresh(new_store)

    return new_store


# ==========================================================
# Get All Stores
# ==========================================================

@router.get(
    "/",
    response_model=List[StoreResponse],
    dependencies=[
        Depends(get_current_user),
    ],
)
def get_all_stores(
    db: Session = Depends(get_db),
):
    """
    Retrieve all stores.
    """

    return db.query(StoreModel).all()