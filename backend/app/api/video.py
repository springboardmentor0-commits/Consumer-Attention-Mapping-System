import uuid
import time
import logging
from fastapi import APIRouter, Depends, BackgroundTasks, HTTPException, status
from pydantic import BaseModel
from typing import Dict, Optional, Any, List
from sqlmodel import Session

from app.core.deps import get_current_user
from app.core.db import get_session
from app.models.schemas import Camera
from app.services.video_capture import stream_frames
from app.services.video_ingest import open_source, read_frames

router = APIRouter(prefix="/video", tags=["video"])
logger = logging.getLogger(__name__)

# In-memory store for verification jobs
jobs_db: Dict[str, Dict[str, Any]] = {}

# Active ingestion threads control mapping
active_ingestions: Dict[uuid.UUID, bool] = {}

class VideoVerifyRequest(BaseModel):
    source: str  # Local file path, RTSP URL, or webcam index

class VerifyJobStatusResponse(BaseModel):
    job_id: str
    status: str
    source: str
    processed_frames: int
    duration_seconds: float
    fps: float
    resolution: Optional[str] = None
    error: Optional[str] = None

class CameraIngestRequest(BaseModel):
    camera_id: uuid.UUID


def ingest_worker(camera_id: uuid.UUID, stream_url: str):
    """
    Background worker that runs OpenCV frame ingestion.
    Gracefully handles local file endings by looping them, and allows stopping via active_ingestions.
    """
    logger.info(f"Ingestion worker started for camera {camera_id} (source: {stream_url})")
    active_ingestions[camera_id] = True
    
    frame_count = 0
    while active_ingestions.get(camera_id):
        try:
            cap = open_source(stream_url)
            for frame, timestamp, count in read_frames(cap):
                if not active_ingestions.get(camera_id):
                    break
                frame_count += 1
                
                # Log frame count + timestamp to console/logs every 30 frames
                if frame_count % 30 == 0:
                    logger.info(
                        f"[Ingest Log] Camera: {camera_id} | Frame Count: {frame_count} | Timestamp: {timestamp}"
                    )
                
            cap.release()
            
            # Delay before loop restart
            import os
            if active_ingestions.get(camera_id):
                if isinstance(stream_url, str) and os.path.exists(stream_url):
                    # Throttling to prevent high CPU utilization during file loop reopen
                    time.sleep(0.01)
                else:
                    time.sleep(2.0)
                    
        except Exception as e:
            logger.error(f"Error in camera {camera_id} ingestion worker: {e}")
            if active_ingestions.get(camera_id):
                time.sleep(2.0)
                
    logger.info(f"Ingestion worker stopped for camera {camera_id}")


def run_video_verification(job_id: str, source: str):
    """
    Background worker that runs stream_frames for a maximum of 300 frames
    to verify source availability and measure performance metrics.
    """
    jobs_db[job_id]["status"] = "processing"
    start_time = time.time()
    total_frames = 0
    resolution = "640x480"
    
    try:
        # Stream up to 300 frames for verification
        for frame, count, ts in stream_frames(
            source=source,
            target_size=(640, 480),
            log_every_n=30
        ):
            total_frames = count
            h, w = frame.shape[:2]
            resolution = f"{w}x{h}"
            
            # Update live stats in the DB
            duration = time.time() - start_time
            jobs_db[job_id].update({
                "processed_frames": total_frames,
                "duration_seconds": round(duration, 2),
                "fps": round(total_frames / duration, 2) if duration > 0 else 0.0,
                "resolution": resolution
            })
            
            # Limit the check to 300 frames
            if count >= 300:
                break
                
        # If it finished normally
        duration = time.time() - start_time
        jobs_db[job_id].update({
            "status": "completed",
            "processed_frames": total_frames,
            "duration_seconds": round(duration, 2),
            "fps": round(total_frames / duration, 2) if duration > 0 else 0.0,
            "resolution": resolution
        })
        logger.info(f"Verification job {job_id} completed successfully. Processed {total_frames} frames.")
        
    except Exception as e:
        logger.error(f"Verification job {job_id} failed: {e}")
        duration = time.time() - start_time
        jobs_db[job_id].update({
            "status": "failed",
            "error": str(e),
            "duration_seconds": round(duration, 2)
        })

@router.post("/verify", response_model=VerifyJobStatusResponse, status_code=status.HTTP_202_ACCEPTED)
def trigger_video_verification(
    payload: VideoVerifyRequest,
    background_tasks: BackgroundTasks,
    current_user = Depends(get_current_user)
):
    job_id = str(uuid.uuid4())
    
    # Initialize job in DB
    jobs_db[job_id] = {
        "job_id": job_id,
        "status": "queued",
        "source": payload.source,
        "processed_frames": 0,
        "duration_seconds": 0.0,
        "fps": 0.0,
        "resolution": None,
        "error": None
    }
    
    # Dispatch background worker
    background_tasks.add_task(run_video_verification, job_id, payload.source)
    
    return VerifyJobStatusResponse(**jobs_db[job_id])

@router.get("/verify/{job_id}", response_model=VerifyJobStatusResponse)
def get_verification_status(
    job_id: str,
    current_user = Depends(get_current_user)
):
    if job_id not in jobs_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Verification job not found"
        )
    return VerifyJobStatusResponse(**jobs_db[job_id])


# ─── INGESTION CONTROL ENDPOINTS ──────────────────────────────────────────────

@router.post("/start", status_code=status.HTTP_202_ACCEPTED)
def start_camera_ingestion(
    payload: CameraIngestRequest,
    background_tasks: BackgroundTasks,
    session: Session = Depends(get_session),
    current_user = Depends(get_current_user)
):
    # 1. Look up camera to get its stream_url
    camera = session.get(Camera, payload.camera_id)
    if not camera:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Camera with ID {payload.camera_id} not found."
        )
        
    # Check if already running
    if active_ingestions.get(payload.camera_id):
        return {
            "status": "already_running",
            "camera_id": payload.camera_id,
            "stream_url": camera.stream_url
        }
        
    # 2. Dispatch ingestion background worker
    background_tasks.add_task(ingest_worker, payload.camera_id, camera.stream_url)
    
    return {
        "status": "ingestion_started",
        "camera_id": payload.camera_id,
        "stream_url": camera.stream_url
    }

@router.post("/stop", status_code=status.HTTP_200_OK)
def stop_camera_ingestion(
    payload: CameraIngestRequest,
    current_user = Depends(get_current_user)
):
    if not active_ingestions.get(payload.camera_id):
        return {
            "status": "not_running",
            "camera_id": payload.camera_id
        }
        
    # Toggle flag to stop background task
    active_ingestions[payload.camera_id] = False
    
    return {
        "status": "ingestion_stopping",
        "camera_id": payload.camera_id
    }
