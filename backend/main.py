from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy import text
from sqlalchemy.orm import Session

from database import engine, get_db, Base
from models import User, Role, Store, Shelf
from schemas import UserRegister, UserLogin, StoreCreate, ShelfCreate
from auth import hash_password, verify_password, create_access_token

# Create all database tables
Base.metadata.create_all(bind=engine)

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"status": "running"}


@app.get("/db-test")
def test_database():
    with engine.connect() as connection:
        result = connection.execute(text("SELECT 1"))
        return {
            "database": "connected",
            "result": result.scalar()
        }


@app.post("/register")
def register_user(
    user_data: UserRegister,
    db: Session = Depends(get_db)
):
    existing_user = db.query(User).filter(
        User.email == user_data.email
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    role = db.query(Role).filter(
        Role.id == user_data.role_id
    ).first()

    if not role:
        raise HTTPException(
            status_code=400,
            detail="Invalid role ID"
        )

    hashed_password = hash_password(user_data.password)

    new_user = User(
        email=user_data.email,
        password_hash=hashed_password,
        role_id=user_data.role_id
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "User registered successfully",
        "user_id": new_user.id,
        "email": new_user.email,
        "role": role.role_name
    }
@app.post("/login")
def login_user(
    user_data: UserLogin,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(
        User.email == user_data.email
    ).first()

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if not verify_password(
        user_data.password,
        user.password_hash
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    token = create_access_token({
        "sub": user.email,
        "role": user.role.role_name
    })

    return {
        "access_token": token,
        "token_type": "bearer",
        "role": user.role.role_name
    }
@app.post("/stores")
def create_store(
    store_data: StoreCreate,
    db: Session = Depends(get_db)
):
    new_store = Store(
        store_name=store_data.store_name,
        location=store_data.location
    )

    db.add(new_store)
    db.commit()
    db.refresh(new_store)

    return {
        "message": "Store created successfully",
        "store": {
            "id": new_store.id,
            "store_name": new_store.store_name,
            "location": new_store.location
        }
    }

@app.get("/stores")
def get_stores(
    db: Session = Depends(get_db)
):
    stores = db.query(Store).all()

    return [
        {
            "id": store.id,
            "store_name": store.store_name,
            "location": store.location
        }
        for store in stores
    ]
@app.post("/shelves")
def create_shelf(
    shelf_data: ShelfCreate,
    db: Session = Depends(get_db)
):
    store = db.query(Store).filter(
        Store.id == shelf_data.store_id
    ).first()

    if not store:
        raise HTTPException(
            status_code=404,
            detail="Store not found"
        )

    new_shelf = Shelf(
        store_id=shelf_data.store_id,
        zone_name=shelf_data.zone_name
    )

    db.add(new_shelf)
    db.commit()
    db.refresh(new_shelf)

    return {
        "message": "Shelf created successfully",
        "shelf": {
            "id": new_shelf.id,
            "store_id": new_shelf.store_id,
            "zone_name": new_shelf.zone_name
        }
    }
@app.get("/shelves")
def get_shelves(
    db: Session = Depends(get_db)
):
    shelves = db.query(Shelf).all()

    return [
        {
            "id": shelf.id,
            "store_id": shelf.store_id,
            "zone_name": shelf.zone_name
        }
        for shelf in shelves
    ]