# DeskDog — Guía de Aprendizaje

Este documento te enseña tres cosas:

1. **Cómo crear este proyecto paso a paso**
2. **Qué hace cada función y por qué está hecha así**
3. **Cómo se puede mejorar y qué estudiar para hacerlo solo**

---

## 1. Cómo crear este proyecto paso a paso

DeskDog es una mascota de escritorio. Una ventanita
transparente con un sprite (perro o gato) que camina
aleatoriamente por la pantalla, muestra mensajes y se
duerme cuando no usás el mouse.

### Paso 1: La ventana transparente

El corazón es PyQt6. Creás un `QMainWindow` sin bordes,
transparente y siempre al frente:

```python
self.setWindowFlags(
    Qt.WindowType.FramelessWindowHint
    | Qt.WindowType.WindowStaysOnTopHint
)
self.setAttribute(Qt.WidgetAttribute.WA_TranslucentBackground)
```

Esto te da un lienzo vacío sobre el escritorio.

Dentro ponés un `QWebEngineView` — un navegador Chrome
embebido — que ocupa toda la ventana:

```python
self.view = QWebEngineView(self)
self.setCentralWidget(self.view)
```

Por qué: No podés dibujar sprites animados directamente
con PyQt6 de forma eficiente. En cambio, cargás HTML+CSS
dentro del navegador y dejás que el motor de CSS haga
las animaciones (GPU acelerado).

### Paso 2: El frontend en TypeScript + Vite

Creás un proyecto Vite con TypeScript. El HTML es mínimo:

```html
<div id="app"></div>
<script type="module" src="/src/main.ts"></script>
```

El frontend renderiza todo dentro de `#app`:
- Un sprite animado con CSS
- Una burbuja de mensaje
- Un selector de mascota al inicio

### Paso 3: Comunicación JavaScript ↔ Python

Usás `QWebChannel`, que es el sistema de IPC que viene
con Qt WebEngine. Del lado Python:

```python
class DeskDogBridge(QObject):
    @pyqtSlot()
    def startApp(self): ...

    @pyqtSlot(result=str)
    def loadConfig(self): ...
```

Del lado JavaScript cargás el script nativo de Qt:

```html
<script src="qrc:///qtwebchannel/qwebchannel.js"></script>
```

Y lo conectás:

```typescript
const transport = window.qt.webChannelTransport;
new QWebChannel(transport, (channel) => {
    const bridge = channel.objects.bridge;
});
```

Por qué: Cada método anotado con `@pyqtSlot` se vuelve
llamable desde JavaScript como una Promise. Las señales
`pyqtSignal` se escuchan con `bridge.connect("signal", fn)`.

### Paso 4: El sprite animado con CSS

Usás sprite sheets: una imagen horizontal con varios
frames. CSS avanza los frames con `steps()`:

```css
.sprite.dog-idle {
    background-image: url("sprites/dog-idle.png");
    background-size: 352px 44px; /* 8 frames × 44px */
    animation: sprite-idle 1.6s steps(8) infinite;
}
```

Por qué: `steps(8)` recorre los 8 frames como un
proyector. La animación es 100% GPU, no consume CPU.

### Paso 5: El patrol (caminata aleatoria)

Un `QTimer` en Python elige coordenadas aleatorias y
anima la ventana hacia allá:

```python
self._animation = QPropertyAnimation(self.window, b"pos")
self._animation.setStartValue(current)
self._animation.setEndValue(target)
self._animation.setDuration(4000)
self._animation.setEasingCurve(QEasingCurve.Type.InOutCubic)
```

Cada 12 segundos (PATROL_INTERVAL) calcula un destino
nuevo y se mueve durante 4 segundos (PATROL_ANIM_DURATION).

### Paso 6: El sueño por inactividad

Un `setTimeout` de 10 segundos en JavaScript. Cada vez
que el mouse se mueve, el timer se resetea:

```typescript
document.addEventListener("mousemove", resetSleepTimer);

function resetSleepTimer() {
    clearTimeout(sleepTimer);
    sleepTimer = setTimeout(() => {
        renderer.setState("sleeping");
    }, 10000);
}
```

El primer movimiento después de dormir despierta al sprite.

