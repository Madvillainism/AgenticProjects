### 📍 Fase 1: Cimiento Tecnológico y Captura (MVP Inicial)

- [ ] Configurar el entorno con Python 3.11+, OpenCV y MediaPipe.
- [ ] Implementar el bucle de la cámara (`CameraEngine`) en un hilo secundario para evitar el bloqueo de la interfaz.
- [ ] Aplicar el filtro de inversión de espejo (`cv2.flip`) y calibrar la confianza mínima a `0.7`.
- [ ] **Hito de Salida:** Una ventana nativa que muestre el video con los 21 puntos clave de la mano dibujados encima en tiempo real sin caídas de frames.

### 📍 Fase 2: Motor de Gestos y Expresión Visual (Meme/Emoji Engine)

- [ ] Desarrollar el módulo matemático para calcular distancias euclidianas entre los puntos (_landmarks_) de los dedos.
- [ ] Mapear los primeros 3 gestos estáticos básicos:
  - 👍 _Pulgar arriba_ -> Renderizar emoji en pantalla.
  - ✋ _Palma abierta_ -> Mostrar overlay de meme.
  - ✌️ _Señal de victoria_ -> Acción personalizada.
- [ ] **Hito de Salida:** El sistema reconoce los gestos instantáneamente y superpone el emoji/meme correcto sobre el frame de video.

### 📍 Fase 3: Emulación del Mouse (Control de Sistema)

- [ ] Integrar `PyAutoGUI` / `Pynput` para tomar control del cursor del Sistema Operativo.
- [ ] Mapear el punto central de la palma o el dedo índice para mover el puntero de la pantalla de forma proporcional.
- [ ] Implementar un sistema de suavizado de movimiento (filtro de promedio móvil) para evitar el temblor natural de la mano.
- [ ] **Hito de Salida:** El usuario puede desplazar el mouse por todo su monitor moviendo la mano frente a la cámara.

### 📍 Fase 4: Clicks e Interacción Avanzada (Herramienta Completa)

- [ ] Diseñar el gesto de click izquierdo (Ejemplo: Unir el dedo índice y el pulgar rápidamente).
- [ ] Diseñar el gesto de click derecho o scroll (Ejemplo: Mantener dos dedos juntos).
- [ ] Implementar guardarraíles para evitar "falsos positivos" mientras la mano descansa.
- [ ] **Hito de Salida:** Reemplazo funcional del mouse físico para tareas de navegación básica del sistema operativo.