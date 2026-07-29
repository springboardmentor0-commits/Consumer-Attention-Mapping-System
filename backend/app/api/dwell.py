import uuid
import logging
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, BackgroundTasks, HTTPException, Query, status
from pydantic import BaseModel
from sqlmodel import Session, select

from app.core.deps import get_current_user
from app.core.db import get_session
from app.models.schemas import Store, Zone, DwellTime
from app.services.dwell_service import process_video_dwell_background_task, dwell_jobs_db

router = APIRouter(prefix="/dwell", tags=["dwell"])
logger = logging.getLogger(__name__)


class ProcessVideoDwellRequest(BaseModel):
    source: str
    store_id: uuid.UUID
    camera_id: Optional[uuid.UUID] = None
    conf_threshold: float = 0.3
    track_buffer: int = 60
    max_frames: Optional[int] = None


class DwellJobStatusResponse(BaseModel):
    job_id: str
    status: str
    store_id: str
    camera_id: Optional[str] = None
    source: str
    processed_frames: int
    unique_shoppers_tracked: int
    records_persisted: int
    duration_seconds: float
    error: Optional[str] = None
    started_at: Optional[str] = None
    completed_at: Optional[str] = None


class DwellTimeRecordResponse(BaseModel):
    id: uuid.UUID
    store_id: uuid.UUID
    zone_id: uuid.UUID
    camera_id: Optional[uuid.UUID] = None
    shopper_id: int
    entry_timestamp: str
    exit_timestamp: str
    dwell_duration_seconds: float
    created_at: str


@router.post("/process-video", response_model=DwellJobStatusResponse, status_code=status.HTTP_202_ACCEPTED)
def trigger_dwell_time_processing(
    payload: ProcessVideoDwellRequest,
    background_tasks: BackgroundTasks,
    session: Session = Depends(get_session),
    current_user = Depends(get_current_user)
):
    """
    Trigger FastAPI background task to process video stream, track shopper entry/exit per zone,
    compute dwell durations, and persist records into TimescaleDB/PostgreSQL.
    """
    store = session.get(Store, payload.store_id)
    if not store:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Store with ID {payload.store_id} not found."
        )

    job_id = str(uuid.uuid4())

    # Queue background task
    background_tasks.add_task(
        process_video_dwell_background_task,
        job_id=job_id,
        source=payload.source,
        store_id=payload.store_id,
        camera_id=payload.camera_id,
        conf_threshold=payload.conf_threshold,
        track_buffer=payload.track_buffer,
        max_frames=payload.max_frames
    )

    # Initial response payload
    return DwellJobStatusResponse(
        job_id=job_id,
        status="queued",
        store_id=str(payload.store_id),
        camera_id=str(payload.camera_id) if payload.camera_id else None,
        source=payload.source,
        processed_frames=0,
        unique_shoppers_tracked=0,
        records_persisted=0,
        duration_seconds=0.0
    )


@router.get("/jobs/{job_id}", response_model=DwellJobStatusResponse)
def get_dwell_job_status(
    job_id: str,
    current_user = Depends(get_current_user)
):
    """
    Get background dwell tracking job status and metrics.
    """
    if job_id not in dwell_jobs_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Dwell tracking job {job_id} not found."
        )
    return DwellJobStatusResponse(**dwell_jobs_db[job_id])


@router.get("/records", response_model=List[DwellTimeRecordResponse])
def get_dwell_time_records(
    store_id: Optional[uuid.UUID] = Query(None, description="Filter records by Store ID"),
    zone_id: Optional[uuid.UUID] = Query(None, description="Filter records by Zone ID"),
    shopper_id: Optional[int] = Query(None, description="Filter records by Tracker Shopper ID"),
    limit: int = Query(100, ge=1, le=1000),
    session: Session = Depends(get_session),
    current_user = Depends(get_current_user)
):
    """
    Query persisted DwellTime records from TimescaleDB/PostgreSQL.
    """
    statement = select(DwellTime)
    if store_id:
        statement = statement.where(DwellTime.store_id == store_id)
    if zone_id:
        statement = statement.where(DwellTime.zone_id == zone_id)
    if shopper_id:
        statement = statement.where(DwellTime.shopper_id == shopper_id)

    statement = statement.order_by(DwellTime.entry_timestamp.desc()).limit(limit)
    results = session.exec(statement).all()

    response_list = []
    for r in results:
        response_list.append(
            DwellTimeRecordResponse(
                id=r.id,
                store_id=r.store_id,
                zone_id=r.zone_id,
                camera_id=r.camera_id,
                shopper_id=r.shopper_id,
                entry_timestamp=r.entry_timestamp.isoformat(),
                exit_timestamp=r.exit_timestamp.isoformat(),
                dwell_duration_seconds=r.dwell_duration_seconds,
                created_at=r.created_at.isoformat()
            )
        )

    return response_list
