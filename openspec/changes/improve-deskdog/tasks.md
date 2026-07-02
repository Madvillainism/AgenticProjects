## 1. Error Handling & Logging

- [ ] 1.1 Add rotating file logger module (`deskdog-tk/logger.py`) writing to `%APPDATA%/DeskDog/logs/`
- [ ] 1.2 Add graceful sprite load failure (WARNING log + freeze on last frame instead of crash)
- [ ] 1.3 Replace bare `except` in config_store with specific exception handling

## 2. Config Storage Migration

- [ ] 2.1 Rewrite `config_store.py` to use `%APPDATA%/DeskDog/config.json`
- [ ] 2.2 Add one-time migration from old exe-side location
- [ ] 2.3 Ensure config directory creation on first run

## 3. Patrol Physics Fixes

- [ ] 3.1 Replace patrol flags with cancelable timer handles via dict (`self.timers = {}`)
- [ ] 3.2 Fix patrol race: cancel all patrol timers on drag start
- [ ] 3.3 Add vertical idle bob (±3px sinusoidal, ~2s period)
- [ ] 3.4 Add multi-monitor boundary detection (`win32api.EnumDisplayMonitors`)

## 4. Click vs Drag Interaction

- [ ] 4.1 Track pixel distance on Button-1 (threshold: 5px)
- [ ] 4.2 Implement click action: cycle alerting frames once
- [ ] 4.3 Load `*-alerting.png` frames in PetRenderer
- [ ] 4.4 Ensure drag still works normally for >5px moves

## 5. System Tray

- [ ] 5.1 Add `deskdog-tk/tray_manager.py` with pystray icon
- [ ] 5.2 Wire tray show/hide to pet window visibility
- [ ] 5.3 Add tray context menu (Show/Ocultar, Salir)
- [ ] 5.4 Install pystray dependency in virtualenv
- [ ] 5.5 Update PyInstaller spec to bundle pystray

## 6. Timer Precision

- [ ] 6.1 Track wall-clock time per timer (`time.monotonic()`)
- [ ] 6.2 Adjust `after()` delay: `after(max(0, interval - (now - expected)))`
