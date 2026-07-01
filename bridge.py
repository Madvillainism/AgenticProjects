"""Qt-Python bridge exposed to frontend via QWebChannel"""

import json
import os
from datetime import datetime

from PyQt6.QtCore import QObject, pyqtSlot, pyqtSignal


# Directory containing the bridge module
DATA_DIR = os.path.dirname(os.path.abspath(__file__))


class DeskDogBridge(QObject):
    """QObject exposing config, water logging, and close actions to the web frontend"""

    patrolResume = pyqtSignal()
    closeRequested = pyqtSignal()
    healthIntervalChanged = pyqtSignal(str)

    def __init__(self, parent=None):
        super().__init__(parent)

    @pyqtSlot(str, str)
    def saveConfig(self, key: str, value: str) -> None:
        """Persist a key-value pair to config.json"""
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
        """Emit signal to close the main window"""
        self.closeRequested.emit()

    @pyqtSlot()
    def logWater(self) -> None:
        """Append a timestamped entry to water_log.json and resume patrol"""
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
        """Re-emit patrol resume signal after bubble dismiss"""
        self.patrolResume.emit()

    @pyqtSlot(str)
    def setHealthInterval(self, mode: str) -> None:
        """Switch health timer between 'test' (40s) and 'normal' (10min)"""
        self.healthIntervalChanged.emit(mode)
