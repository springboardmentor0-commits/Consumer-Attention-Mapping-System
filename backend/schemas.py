from pydantic import BaseModel


class UserRegister(BaseModel):
    email:str
    password:str
    role_id:int


class UserLogin(BaseModel):
    email:str
    password:str



class StoreCreate(BaseModel):
    store_name: str
    location: str


class ShelfCreate(BaseModel):
    store_id: int
    shelf_name: str
    zone_name: str
    zone_coordinates: str