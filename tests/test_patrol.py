from PyQt6.QtCore import QTimer
from patrol import PatrolController, VIEWPORT_W, VIEWPORT_H


class _StubWindow:
    def move(self, x, y):
        pass


class TestPatrolController:
    def test_creates_timer(self, qtbot):
        patrol = PatrolController(None)
        assert isinstance(patrol.timer, QTimer)
        assert not patrol.timer.isActive()
        assert patrol.timer.interval() == 3000

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
        assert VIEWPORT_W == 200
        assert VIEWPORT_H == 200
