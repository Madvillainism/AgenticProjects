import pyautogui
import math
import time
from typing import List, Tuple
from gesture_engine import GestureEngine, Landmark

class MouseController:
    THUMB_TIP = 4
    INDEX_TIP = 8
    RING_TIP = 16

    def __init__(self):
        self.ge = GestureEngine()

        self.screen_width, self.screen_height = pyautogui.size()

        self.mouse_mode_enabled = False
        self.last_mode_toggle_time = 0
        self.mode_toggle_cooldown = 1.0

        self.smooth_factor = 0.3
        self.smoothed_x = 0.5
        self.smoothed_y = 0.5

        self.min_x = 0.3
        self.max_x = 0.7
        self.min_y = 0.3
        self.max_y = 0.7
        self.calibration_frames = 0
        self.calibration_complete = False

        self.pinch_active = False
        self.pinch_start_time = 0
        self.is_drawing = False
        self.draw_confirm_time = 0.35
        self.last_click_time = 0
        self.click_cooldown = 0.3

        self.last_click_was_single = False
        self.double_click_window = 0.4

        self.ring_pinch_active = False
        self.ring_pinch_start_time = 0
        self.last_right_click_time = 0
        self.right_click_cooldown = 0.3

        self.last_scroll_time = 0
        self.scroll_interval = 0.05
        self.scroll_active = False
        self.scroll_direction = 0

        pyautogui.FAILSAFE = False
        pyautogui.PAUSE = 0.01

    def _calculate_distance(self, point1: Landmark, point2: Landmark) -> float:
        return math.sqrt(
            (point1.x - point2.x) ** 2 +
            (point1.y - point2.y) ** 2 +
            (point1.z - point2.z) ** 2
        )

    def _is_pinch(self, hand_landmarks: List[Landmark]) -> bool:
        distance = self._calculate_distance(
            hand_landmarks[self.THUMB_TIP],
            hand_landmarks[self.INDEX_TIP]
        )
        return distance < 0.06

    def _is_ring_pinch(self, hand_landmarks: List[Landmark]) -> bool:
        thumb_ring_dist = self._calculate_distance(
            hand_landmarks[self.THUMB_TIP],
            hand_landmarks[self.RING_TIP]
        )
        thumb_index_dist = self._calculate_distance(
            hand_landmarks[self.THUMB_TIP],
            hand_landmarks[self.INDEX_TIP]
        )
        return thumb_ring_dist < 0.07 and thumb_index_dist > 0.08

    def toggle_mouse_mode(self, hand_landmarks: List[Landmark]) -> bool:
        current_time = time.time()

        if current_time - self.last_mode_toggle_time < self.mode_toggle_cooldown:
            return False

        if self.ge._is_l_shape(hand_landmarks):
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
                self.ring_pinch_active = False
                self.scroll_active = False

        return self.mouse_mode_enabled
    
    def normalize_to_screen(self, normalized_x: float, normalized_y: float, full_range: bool = False) -> Tuple[int, int]:
        if full_range:
            screen_x = int(normalized_x * self.screen_width)
            screen_y = int(normalized_y * self.screen_height)
            return screen_x, screen_y

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
        screen_x, screen_y = self.normalize_to_screen(smoothed_x, smoothed_y, full_range=self.is_drawing)

        try:
            pyautogui.moveTo(screen_x, screen_y, _pause=False)
        except Exception as e:
            print(f"Mouse move error: {e}")

    def handle_pinch(self, hand_landmarks: List[Landmark]) -> Tuple[bool, bool, bool]:
        if not self.mouse_mode_enabled:
            return False, False, False

        current_time = time.time()
        is_pinching = self._is_pinch(hand_landmarks)
        clicked = False
        double_clicked = False
        drawing_changed = False

        if is_pinching:
            if not self.pinch_active:
                self.pinch_active = True
                self.pinch_start_time = current_time
            elif not self.is_drawing:
                held_duration = current_time - self.pinch_start_time
                if held_duration > self.draw_confirm_time:
                    pyautogui.mouseDown()
                    self.is_drawing = True
                    drawing_changed = True
        else:
            if self.pinch_active:
                held_duration = current_time - self.pinch_start_time
                self.pinch_active = False

                if self.is_drawing:
                    pyautogui.mouseUp()
                    self.is_drawing = False
                    drawing_changed = True
                elif held_duration < self.draw_confirm_time:
                    if current_time - self.last_click_time < self.double_click_window:
                        pyautogui.doubleClick()
                        self.last_click_time = 0
                        self.last_click_was_single = False
                        double_clicked = True
                    elif current_time - self.last_click_time > self.click_cooldown:
                        pyautogui.click()
                        self.last_click_time = current_time
                        self.last_click_was_single = True
                        clicked = True

        return clicked, double_clicked, drawing_changed

    def handle_right_click(self, hand_landmarks: List[Landmark]) -> bool:
        if not self.mouse_mode_enabled:
            return False

        current_time = time.time()
        is_ring_pinching = self._is_ring_pinch(hand_landmarks)

        if is_ring_pinching:
            if not self.ring_pinch_active:
                self.ring_pinch_active = True
                self.ring_pinch_start_time = current_time
        else:
            if self.ring_pinch_active:
                held_duration = current_time - self.ring_pinch_start_time
                self.ring_pinch_active = False

                if (held_duration < self.draw_confirm_time and
                    current_time - self.last_right_click_time > self.right_click_cooldown):
                    pyautogui.rightClick()
                    self.last_right_click_time = current_time
                    return True

        return False

    def check_scroll(self, hand_landmarks: List[Landmark]) -> int:
        if not self.mouse_mode_enabled:
            self.scroll_active = False
            return 0

        current_time = time.time()

        if current_time - self.last_scroll_time < self.scroll_interval:
            return self.scroll_direction if self.scroll_active else 0

        if self.ge._is_three_fingers_up(hand_landmarks):
            if not self.scroll_active:
                self.scroll_active = True
                self.scroll_direction = 1
                pyautogui.scroll(15)
                self.last_scroll_time = current_time
                return 1

            pyautogui.scroll(5)
            self.last_scroll_time = current_time
            return 1

        elif self.ge._is_inverted_victory(hand_landmarks):
            if not self.scroll_active:
                self.scroll_active = True
                self.scroll_direction = -1
                pyautogui.scroll(-15)
                self.last_scroll_time = current_time
                return -1

            pyautogui.scroll(-5)
            self.last_scroll_time = current_time
            return -1

        else:
            self.scroll_active = False
            return 0

    def get_mode_status(self) -> str:
        if self.mouse_mode_enabled:
            if self.is_drawing:
                return "DRAWING"
            if self.scroll_active:
                return "SCROLLING " + ("UP" if self.scroll_direction > 0 else "DOWN")
            return "MOUSE ON"
        return "MOUSE OFF"

    def get_mode_color(self) -> Tuple[int, int, int]:
        if self.mouse_mode_enabled:
            if self.is_drawing:
                return (255, 0, 0)
            if self.scroll_active:
                return (255, 255, 0)
            return (0, 255, 0)
        return (0, 165, 255)
