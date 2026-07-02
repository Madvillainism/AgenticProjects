# Stack Tecnológico - CV Gestures & Mouse Control

- **Core de Visión Artificial:** Python 3.11+ utilizando `OpenCV` (para captura de video) y `MediaPipe` (solución de Google para tracking de manos en tiempo real mediante 21 puntos clave de referencia).
- **Lógica de Gestos:** Algoritmos matemáticos basados en distancias euclidianas y ángulos entre los puntos clave de los dedos (Landmarks).
- **Control del Sistema (Fase 2):** `PyAutoGUI` o `Pynput` para la inyección nativa de eventos de movimiento y click del mouse en el Sistema Operativo.
- **Interfaz Visual Temporal:** Capas de renderizado nativas de OpenCV (`cv2.putText` / `cv2.imshow`) o un Webview ligero si se requiere interfaz de emojis compleja.
