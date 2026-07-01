import os
import sys

from PyQt6.QtCore import Qt, QRect, QUrl, QPoint
from PyQt6.QtGui import QGuiApplication
from PyQt6.QtWebChannel import QWebChannel
from PyQt6.QtWebEngineCore import QWebEngineSettings
from PyQt6.QtWebEngineWidgets import QWebEngineView
from PyQt6.QtWidgets import QMainWindow, QApplication

from bridge import DeskDogBridge
from patrol import PatrolController

# Tamaño de la zona donde el sprite acepta clics.
# Son 44 px centrados — juste para el sprite de 44×44.
SPRITE_ZONE_W = 44
SPRITE_ZONE_H = 44


class DeskDogWindow(QMainWindow):

    def __init__(self):
        super().__init__()

        # Una ventana sin bordes, siempre al frente y transparente.
        # Así la mascota flota sobre el escritorio.
        self.setWindowFlags(
            Qt.WindowType.FramelessWindowHint
            | Qt.WindowType.WindowStaysOnTopHint
        )
        self.setAttribute(Qt.WidgetAttribute.WA_TranslucentBackground)
        self.setStyleSheet("background: transparent;")
        self.resize(150, 150)

        # El QWebEngineView es un Chrome en miniatura embebido.
        # Carga el frontend (HTML+CSS+JS) y lo muestra con
        # fondo transparente para que solo se vea el sprite.
        self.view = QWebEngineView(self)
        self.view.setAttribute(Qt.WidgetAttribute.WA_TranslucentBackground)
        self.view.page().setBackgroundColor(Qt.GlobalColor.transparent)
        self.setCentralWidget(self.view)

        # Detecta si corremos como .exe (PyInstaller) o en desarrollo.
        # _MEIPASS es la carpeta temporal donde PyInstaller extrae los archivos.
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

        # QWebChannel conecta JavaScript con Python.
        # Registramos el objeto "bridge" para que el frontend
        # pueda llamar bridge.startApp(), bridge.loadConfig(), etc.
        self.bridge = DeskDogBridge(self)
        channel = QWebChannel()
        channel.registerObject("bridge", self.bridge)
        self.view.page().setWebChannel(channel)

        # Mouse tracking necesario para saber dónde está el cursor
        # y activar/desactivar la zona de clic.
        self.setMouseTracking(True)
        self.view.setMouseTracking(True)

        # PatrolController mueve la ventana aleatoriamente.
        # Arranca pausado — solo se activa cuando el frontend
        # llama bridge.startApp() tras la adopción.
        self.patrol_controller = PatrolController(self, animate=True)
        self.bridge.patrolResume = None

        # Cuando patrol empieza a moverse, avisa al frontend
        # para que cambie el sprite de idle a walking.
        self.patrol_controller.patrolMoving.connect(
            lambda moving: self.bridge.patrolMoving.emit(moving)
        )

        # Registra el callback que arranca el patrol.
        self.bridge.setStartAppCallback(self._start_services)
        self.bridge.closeRequested.connect(self.close)

    def _start_services(self):
        # Este método se llama DESPUÉS de que el usuario elige mascota.
        # Arranca el timer de caminata aleatoria.
        self.patrol_controller.start()

    def mouseMoveEvent(self, event):
        # Zona de 44×44 px centrada en la ventana de 150×150.
        sprite_zone = QRect(
            (self.width() - SPRITE_ZONE_W) // 2,
            (self.height() - SPRITE_ZONE_H) // 2,
            SPRITE_ZONE_W,
            SPRITE_ZONE_H,
        )
        # Si el mouse está sobre el sprite, activamos clics.
        # Si está afuera, los clics atraviesan la ventana
        # (podés hacer clic en ventanas que están detrás).
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
        # Detiene el timer de patrol para que el programa termine limpio.
        self.patrol_controller.stop()
        super().closeEvent(event)


if __name__ == "__main__":
    import sys
    app = QApplication(sys.argv)
    window = DeskDogWindow()
    window.show()
    sys.exit(app.exec())
