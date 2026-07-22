import cv2

def estimate_gaze(head_crop):

    if head_crop is None:
        return "UNKNOWN"

    if head_crop.size == 0:
        return "UNKNOWN"

    height, width = head_crop.shape[:2]

    gray = cv2.cvtColor(head_crop, cv2.COLOR_BGR2GRAY)

    # Haar Cascade Face Detector
    face_detector = cv2.CascadeClassifier(
        cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
    )

    faces = face_detector.detectMultiScale(
        gray,
        scaleFactor=1.1,
        minNeighbors=5
    )

    direction = "UNKNOWN"

    for (x, y, w, h) in faces:

        # Draw face rectangle
        cv2.rectangle(
            head_crop,
            (x, y),
            (x + w, y + h),
            (0, 255, 0),
            2
        )

        face_center = x + w // 2

        # Draw center line
        cv2.line(
            head_crop,
            (width // 2, 0),
            (width // 2, height),
            (255, 0, 0),
            2
        )

        if face_center < width * 0.40:
            direction = "LEFT"

        elif face_center > width * 0.60:
            direction = "RIGHT"

        else:
            direction = "CENTER"

        cv2.putText(
            head_crop,
            direction,
            (10, 30),
            cv2.FONT_HERSHEY_SIMPLEX,
            1,
            (0, 255, 255),
            2
        )

        break

    cv2.imshow("Head Analysis", head_crop)

    return direction