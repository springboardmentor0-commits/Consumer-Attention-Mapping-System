import json
import os
import uuid

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    UploadFile,
)
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import MANAGEMENT_ROLES, require_roles
from app.crud.analytics import get_last_processed
from app.models.shelf import Shelf
from app.models.store import Store
from app.services.notifications import sync_store_notifications
from app.services.video_stream import VideoStreamError, start_video_stream


router = APIRouter(
    prefix="/api/camera",
    tags=["Camera"],
    # Running the pipeline is operational configuration, not an analytical
    # read, so it sits in the same tier as shelf management.
    dependencies=[Depends(require_roles(*MANAGEMENT_ROLES))],
)


# Videos must live inside this directory. A server-side source names a file
# relative to it, never a full path, so the endpoint cannot be used to open
# arbitrary files elsewhere on the server.
VIDEO_ROOT = os.path.abspath(
    os.getenv(
        "VIDEO_SOURCE_DIR",
        os.path.join("app", "static", "videos"),
    )
)

# Uploads land in their own subdirectory so they are easy to prune and are
# kept out of version control (see backend/.gitignore).
UPLOAD_ROOT = os.path.join(VIDEO_ROOT, "uploads")

# Containers OpenCV can open with the bundled FFMPEG backend.
ALLOWED_EXTENSIONS = {".mp4", ".avi", ".mov", ".mkv", ".webm"}

# Guards against filling the disk with a single request.
MAX_UPLOAD_BYTES = 500 * 1024 * 1024

# Upper bound on a single run. A camera stream never ends on its own and the
# headless pipeline has no interactive stop key, so every request is bounded to
# keep it from hanging.
MAX_RUN_SECONDS = 120
DEFAULT_RUN_SECONDS = 30


def resolve_source(raw: str):
    """
    Turn a server-side source into something cv2.VideoCapture accepts.

    Digits become a camera index. Anything else is treated as a filename
    inside VIDEO_ROOT, with the resolved path checked to be under that root so
    "../../etc/passwd" style inputs are rejected.
    """

    candidate = (raw or "").strip()

    if not candidate:
        raise HTTPException(status_code=400, detail="No source supplied")

    if candidate.isdigit():
        return int(candidate)

    resolved = os.path.abspath(os.path.join(VIDEO_ROOT, candidate))

    if os.path.commonpath([resolved, VIDEO_ROOT]) != VIDEO_ROOT:
        raise HTTPException(
            status_code=400,
            detail="Source must be a file inside the configured video directory",
        )

    if not os.path.isfile(resolved):
        raise HTTPException(
            status_code=404,
            detail=f"Video not found: {candidate}",
        )

    return resolved


def save_upload(upload: UploadFile) -> str:
    """
    Persist an uploaded video and return its path.

    The client filename is never used on disk — only its extension, after
    checking it against the allowed set. The stored name is generated, so a
    crafted filename cannot traverse directories or overwrite anything.
    """

    extension = os.path.splitext(upload.filename or "")[1].lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=(
                "Unsupported video format. Allowed: "
                + ", ".join(sorted(ALLOWED_EXTENSIONS))
            ),
        )

    os.makedirs(UPLOAD_ROOT, exist_ok=True)

    destination = os.path.join(UPLOAD_ROOT, f"{uuid.uuid4().hex}{extension}")

    size = 0

    try:
        with open(destination, "wb") as target:
            while True:
                chunk = upload.file.read(1024 * 1024)

                if not chunk:
                    break

                size += len(chunk)

                if size > MAX_UPLOAD_BYTES:
                    raise HTTPException(
                        status_code=413,
                        detail=(
                            "Video exceeds the "
                            f"{MAX_UPLOAD_BYTES // (1024 * 1024)} MB upload limit"
                        ),
                    )

                target.write(chunk)

    except HTTPException:
        # Don't leave a partial file behind when the upload is rejected.
        if os.path.exists(destination):
            os.remove(destination)
        raise

    except Exception as error:
        if os.path.exists(destination):
            os.remove(destination)
        raise HTTPException(
            status_code=400,
            detail=f"Could not save upload: {error}",
        )

    finally:
        upload.file.close()

    if size == 0:
        os.remove(destination)
        raise HTTPException(status_code=400, detail="Uploaded file is empty")

    return destination


def parse_shelf_map(raw: str | None):
    """
    Read the zone-to-shelf mapping sent alongside a multipart upload.

    It arrives as a JSON string because multipart form fields are flat.
    """

    if not raw or not raw.strip():
        return None

    try:
        parsed = json.loads(raw)
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=400,
            detail="shelf_map must be valid JSON",
        )

    if not isinstance(parsed, dict):
        raise HTTPException(
            status_code=400,
            detail="shelf_map must be an object of region to shelf id",
        )

    try:
        return {str(region): int(shelf) for region, shelf in parsed.items()}
    except (TypeError, ValueError):
        raise HTTPException(
            status_code=400,
            detail="shelf_map values must be shelf ids",
        )


