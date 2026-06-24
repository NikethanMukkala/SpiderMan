import cv2
import os

video_path = 'Assets/videos/SpideyBND.mp4'
output_dir = 'framesTitle'

if not os.path.exists(output_dir):
    os.makedirs(output_dir)

cap = cv2.VideoCapture(video_path)
if not cap.isOpened():
    print(f"Error opening video stream or file: {video_path}")
    exit(1)

frame_count = 0
while cap.isOpened():
    ret, frame = cap.read()
    if ret:
        frame_count += 1
        out_path = os.path.join(output_dir, f"{frame_count:04d}.jpg")
        cv2.imwrite(out_path, frame, [int(cv2.IMWRITE_JPEG_QUALITY), 80])
    else:
        break

cap.release()
print(f"Extracted {frame_count} frames to {output_dir}")
