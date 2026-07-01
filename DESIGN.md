# DeskDog — Design & Architecture

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Desktop Operating System                  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │             PyQt6 Backend (main.py)                  │   │
│  │                                                      │   │
│  │  ┌──────────────┐    ┌───────────────────────────┐  │   │
│  │  │ QMainWindow   │    │   Bridge QObject          │  │   │
│  │  │  (frameless,  │    │                           │  │   │
│  │  │   translucent,│    │   @pyqtSlot() saveConfig  │  │   │
│  │  │   always-     │    │   @pyqtSlot() loadConfig  │  │   │
│  │  │   on-top)     │    │   @pyqtSlot() startApp    │  │   │
│  │  │              │    │   @pyqtSlot() closeApp     │  │   │
│  │  │              │    │   signal: patrolMoving     │  │   │
│  │  └──────┬───────┘    └──────────┬────────────────┘  │   │
│  │         │                       │                     │   │
│  │         │    QWebChannel        │                     │   │
│  │         └──────────┬────────────┘                     │   │
│  │                    │                                   │   │
│  │  ┌─────────────────▼────────────────────────────────┐  │   │
│  │  │          QWebEngineView (Chromium)                │  │   │
│  │  │   loads frontend/dist/index.html                 │  │   │
│  │  │   background: transparent                        │  │   │
│  │  └──────────────────────────────────────────────────┘  │   │
│  │                                                      │   │
│  │  ┌──────────────────────────────────────────────────┐  │   │
│  │  │          QTimer (patrol loop)                     │  │   │
│  │  │   fires every ~3s → random screen coordinates    │  │   │
│  │  │   starts only after frontend calls startApp()    │  │   │
│  │  └──────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Frontend — TypeScript + Vite                        │   │
│  │                                                      │   │
│  │  ┌─────────────────┐  ┌──────────────────────────┐  │   │
│  │  │ PetRenderer.ts   │  │ SpeechBubble.ts          │  │   │
│  │  │  - sprite state  │  │  - friendly messages     │  │   │
│  │  │    machine       │  │  - no IPC dependency     │  │   │
│  │  │    (idle/walk/   │  │  - dismiss-only actions  │  │   │
│  │  │     sleep)       │  │                           │  │   │
│  │  │  - CSS class     │  └──────────────────────────┘  │   │
│  │  │    switching     │                                 │   │
│  │  └────────┬─────────┘                                 │   │
│  │           │                                            │   │
│  │           └──────────┬──────────────────┐              │   │
│  │                      │                  │              │   │
│  │  ┌───────────────────▼────┐  ┌─────────▼──────────┐  │   │
│  │  │  styles.css            │  │  ProfileSelector.ts │  │   │
│  │  │  (CSS @keyframes +     │  │  - pet type + name  │  │   │
│  │  │   cubic-bezier easing) │  │  - loads saved      │  │   │
│  │  │  52px sprite frames    │  │    config on start  │  │   │
│  │  └────────────────────────┘  └────────────────────┘  │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Layer Responsibilities

| Layer | Technology | Responsibility |
|---|---|---|
| **Backend** | Python 3.11+, PyQt6 | Window management, OS-level transparency, IPC bridge, patrol physics, file I/O |
| **Renderer** | QWebEngineView (Chromium) | Renders the HTML/CSS/TS frontend with transparent backdrop |
| **Frontend** | TypeScript + Vite | Sprite animation state machine, speech bubble UI, pet selection overlay |
| **IPC** | QWebChannel | Bidirectional communication between JS frontend and Python backend |

---

## 2. QWebChannel IPC Workflow

### 2.1 Overview

QWebChannel enables the JavaScript frontend running inside `QWebEngineView` to call Python methods and receive signals. This is the sole IPC mechanism — no HTTP server, no WebSockets.

### 2.2 Python Bridge (Backend)

A `QObject` subclass exposes public `@pyqtSlot` methods and `pyqtSignal` signals:

```python
from PyQt6.QtCore import QObject, pyqtSlot, pyqtSignal

class DeskDogBridge(QObject):
    closeRequested = pyqtSignal()
    patrolMoving = pyqtSignal(bool)

    @pyqtSlot()
    def startApp(self) -> None:
        """Called by frontend after pet selection to start patrol."""

    @pyqtSlot(result=str)
    def loadConfig(self) -> str:
        """Read config.json and return as JSON string."""

    @pyqtSlot(str, str)
    def saveConfig(self, key: str, value: str) -> None:
        """Persist a configuration key/value to local JSON file."""

    @pyqtSlot()
    def closeApp(self) -> None:
        """Gracefully shut down the application."""
```

### 2.3 IPC Message Types

