# Consumer Attention Mapping System

An AI-powered retail analytics system that leverages Computer Vision to analyze shopper behavior in real time. The application detects and tracks shoppers from camera feeds, estimates customer attention using head pose analysis, measures dwell time, and visualizes actionable retail analytics through an interactive dashboard.

## Features

- Real-time shopper detection using YOLOv8
- Multi-person tracking with ByteTrack
- Dwell time analytics
- Shelf region mapping
- Gaze estimation using MediaPipe Face Mesh
- Attention analysis pipeline
- REST APIs built with FastAPI
- Analytics dashboard with real-time insights
- PostgreSQL integration for analytics storage

---

## Tech Stack

### Backend
- Python
- FastAPI
- SQLAlchemy
- PostgreSQL

### Computer Vision
- OpenCV
- YOLOv8
- ByteTrack
- MediaPipe Face Mesh

### Frontend
- Next.js
- React
- Tailwind CSS
- TypeScript

---

## System Workflow

```
Camera Feed
      │
      ▼
OpenCV Frame Capture
      │
      ▼
YOLOv8 Person Detection
      │
      ▼
ByteTrack Multi-Person Tracking
      │
      ▼
Shelf Mapping
      │
      ▼
MediaPipe Gaze Estimation
      │
      ▼
Dwell Time Analytics
      │
      ▼
PostgreSQL Database
      │
      ▼
FastAPI REST APIs
      │
      ▼
Next.js Analytics Dashboard
```

---

## Dashboard

The analytics dashboard provides:

- Total shopper count
- Average dwell time
- Shelf attention analytics
- Recent shopper sessions
- Display-wise attention insights

---

## Project Structure

```
ConsumerAttentionMappingSystem
│
├── backend
│   ├── app
│   │   ├── api
│   │   ├── crud
│   │   ├── models
│   │   ├── schemas
│   │   ├── services
│   │   │   └── vision
│   │   └── main.py
│   └── requirements.txt
│
├── frontend
│   ├── src
│   └── package.json
│
└── README.md
```

---

## Key Functionalities

### Shopper Detection
Detects shoppers in every video frame using YOLOv8.

### Shopper Tracking
Maintains unique shopper identities across frames using ByteTrack.

### Dwell Time Analysis
Measures how long each shopper remains near retail displays.

### Shelf Mapping
Maps shopper positions to predefined display regions.

### Gaze Estimation
Uses MediaPipe Face Mesh to estimate the shopper's head direction and infer viewing attention.

### Analytics Dashboard
Visualizes shopper traffic and engagement metrics through an interactive web interface.

---

## Future Improvements

- Attention heatmaps
- Product interaction detection
- Customer journey analytics
- Product attractiveness scoring
- Retail recommendation engine
- Multi-camera support
- Docker deployment

---

## Author

Developed as part of an AI Retail Analytics project focusing on Computer Vision, real-time analytics, and full-stack application development.
