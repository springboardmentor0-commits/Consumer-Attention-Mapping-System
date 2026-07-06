from fastapi import FastAPI
from app.core.database import Base, engine
from app.api import auth, stores

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Consumer Attention Mapping System",
    description="Milestone 1 - Auth + Store & Shelf Management",
    version="0.1.0",
)

app.include_router(auth.router)
app.include_router(stores.router)


@app.get("/")
def root():
    return {"message": "Consumer Attention Mapping System API is running"}


@app.get("/health")
def health_check():
    return {"status": "ok"}