import uuid
import logging
from datetime import datetime, timedelta, timezone
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, Query, HTTPException, status
from pydantic import BaseModel
from sqlmodel import Session, select, func

from app.core.deps import get_current_user
from app.core.db import get_session
from app.models.schemas import Store, Shelf, Zone, DwellTime, GazeEvent

router = APIRouter(prefix="/analytics", tags=["analytics"])
logger = logging.getLogger(__name__)


class ShelfAttentionMetric(BaseModel):
    shelf_id: str
    shelf_name: str
    total_dwell_seconds: float
    gaze_hits: int
    unique_shoppers: int
    avg_dwell_seconds: float


class TimeSeriesDataPoint(BaseModel):
    timestamp: str
    dwell_seconds: float
    gaze_hits: int
    active_shoppers: int


class AttentionAnalyticsSummary(BaseModel):
    total_dwell_seconds: float
    total_gaze_hits: int
    total_unique_shoppers: int
    most_attended_shelf: str


class AttentionAnalyticsResponse(BaseModel):
    store_id: Optional[str]
    time_window: str
    summary: AttentionAnalyticsSummary
    shelves_attention: List[ShelfAttentionMetric]
    time_series: List[TimeSeriesDataPoint]


def parse_time_window(window: str) -> Optional[datetime]:
    now = datetime.now(timezone.utc)
    if window == "1h":
        return now - timedelta(hours=1)
    elif window == "24h":
        return now - timedelta(hours=24)
    elif window == "7d":
        return now - timedelta(days=7)
    elif window == "30d":
        return now - timedelta(days=30)
    elif window == "all":
        return None
    else:
        return now - timedelta(hours=24)


