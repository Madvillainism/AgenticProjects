import json
from pathlib import Path
from bridge import DeskDogBridge, CONFIG_PATH


def _clean_config():
    Path(CONFIG_PATH).unlink(missing_ok=True)


class TestDeskDogBridge:
    def test_save_config_creates_file(self, qtbot):
        _clean_config()
        bridge = DeskDogBridge()
        key, value = "test_key", "test_value"
        bridge.saveConfig(key, value)
        assert Path(CONFIG_PATH).exists()
        lines = Path(CONFIG_PATH).read_text().strip().split("\n")
        assert f"{key}={value}" in lines
        _clean_config()

    def test_save_config_overwrites_key(self, qtbot):
        _clean_config()
        bridge = DeskDogBridge()
        bridge.saveConfig("theme", "dark")
        bridge.saveConfig("theme", "light")
        lines = Path(CONFIG_PATH).read_text().strip().split("\n")
        assert "theme=light" in lines
        assert "theme=dark" not in lines
        _clean_config()

    def test_load_config_returns_empty_if_no_file(self, qtbot):
        _clean_config()
        bridge = DeskDogBridge()
        result = bridge.loadConfig()
        assert result == "{}"

    def test_load_config_returns_saved_data(self, qtbot):
        _clean_config()
        bridge = DeskDogBridge()
        bridge.saveConfig("petType", "dog")
        bridge.saveConfig("petName", "Firulais")
        result = bridge.loadConfig()
        data = json.loads(result)
        assert data["petType"] == "dog"
        assert data["petName"] == "Firulais"
        _clean_config()

    def test_closeApp_emits_signal(self, qtbot):
        bridge = DeskDogBridge()
        with qtbot.waitSignal(bridge.closeRequested, timeout=1000) as blocker:
            bridge.closeApp()
        assert blocker.signal_triggered

    def test_startApp_calls_callback(self, qtbot):
        bridge = DeskDogBridge()
        called = False
        def cb():
            nonlocal called
            called = True
        bridge.setStartAppCallback(cb)
        bridge.startApp()
        assert called

    def test_patrolMoving_emits_signal_with_value(self, qtbot):
        bridge = DeskDogBridge()
        with qtbot.waitSignal(bridge.patrolMoving, timeout=1000) as blocker:
            bridge.patrolMoving.emit(True)
        assert blocker.signal_triggered
        assert blocker.args == [True]

        with qtbot.waitSignal(bridge.patrolMoving, timeout=1000) as blocker:
            bridge.patrolMoving.emit(False)
        assert blocker.signal_triggered
        assert blocker.args == [False]
