#!/usr/bin/env python3
"""
Automated unit test suite for ShopperDwellTracker.
Tests:
1. Zone geometry matching (polygons, bboxes, full-frame).
2. Zone entry/exit timestamp logging & dwell duration calculation.
3. Track re-entry (shopper exiting and re-entering zone).
4. Multiple simultaneous shoppers.
5. End-of-video session flush.
"""

import sys
import os
import uuid
import logging
from datetime import datetime, timedelta, timezone
import numpy as np
import supervision as sv

# Ensure backend directory is in path
script_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(script_dir)
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.models.schemas import Zone
from app.services.dwell_tracker import is_point_in_zone, ShopperDwellTracker

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("test_dwell_tracker")


def test_geometry_matching():
    logger.info("--- Testing Zone Geometry Matching ---")
    frame_size = (1000, 1000)

    # Polygon: box from (100, 100) to (500, 500)
    poly_coords = [[100, 100], [500, 100], [500, 500], [100, 500]]

    assert is_point_in_zone((200, 200), poly_coords, frame_size) == True, "Inside polygon failed"
    assert is_point_in_zone((50, 50), poly_coords, frame_size) == False, "Outside polygon failed"
    assert is_point_in_zone((600, 600), poly_coords, frame_size) == False, "Outside polygon failed"

    # Bbox dict
    dict_coords = {"x_min": 100, "y_min": 100, "x_max": 500, "y_max": 500}
    assert is_point_in_zone((300, 300), dict_coords, frame_size) == True, "Inside dict bbox failed"
    assert is_point_in_zone((700, 300), dict_coords, frame_size) == False, "Outside dict bbox failed"

    # Full frame
    assert is_point_in_zone((999, 999), "full_frame", frame_size) == True, "Full frame failed"
    logger.info("✅ Zone Geometry Matching PASSED")


def test_entry_exit_and_dwell_duration():
    logger.info("--- Testing Entry/Exit Timestamp Logging & Dwell Duration ---")
    store_id = uuid.uuid4()
    zone_id = uuid.uuid4()

    zone = Zone(
        id=zone_id,
        store_id=store_id,
        zone_name="Entrance Zone",
        coordinates=[[0, 0], [400, 0], [400, 400], [0, 400]],
        zone_type="entrance",
        created_at=datetime.now(timezone.utc)
    )

    # Create tracker with 5-frame lost track buffer for fast test
    dwell_tracker = ShopperDwellTracker(store_id=store_id, zones=[zone], lost_track_buffer=5)

    base_time = datetime(2026, 7, 30, 10, 0, 0, tzinfo=timezone.utc)
    frame_size = (1000, 1000)

    # Frame 1: Shopper #1 enters Zone (x=200, y=200)
    det1 = sv.Detections(
        xyxy=np.array([[100, 100, 300, 200]], dtype=np.float32),
        tracker_id=np.array([1], dtype=int)
    )
    closed = dwell_tracker.process_frame_detections(det1, frame_size, 1, base_time)
    assert len(closed) == 0, "No session closed on entry"
    assert len(dwell_tracker.active_sessions) == 1, "1 active session expected"

    # Frames 2..10: Shopper #1 stays inside zone for 10 seconds (1 sec increments)
    for frame_i in range(2, 11):
        curr_time = base_time + timedelta(seconds=frame_i - 1)
        dwell_tracker.process_frame_detections(det1, frame_size, frame_i, curr_time)

    # Frame 11..17: Shopper #1 exits zone (empty detections). Exceeds lost_track_buffer (5 frames)
    for frame_i in range(11, 18):
        curr_time = base_time + timedelta(seconds=frame_i - 1)
        closed = dwell_tracker.process_frame_detections(sv.Detections.empty(), frame_size, frame_i, curr_time)
        if len(closed) > 0:
            break

    assert len(closed) == 1, "1 DwellTime record should be closed after exiting"
    rec = closed[0]
    assert rec.shopper_id == 1, "Shopper ID mismatch"
    assert rec.zone_id == zone_id, "Zone ID mismatch"
    assert rec.entry_timestamp == base_time, "Entry timestamp mismatch"
    # Last seen was frame 10 (t=9s)
    expected_exit = base_time + timedelta(seconds=9)
    assert rec.exit_timestamp == expected_exit, f"Exit timestamp mismatch: got {rec.exit_timestamp}"
    assert abs(rec.dwell_duration_seconds - 9.0) < 0.1, f"Dwell duration mismatch: got {rec.dwell_duration_seconds}s"

    logger.info(
        f"✅ Entry/Exit Logging & Dwell Duration PASSED: "
        f"Entry={rec.entry_timestamp.isoformat()} | Exit={rec.exit_timestamp.isoformat()} | Duration={rec.dwell_duration_seconds}s"
    )


