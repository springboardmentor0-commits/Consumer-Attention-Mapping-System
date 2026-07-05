# Create this file inside backend/app/api/
from fastapi import APIRouter, HTTPException, Depends, status
from typing import List
from sqlalchemy.orm import Session

# Import our database connectors, checklists, and blueprints
from app.core.database import get_db 
from app.models.store import StoreCreate, StoreResponse, ShelfCreate, ShelfResponse
from app.models.database_models import StoreModel, ShelfModel

# Setting up our layout router section
router = APIRouter(prefix="/layout", tags=["Store & Shelf Management"])


# =======================================================
# BUTTON 1: Add a new Store to PostgreSQL
# =======================================================
@router.post("/stores", response_model=StoreResponse, status_code=status.HTTP_201_CREATED)
def create_store(payload: StoreCreate, db: Session = Depends(get_db)):
    # 1. Turn the user's incoming form data into a database row object
    new_store = StoreModel(
        name=payload.name,
        location=payload.location
    )
    
    # 2. Add it to the database workspace staging area
    db.add(new_store)
    
    # 3. Hit save permanently on PostgreSQL!
    db.commit()
    
    # 4. Refresh to read the new automatic ID number assigned by Postgres
    db.refresh(new_store)
    
    return new_store


# =======================================================
# BUTTON 2: Get a list of all saved Stores
# =======================================================
@router.get("/stores", response_model=List[StoreResponse])
def get_all_stores(db: Session = Depends(get_db)):
    # Run a quick "SELECT * FROM stores" query automatically
    all_stores = db.query(StoreModel).all()
    return all_stores


# =======================================================
# BUTTON 3: Map a new Shelf zone to a Store
# =======================================================
@router.post("/shelves", response_model=ShelfResponse, status_code=status.HTTP_201_CREATED)
def create_shelf(payload: ShelfCreate, db: Session = Depends(get_db)):
    
    # CRITICAL CHECK: Look into the database to see if the store_id provided actually exists!
    target_store = db.query(StoreModel).filter(StoreModel.id == payload.store_id).first()
    
    # If the database searches and finds absolutely nothing (None), stop everything!
    if target_store is None:
        raise HTTPException(
            status_code=404, 
            detail=f"Cannot add shelf. Store ID {payload.store_id} does not exist in our database records."
        )
        
    # If the store exists, create the new shelf row safely
    new_shelf = ShelfModel(
        store_id=payload.store_id,
        zone_name=payload.zone_name,
        capacity=payload.capacity
    )
    
    db.add(new_shelf)
    db.commit()
    db.refresh(new_shelf)
    
    return new_shelf


# =======================================================
# BUTTON 4: Get a list of all mapped Shelves
# =======================================================
@router.get("/shelves", response_model=List[ShelfResponse])
def get_all_shelves(db: Session = Depends(get_db)):
    all_shelves = db.query(ShelfModel).all()
    return all_shelves