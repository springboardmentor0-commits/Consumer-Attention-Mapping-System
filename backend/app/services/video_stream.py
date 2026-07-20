import cv2
import os
import time
import psutil

from app.services.vision.tracker import PersonTracker
from app.services.vision.dwell import DwellTimeTracker
from app.services.vision.shelf_mapper import ShelfMapper


def start_video_stream(source):

    cap = cv2.VideoCapture(source)

    tracker = PersonTracker()
    dwell_tracker = DwellTimeTracker()

    shelf_mapper = None

    if not cap.isOpened():
        print(f"Could not open source: {source}")
        return

    frame_count = 0
    start_time = time.time()
    prev_frame_time = start_time

    # Print terminal logs only once every second
    last_log_time = start_time

    print("\nStreaming started...")
    print("Press 'q' to quit.\n")

    while True:

        success, frame = cap.read()

        if not success:
            print("\nVideo finished or stream ended.")
            break

        if shelf_mapper is None:
            height, width = frame.shape[:2]

            shelf_mapper = ShelfMapper(
                frame_width=width,
                frame_height=height
            )

            print(f"\nFrame Resolution: {width} x {height}")

        frame_count += 1

        # --------------------------------------------------
        # Tracking
        # --------------------------------------------------

        results = tracker.track(frame)

        tracked_ids = []

        for result in results:

            if result.boxes is None:
                continue

            for box in result.boxes:

                x1, y1, x2, y2 = map(int, box.xyxy[0])

                confidence = float(box.conf[0])

                if box.id is not None:
                    person_id = int(box.id[0])
                    tracked_ids.append(person_id)
                else:
                    person_id = -1

                cv2.rectangle(
                    frame,
                    (x1, y1),
                    (x2, y2),
                    (0, 255, 0),
                    2,
                )

                cv2.putText(
                    frame,
                    f"ID {person_id} ({confidence:.2f})",
                    (x1, y1 - 10),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.6,
                    (0, 255, 0),
                    2,
                )

        # --------------------------------------------------
        # Dwell Time
        # --------------------------------------------------

        completed_sessions = dwell_tracker.update(tracked_ids)

        if completed_sessions:

            print("\n" + "=" * 60)

            for session in completed_sessions:

                print(
                    f"Shopper {session['person_id']} stayed "
                    f"{session['dwell_time']} seconds."
                )

            print("=" * 60 + "\n")

        # --------------------------------------------------
        # Metrics
        # --------------------------------------------------

        current_time = time.time()

        elapsed = current_time - start_time

        fps = (
            1 / (current_time - prev_frame_time)
            if current_time != prev_frame_time
            else 0
        )

        prev_frame_time = current_time

        memory = (
            psutil.Process(os.getpid()).memory_info().rss
            / (1024 * 1024)
        )

        # --------------------------------------------------
        # Shelf Regions
        # --------------------------------------------------

        for shelf_name, (x1, y1, x2, y2) in shelf_mapper.get_regions().items():

            cv2.rectangle(
                frame,
                (x1, y1),
                (x2, y2),
                (255, 0, 0),
                2
            )

            cv2.putText(
                frame,
                shelf_name,
                (x1 + 10, 30),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.8,
                (255, 0, 0),
                2
            )

        # --------------------------------------------------
        # Overlay
        # --------------------------------------------------

        cv2.putText(
            frame,
            f"Frame: {frame_count}",
            (10, 30),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.8,
            (0, 255, 0),
            2,
        )

        cv2.putText(
            frame,
            f"FPS: {fps:.2f}",
            (10, 65),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.8,
            (255, 255, 0),
            2,
        )

        cv2.putText(
            frame,
            f"Time: {elapsed:.2f}s",
            (10, 100),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.8,
            (0, 165, 255),
            2,
        )

        # --------------------------------------------------
        # Terminal Logs (Once Per Second)
        # --------------------------------------------------

        if current_time - last_log_time >= 1:

            print(
                f"Frame={frame_count} | "
                f"FPS={fps:.2f} | "
                f"People={len(tracked_ids)} | "
                f"Memory={memory:.2f} MB"
            )

            last_log_time = current_time

        
        display_frame = cv2.resize(frame, (960, 540))
        cv2.imshow("Consumer Attention Mapping", display_frame)

        if cv2.waitKey(1) & 0xFF == ord("q"):
            print("\nStopped by user.")
            break

    cap.release()
    cv2.destroyAllWindows()

    print("\nResources released successfully.")
    print("Video stream closed.")


if __name__ == "__main__":

    print("\n========= Consumer Attention Mapping =========")
    print("Choose Input Source:")
    print("1. Local Video File")
    print("2. Webcam")
    print("3. RTSP Stream")

    choice = input("\nEnter choice (1/2/3): ").strip()

    if choice == "1":

        video_path = input("\nEnter video path: ").strip().strip('"')

        if not os.path.exists(video_path):
            print("\nFile not found!")
        else:
            start_video_stream(video_path)

    elif choice == "2":

        print("\nOpening webcam...")
        start_video_stream(0)

    elif choice == "3":

        rtsp_url = input("\nEnter RTSP URL: ").strip()
        start_video_stream(rtsp_url)

    else:
        print("\nInvalid choice.")