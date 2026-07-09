import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from pydantic import BaseModel
from typing import List

from app.core.db import get_session
from app.core.deps import get_current_user, require_role
from app.models.schemas import Store, Shelf

router = APIRouter(prefix="/stores", tags=["shelves"])

# Schemas
class ShelfCreateRequest(BaseModel):
    shelf_name: str
    zone_coordinates: List[List[float]]  # [[x1, y1], [x2, y2]] style polygons

class ShelfResponse(BaseModel):
    id: uuid.UUID
    store_id: uuid.UUID
    shelf_name: str
    zone_coordinates: List[List[float]]
    created_at: datetime

@router.get("/{storeId}/shelves", response_model=List[ShelfResponse])
def list_shelves_for_store(
    storeId: uuid.UUID,
    session: Session = Depends(get_session),
    current_user = Depends(get_current_user)
):
    # Verify store exists
    store = session.get(Store, storeId)
    if not store:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Store not found"
        )
        
    return [
        ShelfResponse(
            id=shelf.id,
            store_id=shelf.store_id,
            shelf_name=shelf.shelf_name,
            zone_coordinates=shelf.zone_coordinates,
            created_at=shelf.created_at
        ) for shelf in store.shelves
    ]

@router.post("/{storeId}/shelves", response_model=ShelfResponse, status_code=status.HTTP_201_CREATED)
def create_shelf(
    storeId: uuid.UUID,
    payload: ShelfCreateRequest,
    session: Session = Depends(get_session),
    current_user = Depends(require_role("Store Manager", "Admin"))
):
    # Verify store exists
    store = session.get(Store, storeId)
    if not store:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Store not found"
        )
        
    new_shelf = Shelf(
        store_id=store.id,
        shelf_name=payload.shelf_name,
        zone_coordinates=payload.zone_coordinates
    )
    
    session.add(new_shelf)
    session.commit()
    session.refresh(new_shelf)
    
    return ShelfResponse(
        id=new_shelf.id,
        store_id=new_shelf.store_id,
        shelf_name=new_shelf.shelf_name,
        zone_coordinates=new_shelf.zone_coordinates,
        created_at=new_shelf.created_at
    )
