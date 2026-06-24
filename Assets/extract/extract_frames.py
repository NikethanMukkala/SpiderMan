import cv2
import os

video_path = "Assets/videos/suite.mp4"
output_dir = "Assets/videos/frames"

if not os.path.exists(output_dir):
    os.makedirs(output_dir)

cap = cv2.VideoCapture(video_path)
width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
fps = cap.get(cv2.CAP_PROP_FPS)

print(f"Video Resolution: {width}x{height}")
print(f"Total Frames: {total_frames}")
print(f"FPS: {fps}")

# We will crop the bottom right to remove the watermark
# Let's say crop 80 pixels from bottom, 120 pixels from right
crop_bottom = 80
crop_right = 120

frame_idx = 1
while True:
    ret, frame = cap.read()
    if not ret:
        break
    
    # Crop the frame
    cropped = frame[0:height-crop_bottom, 0:width-crop_right]
    
    # Resize back to 1920x1080 or keep it cropped? 
    # Let's just keep it cropped, CSS object-fit: cover will handle it.
    
    # Save frame
    out_path = os.path.join(output_dir, f"frame_{frame_idx:04d}.jpg")
    # Use quality 80 to keep size down
    cv2.imwrite(out_path, cropped, [int(cv2.IMWRITE_JPEG_QUALITY), 80])
    
    if frame_idx % 50 == 0:
        print(f"Extracted {frame_idx}/{total_frames} frames")
        
    frame_idx += 1

cap.release()
print("Done extracting frames!")
