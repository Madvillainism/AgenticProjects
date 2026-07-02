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
        self.mode_toggle_cooldown = 1.0  # seconds
        
        # Smoothing parameters
        self.smooth_factor = 0.4  # Lower = more smooth, higher = more responsive
        self.smoothed_x = 0.5
        self.smoothed_y = 0.5
        
        # Calibration bounds (normalized 0-1)
        self.min_x = 0.4
        self.max_x = 0.6
        self.min_y = 0.4
        self.max_y = 0.6
        self.calibration_frames = 0
        self.calibration_complete = False
        
        # Click detection
        self.last_click_time = 0
        self.click_cooldown = 0.5  # seconds
        
        # Drag detection
        self.is_dragging = False
        self.fist_start_time = 0
        self.fist_confirm_time = 0.3  # seconds to hold fist
        
        # Safety
        pyautogui.FAILSAFE = True  # Move mouse to corner to abort
        pyautogui.PAUSE = 0.01  # Small delay between actions
        
    def _calculate_distance(self, point1: Landmark, point2: Landmark) -> float:
        """Calculate Euclidean distance between two landmarks."""
        return math.sqrt(
            (point1.x - point2.x) ** 2 + 
            (point1.y - point2.y) ** 2 + 
            (point1.z - point2.z) ** 2
        )
    
    def _is_l_shape(self, hand_landmarks: List[Landmark]) -> bool:
        """
        Detect L-shape gesture for mouse mode activation.
        
        L-shape conditions:
        1. Thumb extended outward (away from palm)
        2. Index finger extended upward
        3. Middle, Ring, Pinky curled
        4. Angle between thumb and index is roughly 90 degrees
        """
        # Landmark indices
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
        
        # Check thumb is extended (distance from wrist)
        thumb_dist = self._calculate_distance(
            hand_landmarks[THUMB_TIP],
            hand_landmarks[WRIST]
        )
        thumb_extended = thumb_dist > 0.15
        
        # Check index finger is extended upward
        index_extended = hand_landmarks[INDEX_TIP].y < hand_landmarks[INDEX_PIP].y
        
        # Check other fingers are curled
        middle_curled = hand_landmarks[MIDDLE_TIP].y > hand_landmarks[MIDDLE_PIP].y
        ring_curled = hand_landmarks[RING_TIP].y > hand_landmarks[RING_PIP].y
        pinky_curled = hand_landmarks[PINKY_TIP].y > hand_landmarks[PINKY_PIP].y
        
        # Check angle between thumb and index (roughly 90 degrees)
        # Calculate vectors from MCP joints
        thumb_vector = np.array([
            hand_landmarks[THUMB_TIP].x - hand_landmarks[THUMB_MCP].x,
            hand_landmarks[THUMB_TIP].y - hand_landmarks[THUMB_MCP].y
        ])
        index_vector = np.array([
            hand_landmarks[INDEX_TIP].x - hand_landmarks[INDEX_MCP].x,
            hand_landmarks[INDEX_TIP].y - hand_landmarks[INDEX_MCP].y
        ])
        
        # Calculate angle between vectors
        cos_angle = np.dot(thumb_vector, index_vector) / (
            np.linalg.norm(thumb_vector) * np.linalg.norm(index_vector) + 1e-6
        )
        angle = np.degrees(np.arccos(np.clip(cos_angle, -1.0, 1.0)))
        
        # Angle should be roughly 90 degrees (60-120 tolerance)
        angle_ok = 60 < angle < 120
        
        return thumb_extended and index_extended and middle_curled and ring_curled and pinky_curled and angle_ok
    
    def _is_fist(self, hand_landmarks: List[Landmark]) -> bool:
        """Detect fist gesture (all fingers curled)."""
        wrist = hand_landmarks[0]
        finger_tips = [4, 8, 12, 16, 20]
        
        for tip_idx in finger_tips:
            dist = self._calculate_distance(hand_landmarks[tip_idx], wrist)
            if dist > 0.15:
                return False
        return True
    
    def _is_pinch(self, hand_landmarks: List[Landmark]) -> bool:
        """Detect pinch gesture (thumb + index close together)."""
        distance = self._calculate_distance(
            hand_landmarks[4],  # THUMB_TIP
            hand_landmarks[8]   # INDEX_TIP
        )
        return distance < 0.06
    
    def toggle_mouse_mode(self, hand_landmarks: List[Landmark]) -> bool:
        """Toggle mouse mode on/off with L-shape gesture."""
        current_time = time.time()
        
        if current_time - self.last_mode_toggle_time < self.mode_toggle_cooldown:
            return False
        
        if self._is_l_shape(hand_landmarks):
            self.mouse_mode_enabled = not self.mouse_mode_enabled
            self.last_mode_toggle_time = current_time
            
            if self.mouse_mode_enabled:
                print("Mouse mode: ON")
                # Reset calibration when enabling
                self.calibration_frames = 0
                self.calibration_complete = False
            else:
                print("Mouse mode: OFF")
                # Release any drag
                if self.is_dragging:
                    pyautogui.mouseUp()
                    self.is_dragging = False
        
        return self.mouse_mode_enabled
    
    def normalize_to_screen(self, normalized_x: float, normalized_y: float) -> Tuple[int, int]:
        """Map normalized hand position to screen coordinates."""
        # Clamp to calibration bounds
        clamped_x = max(self.min_x, min(self.max_x, normalized_x))
        clamped_y = max(self.min_y, min(self.max_y, normalized_y))
        
        # Normalize to 0-1 within bounds
        if self.max_x - self.min_x > 0.01:
            norm_x = (clamped_x - self.min_x) / (self.max_x - self.min_x)
        else:
            norm_x = 0.5
            
        if self.max_y - self.min_y > 0.01:
            norm_y = (clamped_y - self.min_y) / (self.max_y - self.min_y)
        else:
            norm_y = 0.5
        
        # Map to screen coordinates (flip X for mirror effect)
        screen_x = int((1.0 - norm_x) * self.screen_width)
        screen_y = int(norm_y * self.screen_height)
        
        return screen_x, screen_y
    
    def smooth_position(self, raw_x: float, raw_y: float) -> Tuple[float, float]:
        """Apply exponential moving average for smooth movement."""
        self.smoothed_x = self.smooth_factor * raw_x + (1 - self.smooth_factor) * self.smoothed_x
        self.smoothed_y = self.smooth_factor * raw_y + (1 - self.smooth_factor) * self.smoothed_y
        return self.smoothed_x, self.smoothed_y
    
    def update_calibration(self, normalized_x: float, normalized_y: float):
        """Update calibration bounds based on hand movement."""
        if not self.calibration_complete:
            self.calibration_frames += 1
            
            # Gradually expand bounds
            if self.calibration_frames < 30:  # Calibrate for 30 frames
                self.min_x = min(self.min_x, normalized_x)
                self.max_x = max(self.max_x, normalized_x)
                self.min_y = min(self.min_y, normalized_y)
                self.max_y = max(self.max_y, normalized_y)
            else:
                self.calibration_complete = True
                print(f"Calibration complete: X[{self.min_x:.2f}-{self.max_x:.2f}] Y[{self.min_y:.2f}-{self.max_y:.2f}]")
    
    def move_mouse(self, normalized_x: float, normalized_y: float):
        """Move mouse to position based on hand landmarks."""
        if not self.mouse_mode_enabled:
            return
        
        # Update calibration during initial frames
        self.update_calibration(normalized_x, normalized_y)
        
        # Smooth the position
        smoothed_x, smoothed_y = self.smooth_position(normalized_x, normalized_y)
        
        # Convert to screen coordinates
        screen_x, screen_y = self.normalize_to_screen(smoothed_x, smoothed_y)
        
        # Move the mouse
        pyautogui.moveTo(screen_x, screen_y, _pause=False)
    
    def check_click(self, hand_landmarks: List[Landmark]) -> bool:
        """Detect click gesture (pinch)."""
        if not self.mouse_mode_enabled:
            return False
        
        current_time = time.time()
        
        if self._is_pinch(hand_landmarks):
            if current_time - self.last_click_time > self.click_cooldown:
                pyautogui.click()
                self.last_click_time = current_time
                return True
        return False
    
    def check_drag(self, hand_landmarks: List[Landmark]) -> bool:
        """Detect drag gesture (fist)."""
        if not self.mouse_mode_enabled:
            return False
        
        current_time = time.time()
        
        if self._is_fist(hand_landmarks):
            if not self.is_dragging:
                if self.fist_start_time == 0:
                    self.fist_start_time = current_time
                elif current_time - self.fist_start_time > self.fist_confirm_time:
                    pyautogui.mouseDown()
                    self.is_dragging = True
                    self.fist_start_time = 0
                    return True
        else:
            if self.is_dragging:
                pyautogui.mouseUp()
                self.is_dragging = False
                self.fist_start_time = 0
            else:
                self.fist_start_time = 0
        
        return self.is_dragging
    
    def get_mode_status(self) -> str:
        """Get current mouse mode status for display."""
        if self.mouse_mode_enabled:
            return "MOUSE MODE: ON"
        return "MOUSE MODE: OFF [Show L-shape to activate]"
    
    def get_mode_color(self) -> Tuple[int, int, int]:
        """Get color for status display (BGR)."""
        if self.mouse_mode_enabled:
            return (0, 255, 0)  # Green
        return (0, 165, 255)  # Orange