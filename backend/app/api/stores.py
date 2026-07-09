import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from pydantic import BaseModel
from typing import List, Optional, Any

from app.core.db import get_session
from app.core.deps import get_current_user, require_role
from app.models.schemas import Store, Shelf

router = APIRouter(prefix="/stores", tags=["stores"])

# Schemas
class ZoneCreate(BaseModel):
    name: str
    coordinates: List[List[float]]  # [[x1, y1], [x2, y2]] style polygons

class StoreCreateRequest(BaseModel):
    name: str
    location: str
    zones: Optional[List[ZoneCreate]] = []

class ZoneResponse(BaseModel):
    zone_id: uuid.UUID
    name: str
    coordinates: List[List[float]]

class StoreLayoutResponse(BaseModel):
    layout_id: uuid.UUID
    name: str
    zones: List[ZoneResponse]

class StoreListItem(BaseModel):
    id: uuid.UUID
    name: str
    location: str
    created_at: datetime

@router.get("", response_model=List[StoreListItem])
def list_stores(
    session: Session = Depends(get_session),
    current_user = Depends(get_current_user)
):
    stores = session.exec(select(Store)).all()
    return [
        StoreListItem(
            id=store.id,
            name=store.name,
            location=store.location,
            created_at=store.created_at
        ) for store in stores
    ]

@router.post("", response_model=StoreLayoutResponse, status_code=status.HTTP_201_CREATED)
def create_store(
    payload: StoreCreateRequest,
    session: Session = Depends(get_session),
    current_user = Depends(require_role("StoreManager", "SuperAdmin", "Admin"))
):
    # 1. Create the Store record
    new_store = Store(
        name=payload.name,
        location=payload.location,
        store_metadata={"created_by": current_user.email}
    )
    session.add(new_store)
    session.commit()
    session.refresh(new_store)

    # 2. Create the associated Shelf records for each zone
    created_zones = []
    for zone in payload.zones:
        new_shelf = Shelf(
            store_id=new_store.id,
            shelf_name=zone.name,
            zone_coordinates=zone.coordinates
        )
        session.add(new_shelf)
        session.commit()
        session.refresh(new_shelf)
        
        created_zones.append(
            ZoneResponse(
                zone_id=new_shelf.id,
                name=new_shelf.shelf_name,
                coordinates=new_shelf.zone_coordinates
            )
        )

    return StoreLayoutResponse(
        layout_id=new_store.id,
        name=new_store.name,
        zones=created_zones
    )

@router.get("/{storeId}", response_model=StoreLayoutResponse)
def get_store(
    storeId: uuid.UUID,
    session: Session = Depends(get_session),
    current_user = Depends(get_current_user)
):
    # 1. Fetch store
    store = session.get(Store, storeId)
    if not store:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Store not found"
        )
        
    # 2. Map shelves to zone responses
    zones = [
        ZoneResponse(
            zone_id=shelf.id,
            name=shelf.shelf_name,
            coordinates=shelf.zone_coordinates
        ) for shelf in store.shelves
    ]
    
    return StoreLayoutResponse(
        layout_id=store.id,
        name=store.name,
        zones=zones
    )
