Descripción: Sistema inteligente de recordatorios de salud, contención del luto y puente de comunicación (IPC).

Instrucciones para el Subagente de Frontend/Backend:

1. Estructurar un archivo JSON con los mensajes de salud (postura, hidratación, pausas visuales) y frases empáticas de acompañamiento.

2. Diseñar en CSS un globo de diálogo (speech bubble) con estética colorida y bordes redondeados sutiles que aparezca justo al lado del sprite de la mascota.

3. Implementar un canal de comunicación mediante comandos Tauri (`#[tauri::command]`) y eventos (`emit()`/`listen()`). Cuando el usuario complete una acción en la burbuja de diálogo (ej: hacer click en "Ya tomé agua"), el frontend debe invocar `invoke('action_completed')` y el backend de Rust debe emitir el evento `patrol-moving` para reanudar la caminata libre de la mascota.

Guardarraíles de la IA (Constraints):

🛑 Tono Emocional: El generador de texto no debe usar alarmas del sistema rígidas. Los mensajes deben estar humanizados, simulando la voz afectiva de un animal de compañía (ej: "Humano, mis patitas necesitan que te estires un poco. ¿Hacemos una pausa de 2 minutos?").

🛑 Cero Foco: El despliegue de la burbuja de texto jamás debe activar un evento de focus del sistema que robe el cursor del teclado del usuario mientras redacta o programa en otras apps. Debe aparecer de forma pasiva. Usar `pointer-events: none` en el contenedor y nunca llamar `.focus()` desde JS.

🛑 IPC: Toda comunicación frontend↔backend debe usar `invoke()` / `listen()` de Tauri, no APIs de WebChannel ni puentes URL personalizados.
