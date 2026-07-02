import numpy as np
from dataclasses import dataclass
from typing import List, Optional, Tuple

@dataclass
class Landmark:
    x: float
    y: float
    z: float

class GestureEngine:
    # MediaPipe hand landmark indices
    WRIST = 0
    THUMB_CMC = 1
    THUMB_MCP = 2
    THUMB_IP = 3
    THUMB_TIP = 4
    INDEX_MCP = 5
    INDEX_PIP = 6
    INDEX_DIP = 7
    INDEX_TIP = 8
    MIDDLE_MCP = 9
    MIDDLE_PIP = 10
    MIDDLE_DIP = 11
    MIDDLE_TIP = 12
    RING_MCP = 13
    RING_PIP = 14
    RING_DIP = 15
    RING_TIP = 16
    PINKY_MCP = 17
    PINKY_PIP = 18
    PINKY_DIP = 19
    PINKY_TIP = 20
    
    def __init__(self):
        pass
        
    def _calculate_distance(self, point1: Landmark, point2: Landmark) -> float:
        """Calculate Euclidean distance between two landmarks."""
        return np.sqrt(
            (point1.x - point2.x) ** 2 + 
            (point1.y - point2.y) ** 2 + 
            (point1.z - point2.z) ** 2
        )
    
    def _is_finger_extended(self, hand_landmarks: List[Landmark], finger_tip: int, finger_pip: int) -> bool:
        """Check if a finger is extended based on landmark positions."""
        return hand_landmarks[finger_tip].y < hand_landmarks[finger_pip].y
    
    def _is_thumb_extended_up(self, hand_landmarks: List[Landmark]) -> bool:
        """Check if thumb is extended upward."""
        return hand_landmarks[self.THUMB_TIP].y < hand_landmarks[self.THUMB_IP].y
    
    def _is_thumb_extended_down(self, hand_landmarks: List[Landmark]) -> bool:
        """Check if thumb is extended downward."""
        return hand_landmarks[self.THUMB_TIP].y > hand_landmarks[self.THUMB_IP].y
    
    def _are_other_fingers_curled(self, hand_landmarks: List[Landmark]) -> bool:
        """Check if all fingers except thumb are curled."""
        index_curled = hand_landmarks[self.INDEX_TIP].y > hand_landmarks[self.INDEX_PIP].y
        middle_curled = hand_landmarks[self.MIDDLE_TIP].y > hand_landmarks[self.MIDDLE_PIP].y
        ring_curled = hand_landmarks[self.RING_TIP].y > hand_landmarks[self.RING_PIP].y
        pinky_curled = hand_landmarks[self.PINKY_TIP].y > hand_landmarks[self.PINKY_PIP].y
        
        return index_curled and middle_curled and ring_curled and pinky_curled
    
    def _is_thumbs_up(self, hand_landmarks: List[Landmark]) -> bool:
        """Detect thumbs up gesture."""
        thumb_extended_up = self._is_thumb_extended_up(hand_landmarks)
        other_fingers_curled = self._are_other_fingers_curled(hand_landmarks)
        
        wrist_thumb_dist = self._calculate_distance(
            hand_landmarks[self.WRIST],
            hand_landmarks[self.THUMB_TIP]
        )
        
        return thumb_extended_up and other_fingers_curled and wrist_thumb_dist > 0.15
    
    def _is_thumbs_down(self, hand_landmarks: List[Landmark]) -> bool:
        """Detect thumbs down gesture."""
        thumb_extended_down = self._is_thumb_extended_down(hand_landmarks)
        other_fingers_curled = self._are_other_fingers_curled(hand_landmarks)
        
        wrist_thumb_dist = self._calculate_distance(
            hand_landmarks[self.WRIST],
            hand_landmarks[self.THUMB_TIP]
        )
        
        return thumb_extended_down and other_fingers_curled and wrist_thumb_dist > 0.15
    
    def _is_victory(self, hand_landmarks: List[Landmark]) -> bool:
        """Detect victory/peace sign gesture."""
        index_extended = self._is_finger_extended(hand_landmarks, self.INDEX_TIP, self.INDEX_PIP)
        middle_extended = self._is_finger_extended(hand_landmarks, self.MIDDLE_TIP, self.MIDDLE_PIP)
        ring_curled = hand_landmarks[self.RING_TIP].y > hand_landmarks[self.RING_PIP].y
        pinky_curled = hand_landmarks[self.PINKY_TIP].y > hand_landmarks[self.PINKY_PIP].y
        
        return index_extended and middle_extended and ring_curled and pinky_curled
    
    def _is_open_palm(self, hand_landmarks: List[Landmark]) -> bool:
        """Detect open palm gesture."""
        index_extended = self._is_finger_extended(hand_landmarks, self.INDEX_TIP, self.INDEX_PIP)
        middle_extended = self._is_finger_extended(hand_landmarks, self.MIDDLE_TIP, self.MIDDLE_PIP)
        ring_extended = self._is_finger_extended(hand_landmarks, self.RING_TIP, self.RING_PIP)
        pinky_extended = self._is_finger_extended(hand_landmarks, self.PINKY_TIP, self.PINKY_PIP)
        
        return index_extended and middle_extended and ring_extended and pinky_extended
    
    def _is_l_shape(self, hand_landmarks: List[Landmark]) -> bool:
        """Detect L-shape gesture (thumb + index extended, others curled, ~90 degree angle)."""
        # Check thumb is extended (distance from wrist)
        thumb_dist = self._calculate_distance(
            hand_landmarks[self.THUMB_TIP],
            hand_landmarks[self.WRIST]
        )
        thumb_extended = thumb_dist > 0.15
        
        # Check index finger is extended upward
        index_extended = hand_landmarks[self.INDEX_TIP].y < hand_landmarks[self.INDEX_PIP].y
        
        # Check other fingers are curled
        middle_curled = hand_landmarks[self.MIDDLE_TIP].y > hand_landmarks[self.MIDDLE_PIP].y
        ring_curled = hand_landmarks[self.RING_TIP].y > hand_landmarks[self.RING_PIP].y
        pinky_curled = hand_landmarks[self.PINKY_TIP].y > hand_landmarks[self.PINKY_PIP].y
        
        # Check angle between thumb and index (roughly 90 degrees)
        thumb_vector = np.array([
            hand_landmarks[self.THUMB_TIP].x - hand_landmarks[self.THUMB_MCP].x,
            hand_landmarks[self.THUMB_TIP].y - hand_landmarks[self.THUMB_MCP].y
        ])
        index_vector = np.array([
            hand_landmarks[self.INDEX_TIP].x - hand_landmarks[self.INDEX_MCP].x,
            hand_landmarks[self.INDEX_TIP].y - hand_landmarks[self.INDEX_MCP].y
        ])
        
        # Calculate angle between vectors
        cos_angle = np.dot(thumb_vector, index_vector) / (
            np.linalg.norm(thumb_vector) * np.linalg.norm(index_vector) + 1e-6
        )
        angle = np.degrees(np.arccos(np.clip(cos_angle, -1.0, 1.0)))
        
        # Angle should be roughly 90 degrees (60-120 tolerance)
        angle_ok = 60 < angle < 120
        
        return thumb_extended and index_extended and middle_curled and ring_curled and pinky_curled and angle_ok
    
    def get_index_finger_position(self, hand_landmarks: List[Landmark]) -> Tuple[float, float]:
        """Get normalized position of index finger tip."""
        return (hand_landmarks[self.INDEX_TIP].x, hand_landmarks[self.INDEX_TIP].y)
    
    def detect_gesture_from_landmarks(self, hand_landmarks: List[Landmark]) -> Optional[str]:
        """Detect basic hand gestures using mathematical landmark analysis."""
        
        if self._is_l_shape(hand_landmarks):
            return "L-Shape"
        
        if self._is_thumbs_up(hand_landmarks):
            return "Thumbs Up"
        
        if self._is_thumbs_down(hand_landmarks):
            return "Thumbs Down"
        
        if self._is_victory(hand_landmarks):
            return "Victory"
        
        if self._is_open_palm(hand_landmarks):
            return "Open Palm"
        
        return None