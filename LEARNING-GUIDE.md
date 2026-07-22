# DeskDog — Developer Guide

## Architecture

```
main.py → pet_app.py            # Window, events, patrol loop, message timer
           pet_renderer.py       # Sprite sheet → frame extraction → PhotoImage
           speech_bubble.py      # Health message popup (Toplevel)
           profile_selector.py   # Pet type selection dialog
           config_store.py       # Read/write config.json (%APPDATA%)
           sound_manager.py      # Sound effects via winsound
           tray_manager.py       # System tray icon (pystray)
           logger.py             # Rotating log to %APPDATA%/DeskDog/logs/
           monitor.py            # Multi-monitor bounds via Win32
           extract_sprites.py    # JPG sprite sheet → 44×44 PNG strips
```

- **Window:** Tkinter `Toplevel`, `overrideredirect`, `-transparentcolor`, `-topmost`
- **Taskbar:** `WS_EX_APPWINDOW` extended style for taskbar visibility
- **Animation:** `PIL.Image.crop` extracts 44×44 frames; patrol steps advance walking frames
- **Patrol:** Smoothstep easing over ~30ms steps, triggered every 6-24s
- **Walking sync:** Frame advance is owned by patrol steps, not a fixed timer
- **Messages:** Random health prompts from `messages.txt` (configurable interval via right-click menu)
- **Sleep:** After 5s of no cursor activity, transitions to `sleeping` state
- **Sounds:** `winsound.PlaySound` for click, message, wake, sleep events (toggleable)

## Sprites

Each state PNG is a horizontal strip of 44×44 frames:
- `*-idle.png`: 4+ frames
- `*-walking.png`: 4+ frames
- `*-sleeping.png`: 4+ frames
- `*-alerting.png`: 4+ frames

**Available pets:** `dog`, `cat`, `bunny`, `frog`

**Adding a new pet:**
1. Create a JPG sprite sheet with the pet's animations
2. Place it in `sprites/` folder
3. Run `python extract_sprites.py pass1` to detect grid and extract temp strips
4. Inspect temp strips and create a mapping file
5. Run `python extract_sprites.py pass2` to assemble final PNGs
6. Update `profile_selector.py` to add the new pet button
7. Set `"pet_type": "newpet"` in config.json

## Key Files

| File | Purpose |
|------|---------|
| `deskdog-tk/main.py` | Entry point |
| `deskdog-tk/pet_app.py` | Core app logic, window, events, timers |
| `deskdog-tk/pet_renderer.py` | Sprite loading + animation |
| `deskdog-tk/speech_bubble.py` | Health message popup |
| `deskdog-tk/profile_selector.py` | Pet chooser dialog |
| `deskdog-tk/config_store.py` | JSON config persistence |
| `deskdog-tk/sound_manager.py` | Sound effects (winsound) |
| `deskdog-tk/tray_manager.py` | System tray icon |
| `deskdog-tk/logger.py` | Rotating log |
| `deskdog-tk/monitor.py` | Multi-monitor detection |
| `deskdog-tk/extract_sprites.py` | JPG → PNG sprite extraction |
| `deskdog-tk/generate_placeholders.py` | Wrapper for extract_sprites |
| `deskdog-tk/messages.txt` | Health message corpus (one per line) |
| `deskdog-tk/sprites/` | Frame strips (PNG) + source JPGs |
| `deskdog-tk/sounds/` | Sound effect WAVs |
| `deskdog-tk/DeskDog.spec` | PyInstaller build config |
| `USER-MANUAL.md` | End-user documentation |

## Config

Stored in `%APPDATA%/DeskDog/config.json`:

```json
{
  "pet_type": "dog",
  "message_interval": 60,
  "sounds_enabled": true
}
```

## Constants (pet_app.py)

| Constant | Value | Purpose |
|----------|-------|---------|
| `SPRITE_W` / `SPRITE_H` | 44 | Frame dimensions |
| `ANIMATION_INTERVAL` | 150ms | Frame cycle rate (idle/alerting) |
| `PATROL_INTERVAL` | 12000ms | Time between patrols |
| `PATROL_STEP_INTERVAL` | 30ms | Movement step rate |
| `CURSOR_POLL_INTERVAL` | 100ms | Cursor inactivity check |
| `SLEEP_DELAY` | 5000ms | Before entering sleep |
| `MESSAGE_INTERVAL` | 60000ms | Default message interval |
| `BOB_AMPLITUDE` | 3px | Idle vertical bob |
| `CLICK_THRESHOLD` | 5px | Click vs drag |

## Build

```powershell
cd deskdog-tk
python -m PyInstaller --onefile --noconsole --add-data "sprites;sprites" --add-data "messages.txt;." --add-data "sounds;sounds" --name DeskDog main.py
```

Requirements: Python 3.10+, Pillow, pystray, PyInstaller.

Single-file .exe output at `dist/DeskDog.exe`.
