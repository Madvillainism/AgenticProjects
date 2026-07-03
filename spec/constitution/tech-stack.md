# Stack Tecnológico - MokuApp (Mokujin Edition)

- **Frontend Core:** Angular 19 (Standalone Components + Signals para renderizado inmediato del HUD).
- **Base de Datos Local:** IndexedDB mediante `Dexie.js` para almacenar:
  - Tiempos de Pomodoro completados.
  - El cuaderno de Drills de combos personalizados.
  - Las referencias extraídas (URLs, títulos, canales de YouTube, notas de pros).
- **Motor de Inputs (Tekken Notation):** Parser personalizado en TypeScript para convertir texto plano (ej: `f, n, d, d/f+2`) en componentes visuales con los iconos de dirección y botones (1, 2, 3, 4) con la estética clásica de las Arcades de Tekken 5/6.
- **Módulo de Referencias (Sin API de YouTube):** - **Estructura:** Catálogo de mapeo estático de Pro-Players por Personaje (`pro-players.json`) precargado en los assets de Angular.
  - **Integración:** Generador de URIs dinámicas mediante codificación de componentes URL (`encodeURIComponent`) para redirigir al usuario de forma externa o embebida a los motores de búsqueda de YouTube o Google Video sin consumir tokens de API.
- **Base de Datos Local (Dexie + IndexedDB):** Almacena únicamente las URLs de referencia y notas de estudio que el usuario decide guardar manualmente mediante el portapapeles.

Asegurate de obtener TODOS los assets necesarios (fotos icono de cada personaje, iconos de los botones, al menos 3 fotos de Mokujin, si no puedes conseguirlas, consulta por una API, por imagenes o usa algun placeholder)
