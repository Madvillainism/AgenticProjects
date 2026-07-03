# Plan de Implementación - Pomodoro Drills

- **State Management:** Crear un `PomodoroService` que encapsule un intervalo mediante RxJS o un Timer basado en Web Workers (para evitar retrasos cuando la pestaña no está enfocada).
- **UI Interaction:** Estilos dinámicos de Tailwind enlazados al estado (`'COMBAT' | 'REST' | 'IDLE'`).
- **Persistencia:** Almacenar la marca de tiempo del fin de ciclo en `localStorage` para contrastar en el hook de inicialización `ngOnInit`.
