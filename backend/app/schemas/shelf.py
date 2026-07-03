from pydantic import BaseModel

class ShelfCreate(BaseModel):
    zone_name: str
    store_id: int