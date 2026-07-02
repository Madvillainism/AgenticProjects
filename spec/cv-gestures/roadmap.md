### 📍 Fase 1: Cimiento Tecnológico y Captura (MVP Inicial)

- [x] Configurar el entorno con Python 3.11+, OpenCV y MediaPipe.
- [x] Implementar el bucle de la cámara (`CameraEngine`) en un hilo secundario para evitar el bloqueo de la interfaz.
- [x] Aplicar el filtro de inversión de espejo (`cv2.flip`) y calibrar la confianza mínima a `0.7`.
- [x] **Hito de Salida:** Una ventana nativa que muestre el video con los 21 puntos clave de la mano dibujados encima en tiempo real sin caídas de frames.

### 📍 Fase 2: Motor de Gestos y Expresión Visual (Meme/Emoji Engine)

- [x] Desarrollar el módulo matemático para calcular distancias euclidianas entre los puntos (_landmarks_) de los dedos.
- [x] Mapear los primeros 3 gestos estáticos básicos:
  - 👍 _Pulgar arriba_ -> Renderizar emoji en pantalla.
  - ✋ _Palma abierta_ -> Mostrar overlay de meme.
  - ✌️ _Señal de victoria_ -> Acción personalizada.
- [x] **Hito de Salida:** El sistema reconoce los gestos instantáneamente y superpone el emoji/meme correcto sobre el frame de video.

### 📍 Fase 3: Emulación del Mouse (Control de Sistema)

- [x] Integrar `PyAutoGUI` / `Pynput` para tomar control del cursor del Sistema Operativo.
- [x] Mapear el punto central de la palma o el dedo índice para mover el puntero de la pantalla de forma proporcional.
- [x] Implementar un sistema de suavizado de movimiento (filtro de promedio móvil) para evitar el temblor natural de la mano.
- [x] **Hito de Salida:** El usuario puede desplazar el mouse por todo su monitor moviendo la mano frente a la cámara.

### 📍 Fase 4: Clicks e Interacción Avanzada (Herramienta Completa)

- [x] Diseñar el gesto de click izquierdo (Ejemplo: Unir el dedo índice y el pulgar rápidamente).
- [x] Diseñar el gesto de click derecho o scroll (Ejemplo: Mantener dos dedos juntos).
- [x] Implementar guardrails para evitar "falsos positivos" mientras la mano descansa.
- [x] **Hito de Salida:** Reemplazo funcional del mouse físico para tareas de navegación básica del sistema operativo.

### 📍 Fase 5: Integración con MS Paint (Herramienta de Dibujo)

- [x] Implementar modo de dibujo (mantener pinch para mouseDown)
- [x] Agregar gesto de scroll (dos dedos arriba/abajo)
- [x] Corregir inversión del eje X
- [ ] Agregar atajos de teclado (Ctrl+Z para deshacer, Ctrl+Y para rehacer)
- [ ] Probar integración completa con MS Paint
- [ ] **Hito de Salida:** El usuario puede dibujar en MS Paint usando gestos de la mano.