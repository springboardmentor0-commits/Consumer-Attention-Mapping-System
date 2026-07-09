import time
import cv2
import numpy as np
from typing import Generator, Tuple, Union


def open_source(source: str) -> cv2.VideoCapture:
    """
    Opens a VideoCapture source.
    Supports: local webcam index (as digit string), RTSP URL, or local file path.
    """
    if source.isdigit():
        src: Union[int, str] = int(source)
    else:
        src = source

    cap = cv2.VideoCapture(src)
    if not cap.isOpened():
        raise RuntimeError(f"Failed to open video source: {source}")
    return cap


def read_frames(capture: cv2.VideoCapture) -> Generator[Tuple[np.ndarray, float, int], None, None]:
    """
    Generator that reads frames from a cv2.VideoCapture object.
    Yields: (frame, timestamp, frame_count)
    """
    frame_count = 0
    while True:
        ret, frame = capture.read()
        if not ret:
            break
        frame_count += 1
        timestamp = time.time()
        yield frame, timestamp, frame_count
