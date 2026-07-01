import random

from PyQt6.QtCore import QTimer, QPropertyAnimation, QPoint, QEasingCurve, pyqtSignal, QObject

# Margen de seguridad para que la ventana no se salga de la pantalla.
# La ventana nunca se posiciona a menos de 120px del borde del monitor.
VIEWPORT_W = 120
VIEWPORT_H = 120

# Tiempo entre movimientos: 12 segundos.
# La mascota camina, llega a destino, descansa 12s, vuelve a caminar.
PATROL_INTERVAL = 12000
# Duración de la animación de movimiento: 4 segundos.
# Un movimiento lento se ve más natural que uno rápido.
PATROL_ANIM_DURATION = 4000


class PatrolController(QObject):
    patrolMoving = pyqtSignal(bool)

    def __init__(self, window, animate=False):
        super().__init__()
        self.window = window
        self.animate = animate
        # Timer principal: cada PATROL_INTERVAL ms elige un destino nuevo.
        self.timer = QTimer()
        self.timer.setInterval(PATROL_INTERVAL)
        self.timer.timeout.connect(self._move_random)
        self._animation = None

    def start(self):
        # Arranca con un movimiento inmediato (no esperar 12s).
        # Luego el timer se encarga del resto.
        self._move_random()
        self.timer.start(PATROL_INTERVAL)

    def stop(self):
        # Detiene todo: timer y animación en curso.
        self.timer.stop()
        if self._animation:
            self._animation.stop()
            self._animation = None
            self.patrolMoving.emit(False)

    def resume(self):
        # Reinicia: útil si cambia la configuración de pantalla.
        self.stop()
        self.start()

    def _move_random(self):
        if self.window is None:
            return

        # Detecta el monitor principal usando screeninfo.
        # Si no está instalado, usa QGuiApplication como fallback.
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

        # Restamos el margen VIEWPORT para que la ventana
        # no se salga del borde visible.
        max_x = max(max_w - VIEWPORT_W, 0)
        max_y = max(max_h - VIEWPORT_H, 0)

        # Destino aleatorio dentro del área permitida.
        new_x = random.randint(0, max_x)
        new_y = random.randint(0, max_y)

        if self.animate:
            current = self.window.pos()
            target = QPoint(new_x, new_y)

            # Si hay una animación en curso, la frenamos.
            if self._animation:
                self._animation.stop()

            # QPropertyAnimation anima cualquier propiedad Qt.
            # En este caso, animamos la posición de la ventana.
            self._animation = QPropertyAnimation(self.window, b"pos")
            self._animation.setStartValue(current)
            self._animation.setEndValue(target)
            self._animation.setDuration(PATROL_ANIM_DURATION)
            # InOutCubic: arranque lento, acelera, frena suave.
            self._animation.setEasingCurve(QEasingCurve.Type.InOutCubic)
            self._animation.finished.connect(self._on_move_finished)

            self.patrolMoving.emit(True)
            self._animation.start()
        else:
            # Sin animación: movimiento instantáneo.
            self.window.move(new_x, new_y)

    def _on_move_finished(self):
        # Avisa al frontend que el sprite debe volver a idle.
        self.patrolMoving.emit(False)
