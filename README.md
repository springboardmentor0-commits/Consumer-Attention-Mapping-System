# Consumer-Attention-Mapping-System

A Retail Intelligence System that helps analyze consumer attention in retail stores by managing store layouts, shelves, and video stream integration.

---

## Tech Stack

### Frontend

- React.js

### Backend

- FastAPI
- Python
- OpenCV (cv2)

### Database

- PostgreSQL

---

# Project Setup

## Backend Setup

Navigate to the backend folder

```bash
cd backend
```

Create a virtual environment

```bash
python -m venv venv
```

Activate the virtual environment

### Windows

```bash
venv\Scripts\activate
```

Install dependencies

```bash
pip install -r requirements.txt
```

Create a `.env` file inside the `backend` folder and add the following configuration:

```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=consumer_attention_db
DATABASE_USER=postgres
DATABASE_PASSWORD=your_postgresql_password

SECRET_KEY=your_secret_key

ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

> **Note:** Replace `DATABASE_PASSWORD` and `SECRET_KEY` with your own values before running the project.

Run the backend server

```bash
uvicorn app.main:app --reload
```

Backend runs at

```
http://127.0.0.1:8000
```

Swagger Documentation

```
http://127.0.0.1:8000/docs
```

---

## Frontend Setup

Navigate to the frontend folder

```bash
cd frontend
```

Install dependencies

```bash
npm install
```

Start the React application

```bash
npm start
```

Frontend runs at

```
http://localhost:3000
```

---

## OpenCV Stream Verification

The project includes an OpenCV verification script that supports:

- Live Webcam Streaming
- Video File Streaming
- Frame-by-frame Processing
- Frame Count & Timestamp Logging
- Frame Resizing

Run the script

```bash
python camera_test.py
```

---

## Database Initialization

After creating the database and configuring the `.env` file, run the seed script to insert the default user roles.

```bash
python seed.py
```

The script inserts the following roles:

- Admin
- Store Manager
- Retail Analyst
- Marketing Manager
