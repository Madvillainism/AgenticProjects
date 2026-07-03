# Spec - Interactive Move List (Notation Parser)

## Descripción

Un visualizador que traduce cadenas de texto plano de la notación universal de Tekken a elementos visuales gráficos en pantalla imitando las cajas de comandos clásicas de Tekken 6.

## Criterios de Aceptación

- Si detecta tokens como `f`, `b`, `d`, `u`, debe transformarlos en sus respectivas flechas vectoriales de dirección.
- Si detecta los números `1`, `2`, `3`, `4` o combinaciones (`1+2`), debe pintar los círculos de colores de los botones arcade oficiales.
