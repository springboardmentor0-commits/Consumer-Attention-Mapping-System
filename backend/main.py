from fastapi import FastAPI

app = FastAPI(title="Consumer Attention Mapping System API")

@app.get("/")
def read_root():
    return {"status": "running"}

#uvicorn main:app --reload