import numpy as np
import cv2
import os

def generate_heatmap(width=640, height=480, output_path="heatmap.png", show_window=False):
    """
    Generate a store attention heatmap based on simulated
    shopper position data.
    Red = high traffic/attention
    Blue = low traffic
    """

    heatmap_data = np.zeros((height, width), dtype=np.float32)

    shopper_positions = [
        (100, 100, 0.9), (120, 110, 0.8), (110, 90, 0.85),
        (130, 120, 0.7), (90, 100, 0.75), (105, 115, 0.8),
        (250, 200, 0.5), (270, 210, 0.45), (260, 190, 0.55),
        (240, 215, 0.4),
        (400, 300, 0.2), (420, 310, 0.15), (410, 290, 0.25),
        (500, 150, 1.0), (520, 160, 0.95), (510, 140, 0.9),
        (490, 170, 0.85), (530, 155, 0.88), (505, 145, 0.92),
        (580, 400, 0.1), (590, 410, 0.08),
    ]

    for (x, y, intensity) in shopper_positions:
        for i in range(max(0, y-50), min(height, y+50)):
            for j in range(max(0, x-50), min(width, x+50)):
                dist = np.sqrt((i - y)**2 + (j - x)**2)
                if dist < 50:
                    heatmap_data[i, j] += intensity * np.exp(-dist**2 / (2 * 20**2))

    heatmap_data = cv2.normalize(heatmap_data, None, 0, 255, cv2.NORM_MINMAX)
    heatmap_data = heatmap_data.astype(np.uint8)
    heatmap_colored = cv2.applyColorMap(heatmap_data, cv2.COLORMAP_JET)

    cv2.putText(heatmap_colored, "Aisle 1 - Snacks", (70, 80),
                cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
    cv2.putText(heatmap_colored, "Aisle 2 - Beverages", (210, 180),
                cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
    cv2.putText(heatmap_colored, "Aisle 3 - Dairy", (360, 280),
                cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
    cv2.putText(heatmap_colored, "Aisle 4 - Bakery (HOT)", (440, 130),
                cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
    cv2.putText(heatmap_colored, "Aisle 5 - Frozen", (530, 380),
                cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
    cv2.putText(heatmap_colored, "STORE ATTENTION HEATMAP", (180, 460),
                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)

    cv2.imwrite(output_path, heatmap_colored)
    print(f"Heatmap saved to {output_path}")

    if show_window:
        cv2.imshow("Store Attention Heatmap", heatmap_colored)
        cv2.waitKey(0)
        cv2.destroyAllWindows()

    return output_path


if __name__ == "__main__":
    generate_heatmap(output_path="heatmap.png", show_window=True)