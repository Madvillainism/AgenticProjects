## Why

DeskDog works but has several bugs and UX gaps: patrol can glitch after drag, config persists in the wrong location, there's no system tray (can't hide the pet), vertical movement is missing, and errors like missing sprites crash silently. These issues make the app feel fragile in daily use.

## What Changes

- Fix patrol race condition when user drags the pet mid-patrol
- Store `config.json` in `%APPDATA%/DeskDog/` instead of exe directory
- Add system tray icon with show/hide context menu (pystray)
- Add vertical floating animation (gentle Y-axis bob) during idle and patrol
- Differentiate single-click from drag on the pet (click to interact, drag to move)
- Add multi-monitor awareness for patrol bounds
- Compensate for `after()` timer drift with wall-clock alignment
- Add graceful error handling for missing sprites or config
- Add logging to file for postmortem debugging

## Capabilities

### New Capabilities
- `system-tray`: System tray icon with show/hide and quit controls; background operation when window closed
- `multi-monitor`: Window position and patrol bounds respect all monitors, not just primary
- `patrol-physics`: Vertical idle bobbing, no race conditions on user interaction, smooth transitions
- `click-interaction`: Distinguish tap/click from drag; clicking the pet triggers an alerting animation
- `config-storage`: Persistent config in `%APPDATA%` with migration from old location
- `error-logging`: Structured logging to rotating log file in `%APPDATA%`, graceful degradation on missing assets

### Modified Capabilities
<!-- None - all specs are new -->

## Impact

- **Files modified**: `deskdog-tk/pet_app.py`, `deskdog-tk/config_store.py`, `deskdog-tk/speech_bubble.py`
- **New files**: `deskdog-tk/tray_manager.py`, `deskdog-tk/logger.py`, `deskdog-tk/monitor.py`
- **New dependency**: `pystray` (for system tray)
- **Config migration**: Existing `config.json` next to exe will be read once and migrated to `%APPDATA%`
