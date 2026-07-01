import json
import os
from pathlib import Path
from bridge import DeskDogBridge


class TestDeskDogBridge:
    def test_save_config_creates_file(self, qtbot):
        bridge = DeskDogBridge()
        key, value = "test_key", "test_value"
        bridge.saveConfig(key, value)
        config_path = Path(__file__).parent.parent / "config.json"
        assert config_path.exists()
        data = json.loads(config_path.read_text())
        assert data[key] == value
        config_path.unlink(missing_ok=True)

    def test_save_config_overwrites_key(self, qtbot):
        bridge = DeskDogBridge()
        bridge.saveConfig("theme", "dark")
        bridge.saveConfig("theme", "light")
        config_path = Path(__file__).parent.parent / "config.json"
        data = json.loads(config_path.read_text())
        assert data["theme"] == "light"
        config_path.unlink(missing_ok=True)

    def test_closeApp_emits_signal(self, qtbot):
        bridge = DeskDogBridge()
        with qtbot.waitSignal(bridge.closeRequested, timeout=1000) as blocker:
            bridge.closeApp()
        assert blocker.signal_triggered

    def test_logWater_creates_log_entry(self, qtbot):
        bridge = DeskDogBridge()
        bridge.logWater()
        log_path = Path(__file__).parent.parent / "water_log.json"
        assert log_path.exists()
        data = json.loads(log_path.read_text())
        assert len(data) == 1
        assert "timestamp" in data[0]
        log_path.unlink(missing_ok=True)

    def test_logWater_appends_multiple(self, qtbot):
        bridge = DeskDogBridge()
        bridge.logWater()
        bridge.logWater()
        log_path = Path(__file__).parent.parent / "water_log.json"
        data = json.loads(log_path.read_text())
        assert len(data) == 2
        log_path.unlink(missing_ok=True)

    def test_logWater_emits_patrolResume(self, qtbot):
        bridge = DeskDogBridge()
        with qtbot.waitSignal(bridge.patrolResume, timeout=1000) as blocker:
            bridge.logWater()
        assert blocker.signal_triggered
        Path(Path(__file__).parent.parent / "water_log.json").unlink(missing_ok=True)

    def test_dismissBubble_emits_patrolResume(self, qtbot):
        bridge = DeskDogBridge()
        with qtbot.waitSignal(bridge.patrolResume, timeout=1000) as blocker:
            bridge.dismissBubble()
        assert blocker.signal_triggered

    def test_setHealthInterval_emits_signal_with_mode(self, qtbot):
        bridge = DeskDogBridge()
        with qtbot.waitSignal(bridge.healthIntervalChanged, timeout=1000) as blocker:
            bridge.setHealthInterval("test")
        assert blocker.signal_triggered
        assert blocker.args == ["test"]

        with qtbot.waitSignal(bridge.healthIntervalChanged, timeout=1000) as blocker:
            bridge.setHealthInterval("normal")
        assert blocker.signal_triggered
        assert blocker.args == ["normal"]
