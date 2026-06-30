## STACK

- Lenguaje: TypeScript y Angular 18
- Estilos: SCSS y Angular Material
- Base de datos: Dexie.js (IndexedDB)
- API IA: @google/genai (Imagen 3 + Gemini 2.0 Flash)
- API Sugerencias: PokeAPI

## COMANDOS

- `npm start` - Inicia servidor de desarrollo
- `npm run build` - Compila para producción
- `npm run lint` - Revisa el estilo con ESLint
- `npm test` - Ejecuta pruebas unitarias

## CONVENCIONES

- camelCase para variables y funciones
- guion-medio para carpetas y archivos (kebab-case)
- Standalone components (sin NgModules)
- Signals para estado, no RxJS a menos que sea necesario
- Validar todas las entradas del usuario
