# Customer Attention Mapping System

An AI-powered retail intelligence application that analyzes shopper behavior from recorded retail videos using computer vision. The system detects shoppers, tracks them across video frames, estimates their viewing direction through head pose estimation, maps their attention to shelf zones, calculates dwell time, and stores analytics in PostgreSQL for visualization through a React dashboard.

## Features

- Secure user authentication using JWT
- Store and shelf management
- Person detection using YOLOv8
- Multi-person tracking using BoT-SORT
- Person re-identification using OSNet (TorchReID)
- Head pose estimation using SixDRepNet
- Shelf attention mapping
- Shopper dwell time analysis
- PostgreSQL-based analytics storage
- Interactive React dashboard for retail insights

## System Pipeline

```text
Recorded Retail Video
        │
        ▼
YOLOv8 Person Detection
        │
        ▼
BoT-SORT Multi-Object Tracking
        │
        ▼
OSNet Re-Identification
        │
        ▼
Head Pose Estimation (SixDRepNet)
        │
        ▼
Shelf Attention Mapping
        │
        ▼
Dwell Time Tracking
        │
        ▼
Analytics Generation
        │
        ▼
PostgreSQL Database
        │
        ▼
React Dashboard
```

## Project Structure

```text
Consumer-Attention-Mapping-System/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── utils/
│   │   └── main.py
│   ├── requirements.txt
│   └── seed.py
│
├── frontend/
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── package-lock.json
│
└── README.md
```

## Technology Stack

### Frontend

- React.js
- Axios
- React Router

### Backend

- FastAPI
- Python
- SQLAlchemy
- JWT Authentication
- Uvicorn

### Computer Vision & AI

- YOLOv8
- BoT-SORT
- OSNet (TorchReID)
- SixDRepNet
- OpenCV

### Database

- PostgreSQL

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

---

### Future Improvements

- Attention heatmaps
- Product interaction detection
- Customer journey analytics
- Product attractiveness scoring
- Retail recommendation engine
- Multi-camera support
- Docker deployment
- Real-time camera support

---

### License

This project was developed for educational and learning purposes.
