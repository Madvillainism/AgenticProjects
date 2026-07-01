import random

from PyQt6.QtCore import QTimer

VIEWPORT_W = 200
VIEWPORT_H = 200


class PatrolController:
    def __init__(self, window):
        self.window = window
        self.timer = QTimer()
        self.timer.timeout.connect(self._move_random)

    def start(self):
        self._move_random()
        self.timer.start(3000)

    def stop(self):
        self.timer.stop()

    def resume(self):
        self.stop()
        self.start()

    def _move_random(self):
        try:
            from screeninfo import get_monitors
            monitor = get_monitors()[0]
            max_w = monitor.width
            max_h = monitor.height
        except ImportError:
            from PyQt6.QtGui import QGuiApplication
            screen = QGuiApplication.primaryScreen()
            if screen is None:
                return
            geo = screen.availableGeometry()
            max_w = geo.width()
            max_h = geo.height()

        max_x = max(max_w - VIEWPORT_W, 0)
        max_y = max(max_h - VIEWPORT_H, 0)

        new_x = random.randint(0, max_x)
        new_y = random.randint(0, max_y)
        self.window.move(new_x, new_y)
