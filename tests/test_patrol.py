from PyQt6.QtCore import QTimer, QPoint
from PyQt6.QtWidgets import QWidget
from patrol import PatrolController, VIEWPORT_W, VIEWPORT_H, PATROL_INTERVAL


class _StubWindow(QWidget):
    def __init__(self):
        super().__init__()
        self._pos = QPoint(0, 0)

    def move(self, x, y):
        self._pos = QPoint(x, y)


class TestPatrolController:
    def test_creates_timer(self, qtbot):
        patrol = PatrolController(None)
        assert isinstance(patrol.timer, QTimer)
        assert not patrol.timer.isActive()
        assert patrol.timer.interval() == PATROL_INTERVAL

    def test_start_activates_timer(self, qtbot):
        patrol = PatrolController(_StubWindow())
        patrol.start()
        assert patrol.timer.isActive()
        patrol.stop()

    def test_stop_deactivates_timer(self, qtbot):
        patrol = PatrolController(_StubWindow())
        patrol.start()
        patrol.stop()
        assert not patrol.timer.isActive()

    def test_resume_restarts_timer(self, qtbot):
        patrol = PatrolController(_StubWindow())
        patrol.start()
        patrol.stop()
        assert not patrol.timer.isActive()
        patrol.resume()
        assert patrol.timer.isActive()
        patrol.stop()

    def test_viewport_constants_defined(self):
        assert VIEWPORT_W == 120
        assert VIEWPORT_H == 120
