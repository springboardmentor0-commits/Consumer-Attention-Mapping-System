from fastapi import FastAPI

from database import engine
from models import Base
from routers import users, products

app = FastAPI()

# Create database tables
Base.metadata.create_all(bind=engine)

# Include routers
app.include_router(users.router)
app.include_router(products.router)

@app.get("/")
def home():
    return {"status": "running"}