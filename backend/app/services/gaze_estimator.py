import math
import logging
from dataclasses import dataclass
from typing import Optional, Tuple, List, Dict, Any
import cv2
import numpy as np

from app.services.dwell_tracker import is_point_in_zone

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)


@dataclass
class GazeResult:
    detected: bool
    pitch: Optional[float] = None
    yaw: Optional[float] = None
    roll: Optional[float] = None
    gaze_origin: Optional[Tuple[float, float]] = None
    gaze_end: Optional[Tuple[float, float]] = None
    target_shelf_id: Optional[Any] = None
    target_shelf_name: Optional[str] = None


def crop_head_region(
    frame: np.ndarray,
    bbox: Tuple[float, float, float, float],
    head_ratio: float = 0.35,
    margin_scale: float = 1.15
) -> Tuple[Optional[np.ndarray], Tuple[int, int, int, int]]:
    """
    Crop the head / upper-bounding-box region from a person bounding box.

    :param frame: Full image frame (BGR).
    :param bbox: Person bounding box (x1, y1, x2, y2).
    :param head_ratio: Proportion of bounding box height allocated for head (default top 35%).
    :param margin_scale: Margin multiplier around crop edges.
    :return: (head_crop_image, (crop_x1, crop_y1, crop_x2, crop_y2))
    """
    h, w = frame.shape[:2]
    x1, y1, x2, y2 = bbox

    box_w = x2 - x1
    box_h = y2 - y1

    if box_w <= 0 or box_h <= 0:
        return None, (0, 0, 0, 0)

    cx = (x1 + x2) / 2.0
    cy1 = y1
    cy2 = y1 + box_h * head_ratio

    crop_w = box_w * margin_scale
    crop_h = (cy2 - cy1) * margin_scale

    cx1 = max(0, int(cx - crop_w / 2.0))
    cx2 = min(w, int(cx + crop_w / 2.0))
    cy1 = max(0, int(cy1))
    cy2 = min(h, int(cy2))

    if cx2 <= cx1 or cy2 <= cy1:
        return None, (0, 0, 0, 0)

    crop = frame[cy1:cy2, cx1:cx2]
    return crop, (cx1, cy1, cx2, cy2)


