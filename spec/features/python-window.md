Descripción: Inicialización de la ventana nativa translúcida del Sistema Operativo y control de coordenadas en el escritorio.

Instrucciones para el Subagente de Backend:

Crea el script principal en Python (main.py) utilizando PyQt6 o PySide6.

Configura la ventana principal con los flags obligatorios: sin bordes (FramelessWindowHint) y siempre visible en la capa superior (WindowStaysOnTopHint).

Instancia un componente QWebEngineView que ocupe el 100% de la ventana y cárgale la URL del servidor local de desarrollo (o el archivo index.html compilado).

Desarrolla un bucle matemático asíncrono con QTimer que desplace la ventana aleatoriamente por los límites de la pantalla del S.O. simulando el patrullaje de la mascota.

Guardarraíles de la IA (Constraints):

🛑 Veto de Entrada: Debes aplicar Qt.WindowType.WindowTransparentForInput dinámicamente cuando el cursor pase por las zonas transparentes de la interfaz para que el usuario pueda hacer click "a través" de la app en su entorno de trabajo.

🛑 Detección de Bordes: La física de movimiento debe restar las dimensiones exactas del viewport de la mascota para evitar que la mitad de su cuerpo desaparezca por los bordes de la pantalla.
