import cv2
import numpy as np
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision
import threading
import time
import os
from gesture_engine import GestureEngine
from mouse_controller import MouseController

class CameraEngine:
    def __init__(self, camera_id=0):
        self.cap = cv2.VideoCapture(camera_id)
        self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
        self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
        self.cap.set(cv2.CAP_PROP_FPS, 30)
        
        self.frame = None
        self.running = False
        self.lock = threading.Lock()
        
    def start(self):
        self.running = True
        self.thread = threading.Thread(target=self._capture_loop, daemon=True)
        self.thread.start()
        
    def _capture_loop(self):
        while self.running:
            success, frame = self.cap.read()
            if success:
                with self.lock:
                    self.frame = frame
            time.sleep(1/30)  # Limit to 30 FPS
            
    def get_frame(self):
        with self.lock:
            if self.frame is not None:
                return self.frame.copy()
        return None
    
    def stop(self):
        self.running = False
        if hasattr(self, 'thread'):
            self.thread.join()
        self.cap.release()
        
    def __del__(self):
        self.stop()

def load_overlay_images():
    """Load meme images for gesture overlays."""
    images = {}
    gestures = {
        "Thumbs Up": "thumbs_up_dog.png",
        "Thumbs Down": "thumbs_down_dog.png",
        "Open Palm": "open_palm_dog.png",
        "Victory": "victory_dog.png"
    }
    
    for gesture_name, filename in gestures.items():
        path = os.path.join("assets", "images", filename)
        if os.path.exists(path):
            img = cv2.imread(path, cv2.IMREAD_UNCHANGED)
            if img is not None:
                # Resize to 150x150
                img = cv2.resize(img, (150, 150))
                images[gesture_name] = img
                print(f"Loaded overlay: {filename}")
        else:
            print(f"Warning: Overlay image not found: {path}")
    
    return images

def overlay_image(frame, overlay, position, alpha=0.8):
    """Overlay an image with alpha channel onto the frame."""
    x, y = position
    h, w = overlay.shape[:2]
    frame_h, frame_w = frame.shape[:2]
    
    # Adjust position if image goes out of bounds
    if x + w > frame_w:
        x = frame_w - w
    if y + h > frame_h:
        y = frame_h - h
    if x < 0:
        x = 0
    if y < 0:
        y = 0
    
    # Ensure we don't go out of bounds
    if x + w > frame_w or y + h > frame_h:
        return frame
    
    if overlay.shape[2] == 4:  # Has alpha channel
        # Split the overlay into color and alpha channels
        overlay_rgb = overlay[:, :, :3]
        overlay_alpha = overlay[:, :, 3] / 255.0
        
        # Expand alpha channel to 3 dimensions
        overlay_alpha_3d = np.stack([overlay_alpha] * 3, axis=-1)
        
        # Get the region of interest
        roi = frame[y:y+h, x:x+w]
        
        # Blend the images
        blended = (overlay_alpha_3d * overlay_rgb + 
                   (1 - overlay_alpha_3d) * roi).astype(np.uint8)
        
        frame[y:y+h, x:x+w] = blended
    else:
        frame[y:y+h, x:x+w] = overlay
    
    return frame

def draw_mouse_mode_indicator(frame, mouse_controller):
    """Draw visual indicator for mouse mode status."""
    frame_h, frame_w = frame.shape[:2]
    
    # Get status text and color
    status_text = mouse_controller.get_mode_status()
    color = mouse_controller.get_mode_color()
    
    # Draw status bar at bottom of screen
    cv2.rectangle(frame, (0, frame_h - 40), (frame_w, frame_h), (0, 0, 0), -1)
    cv2.putText(frame, status_text, (10, frame_h - 15), 
               cv2.FONT_HERSHEY_SIMPLEX, 0.7, color, 2)
    
    # Draw crosshair when mouse mode is on
    if mouse_controller.mouse_mode_enabled:
        # Get current mouse position and map to frame coordinates
        try:
            # Draw a subtle crosshair in the center
            center_x, center_y = frame_w // 2, frame_h // 2
            cv2.drawMarker(frame, (center_x, center_y), (0, 255, 255), 
                          cv2.MARKER_CROSS, 20, 2)
        except:
            pass
    
    return frame