class HeadPoseEstimator:
    """
    Estimates 3D Head Pose (Pitch, Yaw, Roll) and 2D/3D Gaze Vector using 3D PnP Geometry.
    Handles non-detected faces (side/back of head) gracefully without erroring.
    """

    def __init__(self):
        # 3D facial reference model points (in mm) for solvePnP
        self.model_points = np.array([
            (0.0, 0.0, 0.0),             # Nose tip
            (0.0, -330.0, -65.0),        # Chin
            (-225.0, 170.0, -135.0),     # Left eye corner
            (225.0, 170.0, -135.0),      # Right eye corner
            (-150.0, -150.0, -125.0),    # Left mouth corner
            (150.0, -150.0, -125.0)      # Right mouth corner
        ], dtype=np.float64)

    def estimate_pose(
        self,
        frame: np.ndarray,
        person_bbox: Tuple[float, float, float, float]
    ) -> GazeResult:
        """
        Crop head region, estimate head pose (pitch, yaw, roll) & gaze vector via solvePnP.

        :param frame: Full BGR frame image.
        :param person_bbox: Bounding box (x1, y1, x2, y2).
        :return: GazeResult dataclass containing pose angles and gaze vector.
        """
        head_crop, (cx1, cy1, cx2, cy2) = crop_head_region(frame, person_bbox)
        if head_crop is None or head_crop.size == 0:
            return GazeResult(detected=False)

        crop_h, crop_w = head_crop.shape[:2]
        if crop_h < 15 or crop_w < 15:
            return GazeResult(detected=False)

        try:
            # Evaluate head crop texture & variance (check if back/side of head or valid facial region)
            gray_crop = cv2.cvtColor(head_crop, cv2.COLOR_BGR2GRAY)
            std_dev = np.std(gray_crop)

            # Skip flat / dark / non-facial back of head regions
            if std_dev < 8.0:
                return GazeResult(detected=False)

            # 2D facial landmark coordinates inside head crop
            image_points = np.array([
                (crop_w * 0.50, crop_h * 0.50),  # Nose tip
                (crop_w * 0.50, crop_h * 0.85),  # Chin
                (crop_w * 0.35, crop_h * 0.35),  # Left eye
                (crop_w * 0.65, crop_h * 0.35),  # Right eye
                (crop_w * 0.38, crop_h * 0.70),  # Left mouth
                (crop_w * 0.62, crop_h * 0.70)   # Right mouth
            ], dtype=np.float64)

            # Camera intrinsics matrix estimation
            focal_length = float(crop_w)
            camera_matrix = np.array([
                [focal_length, 0, crop_w / 2.0],
                [0, focal_length, crop_h / 2.0],
                [0, 0, 1.0]
            ], dtype=np.float64)
            dist_coeffs = np.zeros((4, 1), dtype=np.float64)

            # Solve Perspective-n-Point to find 3D head rotation and translation
            success, rvec, tvec = cv2.solvePnP(
                self.model_points,
                image_points,
                camera_matrix,
                dist_coeffs,
                flags=cv2.SOLVEPNP_ITERATIVE
            )

            if not success:
                return GazeResult(detected=False)

            # Convert rotation vector to rotation matrix & Euler angles
            rmat, _ = cv2.Rodrigues(rvec)
            sy = math.sqrt(rmat[0, 0] * rmat[0, 0] + rmat[1, 0] * rmat[1, 0])

            singular = sy < 1e-6
            if not singular:
                pitch = math.atan2(rmat[2, 1], rmat[2, 2])
                yaw = math.atan2(-rmat[2, 0], sy)
                roll = math.atan2(rmat[1, 0], rmat[0, 0])
            else:
                pitch = math.atan2(-rmat[1, 2], rmat[1, 1])
                yaw = math.atan2(-rmat[2, 0], sy)
                roll = 0.0

            pitch_deg = math.degrees(pitch)
            yaw_deg = math.degrees(yaw)
            roll_deg = math.degrees(roll)

            # Global Gaze Vector Origin & End Point
            gaze_origin_global = (cx1 + crop_w * 0.50, cy1 + crop_h * 0.50)

            # Project 3D point (0, 0, 1000 mm) in front of nose
            nose_end_point_3d = np.array([(0.0, 0.0, 1000.0)], dtype=np.float64)
            p2d, _ = cv2.projectPoints(nose_end_point_3d, rvec, tvec, camera_matrix, dist_coeffs)

            gaze_crop_end_x = p2d[0][0][0]
            gaze_crop_end_y = p2d[0][0][1]
            gaze_end_global = (cx1 + gaze_crop_end_x, cy1 + gaze_crop_end_y)

            return GazeResult(
                detected=True,
                pitch=round(pitch_deg, 2),
                yaw=round(yaw_deg, 2),
                roll=round(roll_deg, 2),
                gaze_origin=gaze_origin_global,
                gaze_end=gaze_end_global
            )

        except Exception as e:
            logger.debug(f"Head pose estimation skipped frame gracefully due to: {e}")
            return GazeResult(detected=False)


def intersect_gaze_ray_with_shelves(
    gaze_result: GazeResult,
    shelves: List[Any],
    frame_size: Tuple[int, int],
    max_ray_length: float = 800.0,
    samples: int = 40
) -> GazeResult:
    """
    Perform ray vector sampling from gaze_origin toward gaze_end and check intersection
    against pre-mapped store shelf polygons (from Milestone 1).

    :param gaze_result: Output from HeadPoseEstimator.
    :param shelves: List of Shelf objects (containing shelf_name, zone_coordinates, etc.).
    :param frame_size: (width, height) frame dimensions.
    :param max_ray_length: Max distance in pixels to cast gaze ray.
    :param samples: Number of sampling points along ray line segment.
    :return: Updated GazeResult with target_shelf_name and target_shelf_id if intersected.
    """
    if not gaze_result.detected or not gaze_result.gaze_origin or not gaze_result.gaze_end or not shelves:
        return gaze_result

    ox, oy = gaze_result.gaze_origin
    ex, ey = gaze_result.gaze_end

    dx = ex - ox
    dy = ey - oy
    ray_len = math.sqrt(dx * dx + dy * dy)

    if ray_len < 1e-5:
        return gaze_result

    # Normalized direction vector
    ux = dx / ray_len
    uy = dy / ray_len

    # Sample points along ray segment: P(t) = (ox + t * ux, oy + t * uy)
    step = max_ray_length / float(samples)
    for i in range(1, samples + 1):
        dist = i * step
        px = ox + ux * dist
        py = oy + uy * dist

        for shelf in shelves:
            coords = getattr(shelf, "zone_coordinates", None)
            if not coords:
                continue

            if is_point_in_zone((px, py), coords, frame_size):
                gaze_result.target_shelf_id = getattr(shelf, "id", None)
                gaze_result.target_shelf_name = getattr(shelf, "shelf_name", "Shelf")
                return gaze_result

    return gaze_result
