from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import Base, engine
from app.api import auth, stores, analytics

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Consumer Attention Mapping System",
    description="Milestone 2 - Consumer Detection & Attention Analysis",
    version="0.2.0",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(stores.router)
app.include_router(analytics.router)


@app.get("/")
def root():
    return {"message": "Consumer Attention Mapping System API is running"}


@app.get("/health")
def health_check():
    return {"status": "ok"}