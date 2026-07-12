import cv2
import os
import time
import psutil


def start_video_stream(source):
    cap = cv2.VideoCapture(source)

    if not cap.isOpened():
        print(f"Could not open source: {source}")
        return

    frame_count = 0
    start_time = time.time()
    prev_time = start_time

    print("\nStreaming started...")
    print("Press 'q' to quit.\n")

    while True:
        success, frame = cap.read()

        if not success:
            print("\nVideo finished or stream ended.")
            break

        frame_count += 1

        # Resize every frame
        frame = cv2.resize(frame, (640, 480))

        current_time = time.time()

        elapsed = current_time - start_time

        fps = 1 / (current_time - prev_time) if current_time != prev_time else 0

        prev_time = current_time

        memory = psutil.Process(os.getpid()).memory_info().rss / (1024 * 1024)

        # Overlay information on frame
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

        # Log metadata in terminal
        print(
            f"Frame={frame_count} | "
            f"Timestamp={elapsed:.2f}s | "
            f"FPS={fps:.2f} | "
            f"Resolution={frame.shape[1]}x{frame.shape[0]} | "
            f"Memory={memory:.2f} MB"
        )

        cv2.imshow("Consumer Attention Mapping", frame)

        if cv2.waitKey(30) & 0xFF == ord("q"):
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