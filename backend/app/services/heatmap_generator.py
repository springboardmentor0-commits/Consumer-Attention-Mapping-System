import cv2
import numpy as np
import os


class HeatmapGenerator:

    def generate(self, frame, points):

        # Create empty heatmap
        heatmap = np.zeros(frame.shape[:2], dtype=np.float32)

        # Add every shopper position
        for x, y in points:

            cv2.circle(heatmap, (x, y), 25, 1, -1)

        # Smooth the circles
        heatmap = cv2.GaussianBlur(heatmap, (0, 0), sigmaX=15, sigmaY=15)

        # Normalize values
        heatmap = cv2.normalize(heatmap, None, 0, 255, cv2.NORM_MINMAX)

        heatmap = heatmap.astype(np.uint8)

        # Apply heat colors
        colored = cv2.applyColorMap(heatmap, cv2.COLORMAP_JET)

        # Overlay on original frame
        output = cv2.addWeighted(frame, 0.55, colored, 0.45, 0)

        os.makedirs("heatmaps", exist_ok=True)

        cv2.imwrite("heatmaps/store_heatmap.png", output)

        print("Heatmap generated successfully.")
