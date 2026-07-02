import logging
import os
import sys
from logging.handlers import RotatingFileHandler

LOG_DIR = None

def _get_log_dir():
    global LOG_DIR
    if LOG_DIR is None:
        appdata = os.environ.get("APPDATA", os.path.expanduser("~"))
        LOG_DIR = os.path.join(appdata, "DeskDog", "logs")
    return LOG_DIR

def setup_logger():
    log_dir = _get_log_dir()
    os.makedirs(log_dir, exist_ok=True)
    log_path = os.path.join(log_dir, "deskdog.log")

    logger = logging.getLogger("deskdog")
    logger.setLevel(logging.DEBUG)

    if logger.handlers:
        return logger

    handler = RotatingFileHandler(log_path, maxBytes=1_048_576, backupCount=3, encoding="utf-8")
    handler.setLevel(logging.DEBUG)
    fmt = logging.Formatter("%(asctime)s [%(levelname)s] %(message)s", datefmt="%Y-%m-%d %H:%M:%S")
    handler.setFormatter(fmt)
    logger.addHandler(handler)

    console = logging.StreamHandler(sys.stderr)
    console.setLevel(logging.DEBUG)
    console.setFormatter(fmt)
    logger.addHandler(console)

    logger.info("DeskDog started — Python %s", sys.version)
    return logger

def get_logger():
    return logging.getLogger("deskdog")
