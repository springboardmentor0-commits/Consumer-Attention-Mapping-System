# backend/run_test.py
import os
from app.services.camera import run_camera_verification

print("====================================================")
print("🎬 INTERACTIVE MP4 VIDEO PLAYER")
print("====================================================")
print("👉 Instructions:")
print("1. Find your .mp4 video file in your computer folder.")
print("2. DRAG the file with your mouse.")
print("3. DROP it right here into this terminal window.")
print("4. Press ENTER on your keyboard.\n")

# This pauses the script and waits for you to drop the file and press Enter
dropped_path = input("📂 Drag & Drop your video file here: ")

# Clean up the path string! 
# Sometimes drag-and-drop adds extra quotation marks around the path (like "C:\video.mp4")
# .strip("'\"") cleanly removes those quotes so Python can read the file correctly.
clean_path = dropped_path.strip("'\"").strip()

# Check if the file actually exists where the path says it is
if os.path.exists(clean_path) and clean_path.lower().endswith('.mp4'):
    print(f"\n✅ File found! Loading: {clean_path}")
    # Run our camera service using the path you dropped in
    run_camera_verification(source=clean_path)
else:
    print("\n❌ ERROR: Invalid file path or file is not an .mp4 video!")
    print(f"Received path: {clean_path}")
    print("Please run the script again and try dragging the file directly into the window.")