@router.post("/process")
def process_video(
    db: Session = Depends(get_db),
    # Which store this footage belongs to. Required: without it the sessions
    # would be written unattributed and pool with every other store's data,
    # which is the bug this parameter exists to prevent.
    store_id: int = Form(...),
    # JSON object mapping a frame region to a Shelf id, e.g.
    # {"Left Display": 7}. The pipeline never infers this — a region is frame
    # geometry, not a shelf record — so shelf_id is only set for regions the
    # caller explicitly declares.
    shelf_map: str | None = Form(None),
    # Server-side filename inside VIDEO_SOURCE_DIR, or "0"/"1" for a locally
    # attached camera index. Ignored when a file is uploaded.
    source: str | None = Form(None),
    max_seconds: int = Form(DEFAULT_RUN_SECONDS),
    # An uploaded video. This is the normal path from the dashboard.
    file: UploadFile | None = File(None),
):
    """
    Process one video and refresh this store's analytics.

    On-demand batch processing, not a live stream: the source is processed to
    completion, shopper sessions are written against the given store, the
    heatmap is regenerated and segmentation re-runs for that store.

    Accepts either an uploaded file (multipart) or the name of a video already
    sitting in the configured video directory.
    """

    if max_seconds < 1 or max_seconds > MAX_RUN_SECONDS:
        raise HTTPException(
            status_code=422,
            detail=f"max_seconds must be between 1 and {MAX_RUN_SECONDS}",
        )

    store = db.query(Store).filter(Store.id == store_id).first()

    if store is None:
        raise HTTPException(
            status_code=404,
            detail=f"Store not found: {store_id}",
        )

    mapping = parse_shelf_map(shelf_map)

    # Every declared shelf must exist and belong to the store being processed,
    # otherwise sessions would be filed against another store's shelf.
    if mapping:
        shelf_ids = set(mapping.values())

        owned = {
            shelf.id
            for shelf in db.query(Shelf)
            .filter(Shelf.id.in_(shelf_ids))
            .filter(Shelf.store_id == store_id)
            .all()
        }

        invalid = shelf_ids - owned

        if invalid:
            raise HTTPException(
                status_code=400,
                detail=(
                    "Shelves do not exist or belong to another store: "
                    + ", ".join(str(i) for i in sorted(invalid))
                ),
            )

    uploaded_path = None

    if file is not None and file.filename:
        uploaded_path = save_upload(file)
        resolved_source = uploaded_path
        source_label = file.filename
    else:
        resolved_source = resolve_source(source or "0")
        source_label = source or "0"

    try:
        summary = start_video_stream(
            resolved_source,
            display=False,
            max_seconds=max_seconds,
            store_id=store_id,
            shelf_map=mapping,
        )

    except VideoStreamError as error:
        # The source could not be opened, so nothing ran and nothing was
        # written. Existing analytics are untouched.
        _discard(uploaded_path)
        raise HTTPException(status_code=400, detail=str(error))

    except Exception as error:
        # An unexpected mid-run failure. Sessions committed before the failure
        # remain valid; the client is told the run did not complete.
        _discard(uploaded_path)
        raise HTTPException(
            status_code=500,
            detail=f"Processing failed: {error}",
        )

    # Analytics just changed, which is the only moment the alert state for this
    # store can change. Recording findings here keeps it out of the read paths,
    # so simply opening a dashboard never writes notifications.
    try:
        notifications_created = len(sync_store_notifications(db, store_id))
    except Exception as error:
        # A processed video is the valuable outcome; failing to note an alert
        # must not turn a successful run into an error.
        print(f"Could not record notifications for store {store_id}: {error}")
        notifications_created = 0

    return {
        "status": "completed",
        "source": source_label,
        "store_id": store_id,
        "notifications_created": notifications_created,
        "uploaded": uploaded_path is not None,
        "frames_processed": summary["frames_processed"],
        "sessions_written": summary["sessions_written"],
        "session_write_failures": summary["session_write_failures"],
        "heatmap_generated": summary["heatmap_generated"],
        "segmentation_ran": summary["segmentation_ran"],
        "duration_seconds": summary["duration_seconds"],
        "stopped_at_limit": summary["stopped_at_limit"],
        "last_processed": get_last_processed(db, store_id=store_id),
    }


def _discard(path: str | None):
    """Remove an upload whose run never produced anything."""

    if path and os.path.exists(path):
        try:
            os.remove(path)
        except OSError:
            # Cleanup is best effort; a stale upload is not worth failing on.
            pass
