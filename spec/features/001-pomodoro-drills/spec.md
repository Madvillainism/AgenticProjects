# Spec - Pomodoro Drills (Mokujin Combat & Rest Rounds)

## Descripción

Un temporizador de intervalos enfocado que controla los tiempos de práctica del jugador.

- **Modo Combate (Práctica):** 25 minutos. HUD con la barra de vida de Mokujin bajando y colores rojo/ámbar (Tekken 5 style).
- **Modo Rest (Descanso):** 5 minutos. Fondo verde musgo tenue con Mokujin en pose de meditación.

## Criterios de Aceptación

- Al llegar a 00:00, debe disparar un evento de sonido nativo ("Time Up!").
- El reloj debe pausarse, reiniciarse y saltar de bloque usando Signals de Angular para evitar re-renderizados costosos.
- Debe persistir el estado si se refresca la pestaña.
