---
name: mediapipe-hand-gestures
description: MediaPipe hand gesture recognition expertise. Use when debugging hand tracking, adjusting gesture detection, implementing new gestures, or working with hand landmarks.
---

# MediaPipe Hand Gestures

## Hand Landmark Indices (21 points)

| Index | Name | Use Case |
|-------|------|----------|
| 0 | WRIST | Reference point for thumb distance |
| 1 | THUMB_CMC | Thumb base |
| 2 | THUMB_MCP | Thumb joint |
| 3 | THUMB_IP | Thumb intermediate joint |
| 4 | THUMB_TIP | Thumb tip - extension detection |
| 5 | INDEX_MCP | Index finger base |
| 6 | INDEX_PIP | Index finger joint |
| 7 | INDEX_DIP | Index finger intermediate joint |
| 8 | INDEX_TIP | Index finger tip - extension detection |
| 9 | MIDDLE_MCP | Middle finger base |
| 10 | MIDDLE_PIP | Middle finger joint |
| 11 | MIDDLE_DIP | Middle finger intermediate joint |
| 12 | MIDDLE_TIP | Middle finger tip - extension detection |
| 13 | RING_MCP | Ring finger base |
| 14 | RING_PIP | Ring finger joint |
| 15 | RING_DIP | Ring finger intermediate joint |
| 16 | RING_TIP | Ring finger tip - extension detection |
| 17 | PINKY_MCP | Pinky finger base |
| 18 | PINKY_PIP | Pinky finger joint |
| 19 | PINKY_DIP | Pinky finger intermediate joint |
| 20 | PINKY_TIP | Pinky finger tip - extension detection |

## Gesture Detection Logic

### Thumbs Up
```python
# Conditions:
1. Thumb tip Y < Thumb IP Y (extended upward)
2. All other fingers curled (tips below PIPs)
3. Wrist-to-thumb distance > 0.15
```

### Thumbs Down
```python
# Conditions:
1. Thumb tip Y > Thumb IP Y (extended downward)
2. All other fingers curled (tips below PIPs)
3. Wrist-to-thumb distance > 0.15
```

### Victory/Peace Sign
```python
# Conditions:
1. Index finger extended (tip Y < PIP Y)
2. Middle finger extended (tip Y < PIP Y)
3. Ring finger curled (tip Y > PIP Y)
4. Pinky curled (tip Y > PIP Y)
```

### Open Palm
```python
# Conditions:
1. Index finger extended
2. Middle finger extended
3. Ring finger extended
4. Pinky extended
```

## Confidence Thresholds

### Default Settings (Phase 1)
```python
min_hand_detection_confidence = 0.7
min_hand_presence_confidence = 0.7
min_tracking_confidence = 0.7
```

### Tuning Guidelines
- **Increase thresholds** when: False positives, jittery landmarks
- **Decrease thresholds** when: Missing detections, tracking loss
- **Adjustment step**: 0.1 increments

## Common Issues

### False Positives
**Symptom**: Gestures detected when no hand is present
**Solutions**:
1. Increase `min_hand_detection_confidence`
2. Increase `min_tracking_confidence`
3. Add minimum distance threshold for thumb gestures

### Tracking Loss
**Symptom**: Landmarks disappear for several frames
**Solutions**:
1. Ensure hand is fully visible in frame
2. Maintain consistent lighting
3. Avoid rapid hand movements

### Jittery Landmarks
**Symptom**: Landmarks jump between frames
**Solutions**:
1. Apply smoothing filter
2. Increase tracking confidence
3. Use lower model complexity

## Image Overlay System

### Loading Images
```python
def load_overlay_images():
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
            images[gesture_name] = cv2.resize(img, (150, 150))
    return images
```

### Alpha Blending
```python
def overlay_image(frame, overlay, position, alpha=0.8):
    x, y = position
    h, w = overlay.shape[:2]
    
    if overlay.shape[2] == 4:  # Has alpha channel
        overlay_rgb = overlay[:, :, :3]
        overlay_alpha = overlay[:, :, 3] / 255.0
        overlay_alpha_3d = np.stack([overlay_alpha] * 3, axis=-1)
        
        roi = frame[y:y+h, x:x+w]
        blended = (overlay_alpha_3d * overlay_rgb + 
                   (1 - overlay_alpha_3d) * roi).astype(np.uint8)
        frame[y:y+h, x:x+w] = blended
    
    return frame
```

## Performance Optimization

1. Use `model_complexity=0` for fastest inference
2. Process every Nth frame for batch analysis
3. Limit overlay image size to 150x150 pixels
4. Cache loaded images to avoid repeated file I/O

### Open Palm
```python
# Conditions:
1. Index finger extended
2. Middle finger extended
3. Ring finger extended
4. Pinky extended
```

### L-Shape (Mouse Mode Toggle)
```python
# Conditions:
1. Thumb extended outward (distance from wrist > 0.15)
2. Index finger extended upward (tip Y < PIP Y)
3. Middle, Ring, Pinky curled (tips > PIPs)
4. Angle between thumb and index: 60-120 degrees
```

## Mouse Control (Phase 3)

### Mouse Mode Activation
- **Gesture**: L-Shape (thumb + index extended at ~90°, others curled)
- **Toggle**: Show L-shape to enable/disable mouse mode
- **Cooldown**: 1 second between toggles

### Cursor Movement
- **Tracking point**: Index finger tip (landmark 8)
- **Smoothing**: Exponential moving average (factor: 0.4)
- **Calibration**: Auto-adjusts bounds during first 30 frames

### Click Detection
- **Gesture**: Pinch (thumb tip + index tip distance < 0.06)
- **Quick pinch**: Single click (duration < 0.35s)
- **Two quick pinches**: Double click (within 0.4s)
- **Cooldown**: 0.3 seconds between clicks

### Drawing Mode
- **Gesture**: Pinch held (hold pinch for 0.35 seconds)
- **Action**: mouseDown() - enables drawing in MS Paint
- **Release**: Open hand to stop drawing (mouseUp())
- **Visual indicator**: "DRAWING" text in blue, blue circle around index tip
- **Flow**: Pinch, hold, draw line, release, pinch again for new line

### Scroll Detection
- **Scroll Up**: All 5 fingers extended upward
- **Scroll Down**: All 5 fingers extended downward
- **Cooldown**: 0.15 seconds between scrolls
- **Visual indicator**: "SCROLL UP/DOWN" in yellow

### Visual Indicators
- **Status bar**: Bottom of screen shows mouse mode status
- **Mouse mode ON**: "MOUSE ON" in green
- **Drawing mode**: "DRAWING" in blue
- **Mouse mode OFF**: "MOUSE OFF" in orange
- **Click**: "CLICK!" in red
- **Double click**: "DOUBLE CLICK!" in magenta
- **Scroll up/down**: "SCROLL UP/DOWN" in yellow
- **Hand landmarks**: Yellow when mouse mode ON, green when OFF
- **Drawing indicator**: Blue circle around index finger tip

### Safety Features
- **FAILSAFE**: Move mouse to screen corner to abort
- **Bounds checking**: Prevents cursor from going off-screen

## Integration with CV-Gestures

### File Locations
- Gesture detection: `gesture_engine.py`
- Mouse control: `mouse_controller.py`
- Main application: `main.py`
- Overlay images: `assets/images/`
- Hand model: `models/hand_landmarker.task`

### Typical Pipeline
```
Camera → MediaPipe → Landmarks → Gesture Detection → Mouse Control/Image Overlay → Display
```