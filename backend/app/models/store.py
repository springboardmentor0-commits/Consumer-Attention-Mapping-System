from pydantic import BaseModel

# --- STORE TEMPLATES ---
class StoreCreate(BaseModel):
    name: str
    location: str

class StoreResponse(BaseModel):
    id: int
    name: str
    location: str


# --- SHELF TEMPLATES ---
class ShelfCreate(BaseModel):
    store_id: int
    zone_name: str
    capacity: int

class ShelfResponse(BaseModel):
    id: int
    store_id: int
    zone_name: str
    capacity: int