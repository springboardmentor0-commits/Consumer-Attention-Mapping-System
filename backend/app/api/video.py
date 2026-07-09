import uuid
import time
import logging
from fastapi import APIRouter, Depends, BackgroundTasks, HTTPException, status
from pydantic import BaseModel
from typing import Dict, Optional, Any, List

from app.core.deps import get_current_user
from app.services.video_capture import stream_frames

router = APIRouter(prefix="/video", tags=["video"])
logger = logging.getLogger(__name__)

# In-memory store for verification jobs
# In production, this would be backed by Redis or a database
jobs_db: Dict[str, Dict[str, Any]] = {}

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
