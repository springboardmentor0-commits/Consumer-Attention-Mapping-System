#!/usr/bin/env python3
import argparse
import sys
import os
import time

# Append the backend directory to sys.path to locate the 'app' module
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.services.video_capture import stream_frames
import cv2

def main():
    parser = argparse.ArgumentParser(description="Verify local video files or webcam feeds.")
    parser.add_argument(
        "--source",
        type=str,
        required=True,
        help="Path to local video file, RTSP URL, or webcam index (e.g. 0)"
    )
    parser.add_argument(
        "--width",
        type=int,
        default=640,
        help="Target resize width (default: 640)"
    )
    parser.add_argument(
        "--height",
        type=int,
        default=480,
        help="Target resize height (default: 480)"
    )
    parser.add_argument(
        "--headless",
        action="store_true",
        help="Run without displaying GUI windows (useful for headless testing)"
    )
    
    args = parser.parse_args()
    
    # Resolve webcam index if integer
    source = args.source
    if source.isdigit():
        source = int(source)
        
    print("====================================================")
    print(f"Starting Stream Verification for source: {source}")
    if not args.headless:
        print("Press 'q' in the window to safely stop the process.")
    print("====================================================")
    
    total_frames = 0
    start_time = time.time()
    last_resolution = (0, 0)
    
    try:
        for frame, count, timestamp in stream_frames(
            source=source,
            target_size=(args.width, args.height),
            log_every_n=30
        ):
            total_frames = count
            h, w = frame.shape[:2]
            last_resolution = (w, h)
            
            if not args.headless:
                # Display the video frames in GUI mode
                cv2.imshow("Stream Verification - Press 'q' to Quit", frame)
                if cv2.waitKey(1) & 0xFF == ord('q'):
                    print("\nUser quit verification.")
                    break
            else:
                # Small artificial delay to mimic FPS if processing local files too fast
                # (Optional, but helps simulate realistic processing speeds)
                pass
                
    except Exception as e:
        print(f"\nError running stream verification: {e}", file=sys.stderr)
    finally:
        end_time = time.time()
        cv2.destroyAllWindows()
        
        duration = end_time - start_time
        avg_fps = total_frames / duration if duration > 0 else 0
        
        print("\n================ Verification Summary ================")
        print(f"Total Frames Processed: {total_frames}")
        print(f"Total Time Taken:       {duration:.2f} seconds")
        print(f"Average Processing FPS: {avg_fps:.2f}")
        print(f"Frame Resolution:       {last_resolution[0]}x{last_resolution[1]}")
        print("======================================================")

if __name__ == "__main__":
    main()
