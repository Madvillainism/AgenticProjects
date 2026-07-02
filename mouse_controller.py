import pyautogui
import numpy as np
import math
import time
from typing import List, Optional, Tuple
from gesture_engine import Landmark

class MouseController:
    def __init__(self):
        # Screen dimensions
        self.screen_width, self.screen_height = pyautogui.size()
        
        # Mouse mode state
        self.mouse_mode_enabled = False
        self.last_mode_toggle_time = 0
        self.mode_toggle_cooldown = 1.0
        
        # Smoothing parameters
        self.smooth_factor = 0.3
        self.smoothed_x = 0.5
        self.smoothed_y = 0.5
        
        # Calibration bounds
        self.min_x = 0.3
        self.max_x = 0.7
        self.min_y = 0.3
        self.max_y = 0.7
        self.calibration_frames = 0
        self.calibration_complete = False
        
        # Unified pinch state
        self.pinch_active = False
        self.pinch_start_time = 0
        self.is_drawing = False
        self.draw_confirm_time = 0.35  # seconds held to start drawing
        self.last_click_time = 0
        self.click_cooldown = 0.3
        
        # Double click state
        self.last_click_was_single = False
        self.double_click_window = 0.4  # seconds between clicks for double click
        
        # Scroll state
        self.last_scroll_time = 0
        self.scroll_cooldown = 0.15
        
        # Safety
        pyautogui.FAILSAFE = False
        pyautogui.PAUSE = 0.01
        
    def _calculate_distance(self, point1: Landmark, point2: Landmark) -> float:
        return math.sqrt(
            (point1.x - point2.x) ** 2 + 
            (point1.y - point2.y) ** 2 + 
            (point1.z - point2.z) ** 2
        )
    
    def _is_l_shape(self, hand_landmarks: List[Landmark]) -> bool:
        WRIST = 0
        THUMB_MCP = 2
        THUMB_TIP = 4
        INDEX_MCP = 5
        INDEX_PIP = 6
        INDEX_TIP = 8
        MIDDLE_PIP = 10
        MIDDLE_TIP = 12
        RING_PIP = 14
        RING_TIP = 16
        PINKY_PIP = 18
        PINKY_TIP = 20
        
        thumb_dist = self._calculate_distance(
            hand_landmarks[THUMB_TIP],
            hand_landmarks[WRIST]
        )
        thumb_extended = thumb_dist > 0.15
        
        index_extended = hand_landmarks[INDEX_TIP].y < hand_landmarks[INDEX_PIP].y
        
        middle_curled = hand_landmarks[MIDDLE_TIP].y > hand_landmarks[MIDDLE_PIP].y
        ring_curled = hand_landmarks[RING_TIP].y > hand_landmarks[RING_PIP].y
        pinky_curled = hand_landmarks[PINKY_TIP].y > hand_landmarks[PINKY_PIP].y
        
        thumb_vector = np.array([
            hand_landmarks[THUMB_TIP].x - hand_landmarks[THUMB_MCP].x,
            hand_landmarks[THUMB_TIP].y - hand_landmarks[THUMB_MCP].y
        ])
        index_vector = np.array([
            hand_landmarks[INDEX_TIP].x - hand_landmarks[INDEX_MCP].x,
            hand_landmarks[INDEX_TIP].y - hand_landmarks[INDEX_MCP].y
        ])
        
        cos_angle = np.dot(thumb_vector, index_vector) / (
            np.linalg.norm(thumb_vector) * np.linalg.norm(index_vector) + 1e-6
        )
        angle = np.degrees(np.arccos(np.clip(cos_angle, -1.0, 1.0)))
        angle_ok = 60 < angle < 120
        
        return thumb_extended and index_extended and middle_curled and ring_curled and pinky_curled and angle_ok
    
    def _is_pinch(self, hand_landmarks: List[Landmark]) -> bool:
        distance = self._calculate_distance(
            hand_landmarks[4],  # THUMB_TIP
            hand_landmarks[8]   # INDEX_TIP
        )
        return distance < 0.06
    
    def _is_all_fingers_up(self, hand_landmarks: List[Landmark]) -> bool:
        """All 5 fingers extended upward."""
        INDEX_TIP = 8
        INDEX_PIP = 6
        MIDDLE_TIP = 12
        MIDDLE_PIP = 10
        RING_TIP = 16
        RING_PIP = 14
        PINKY_TIP = 20
        PINKY_PIP = 18
        THUMB_TIP = 4
        THUMB_IP = 3
        
        index_up = hand_landmarks[INDEX_TIP].y < hand_landmarks[INDEX_PIP].y
        middle_up = hand_landmarks[MIDDLE_TIP].y < hand_landmarks[MIDDLE_PIP].y
        ring_up = hand_landmarks[RING_TIP].y < hand_landmarks[RING_PIP].y
        pinky_up = hand_landmarks[PINKY_TIP].y < hand_landmarks[PINKY_PIP].y
        thumb_up = hand_landmarks[THUMB_TIP].y < hand_landmarks[THUMB_IP].y
        
        return index_up and middle_up and ring_up and pinky_up and thumb_up
    
    def _is_all_fingers_down(self, hand_landmarks: List[Landmark]) -> bool:
        """All 5 fingers extended downward."""
        INDEX_TIP = 8
        INDEX_PIP = 6
        MIDDLE_TIP = 12
        MIDDLE_PIP = 10
        RING_TIP = 16
        RING_PIP = 14
        PINKY_TIP = 20
        PINKY_PIP = 18
        THUMB_TIP = 4
        THUMB_IP = 3
        
        index_down = hand_landmarks[INDEX_TIP].y > hand_landmarks[INDEX_PIP].y
        middle_down = hand_landmarks[MIDDLE_TIP].y > hand_landmarks[MIDDLE_PIP].y
        ring_down = hand_landmarks[RING_TIP].y > hand_landmarks[RING_PIP].y
        pinky_down = hand_landmarks[PINKY_TIP].y > hand_landmarks[PINKY_PIP].y
        thumb_down = hand_landmarks[THUMB_TIP].y > hand_landmarks[THUMB_IP].y
        
        return index_down and middle_down and ring_down and pinky_down and thumb_down
    
    def toggle_mouse_mode(self, hand_landmarks: List[Landmark]) -> bool:
        current_time = time.time()
        
        if current_time - self.last_mode_toggle_time < self.mode_toggle_cooldown:
            return False
        
        if self._is_l_shape(hand_landmarks):
            self.mouse_mode_enabled = not self.mouse_mode_enabled
            self.last_mode_toggle_time = current_time
            
            if self.mouse_mode_enabled:
                print("Mouse mode: ON")
                self.calibration_frames = 0
                self.calibration_complete = False
                self.smoothed_x = 0.5
                self.smoothed_y = 0.5
            else:
                print("Mouse mode: OFF")
                if self.is_drawing:
                    pyautogui.mouseUp()
                    self.is_drawing = False
                self.pinch_active = False
        
        return self.mouse_mode_enabled
    
    def normalize_to_screen(self, normalized_x: float, normalized_y: float) -> Tuple[int, int]:
        clamped_x = max(self.min_x, min(self.max_x, normalized_x))
        clamped_y = max(self.min_y, min(self.max_y, normalized_y))
        
        if self.max_x - self.min_x > 0.01:
            norm_x = (clamped_x - self.min_x) / (self.max_x - self.min_x)
        else:
            norm_x = 0.5
            
        if self.max_y - self.min_y > 0.01:
            norm_y = (clamped_y - self.min_y) / (self.max_y - self.min_y)
        else:
            norm_y = 0.5
        
        margin = 0.05
        norm_x = max(margin, min(1.0 - margin, norm_x))
        norm_y = max(margin, min(1.0 - margin, norm_y))
        
        screen_x = int(norm_x * self.screen_width)
        screen_y = int(norm_y * self.screen_height)
        
        return screen_x, screen_y
    
    def smooth_position(self, raw_x: float, raw_y: float) -> Tuple[float, float]:
        self.smoothed_x = self.smooth_factor * raw_x + (1 - self.smooth_factor) * self.smoothed_x
        self.smoothed_y = self.smooth_factor * raw_y + (1 - self.smooth_factor) * self.smoothed_y
        return self.smoothed_x, self.smoothed_y
    
    def update_calibration(self, normalized_x: float, normalized_y: float):
        if not self.calibration_complete:
            self.calibration_frames += 1
            
            if self.calibration_frames < 30:
                self.min_x = min(self.min_x, normalized_x)
                self.max_x = max(self.max_x, normalized_x)
                self.min_y = min(self.min_y, normalized_y)
                self.max_y = max(self.max_y, normalized_y)
            else:
                self.calibration_complete = True
                print(f"Calibration: X[{self.min_x:.2f}-{self.max_x:.2f}] Y[{self.min_y:.2f}-{self.max_y:.2f}]")
    
    def move_mouse(self, normalized_x: float, normalized_y: float):
        if not self.mouse_mode_enabled:
            return
        
        self.update_calibration(normalized_x, normalized_y)
        smoothed_x, smoothed_y = self.smooth_position(normalized_x, normalized_y)
        screen_x, screen_y = self.normalize_to_screen(smoothed_x, smoothed_y)
        
        try:
            pyautogui.moveTo(screen_x, screen_y, _pause=False)
        except Exception as e:
            print(f"Mouse move error: {e}")
    
    def handle_pinch(self, hand_landmarks: List[Landmark]) -> Tuple[bool, bool, bool]:
        """
        Unified pinch handler.
        Returns: (clicked, double_clicked, drawing_changed)
        """
        if not self.mouse_mode_enabled:
            return False, False, False
        
        current_time = time.time()
        is_pinching = self._is_pinch(hand_landmarks)
        clicked = False
        double_clicked = False
        drawing_changed = False
        
        if is_pinching:
            if not self.pinch_active:
                # Just started pinching
                self.pinch_active = True
                self.pinch_start_time = current_time
            elif not self.is_drawing:
                # Check if held long enough to draw
                held_duration = current_time - self.pinch_start_time
                if held_duration > self.draw_confirm_time:
                    pyautogui.mouseDown()
                    self.is_drawing = True
                    drawing_changed = True
        else:
            if self.pinch_active:
                # Released pinch
                held_duration = current_time - self.pinch_start_time
                self.pinch_active = False
                
                if self.is_drawing:
                    # Stop drawing
                    pyautogui.mouseUp()
                    self.is_drawing = False
                    drawing_changed = True
                elif held_duration < self.draw_confirm_time:
                    # Quick pinch = click or double click
                    if current_time - self.last_click_time < self.double_click_window:
                        # Double click
                        pyautogui.doubleClick()
                        self.last_click_time = 0
                        self.last_click_was_single = False
                        double_clicked = True
                    elif current_time - self.last_click_time > self.click_cooldown:
                        # Single click (wait to see if another comes)
                        pyautogui.click()
                        self.last_click_time = current_time
                        self.last_click_was_single = True
                        clicked = True
        
        return clicked, double_clicked, drawing_changed
    
    def check_scroll(self, hand_landmarks: List[Landmark]) -> int:
        """Full fingers up = scroll up, full fingers down = scroll down."""
        if not self.mouse_mode_enabled:
            return 0
        
        current_time = time.time()
        if current_time - self.last_scroll_time < self.scroll_cooldown:
            return 0
        
        if self._is_all_fingers_up(hand_landmarks):
            pyautogui.scroll(3)
            self.last_scroll_time = current_time
            return 1
        
        if self._is_all_fingers_down(hand_landmarks):
            pyautogui.scroll(-3)
            self.last_scroll_time = current_time
            return -1
        
        return 0
    
    def get_mode_status(self) -> str:
        if self.mouse_mode_enabled:
            if self.is_drawing:
                return "DRAWING"
            return "MOUSE ON"
        return "MOUSE OFF"
    
    def get_mode_color(self) -> Tuple[int, int, int]:
        if self.mouse_mode_enabled:
            if self.is_drawing:
                return (255, 0, 0)  # Blue
            return (0, 255, 0)  # Green
        return (0, 165, 255)  # Orange
