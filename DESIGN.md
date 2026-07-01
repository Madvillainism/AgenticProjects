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
│  │  │   always-     │    │   @pyqtSlot() closeApp    │  │   │
│  │  │   on-top)     │    │   @pyqtSlot() logWater    │  │   │
│  │  │              │    │   signal: patrolResume()   │  │   │
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
│  │  │   respecting viewport edge bounds                │  │   │
│  │  └──────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Frontend — TypeScript + Vite                        │   │
│  │                                                      │   │
│  │  ┌─────────────────┐  ┌──────────────────────────┐  │   │
│  │  │ PetRenderer.ts   │  │ SpeechBubble.ts          │  │   │
│  │  │  - sprite state  │  │  - health messages       │  │   │
│  │  │    machine       │  │  - grief phrases          │  │   │
│  │  │  - CSS class     │  │  - IPC calls via          │  │   │
│  │  │    switching     │  │    QWebChannel            │  │   │
│  │  └────────┬─────────┘  └────────┬─────────────────┘  │   │
│  │           │                     │                     │   │
│  │           └─────────┬───────────┘                     │   │
│  │                     │                                  │   │
│  │  ┌──────────────────▼──────────────────────────────┐  │   │
│  │  │  styles.css  (pure CSS animations)              │  │   │
│  │  │  @keyframes walk { from { object-position: 0 }  │  │   │
│  │  │                to   { object-position: -N*W }   │  │   │
│  │  │  }  animation: walk 0.6s steps(N) infinite      │  │   │
│  │  │  background: transparent !important             │  │   │
│  │  └─────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Layer Responsibilities

| Layer | Technology | Responsibility |
|---|---|---|
| **Backend** | Python 3.11+, PyQt6 | Window management, OS-level transparency, IPC bridge, patrol physics, file I/O |
| **Renderer** | QWebEngineView (Chromium) | Renders the HTML/CSS/TS frontend with transparent backdrop |
| **Frontend** | TypeScript + Vite | Sprite animation state machine, speech bubble UI, user interaction handling |
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
    # Signal emitted when Python wants the pet to resume walking
    patrolResume = pyqtSignal()

    @pyqtSlot(str, str)
    def saveConfig(self, key: str, value: str) -> None:
        """Persist a configuration key/value to local JSON file."""
        ...

    @pyqtSlot()
    def closeApp(self) -> None:
        """Gracefully shut down the application."""
        ...

    @pyqtSlot()
    def logWater(self) -> None:
        """Record that the user logged a water break."""
        ...

    @pyqtSlot()
    def dismissBubble(self) -> None:
        """Notify Python that the user dismissed the speech bubble."""
        ...
```

**Registration in main window:**

```python
from PyQt6.QtWebChannel import QWebChannel
from PyQt6.QtCore import QUrl

channel = QWebChannel()
bridge = DeskDogBridge()
channel.registerObject("bridge", bridge)

view = QWebEngineView()
view.page().setWebChannel(channel)
view.setUrl(QUrl.fromLocalFile("frontend/dist/index.html"))
```

### 2.3 JavaScript Client (Frontend)

The frontend uses the `qt.webChannelTransport` object injected by `QWebEngineView`:

```typescript
// qwebchannel.d.ts — type declarations
interface QWebChannelTransport {
  send(message: any): void;
  onmessage: ((message: any) => void) | null;
}

interface Window {
  qt: { webChannelTransport: QWebChannelTransport };
}

// bridge-client.ts
import QWebChannel from "./qwebchannel.js";

export function initBridge(): Promise<any> {
  return new Promise((resolve) => {
    new QWebChannel(window.qt.webChannelTransport, (channel) => {
      resolve(channel.objects.bridge);
    });
  });
}
```

### 2.4 IPC Message Flow

```
 User clicks "✓ Ya tomé agua" in speech bubble
        │
        ▼
  SpeechBubble.ts calls:
    bridge.logWater()
        │
        ▼
  Python DeskDogBridge.logWater() executes
    - writes timestamp to water_log.json
    - emits bridge.patrolResume signal
        │
        ▼
  Python patrol logic:
    - restarts QTimer for random walking
    - optionally calls page.runJavaScript() to trigger frontend state change
```

### 2.5 IPC Message Types

| Direction | Method / Signal | Purpose |
|---|---|---|
| JS → Python | `bridge.saveConfig(key, value)` | Persist user preference (e.g. pet type, volume) |
| JS → Python | `bridge.closeApp()` | Exit the application |
| JS → Python | `bridge.logWater()` | Log a hydration event |
| JS → Python | `bridge.dismissBubble()` | Dismiss current speech bubble |
| Python → JS | `page.runJavaScript(...)` | Trigger frontend state transitions |
| Python → JS | `bridge.patrolResume` signal | Notify frontend that patrol is resuming |

### 2.6 Guardrail — No Focus Stealing

The speech bubble's appearance **must never** steal keyboard focus. The frontend should not call `.focus()` on any element. Python should not call `view.setFocus()`. The bubble renders passively via CSS `display: block / none`.

---

## 3. CSS Step-Animation Workflow

### 3.1 Sprite Sheet Convention

Sprite sheets are laid out as a horizontal strip of equal-width frames:

```
┌─────┬─────┬─────┬─────┐
│  0  │  1  │  2  │  3  │
└─────┴─────┴─────┴─────┘
  W px  W px  W px  W px
