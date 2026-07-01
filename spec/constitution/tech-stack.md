# Stack Tecnológico Alternativo (Python + Web-View)

- **Core del Sistema Operativo (Backend):** Python 3.11+ utilizando `PyQt6` o `PySide6`.
- **Componente de Renderizado:** `QWebEngineView` (Motor Chromium integrado de Qt) configurado con fondo 100% translúcido y comportamiento de ventana flotante persistente (`AlwaysOnTop`).
- **Interfaz y Animación (Frontend):** TypeScript nativo o Angular (Standalone) encargado del bucle de animaciones por CSS Steps (Sprite Sheets) y el diseño de los globos de texto empáticos.
- **Comunicación Inter-proceso (IPC):** `QWebChannel` para permitir que el frontend de JavaScript le envíe comandos a Python (ej: guardar configuraciones del luto en un archivo local o cerrar la app).

## 🛑 Guardarraíles Globales de Arquitectura (Constraints)

Cualquier subagente que escriba código para este proyecto debe cumplir estrictamente estas reglas:

1. **Guardarraíl de Interacción Traslúcida (Crítico - Python):**
   La ventana flotante creada por Python debe ignorar por completo los eventos de click del mouse fuera del sprite real de la mascota. Se debe implementar obligatoriamente la máscara de entrada o la propiedad `Qt.WindowType.WindowTransparentForInput` según corresponda para permitir que el usuario interactúe con sus herramientas de fondo (editores de código, navegadores) sin que la ventana invisible del backend bloquee el cursor.

2. **Guardarraíl de Rendimiento de Memoria:**
   Al usar un Web-View dentro de Python, el subagente de frontend debe optimizar el bucle de renderizado de los sprites. Se prohíbe el uso de bucles JavaScript pesados (`setInterval` de alta frecuencia) para las animaciones; toda transición y animación de frames debe ser delegada de forma nativa a CSS (`@keyframes` y `steps()`).
