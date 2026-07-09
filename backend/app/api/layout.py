import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from pydantic import BaseModel
from typing import List, Optional, Any

from app.core.db import get_session
from app.core.deps import get_current_user, require_role
from app.models.schemas import Store, Shelf, Zone, Camera

router = APIRouter(prefix="", tags=["layout"])

# ─── PYDANTIC SCHEMAS ──────────────────────────────────────────────────────────

class ZoneCreate(BaseModel):
    name: str
    coordinates: List[List[float]]

class StoreCreateRequest(BaseModel):
    name: str
    location: str
    zones: Optional[List[ZoneCreate]] = []

class StoreUpdateRequest(BaseModel):
    name: Optional[str] = None
    location: Optional[str] = None

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

# Shelves
class ShelfCreateRequest(BaseModel):
    shelf_name: str
    zone_coordinates: List[List[float]]

class ShelfUpdateRequest(BaseModel):
    shelf_name: Optional[str] = None
    zone_coordinates: Optional[List[List[float]]] = None

class ShelfResponse(BaseModel):
    id: uuid.UUID
    store_id: uuid.UUID
    shelf_name: str
    zone_coordinates: List[List[float]]
    created_at: datetime

# Zones
class ZoneCreateRequest(BaseModel):
    zone_name: str
    coordinates: List[List[float]]
    zone_type: str

class ZoneUpdateRequest(BaseModel):
    zone_name: Optional[str] = None
    coordinates: Optional[List[List[float]]] = None
    zone_type: Optional[str] = None

class ZoneDetailResponse(BaseModel):
    id: uuid.UUID
    store_id: uuid.UUID
    zone_name: str
    coordinates: List[List[float]]
    zone_type: str
    created_at: datetime

# Cameras
class CameraCreateRequest(BaseModel):
    camera_name: str
    stream_url: str
    status: Optional[str] = "active"
    zone_id: Optional[uuid.UUID] = None

class CameraUpdateRequest(BaseModel):
    camera_name: Optional[str] = None
    stream_url: Optional[str] = None
    status: Optional[str] = None
    zone_id: Optional[uuid.UUID] = None

class CameraResponse(BaseModel):
    id: uuid.UUID
    store_id: uuid.UUID
    zone_id: Optional[uuid.UUID]
    camera_name: str
    stream_url: str
    status: str
    created_at: datetime


# ─── STORE ENDPOINTS ───────────────────────────────────────────────────────────

@router.get("/stores", response_model=List[StoreListItem])
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

@router.post("/stores", response_model=StoreLayoutResponse, status_code=status.HTTP_201_CREATED)
def create_store(
    payload: StoreCreateRequest,
    session: Session = Depends(get_session),
    current_user = Depends(require_role("Store Manager", "Admin"))
):
    new_store = Store(
        name=payload.name,
        location=payload.location,
        store_metadata={"created_by": current_user.email}
    )
    session.add(new_store)
    session.commit()
    session.refresh(new_store)

    created_zones = []
    # If initial zones are provided, create shelves for backwards compatibility
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

@router.put("/stores/{store_id}", response_model=StoreListItem)
def update_store(
    store_id: uuid.UUID,
    payload: StoreUpdateRequest,
    session: Session = Depends(get_session),
    current_user = Depends(require_role("Store Manager", "Admin"))
):
    store = session.get(Store, store_id)
    if not store:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Store not found")
    
    if payload.name is not None:
        store.name = payload.name
    if payload.location is not None:
        store.location = payload.location
        
    session.add(store)
    session.commit()
    session.refresh(store)
    return StoreListItem(
        id=store.id,
        name=store.name,
        location=store.location,
        created_at=store.created_at
    )

@router.delete("/stores/{store_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_store(
    store_id: uuid.UUID,
    session: Session = Depends(get_session),
    current_user = Depends(require_role("Store Manager", "Admin"))
):
    store = session.get(Store, store_id)
    if not store:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Store not found")
    session.delete(store)
    session.commit()
    return None


# ─── SHELVES ENDPOINTS ─────────────────────────────────────────────────────────

