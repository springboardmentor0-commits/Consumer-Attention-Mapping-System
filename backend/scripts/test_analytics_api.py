#!/usr/bin/env python3
"""
Automated API Verification Script for GET /api/analytics/attention.
Tests metrics calculation, time window filtering, shelf attention aggregation, and time-series bucketing.
"""

import sys
import os
import uuid
import logging
from datetime import datetime, timedelta, timezone

# Ensure backend directory is in path
script_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(script_dir)
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.models.schemas import Shelf, DwellTime, GazeEvent
import dotenv
dotenv.load_dotenv(os.path.join(backend_dir, ".env"))

if not os.environ.get("DATABASE_URL"):
    os.environ["DATABASE_URL"] = "postgresql://postgres:postgres@localhost:5432/consumer_ms"

from app.api.analytics import parse_time_window, get_attention_analytics

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("test_analytics_api")


def test_time_window_parser():
    logger.info("--- Testing Time Window Parser ---")
    t1 = parse_time_window("1h")
    t24 = parse_time_window("24h")
    t_all = parse_time_window("all")

    assert t1 is not None, "1h cutoff should not be None"
    assert t24 is not None, "24h cutoff should not be None"
    assert t_all is None, "all cutoff should be None"
    assert t1 > t24, "1h cutoff must be more recent than 24h cutoff"
    logger.info("✅ Time Window Parser PASSED")


class DummySession:
    """Mock SQLModel session for offline verification."""
    def __init__(self, shelves, dwell_records, gaze_records):
        self.shelves = shelves
        self.dwell_records = dwell_records
        self.gaze_records = gaze_records

    def exec(self, statement):
        statement_str = str(statement).lower()
        if "shelves" in statement_str:
            return DummyResult(self.shelves)
        elif "dwell_times" in statement_str:
            return DummyResult(self.dwell_records)
        elif "gaze_events" in statement_str:
            return DummyResult(self.gaze_records)
        return DummyResult([])


class DummyResult:
    def __init__(self, items):
        self.items = items

    def all(self):
        return self.items


def test_analytics_aggregation():
    logger.info("--- Testing Analytics Aggregation Logic ---")
    store_id = uuid.uuid4()
    s1_id = uuid.uuid4()
    s2_id = uuid.uuid4()

    shelves = [
        Shelf(id=s1_id, store_id=store_id, shelf_name="Shelf A (Beverages)", zone_coordinates=[[0, 0], [10, 10]], created_at=datetime.now(timezone.utc)),
        Shelf(id=s2_id, store_id=store_id, shelf_name="Shelf B (Snacks)", zone_coordinates=[[10, 10], [20, 20]], created_at=datetime.now(timezone.utc)),
    ]

    now = datetime.now(timezone.utc)
    z_id = uuid.uuid4()

    dwell_records = [
        DwellTime(id=uuid.uuid4(), store_id=store_id, zone_id=z_id, shopper_id=1, entry_timestamp=now - timedelta(hours=2), exit_timestamp=now - timedelta(hours=1, minutes=50), dwell_duration_seconds=600.0, created_at=now),
        DwellTime(id=uuid.uuid4(), store_id=store_id, zone_id=z_id, shopper_id=2, entry_timestamp=now - timedelta(hours=1), exit_timestamp=now - timedelta(minutes=30), dwell_duration_seconds=1800.0, created_at=now),
    ]

    gaze_records = [
        GazeEvent(id=uuid.uuid4(), store_id=store_id, shelf_id=s1_id, shopper_id=1, timestamp=now - timedelta(hours=1, minutes=55)),
        GazeEvent(id=uuid.uuid4(), store_id=store_id, shelf_id=s1_id, shopper_id=1, timestamp=now - timedelta(hours=1, minutes=50)),
        GazeEvent(id=uuid.uuid4(), store_id=store_id, shelf_id=s2_id, shopper_id=2, timestamp=now - timedelta(minutes=45)),
    ]

    session = DummySession(shelves, dwell_records, gaze_records)

    response = get_attention_analytics(
        store_id=store_id,
        time_window="24h",
        session=session,
        current_user={"id": "test_user"}
    )

    assert response.summary.total_dwell_seconds == 2400.0, f"Total dwell seconds mismatch: {response.summary.total_dwell_seconds}"
    assert response.summary.total_gaze_hits == 3, f"Total gaze hits mismatch: {response.summary.total_gaze_hits}"
    assert response.summary.total_unique_shoppers == 2, f"Total unique shoppers mismatch: {response.summary.total_unique_shoppers}"

    assert len(response.shelves_attention) == 2, "Expected 2 shelves in attention metric list"
    s1_metric = next(s for s in response.shelves_attention if s.shelf_id == str(s1_id))
    assert s1_metric.gaze_hits == 2, f"Shelf 1 gaze hits mismatch: {s1_metric.gaze_hits}"

    assert len(response.time_series) == 6, f"Expected 6 time-series data points, got {len(response.time_series)}"

    logger.info(
        f"✅ Analytics Aggregation PASSED: "
        f"Total Dwell={response.summary.total_dwell_seconds}s | Gaze Hits={response.summary.total_gaze_hits} | Most Attended={response.summary.most_attended_shelf}"
    )


if __name__ == "__main__":
    test_time_window_parser()
    test_analytics_aggregation()
    logger.info("==================================================")
    logger.info("ALL ANALYTICS API TESTS PASSED SUCCESSFULLY! ✅")
    logger.info("==================================================")
