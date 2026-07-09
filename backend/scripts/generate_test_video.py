#!/usr/bin/env python3
import cv2
import numpy as np
import os

def generate_video(output_path, num_frames=310, width=640, height=480, fps=30):
    # Ensure directory exists
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    # Define codec and create VideoWriter
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
    
    for frame_idx in range(num_frames):
        # Create a gray background frame
        frame = np.ones((height, width, 3), dtype=np.uint8) * 40
        
        # Draw a moving circle (simulating a consumer)
        center_x = int((frame_idx * 3) % width)
        center_y = int(height / 2 + 80 * np.sin(frame_idx * 0.05))
        cv2.circle(frame, (center_x, center_y), 35, (0, 180, 255), -1)
        
        # Draw a static rectangle representing a shelf
        cv2.rectangle(frame, (100, 300), (540, 350), (100, 100, 100), -1)
        cv2.putText(
            frame,
            "SHELF A",
            (280, 335),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.6,
            (255, 255, 255),
            1
        )
        
        # Add frame index text
        cv2.putText(
            frame,
            f"Frame: {frame_idx}",
            (20, 40),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.7,
            (200, 200, 200),
            2
        )
        
        out.write(frame)
        
    out.release()
    print(f"Generated test video with {num_frames} frames at: {output_path}")

if __name__ == "__main__":
    script_dir = os.path.dirname(os.path.abspath(__file__))
    target_path = os.path.abspath(os.path.join(script_dir, "../../data/sample_retail.mp4"))
    generate_video(target_path)
