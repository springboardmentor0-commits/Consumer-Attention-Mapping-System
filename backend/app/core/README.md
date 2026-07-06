# 🛍️ Consumer Attention Mapping System – Backend

An AI-powered retail analytics backend that uses computer vision and cameras to understand how shoppers interact with store shelves, products, and displays.

This backend provides authentication, store management, camera management, and the foundation for future AI analytics.

---

# 🚀 Features

- JWT Authentication
- Role-Based Access Control (RBAC)
- Store Management APIs
- Shelf Management APIs
- Camera Management APIs
- OpenCV Camera Stream Verification
- FastAPI REST APIs
- SQLAlchemy ORM
- SQLite (Development)
- PostgreSQL (Production Ready)

---

# 🏗️ Milestone 1

This milestone establishes the core backend infrastructure.

### Completed

- Project initialization
- Environment setup
- Database configuration
- JWT Authentication
- Password hashing
- User registration & login
- Role-based authorization
- Store CRUD foundation
- Shelf management
- Camera management
- OpenCV video stream verification

---

# 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| Language | Python 3.11 |
| Framework | FastAPI |
| Database | SQLite (Development), PostgreSQL (Production) |
| ORM | SQLAlchemy |
| Authentication | JWT (python-jose) |
| Password Hashing | Passlib + bcrypt |
| Video Processing | OpenCV |
| ASGI Server | Uvicorn |

---

# 📁 Project Structure

```text
backend/
│
├── app/
│   ├── api/
│   │   ├── auth.py
│   │   └── stores.py
│   │
│   ├── core/
│   │   ├── database.py
│   │   ├── security.py
│   │   └── dependencies.py
│   │
│   ├── models/
│   │   └── models.py
│   │
│   ├── schemas.py
│   └── main.py
│
├── camera_test.py
├── requirements.txt
└── README.md
```

---

# ⚙️ Installation

## 1. Clone the repository

```bash
git clone https://github.com/springboardmentor0-commits/Consumer-Attention-Mapping-System.git

cd Consumer-Attention-Mapping-System

cd backend
```

---

## 2. Create a virtual environment

```bash
python -m venv venv
```

---

## 3. Activate the virtual environment

### Windows

```bash
venv\Scripts\activate
```

### macOS/Linux

```bash
source venv/bin/activate
```

---

## 4. Install dependencies

```bash
pip install -r requirements.txt
```

---

## 5. Start the development server

```bash
uvicorn app.main:app --reload
```

The API will be available at:

```
http://localhost:8000
```

---

# 📖 API Documentation

FastAPI automatically generates interactive documentation.

Swagger UI

```
http://localhost:8000/docs
```

ReDoc

```
http://localhost:8000/redoc
```

---

# 🔐 Authentication Endpoints

| Method | Endpoint | Description | Authentication |
|---------|----------|-------------|----------------|
| POST | `/api/auth/register` | Register a new user | ❌ |
| POST | `/api/auth/login` | Login and receive JWT token | ❌ |
| GET | `/api/auth/me` | Get current user profile | ✅ |

---

# 🏪 Store Management Endpoints

| Method | Endpoint | Access |
|---------|----------|--------|
| POST | `/api/stores/` | Admin / Store Manager |
| GET | `/api/stores/` | Authenticated Users |
| GET | `/api/stores/{store_id}` | Authenticated Users |
| POST | `/api/stores/{store_id}/shelves` | Admin / Store Manager |
| GET | `/api/stores/{store_id}/shelves` | Authenticated Users |
| POST | `/api/stores/{store_id}/cameras` | Admin / Store Manager |
| GET | `/api/stores/{store_id}/cameras` | Authenticated Users |

---

# 👥 User Roles

| Role | Permissions |
|------|-------------|
| **Admin** | Full access to the system |
| **Store Manager** | Manage stores, shelves, and cameras |
| **Retail Analyst** | View analytics and reports |
| **Marketing Manager** | View marketing and campaign insights |

---

# 🎥 Camera Stream Verification

To verify that OpenCV can successfully access the camera:

```bash
python camera_test.py
```

Press **Q** to stop the video stream.

---

# 📌 Upcoming Milestones

- Heatmap Generation
- Consumer Attention Detection
- Product Interaction Tracking
- Customer Journey Mapping
- AI Analytics Dashboard
- Reporting & Insights
- Real-time Streaming Support
- Deployment with PostgreSQL & Docker

---

# 📜 License

This project is intended for educational and research purposes.

---

