# MokuApp - Global Context Ledger (context7)

## 📌 Estado Actual del Proyecto

- **Fase:** Inicialización y Arquitectura de Especificaciones (Fase 0).
- **Entorno:** Proyecto Angular 19 limpio con Tailwind CSS configurado (visto en `image_3559a1.png`).
- **Último hito completado:** Estructura de gobernanza aprobada, lógica de scraping redirigida a enlaces dinámicos/Deep Linking sin APIs de pago.

## 🛠️ Restricciones de Código Activas (Strict Guardrails)

1. **Estética Obligatoria:** Toda interfaz generada debe usar la paleta de colores Tekken Old-School (`#0a0a0a` de fondo, `#cf1111` acentos de combate, `#119955` acentos Mokujin/descanso) con layouts de alto contraste simulando el HUD de Tekken 5/6.
2. **Estructura Angular:** Los componentes deben ser obligatoriamente Standalone. Se priorizará el uso de `Signals` para la reactividad de la UI (reloj e inputs) y `RxJS` en servicios globales.
3. **Persistencia Local:** Prohibido meter dependencias de bases de datos externas (Firebase, Supabase, PostgreSQL). El único almacenamiento persistente permitido es IndexedDB a través de `Dexie.js` y `LocalStorage`.
4. **Validación de Inputs:** Cualquier string de combo capturado debe ser procesado únicamente por el parser de tokens (`/src/app/shared/utils/notation-parser.ts`) antes de pintarse en el HTML.

## ⚠️ Bloqueos / Impedimentos actuales

- Ninguno. Listos para la inyección de especificaciones modulares (001-004).
