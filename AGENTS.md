# MokuApp - Multi-Agent Registry & Skills Matrix

Este archivo coordina el comportamiento, los límites de edición y las habilidades del ecosistema de IAs que operan bajo OpenCode.

## 👥 Perfiles de Agentes Autorizados

### 1. 🥇 `Moku-Orchestrator` (Agente Líder)

- **Rol:** Diseñador principal del software y validador de contratos técnicos.
- **Habilidades Asignadas (`skills.sh`):** Control global de contexto, lectura/escritura en el árbol `spec/`.
- **Responsabilidad:** Lee los cambios introducidos por el usuario, actualiza el `CONTEXT.md` y delega las tareas atómicas a los agentes correspondientes mediante checklists de `tasks.md`. No escribe código de aplicación directo.

### 2. ⏱️ `Chrono-Agent` (Especialista en Tiempo y Estado)

- **Rol:** Implementador de lógica reactiva y control síncrono.
- **Habilidades Asignadas (`skills.sh`):** `angular/reactive-state-rxjs`, Web Workers integration.
- **Responsabilidad:** Escribir el `PomodoroService`, controlar que los timers no se desfasen en segundo plano y asegurar el flujo de los Drills de la feature `001-pomodoro-drills`.

### 3. 🎨 `Arcade-HUD-Agent` (Desarrollador de UI/UX)

- **Rol:** Diseñador frontend y maquetador de fidelidad visual.
- **Habilidades Asignadas (`skills.sh`):** Tailwind advanced shaders, SVG injection.
- **Responsabilidad:** Asegurar el look & feel nostálgico de Tekken 4/5/6. Desarrollar el componente del Parser de notación (`003-interactive-move-list`) transformando strings de texto en botones físicos interactivos.

### 4. 💾 `Mokujin-Memory-Agent` (Especialista en Datos locales)

- **Rol:** Desarrollador de almacenamiento, persistencia y enlazado URL.
- **Habilidades Asignadas (`skills.sh`):** `local-storage/dexie-indexeddb`, URL-sanitizer.
- **Responsabilidad:** Controlar las transacciones de las tareas (`002-todos-training`), estructurar el JSON estático de Pro-players mundiales y armar las búsquedas codificadas sin API de la feature `004-combo-inspo`.

## 🔄 Protocolo de Comunicación Inter-Agente (Pipeline de Validación)

1. `Moku-Orchestrator` habilita una tarea de un `tasks.md`.
2. El agente asignado escribe el código bajo los límites estrictos de `CONTEXT.md`.
3. Antes de hacer commit o marcar como completado, el agente debe pasar el código por el filtro de `Arcade-HUD-Agent` (si altera lo visual) o `Mokujin-Memory-Agent` (si altera la persistencia) para asegurar la cohesión del Dojo.