| Direction | Method / Signal | Purpose |
|---|---|---|
| JS → Python | `bridge.saveConfig(key, value)` | Persist user preference (petType, petName) |
| JS → Python | `bridge.loadConfig()` | Load saved config on startup |
| JS → Python | `bridge.closeApp()` | Exit the application |
| Python → JS | `bridge.patrolMoving` signal | Notify frontend of patrol state (idle/walking) |

### 2.4 App Startup Flow

```
1. Python creates window, bridge, patrol controller (paused)
2. Frontend loads in QWebEngineView
3. Frontend calls initBridge() → gets bridge proxy
4. Frontend creates ProfileSelector(passing bridge)
5. ProfileSelector calls bridge.loadConfig() to pre-fill saved pet/name
6. User selects pet type + name, clicks "Adoptar"
7. Frontend calls bridge.saveConfig("petType", ...) and saveConfig("petName", ...)
8. Frontend creates PetRenderer, SpeechBubble
9. Frontend calls bridge.startApp()
10. Python starts patrol timer + frontend starts message scheduler
```

---

## 3. CSS Step-Animation Workflow

### 3.1 Sprite Sheet Convention

Sprite sheets are laid out as a horizontal strip of equal-width frames at 52px per frame:

```
┌─────┬─────┬─────┬─────┐
│  0  │  1  │  2  │  3  │
└─────┴─────┴─────┴─────┘
 52px  52px  52px  52px
```

Each animation state maps to a specific sprite sheet image:

| State | Dog Frames | Dog Sheet Width | Cat Frames | Cat Sheet Width |
|---|---|---|---|---|
| `idle` | 8 | 416px | 8 | 416px |
| `walking` | 11 | 572px | 12 | 624px |
| `sleeping` | 4 | 208px | 4 | 208px |

### 3.2 CSS @keyframes with steps()

All sprite animation is delegated to the GPU-accelerated CSS engine. JavaScript switches the CSS class only:

```css
.sprite {
  width: 52px;
  height: 52px;
  position: fixed;
  top: 50%;
  left: 50%;
  image-rendering: pixelated;
}

.sprite.dog-idle {
  background-image: url("../sprites/dog-idle.png");
  background-size: 416px 52px;
  animation: sprite-idle 1.6s steps(8) infinite,
             idle-float 3.2s cubic-bezier(0.65, 0, 0.35, 1) infinite;
}

.sprite.dog-sleeping {
  background-image: url("../sprites/dog-sleeping.png");
  background-size: 208px 52px;
  animation: sprite-sleeping 2.4s steps(4) infinite,
             sleep-breathe 4.8s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}
```

### 3.3 Secondary Animation Details

| Animation | Purpose | Details |
|---|---|---|
| `idle-float` | Gentle breathing motion | 4 keyframes: inhale rises to -54% + scale 1.02, brief plateau, exhale settles. Asymmetric cubic-bezier timing. 3.2s cycle |
| `walk-cycle` | Weighted step bounce | Squash/stretch per step: impact pushes down to -47% (scaleY 0.95), push-off rises to -53% (scaleY 1.03). Two steps per cycle, 0.8s |
| `sleep-breathe` | Slow deep breathing | Subtle scale 1.02 with 0.5px lift. Breath-hold plateau at peak (35-55%). Slow 4.8s cycle (~12.5 bpm) |

### 3.4 State Transition Rules

```
              ┌──────────┐
              │  idle    │◄──────────────────────────────┐
              └────┬─────┘                                │
                   │                                      │
        patrol     │  patrol timer fires                  │
        timer      ▼                                      │
              ┌──────────┐    10s mouse inactivity    ┌───────────┐
              │ walking  │ ──────────────────────────► │ sleeping  │
              └────┬─────┘                             └─────┬─────┘
                   │                                          │
           move completes                              mouse move
                   │                                          │
                   └──────────────────────────────────────────┘
```

### 3.5 Constraint Enforcement

| Prohibited | Rationale |
|---|---|
| `setInterval(fn, N)` for frame advance | Causes layout thrashing, jank, and high CPU usage on software-rendered WebEngine |
| `requestAnimationFrame` for sprite timing | Still a JS-driven loop; defeats the purpose of native CSS compositing |
| JS loops that set `background-position` per frame | Same problem — prevents GPU acceleration |
| `setTimeout` chain for walk cycles | Unreliable timing, blocks garbage collection |

**Allowed:** Single `setTimeout` or `setInterval` for state transitions (e.g. sleeping after 10s inactivity), but never for per-frame sprite advancement.

---

## 4. Window Management

### 4.1 PyQt6 Window Setup

