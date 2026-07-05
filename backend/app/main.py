# backend/app/main.py
from fastapi import FastAPI
from app.api import auth
from app.api import layout


app = FastAPI(title="Consumer Attention Mapping System")

# Mount authentication endpoints
app.include_router(auth.router)
# Mount store and shelf management endpoints
app.include_router(layout.router)

@app.get("/")
def root():
    return {"status": "Infrastructure Live"}

#uvicorn main:app --reload