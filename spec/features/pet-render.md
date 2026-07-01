Descripción: Renderizado de la mascota (perro/gato), bucle de animaciones por estados y selector inicial.

Instrucciones para el Subagente de Frontend:

Diseña el layout del renderizador web usando TypeScript nativo, Angular o Astro.

Crea un selector inicial de perfil que permita al usuario elegir el tipo de mascota (perro o gato) para cargar la ruta de sprites correspondiente.

Implementa el bucle de estados de la mascota (idle, walking, sleeping, alerting) modificando las clases de CSS dinámicamente.

Guardarraíles de la IA (Constraints):

🛑 Optimización de Renderizado: Queda estrictamente prohibido usar funciones de control de tiempo en JavaScript (setInterval o bucles while) para mover los frames del sprite. Toda la animación de la hoja de sprites debe delegarse nativamente al motor del navegador usando @keyframes y la propiedad animation-timing-function: steps().

🛑 Fondo Invisible: Asegúrate de que el body y el contenedor principal web tengan propiedades CSS background: transparent !important y overflow: hidden para evitar que se renderice un cuadro blanco sobre el escritorio de Python.
