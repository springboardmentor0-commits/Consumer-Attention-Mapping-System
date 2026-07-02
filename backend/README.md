# Consumer Attention Mapping System

## Project Overview
Consumer Attention Mapping System is a retail monitoring platform designed to manage store layouts, user authentication, and video stream processing infrastructure for future AI-based customer behavior tracking.

## Technologies Used

### Backend
- FastAPI
- PostgreSQL
- SQLAlchemy
- JWT Authentication
- OpenCV

### Frontend
- React.js
- CSS (Tailwind migration planned)

## Features Implemented

- User Registration
- User Login
- JWT Token Authentication
- Role-based users
- Store creation
- Shelf creation
- PostgreSQL database integration
- OpenCV video stream testing

## Database Tables

### Roles
- id
- role_name

### Users
- id
- email
- password_hash
- role_id

### Stores
- id
- store_name
- location

### Shelves
- id
- store_id
- shelf_name
- zone_name
- zone_coordinates

## How to Run Backend

```bash
cd backend
venv\Scripts\activate
uvicorn main:app --reload
```

## How to Run Frontend

```bash
cd frontend
npm install
npm start
```

## API Endpoints

### Authentication

POST /register

POST /login

### Stores

GET /stores

POST /stores

### Shelves

GET /shelves

POST /shelves

## Video Stream Test

```bash
python camera_test.py
```