@router.get("/stores/{store_id}/shelves", response_model=List[ShelfResponse])
def list_shelves(
    store_id: uuid.UUID,
    session: Session = Depends(get_session),
    current_user = Depends(get_current_user)
):
    store = session.get(Store, store_id)
    if not store:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Store not found")
    return [
        ShelfResponse(
            id=shelf.id,
            store_id=shelf.store_id,
            shelf_name=shelf.shelf_name,
            zone_coordinates=shelf.zone_coordinates,
            created_at=shelf.created_at
        ) for shelf in store.shelves
    ]

@router.post("/stores/{store_id}/shelves", response_model=ShelfResponse, status_code=status.HTTP_201_CREATED)
def create_shelf(
    store_id: uuid.UUID,
    payload: ShelfCreateRequest,
    session: Session = Depends(get_session),
    current_user = Depends(require_role("Store Manager", "Admin"))
):
    store = session.get(Store, store_id)
    if not store:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Store not found")
        
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

@router.put("/shelves/{shelf_id}", response_model=ShelfResponse)
def update_shelf(
    shelf_id: uuid.UUID,
    payload: ShelfUpdateRequest,
    session: Session = Depends(get_session),
    current_user = Depends(require_role("Store Manager", "Admin"))
):
    shelf = session.get(Shelf, shelf_id)
    if not shelf:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Shelf not found")
        
    if payload.shelf_name is not None:
        shelf.shelf_name = payload.shelf_name
    if payload.zone_coordinates is not None:
        shelf.zone_coordinates = payload.zone_coordinates
        
    session.add(shelf)
    session.commit()
    session.refresh(shelf)
    return ShelfResponse(
        id=shelf.id,
        store_id=shelf.store_id,
        shelf_name=shelf.shelf_name,
        zone_coordinates=shelf.zone_coordinates,
        created_at=shelf.created_at
    )

@router.delete("/shelves/{shelf_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_shelf(
    shelf_id: uuid.UUID,
    session: Session = Depends(get_session),
    current_user = Depends(require_role("Store Manager", "Admin"))
):
    shelf = session.get(Shelf, shelf_id)
    if not shelf:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Shelf not found")
    session.delete(shelf)
    session.commit()
    return None


# ─── ZONES ENDPOINTS ───────────────────────────────────────────────────────────

@router.get("/stores/{store_id}/zones", response_model=List[ZoneDetailResponse])
def list_zones(
    store_id: uuid.UUID,
    session: Session = Depends(get_session),
    current_user = Depends(get_current_user)
):
    store = session.get(Store, store_id)
    if not store:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Store not found")
    return [
        ZoneDetailResponse(
            id=zone.id,
            store_id=zone.store_id,
            zone_name=zone.zone_name,
            coordinates=zone.coordinates,
            zone_type=zone.zone_type,
            created_at=zone.created_at
        ) for zone in store.zones
    ]

@router.post("/stores/{store_id}/zones", response_model=ZoneDetailResponse, status_code=status.HTTP_201_CREATED)
def create_zone(
    store_id: uuid.UUID,
    payload: ZoneCreateRequest,
    session: Session = Depends(get_session),
    current_user = Depends(require_role("Store Manager", "Admin"))
):
    store = session.get(Store, store_id)
    if not store:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Store not found")
        
    new_zone = Zone(
        store_id=store.id,
        zone_name=payload.zone_name,
        coordinates=payload.coordinates,
        zone_type=payload.zone_type
    )
    session.add(new_zone)
    session.commit()
    session.refresh(new_zone)
    return ZoneDetailResponse(
        id=new_zone.id,
        store_id=new_zone.store_id,
        zone_name=new_zone.zone_name,
        coordinates=new_zone.coordinates,
        zone_type=new_zone.zone_type,
        created_at=new_zone.created_at
    )

