# Consumer Attention Mapping System - Backend

This is the FastAPI backend for the Consumer Attention Mapping System.

## Project Structure

```
backend/
├── app/
│   ├── api/          # routers: auth.py, stores.py, shelves.py, video.py
│   ├── core/         # db connection, security/JWT config, settings
│   ├── models/       # SQLModel/SQLAlchemy schemas
│   ├── services/     # OpenCV frame-processing logic (pure functions)
│   └── main.py       # FastAPI app init
├── requirements.txt
├── .env.example
└── README.md
```

## Setup Instructions

### 1. Create the Virtual Environment
Navigate to the `backend/` directory and run:
```bash
python3 -m venv venv
```

### 2. Activate the Virtual Environment
* On macOS/Linux:
  ```bash
  source venv/bin/activate
  ```
* On Windows:
  ```cmd
  venv\Scripts\activate
  ```

### 3. Install Requirements
Install all dependencies listed in `requirements.txt`:
```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables
Copy `.env.example` to `.env` and configure your settings:
```bash
cp .env.example .env
```

Ensure the variables are set (you can use defaults or configure them to your database/services):
```env
DATABASE_URL=
JWT_SECRET_KEY=placeholder_secret_key
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
MONGO_URL=
```

### 5. Run the Application
Start the FastAPI development server:
```bash
uvicorn app.main:app --reload
```

The API documentation will be available at:
* Swagger UI: [http://localhost:8000/docs](http://localhost:8000/docs)
* Redoc: [http://localhost:8000/redoc](http://localhost:8000/redoc)

You can check the health status by visiting [http://localhost:8000/health](http://localhost:8000/health).