### Paso 7: Mensajes periódicos

Cada N minutos (configurable en `config.txt`), el frontend
elige un mensaje aleatorio de `messages.json` y lo muestra
en una burbuja con animación CSS.

---

## 2. Qué hace cada función y por qué

### `main.py` — Entrada principal

**`DeskDogWindow.__init__`** — Configura la ventana:
- `FramelessWindowHint`: sin barra de título ni bordes
- `WA_TranslucentBackground`: fondo transparente
- `resize(150, 150)`: tamaño justo para el sprite de 44px
  con un poco de padding para la zona de clic

**`DeskDogWindow._start_services`** — Arranca el patrol:
Solo se llama cuando el frontend ejecuta `bridge.startApp()`.
Esto evita que la ventana se mueva antes de elegir mascota.

**`DeskDogWindow.mouseMoveEvent`** — Zona de clic:
Crea un `QRect` de 44×44px centrado. Si el mouse está
dentro, la ventana acepta clics. Si está fuera, los clics
atraviesan la ventana (click-through). Esto permite hacer
clic en ventanas detrás de DeskDog.

**`DeskDogWindow.closeEvent`** — Detiene el patrol al cerrar:
Sin esto, el timer seguiría corriendo y el programa no
terminaría limpio.

### `bridge.py` — Puente IPC

**`_read_txt` y `_write_txt`** — Lectura/escritura de config:
Usan formato `key=value` porque es más fácil de editar
a mano que JSON. Sin comillas, sin riesgo de sintaxis
inválida.

**`DeskDogBridge.startApp`** — Señal de inicio:
El frontend la llama después de que el usuario elige
mascota y nombre. Activa el patrol.

**`DeskDogBridge.loadConfig`** — Cargar configuración:
Devuelve todo el `config.txt` como JSON string para que
el frontend lo parseee fácil.

**`DeskDogBridge.saveConfig(key, value)`** — Guardar:
Lee el archivo actual, actualiza la clave, escribe todo.
Estrategia merge, no overwrite total.

**`DeskDogBridge.closeApp`** — Cerrar aplicación:
El frontend llama esto desde el menú contextual.

### `patrol.py` — Física de movimiento

**`PatrolController.__init__`** — Configura el timer:
Un `QTimer` que cada `PATROL_INTERVAL` (12s) ejecuta
`_move_random`.

**`PatrolController.start`** — Activar:
Arranca con un movimiento inmediato y luego el timer.

**`PatrolController._move_random`** — Elegir destino:
Usa `screeninfo` para detectar el monitor principal.
Elige `x`, `y` aleatorios dentro del área visible menos
`VIEWPORT_W`/`VIEWPORT_H` (120px de margen).

Si `animate=True`, crea `QPropertyAnimation`:
- `InOutCubic`: acelera suave al inicio, desacelera al final
- Duración: 4000ms para un paseo tranquilo

**`PatrolController._on_move_finished`** — Avisar que paró:
Emite `patrolMoving(false)` para que el frontend vuelva
el sprite a `idle`.

### `PetRenderer.ts` — Máquina de estados del sprite

**`constructor(pet)`** — Crea el sprite y el nombre:
`this.el` es el div del sprite (clase `sprite dog-idle`).
`this.nameEl` es el nombre arriba del sprite.

**`setState(state)`** — Cambia la animación:
Solo cambia el `className`. El CSS hace toda la animación.
Los estados disponibles son: `idle`, `walking`, `sleeping`.

**`setName(name)`** — Muestra el nombre en una etiqueta:
El CSS posiciona `.pet-name` 30px arriba del sprite.

### `SpeechBubble.ts` — Burbuja de mensajes

**`show(text, actions)`** — Muestra burbuja:
Crea un div `.speech-bubble` con animación `bubble-in`
(efecto spring con overshoot). Si ya hay una visible,
no crea otra.

**`hide()`** — Oculta con animación:
Agrega clase `hiding` → dispara `bubble-out`. Escucha
`animationend` para remover el nodo del DOM exactamente
cuando termina la animación.

Por qué `animationend`: Si removieras el nodo instantáneo,
la animación de salida no se vería.

### `ProfileSelector.ts` — Selector de mascota

