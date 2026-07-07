from pydantic import BaseModel


# ---------------- ROLE ----------------

class RoleBase(BaseModel):
    role_name: str


class Role(RoleBase):
    id: int

    class Config:
        from_attributes = True


# ---------------- REGISTER ----------------

class UserCreate(BaseModel):
    email: str
    password: str
    role_id: int


# ---------------- LOGIN ----------------

class UserLogin(BaseModel):
    email: str
    password: str


# ---------------- RESPONSE ----------------

class User(BaseModel):
    id: int
    email: str
    role_id: int

    class Config:
        from_attributes = True


# ---------------- JWT ----------------

class Token(BaseModel):
    access_token: str
    token_type: str


# ---------------- STORE ----------------

class StoreCreate(BaseModel):
    store_name: str
    location: str


class Store(BaseModel):
    id: int
    store_name: str
    location: str

    class Config:
        from_attributes = True


# ---------------- SHELF ----------------

class ShelfCreate(BaseModel):
    zone_name: str
    store_id: int


class Shelf(BaseModel):
    id: int
    zone_name: str
    store_id: int

    class Config:
        from_attributes = True