import sys
import os
import time
import cv2
import numpy as np

# Load YOLO - try ultralytics package directly first
try:
    from ultralytics import YOLO
    print("[CheeckYOLO] Loaded Ultralytics YOLO package.")
except ImportError:
    try:
        PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
        ULTRALYTICS_PATH = r"C:\Users\rishi\Downloads\ultralytics-main\ultralytics-main"
        if os.path.exists(ULTRALYTICS_PATH) and ULTRALYTICS_PATH not in sys.path:
            sys.path.insert(0, ULTRALYTICS_PATH)
        from ultralytics import YOLO
        print("[CheeckYOLO] Loaded YOLO from local ultralytics path.")
    except ImportError as ie:
        print(f"[CheeckYOLO] Error loading YOLO: {ie}")
        sys.exit(1)


# ── Drawing constants ──
FONT = cv2.FONT_HERSHEY_SIMPLEX
FONT_SCALE_TINY = 0.32
FONT_SCALE_SMALL = 0.35
FONT_THICKNESS = 1
BOX_THICKNESS = 1
COLUMN_WIDTH = 155  # width per grid column
HEADER_HEIGHT = 90  # space for header + stats


def draw_thin_box(frame, person_id, x1, y1, x2, y2):
    """Draw a thin green bounding box with a small ID tag on the video frame."""
    color = (0, 230, 0)
    # Thin bounding box
    cv2.rectangle(frame, (x1, y1), (x2, y2), color, BOX_THICKNESS)

    # Tiny ID label at top-left corner
    label = f"#{person_id}"
    (tw, th), _ = cv2.getTextSize(label, FONT, FONT_SCALE_TINY, FONT_THICKNESS)
    cv2.rectangle(frame, (x1, max(0, y1 - th - 4)), (x1 + tw + 4, y1), color, -1)
    cv2.putText(frame, label, (x1 + 2, max(th + 2, y1 - 2)),
                FONT, FONT_SCALE_TINY, (0, 0, 0), FONT_THICKNESS, cv2.LINE_AA)


