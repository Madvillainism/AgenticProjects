Descripción: Sistema inteligente de recordatorios de salud, contención del luto y puente de comunicación (IPC).

Instrucciones para el Subagente de Frontend/Backend:

Estructura un archivo JSON con los mensajes de salud (postura, hidratación, pausas visuales) y frases empáticas de acompañamiento.

Diseña en CSS un globo de diálogo (speech bubble) con estética colorida y bordes redondeados sutiles que aparezca justo al lado del sprite de la mascota.

Implementa un canal de comunicación QWebChannel para que, cuando el usuario complete una acción en la burbuja de diálogo (ej: hacer click en "Ya tomé agua"), el frontend le notifique a Python que puede reanudar la caminata libre de la mascota.

Guardarraíles de la IA (Constraints):

🛑 Tono Emocional: El generador de texto no debe usar alarmas del sistema rígidas. Los mensajes deben estar humanizados, simulando la voz afectiva de un animal de compañía (ej: "Humano, mis patitas necesitan que te estires un poco. ¿Hacemos una pausa de 2 minutos?").

🛑 Cero Foco: El despliegue de la burbuja de texto jamás debe activar un evento de focus del sistema que robe el cursor del teclado del usuario mientras redacta o programa en otras apps. Debe aparecer de forma pasiva.