@router.put("/zones/{zone_id}", response_model=ZoneDetailResponse)
def update_zone(
    zone_id: uuid.UUID,
    payload: ZoneUpdateRequest,
    session: Session = Depends(get_session),
    current_user = Depends(require_role("Store Manager", "Admin"))
):
    zone = session.get(Zone, zone_id)
    if not zone:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Zone not found")
        
    if payload.zone_name is not None:
        zone.zone_name = payload.zone_name
    if payload.coordinates is not None:
        zone.coordinates = payload.coordinates
    if payload.zone_type is not None:
        zone.zone_type = payload.zone_type
        
    session.add(zone)
    session.commit()
    session.refresh(zone)
    return ZoneDetailResponse(
        id=zone.id,
        store_id=zone.store_id,
        zone_name=zone.zone_name,
        coordinates=zone.coordinates,
        zone_type=zone.zone_type,
        created_at=zone.created_at
    )

@router.delete("/zones/{zone_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_zone(
    zone_id: uuid.UUID,
    session: Session = Depends(get_session),
    current_user = Depends(require_role("Store Manager", "Admin"))
):
    zone = session.get(Zone, zone_id)
    if not zone:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Zone not found")
    session.delete(zone)
    session.commit()
    return None


# ─── CAMERAS ENDPOINTS ─────────────────────────────────────────────────────────

@router.get("/stores/{store_id}/cameras", response_model=List[CameraResponse])
def list_cameras(
    store_id: uuid.UUID,
    session: Session = Depends(get_session),
    current_user = Depends(get_current_user)
):
    store = session.get(Store, store_id)
    if not store:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Store not found")
    return [
        CameraResponse(
            id=camera.id,
            store_id=camera.store_id,
            zone_id=camera.zone_id,
            camera_name=camera.camera_name,
            stream_url=camera.stream_url,
            status=camera.status,
            created_at=camera.created_at
        ) for camera in store.cameras
    ]

@router.post("/stores/{store_id}/cameras", response_model=CameraResponse, status_code=status.HTTP_201_CREATED)
def create_camera(
    store_id: uuid.UUID,
    payload: CameraCreateRequest,
    session: Session = Depends(get_session),
    current_user = Depends(require_role("Store Manager", "Admin"))
):
    store = session.get(Store, store_id)
    if not store:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Store not found")
        
    if payload.zone_id:
        zone = session.get(Zone, payload.zone_id)
        if not zone:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Zone not found")
            
    new_camera = Camera(
        store_id=store.id,
        zone_id=payload.zone_id,
        camera_name=payload.camera_name,
        stream_url=payload.stream_url,
        status=payload.status or "active"
    )
    session.add(new_camera)
    session.commit()
    session.refresh(new_camera)
    return CameraResponse(
        id=new_camera.id,
        store_id=new_camera.store_id,
        zone_id=new_camera.zone_id,
        camera_name=new_camera.camera_name,
        stream_url=new_camera.stream_url,
        status=new_camera.status,
        created_at=new_camera.created_at
    )

@router.put("/cameras/{camera_id}", response_model=CameraResponse)
def update_camera(
    camera_id: uuid.UUID,
    payload: CameraUpdateRequest,
    session: Session = Depends(get_session),
    current_user = Depends(require_role("Store Manager", "Admin"))
):
    camera = session.get(Camera, camera_id)
    if not camera:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Camera not found")
        
    if payload.zone_id is not None:
        if payload.zone_id:
            zone = session.get(Zone, payload.zone_id)
            if not zone:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Zone not found")
        camera.zone_id = payload.zone_id
        
    if payload.camera_name is not None:
        camera.camera_name = payload.camera_name
    if payload.stream_url is not None:
        camera.stream_url = payload.stream_url
    if payload.status is not None:
        camera.status = payload.status
        
    session.add(camera)
    session.commit()
    session.refresh(camera)
    return CameraResponse(
        id=camera.id,
        store_id=camera.store_id,
        zone_id=camera.zone_id,
        camera_name=camera.camera_name,
        stream_url=camera.stream_url,
        status=camera.status,
        created_at=camera.created_at
    )

@router.delete("/cameras/{camera_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_camera(
    camera_id: uuid.UUID,
    session: Session = Depends(get_session),
    current_user = Depends(require_role("Store Manager", "Admin"))
):
    camera = session.get(Camera, camera_id)
    if not camera:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Camera not found")
    session.delete(camera)
    session.commit()
    return None
