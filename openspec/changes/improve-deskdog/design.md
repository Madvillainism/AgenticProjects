## Context

DeskDog is a single-file ~16 MB exe built with PyInstaller. The current architecture has all logic in `pet_app.py` with `tkinter.after()` for timers and Win32 `SetWindowLongW` for click-through. Patrol movement uses flags (`patrol_active`) rather than cancelable timer handles, creating a race when drag and patrol overlap. Config stores alongside exe (breaks in read-only directories). No system tray means the only way to dismiss is right-click → Salir.

## Goals / Non-Goals

**Goals:**
- Fix patrol race by using cancelable `after()` handles stored per-timer
- Move config to `%APPDATA%/DeskDog/config.json` with one-time migration
- Add system tray via pystray (show/hide/quit)
- Add vertical bob animation during idle state
- Separate click from drag: single click triggers alerting animation, drag moves
- Respect multi-monitor bounds for patrol
- Compensate `after()` drift using wall-clock alignment
- Add rotating file logging in `%APPDATA%/DeskDog/logs/`

**Non-Goals:**
- No sound effects (future change)
- No custom skins/themes
- No web dashboard or remote control
- No Linux/macOS port (Windows-only via ctypes Win32)

## Decisions

1. **pystray for system tray** over `infi.systray` or `win32gui` directly — pystray is maintained, pure Python + PIL, works with Tkinter event loop via daemon thread
2. **Rotating file handler** over syslog/WER — simple `logging.handlers.RotatingFileHandler` with 1 MB per file, 3 backups, no external dep
3. **Wall-clock alignment** for timer drift — store expected fire time and use `after(max(0, delay - drift))` instead of raw `after(delay)`
4. **Cancelable timers via dict** — replace `self.msg_task`/`self.cycle_task` with `self.timers = {}` mapping logical names to `after()` IDs, allowing multi-cancel
5. **`_wm_geometry` for multi-monitor** — use `win32api.EnumDisplayMonitors` or `tkinter's winfo_screenwidth()` with virtual screen origin offset; simple approach: clamp to `[origin_x, origin_x + width - SPRITE_W]`
6. **Click vs drag threshold** — track pixel distance on button press; if < 5px on release, treat as click not drag

## Risks / Trade-offs

- **pystray daemon thread** → Tkinter is not thread-safe; all GUI updates from tray actions must schedule via `root.after()`
- **Logging to `%APPDATA%`** → `%APPDATA%` path varies by locale; use `os.environ.get('APPDATA', os.path.expanduser('~'))` as fallback
- **Config migration** → if both old and new location have configs, prefer new (fresh) over old — last-write-wins per field, merging isn't worth complexity
- **Timer drift compensation** → `time.monotonic()` is preferred over `time.time()` to avoid system clock change noise
