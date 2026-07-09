from fastapi import FastAPI
from app.core.config import settings

app = FastAPI(title="Consumer Attention Mapping System API")

@app.get("/health", status_code=200)
def health_check():
    return {"status": "ok"}
