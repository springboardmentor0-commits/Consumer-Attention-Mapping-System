#!/usr/bin/env python3
"""
Shopper Tracking CLI script using YOLOv8 & ByteTrack (Supervision).
Reads a video file or webcam stream, detects persons (class 0), assigns persistent IDs across frames,
maintains IDs through brief occlusions, and renders live overlaid bounding boxes + persistent IDs.
"""

import sys
import os
import time
import argparse
import logging
import cv2

# Add backend directory to python path if executing standalone
script_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(script_dir)
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.services.person_tracker import PersonTracker

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("track_shoppers")


def parse_args():
    parser = argparse.ArgumentParser(
        description="YOLOv8 + ByteTrack Shopper Tracking with Occlusion Resilience"
    )
    parser.add_argument(
        "-s", "--source",
        type=str,
        default="0",
        help="Path to input video file or webcam index (e.g. '0' or 'video.mp4'). Default: '0'"
    )
    parser.add_argument(
        "-w", "--weights",
        type=str,
        default="yolov8n.pt",
        help="Path or name of YOLOv8 model weights (e.g. 'yolov8n.pt', 'yolov8s.pt'). Default: 'yolov8n.pt'"
    )
    parser.add_argument(
        "-c", "--conf",
        type=float,
        default=0.3,
        help="Confidence threshold for person detection. Default: 0.3"
    )
    parser.add_argument(
        "-b", "--track-buffer",
        type=int,
        default=60,
        help="Frames to retain lost tracks for occlusion persistence (e.g. 60 frames ~ 2s). Default: 60"
    )
    parser.add_argument(
        "-o", "--output",
        type=str,
        default=None,
        help="Path to save annotated output video file (e.g. 'output.mp4'). Optional."
    )
    parser.add_argument(
        "--no-show",
        action="store_true",
        help="Disable interactive cv2.imshow window (headless mode)."
    )
    parser.add_argument(
        "--device",
        type=str,
        default="",
        help="Hardware device ('cpu', 'cuda', 'mps'). Default: auto"
    )
    return parser.parse_args()


def main():
    args = parse_args()

    # Format numeric source strings like "0" into integers for OpenCV VideoCapture
    source = args.source
    if isinstance(source, str) and source.isdigit():
        source = int(source)

    logger.info(f"Starting Shopper Tracker with source: {source}")
    logger.info(f"Model weights: {args.weights} | Conf: {args.conf} | Lost Track Buffer: {args.track_buffer} frames")

    # Initialize video capture
    cap = cv2.VideoCapture(source)
    if not cap.isOpened():
        logger.error(f"Failed to open video source: {source}")
        sys.exit(1)

    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)) or 1280
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT)) or 720
    fps = cap.get(cv2.CAP_PROP_FPS) or 30.0

    logger.info(f"Video stream opened. Resolution: {width}x{height} @ {fps:.1f} FPS")

    # Initialize VideoWriter if output path provided
    writer = None
    if args.output:
        os.makedirs(os.path.dirname(os.path.abspath(args.output)), exist_ok=True)
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        writer = cv2.VideoWriter(args.output, fourcc, fps, (width, height))
        logger.info(f"Recording output to: {args.output}")

    # Initialize PersonTracker
    tracker = PersonTracker(
        model_weights=args.weights,
        conf_threshold=args.conf,
        track_buffer=args.track_buffer,
        frame_rate=int(fps),
        device=args.device
    )

    frame_count = 0
    start_time = time.time()

    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                logger.info("End of video stream or failed to fetch frame.")
                break

            frame_count += 1

            # Process frame through YOLOv8 + ByteTrack
            annotated_frame, detections = tracker.process_frame(frame, draw_annotations=True)

            # Overlay HUD statistics banner
            stats = tracker.get_stats()
            hud_text = f"Frame: {frame_count} | Active Shoppers: {stats['currently_tracked_shoppers']} | Total Unique: {stats['total_unique_shoppers_seen']}"
            cv2.putText(
                annotated_frame,
                hud_text,
                (15, 35),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.7,
                (0, 255, 255),
                2,
                cv2.LINE_AA
            )

            # Write output video frame if enabled
            if writer:
                writer.write(annotated_frame)

            # Display interactive output window unless --no-show is specified
            if not args.no-show:
                cv2.imshow("Shopper Tracker - YOLOv8 + ByteTrack", annotated_frame)
                # Press 'q' or ESC to exit cleanly
                key = cv2.waitKey(1) & 0xFF
                if key == ord('q') or key == 27:
                    logger.info("User interrupted stream processing ('q'/ESC pressed).")
                    break

            if frame_count % 30 == 0:
                elapsed = time.time() - start_time
                current_fps = frame_count / elapsed if elapsed > 0 else 0
                logger.info(
                    f"Processed {frame_count} frames | FPS: {current_fps:.1f} | Active Shoppers: {stats['currently_tracked_shoppers']} | Total Unique: {stats['total_unique_shoppers_seen']}"
                )

    except KeyboardInterrupt:
        logger.info("Keyboard interrupt received. Stopping tracker.")
    finally:
        cap.release()
        if writer:
            writer.release()
        cv2.destroyAllWindows()
        logger.info("Cleaned up resources and destroyed windows.")

    total_time = time.time() - start_time
    avg_fps = frame_count / total_time if total_time > 0 else 0
    final_stats = tracker.get_stats()
    logger.info("=" * 60)
    logger.info("TRACKER SUMMARY:")
    logger.info(f"Total Frames Processed: {frame_count}")
    logger.info(f"Average FPS: {avg_fps:.1f}")
    logger.info(f"Total Unique Shoppers Tracked: {final_stats['total_unique_shoppers_seen']}")
    logger.info("=" * 60)


if __name__ == "__main__":
    main()
