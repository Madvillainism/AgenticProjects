import os
import sys
import json

from PyQt6.QtCore import Qt, QRect, QUrl, QPoint, QTimer
from PyQt6.QtGui import QGuiApplication
from PyQt6.QtWebEngineCore import QWebEngineSettings, QWebEnginePage
from PyQt6.QtWebEngineWidgets import QWebEngineView
from PyQt6.QtWidgets import QMainWindow, QApplication

from bridge import _read_txt, _write_txt
from patrol import PatrolController

SPRITE_ZONE_W = 44
SPRITE_ZONE_H = 44


class BridgePage(QWebEnginePage):
    """Intercepts bridge:// URLs for JS→Python IPC, no QWebChannel."""

    def __init__(self, window, parent=None):
        super().__init__(parent)
        self._window = window

    def acceptNavigationRequest(self, url: QUrl, nav_type, is_main_frame):
        if url.scheme() == "bridge":
            path = url.path().strip("/")
            parts = path.split("/") if path else []
            if len(parts) < 2:
                return False
            method = parts[0]
            call_id = parts[1]
            args = parts[2:]

            if method == "loadConfig":
                data = _read_txt()
                js = json.dumps(json.dumps(data))
                self.runJavaScript(f"window.bridge._resolve({call_id}, {js})")
            elif method == "saveConfig" and len(args) >= 2:
                d = _read_txt()
                d[args[0]] = args[1]
                _write_txt(d)
                self.runJavaScript(f"window.bridge._resolve({call_id})")
            elif method == "startApp":
                self._window._start_services()
                self.runJavaScript(f"window.bridge._resolve({call_id})")
            elif method == "closeApp":
                self.runJavaScript(f"window.bridge._resolve({call_id})")
                QTimer.singleShot(100, self._window.close)

            return False
        return super().acceptNavigationRequest(url, nav_type, is_main_frame)


class DeskDogWindow(QMainWindow):

    def __init__(self):
        super().__init__()

        self.setWindowFlags(
            Qt.WindowType.FramelessWindowHint
            | Qt.WindowType.WindowStaysOnTopHint
        )
        self.setAttribute(Qt.WidgetAttribute.WA_TranslucentBackground)
        self.setStyleSheet("background: transparent;")
        self.resize(150, 150)

        self.view = QWebEngineView(self)
        self.view.setAttribute(Qt.WidgetAttribute.WA_TranslucentBackground)
        self.bridge_page = BridgePage(self)
        self.view.setPage(self.bridge_page)
        self.bridge_page.setBackgroundColor(Qt.GlobalColor.transparent)
        self.setCentralWidget(self.view)

        if getattr(sys, "frozen", False) and hasattr(sys, "_MEIPASS"):
            base = sys._MEIPASS
        else:
            base = os.path.dirname(os.path.abspath(__file__))
        index_path = os.path.join(base, "frontend/dist/index.html")

        settings = self.view.page().settings()
        settings.setAttribute(
            QWebEngineSettings.WebAttribute.LocalContentCanAccessRemoteUrls, True
        )

        self.view.page().loadFinished.connect(self._on_page_loaded)
        self.view.setUrl(QUrl.fromLocalFile(index_path))

        self.setMouseTracking(True)
        self.view.setMouseTracking(True)

        self.patrol_controller = PatrolController(self, animate=True)
        self.patrol_controller.patrolMoving.connect(self._on_patrol_moving)

    def _on_page_loaded(self, ok):
        if not ok:
            return
        QTimer.singleShot(500, lambda: self.view.page().runJavaScript(
            "if (window.bridge) { window.bridge._ready = true; }"
        ))

    def _on_patrol_moving(self, moving):
        self.view.page().runJavaScript(
            f"if (window.bridge) {{ window.bridge._onPatrolMoving({str(moving).lower()}); }}"
        )

    def _start_services(self):
        self.patrol_controller.start()

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

    def closeEvent(self, event):
        self.patrol_controller.stop()
        super().closeEvent(event)


if __name__ == "__main__":
    import signal
    signal.signal(signal.SIGINT, signal.SIG_DFL)
    app = QApplication(sys.argv)
    window = DeskDogWindow()
    window.show()
    sys.exit(app.exec())