def build_side_panel(height, detections, fps, frame_count, total_persons, video_name):
    """Build a dark side panel with detection details in a multi-column grid."""
    line_h = 13
    card_h = 5 * line_h + 8  # height per person card (header + 4 detail lines + padding)

    # Calculate how many rows fit in available space
    available_h = height - HEADER_HEIGHT - 20
    rows_per_col = max(1, available_h // card_h)

    # Calculate columns needed
    n = len(detections)
    num_cols = max(1, (n + rows_per_col - 1) // rows_per_col) if n > 0 else 1
    panel_w = max(COLUMN_WIDTH, num_cols * COLUMN_WIDTH)

    panel = np.zeros((height, panel_w, 3), dtype=np.uint8)
    panel[:] = (25, 25, 25)

    # ── Header ──
    cv2.rectangle(panel, (0, 0), (panel_w, 24), (40, 40, 40), -1)
    cv2.putText(panel, "DETECTION DETAILS", (6, 16),
                FONT, FONT_SCALE_SMALL, (0, 220, 220), FONT_THICKNESS, cv2.LINE_AA)

    # ── Stats row ──
    y_stats = 34
    stats = [
        f"File: {os.path.basename(video_name) if video_name else 'N/A'}",
        f"FPS: {fps:.1f} | Frame: {frame_count}",
        f"Persons: {n} | Total: {total_persons}",
    ]
    for s in stats:
        cv2.putText(panel, s, (6, y_stats),
                    FONT, FONT_SCALE_TINY, (150, 150, 150), FONT_THICKNESS, cv2.LINE_AA)
        y_stats += line_h

    # ── Separator ──
    sep_y = HEADER_HEIGHT - 6
    cv2.line(panel, (6, sep_y), (panel_w - 6, sep_y), (55, 55, 55), 1)

    # ── Grid of person cards ──
    for idx, (pid, conf, x1, y1b, x2, y2b) in enumerate(detections):
        col = idx // rows_per_col
        row = idx % rows_per_col

        cx = col * COLUMN_WIDTH + 4
        cy = HEADER_HEIGHT + row * card_h

        box_w = x2 - x1
        box_h = y2b - y1b
        center_x = (x1 + x2) // 2
        center_y = (y1b + y2b) // 2

        # Card background
        cv2.rectangle(panel, (cx, cy), (cx + COLUMN_WIDTH - 8, cy + card_h - 4),
                      (35, 35, 35), -1)
        cv2.rectangle(panel, (cx, cy), (cx + COLUMN_WIDTH - 8, cy + card_h - 4),
                      (55, 55, 55), 1)

        # Person header
        cv2.circle(panel, (cx + 6, cy + 10), 3, (0, 230, 0), -1)
        cv2.putText(panel, f"#{pid} {conf*100:.0f}%", (cx + 14, cy + 13),
                    FONT, FONT_SCALE_TINY, (0, 200, 255), FONT_THICKNESS, cv2.LINE_AA)

        # Detail lines
        lines = [
            f"Sz:{box_w}x{box_h}",
            f"Ct:({center_x},{center_y})",
            f"TL:({x1},{y1b})",
            f"BR:({x2},{y2b})",
        ]
        for i, line in enumerate(lines):
            cv2.putText(panel, line, (cx + 6, cy + 13 + (i + 1) * line_h),
                        FONT, FONT_SCALE_TINY, (180, 180, 180), FONT_THICKNESS, cv2.LINE_AA)

    # If no detections
    if not detections:
        cv2.putText(panel, "No persons detected", (6, HEADER_HEIGHT + 14),
                    FONT, FONT_SCALE_TINY, (100, 100, 100), FONT_THICKNESS, cv2.LINE_AA)

    # ── Controls at bottom ──
    ctrl_y = height - 12
    cv2.line(panel, (6, ctrl_y - 8), (panel_w - 6, ctrl_y - 8), (55, 55, 55), 1)
    cv2.putText(panel, "Q:Quit P:Pause S:Save", (6, ctrl_y),
                FONT, FONT_SCALE_TINY, (110, 110, 110), FONT_THICKNESS, cv2.LINE_AA)

    return panel, panel_w


def main():
    print("=" * 60)
    print("   CheeckYOLO - Human Detection with Detailed Info View   ")
    print("=" * 60)

    # --- Get video file path from terminal ---
    video_path = input("\nPaste Video File Path: ").strip()

    # Remove surrounding quotes (from drag-and-drop)
    if (video_path.startswith('"') and video_path.endswith('"')) or \
       (video_path.startswith("'") and video_path.endswith("'")):
        video_path = video_path[1:-1]

    if not video_path:
        print("[CheeckYOLO] No file selected. Exiting.")
        return

    if not os.path.exists(video_path):
        print(f"[ERROR] File does not exist: {video_path}")
        return

    print(f"[CheeckYOLO] Selected video: {video_path}")

    # --- Load YOLO Model ---
    model_name = "yolov8n.pt"
    print(f"\n[CheeckYOLO] Initializing YOLO model ({model_name})...")
    model = YOLO(model_name)

    print(f"[CheeckYOLO] Opening video: {video_path}")
    cap = cv2.VideoCapture(video_path)

    if not cap.isOpened():
        print(f"[ERROR] Could not open video: {video_path}")
        return

    frame_count = 0
    total_person_detections = 0
    start_time = time.time()
    fps = 0.0
    paused = False

    # Get video properties
    vid_fps = cap.get(cv2.CAP_PROP_FPS) or 30
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    vid_width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    vid_height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    wait_delay = max(1, int(1000 / vid_fps))

    print(f"\n[INFO] Video: {vid_width}x{vid_height} @ {vid_fps:.1f} FPS, {total_frames} frames")
    print("[INFO] Press 'Q' or ESC to quit | 'P' to pause | 'S' to save screenshot\n")

    window_name = "CheeckYOLO - Human Detection"
    cv2.namedWindow(window_name, cv2.WINDOW_NORMAL)
    cv2.resizeWindow(window_name, min(vid_width + COLUMN_WIDTH, 1400), min(vid_height, 720))

    # Process YOLO every N frames to keep video smooth on CPU
    DETECT_EVERY_N = 3
    last_detections = []  # [(person_id, conf, x1, y1, x2, y2), ...]

    while cap.isOpened():
        if not paused:
            t_frame_start = time.time()
            ret, frame = cap.read()
            if not ret:
                print("[CheeckYOLO] Reached end of video.")
                break

            frame_count += 1

            # --- Run YOLO inference every N frames ---
            if frame_count % DETECT_EVERY_N == 1 or DETECT_EVERY_N == 1:
                results = model.predict(source=frame, conf=0.3, verbose=False)
                last_detections = []
                pid = 0

                for r in results:
                    boxes = r.boxes
                    for box in boxes:
                        cls_id = int(box.cls[0].item())
                        class_name = model.names.get(cls_id, str(cls_id))

                        if class_name != "person":
                            continue

                        conf = float(box.conf[0].item())
                        x1, y1, x2, y2 = map(int, box.xyxy[0].tolist())
                        pid += 1
                        last_detections.append((pid, conf, x1, y1, x2, y2))

            # --- Draw thin boxes on the video frame ---
            for (pid, conf, x1, y1, x2, y2) in last_detections:
                total_person_detections += 1
                draw_thin_box(frame, pid, x1, y1, x2, y2)

            # --- Calculate FPS ---
            t_frame_end = time.time()
            frame_time = t_frame_end - t_frame_start
            if frame_time > 0:
                instant_fps = 1.0 / frame_time
                fps = 0.9 * fps + 0.1 * instant_fps if fps > 0 else instant_fps

            # --- Build side panel with all details ---
            side_panel, panel_w = build_side_panel(
                vid_height, last_detections, fps, frame_count,
                total_person_detections, video_path
            )

            # --- Combine video + side panel into one canvas ---
            canvas = np.hstack((frame, side_panel))

            cv2.imshow(window_name, canvas)

        # --- Key press handler ---
        key = cv2.waitKey(wait_delay) & 0xFF
        if key == ord('q') or key == 27:
            print("\n[CheeckYOLO] User stopped playback.")
            break
        elif key == ord('p'):
            paused = not paused
            state = "PAUSED" if paused else "RESUMED"
            print(f"[CheeckYOLO] Playback {state}")
        elif key == ord('s'):
            screenshot_name = f"screenshot_frame_{frame_count}.png"
            cv2.imwrite(screenshot_name, canvas)
            print(f"[CheeckYOLO] Screenshot saved: {screenshot_name}")

    cap.release()
    cv2.destroyAllWindows()

    total_time = time.time() - start_time
    avg_fps = frame_count / total_time if total_time > 0 else 0

    print("\n" + "=" * 60)
    print("              HUMAN DETECTION SUMMARY                  ")
    print("=" * 60)
    print(f"  Video File            : {os.path.basename(video_path)}")
    print(f"  Resolution            : {vid_width}x{vid_height}")
    print(f"  Total Frames Processed: {frame_count} / {total_frames}")
    print(f"  Total Humans Detected : {total_person_detections}")
    print(f"  Total Time Elapsed    : {total_time:.2f} seconds")
    print(f"  Average FPS           : {avg_fps:.1f}")
    print("=" * 60)


if __name__ == "__main__":
    main()
