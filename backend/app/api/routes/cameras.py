"""
Camera integration endpoints for Milestone 1.

At this stage we only register camera feed metadata (RTSP/HTTP URL, store,
zone) and expose a health-check endpoint that confirms the stream is
reachable. Actual frame ingestion, person detection, and tracking are built
in Milestone 2 (Consumer Detection & Attention Analysis).
"""
import uuid
from datetime import datetime

import cv2
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_roles
from app.db.database import get_db
from app.models.camera import Camera
from app.models.store import Store
from app.models.user import User
from app.models.enums import RoleEnum, CameraStatusEnum
from app.schemas.camera import CameraCreate, CameraOut

router = APIRouter(prefix="/cameras", tags=["Camera Integration"])

MANAGE_ROLES = (RoleEnum.ADMIN, RoleEnum.STORE_MANAGER)


@router.post("", response_model=CameraOut, status_code=201)
def register_camera(
    payload: CameraCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(*MANAGE_ROLES)),
):
    if not db.get(Store, payload.store_id):
        raise HTTPException(status_code=404, detail="Store not found")
    camera = Camera(**payload.model_dump())
    db.add(camera)
    db.commit()
    db.refresh(camera)
    return camera


@router.get("", response_model=list[CameraOut])
def list_cameras(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return db.query(Camera).all()


@router.get("/{store_id}/cameras", response_model=list[CameraOut])
def list_store_cameras(store_id: uuid.UUID, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return db.query(Camera).filter(Camera.store_id == store_id).all()


@router.post("/{camera_id}/check-connection", response_model=CameraOut)
def check_camera_connection(
    camera_id: uuid.UUID,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(*MANAGE_ROLES)),
):
    """
    Attempts to open the camera's stream URL with OpenCV to verify
    connectivity, then updates its status/heartbeat accordingly.
    """
    camera = db.get(Camera, camera_id)
    if not camera:
        raise HTTPException(status_code=404, detail="Camera not found")

    capture = cv2.VideoCapture(camera.stream_url)
    is_reachable = capture.isOpened()
    if is_reachable:
        # Try reading a single frame to confirm the stream is really live
        is_reachable, _frame = capture.read()
    capture.release()

    camera.status = CameraStatusEnum.ONLINE if is_reachable else CameraStatusEnum.ERROR
    camera.last_heartbeat = datetime.utcnow()
    db.commit()
    db.refresh(camera)
    return camera


@router.delete("/{camera_id}", status_code=204)
def delete_camera(
    camera_id: uuid.UUID,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(*MANAGE_ROLES)),
):
    camera = db.get(Camera, camera_id)
    if not camera:
        raise HTTPException(status_code=404, detail="Camera not found")
    db.delete(camera)
    db.commit()