**`constructor(bridge?)`** — Crea el overlay:
Muestra tarjetas de perro/gato, input de nombre, botón
"Adoptar". Si recibe un `bridge`, carga config guardada.

**`loadSavedConfig()`** — Preselecciona si ya hay datos:
Lee `config.txt` via bridge. Si existe `petType` y
`petName`, los pone como valores iniciales.

**`onSelect(callback)`** — Registra callback de adopción:
El callback recibe `(pet, name)` y se ejecuta al hacer
clic en "Adoptar".

### `bridge-client.ts` — Cliente QWebChannel

**`initBridge()`** — Conecta con Qt:
- Verifica que `window.qt.webChannelTransport` exista
- Si no, rechaza (útil para testing en navegador)
- Si sí, crea `new QWebChannel(transport, callback)`
- El callback recibe el canal con `channel.objects.bridge`

Usa el `QWebChannel` nativo de Qt, no una implementación
custom. Esto es importante porque Qt 6.11 cambió el
protocolo interno y una implementación manual se rompe.

### `styles.css` — Animaciones

**`@keyframes idle-float`** — Respiración del sprite:
4 keyframes asimétricos que simulan inhalar (sube y se
agranda un 2%) y exhalar (vuelve). 3.2s de ciclo.

**`@keyframes walk-cycle`** — Rebote al caminar:
En el impacto (10%) el sprite se aplasta (`scaleY 0.95`).
En el despegue (35%) se estira (`scaleY 1.03`). Dos pasos
por ciclo de 0.8s.

**`@keyframes sleep-breathe`** — Respiración profunda:
Similar a `idle-float` pero más lento (4.8s) y con una
pausa al inspirar (35-55%).

**`@keyframes bubble-in`** — Entrada de burbuja:
Usa `cubic-bezier(0.34, 1.56, 0.64, 1)` que produce un
efecto spring (la burbuja "rebota" ligeramente al aparecer).

---

## 3. Cómo mejorar DeskDog y qué estudiar

### Mejoras posibles

| Mejora | Cómo implementarla |
|--------|-------------------|
| **Múltiples monitores** | `screeninfo.get_monitors()` ya devuelve todos. Elegir el monitor activo donde está el mouse. |
| **Sprites con más frames** | Agregar más PNGs al sprite sheet. Actualizar `background-size` y `steps()`. |
| **Sonidos** | Usar `QSoundEffect` o Web Audio API. Reproducir al caminar, dormir, mostrar mensaje. |
| **Animaciones de transición** | Agregar fade entre estados con `transition` en vez de cambio instantáneo. |
| **Interacción con clic** | Detectar `click` en el sprite y hacer algo (saltar, cambiar expresión). |
| **Alimentar a la mascota** | Agregar hambre/salud con timer. La mascota pide atención cada cierto tiempo. |
| **Más estados** | `eating`, `playing`, `happy`, `sad`. Cada uno con su sprite sheet y CSS. |
| **Personalización** | Selector de color, accesorios, fondos. Guardar preferencias en `config.txt`. |
| **Mensajes contextuales** | Detectar hora del día, uso del teclado, apps abiertas. Mensajes más inteligentes. |
| **Instalador** | Usar `nsis` o `Inno Setup` para crear un instalador .exe con acceso directo. |

### Qué estudiar para hacerlo solo

#### 1. Python

- **PyQt6** — Crear ventanas, layouts, eventos de mouse.
  Curso gratis: "PyQt6 Tutorial" en YouTube (Alan D Moore)
- **QWebEngineView** — Embeder un navegador en una app
  de escritorio. Documentación oficial de Qt.
- **QPropertyAnimation** — Animar propiedades de widgets
  (posición, tamaño, opacidad). Qt Docs → Animation Framework.
- **PyInstaller** — Empaquetar apps de Python en .exe.
  Leer la documentación de PyInstaller + hooks de PyQt6.

#### 2. TypeScript

- **TypeScript básico** — Tipos, clases, promesas, async/await.
  "TypeScript Handbook" oficial.
- **Vite** — Bundler rápido para proyectos web. Docs en vite.dev.
- **Módulos ES** — `import` / `export`. Entender cómo Vite
  bundlea el código.

