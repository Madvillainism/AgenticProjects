import os

from PyQt6.QtCore import QObject, pyqtSlot, pyqtSignal

# El archivo de configuración está en la raíz del proyecto.
# Usamos formato key=value (una línea por clave) porque es
# más fácil de editar a mano que JSON.
DATA_DIR = os.path.dirname(os.path.abspath(__file__))
CONFIG_PATH = os.path.join(DATA_DIR, "config.txt")


def _read_txt() -> dict[str, str]:
    # Lee config.txt línea por línea.
    # Ignora líneas vacías y comentarios (empiezan con #).
    # Devuelve un diccionario con todas las claves.
    data: dict[str, str] = {}
    try:
        with open(CONFIG_PATH, "r") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#"):
                    continue
                if "=" in line:
                    k, _, v = line.partition("=")
                    data[k.strip()] = v.strip()
    except FileNotFoundError:
        pass
    return data


def _write_txt(data: dict[str, str]) -> None:
    # Escribe TODO el diccionario como key=value.
    # Cada línea es una clave. Reescribe el archivo completo.
    with open(CONFIG_PATH, "w") as f:
        for k, v in data.items():
            f.write(f"{k}={v}\n")


class DeskDogBridge(QObject):

    # Señales que el frontend puede escuchar.
    closeRequested = pyqtSignal()     # El frontend pide cerrar la app
    patrolMoving = pyqtSignal(bool)   # True = moviéndose, False = quieto

    def __init__(self, parent=None):
        super().__init__(parent)
        self._start_app_callback = None

    def setStartAppCallback(self, callback):
        # Guarda el callback que se ejecuta cuando el frontend
        # llama a startApp(). No arrancamos patrol hasta entonces.
        self._start_app_callback = callback

    @pyqtSlot()
    def startApp(self) -> None:
        # Lo llama el frontend después de que el usuario
        # elige tipo de mascota y nombre.
        if self._start_app_callback:
            self._start_app_callback()

    @pyqtSlot(result=str)
    def loadConfig(self) -> str:
        # Devuelve todo config.txt como JSON.
        # El frontend parsea el JSON y usa los valores.
        data = _read_txt()
        import json
        return json.dumps(data)

    @pyqtSlot(str, str)
    def saveConfig(self, key: str, value: str) -> None:
        # Lee el archivo actual, actualiza UNA clave, escribe todo.
        # Así no perdemos las otras claves.
        data = _read_txt()
        data[key] = value
        _write_txt(data)

    @pyqtSlot()
    def closeApp(self) -> None:
        # El frontend llama esto desde el menú contextual.
        # Cerramos la ventana y terminamos el proceso.
        self.closeRequested.emit()
