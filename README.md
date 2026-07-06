# Consumer Attention Mapping System (CAMS)

An AI-powered retail intelligence platform that leverages Computer Vision and Deep Learning to analyze shopper behavior, attention patterns, shelf interactions, and in-store engagement. The system enables retailers to make data-driven decisions by transforming retail camera feeds into actionable business insights.

---

## Project Overview

Consumer Attention Mapping System (CAMS) is designed to help retail stores understand customer movement, product engagement, dwell time, and shopping behavior using AI-based video analytics.

The platform provides:

- Secure authentication with Role-Based Access Control (RBAC)
- Retail store and shelf management
- Camera registration and monitoring
- Video stream verification using OpenCV
- Scalable backend architecture with PostgreSQL, MongoDB, and Redis
- Modern dashboard built with Next.js and Tailwind CSS

---

# Tech Stack

## Backend

- Python 3.11
- FastAPI
- SQLAlchemy 2.0
- PostgreSQL
- MongoDB (Motor)
- Redis
- Alembic
- JWT Authentication
- Loguru

## Frontend

- Next.js 14
- React 18
- TypeScript
- Redux Toolkit
- Axios
- Tailwind CSS
- shadcn/ui

## AI / Computer Vision

- OpenCV
- YOLOv8
- PyTorch
- MediaPipe
- DeepSORT

---

# Project Structure

```
Consumer-Attention-Mapping-System/

├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── db/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── main.py
│   │
│   ├── scripts/
│   │   └── verify_stream.py
│   │
│   ├── migrations/
│   ├── alembic.ini
│   ├── requirements.txt
│   └── .env
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── store/
│   ├── lib/
│   └── package.json
│
└── README.md
```

---

# Features

## Authentication

- User Registration
- User Login
- JWT Access Tokens
- Refresh Tokens
- Secure Password Hashing (bcrypt)
- User Profile Management
- Role-Based Access Control

Supported Roles

- Super Admin
- Store Manager
- Retail Analyst
- Marketing Manager

---

## Retail Management

- Store Registration
- Shelf Management
- Zone Management
- Camera Registration
- Camera Assignment
- Camera Health Monitoring
- Heartbeat API

---

## Database

### PostgreSQL

- Users
- Stores
- Shelves
- Zones
- Cameras
- Products

### MongoDB

- Attention Data
- Heatmaps
- Sessions

### Redis

- Session Cache
- Future Real-time Messaging

---

## Computer Vision

Current milestone includes:

- Video Stream Verification
- Webcam Support
- RTSP Stream Support
- MP4 File Support
- Frame Metadata Logging
- FPS Monitoring

Future milestones will include:

- Person Detection
- Product Detection
- Consumer Tracking
- Heatmap Generation
- Attention Analytics

---

# Milestone 1 Status

✅ Project Initialization

✅ Database Setup

✅ PostgreSQL Integration

✅ MongoDB Integration

✅ Redis Integration

✅ Authentication

✅ JWT Security

✅ Role-Based Access

✅ Store CRUD APIs

✅ Shelf CRUD APIs

✅ Camera CRUD APIs

✅ OpenCV Stream Verification

---

# Getting Started

## 1. Clone Repository

```bash
git clone https://github.com/jagrat2004/Consumer-Attention-Mapping-System.git

cd Consumer-Attention-Mapping-System
```

---

# Backend Setup

## Create Virtual Environment

Windows

```bash
python -m venv venv

venv\Scripts\activate
```

Linux / macOS

```bash
python3 -m venv venv

source venv/bin/activate
```

---

## Install Dependencies

```bash
cd backend

pip install -r requirements.txt
```

---

## Configure Environment Variables

Create a `.env` file inside the backend directory.

Example:

```env
APP_NAME=
APP_ENV=
DEBUG=

POSTGRES_HOST=
POSTGRES_PORT=
POSTGRES_DB=
POSTGRES_USER=
POSTGRES_PASSWORD=

DATABASE_URL=

MONGO_URL=
MONGO_DB=

REDIS_URL=

JWT_SECRET_KEY=change-this-jwt-key
JWT_ALGORITHM=HS256

API_V1_PREFIX=/api
```

---

## Run Database Migrations

```bash
cd backend

alembic upgrade head
```

---

## Start Backend

```bash
uvicorn app.main:app --reload
```

Backend runs at

```
http://localhost:8000
```

Swagger Documentation

```
http://localhost:8000/api/docs
```

---

# Frontend Setup

Go to frontend

```bash
cd frontend
```

Install dependencies

```bash
npm install
```

Start development server

```bash
npm run dev
```

Frontend runs at

```
http://localhost:3000
```

---

# Running the Complete Application

Start services in this order:

1. PostgreSQL
2. MongoDB
3. Redis (optional)
4. Backend
5. Frontend

Open

```
Frontend
http://localhost:3000
```

```
Swagger API
http://localhost:8000/api/docs
```

---

# Default Test Credentials

The following account can be used for local development and testing.

## Super Admin

Email

```
admin@example.com
```

Password

```
Admin@123
```

Role

```
Super Admin
```

> If the database is empty, first register this user through the `/api/auth/register` endpoint or the registration page using:
>
> - **Username:** `admin`
> - **Full Name:** `Admin User`
> - **Email:** `admin@example.com`
> - **Password:** `Admin@123`
> - **Role:** `Super Admin`

---

# OpenCV Stream Verification

To verify the video processing pipeline:

Webcam

```bash
python scripts/verify_stream.py --source 0
```

Video File

```bash
python scripts/verify_stream.py --source path/to/video.mp4
```

RTSP Camera

```bash
python scripts/verify_stream.py --source rtsp://username:password@camera_ip:554/stream
```

The script verifies:

- Video Capture
- Frame Processing
- FPS Calculation
- Timestamp Logging
- Frame Metadata
- Live Display

---

# API Documentation

Interactive Swagger UI

```
http://localhost:8000/api/docs
```

Core endpoints include:

### Authentication

- Register
- Login
- Refresh Token
- Logout
- User Profile

### Stores

- Create Store
- View Stores
- Update Store
- Delete Store

### Shelves

- Create Shelf
- View Shelves

### Cameras

- Register Camera
- Update Camera
- Delete Camera
- Camera Health
- Heartbeat

---

# Current Progress

### Completed

- Project Initialization
- Backend Architecture
- Frontend Dashboard
- Authentication System
- Role-Based Access Control
- PostgreSQL Integration
- MongoDB Integration
- Redis Integration
- Store Management APIs
- Shelf Management APIs
- Camera Management APIs
- OpenCV Stream Verification

---

# License

This project is developed for academic and research purposes as part of the **Infosys Springboard** program.