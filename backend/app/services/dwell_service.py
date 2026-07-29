import uuid
import time
import logging
from datetime import datetime, timezone
from typing import Dict, Any, Optional, List
from sqlmodel import Session, select

from app.core.db import engine
from app.models.schemas import Store, Zone, DwellTime
from app.services.person_tracker import PersonTracker
from app.services.dwell_tracker import ShopperDwellTracker
from app.services.video_capture import stream_frames

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

# In-memory jobs tracking status
dwell_jobs_db: Dict[str, Dict[str, Any]] = {}


def process_video_dwell_background_task(
    job_id: str,
    source: Union[str, int],
    store_id: uuid.UUID,
    camera_id: Optional[uuid.UUID] = None,
    conf_threshold: float = 0.3,
    track_buffer: int = 60,
    max_frames: Optional[int] = None
):
    """
    Background worker that runs YOLOv8 + ByteTrack + Dwell Time engine over a video source
    and persists generated DwellTime records into TimescaleDB/PostgreSQL.
    """
    logger.info(f"Starting Dwell Time Background Job {job_id} for store {store_id} (Source: {source})")

    dwell_jobs_db[job_id] = {
        "job_id": job_id,
        "status": "processing",
        "store_id": str(store_id),
        "camera_id": str(camera_id) if camera_id else None,
        "source": str(source),
        "processed_frames": 0,
        "unique_shoppers_tracked": 0,
        "records_persisted": 0,
        "duration_seconds": 0.0,
        "error": None,
        "started_at": datetime.now(timezone.utc).isoformat(),
        "completed_at": None
    }

    start_time = time.time()
    total_frames = 0

    try:
        # Fetch store zones from DB
        with Session(engine) as db_session:
            statement = select(Zone).where(Zone.store_id == store_id)
            zones = db_session.exec(statement).all()

            # Fallback: create default full-frame zone if store has no configured zones
            if not zones:
                logger.warning(f"No zones found for store {store_id}. Creating fallback full-frame zone.")
                default_zone = Zone(
                    id=uuid.uuid4(),
                    store_id=store_id,
                    zone_name="Full Store Floor",
                    coordinates="full_frame",
                    zone_type="floor",
                    created_at=datetime.now(timezone.utc)
                )
                zones = [default_zone]

        # Initialize PersonTracker and ShopperDwellTracker
        tracker_module = PersonTracker(
            conf_threshold=conf_threshold,
            track_buffer=track_buffer
        )
        dwell_tracker = ShopperDwellTracker(
            store_id=store_id,
            zones=zones,
            camera_id=camera_id,
            lost_track_buffer=track_buffer
        )

        all_dwell_records: List[DwellTime] = []

        # Process frames from source
        for frame, count, ts_float in stream_frames(source=source, target_size=None, log_every_n=60):
            total_frames = count
            frame_dt = datetime.fromtimestamp(ts_float, tz=timezone.utc)

            # Run detection & tracking
            _, detections = tracker_module.process_frame(frame, draw_annotations=False)

            # Update dwell session tracker
            closed_records = dwell_tracker.process_frame_detections(
                detections=detections,
                frame_shape=frame.shape,
                frame_idx=count,
                timestamp=frame_dt
            )
            all_dwell_records.extend(closed_records)

            # Update job progress status
            duration = time.time() - start_time
            stats = tracker_module.get_stats()
            dwell_jobs_db[job_id].update({
                "processed_frames": total_frames,
                "unique_shoppers_tracked": stats["total_unique_shoppers_seen"],
                "records_persisted": len(all_dwell_records),
                "duration_seconds": round(duration, 2)
            })

            if max_frames and count >= max_frames:
                logger.info(f"Reached max_frames limit ({max_frames}). Stopping task loop.")
                break

        # Flush in-progress sessions at stream completion
        flushed_records = dwell_tracker.flush(flush_timestamp=datetime.now(timezone.utc))
        all_dwell_records.extend(flushed_records)

        # Persist all DwellTime records into DB in a single transaction
        with Session(engine) as db_session:
            if all_dwell_records:
                logger.info(f"Persisting {len(all_dwell_records)} DwellTime records to TimescaleDB/PostgreSQL...")
                db_session.add_all(all_dwell_records)
                db_session.commit()

        duration = time.time() - start_time
        final_stats = tracker_module.get_stats()

        dwell_jobs_db[job_id].update({
            "status": "completed",
            "processed_frames": total_frames,
            "unique_shoppers_tracked": final_stats["total_unique_shoppers_seen"],
            "records_persisted": len(all_dwell_records),
            "duration_seconds": round(duration, 2),
            "completed_at": datetime.now(timezone.utc).isoformat()
        })
        logger.info(
            f"✅ Dwell job {job_id} completed successfully. "
            f"Frames: {total_frames} | Unique Shoppers: {final_stats['total_unique_shoppers_seen']} | Records Saved: {len(all_dwell_records)}"
        )

    except Exception as e:
        logger.error(f"❌ Dwell job {job_id} failed: {e}", exc_info=True)
        duration = time.time() - start_time
        dwell_jobs_db[job_id].update({
            "status": "failed",
            "error": str(e),
            "duration_seconds": round(duration, 2),
            "completed_at": datetime.now(timezone.utc).isoformat()
        })
