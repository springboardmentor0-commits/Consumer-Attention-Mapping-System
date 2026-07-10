from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware

from app.core.config import settings
from app.db.database import Base, engine
from app.api.routes import auth, users, stores, cameras

# Import models so their tables are registered on Base.metadata before create_all
import app.models  # noqa: F401

app = FastAPI(
    title=settings.APP_NAME,
    description="AI-powered retail consumer attention intelligence platform.",
    version="0.1.0",
)

# Needed by Authlib's OAuth2 flow to keep the temporary state.
app.add_middleware(SessionMiddleware, secret_key=settings.SECRET_KEY)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

API_PREFIX = "/api/v1"
app.include_router(auth.router, prefix=API_PREFIX)
app.include_router(users.router, prefix=API_PREFIX)
app.include_router(stores.router, prefix=API_PREFIX)
app.include_router(cameras.router, prefix=API_PREFIX)


@app.on_event("startup")
def on_startup():
    # For Milestone 1 we create tables directly. From Milestone 2 onward,
    # switch fully to Alembic migrations (see alembic/ directory).
    Base.metadata.create_all(bind=engine)


@app.get("/health", tags=["System"])
def health_check():
    return {"status": "ok", "app": settings.APP_NAME, "env": settings.ENV}
