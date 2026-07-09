import time
import logging
from datetime import datetime
import cv2
import numpy as np
from typing import Union, Tuple, Generator, Optional

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

def open_capture_with_retry(
    source: Union[int, str],
    max_retries: int = 3,
    backoff: float = 2.0
) -> cv2.VideoCapture:
    """
    Attempts to open a VideoCapture source with exponential backoff retries.
    """
    # Convert numeric strings (e.g., "0") to integer webcam indexes
    if isinstance(source, str) and source.isdigit():
        source = int(source)

    attempts = 0
    while attempts < max_retries:
        logger.info(f"Opening video source: {source} (Attempt {attempts + 1}/{max_retries})")
        cap = cv2.VideoCapture(source)
        if cap.isOpened():
            logger.info("Successfully opened video source.")
            return cap
        
        cap.release()
        attempts += 1
        if attempts < max_retries:
            sleep_time = backoff ** attempts
            logger.warning(f"Failed to open source. Retrying in {sleep_time:.1f} seconds...")
            time.sleep(sleep_time)
            
    raise RuntimeError(f"Failed to open video source {source} after {max_retries} attempts.")

def stream_frames(
    source: Union[int, str],
    target_size: Optional[Tuple[int, int]] = (640, 480),
    log_every_n: int = 30,
    max_retries: int = 3,
    backoff: float = 2.0
) -> Generator[Tuple[np.ndarray, int, float], None, None]:
    """
    Generator that yields frames from a video source.
    Handles resizing, console logging, and dropped stream reconnection.
    Yields: (frame, frame_count, timestamp)
    """
    cap = None
    frame_count = 0
    
    try:
        cap = open_capture_with_retry(source, max_retries, backoff)
        
        while True:
            ret, frame = cap.read()
            
            if not ret:
                import os
                # If source is a local file, stop streaming when it ends
                if isinstance(source, str) and os.path.exists(source):
                    logger.info("Video file source ended cleanly.")
                    break
                
                logger.warning("Frame read returned False. Stream dropped or video ended. Reconnecting...")
                cap.release()
                try:
                    cap = open_capture_with_retry(source, max_retries, backoff)
                    continue
                except RuntimeError as e:
                    logger.error(f"Stream reconnection failed: {e}")
                    break
            
            frame_count += 1
            
            # Resize if a target size is set
            if target_size:
                frame = cv2.resize(frame, target_size)
                
            timestamp = time.time()
            
            # Log metadata to console every N frames
            if frame_count % log_every_n == 0:
                h, w = frame.shape[:2]
                ts_str = datetime.fromtimestamp(timestamp).strftime('%Y-%m-%d %H:%M:%S.%f')[:-3]
                logger.info(
                    f"[Stream Log] Frame: {frame_count} | Time: {ts_str} | Resolution: {w}x{h}"
                )
                
            yield frame, frame_count, timestamp
            
    except KeyboardInterrupt:
        logger.info("Keyboard interrupt received. Stopping stream.")
    finally:
        if cap:
            cap.release()
        cv2.destroyAllWindows()
        logger.info("Closed VideoCapture stream and destroyed windows cleanly.")
