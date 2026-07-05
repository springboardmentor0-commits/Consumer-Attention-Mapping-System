# backend/app/main.py
from fastapi import FastAPI
from app.api import auth

app = FastAPI(title="Consumer Attention Mapping System")

# Mount authentication endpoints
app.include_router(auth.router)

@app.get("/")
def root():
    return {"status": "Infrastructure Live"}

#uvicorn main:app --reload