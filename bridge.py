import json
import os
from datetime import datetime

from PyQt6.QtCore import QObject, pyqtSlot, pyqtSignal


DATA_DIR = os.path.dirname(os.path.abspath(__file__))


class DeskDogBridge(QObject):
    patrolResume = pyqtSignal()
    closeRequested = pyqtSignal()

    def __init__(self, parent=None):
        super().__init__(parent)

    @pyqtSlot(str, str)
    def saveConfig(self, key: str, value: str) -> None:
        path = os.path.join(DATA_DIR, "config.json")
        try:
            with open(path, "r") as f:
                data = json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            data = {}
        data[key] = value
        with open(path, "w") as f:
            json.dump(data, f, indent=2)

    @pyqtSlot()
    def closeApp(self) -> None:
        self.closeRequested.emit()

    @pyqtSlot()
    def logWater(self) -> None:
        path = os.path.join(DATA_DIR, "water_log.json")
        entry = {"timestamp": datetime.now().isoformat()}
        try:
            with open(path, "r") as f:
                log = json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            log = []
        log.append(entry)
        with open(path, "w") as f:
            json.dump(log, f, indent=2)
        self.patrolResume.emit()

    @pyqtSlot()
    def dismissBubble(self) -> None:
        self.patrolResume.emit()
