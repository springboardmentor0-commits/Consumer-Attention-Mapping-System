from sqlalchemy.orm import Session

from . import models
from . import auth
from . import schemas
from .auth import hash_password


# ---------------- USER ----------------

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(
        models.User.email == email
    ).first()


def create_user(db: Session, user: schemas.UserCreate):

    hashed_password = hash_password(user.password)

    db_user = models.User(
        email=user.email,
        password=hashed_password,
        role_id=user.role_id
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return db_user


# ---------------- STORE ----------------

def create_store(db: Session, store: schemas.StoreCreate):

    db_store = models.Store(
        store_name=store.store_name,
        location=store.location
    )

    db.add(db_store)
    db.commit()
    db.refresh(db_store)

    return db_store


def get_all_stores(db: Session):
    return db.query(models.Store).all()


# ---------------- SHELF ----------------

def create_shelf(db: Session, shelf: schemas.ShelfCreate):

    db_shelf = models.Shelf(
        zone_name=shelf.zone_name,
        store_id=shelf.store_id
    )

    db.add(db_shelf)
    db.commit()
    db.refresh(db_shelf)

    return db_shelf


def get_all_shelves(db: Session):
    return db.query(models.Shelf).all()


def get_shelves_by_store(db: Session, store_id: int):
    return db.query(models.Shelf).filter(models.Shelf.store_id == store_id).all()

