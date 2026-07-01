import random

from PyQt6.QtCore import QTimer, QPropertyAnimation, QPoint, QEasingCurve, pyqtSignal, QObject

VIEWPORT_W = 200
VIEWPORT_H = 200


class PatrolController(QObject):
    patrolMoving = pyqtSignal(bool)

    def __init__(self, window, animate=False):
        super().__init__()
        self.window = window
        self.animate = animate
        self.timer = QTimer()
        self.timer.setInterval(3000)
        self.timer.timeout.connect(self._move_random)
        self._animation = None

    def start(self):
        self._move_random()
        self.timer.start(3000)

    def stop(self):
        self.timer.stop()
        if self._animation:
            self._animation.stop()
            self._animation = None
            self.patrolMoving.emit(False)

    def resume(self):
        self.stop()
        self.start()

    def _move_random(self):
        if self.window is None:
            return

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

        if self.animate:
            current = self.window.pos()
            target = QPoint(new_x, new_y)

            if self._animation:
                self._animation.stop()

            self._animation = QPropertyAnimation(self.window, b"pos")
            self._animation.setStartValue(current)
            self._animation.setEndValue(target)
            self._animation.setDuration(1500)
            self._animation.setEasingCurve(QEasingCurve.Type.InOutQuad)
            self._animation.finished.connect(self._on_move_finished)

            self.patrolMoving.emit(True)
            self._animation.start()
        else:
            self.window.move(new_x, new_y)

    def _on_move_finished(self):
        self.patrolMoving.emit(False)
