from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import tempfile, os, cv2

from ..database import get_db
from . import engine as detection_engine
from . import crud as detection_crud

router = APIRouter(prefix="/detection", tags=["Detection"])


@router.get("/cctv-stream")
def cctv_stream(source: str = Query("0", description="Camera index (e.g. 0), RTSP URL, or video file path")):
    """Stream live CCTV feed with real-time Ultralytics YOLO person/shopper detection overlays."""
    # Convert string digit to int (camera index)
    cam_source = int(source) if source.isdigit() else source
    return StreamingResponse(
        detection_engine.generate_cctv_frames(source=cam_source),
        media_type="multipart/x-mixed-replace; boundary=frame"
    )


@router.post("/detect")
async def detect_from_video(
    store_id: int,
    video: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """Upload a video file and run person detection on every frame."""
    suffix = os.path.splitext(video.filename or ".mp4")[1]
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp.write(await video.read())
        tmp_path = tmp.name

    try:
        all_detections = detection_engine.process_video(tmp_path)

        saved = []
        for frame_result in all_detections:
            for det in frame_result.get("detections", []):
                db_det = detection_crud.create_detection(db, {
                    "store_id": store_id,
                    "bbox": [int(v) for v in det["bbox"]],
                    "confidence": det["confidence"],
                })
                saved.append(db_det.id)
        db.commit()

        return {
            "frames_processed": len(all_detections),
            "detections_saved": len(saved),
        }
    finally:
        os.unlink(tmp_path)


@router.post("/detect-frame")
async def detect_single_frame(
    store_id: int,
    image: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """Upload a single image and run person detection."""
    contents = await image.read()
    import numpy as np
    nparr = np.frombuffer(contents, np.uint8)
    frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if frame is None:
        raise HTTPException(status_code=400, detail="Invalid image file")

    detections = detection_engine.infer_frame(frame)

    saved = []
    for det in detections:
        db_det = detection_crud.create_detection(db, {
            "store_id": store_id,
            "bbox": [int(v) for v in det["bbox"]],
            "confidence": det["confidence"],
        })
        saved.append(db_det.id)
    db.commit()

    return {
        "detections": detections,
        "detections_saved": len(saved),
    }

