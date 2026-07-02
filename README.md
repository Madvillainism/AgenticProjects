# DeskDog

A desktop virtual companion (pet) for health reminders and grief support. Built with Python + Tkinter for the window, Pillow for sprite animation, and ctypes (Win32 API) for transparent click-through.

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
pyinstaller DeskDog.spec --distpath ..\dist\DeskDog --workpath build
```

Output: `dist/DeskDog/DeskDog.exe` (~17 MB single-file).

---

## Architecture

```
deskdog-tk/
├── main.py              # Entry point (tk.Tk root)
├── pet_app.py           # Core: window, events, patrol, timers
├── pet_renderer.py      # Sprite sheet → 44×44 frames → PhotoImage
├── speech_bubble.py     # Health message popup (Toplevel)
├── profile_selector.py  # First-run dog/cat chooser
├── config_store.py      # JSON config in %APPDATA%/DeskDog/
├── logger.py            # Rotating log to %APPDATA%/DeskDog/logs/
├── monitor.py           # Multi-monitor bounds via Win32 EnumDisplayMonitors
├── tray_manager.py      # System tray icon (pystray)
├── messages.json        # Health message corpus
├── sprites/             # 20 PNG frame strips (dog + cat, 4 states)
└── DeskDog.spec         # PyInstaller build config
```

### Key components

| Module | Role |
|---|---|
| `pet_app.py` | Transparent frameless window, Win32 click-through, patrol with smoothstep easing, vertical bob, timer management |
| `pet_renderer.py` | Loads state PNGs (idle/walking/sleeping/alerting), crops 44×44 frames with PIL, cycles with `after()` |
| `monitor.py` | Detects all monitors via `user32.EnumDisplayMonitors`, clamps patrol to virtual desktop |
| `tray_manager.py` | pystray icon in system tray with show/hide/quit menu |
| `config_store.py` | Stores config in `%APPDATA%/DeskDog/config.json`, auto-migrates from exe-local |

---

## Features

- **Transparent window** — chroma-key transparency via `wm_attributes('-transparentcolor')`
- **Click-through** — Win32 `WS_EX_TRANSPARENT` toggled dynamically based on cursor position
- **Patrol** — smoothstep easing (`t²(3-2t)`) with vertical idle bob
- **Click vs drag** — 5px threshold separates tap (alert animation) from drag (move)
- **System tray** — show/hide from tray, quit from tray menu
- **Multi-monitor** — patrol bounded across all monitors
- **Health messages** — random empathic prompts every 45-120s
- **Sleep mode** — enters sleep after 10s no cursor activity
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
│   ├── logger.py
│   ├── monitor.py
│   ├── tray_manager.py
│   ├── messages.json
│   ├── sprites/
│   └── DeskDog.spec
├── spec/
│   ├── constitution/     # Mission, roadmap, tech stack
│   └── features/         # Feature specifications
├── openspec/             # Change proposals and specs
├── dist/DeskDog/         # Built .exe
├── LEARNING-GUIDE.md     # Study guide
└── README.md
```

---

## License

[Specify your license here.]
