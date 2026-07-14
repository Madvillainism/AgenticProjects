import os
import sys
import winsound
from logger import get_logger

def _resource_path(path):
    try:
        base = sys._MEIPASS
    except AttributeError:
        base = os.path.dirname(os.path.abspath(__file__))
    return os.path.join(base, path)

SOUNDS_DIR = _resource_path("sounds")

class SoundManager:
    def __init__(self):
        self.enabled = True
        self._cache = {}

    def play(self, name):
        if not self.enabled:
            return
        path = self._cache.get(name)
        if path is None:
            path = os.path.join(SOUNDS_DIR, f"{name}.wav")
            self._cache[name] = path
        if not os.path.exists(path):
            return
        try:
            winsound.PlaySound(path, winsound.SND_FILENAME | winsound.SND_ASYNC | winsound.SND_NOSTOP)
        except Exception:
            pass

    def toggle(self):
        self.enabled = not self.enabled
        get_logger().info("Sounds %s", "enabled" if self.enabled else "disabled")
        return self.enabled
