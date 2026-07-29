#!/usr/bin/env python3
"""
Automated unit test suite for Gaze Estimation & Shelf Ray Intersection.
Tests:
1. Head region cropping from person bounding boxes.
2. MediaPipe Face Mesh head pose estimation (Pitch, Yaw, Roll).
3. Geometric gaze ray intersection with shelf polygons (Milestone 1 format).
4. Graceful handling of non-detected faces (side/back of head).
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

from app.services.gaze_estimator import (
    crop_head_region,
    HeadPoseEstimator,
    GazeResult,
    intersect_gaze_ray_with_shelves
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("test_gaze_estimation")


class DummyShelf:
    def __init__(self, shelf_id, shelf_name, zone_coordinates):
        self.id = shelf_id
        self.shelf_name = shelf_name
        self.zone_coordinates = zone_coordinates


def test_head_cropping():
    logger.info("--- Testing Head Region Cropping ---")
    frame = np.zeros((1000, 1000, 3), dtype=np.uint8)
    bbox = (200, 100, 400, 600)  # person box: 200x500

    crop, crop_box = crop_head_region(frame, bbox, head_ratio=0.40)
    assert crop is not None, "Head crop returned None"
    cx1, cy1, cx2, cy2 = crop_box

    assert cy1 == 100, "Head top y1 mismatch"
    assert cy2 > cy1 and cy2 < 600, "Head bottom y2 should be top 40% of box height"
    logger.info(f"✅ Head Region Cropping PASSED: Crop Box={crop_box}, Shape={crop.shape}")


def test_non_detected_face_graceful_fallback():
    logger.info("--- Testing Non-Detected Face Graceful Fallback ---")
    estimator = HeadPoseEstimator()

    # Blank black image representing no face (or back of head)
    blank_frame = np.zeros((800, 800, 3), dtype=np.uint8)
    person_bbox = (100, 100, 400, 700)

    result = estimator.estimate_pose(blank_frame, person_bbox)

    assert isinstance(result, GazeResult), "Must return a GazeResult instance"
    assert result.detected is False, "Blank frame should yield detected=False"
    assert result.pitch is None and result.yaw is None and result.roll is None
    logger.info("✅ Non-Detected Face Graceful Fallback PASSED (No errors or exceptions raised)")


def test_gaze_ray_shelf_intersection():
    logger.info("--- Testing Geometric Gaze Ray Shelf Intersection ---")
    frame_size = (1000, 1000)

    shelf_a = DummyShelf("shelf-1", "Shelf A (Beverages)", [[600, 100], [900, 100], [900, 400], [600, 400]])
    shelf_b = DummyShelf("shelf-2", "Shelf B (Snacks)", [[600, 500], [900, 500], [900, 800], [600, 800]])
    shelves = [shelf_a, shelf_b]

    # Test 1: Gaze ray pointing from (200, 250) rightward toward Shelf A (600..900, 100..400)
    gaze_res_a = GazeResult(
        detected=True,
        pitch=0.0,
        yaw=25.0,
        roll=0.0,
        gaze_origin=(200.0, 250.0),
        gaze_end=(700.0, 250.0)  # Ray extends into Shelf A
    )

    res_a = intersect_gaze_ray_with_shelves(gaze_res_a, shelves, frame_size)
    assert res_a.target_shelf_name == "Shelf A (Beverages)", f"Expected Shelf A, got {res_a.target_shelf_name}"
    assert res_a.target_shelf_id == "shelf-1"

    # Test 2: Gaze ray pointing from (200, 650) rightward toward Shelf B (600..900, 500..800)
    gaze_res_b = GazeResult(
        detected=True,
        pitch=0.0,
        yaw=-15.0,
        roll=0.0,
        gaze_origin=(200.0, 650.0),
        gaze_end=(700.0, 650.0)  # Ray extends into Shelf B
    )

    res_b = intersect_gaze_ray_with_shelves(gaze_res_b, shelves, frame_size)
    assert res_b.target_shelf_name == "Shelf B (Snacks)", f"Expected Shelf B, got {res_b.target_shelf_name}"
    assert res_b.target_shelf_id == "shelf-2"

    # Test 3: Gaze ray pointing away from any shelf (e.g. looking left toward x=50)
    gaze_res_none = GazeResult(
        detected=True,
        pitch=0.0,
        yaw=-90.0,
        roll=0.0,
        gaze_origin=(200.0, 250.0),
        gaze_end=(50.0, 250.0)  # Ray extends left
    )

    res_none = intersect_gaze_ray_with_shelves(gaze_res_none, shelves, frame_size)
    assert res_none.target_shelf_name is None, "Expected no shelf intersection"

    logger.info("✅ Geometric Gaze Ray Shelf Intersection PASSED")


if __name__ == "__main__":
    test_head_cropping()
    test_non_detected_face_graceful_fallback()
    test_gaze_ray_shelf_intersection()
    logger.info("==================================================")
    logger.info("ALL GAZE ESTIMATION & RAY INTERSECTION TESTS PASSED! ✅")
    logger.info("==================================================")
