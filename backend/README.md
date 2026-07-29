# Consumer Attention Mapping System - Backend

The FastAPI backend for the Consumer Attention Mapping System. It provides RESTful APIs, computer vision services (YOLOv8 + ByteTrack + MediaPipe Gaze Estimation), TimescaleDB hypertable persistence, and real-time analytics aggregation.

---

## 🏗️ Project Structure

```
backend/
├── alembic/                  # Alembic DB Migration scripts
│   └── versions/             # Migration files (initial schema, layout, dwell_times, gaze_events)
├── app/
│   ├── api/                  # FastAPI Routers
│   │   ├── auth.py           # Authentication & JWT issuance
│   │   ├── layout.py         # Store, Shelf, Zone, Product, and Camera management
│   │   ├── video.py          # Video stream ingestion & verification
│   │   ├── dwell.py          # Shopper dwell time background task & query endpoints
│   │   └── analytics.py      # Aggregated attention metrics (GET /api/analytics/attention)
│   ├── core/                 # Database configuration, Security, & Environment Settings
│   ├── models/               # SQLModel / SQLAlchemy Schemas (Store, Zone, Shelf, DwellTime, GazeEvent, etc.)
│   ├── services/             # Core Computer Vision & Analytics Engines
│   │   ├── video_capture.py  # OpenCV VideoCapture helper with reconnect retries
│   │   ├── person_tracker.py # YOLOv8 + Supervision ByteTrack object tracking
│   │   ├── dwell_tracker.py  # Zone geometry point-in-polygon matching & dwell duration calculation
│   │   ├── dwell_service.py  # Background tracking task runner & TimescaleDB persistence
│   │   └── gaze_estimator.py # Head crop extraction, 3D head pose estimation & gaze ray shelf intersection
│   └── main.py               # FastAPI App Initialization & CORS Setup
├── scripts/                  # Command-Line Utilities & Automated Verification Tests
│   ├── track_shoppers.py     # Executable CLI script for live video tracking & dwell logging
│   ├── test_tracker.py       # Unit test for YOLOv8 model loading & tracker initialization
│   ├── test_occlusion.py     # Verification script for 20-frame occlusion persistence
│   ├── test_dwell_tracker.py # Test suite for zone entry/exit timestamps, dwell duration & session flush
│   ├── test_gaze_estimation.py # Test suite for head crop, pose estimation (P/Y/R) & ray intersection
│   └── test_analytics_api.py # Test suite for GET /api/analytics/attention aggregation & bucketing
├── requirements.txt          # Python Dependencies
├── .env.example              # Environment Variable Template
└── README.md
```

---

## 🚀 Setup & Installation Instructions

### 1. Create & Activate Virtual Environment
```bash
python3 -m venv venv
source venv/bin/activate  # macOS/Linux
# venv\Scripts\activate  # Windows
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Environment Configuration
Copy `.env.example` to `.env` and set your PostgreSQL / TimescaleDB database URL:
```bash
cp .env.example .env
```
Ensure `.env` contains:
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/consumer_ms
JWT_SECRET_KEY=your_secret_key_here
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### 4. Database Migrations & TimescaleDB Hypertables
Apply Alembic migrations to build tables and TimescaleDB hypertables (`dwell_times`, `gaze_events`):
```bash
alembic upgrade head
```

### 5. Run Backend FastAPI Server
```bash
uvicorn app.main:app --reload --port 8000
```
- **Swagger UI Interactive Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Health Check Endpoint**: [http://localhost:8000/health](http://localhost:8000/health)

---

## 🎯 Computer Vision & Tracking CLI Demo (`track_shoppers.py`)

Run real-time shopper detection, persistent ID assignment, head pose estimation, and live dwell duration logging:

```bash
# 1. Run live tracking on default webcam (index 0)
python scripts/track_shoppers.py --source 0

# 2. Run tracking on a sample retail video file
python scripts/track_shoppers.py --source ../data/sample_video.mp4

# 3. Record annotated output video with bounding boxes, tracker IDs, gaze rays, & dwell logs
python scripts/track_shoppers.py --source input.mp4 --output output.mp4
```

### CLI Arguments
| Flag | Description | Default |
|---|---|---|
| `-s`, `--source` | Path to video file or webcam index (`0`) | `0` |
| `-w`, `--weights` | YOLOv8 weights model name or path | `yolov8n.pt` |
| `-c`, `--conf` | Confidence threshold for person detection | `0.3` |
| `-b`, `--track-buffer` | Lost track buffer frames for occlusion persistence | `60` |
| `-o`, `--output` | Output path to save recorded annotated video | `None` |
| `--no-show` | Disable interactive OpenCV window output | `False` |

---

## 🧪 Automated Verification Test Suite

Run unit and integration verification tests:

```bash
# Test 1: Basic YOLOv8 + ByteTrack tracker loading
python scripts/test_tracker.py

# Test 2: Occlusion persistence (shopper passing behind pillars for 20 frames)
python scripts/test_occlusion.py

# Test 3: Zone entry/exit timestamp logging, dwell duration & end-of-video flush
python scripts/test_dwell_tracker.py

# Test 4: Head crop, 3D head pose estimation & gaze ray shelf intersection
python scripts/test_gaze_estimation.py

# Test 5: GET /api/analytics/attention aggregation & time-window bucketing
python scripts/test_analytics_api.py
```

---

## 📡 API Endpoints Summary

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | User registration | No |
| `POST` | `/api/auth/login` | User login & JWT issuance | No |
| `GET` | `/api/auth/me` | Current user profile | Yes |
| `GET / POST` | `/api/stores` | List / Create retail stores | Yes |
| `GET / POST` | `/api/stores/{id}/zones` | List / Create store zones | Yes |
| `GET / POST` | `/api/stores/{id}/shelves` | List / Create shelf layouts | Yes |
| `POST` | `/api/dwell/process-video` | Trigger background tracking & dwell logging job | Yes |
| `GET` | `/api/dwell/jobs/{job_id}` | Check background dwell task status | Yes |
| `GET` | `/api/dwell/records` | Query recorded `DwellTime` entries | Yes |
| `GET` | `/api/analytics/attention` | Fetch aggregated shelf attention, dwell time & time-series trends | Yes |
