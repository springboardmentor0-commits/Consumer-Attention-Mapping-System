# backend/app/services/camera.py
import cv2
import sys

def run_camera_verification(source=0):
 
    print("=========================================")
    print(f"  Starting Service: Camera Feed Test on source [{source}]")
    print("=========================================")

    # 1. Open the stream
    cap = cv2.VideoCapture(source)

    # 2. Safety Check
    if not cap.isOpened():
        print(f"SERVICE ERROR: Cannot open video source: {source}")
        return False

    print("SERVICE SUCCESS: Feed active! Click the popup window and press 'q' to close it.")

    # 3. Video Processing Loop
    while True:
        ret, frame = cap.read()
        
        if not ret:
            print("Stream ended or frame lost. Closing loop...")
            break
            
        # Display the frame in a popup window
        cv2.imshow("Task 5 - Services Camera Verification", frame)
        
        # Look for the 'q' key to quit
        if cv2.waitKey(1) & 0xFF == ord('q'):
            print("'q' key detected. Stopping stream...")
            break

    # 4. Cleanup
    cap.release()
    cv2.destroyAllWindows()
    print("=========================================")
    print("  Service Execution Complete!            ")
    print("=========================================")
    return True