#### 3. CSS

- **CSS Animations** — `@keyframes`, `animation`, `steps()`.
  MDN: "Using CSS animations".
- **Cubic Bezier** — Curvas de aceleración.
  https://cubic-bezier.com — Interactive tool.
- **Sprite sheets** — Técnica de game dev para animar con CSS.
  Artículo: "CSS Sprite Sheet Animations" en CSS-Tricks.
- **Transparent UI** — Ventanas translúcidas, click-through,
  z-index, `pointer-events: none`.

#### 4. Qt WebChannel

- Documentación oficial: "Qt WebChannel JavaScript API".
- Entender IPC: cómo Python y JavaScript se llaman mutuamente.
- Leer el archivo `qwebchannel.js` que viene con Qt.

#### 5. Conceptos generales

| Concepto | Dónde estudiarlo |
|----------|-----------------|
| **Programación orientada a eventos** | Cualquier curso de PyQt o JavaScript. Clave para entender señales/slots. |
| **Máquina de estados** | El sprite tiene estados (idle/walking/sleeping). Patrón State. Libro: "Game Programming Patterns". |
| **IPC (Inter-Process Communication)** | WebChannel es un IPC. Concepto general: cómo dos procesos se comunican. |
| **GPU vs CPU rendering** | Por qué CSS animations son mejores que setInterval. Artículo: "CSS GPU Animation" en Medium. |
| **screeninfo** | Librería simple para detectar monitores. Útil para apps multi-escritorio. |

### Proyectos similares para practicar

1. **Desktop Pet** en Python puro (sin WebEngine) — Usá
   `QLabel` con pixmap y movelo con `QPropertyAnimation`.
   Más simple, te da los fundamentos.

2. **Reloj de escritorio transparente** — PyQt6 + QTimer.
   Un reloj flotante que siempre se ve.

3. **Widget de notas adhesivas** — PyQt6 + QTextEdit.
   Ventana semitransparente donde escribís notas.

4. **Juego de plataformas en CSS** — Solo HTML+CSS.
   Un personaje que salta con checkbox hack. Entenderás
   `steps()` y `keyframes` a fondo.

5. **Bot que mueve el mouse** — `pyautogui` + random.
   Control del escritorio desde Python.

---

## Bonus: Arquitectura visual

```
┌──────────────────────────────────────────────┐
│            PyQt6 (main.py)                     │
│  ┌────────────────────────────────────────┐   │
│  │ QMainWindow (150×150, transparente)     │   │
│  │ ┌────────────────────────────────────┐  │   │
│  │ │ QWebEngineView (Chromium embebido) │  │   │
│  │ │ ┌──────────────────────────────┐   │  │   │
│  │ │ │ Frontend (TS + Vite)         │   │  │   │
│  │ │ │ ┌────────────────────────┐   │   │  │   │
│  │ │ │ │ #app                   │   │   │  │   │
│  │ │ │ │ ├─ .profile-selector   │   │   │  │   │
│  │ │ │ │ ├─ .sprite             │   │   │  │   │
│  │ │ │ │ ├─ .pet-name           │   │   │  │   │
│  │ │ │ │ ├─ .speech-bubble      │   │   │  │   │
│  │ │ │ │ └─ .context-menu       │   │   │  │   │
│  │ │ │ └────────────────────────┘   │   │  │   │
│  │ │ └──────────────────────────────┘   │  │   │
│  │ └────────────────────────────────────┘  │   │
│  │                                          │   │
│  │ QWebChannel (IPC)                        │   │
│  │  bridge.startApp()  ───► Python          │   │
│  │  bridge.loadConfig() ◄─── Python         │   │
│  │  patrolMoving(bool)  ──► Frontend        │   │
│  │                                          │   │
│  │ PatrolController (QTimer cada 12s)       │   │
│  │  → QPropertyAnimation(b"pos", 4s)        │   │
│  └──────────────────────────────────────────┘   │
│                                                  │
│ config.txt (key=value) — persistencia           │
│ frontend/dist/ — build de Vite                  │
└──────────────────────────────────────────────────┘
```

---

*Este documento es para vos. Si hay algo que no
entendés, preguntame y lo expandimos.*