```

Each animation state maps to a specific sprite sheet image:

| State | Frames | Sprite File |
|---|---|---|
| `idle` | 4 | `sprites/dog-idle.png` |
| `walking` | 6 | `sprites/dog-walk.png` |
| `sleeping` | 2 | `sprites/dog-sleep.png` |
| `alerting` | 4 | `sprites/dog-alert.png` |

### 3.2 CSS @keyframes with steps()

All sprite animation is delegated to the GPU-accelerated CSS engine. JavaScript is used **only** to switch the applied CSS class — never to drive frame timing.

```css
/* styles.css */

.sprite {
  width: 64px;
  height: 64px;
  background-size: cover;
  background-repeat: no-repeat;
  image-rendering: pixelated;          /* crisp sprite scaling */
}

/* ── Idle ── */
.sprite.idle {
  background-image: url("/sprites/dog-idle.png");
  animation: sprite-idle 0.8s steps(4) infinite;
}

@keyframes sprite-idle {
  from { background-position: 0 0; }
  to   { background-position: -256px 0; }  /* 4 frames × 64px */
}

/* ── Walking ── */
.sprite.walking {
  background-image: url("/sprites/dog-walk.png");
  animation: sprite-walk 0.6s steps(6) infinite;
}

@keyframes sprite-walk {
  from { background-position: 0 0; }
  to   { background-position: -384px 0; }  /* 6 frames × 64px */
}

/* ── Sleeping ── */
.sprite.sleeping {
  background-image: url("/sprites/dog-sleep.png");
  animation: sprite-sleep 1.5s steps(2) infinite;
}

@keyframes sprite-sleep {
  from { background-position: 0 0; }
  to   { background-position: -128px 0; }  /* 2 frames × 64px */
}

/* ── Alerting ── */
.sprite.alerting {
  background-image: url("/sprites/dog-alert.png");
  animation: sprite-alert 0.5s steps(4) infinite;
}

@keyframes sprite-alert {
  from { background-position: 0 0; }
  to   { background-position: -256px 0; }  /* 4 frames × 64px */
}
```

### 3.3 TypeScript State Machine

```typescript
// PetRenderer.ts
type PetState = "idle" | "walking" | "sleeping" | "alerting";

class PetRenderer {
  private element: HTMLElement;
  private currentState: PetState = "idle";

  constructor(element: HTMLElement) {
    this.element = element;
    this.setState("idle");
  }

  setState(state: PetState): void {
    this.currentState = state;
    // Only action: swap the CSS class. CSS engine handles all animation.
    this.element.className = `sprite ${state}`;
  }

  getState(): PetState {
    return this.currentState;
  }
}
```

### 3.4 State Transition Rules

```
        ┌──────────┐
        │  idle    │◄────────────────────────────┐
        └────┬─────┘                              │
             │                                    │
    patrol   │   patrol timer fires               │
    timer    ▼                                    │
        ┌──────────┐   user interacts   ┌───────────┐
        │ walking  │ ──────────────────► │ alerting  │
        └────┬─────┘                    └─────┬─────┘
             │                                │
      reaches edge        timeout / dismissed │
             ▼                                │
        ┌──────────┐                          │
        │ sleeping │◄─────────────────────────┘
        └────┬─────┘
             │
     rest complete
             ▼
        back to idle
```

### 3.5 Constraint Enforcement

| Prohibited | Rationale |
|---|---|
| `setInterval(fn, N)` for frame advance | Causes layout thrashing, jank, and high CPU usage on software-rendered WebEngine |
| `requestAnimationFrame` for sprite timing | Still a JS-driven loop; defeats the purpose of native CSS compositing |
| JS loops that set `background-position` per frame | Same problem — prevents GPU acceleration |
| `setTimeout` chain for walk cycles | Unreliable timing, blocks garbage collection |

**Allowed:** Single `setTimeout` or `setInterval` for state transitions (e.g. "change state after 5 seconds"), but never for per-frame sprite advancement.

### 3.6 Transparent Background Guardrail

```css
html, body, #app, .sprite-container {
  background: transparent !important;
  overflow: hidden;
  margin: 0;
  padding: 0;
}
```

The Python window sets `WA_TranslucentBackground` and `WA_TransparentForMouseEvents` (dynamic). The frontend must not accidentally introduce any opaque element.

---

## 4. Window Management

### 4.1 PyQt6 Window Setup

```python
from PyQt6.QtWidgets import QMainWindow
from PyQt6.QtCore import Qt
from PyQt6.QtWebEngineWidgets import QWebEngineView

class DeskDogWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowFlags(
            Qt.WindowType.FramelessWindowHint
            | Qt.WindowType.WindowStaysOnTopHint
            | Qt.WindowType.Tool
        )
        self.setAttribute(Qt.WidgetAttribute.WA_TranslucentBackground)
        self.setStyleSheet("background: transparent;")

        self.view = QWebEngineView(self)
        self.view.setAttribute(Qt.WidgetAttribute.WA_TranslucentBackground)
        self.view.page().setBackgroundColor(Qt.GlobalColor.transparent)
        self.setCentralWidget(self.view)
```

### 4.2 TransparentForInput (Click-Through)

The window should allow clicks to pass through to underlying windows **except** when the cursor is over the sprite or an interactive UI element.

```python
# In patrol timer or mouse-move event handler:
def _update_transparent_for_input(self, cursor_pos: QPoint):
    sprite_rect = QRect(self.sprite_x, self.sprite_y, SPRITE_W, SPRITE_H)
    if sprite_rect.contains(cursor_pos):
        # Allow interaction with sprite/bubble
        self.setAttribute(Qt.WidgetAttribute.WA_TransparentForMouseEvents, False)
    else:
        # Let clicks pass through to desktop
        self.setAttribute(Qt.WidgetAttribute.WA_TransparentForMouseEvents, True)
```

### 4.3 Patrol Physics

```python
from PyQt6.QtCore import QTimer, QRect
from screeninfo import get_monitors
import random

class PatrolController:
    def __init__(self, window: DeskDogWindow):
        self.window = window
        self.timer = QTimer()
        self.timer.timeout.connect(self._move_random)
        self.timer.start(3000)          # every 3 seconds

    def _move_random(self):
        monitor = get_monitors()[0]
        max_x = monitor.width  - VIEWPORT_W
        max_y = monitor.height - VIEWPORT_H
        new_x = random.randint(0, max_x)
        new_y = random.randint(0, max_y)
        self.window.move(new_x, new_y)
```

**Edge-bound guardrail:** `max_x` and `max_y` subtract the exact viewport dimensions so the pet never clips off-screen.

---

## 5. Data Flow Diagram (End-to-End)

```
┌─────────────────────────────────────────────────────────┐
│                    USER ACTION                           │
│  clicks speech bubble button "Tomé agua"                │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│  FRONTEND (SpeechBubble.ts)                             │
│                                                         │
│  1. bridge.logWater()  ──► QWebChannel                  │
│  2. PetRenderer.setState("alerting")                    │
│  3. Dismiss bubble from DOM                             │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│  QWebChannel Transport (C++/JS bridge in Chromium)      │
│  Serializes call ──► Python                               │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│  PYTHON (DeskDogBridge.logWater)                        │
│                                                         │
│  1. Append to water_log.json with timestamp             │
│  2. Emit patrolResume signal                            │
│  3. (Optional) page.runJavaScript("...") to update      │
│     frontend state                                      │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│  PATROL CONTROLLER                                      │
│  Receives signal → restarts QTimer →                    │
│  _move_random() → window.move(new_x, new_y)             │
└─────────────────────────────────────────────────────────┘
```

---

## 6. Project Structure

```
DeskDog/
├── main.py                  # Entry point — PyQt6 window + patrol
├── bridge.py                # DeskDogBridge QObject
├── patrol.py                # PatrolController
├── config.json              # User preferences
├── frontend/
│   ├── src/
│   │   ├── main.ts          # Entry — init QWebChannel, mount app
│   │   ├── PetRenderer.ts   # Sprite state machine
│   │   ├── SpeechBubble.ts  # Health/grief message UI + IPC
│   │   ├── bridge-client.ts # QWebChannel JS wrapper
│   │   └── qwebchannel.js   # Qt's official JS client
│   ├── public/
│   │   └── sprites/         # Sprite sheet PNGs
│   ├── index.html
│   ├── styles.css
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
└── spec/
    ├── constitution/
    │   ├── mision-vision.md
    │   ├── tech-stack.md
    │   └── roadmap.md
    └── features/
        ├── python-window.md
        ├── pet-render.md
        └── health-prompter.md
```

---

## 7. Development Phases (from Roadmap)

| Phase | Focus | Key Deliverables |
|---|---|---|
| **Fase 1** | Ecosystem init | Scaffold Python window with transparent QWebEngineView; scaffold Vite+TS frontend; basic sprite render |
| **Fase 2** | Desktop navigation | Patrol physics with edge detection; TransparentForInput masking; state machine transitions |
| **Fase 3** | Grief & health alerts | QWebChannel IPC bridge; speech bubble UI; health message JSON; water-log persistence; dismiss flow |

---

*This document is a living specification. Update it when architectural decisions change.*