def main():
    model_path = os.path.join(os.path.dirname(__file__), 'models', 'hand_landmarker.task')
    
    if not os.path.exists(model_path):
        print(f"Error: Model file not found at {model_path}")
        print("Please download the hand landmarker model:")
        print("Invoke-WebRequest -Uri 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/latest/hand_landmarker.task' -OutFile 'models/hand_landmarker.task'")
        return
    
    base_options = python.BaseOptions(model_asset_path=model_path)
    options = vision.HandLandmarkerOptions(
        base_options=base_options,
        running_mode=vision.RunningMode.VIDEO,
        num_hands=2,
        min_hand_detection_confidence=0.7,
        min_hand_presence_confidence=0.7,
        min_tracking_confidence=0.7
    )
    
    landmarker = vision.HandLandmarker.create_from_options(options)
    
    camera = CameraEngine(camera_id=0)
    camera.start()
    
    gesture_engine = GestureEngine()
    mouse_controller = MouseController()
    overlay_images = load_overlay_images()
    
    print("CV Gestures - Phase 3: Mouse Control")
    print("Press 'ESC' to exit")
    print("Show L-shape gesture to toggle mouse mode")
    print(f"Loaded {len(overlay_images)} overlay images")
    
    frame_timestamp_ms = 0
    
    while True:
        frame = camera.get_frame()
        if frame is None:
            continue
            
        frame = cv2.flip(frame, 1)
        
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=frame_rgb)
        
        frame_timestamp_ms += 33  # ~30 FPS
        
        try:
            result = landmarker.detect_for_video(mp_image, frame_timestamp_ms)
            
            if result.hand_landmarks:
                for hand_landmarks in result.hand_landmarks:
                    # Check for mouse mode toggle (L-shape gesture)
                    mouse_controller.toggle_mouse_mode(hand_landmarks)
                    
                    # Draw hand landmarks
                    for landmark in hand_landmarks:
                        h, w, _ = frame.shape
                        x = int(landmark.x * w)
                        y = int(landmark.y * h)
                        
                        # Different color when mouse mode is on
                        if mouse_controller.mouse_mode_enabled:
                            cv2.circle(frame, (x, y), 4, (0, 255, 255), -1)
                        else:
                            cv2.circle(frame, (x, y), 3, (0, 255, 0), -1)
                    
                    # Mouse control (only when mouse mode is enabled)
                    if mouse_controller.mouse_mode_enabled:
                        # Move mouse based on index finger position
                        index_x, index_y = gesture_engine.get_index_finger_position(hand_landmarks)
                        mouse_controller.move_mouse(index_x, index_y)
                        
                        # Check for click gesture
                        if mouse_controller.check_click(hand_landmarks):
                            cv2.putText(frame, "CLICK!", (10, 60), 
                                       cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
                        
                        # Check for drag gesture
                        if mouse_controller.check_drag(hand_landmarks):
                            cv2.putText(frame, "DRAGGING", (10, 90), 
                                       cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 0, 0), 2)
                    
                    # Detect gesture (for display and overlays)
                    gesture = gesture_engine.detect_gesture_from_landmarks(hand_landmarks)
                    if gesture and gesture != "L-Shape":
                        # Display gesture name
                        cv2.putText(frame, gesture, (10, 30), 
                                   cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
                        
                        # Overlay meme image if available
                        if gesture in overlay_images:
                            # Position in top-right corner
                            frame_h, frame_w = frame.shape[:2]
                            overlay_x = frame_w - 170
                            overlay_y = 10
                            frame = overlay_image(frame, overlay_images[gesture], 
                                                 (overlay_x, overlay_y))
            
            # Draw mouse mode indicator
            frame = draw_mouse_mode_indicator(frame, mouse_controller)
            
        except Exception as e:
            print(f"Detection error: {e}")
        
        cv2.imshow('CV Gestures - Mouse Control', frame)
        
        key = cv2.waitKey(1) & 0xFF
        if key == 27:  # ESC key
            break
            
    landmarker.close()
    camera.stop()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()