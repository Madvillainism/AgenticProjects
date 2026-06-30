# AniDress — Generador de Outfits Anime con IA

Crea outfits inspirados en tus personajes favoritos de anime y Pokémon usando **Gemini 2.0 Flash** para las descripciones e **Imagen 3** para las imágenes. Los colores se extraen directamente de la PokeAPI.

Inspirado en [Murasaki Clothing AI](https://github.com/Madvillainism/Gemini-Nano-Test/tree/Murasaki-Clothing-AI).

---

## Cómo funciona

```
Personaje → PokeAPI / Jikan → CharacterInfo (sprites + paleta de colores)
                                     ↓
                              Gemini 2.0 Flash → 5 piezas con nombre, color y descripción
                                     ↓
                                 Imagen 3 → imagen principal del outfit
                                     ↓
                              Se guarda en IndexedDB → se muestra el resultado
```

---

## Stack

| Tecnología | Uso |
|------------|-----|
| Angular 18 | Standalone components + Signals |
| SCSS + Angular Material | UI con tema oscuro personalizado |
| `@google/genai` | Gemini 2.0 Flash (texto) + Imagen 3 (imágenes) |
| PokeAPI | Sprites, tipos y colores de especie de Pokémon |
| Jikan API | Personajes de anime (fallback) |
| Dexie.js | IndexedDB para persistencia local |

---

## Prerequisitos

- Node.js 18+
- npm 9+
- Angular CLI 18 (`npm install -g @angular/cli`)
- Una **API key de Gemini** (obtenla en [Google AI Studio](https://aistudio.google.com/))

---

## Instalación

```bash
git clone <repo-url>
cd anidress
npm install
```

### 3. Configurar la API key

Crea o edita `.env` en la raíz:

```
export GEMINI_API_KEY = tu-api-key-aqui
```

Luego genera el archivo de entorno:

```bash
npm run build:env
```

Esto crea `src/env.js` con la key inyectada en `window.__GEMINI_API_KEY__`.

---

## Comandos

| Comando | Descripción |
|---------|-------------|
| `npm start` | Compila `env.js` + inicia servidor dev en `localhost:4200` |
| `npm run build` | Compila `env.js` + build de producción en `dist/anidress-app` |
| `npm run build:env` | Solo regenera `src/env.js` desde `.env` |
| `npm run lint` | ESLint sobre `.ts` y `.html` |
| `npm test` | Pruebas unitarias (Karma) |

---

## Estructura del proyecto

```
src/
├── app/
│   ├── core/
│   │   ├── models/
│   │   │   └── outfit.interface.ts
│   │   └── services/
│   │       ├── ai-description.service.ts    # Gemini 2.0 Flash → 5 piezas
│   │       ├── character.service.ts         # PokeAPI / Jikan → CharacterInfo
│   │       ├── curated-piece-images.service.ts  # Imágenes de respaldo
│   │       ├── db.service.ts                # Dexie (IndexedDB)
│   │       ├── imagen.service.ts            # Imagen 3 → imagen principal
│   │       ├── outfit-generation.service.ts # Orquesta la generación completa
│   │       └── pokeapi.service.ts           # 10 Pokémon + colores de especie
│   ├── features/
│   │   ├── outfit-form/                     # Formulario: personaje + género
│   │   └── outfit-result/                   # Resultado: piezas + imagen + Pinterest
│   └── app.routes.ts                        # /, /result/:id, /saved
├── tools/
│   └── set-env.js                           # Inyecta .env → src/env.js
├── styles.scss                              # Tema oscuro + glassmorphism
└── index.html                               # Entry point + env.js
```

---

## Funcionalidades

### 1. Formulario
- Ingresa el nombre de un personaje anime o Pokémon
- Selecciona género (Femenino / Masculino / Unisex)
- Sugerencias rápidas con los 10 Pokémon más populares

### 2. Generación con IA
- **Gemini 2.0 Flash**: genera 5 piezas (cabeza, torso, piernas, zapatos, accesorio) con nombre, color hex y descripción
- **Imagen 3**: genera una imagen principal del outfit en estilo anime
- **Fallback**: si la API falla, se usan imágenes curadas de Pixabay/Unsplash

### 3. Resultado
- Imagen principal generada por IA
- Paleta de colores extraída de la especie del Pokémon
- Tarjetas individuales por cada pieza con descripción
- Botón de búsqueda en Pinterest (hyperlink)
- Guardar / favorito en IndexedDB

### 4. Persistencia
- Tabla `outfits` en IndexedDB vía Dexie
- CRUD completo: guardar, toggle favorito, consultar por ID

---

## Diseño visual

- **Paleta**: violeta profundo (`#4c1d95`) → rosa (`#831843`) → índigo oscuro (`#1e1b4b`)
- **Acentos**: dorado (`#fbbf24`) y rosa vibrante (`#f472b6`)
- **Tipografía**: Space Grotesk (títulos), Inter (cuerpo)
- **Efectos**: glassmorphism, gradientes animados, glow en hover
- **Spinner de carga**: sprites de Pokémon flotando

---

## APIs utilizadas

| API | Endpoint | Propósito |
|-----|----------|-----------|
| PokeAPI | `/pokemon/{id}`, `/pokemon-species/{id}` | Sprites, tipos, color de especie |
| Jikan | `/v4/characters?q=` | Personajes de anime (fallback) |
| Google Gemini | `gemini-2.0-flash` (texto), `imagen-3.0-generate-001` (imagen) | Generación del outfit |

---

## Mejoras futuras

- [ ] Edición iterativa (multi-turno) del outfit generado
- [ ] Exportar como imagen PNG
- [ ] Compartir en redes sociales
- [ ] Más Pokémon (top 50)
- [ ] Historial de outfits generados
