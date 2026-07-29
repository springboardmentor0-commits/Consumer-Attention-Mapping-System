#!/usr/bin/env python3
"""
Occlusion Persistence Validation Script.
Simulates a video sequence where a person object moves across frames, disappears (occluded for 20 frames),
and reappears. Verifies that ByteTrack preserves the same persistent Tracker ID instead of creating a new one.
"""

import sys
import os
import cv2
import numpy as np
import logging
import supervision as sv

# Add backend directory to path
script_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(script_dir)
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

import warnings
warnings.filterwarnings("ignore", category=FutureWarning)

from app.services.person_tracker import PersonTracker

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("test_occlusion")

def run_occlusion_test():
    logger.info("Initializing ByteTrack occlusion persistence simulation...")
    
    # lost_track_buffer set to 60 frames (~2 seconds at 30 fps)
    tracker = sv.ByteTrack(
        track_activation_threshold=0.25,
        lost_track_buffer=60,
        minimum_matching_threshold=0.8,
        frame_rate=30
    )

    ids_phase1 = [] # Before occlusion
    ids_phase2 = [] # During occlusion
    ids_phase3 = [] # After occlusion (re-appearance)

    # Phase 1: Object present in frames 1..20
    for frame_idx in range(1, 21):
        x1, y1 = 100 + frame_idx * 5, 100
        x2, y2 = x1 + 50, y1 + 100
        det = sv.Detections(
            xyxy=np.array([[x1, y1, x2, y2]], dtype=np.float32),
            confidence=np.array([0.9], dtype=np.float32),
            class_id=np.array([0], dtype=int)
        )
        tracked = tracker.update_with_detections(det)
        if tracked.tracker_id is not None and len(tracked.tracker_id) > 0:
            ids_phase1.append(tracked.tracker_id[0])

    # Phase 2: Object occluded (missing/no detection) in frames 21..40 (20 frames missing)
    for frame_idx in range(21, 41):
        det = sv.Detections.empty()
        tracked = tracker.update_with_detections(det)
        if tracked.tracker_id is not None and len(tracked.tracker_id) > 0:
            ids_phase2.append(tracked.tracker_id[0])

    # Phase 3: Object reappears in frames 41..60 (moving past pillar)
    for frame_idx in range(41, 61):
        x1, y1 = 100 + frame_idx * 5, 100
        x2, y2 = x1 + 50, y1 + 100
        det = sv.Detections(
            xyxy=np.array([[x1, y1, x2, y2]], dtype=np.float32),
            confidence=np.array([0.88], dtype=np.float32),
            class_id=np.array([0], dtype=int)
        )
        tracked = tracker.update_with_detections(det)
        if tracked.tracker_id is not None and len(tracked.tracker_id) > 0:
            ids_phase3.append(tracked.tracker_id[0])

    initial_id = ids_phase1[-1] if ids_phase1 else None
    reappeared_id = ids_phase3[0] if ids_phase3 else None

    logger.info(f"Phase 1 (Before occlusion) Tracker ID: {initial_id}")
    logger.info(f"Phase 2 (During 20-frame occlusion) Detections: empty")
    logger.info(f"Phase 3 (Re-appearance after occlusion) Tracker ID: {reappeared_id}")

    assert initial_id is not None, "Failed to assign initial tracker ID"
    assert reappeared_id == initial_id, f"ID changed after occlusion! Initial: {initial_id}, Reappeared: {reappeared_id}"

    logger.info("✅ SUCCESS: Tracker ID successfully persisted through 20-frame occlusion!")

if __name__ == "__main__":
    run_occlusion_test()
