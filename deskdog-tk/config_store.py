import json
import os
import sys
from logger import get_logger

def _get_data_dir():
    appdata = os.environ.get("APPDATA", os.path.expanduser("~"))
    data_dir = os.path.join(appdata, "DeskDog")
    os.makedirs(data_dir, exist_ok=True)
    return data_dir

def _old_config_path():
    return os.path.join(os.path.dirname(os.path.abspath(__file__)), "config.json")

def _new_config_path():
    return os.path.join(_get_data_dir(), "config.json")

def _migrate():
    old = _old_config_path()
    new = _new_config_path()
    if os.path.exists(new):
        return
    if os.path.exists(old):
        try:
            with open(old, "r") as f:
                data = json.load(f)
            with open(new, "w") as f:
                json.dump(data, f, indent=2)
            get_logger().info("Config migrated from %s to %s", old, new)
        except Exception as e:
            get_logger().warning("Config migration failed: %s", e)

def load_config():
    _migrate()
    path = _new_config_path()
    try:
        with open(path, "r") as f:
            return json.load(f)
    except FileNotFoundError:
        return {}
    except json.JSONDecodeError as e:
        get_logger().warning("Corrupt config at %s: %s", path, e)
        return {}

def save_config(data):
    path = _new_config_path()
    try:
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, "w") as f:
            json.dump(data, f, indent=2)
    except Exception as e:
        get_logger().error("Failed to save config: %s", e)
