import cv2

# Open webcam
camera = cv2.VideoCapture("store_video.mp4")

# Check if camera opened
if not camera.isOpened():
    print("Cannot access camera")
    exit()

while True:

    success, frame = camera.read()

    if not success:
        print("Cannot receive frame")
        break

    cv2.imshow(
        "Camera Test",
        frame
    )

    # Press q to exit
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break


camera.release()
cv2.destroyAllWindows()