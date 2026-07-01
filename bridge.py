import os

from PyQt6.QtCore import QObject, pyqtSlot, pyqtSignal

DATA_DIR = os.path.dirname(os.path.abspath(__file__))
CONFIG_PATH = os.path.join(DATA_DIR, "config.txt")


def _read_txt() -> dict[str, str]:
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
    with open(CONFIG_PATH, "w") as f:
        for k, v in data.items():
            f.write(f"{k}={v}\n")


class DeskDogBridge(QObject):

    closeRequested = pyqtSignal()
    patrolMoving = pyqtSignal(bool)

    def __init__(self, parent=None):
        super().__init__(parent)
        self._start_app_callback = None

    def setStartAppCallback(self, callback):
        self._start_app_callback = callback

    @pyqtSlot()
    def startApp(self) -> None:
        if self._start_app_callback:
            self._start_app_callback()

    @pyqtSlot(result=str)
    def loadConfig(self) -> str:
        data = _read_txt()
        import json
        return json.dumps(data)

    @pyqtSlot(str, str)
    def saveConfig(self, key: str, value: str) -> None:
        data = _read_txt()
        data[key] = value
        _write_txt(data)

    @pyqtSlot()
    def closeApp(self) -> None:
        self.closeRequested.emit()
