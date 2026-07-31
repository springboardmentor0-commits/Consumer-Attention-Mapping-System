import cv2
import numpy as np


class HeatmapGenerator:

    def __init__(self, width, height):
        self.width = width
        self.height = height

        # Floating-point heat accumulation matrix
        self.heatmap = np.zeros(
            (height, width),
            dtype=np.float32
        )

    def add_point(self, x, y):
        """
        Adds shopper attention to the heatmap.
        Uses a large blurred circle so the heatmap
        looks smooth instead of pixelated.
        """

        if not (0 <= x < self.width and 0 <= y < self.height):
            return

        cv2.circle(
            self.heatmap,
            (int(x), int(y)),
            40,          # Larger radius
            1.0,
            -1
        )

    def generate(self, frame=None):
        """
        Generates a professional heatmap.

        If a frame is provided, the heatmap is blended
        transparently over the original frame.
        Otherwise, only the colored heatmap is returned.
        """

        normalized = cv2.normalize(
            self.heatmap,
            None,
            0,
            255,
            cv2.NORM_MINMAX
        )

        normalized = normalized.astype(np.uint8)

        # Smooth the heatmap
        blurred = cv2.GaussianBlur(
            normalized,
            (41, 41),
            0
        )

        # Apply professional color spectrum
        colored = cv2.applyColorMap(
            blurred,
            cv2.COLORMAP_JET
        )

        if frame is None:
            return colored

        overlay = cv2.addWeighted(
            frame,
            0.65,
            colored,
            0.35,
            0
        )

        return overlay