import cv2
from datetime import datetime
cap = cv2.VideoCapture(0)
frame_count = 0

if not cap.isOpened():
    print("Could not open camera.")
    exit()

while True:
    ret, frame = cap.read()

    frame_count += 1

    timestamp = datetime.now().strftime("%H:%M:%S")

    print(f"Frame: {frame_count} | Time: {timestamp}")

    if not ret:
        print("Failed to read frame.")
        break

    cv2.imshow("Retail Camera Feed", frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()