from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.auth import router as auth_router
from app.database import engine
from app.models.role import Role
from app.models.user import User
from app.models.store import Store
from app.models.shelf import Shelf

from app.models.base import Base

app = FastAPI(
    title="Consumer Attention Mapping System",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)
app.include_router(auth_router)

@app.get("/")
def root():
    return {
        "message": "Consumer Attention Mapping System API",
        "status": "running"
    }