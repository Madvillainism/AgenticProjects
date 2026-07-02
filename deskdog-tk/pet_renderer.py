import os
import sys
from PIL import Image, ImageTk
from logger import get_logger

def _resource_path(path):
    try:
        base = sys._MEIPASS
    except AttributeError:
        base = os.path.dirname(os.path.abspath(__file__))
    return os.path.join(base, path)

SPRITES_DIR = _resource_path("sprites")
FRAME_W = 44
FRAME_H = 44

class PetRenderer:
    def __init__(self, pet_type):
        self.pet_type = pet_type
        self.frames = {}
        self.photo_frames = {}
        self._load_frames()

    def _load_frames(self):
        for state in ["idle", "walking", "sleeping", "alerting"]:
            filename = f"{self.pet_type}-{state}.png"
            path = os.path.join(SPRITES_DIR, filename)
            if not os.path.exists(path):
                get_logger().warning("Sprite not found: %s", path)
                continue
            try:
                sheet = Image.open(path).convert("RGBA")
            except Exception as e:
                get_logger().warning("Cannot load sprite %s: %s", path, e)
                continue
            sw, sh = sheet.size
            n_frames = sw // FRAME_W
            pil_frames = []
            for i in range(n_frames):
                frame = sheet.crop((i * FRAME_W, 0, (i + 1) * FRAME_W, FRAME_H))
                pil_frames.append(frame)
            self.frames[state] = pil_frames
            photo_frames = [ImageTk.PhotoImage(f) for f in pil_frames]
            self.photo_frames[state] = photo_frames
            get_logger().info("Loaded %s: %d frames", state, n_frames)

    def has_state(self, state):
        return state in self.photo_frames and len(self.photo_frames[state]) > 0

    def get_frame_count(self, state):
        return len(self.photo_frames.get(state, []))

    def get_photo(self, state, frame_index):
        frames = self.photo_frames.get(state)
        if not frames:
            fallback = None
            for s in ["idle", "walking", "sleeping"]:
                if self.photo_frames.get(s):
                    fallback = self.photo_frames[s]
                    break
            if fallback:
                return fallback[frame_index % len(fallback)]
            return None
        return frames[frame_index % len(frames)]
