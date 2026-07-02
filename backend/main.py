from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from passlib.context import CryptContext

from database import engine, get_db
from models import Base, User, Role, Store, Shelf
from schemas import (
    UserRegister,
    UserLogin,
    StoreCreate,
    ShelfCreate
)
from auth import (
create_access_token,
get_current_user
)


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

Base.metadata.create_all(bind=engine)

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)


@app.get("/")
def home():
    return {"status": "running"}


@app.post("/register")
def register(
    user: UserRegister,
    db: Session = Depends(get_db)
):

    existing_user = db.query(User).filter(
        User.email == user.email
    ).first()

    if existing_user:

        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    hashed_password = pwd_context.hash(
        user.password
    )

    new_user = User(
        email=user.email,
        password_hash=hashed_password,
        role_id=user.role_id
    )

    db.add(new_user)

    db.commit()

    db.refresh(new_user)

    return {
        "message":"User created successfully"
    }
    

@app.post("/login")
def login(
    user: UserLogin,
    db: Session = Depends(get_db)
):

    db_user = db.query(User).filter(
        User.email == user.email
    ).first()

    if not db_user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email"
        )

    valid_password = pwd_context.verify(
        user.password,
        db_user.password_hash
    )

    if not valid_password:
        raise HTTPException(
            status_code=401,
            detail="Invalid password"
        )

    token = create_access_token(
        {
            "email": db_user.email,
            "role_id": db_user.role_id
        }
    )

    return {
        "access_token": token,
        "token_type": "bearer"
    }

@app.post("/stores")
def create_store(
    store: StoreCreate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):

    new_store = Store(
        store_name=store.store_name,
        location=store.location
    )

    db.add(new_store)
    db.commit()

    return {
        "message": "Store created"
    }


@app.get("/stores")
def get_stores(
    db: Session = Depends(get_db)
):

    stores = db.query(Store).all()

    return stores


@app.post("/shelves")
def create_shelf(
    shelf: ShelfCreate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):

    new_shelf = Shelf(
    store_id=shelf.store_id,
    shelf_name=shelf.shelf_name,
    zone_name=shelf.zone_name,
    zone_coordinates=shelf.zone_coordinates
)

    db.add(new_shelf)
    db.commit()

    return {
        "message":"Shelf created"
    }


@app.get("/shelves")
def get_shelves(
    db: Session = Depends(get_db)
):

    shelves = db.query(Shelf).all()

    return shelves