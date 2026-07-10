import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_roles
from app.db.database import get_db
from app.models.store import Store, Zone, Shelf
from app.models.user import User
from app.models.enums import RoleEnum
from app.schemas.store import (
    StoreCreate, StoreOut,
    ZoneCreate, ZoneOut,
    ShelfCreate, ShelfOut,
)

router = APIRouter(prefix="/stores", tags=["Store & Shelf Management"])

MANAGE_ROLES = (RoleEnum.ADMIN, RoleEnum.STORE_MANAGER)


# ---------- Stores ----------

@router.post("", response_model=StoreOut, status_code=201)
def create_store(
    payload: StoreCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(*MANAGE_ROLES)),
):
    store = Store(**payload.model_dump())
    db.add(store)
    db.commit()
    db.refresh(store)
    return store


@router.get("", response_model=list[StoreOut])
def list_stores(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return db.query(Store).all()


@router.get("/{store_id}", response_model=StoreOut)
def get_store(store_id: uuid.UUID, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    store = db.get(Store, store_id)
    if not store:
        raise HTTPException(status_code=404, detail="Store not found")
    return store


@router.delete("/{store_id}", status_code=204)
def delete_store(
    store_id: uuid.UUID,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(RoleEnum.ADMIN)),
):
    store = db.get(Store, store_id)
    if not store:
        raise HTTPException(status_code=404, detail="Store not found")
    db.delete(store)
    db.commit()


# ---------- Zones ----------

@router.post("/zones", response_model=ZoneOut, status_code=201)
def create_zone(
    payload: ZoneCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(*MANAGE_ROLES)),
):
    if not db.get(Store, payload.store_id):
        raise HTTPException(status_code=404, detail="Store not found")
    zone = Zone(**payload.model_dump())
    db.add(zone)
    db.commit()
    db.refresh(zone)
    return zone


@router.get("/{store_id}/zones", response_model=list[ZoneOut])
def list_zones(store_id: uuid.UUID, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return db.query(Zone).filter(Zone.store_id == store_id).all()


# ---------- Shelves ----------

@router.post("/shelves", response_model=ShelfOut, status_code=201)
def create_shelf(
    payload: ShelfCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(*MANAGE_ROLES)),
):
    if not db.get(Store, payload.store_id):
        raise HTTPException(status_code=404, detail="Store not found")
    shelf = Shelf(**payload.model_dump())
    db.add(shelf)
    db.commit()
    db.refresh(shelf)
    return shelf


@router.get("/{store_id}/shelves", response_model=list[ShelfOut])
def list_shelves(store_id: uuid.UUID, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return db.query(Shelf).filter(Shelf.store_id == store_id).all()


@router.patch("/shelves/{shelf_id}", response_model=ShelfOut)
def update_shelf(
    shelf_id: uuid.UUID,
    payload: ShelfCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(*MANAGE_ROLES)),
):
    shelf = db.get(Shelf, shelf_id)
    if not shelf:
        raise HTTPException(status_code=404, detail="Shelf not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(shelf, field, value)
    db.commit()
    db.refresh(shelf)
    return shelf
