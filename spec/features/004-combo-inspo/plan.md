# Plan de Implementación - Pro Directory

- **Assets:** Almacenar el mapeo fijo en un JSON estático (`src/assets/data/pro-players.json`).
- **Deep Linking:** Implementar un método que limpie los strings mediante `window.open(https://www.youtube.com/results?search_query=...)` utilizando `encodeURIComponent`.
- **Bitácora:** Extender el esquema de Dexie.js para manejar una tabla `pro_notebook` enlazada al ID del personaje.
