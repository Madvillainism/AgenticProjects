# DeskDog

A desktop virtual companion (pet) for health reminders and grief support. Built with Python + Tkinter for the window, Pillow for sprite animation, ctypes (Win32 API) for transparent click-through, and winsound for subtle sound effects.

The pet walks across your screen, displays empathic speech bubbles, and logs wellness actions — all without stealing focus or blocking your work.

---

## Prerequisites

| Tool | Version | Purpose |
|---|---|---|
| Python | 3.10+ | Runtime |
| Pillow | 9+ | Sprite image loading |
| pystray | 0.19+ | System tray icon |
| PyInstaller | 6+ | .exe packaging |

---

## Installation

### 1. Clone the repository

```bash
git clone <repo-url> DeskDog
cd DeskDog
```

### 2. Python virtual environment

```bash
python -m venv deskdog-env
deskdog-env\Scripts\activate     # Windows PowerShell
```

### 3. Install dependencies

```bash
pip install pillow pystray pyinstaller
```

---

## Run (Development)

```bash
cd deskdog-tk
python main.py
```

A transparent, always-on-top pet appears on your screen. It patrols, sleeps after inactivity, shows health messages, and responds to clicks.

---

## Build .exe

```bash
cd deskdog-tk
python -m PyInstaller --onefile --noconsole --add-data "sprites;sprites" --add-data "messages.txt;." --add-data "sounds;sounds" --name DeskDog main.py
```

Output: `dist/DeskDog.exe` (~28 MB single-file).

---

## Architecture

```
deskdog-tk/
├── main.py              # Entry point (tk.Tk root)
├── pet_app.py           # Core: window, events, patrol, timers
├── pet_renderer.py      # Sprite sheet → 44×44 frames → PhotoImage
├── speech_bubble.py     # Health message popup (Toplevel)
├── profile_selector.py  # Dog/cat/bunny/frog chooser
├── config_store.py      # JSON config in %APPDATA%/DeskDog/
├── sound_manager.py     # Sound effects via winsound
├── tray_manager.py      # System tray icon (pystray)
├── logger.py            # Rotating log to %APPDATA%/DeskDog/logs/
├── monitor.py           # Multi-monitor bounds via Win32
├── extract_sprites.py   # JPG sprite sheet → 44×44 PNG strips
├── messages.txt         # Health messages (one per line)
├── sprites/             # Frame strips + source JPGs
├── sounds/              # Sound effect WAVs
└── DeskDog.spec         # PyInstaller build config
```

### Key components

| Module | Role |
|---|---|
| `pet_app.py` | Transparent frameless window, Win32 taskbar visibility, patrol with smoothstep easing, vertical bob, timer management, sound triggers |
| `pet_renderer.py` | Loads state PNGs (idle/walking/sleeping/alerting), crops 44×44 frames with PIL, generic for any pet type |
| `sound_manager.py` | Plays WAV sounds via `winsound`, toggleable, handles missing files gracefully |
| `monitor.py` | Detects all monitors via `user32.EnumDisplayMonitors`, clamps patrol to virtual desktop |
| `tray_manager.py` | pystray icon in system tray with show/hide/quit menu |
| `config_store.py` | Stores config in `%APPDATA%/DeskDog/config.json`, auto-migrates from exe-local |
| `extract_sprites.py` | Auto-detects grid from JPG sprite sheets, extracts frames, resizes to 44×44, assembles state strips |

---

## Features

- **Transparent window** — chroma-key transparency via `wm_attributes('-transparentcolor')`
- **Taskbar visible** — `WS_EX_APPWINDOW` extended style
- **Patrol** — smoothstep easing with vertical idle bob
- **Walking sync** — animation frames advance with patrol steps, not a fixed timer
- **Click vs drag** — 5px threshold separates tap (alert animation) from drag (move)
- **System tray** — show/hide from tray, quit from tray menu
- **Multi-monitor** — patrol bounded across all monitors
- **Health messages** — random prompts from `messages.txt`, configurable interval (30s/60s/120s)
- **Sounds** — click, message, wake, sleep effects via winsound (toggleable)
- **Sleep mode** — enters sleep after 5s no cursor activity
- **4 pets** — dog, cat, bunny, frog (sprite sheets extracted from JPGs)
- **Config persistence** — survives restarts, stored in `%APPDATA%`
- **Rotating logs** — 1 MB per file, 3 backups, in `%APPDATA%/DeskDog/logs/`

---

## Project Layout

```
DeskDog/
├── deskdog-tk/           # Application source
│   ├── main.py
│   ├── pet_app.py
│   ├── pet_renderer.py
│   ├── speech_bubble.py
│   ├── profile_selector.py
│   ├── config_store.py
│   ├── sound_manager.py
│   ├── tray_manager.py
│   ├── logger.py
│   ├── monitor.py
│   ├── extract_sprites.py
│   ├── messages.txt
│   ├── sprites/
│   ├── sounds/
│   └── DeskDog.spec
├── spec/
│   ├── constitution/     # Mission, roadmap, tech stack
│   └── features/         # Feature specifications
├── openspec/             # Change proposals and specs
├── dist/DeskDog.exe      # Built .exe
├── USER-MANUAL.md        # End-user documentation
├── LEARNING-GUIDE.md     # Developer guide
└── README.md
```

---

## User Documentation

See [USER-MANUAL.md](USER-MANUAL.md) for end-user instructions on editing messages, changing settings, toggling sounds, and replacing sprites.

---

## License

[Specify your license here.]
