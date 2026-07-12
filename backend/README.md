# Consumer Attention Mapping System - Backend

## Overview

This is the backend service for the Consumer Attention Mapping System.

The backend is built using **FastAPI** and is responsible for:

- User Authentication (JWT)
- Store Management
- Shelf Management
- Camera Management
- Database Operations
- REST API Development
- OpenCV Video Stream Processing (Future Milestones)

---

## Tech Stack

- Python
- FastAPI
- PostgreSQL
- SQLAlchemy
- JWT Authentication
- OpenCV
- Uvicorn

---

## Project Structure

```
backend/
│
├── app/
│   ├── api/
│   ├── core/
│   ├── models/
│   ├── services/
│   └── main.py
│
├── venv/
├── .env
├── .gitignore
├── requirements.txt
└── README.md
```

---

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
```

---

### 2. Move into the backend folder

```bash
cd backend
```

---

### 3. Create a virtual environment

```bash
python -m venv venv
```

---

### 4. Activate the virtual environment

Windows

```bash
venv\Scripts\activate
```

Linux / macOS

```bash
source venv/bin/activate
```

---

### 5. Install dependencies

```bash
pip install -r requirements.txt
```

---

## Running the Backend

Start the FastAPI server:

```bash
uvicorn app.main:app --reload
```

The backend will run at:

```
http://127.0.0.1:8000
```

Swagger Documentation:

```
http://127.0.0.1:8000/docs
```

---

## Current Milestone

Milestone 1

Completed:

- Project Initialization
- FastAPI Setup
- Backend Folder Structure
- Environment Configuration
- Dependency Installation

Upcoming:

- PostgreSQL Integration
- JWT Authentication
- Store & Shelf CRUD APIs
- OpenCV Stream Verification

---

## Author

Consumer Attention Mapping System Team