def test_track_re_entry():
    logger.info("--- Testing Track Re-entry Edge Case ---")
    store_id = uuid.uuid4()
    zone_id = uuid.uuid4()

    zone = Zone(
        id=zone_id,
        store_id=store_id,
        zone_name="Aisle 1",
        coordinates=[[0, 0], [400, 0], [400, 400], [0, 400]],
        zone_type="aisle",
        created_at=datetime.now(timezone.utc)
    )

    dwell_tracker = ShopperDwellTracker(store_id=store_id, zones=[zone], lost_track_buffer=2)
    base_time = datetime(2026, 7, 30, 11, 0, 0, tzinfo=timezone.utc)
    frame_size = (1000, 1000)

    det = sv.Detections(
        xyxy=np.array([[100, 100, 300, 200]], dtype=np.float32),
        tracker_id=np.array([42], dtype=int)
    )

    # Session 1: Shopper #42 enters for 5 seconds, then exits
    for f in range(1, 6):
        dwell_tracker.process_frame_detections(det, frame_size, f, base_time + timedelta(seconds=f))

    # Exit session 1
    for f in range(6, 10):
        dwell_tracker.process_frame_detections(sv.Detections.empty(), frame_size, f, base_time + timedelta(seconds=f))

    assert len(dwell_tracker.completed_records) == 1, "Session 1 should be completed"
    s1_record = dwell_tracker.completed_records[0]

    # Session 2: Shopper #42 RE-ENTERS Aisle 1 at t=15s
    re_entry_time = base_time + timedelta(seconds=15)
    for f in range(15, 20):
        dwell_tracker.process_frame_detections(det, frame_size, f, base_time + timedelta(seconds=f))

    # Exit session 2
    for f in range(20, 24):
        dwell_tracker.process_frame_detections(sv.Detections.empty(), frame_size, f, base_time + timedelta(seconds=f))

    assert len(dwell_tracker.completed_records) == 2, "Session 2 re-entry record should be completed"
    s2_record = dwell_tracker.completed_records[1]

    assert s1_record.shopper_id == 42 and s2_record.shopper_id == 42
    assert s2_record.entry_timestamp == re_entry_time, "Re-entry timestamp mismatch"
    assert s2_record.entry_timestamp > s1_record.exit_timestamp, "Re-entry must occur after first exit"

    logger.info(
        f"✅ Track Re-entry PASSED: "
        f"Session 1: {s1_record.entry_timestamp.isoformat()} -> {s1_record.exit_timestamp.isoformat()} ({s1_record.dwell_duration_seconds}s) | "
        f"Session 2: {s2_record.entry_timestamp.isoformat()} -> {s2_record.exit_timestamp.isoformat()} ({s2_record.dwell_duration_seconds}s)"
    )


def test_multiple_simultaneous_shoppers_and_flush():
    logger.info("--- Testing Multiple Simultaneous Shoppers & End-of-Video Flush ---")
    store_id = uuid.uuid4()
    z1_id, z2_id = uuid.uuid4(), uuid.uuid4()

    z1 = Zone(id=z1_id, store_id=store_id, zone_name="Zone Left", coordinates=[[0, 0], [500, 0], [500, 1000], [0, 1000]], zone_type="left", created_at=datetime.now(timezone.utc))
    z2 = Zone(id=z2_id, store_id=store_id, zone_name="Zone Right", coordinates=[[501, 0], [1000, 0], [1000, 1000], [501, 1000]], zone_type="right", created_at=datetime.now(timezone.utc))

    dwell_tracker = ShopperDwellTracker(store_id=store_id, zones=[z1, z2], lost_track_buffer=60)
    base_time = datetime(2026, 7, 30, 12, 0, 0, tzinfo=timezone.utc)
    frame_size = (1000, 1000)

    # Frame 1: Shopper #10 in Zone 1 (x=200), Shopper #20 in Zone 2 (x=700)
    multi_det = sv.Detections(
        xyxy=np.array([
            [100, 100, 300, 300],  # Shopper #10 (feet y=300, x=200 -> Zone 1)
            [600, 100, 800, 300]   # Shopper #20 (feet y=300, x=700 -> Zone 2)
        ], dtype=np.float32),
        tracker_id=np.array([10, 20], dtype=int)
    )

    # Stream 10 frames
    for f in range(1, 11):
        dwell_tracker.process_frame_detections(multi_det, frame_size, f, base_time + timedelta(seconds=f))

    assert len(dwell_tracker.active_sessions) == 2, "2 simultaneous active sessions expected"

    # Trigger end-of-video flush at t=15s
    flush_time = base_time + timedelta(seconds=15)
    flushed = dwell_tracker.flush(flush_timestamp=flush_time)

    assert len(flushed) == 2, "Both active sessions must be flushed at stream end"
    assert len(dwell_tracker.active_sessions) == 0, "Active sessions map must be empty after flush"

    s10 = next(r for r in flushed if r.shopper_id == 10)
    s20 = next(r for r in flushed if r.shopper_id == 20)

    assert s10.zone_id == z1_id, "Shopper 10 zone mismatch"
    assert s20.zone_id == z2_id, "Shopper 20 zone mismatch"
    assert s10.exit_timestamp == flush_time, "Shopper 10 flush exit timestamp mismatch"
    assert s20.exit_timestamp == flush_time, "Shopper 20 flush exit timestamp mismatch"

    logger.info("✅ Multiple Simultaneous Shoppers & End-of-Video Flush PASSED")


if __name__ == "__main__":
    test_geometry_matching()
    test_entry_exit_and_dwell_duration()
    test_track_re_entry()
    test_multiple_simultaneous_shoppers_and_flush()
    logger.info("==================================================")
    logger.info("ALL DWELL TIME TRACKER UNIT TESTS PASSED SUCCESSFULLY! ✅")
    logger.info("==================================================")
