import os
import sys

from PyQt6.QtCore import Qt, QTimer, QRect, QPoint, QUrl
from PyQt6.QtGui import QGuiApplication
from PyQt6.QtWebChannel import QWebChannel
from PyQt6.QtWebEngineCore import QWebEngineSettings
from PyQt6.QtWebEngineWidgets import QWebEngineView
from PyQt6.QtWidgets import QMainWindow, QApplication

from bridge import DeskDogBridge
from patrol import PatrolController

SPRITE_ZONE_W = 86
SPRITE_ZONE_H = 86


class DeskDogWindow(QMainWindow):

    def __init__(self):
        super().__init__()

        self.setWindowFlags(
            Qt.WindowType.FramelessWindowHint
            | Qt.WindowType.WindowStaysOnTopHint
        )
        self.setAttribute(Qt.WidgetAttribute.WA_TranslucentBackground)
        self.setStyleSheet("background: transparent;")
        self.resize(200, 200)

        self.view = QWebEngineView(self)
        self.view.setAttribute(Qt.WidgetAttribute.WA_TranslucentBackground)
        self.view.page().setBackgroundColor(Qt.GlobalColor.transparent)
        self.setCentralWidget(self.view)

        if getattr(sys, "frozen", False) and hasattr(sys, "_MEIPASS"):
            base = sys._MEIPASS
        else:
            base = os.path.dirname(os.path.abspath(__file__))
        index_path = os.path.join(base, "frontend/dist/index.html")
        self.view.setUrl(QUrl.fromLocalFile(index_path))

        settings = self.view.page().settings()
        settings.setAttribute(
            QWebEngineSettings.WebAttribute.LocalContentCanAccessRemoteUrls, True
        )

        self.bridge = DeskDogBridge(self)
        channel = QWebChannel()
        channel.registerObject("bridge", self.bridge)
        self.view.page().setWebChannel(channel)

        self.setMouseTracking(True)
        self.view.setMouseTracking(True)

        self.patrol_controller = PatrolController(self, animate=True)
        self.bridge.patrolResume.connect(self.patrol_controller.resume)
        self.patrol_controller.patrolMoving.connect(
            lambda moving: self.bridge.patrolMoving.emit(moving)
        )
        self.patrol_controller.start()

        self.health_timer = QTimer()
        self.health_timer.timeout.connect(self._show_health_bubble)
        self.health_timer.start(1500000)
        self.health_mode = "normal"

        self.bridge.healthIntervalChanged.connect(self._set_health_mode)
        self.bridge.closeRequested.connect(self.close)

    def mouseMoveEvent(self, event):
        sprite_zone = QRect(
            (self.width() - SPRITE_ZONE_W) // 2,
            (self.height() - SPRITE_ZONE_H) // 2,
            SPRITE_ZONE_W,
            SPRITE_ZONE_H,
        )
        if sprite_zone.contains(event.position().toPoint()):
            self.setAttribute(
                Qt.WidgetAttribute.WA_TransparentForMouseEvents, False
            )
        else:
            self.setAttribute(
                Qt.WidgetAttribute.WA_TransparentForMouseEvents, True
            )
        super().mouseMoveEvent(event)

    def _show_health_bubble(self):
        self.view.page().runJavaScript("window.showHealthBubble?.()")

    def _set_health_mode(self, mode: str):
        self.health_mode = mode
        self.health_timer.stop()
        interval = 10000 if mode == "test" else 600000
        self.health_timer.start(interval)
        self.view.page().runJavaScript(f'window.setHealthMode?.("{mode}")')

    def closeEvent(self, event):
        self.patrol_controller.stop()
        self.health_timer.stop()
        super().closeEvent(event)


if __name__ == "__main__":
    import sys
    app = QApplication(sys.argv)
    window = DeskDogWindow()
    window.show()
    sys.exit(app.exec())
