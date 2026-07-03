from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

import crud
import schemas
import auth
from database import get_db


router = APIRouter(
    tags=["Store & Shelf"]
)




# ------------------------
# STORES
# ------------------------

@router.post("/stores", response_model=schemas.StoreResponse)
def create_store(
    store: schemas.StoreCreate,
    db: Session = Depends(get_db),
    current_user = Depends(auth.require_store_manager)
):
    return crud.create_store(db, store)


@router.get("/stores", response_model=list[schemas.StoreResponse])
def get_stores(
    db: Session = Depends(get_db),
    current_user = Depends(auth.get_current_user)
):
    return crud.get_stores(db)


# ------------------------
# SHELVES
# ------------------------

@router.post("/shelves", response_model=schemas.ShelfResponse)
def create_shelf(
    shelf: schemas.ShelfCreate,
    db: Session = Depends(get_db),
    current_user = Depends(auth.get_current_user)
):
    return crud.create_shelf(db, shelf)


@router.get("/shelves", response_model=list[schemas.ShelfResponse])
def get_shelves(
    db: Session = Depends(get_db),
    current_user = Depends(auth.get_current_user)
):
    return crud.get_shelves(db)