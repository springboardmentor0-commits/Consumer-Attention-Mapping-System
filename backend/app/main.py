from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from . import models
from . import schemas
from . import crud
from . import auth

from .database import engine, get_db, SessionLocal

# Create all database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Consumer Attention Mapping System")


# ---------------------- CORS ----------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------- Insert Default Roles ----------------------

def seed_roles():
    db = SessionLocal()

    try:

        if db.query(models.Role).count() == 0:

            roles = [

                models.Role(id=1, role_name="Admin"),

                models.Role(id=2, role_name="Store Manager"),

                models.Role(id=3, role_name="Retail Analyst"),

                models.Role(id=4, role_name="Marketing Manager"),

            ]

            db.add_all(roles)

            db.commit()

    finally:

        db.close()


seed_roles()


# ---------------------- Home ----------------------

@app.get("/")
def home():
    return {
        "status": "Backend Running Successfully"
    }


# ---------------------- Register ----------------------

@app.post("/register")
def register(
        user: schemas.UserCreate,
        db: Session = Depends(get_db)
):

    existing_user = crud.get_user_by_email(
        db,
        user.email
    )

    if existing_user:

        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    crud.create_user(
        db,
        user
    )

    return {
        "message": "Registration Successful"
    }


# ---------------------- Login ----------------------

@app.post("/login")
def login(
        user: schemas.UserLogin,
        db: Session = Depends(get_db)
):

    db_user = crud.get_user_by_email(
        db,
        user.email
    )

    if db_user is None:

        raise HTTPException(
            status_code=401,
            detail="Invalid Email"
        )

    if not auth.verify_password(
            user.password,
            db_user.password
    ):

        raise HTTPException(
            status_code=401,
            detail="Invalid Password"
        )

    token = auth.create_access_token(
        {
            "sub": db_user.email,
            "role": db_user.role_id
        }
    )

    return {
        "access_token": token,
        "token_type": "Bearer"
    }


# ---------------------- Store ----------------------

@app.post("/stores")
def add_store(
        store: schemas.StoreCreate,
        user=Depends(auth.require_permission("create_store")),
        db: Session = Depends(get_db)
):

    crud.create_store(
        db,
        store
    )

    return {
        "message": "Store Added Successfully"
    }


@app.get("/stores")
def get_stores(
        db: Session = Depends(get_db)
):

    return crud.get_all_stores(db)


# ---------------------- Shelf ----------------------

@app.post("/shelves")
def add_shelf(
        shelf: schemas.ShelfCreate,
        user=Depends(auth.require_permission("create_shelf")),
        db: Session = Depends(get_db)
):

    crud.create_shelf(
        db,
        shelf
    )

    return {
        "message": "Shelf Added Successfully"
    }


@app.get("/shelves")
def get_shelves(
        db: Session = Depends(get_db)
):

    return crud.get_all_shelves(db)
