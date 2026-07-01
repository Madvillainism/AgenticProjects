from PyQt6.QtCore import Qt
from PyQt6.QtWidgets import QMainWindow
from PyQt6.QtWebEngineWidgets import QWebEngineView
from main import DeskDogWindow


class TestDeskDogWindow:
    def test_window_is_qmainwindow(self, qtbot):
        window = DeskDogWindow()
        assert isinstance(window, QMainWindow)

    def test_window_has_translucent_background(self, qtbot):
        window = DeskDogWindow()
        assert window.testAttribute(Qt.WidgetAttribute.WA_TranslucentBackground)

    def test_window_has_correct_flags(self, qtbot):
        window = DeskDogWindow()
        flags = window.windowFlags()
        assert flags & Qt.WindowType.FramelessWindowHint
        assert flags & Qt.WindowType.WindowStaysOnTopHint

    def test_window_has_webengine_view(self, qtbot):
        window = DeskDogWindow()
        assert isinstance(window.view, QWebEngineView)
        assert window.centralWidget() is window.view

    def test_bridge_is_connected(self, qtbot):
        window = DeskDogWindow()
        assert window.bridge is not None

    def test_patrol_controller_exists(self, qtbot):
        window = DeskDogWindow()
        assert window.patrol_controller is not None

    def test_health_timer_exists(self, qtbot):
        window = DeskDogWindow()
        assert window.health_timer is not None
        assert window.health_timer.interval() == 1500000

    def test_transparent_for_input_default(self, qtbot):
        window = DeskDogWindow()
        assert not window.testAttribute(Qt.WidgetAttribute.WA_TransparentForMouseEvents)
