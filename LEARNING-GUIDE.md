# DeskDog — Learning Guide

## Architecture

```
main.py → pet_app.py          # Window, events, patrol loop, message timer
           pet_renderer.py     # Sprite sheet → frame extraction → PhotoImage
           speech_bubble.py    # Health message popup (Toplevel)
           profile_selector.py # Initial pet type selection dialog
           config_store.py     # Read/write config.json
```

- **Window:** Tkinter `Toplevel`, `overrideredirect`, `-transparentcolor`, `-topmost`
- **Click-through:** Win32 `SetWindowLongW(GWL_EXSTYLE, WS_EX_TRANSPARENT)`
- **Animation:** `PIL.Image.crop` extracts 44×44 frames from state PNGs; `after(150ms)` cycles them
- **Patrol:** Smoothstep easing (`t²(3-2t)`) over ~30ms steps, triggered every 6-24s
- **Messages:** Random health prompts from `messages.json` every 45-120s via `SpeechBubble`
- **Sleep:** After 10s of no cursor activity, transitions to `sleeping` state

## Sprites

Each state PNG is a horizontal strip of 44×44 frames:
- `*-idle.png`: 8 frames (dog) / 8 frames (cat)
- `*-walking.png`: 11 frames (dog) / 12 frames (cat)
- `*-sleeping.png`: 4 frames (both)

## Key Files

| File | Purpose |
|------|---------|
| `deskdog-tk/main.py` | Entry point |
| `deskdog-tk/pet_app.py` | Core app logic |
| `deskdog-tk/pet_renderer.py` | Sprite loading + animation |
| `deskdog-tk/speech_bubble.py` | Health message popup |
| `deskdog-tk/profile_selector.py` | First-run pet chooser |
| `deskdog-tk/config_store.py` | JSON persistence |
| `deskdog-tk/messages.json` | Health message corpus |
| `deskdog-tk/sprites/` | Frame strips (20 files) |
| `deskdog-tk/DeskDog.spec` | PyInstaller build config |
| `dist/DeskDog/DeskDog.exe` | Built executable |
| `spec/constitution/tech-stack.md` | Technology decisions |

## Build

```powershell
cd deskdog-tk
py -m PyInstaller DeskDog.spec --distpath ..\dist\DeskDog --workpath build
```

Requirements: Python 3.10+, Pillow, PyInstaller.

Single-file .exe output at `dist/DeskDog/DeskDog.exe`.
