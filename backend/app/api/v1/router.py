from fastapi import APIRouter
from app.api.v1.auth.router import router as auth_router
from app.api.v1.stores.router import router as stores_router
from app.api.v1.cameras.router import router as cameras_router

api_router = APIRouter()

# Register sub-routers
api_router.include_router(auth_router, prefix="/auth")
api_router.include_router(stores_router, prefix="/stores")
api_router.include_router(cameras_router, prefix="/cameras")
