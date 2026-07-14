from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.core.database import (
    Base,
    engine,
    SessionLocal,
)

from app.models.database_models import (
    RoleModel,
)

from app.api import (
    auth,
    stores,
    shelves,
)

# ==========================================================
# Create Database Tables
# ==========================================================

Base.metadata.create_all(engine)

# ==========================================================
# Seed Default Roles
# ==========================================================

def seed_roles():

    db: Session = SessionLocal()

    try:

        if db.query(RoleModel).count() == 0:

            roles = [
                RoleModel(role_name="Admin"),
                RoleModel(role_name="Store Manager"),
                RoleModel(role_name="Retail Analyst"),
                RoleModel(role_name="Marketing Manager"),
            ]

            db.add_all(roles)

            db.commit()

            print("✓ Default roles inserted.")

        else:

            print("✓ Roles already exist.")

    finally:

        db.close()


seed_roles()

# ==========================================================
# FastAPI Application
# ==========================================================

app = FastAPI(
    title="Consumer Attention Mapping System",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(stores.router)
app.include_router(shelves.router)

@app.get("/")
def root():
    return {
        "message": "Consumer Attention Mapping System API"
    }