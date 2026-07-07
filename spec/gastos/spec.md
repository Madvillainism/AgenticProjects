# Gastos — Especificación

## Propósito
Registro diario de gastos. Formulario para agregar gastos individuales y tabla para visualizar/listar/filtrar los gastos del mes.

## Ruta
`/gastos`

## Layout (Desktop-only)
2 columnas:
- **Izquierda (35%):** Formulario de registro
- **Derecha (65%):** Tabla de gastos con filtros

## Formulario
| Campo | Tipo | Opciones |
|-------|------|----------|
| Fecha | date | Hoy por defecto |
| Categoría | select | Necesidades, Deseos, Cultura, Imprevistos |
| Monto | number | > 0, step 0.01 |
| Descripción | text | Opcional, placeholder "¿En qué gastaste?" |
| Botón | submit | "Registrar Gasto" |

## Tabla de Gastos
Columnas: Fecha | Categoría | Monto | Descripción | Acción (Eliminar)

- Orden: por fecha descendente (más reciente primero)
- Totales por categoría en footer
- Filtro rápido: tabs o dropdown para filtrar por categoría

## Sin persistencia
Gastos se almacenan en un array en memoria (JS). Se pierde al recargar.

## Componentes
- `ExpenseForm.astro` — formulario
- `ExpenseTable.astro` — tabla con filtros y totales
- `ExpenseRow.astro` — fila individual (opcional, inline en tabla)
