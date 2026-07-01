# DeskDog

A desktop virtual companion (pet) for health reminders and grief support. Built with PyQt6 + QWebEngineView (Chromium) for the OS window and TypeScript + Vite for the sprite-animated frontend.

The pet walks across your screen, displays empathic speech bubbles, and logs wellness actions — all without stealing focus or blocking your work.

---

## Prerequisites

| Tool | Version | Purpose |
|---|---|---|
| Python | 3.11+ | Backend runtime |
| Node.js | 18+ | Frontend build toolchain |
| npm | 9+ | Package management |

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
```

**Activate:**

| Platform | Command |
|---|---|
| Windows (PowerShell) | `deskdog-env\Scripts\Activate.ps1` |
| Windows (cmd) | `deskdog-env\Scripts\activate.bat` |
| macOS / Linux | `source deskdog-env/bin/activate` |

### 3. Install PyQt6 + QWebEngine

```bash
pip install PyQt6 PyQt6-WebEngine
```

Also install the build tool:

```bash
pip install pyinstaller
```

### 4. Install frontend dependencies

```bash
cd frontend
npm install
cd ..
```

---

## Local Development

### Build the frontend

```bash
cd frontend
npm run build
cd ..
```

This produces compiled output in `frontend/dist/`.

### Run the application (dev mode)

```bash
python main.py
```

The PyQt6 window will appear with the pet rendered via QWebEngineView, loading `frontend/dist/index.html`.

### Frontend dev server (optional)

If you want hot-reload while iterating on the UI:

```bash
cd frontend
npm run dev
```

Then point the Python backend at `http://localhost:5173` instead of the local file:

```python
# main.py (dev override)
view.setUrl(QUrl("http://localhost:5173"))
```

---

## Building a Standalone .exe (PyInstaller)

### Why PyInstaller

PyInstaller bundles the Python interpreter, all dependencies, and the QWebEngine runtime into a single executable so the end user does not need Python installed.

### Basic command

```bash
pyinstaller main.py ^
  --name DeskDog ^
  --windowed ^
  --onefile ^
  --add-data "frontend/dist;frontend/dist" ^
  --hidden-import PyQt6.QtWebEngine ^
  --hidden-import PyQt6.QtWebEngineWidgets ^
  --collect-all PyQt6.QtWebEngine
```

> **Note:** QWebEngine is large. The `--onefile` flag creates a single .exe but increases startup time (the runtime must extract itself). If startup time is a concern, use `--onedir` (one-folder mode) instead.

### One-folder alternative (faster startup)

```bash
pyinstaller main.py ^
  --name DeskDog ^
  --windowed ^
  --onedir ^
  --add-data "frontend/dist;frontend/dist" ^
  --hidden-import PyQt6.QtWebEngine ^
  --collect-all PyQt6.QtWebEngine
```

### Including sprite assets

If sprites are bundled as Python package data rather than served from `frontend/dist`, add:

```bash
  --add-data "frontend/public/sprites;frontend/public/sprites"
```

### Output

The built executable will be in `dist/DeskDog/DeskDog.exe` (one-folder) or `dist/DeskDog.exe` (one-file).

### Spec file (advanced)

For reproducible builds, generate a `.spec` file:

```bash
pyinstaller --name DeskDog main.py --windowed
```

Then edit `DeskDog.spec` to fine-tune datas, hidden imports, and excludes. Rebuild with:

```bash
pyinstaller DeskDog.spec
```

### Reducing bundle size

- Exclude unused Qt modules: `--exclude-module PyQt6.QtNetwork`, `PyQt6.QtMultimedia`, etc.
- Use UPX compression (place `upx.exe` on `PATH`): `--upx-dir "path\to\upx"`
- Remove debug symbols from QWebEngine (no flag — done by stripping the Qt DLLs)

---

## Project Layout

```
DeskDog/
├── main.py                  # Entry point
├── bridge.py                # QWebChannel IPC bridge
├── patrol.py                # Patrol physics controller
├── config.json              # User preferences
├── frontend/
│   ├── src/
│   │   ├── main.ts          # App entry
│   │   ├── PetRenderer.ts   # Sprite state machine
│   │   ├── SpeechBubble.ts  # Health/grief UI
│   │   ├── bridge-client.ts # QWebChannel wrapper
│   │   └── qwebchannel.js   # Qt JS client
│   ├── public/sprites/      # Sprite sheet PNGs
│   ├── index.html
│   ├── styles.css
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── spec/
│   ├── constitution/        # Architecture, roadmap, mission
│   └── features/            # Feature specifications
├── DESIGN.md                # Architecture & IPC documentation
└── README.md                # This file
```

---

## Architecture Quick Reference

| Component | Technology | Role |
|---|---|---|
| OS Window | PyQt6 `QMainWindow` | Frameless, translucent, always-on-top |
| Web Renderer | `QWebEngineView` | Chromium engine rendering the pet UI |
| Frontend | TypeScript + Vite | Sprite animation, speech bubbles, user interaction |
| IPC | `QWebChannel` | JS ↔ Python communication bridge |
| Animation | CSS `@keyframes` + `steps()` | GPU-accelerated sprite sheet playback |
| Build | PyInstaller | Standalone .exe packaging |

---

## License

[Specify your license here.]
