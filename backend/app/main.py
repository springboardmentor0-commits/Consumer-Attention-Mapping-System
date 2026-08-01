# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import analytics, auth, shelves, stores

app = FastAPI(title="Consumer Attention Mapping System")

# Enable CORS for React Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(analytics.router)
app.include_router(auth.router)
app.include_router(shelves.router)
app.include_router(stores.router)

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "API is running successfully!"}