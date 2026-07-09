from contextlib import asynccontextmanager
from fastapi import FastAPI
from sqlmodel import Session, select
from app.core.config import settings
from app.core.db import engine
from app.models.schemas import Role
from app.api import auth, stores, shelves

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Seed roles on startup
    with Session(engine) as session:
        allowed_roles = ["SuperAdmin", "StoreManager", "Analyst", "MarketingManager", "Admin"]
        for role_name in allowed_roles:
            role = session.exec(select(Role).where(Role.name == role_name)).first()
            if not role:
                session.add(Role(name=role_name))
        session.commit()
    yield

app = FastAPI(
    title="Consumer Attention Mapping System API",
    lifespan=lifespan
)

# Register routers
app.include_router(auth.router, prefix="/api")
app.include_router(stores.router, prefix="/api")
app.include_router(shelves.router, prefix="/api")


@app.get("/health", status_code=200)
def health_check():
    return {"status": "ok"}