```python
class DeskDogWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowFlags(
            Qt.WindowType.FramelessWindowHint
            | Qt.WindowType.WindowStaysOnTopHint
        )
        self.setAttribute(Qt.WidgetAttribute.WA_TranslucentBackground)
        self.setStyleSheet("background: transparent;")
        self.resize(200, 200)

        self.view = QWebEngineView(self)
        self.view.setAttribute(Qt.WidgetAttribute.WA_TranslucentBackground)
        self.view.page().setBackgroundColor(Qt.GlobalColor.transparent)
        self.setCentralWidget(self.view)
```

### 4.2 TransparentForInput (Click-Through)

The window allows clicks to pass through to underlying windows except when the cursor is over the sprite zone (52x52 centered rect in the 200x200 viewport):

```python
def mouseMoveEvent(self, event):
    sprite_zone = QRect(
        (self.width() - SPRITE_ZONE_W) // 2,
        (self.height() - SPRITE_ZONE_H) // 2,
        SPRITE_ZONE_W, SPRITE_ZONE_H,
    )
    transparent = not sprite_zone.contains(event.position().toPoint())
    self.setAttribute(Qt.WidgetAttribute.WA_TransparentForMouseEvents, transparent)
```

### 4.3 Patrol Physics

Patrol starts only after `bridge.startApp()` is called from frontend (post-adoption). A `QTimer` fires every 3 seconds, picking random (x, y) within screen bounds minus viewport (140x140). Movement uses `QPropertyAnimation` with InOutQuad easing over 1.5s.

---

## 5. Sleeping State

The sleeping state is triggered by mouse inactivity:

1. Frontend listens for `mousemove` on `document`
2. On any mouse move → 10s timer resets, pet stays `idle` or `walking`
3. No mouse move for 10s → pet state set to `sleeping`
4. First mousemove after sleeping → pet returns to `idle` (or `walking` if patrol is active)

The sleeping sprite animation uses a slow 2.4s frame cycle with a 4.8s breathing secondary animation for a deep sleep appearance.

---

## 6. Speech Bubbles

Messages are loaded from `messages.json` directly by the frontend:

- A `setInterval` fires every 10 minutes
- Picks a random message from the JSON array
- Calls `bubble.show(body, actions)` — all actions are `dismiss`
- No IPC calls — bubble dismiss is purely frontend
- No health tracking, water logging, or grief/help types
- Pet state is not affected by bubble visibility

---

## 7. Config Persistence

Settings are stored in `config.json` at the project root:

```json
{
  "petType": "dog",
  "petName": "Firulais"
}
```

- `loadConfig()` returns the entire file as JSON string
- `saveConfig(key, value)` merges a key into the existing file
- ProfileSelector loads config on creation to pre-fill saved values
- Pet type and name are saved on adoption

---

## 8. Sprite Dimensions

| Property | Old | New |
|---|---|---|
| Frame size | 86x86 | 52x52 |
| Sprite zone | 86x86 | 52x52 |
| Viewport | 200x200 | 140x140 |
| Card images | 64x64 | 40x40 |

Sprites are generated from source JPG sprite sheets via `scripts/slice_sprites.py` with `TARGET_HEIGHT = 52`.

---

## 9. Project Structure

```
DeskDog/
├── main.py                  # Entry point — PyQt6 window + patrol (deferred start)
├── bridge.py                # DeskDogBridge QObject (startApp, loadConfig, saveConfig)
├── patrol.py                # PatrolController (random walk physics)
├── config.json              # User preferences (petType, petName)
├── frontend/
│   ├── src/
│   │   ├── main.ts          # Entry — init bridge, show profile selector, message scheduler
│   │   ├── PetRenderer.ts   # Sprite state machine (idle/walking/sleeping)
│   │   ├── SpeechBubble.ts  # Friendly message UI (no IPC)
│   │   ├── ProfileSelector.ts # Pet selection overlay with config persistence
│   │   └── bridge-client.ts # Custom QWebChannel implementation
│   ├── public/
│   │   ├── messages.json    # Friendly messages (10 items)
│   │   └── sprites/         # Sprite sheet PNGs (52px per frame)
│   ├── index.html
│   ├── styles.css           # CSS animations + profile selector styles
│   └── package.json
├── scripts/
│   └── slice_sprites.py     # Extracts frames from raw sprite sheets
├── tests/                   # Python pytest tests
└── spec/                    # Feature specs and roadmap
```

---

## 10. Development Phases

| Phase | Focus | Key Deliverables |
|---|---|---|
| **Fase 1** | Ecosystem init | Scaffold Python window with transparent QWebEngineView; scaffold Vite+TS frontend; basic sprite render |
| **Fase 2** | Desktop navigation | Patrol physics with edge detection; TransparentForInput masking; state machine transitions |
| **Fase 3** | Companion features | Profile selector, config persistence, speech bubble messages, mouse-inactivity sleeping |

---

*This document is a living specification. Update it when architectural decisions change.*
