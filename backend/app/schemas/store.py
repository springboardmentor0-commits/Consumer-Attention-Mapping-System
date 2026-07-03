from pydantic import BaseModel


class StoreCreate(BaseModel):
    store_name: str
    location: str