@router.get("/attention", response_model=AttentionAnalyticsResponse)
def get_attention_analytics(
    store_id: Optional[uuid.UUID] = Query(None, description="Filter analytics by Store ID"),
    time_window: str = Query("24h", description="Time window: 1h, 24h, 7d, 30d, all"),
    session: Session = Depends(get_session),
    current_user = Depends(get_current_user)
):
    """
    Get aggregated tracking, dwell duration, and gaze attention analytics per shelf and time-series trend from TimescaleDB/PostgreSQL.
    """
    cutoff_time = parse_time_window(time_window)

    # 1. Fetch shelves associated with the store
    shelves_query = select(Shelf)
    if store_id:
        shelves_query = shelves_query.where(Shelf.store_id == store_id)
    shelves = session.exec(shelves_query).all()

    # 2. Fetch dwell time records in time window
    dwell_query = select(DwellTime)
    if store_id:
        dwell_query = dwell_query.where(DwellTime.store_id == store_id)
    if cutoff_time:
        dwell_query = dwell_query.where(DwellTime.entry_timestamp >= cutoff_time)
    dwell_records = session.exec(dwell_query).all()

    # 3. Fetch gaze events in time window
    gaze_query = select(GazeEvent)
    if store_id:
        gaze_query = gaze_query.where(GazeEvent.store_id == store_id)
    if cutoff_time:
        gaze_query = gaze_query.where(GazeEvent.timestamp >= cutoff_time)
    gaze_records = session.exec(gaze_query).all()

    # Map gaze hits per shelf
    gaze_hits_map: Dict[uuid.UUID, int] = {}
    gaze_shoppers_map: Dict[uuid.UUID, set] = {}
    for g in gaze_records:
        gaze_hits_map[g.shelf_id] = gaze_hits_map.get(g.shelf_id, 0) + 1
        if g.shelf_id not in gaze_shoppers_map:
            gaze_shoppers_map[g.shelf_id] = set()
        gaze_shoppers_map[g.shelf_id].add(g.shopper_id)

    # Compute overall store metrics
    total_dwell_seconds = sum(r.dwell_duration_seconds for r in dwell_records)
    total_gaze_hits = len(gaze_records)

    all_shopper_ids = set(r.shopper_id for r in dwell_records).union(set(g.shopper_id for g in gaze_records))
    total_unique_shoppers = len(all_shopper_ids)

    # Build per-shelf attention list
    shelves_attention: List[ShelfAttentionMetric] = []
    highest_score = -1.0
    most_attended_shelf = "None"

    if shelves:
        # Divide dwell seconds across shelves or attribute per shelf
        shelf_count = len(shelves)
        for idx, shelf in enumerate(shelves):
            # Calculate dwell & gaze for this shelf
            gaze_count = gaze_hits_map.get(shelf.id, 0)
            shelf_gaze_shoppers = gaze_shoppers_map.get(shelf.id, set())

            # Distribute store dwell across shelves based on proportion of gaze hits or uniform split if no gaze data
            if total_gaze_hits > 0 and gaze_count > 0:
                shelf_dwell = total_dwell_seconds * (gaze_count / total_gaze_hits)
            else:
                shelf_dwell = round(total_dwell_seconds / shelf_count, 1) if shelf_count > 0 else 0.0

            shelf_shoppers = len(shelf_gaze_shoppers) if shelf_gaze_shoppers else (total_unique_shoppers if total_unique_shoppers > 0 else 0)
            avg_dwell = round(shelf_dwell / shelf_shoppers, 1) if shelf_shoppers > 0 else 0.0

            attention_score = shelf_dwell + (gaze_count * 5.0)
            if attention_score > highest_score:
                highest_score = attention_score
                most_attended_shelf = shelf.shelf_name

            shelves_attention.append(
                ShelfAttentionMetric(
                    shelf_id=str(shelf.id),
                    shelf_name=shelf.shelf_name,
                    total_dwell_seconds=round(shelf_dwell, 1),
                    gaze_hits=gaze_count,
                    unique_shoppers=shelf_shoppers,
                    avg_dwell_seconds=avg_dwell
                )
            )

    # Build time-series bucket data (e.g. 6 to 12 time points depending on window)
    now = datetime.now(timezone.utc)
    num_buckets = 6
    if time_window == "1h":
        bucket_delta = timedelta(minutes=10)
    elif time_window == "24h":
        bucket_delta = timedelta(hours=4)
    elif time_window == "7d":
        bucket_delta = timedelta(days=1)
    else:
        bucket_delta = timedelta(days=5)

    start_bucket_time = cutoff_time if cutoff_time else (now - timedelta(hours=24))
    time_series: List[TimeSeriesDataPoint] = []

    for b in range(num_buckets):
        b_start = start_bucket_time + (b * bucket_delta)
        b_end = b_start + bucket_delta

        bucket_dwells = [r for r in dwell_records if b_start <= r.entry_timestamp < b_end]
        bucket_gazes = [g for g in gaze_records if b_start <= g.timestamp < b_end]

        b_dwell_sec = sum(r.dwell_duration_seconds for r in bucket_dwells)
        b_gaze_count = len(bucket_gazes)
        b_shoppers = len(set(r.shopper_id for r in bucket_dwells).union(set(g.shopper_id for g in bucket_gazes)))

        # Format label
        label_str = b_start.strftime("%H:%M" if time_window in ["1h", "24h"] else "%b %d")

        time_series.append(
            TimeSeriesDataPoint(
                timestamp=label_str,
                dwell_seconds=round(b_dwell_sec, 1),
                gaze_hits=b_gaze_count,
                active_shoppers=b_shoppers
            )
        )

    summary = AttentionAnalyticsSummary(
        total_dwell_seconds=round(total_dwell_seconds, 1),
        total_gaze_hits=total_gaze_hits,
        total_unique_shoppers=total_unique_shoppers,
        most_attended_shelf=most_attended_shelf
    )

    return AttentionAnalyticsResponse(
        store_id=str(store_id) if store_id else None,
        time_window=time_window,
        summary=summary,
        shelves_attention=shelves_attention,
        time_series=time_series
    )
