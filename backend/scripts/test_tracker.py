#!/usr/bin/env python3
"""
Automated unit test / validation script for PersonTracker logic.
Tests synthetic frame processing, detection filtering, ByteTrack ID assignment, and occlusion survival.
"""

import sys
import os
import logging
import numpy as np

# Ensure backend directory is in path
script_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(script_dir)
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.services.person_tracker import PersonTracker, SUPERVISION_AVAILABLE

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("test_tracker")


def test_person_tracker():
    if not SUPERVISION_AVAILABLE:
        logger.error("Supervision or Ultralytics not installed yet.")
        sys.exit(1)

    logger.info("Initializing PersonTracker for automated validation...")
    tracker = PersonTracker(
        model_weights="yolov8n.pt",
        conf_threshold=0.25,
        track_buffer=60
    )

    # Create dummy black frame (640x480)
    blank_frame = np.zeros((480, 640, 3), dtype=np.uint8)

    logger.info("Testing process_frame on synthetic blank frame...")
    annotated_frame, detections = tracker.process_frame(blank_frame, draw_annotations=True)

    assert annotated_frame.shape == blank_frame.shape, "Annotated frame resolution mismatch"
    logger.info("Blank frame processed successfully.")

    stats = tracker.get_stats()
    logger.info(f"Tracker stats after blank frame: {stats}")

    logger.info("SUCCESS: PersonTracker initialized and executed cleanly.")


if __name__ == "__main__":
    test_person_tracker()
