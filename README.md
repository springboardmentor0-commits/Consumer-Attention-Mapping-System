# Consumer Attention Mapping System

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Next.js-16.2-000000?style=flat-square&logo=next.js)](https://nextjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14-4169E1?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![OpenCV](https://img.shields.io/badge/OpenCV-Computer_Vision-5C3EE8?style=flat-square&logo=opencv)](https://opencv.org/)

An AI-powered retail analytics and consumer attention tracking system. It leverages computer vision and machine learning to analyze shopper behavior, track customer movement, gaze direction, dwell time, and product interactions to generate actionable insights for store layouts and product placement optimization.

---

## 🌟 Key Features

- **Store & Layout Management**: Hierarchical spatial configuration (Stores → Zones → Shelves → Products → Cameras).
- **Authentication & RBAC**: JWT-based secure authentication with predefined roles (`Store Manager`, `Retail Analyst`, `Marketing Manager`, `Admin`).
- **Computer Vision & Video Processing**: OpenCV-based frame processing pipeline supporting live streams, webcams, RTSP streams, and pre-recorded retail videos.
- **Analytics & Attention Mapping**: Heatmap tracking, gaze direction, dwell time analysis, and product attractiveness scoring.
- **Interactive Dashboard**: Modern Next.js interface with dynamic layout visualization and store management tools.
- **Database Migration Pipeline**: Schema version control powered by SQLModel and Alembic migrations on PostgreSQL.

---

## 🏗️ Project Architecture

```
Consumer MS/
├── backend/                  # FastAPI Python Backend
│   ├── alembic/              # Alembic DB Migration scripts
│   ├── app/
│   │   ├── api/              # API Endpoints (auth, layout, video)
│   │   ├── core/             # DB Connection, Security & Settings
│   │   ├── models/           # SQLModel / Pydantic schemas
│   │   ├── services/         # OpenCV frame processing & analytics
│   │   └── main.py           # FastAPI Application Entrypoint
│   ├── scripts/              # Stream verification & utility scripts
│   ├── alembic.ini           # Alembic Configuration
│   ├── requirements.txt      # Python Dependencies
│   └── .env                  # Backend Environment Variables
│
├── frontend/                 # Next.js React Frontend
│   ├── src/
│   │   ├── app/              # App Router (pages: login, register, stores)
│   │   ├── components/       # Reusable UI components & Layout canvas
│   │   ├── context/          # State Management (AuthContext)
│   │   └── lib/              # API Client & Helper utilities
│   ├── package.json          # Frontend Dependencies & Scripts
│   └── .env                  # Frontend Environment Variables
│
├── data/                     # Sample media assets & test videos
└── docs/                     # API Postman collections & DB ERD schemas
```

---

## 🛠️ Tech Stack

| Category | Technology |
|---|---|
| **Frontend** | React 19, Next.js 16 (App Router), Tailwind CSS v4, Lucide Icons |
| **Backend** | Python 3.10+, FastAPI, SQLModel / SQLAlchemy, PyJWT, Passlib |
| **Database** | PostgreSQL, Alembic |
| **AI / Computer Vision** | OpenCV, NumPy |
| **Tooling & Docs** | Uvicorn, Postman Collection, Docker (ready) |

---

## 🚀 Quick Start & Installation

### Prerequisites
- **Python 3.10+**
- **Node.js 18+** & **npm**
- **PostgreSQL 14+** running locally or via service

---

### 1. Database Setup

Ensure PostgreSQL is running and create the `consumer_ms` database:

```bash
psql -U postgres -c "CREATE DATABASE consumer_ms;"
```

---

### 2. Backend Setup & Run

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```

2. Create and activate a Python virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

3. Install required Python packages:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure environment variables in `.env`:
   ```env
   DATABASE_URL=postgresql://<username>:<password>@localhost:5432/consumer_ms
   JWT_SECRET_KEY=your_secret_key_here
   JWT_ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   ```

5. Run database migrations:
   ```bash
   alembic upgrade head
   ```

6. Start the FastAPI backend server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   - **API Docs (Swagger UI)**: [http://localhost:8000/docs](http://localhost:8000/docs)
   - **Health Check**: [http://localhost:8000/health](http://localhost:8000/health)

---

### 3. Frontend Setup & Run

1. Open a new terminal and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables in `.env`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000/api
   ```

4. Start the Next.js development server:
   ```bash
   npm run dev
   ```
   - Access the Web Application at: [http://localhost:3000](http://localhost:3000)

---

## 📹 OpenCV Video Processing & Verification

To verify video processing on a local webcam or retail video sample:

```bash
python backend/scripts/verify_stream.py --source data/sample_retail.mp4 --headless
```

### Options:
- `--source`: Video file path (e.g., `data/sample_retail.mp4`), webcam index (e.g., `0`), or RTSP stream URL.
- `--headless`: Suppresses GUI window output for server environments.
- `--resize`: Downscales frame resolution for faster processing (default: `640x480`).
- `--log-interval`: Frame logging frequency (default: every 30 frames).

---

## 📡 API Endpoints Overview

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register a new user | No |
| `POST` | `/api/auth/login` | User login & JWT issuance | No |
| `GET` | `/api/auth/me` | Fetch current user profile | Yes |
| `GET / POST` | `/api/stores` | List / Create retail stores | Yes |
| `GET / POST` | `/api/stores/{id}/zones` | Get / Create store zones | Yes |
| `GET / POST` | `/api/zones/{id}/shelves` | Get / Create shelf layouts | Yes |
| `GET / POST` | `/api/shelves/{id}/products` | Get / Create products on shelf | Yes |
| `POST` | `/api/video/process-video` | Upload & process video stream | Yes |
---

## 🎯 Shopper Tracking & Attention Mapping Demo (YOLOv8 + ByteTrack + Gaze)

An end-to-end computer vision pipeline using **YOLOv8** (`ultralytics`), **ByteTrack** (`supervision`), **MediaPipe Face Mesh**, and **TimescaleDB** for real-time shopper tracking, occlusion persistence, dwell time tracking, and gaze-to-shelf attention mapping.

### Required Packages
Ensure all dependencies are installed in your virtual environment:
```bash
pip install ultralytics supervision mediapipe opencv-python torch sqlmodel alembic
```

### Running the Live Tracking & Attention Demo
```bash
# 1. Run live tracking demo on webcam (device index 0)
python backend/scripts/track_shoppers.py --source 0

# 2. Run tracking on a sample retail video file
python backend/scripts/track_shoppers.py --source path/to/store_video.mp4

# 3. Record annotated output video to file
python backend/scripts/track_shoppers.py --source input.mp4 --output data/output_tracked.mp4
```

### Expected Output
- **Visual Output Window**: Bounding boxes overlaid with persistent tracker IDs (`Shopper #1`, `Shopper #2`), occlusion persistence buffers, 3D head pose angles (Pitch, Yaw), directional gaze ray vectors, and targeted shelf labels (`Looking at: Shelf A`).
- **Live Console Logs**: Real-time per-ID dwell duration accumulation logs (e.g. `ID 12 - Dwell Time: 14.5s`).
- **TimescaleDB / PostgreSQL Persistence**: Automatically flushes and persists completed dwell sessions and gaze ray hits to the `dwell_times` and `gaze_events` hypertables.
- **React Frontend Dashboard**: Visualizes live aggregated attention data and time-series trends at `http://localhost:3000/stores/<store_id>`.

### Verification & Automated Test Suite
```bash
# Verify YOLOv8 model loading & basic tracking
python backend/scripts/test_tracker.py

# Verify 20-frame occlusion persistence (shopper passing behind pillars)
python backend/scripts/test_occlusion.py

# Verify zone entry/exit timestamp logging, dwell duration, re-entry & flush
python backend/scripts/test_dwell_tracker.py

# Verify head crop extraction, head pose estimation & gaze ray shelf intersection
python backend/scripts/test_gaze_estimation.py

# Verify GET /api/analytics/attention endpoint aggregation logic
python backend/scripts/test_analytics_api.py
```

---

## 📄 License

This project is intended for educational, research, and retail analytics evaluation purposes.

