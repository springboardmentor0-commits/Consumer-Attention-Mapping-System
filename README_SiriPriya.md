# Customer Attention Mapping System

## Project Overview

The Customer Attention Mapping System is a backend application developed using FastAPI and PostgreSQL to provide the foundational infrastructure for a retail analytics platform.

The project enables secure user authentication, role-based access control, retail store and shelf management, and OpenCV-based video stream verification. It serves as the backend foundation for future computer vision modules that will analyze customer interactions with retail shelves.

## Aim

The objective of this project is to build a secure and scalable backend for a retail customer attention mapping system. The backend provides user authentication, role-based authorization, store and shelf management, and serves as the foundation for integrating computer vision models that analyze customer attention in retail environments.

---

## Features

- User registration with password hashing
- Secure JWT-based authentication
- Role-based access control (RBAC)
- Store management APIs
- Shelf management APIs
- PostgreSQL database integration
- OpenCV webcam/video stream verification
- Environment variable configuration using `.env`
- Interactive API documentation using Swagger UI
- API testing using Postman

---

## Tech Stack

- **Backend:** FastAPI
- **Programming Language:** Python
- **Database:** PostgreSQL
- **ORM:** SQLAlchemy
- **Authentication:** JWT (JSON Web Tokens)
- **Password Hashing:** Passlib (bcrypt)
- **Computer Vision:** OpenCV
- **API Testing:** Postman
- **Database Administration:** pgAdmin 4
- **Environment Management:** python-dotenv

---

## Project Structure

```
customer-attention-mapping/
│
├── routers/
│   ├── users.py
│   └── products.py
│
├── auth.py
├── crud.py
├── database.py
├── main.py
├── models.py
├── schemas.py
├── requirements.txt
├── .env
├── video_test.py
└── README.md
```

---

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd customer-attention-mapping
```

### 2. Create a virtual environment

```bash
python -m venv venv
```

### 3. Activate the virtual environment

#### Windows

```bash
venv\Scripts\activate
```

#### Linux / macOS

```bash
source venv/bin/activate
```

### 4. Install dependencies

```bash
pip install -r requirements.txt
```

---

## Environment Variables

Create a `.env` file in the project root and configure the following variables:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/customer_attention_mapping

SECRET_KEY=your_secret_key

ALGORITHM=HS256

ACCESS_TOKEN_EXPIRE_MINUTES=30
```

---

## Running the Application

Start the FastAPI development server:

```bash
uvicorn main:app --reload
```

Once the server starts, the application will be available at:

- API: http://127.0.0.1:8000
- Swagger UI: http://127.0.0.1:8000/docs

---

## API Endpoints

### User APIs

- `POST /users` — Register a new user
- `POST /users/login` — Login and generate JWT token
- `GET /users` — Retrieve all users
- `GET /users/{user_id}` — Retrieve a specific user

### Store APIs

- `POST /stores` — Create a new store *(JWT Protected)*
- `GET /stores` — Retrieve all stores *(JWT Protected)*

### Shelf APIs

- `POST /shelves` — Create a new shelf *(JWT Protected)*
- `GET /shelves` — Retrieve all shelves *(JWT Protected)*

---

## OpenCV Verification

The project includes a simple OpenCV verification module (`video_test.py`) to confirm webcam access and video frame capture.

The verification demonstrates:

- Webcam initialization
- Live video streaming
- Frame counting
- Timestamp overlay
- Keyboard exit (`Q`)

This serves as the foundation for future customer attention mapping and computer vision features.

---

## Milestone 1 Deliverables

- ✔ FastAPI backend
- ✔ PostgreSQL database integration
- ✔ SQLAlchemy ORM models
- ✔ JWT authentication
- ✔ Password hashing with bcrypt
- ✔ Role-based authorization
- ✔ Store CRUD APIs
- ✔ Shelf CRUD APIs
- ✔ OpenCV verification
- ✔ Environment variable configuration
- ✔ Postman collection

---

## Future Enhancements

Future milestones will focus on integrating computer vision models for customer attention analysis, real-time video processing, analytics dashboards, and reporting features.

