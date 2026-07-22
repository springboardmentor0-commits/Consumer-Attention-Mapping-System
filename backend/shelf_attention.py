# import cv2
# from ultralytics import YOLO
# import supervision as sv

# model = YOLO("yolov8n.pt")

# tracker = sv.ByteTrack()

# cap = cv2.VideoCapture("store_video.mp4")

# if not cap.isOpened():
#     print("Cannot open video")
#     exit()

# while cap.isOpened():
#     ret, frame = cap.read()
#     if not ret:
#         break


#     height, width, _ = frame.shape

#     SHELF_A = (0, 0, width//3, height)

#     SHELF_B = (width//3, 0, 2*width//3, height)

#     SHELF_C = (2*width//3, 0, width, height)

#     cv2.rectangle(frame,

#               (SHELF_A[0], SHELF_A[1]),

#               (SHELF_A[2], SHELF_A[3]),

#               (255,0,0),

#               2)

#     cv2.rectangle(frame,

#               (SHELF_B[0], SHELF_B[1]),

#               (SHELF_B[2], SHELF_B[3]),

#               (0,255,0),

#               2)

#     cv2.rectangle(frame,

#               (SHELF_C[0], SHELF_C[1]),

#               (SHELF_C[2], SHELF_C[3]),

#               (0,0,255),

#               2)
#     cv2.putText(frame,"Shelf A",(30,40),
#     cv2.FONT_HERSHEY_SIMPLEX,1,(255,0,0),2)

#     cv2.putText(frame,"Shelf B",(width//3+30,40),
#     cv2.FONT_HERSHEY_SIMPLEX,1,(0,255,0),2)

#     cv2.putText(frame,"Shelf C",(2*width//3+30,40),
#     cv2.FONT_HERSHEY_SIMPLEX,1,(0,0,255),2)

import cv2
from ultralytics import YOLO
from shelf_loader import load_shelves

model = YOLO("yolov8n.pt")

tracker = sv.ByteTrack()

cap = cv2.VideoCapture("store_video.mp4")

if not cap.isOpened():
    print("Cannot open video")
    exit()

while cap.isOpened():

    ret, frame = cap.read()

    if not ret:
        break

    height, width, _ = frame.shape


    

    # SHELF_A = (0, 0, width//3, height)
    # SHELF_B = (width//3, 0, 2*width//3, height)
    # SHELF_C = (2*width//3, 0, width, height)

    # cv2.rectangle(frame, (SHELF_A[0], SHELF_A[1]), (SHELF_A[2], SHELF_A[3]), (255,0,0), 2)
    # cv2.rectangle(frame, (SHELF_B[0], SHELF_B[1]), (SHELF_B[2], SHELF_B[3]), (0,255,0), 2)
    # cv2.rectangle(frame, (SHELF_C[0], SHELF_C[1]), (SHELF_C[2], SHELF_C[3]), (0,0,255), 2)

    # cv2.putText(frame, "Shelf A", (30,40), cv2.FONT_HERSHEY_SIMPLEX, 1, (255,0,0), 2)
    # cv2.putText(frame, "Shelf B", (width//3+30,40), cv2.FONT_HERSHEY_SIMPLEX, 1, (0,255,0), 2)
    # cv2.putText(frame, "Shelf C", (2*width//3+30,40), cv2.FONT_HERSHEY_SIMPLEX, 1, (0,0,255), 2)

    cv2.imshow("Shelf Attention Mapping", frame)

    if cv2.waitKey(25) & 0xFF == ord("q"):
        break

cap.release()
cv2.destroyAllWindows()