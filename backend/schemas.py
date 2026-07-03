from pydantic import BaseModel


class UserCreate(BaseModel):
    name: str
    email: str
    password: str


class UserResponse(BaseModel):
    id: int
    name: str
    email: str

    class Config:
        from_attributes = True

class StoreCreate(BaseModel):
    store_name: str
    location: str


class StoreResponse(BaseModel):
    id: int
    store_name: str
    location: str

    class Config:
        from_attributes = True


class ShelfCreate(BaseModel):
    store_id: int
    zone_name: str


class ShelfResponse(BaseModel):
    id: int
    store_id: int
    zone_name: str

    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    email: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str        