from sqlalchemy.orm import Session
import models
import schemas
from auth import hash_password


def create_user(db: Session, user: schemas.UserCreate):

    hashed_password = hash_password(user.password)

    db_user = models.User(
    name=user.name,
    email=user.email,
    password=hashed_password,
    role_id=2
)

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return db_user


def get_users(db: Session):
    return db.query(models.User).all()


def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

# -------------------------
# STORE CRUD
# -------------------------

def create_store(db: Session, store: schemas.StoreCreate):
    db_store = models.Store(
        store_name=store.store_name,
        location=store.location
    )

    db.add(db_store)
    db.commit()
    db.refresh(db_store)

    return db_store


def get_stores(db: Session):
    return db.query(models.Store).all()


# -------------------------
# SHELF CRUD
# -------------------------

def create_shelf(db: Session, shelf: schemas.ShelfCreate):
    db_shelf = models.Shelf(
        store_id=shelf.store_id,
        zone_name=shelf.zone_name
    )

    db.add(db_shelf)
    db.commit()
    db.refresh(db_shelf)

    return db_shelf


def get_shelves(db: Session):
    return db.query(models.Shelf).all()

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()