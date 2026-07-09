#!/usr/bin/env python3
import argparse
import sys
import os

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
    
    args = parser.parse_args()
    
    # Resolve webcam index if integer
    source = args.source
    if source.isdigit():
        source = int(source)
        
    print("====================================================")
    print(f"Starting Stream Verification for source: {source}")
    print("Press 'q' in the window to safely stop the process.")
    print("====================================================")
    
    try:
        for frame, count, timestamp in stream_frames(
            source=source,
            target_size=(args.width, args.height),
            log_every_n=30
        ):
            # Display the video frames
            cv2.imshow("Stream Verification - Press 'q' to Quit", frame)
            
            # Stop if the user presses 'q'
            if cv2.waitKey(1) & 0xFF == ord('q'):
                print("\nUser quit verification.")
                break
                
    except Exception as e:
        print(f"\nError running stream verification: {e}", file=sys.stderr)
    finally:
        cv2.destroyAllWindows()
        print("Stream verification finished.")

if __name__ == "__main__":
    main()
