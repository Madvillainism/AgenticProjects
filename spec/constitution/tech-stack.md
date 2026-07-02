# Stack Tecnológico — Python + Tkinter

- **UI Framework:** Tkinter (librería GUI estándar de Python, sin dependencias externas)
- **Animación:** Extracción de frames desde spritesheets con Pillow (`Image.crop`), ciclo con `after()` timer
- **Ventana:** `overrideredirect(True)` + `-topmost` + `-transparentcolor` para ventana sin bordes, siempre al frente, con transparencia chroma-key
- **Click-through:** Win32 API via `ctypes` (`SetWindowLongW` con `WS_EX_TRANSPARENT`), toggled dinámicamente según posición del cursor
- **Almacenamiento:** `config.json` con `json` estándar
- **Empaquetado:** PyInstaller (single-file .exe, ~16 MB)
- **Dependencias:** Python 3.10+, tkinter, Pillow, PyInstaller

## Guardarraíles

1. **Click-through dinámico:** `WS_EX_TRANSPARENT` habilitado cuando el cursor está fuera del sprite (44×44), deshabilitado cuando entra. Evaluado cada 100ms.
2. **Rendimiento:** ~16 MB binario, <30 MB en ejecución. Animación por `after()` (sin hilos).
3. **Bordes de pantalla:** Coordenadas de patrullaje limitadas a `[0, screen_w - SPRITE_W]`.
4. **Sin foco:** La ventana usa `overrideredirect(True)` + `-topmost`, nunca roba el foco del teclado. El globo de diálogo es un `Toplevel` sin decoraciones.
5. **Persistencia:** `config.json` guarda solo `pet_type`.
