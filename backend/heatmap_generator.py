import cv2
import numpy as np


def generate_heatmap(frame, points):

    heat = np.zeros(frame.shape[:2], dtype=np.float32)

    for x, y in points:

        cv2.circle(
            heat,
            (int(x), int(y)),
            35,
            1,
            -1
        )

    heat = cv2.GaussianBlur(
        heat,
        (0, 0),
        sigmaX=25
    )

    heat = cv2.normalize(
        heat,
        None,
        0,
        255,
        cv2.NORM_MINMAX
    )

    heat = heat.astype(np.uint8)

    heat = cv2.applyColorMap(
        heat,
        cv2.COLORMAP_JET
    )

    result = cv2.addWeighted(
        frame,
        0.55,
        heat,
        0.45,
        0
    )

    return result