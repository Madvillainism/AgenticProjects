import cv2
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

    print("CV Gestures - Phase 3: Mouse Control")
    print("Press 'ESC' to exit")
    print("Show L-shape gesture to toggle mouse mode")
    
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

            # Initialize per-frame display state
            gesture = None
            clicked = False
            double_clicked = False
            right_clicked = False
            scroll_amount = 0

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
                        
                        # Handle pinch (click, double click, or draw)
                        clicked, double_clicked, drawing_changed = mouse_controller.handle_pinch(hand_landmarks)
                        
                        # Handle right click (ring pinch)
                        right_clicked = mouse_controller.handle_right_click(hand_landmarks)
                        
                        # Check for scroll gesture
                        scroll_amount = mouse_controller.check_scroll(hand_landmarks)
                        
                        # Blue circle on index tip when drawing
                        if mouse_controller.is_drawing:
                            h, w, _ = frame.shape
                            x = int(hand_landmarks[8].x * w)
                            y = int(hand_landmarks[8].y * h)
                            cv2.circle(frame, (x, y), 15, (255, 0, 0), 3)
                    
                    # Detect gesture (for display)
                    gesture = gesture_engine.detect_gesture_from_landmarks(hand_landmarks)
            
            # Draw dynamic feedback text (stacked vertically)
            text_y = 30
            line_height = 35

            if gesture and gesture != "L-Shape":
                cv2.putText(frame, gesture, (10, text_y),
                           cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)
                text_y += line_height

            if right_clicked:
                cv2.putText(frame, "RIGHT CLICK!", (10, text_y),
                           cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 165, 255), 2)
                text_y += line_height
            elif double_clicked:
                cv2.putText(frame, "DOUBLE CLICK!", (10, text_y),
                           cv2.FONT_HERSHEY_SIMPLEX, 0.9, (255, 0, 255), 2)
                text_y += line_height
            elif clicked:
                cv2.putText(frame, "CLICK!", (10, text_y),
                           cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 0, 255), 2)
                text_y += line_height

            if mouse_controller.is_drawing:
                cv2.putText(frame, "DRAWING", (10, text_y),
                           cv2.FONT_HERSHEY_SIMPLEX, 0.9, (255, 0, 0), 2)
                text_y += line_height

            if scroll_amount != 0:
                direction = "SCROLL UP" if scroll_amount > 0 else "SCROLL DOWN"
                cv2.putText(frame, direction, (10, text_y),
                           cv2.FONT_HERSHEY_SIMPLEX, 0.9, (255, 255, 0), 2)

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