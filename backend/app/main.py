from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select
from app.core.config import settings
from app.core.db import engine
from app.models.schemas import Role
from app.api import auth, layout, video

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Seed roles on startup
    with Session(engine) as session:
        allowed_roles = ["Store Manager", "Retail Analyst", "Marketing Manager", "Admin"]
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

# ── CORS ──────────────────────────────────────────────────────────────────────
# Allow the React dev server (any localhost port) and production origin to call
# the API. Adjust ALLOW_ORIGINS in production to your real domain.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router, prefix="/api")
app.include_router(layout.router, prefix="/api")
app.include_router(video.router, prefix="/api")




@app.get("/")
def root():
    return {
        "message": "Welcome to Consumer Attention Mapping System API",
        "docs": "/docs",
        "health": "/health"
    }


@app.get("/health", status_code=200)
def health_check():
    return {"status": "ok"}


