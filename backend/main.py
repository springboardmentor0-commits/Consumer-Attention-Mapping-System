from fastapi import FastAPI

from routes.auth_routes import router
from routes.store_routes import router as store_router

app = FastAPI(title="Consumer Attention Mapping System")


app.include_router(router)
app.include_router(store_router)

@app.get("/")
def home():
    return {"status": "running"}