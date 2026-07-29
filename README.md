# Consumer Attention Mapping System

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Next.js-16.2-000000?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TimescaleDB](https://img.shields.io/badge/TimescaleDB-PostgreSQL-4169E1?style=flat-square&logo=postgresql)](https://www.timescale.com/)
[![YOLOv8](https://img.shields.io/badge/YOLOv8-Ultralytics-00FFFF?style=flat-square)](https://docs.ultralytics.com/)
[![ByteTrack](https://img.shields.io/badge/ByteTrack-Supervision-FF6F00?style=flat-square)](https://supervision.roboflow.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)

An end-to-end AI-powered retail analytics and consumer attention tracking platform. It leverages computer vision and time-series database persistence to analyze shopper movement, assign persistent tracking IDs across brief occlusions, measure zone dwell time, estimate 3D head pose and gaze directions, and calculate shelf attention metrics.

---

## 🌟 Key Features

- **Shopper Tracking & Occlusion Persistence**: YOLOv8 (`ultralytics`) person detection (class 0) combined with ByteTrack (`supervision`) for persistent shopper ID tracking surviving brief occlusions (e.g. passing behind pillars).
- **Zone Dwell Time Logging**: Automated entry/exit timestamp logging per shopper per zone, computing exact dwell durations (`exit_timestamp - entry_timestamp`), track re-entry handling, multi-shopper concurrency, and session flush.
- **Head Crop & 3D Gaze Estimation**: Head region extraction, 3D head pose estimation (Pitch, Yaw, Roll via OpenCV `cv2.solvePnP`), and geometric ray/vector intersection with pre-mapped store shelf polygons ("Shelf A", "Shelf B"). Gracefully skips unobservable faces (side/back of head).
- **TimescaleDB Hypertable Persistence**: Asynchronous background tasks persist completed dwell sessions and gaze events into TimescaleDB `dwell_times` and `gaze_events` hypertables.
- **FastAPI Analytics API (`GET /api/analytics/attention`)**: Aggregates total dwell duration, gaze ray hits, unique shopper counts per shelf, and returns time-series trend data.
- **Interactive React Dashboard**: Modern Next.js interface with Chart.js / SVG bar charts, time-series trend plots, KPI summary cards, time-window controls (`1H`, `24H`, `7D`, `30D`, `ALL`), and spatial layout management.

---

## 🏗️ Project Architecture

```
Consumer MS/
├── backend/                  # FastAPI Python Backend
│   ├── alembic/              # Alembic DB Migration scripts & TimescaleDB hypertables
│   ├── app/
│   │   ├── api/              # API Endpoints (auth, layout, video, dwell, analytics)
│   │   ├── core/             # DB Connection, Security & Settings
│   │   ├── models/           # SQLModel / Pydantic schemas (Store, Zone, Shelf, DwellTime, GazeEvent)
│   │   ├── services/         # Tracking, Dwell Engine, Gaze Estimation & Background Services
│   │   └── main.py           # FastAPI Application Entrypoint
│   ├── scripts/              # Executable CLI tools & Automated Verification Tests
│   ├── alembic.ini           # Alembic Configuration
│   └── requirements.txt      # Backend Python Dependencies
│
├── frontend/                 # Next.js React Frontend
│   ├── src/
│   │   ├── app/              # App Router (login, register, stores/[id] dashboard)
│   │   ├── components/       # Reusable UI components & AttentionAnalyticsChart
│   │   ├── context/          # State Management (AuthContext)
│   │   └── lib/              # API Client & Helper utilities
│   └── package.json          # Frontend Dependencies & Scripts
│
├── data/                     # Sample media assets & test videos
└── docs/                     # API Postman collections & DB ERD schemas
```

---

## 🛠️ Tech Stack

| Category | Technology |
|---|---|
| **Frontend** | React 19, Next.js 16 (App Router), Tailwind CSS v4, Lucide Icons |
| **Backend** | Python 3.10+, FastAPI, SQLModel / SQLAlchemy, PyJWT |
| **Database** | PostgreSQL / TimescaleDB, Alembic Migrations |
| **Computer Vision / AI** | YOLOv8 (`ultralytics`), ByteTrack (`supervision`), MediaPipe, OpenCV (`solvePnP`) |
| **Tooling & Server** | Uvicorn, Postman Collection, Docker |

---

## 🚀 Quick Start & Installation

### Prerequisites
- **Python 3.10+**
- **Node.js 18+** & **npm**
- **PostgreSQL 14+ / TimescaleDB** running locally or via service

---

### 1. Database Setup

Ensure PostgreSQL / TimescaleDB is running and create the `consumer_ms` database:

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
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/consumer_ms
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
   - **Swagger UI Interactive API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
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

3. Start the Next.js development server:
   ```bash
   npm run dev
   ```
   - Access the Web Application at: [http://localhost:3000](http://localhost:3000)

---

## 🎯 Computer Vision & Tracking CLI Demo (`track_shoppers.py`)

To run real-time shopper tracking, persistent tracker ID assignment, head pose estimation, and live dwell duration logging:

```bash
# 1. Run live tracking demo on webcam (device index 0)
python backend/scripts/track_shoppers.py --source 0

# 2. Run tracking on a sample retail video file
python backend/scripts/track_shoppers.py --source data/sample_video.mp4

# 3. Record annotated output video to file
python backend/scripts/track_shoppers.py --source input.mp4 --output data/output_tracked.mp4
```

### Expected Output
- **Visual Output Window**: Bounding boxes overlaid with locked tracker IDs (`Shopper #1`, `Shopper #2`), occlusion persistence buffers, 3D head pose angles (Pitch, Yaw), directional gaze ray vectors, and targeted shelf labels (`Looking at: Shelf A`).
- **Live Console Logs**: Real-time per-ID dwell duration accumulation logs (e.g. `ID 12 - Dwell Time: 14.5s`).
- **TimescaleDB / PostgreSQL Persistence**: Flushes and persists completed dwell sessions and gaze ray hits to `dwell_times` and `gaze_events` hypertables.
- **React Frontend Dashboard**: Visualizes live aggregated attention data and time-series trends at `http://localhost:3000/stores/<store_id>`.

---

## 🧪 Automated Verification Test Suite

Run unit and integration verification tests:

```bash
# Test 1: Basic YOLOv8 + ByteTrack tracker loading
python backend/scripts/test_tracker.py

# Test 2: Occlusion persistence (shopper passing behind pillars for 20 frames)
python backend/scripts/test_occlusion.py

# Test 3: Zone entry/exit timestamp logging, dwell duration & end-of-video flush
python backend/scripts/test_dwell_tracker.py

# Test 4: Head crop, 3D head pose estimation & gaze ray shelf intersection
python backend/scripts/test_gaze_estimation.py

# Test 5: GET /api/analytics/attention aggregation & time-window bucketing
python backend/scripts/test_analytics_api.py
```

---

## 📡 API Endpoints Overview

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register a new user | No |
| `POST` | `/api/auth/login` | User login & JWT issuance | No |
| `GET` | `/api/auth/me` | Fetch current user profile | Yes |
| `GET / POST` | `/api/stores` | List / Create retail stores | Yes |
| `GET / POST` | `/api/stores/{id}/zones` | List / Create store zones | Yes |
| `GET / POST` | `/api/stores/{id}/shelves` | List / Create shelf layouts | Yes |
| `POST` | `/api/dwell/process-video` | Trigger background tracking & dwell logging job | Yes |
| `GET` | `/api/dwell/jobs/{job_id}` | Check background dwell task status | Yes |
| `GET` | `/api/dwell/records` | Query recorded `DwellTime` entries | Yes |
| `GET` | `/api/analytics/attention` | Fetch aggregated shelf attention, dwell time & time-series trends | Yes |

---

## 📄 License

This project is intended for educational, research, and retail analytics evaluation purposes.
