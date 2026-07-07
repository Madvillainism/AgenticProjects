# Reflexión — Especificación

## Propósito
Cierre de mes: comparar el plan mensual contra los gastos reales y escribir una reflexión.

## Ruta
`/reflexion`

## Layout (Desktop-only)
2 columnas:
- **Izquierda (55%):** Comparativa Plan vs Real
- **Derecha (45%):** Diario de reflexión

## Comparativa Plan vs Real
- Tabla con filas: Necesidades, Deseos, Cultura, Imprevistos, Total
- Columnas: Pilar | Plan | Real | Diferencia ($) | Diferencia (%)
- Barra de progreso visual por pilar
- Destacar en rojo si Real > Plan (sobrepaso), verde si Real <= Plan

## Estados
- **Sin plan:** "Primero crea un plan mensual en /plan"
- **Sin gastos:** "No hay gastos registrados este mes"
- **Completo:** Tabla + reflexión

## Diario de Reflexión
- Textarea: "¿Qué aprendiste este mes?"
- Textarea: "¿Qué puedes mejorar el próximo mes?"
- Botón "Archivar Mes" (sin persistencia — solo alert)
- Checkbox: "¿Cumpliste tu meta de ahorro?"

## Componentes
- `ReflectionCompare.astro` — tabla comparativa
- `ReflectionJournal.astro` — diario + archivar
