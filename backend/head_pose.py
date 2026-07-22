import cv2
import mediapipe as mp

mp_face_mesh = mp.solutions.face_mesh

face_mesh = mp_face_mesh.FaceMesh(

    static_image_mode=False,

    max_num_faces=1,

    refine_landmarks=True,

    min_detection_confidence=0.5,

    min_tracking_confidence=0.5

)

cap = cv2.VideoCapture("store_video.mp4")

if not cap.isOpened():

    print("Cannot open video")

    exit()

while True:

    ret, frame = cap.read()

    if not ret:

        break

    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

    results = face_mesh.process(rgb)

    if results.multi_face_landmarks:

        for face_landmarks in results.multi_face_landmarks:

            h, w, _ = frame.shape

            nose = face_landmarks.landmark[1]

            x = int(nose.x * w)

            y = int(nose.y * h)

            cv2.circle(frame, (x, y), 5, (0,255,0), -1)

            cv2.putText(

                frame,

                "Face Detected",

                (x-40, y-20),

                cv2.FONT_HERSHEY_SIMPLEX,

                0.6,

                (0,255,0),

                2

            )

    cv2.imshow("Head Pose Detection", frame)

    if cv2.waitKey(25) & 0xFF == ord("q"):

        break

cap.release()

cv2.destroyAllWindows()