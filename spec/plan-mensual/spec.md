# Plan Mensual — Especificación

## Propósito
Formulario para declarar el plan financiero mensual según el método Kakebo: ingreso, gastos fijos, meta de ahorro y distribución en 4 pilares.

## Ruta
`/plan`

## Layout (Desktop-only)
2 columnas:
- **Izquierda (60%):** Formulario con campos
- **Derecha (40%):** Resumen automático con cálculos

## Formulario

### Sección 1: Ingreso y Gastos Fijos
| Campo | Tipo | Validación |
|-------|------|------------|
| Ingreso Mensual | number | > 0 |
| Gastos Fijos | number | >= 0 |

→ **Dinero Disponible** = Ingreso - Gastos Fijos (calculado automático)

### Sección 2: Ahorro
| Campo | Tipo | Validación |
|-------|------|------------|
| Meta de Ahorro | number | >= 0 y <= Dinero Disponible |

→ **Dinero para Gastar** = Dinero Disponible - Meta de Ahorro (calculado automático)

### Sección 3: 4 Pilares
| Pilar | Validación |
|-------|------------|
| Necesidades | >= 0 |
| Deseos | >= 0 |
| Cultura | >= 0 |
| Imprevistos | > 0 (mínimo 1) |

Regla: `Necesidades + Deseos + Cultura + Imprevistos == Dinero para Gastar`
Validación en tiempo real: mostrar error si la suma no coincide.

### Acción
- Botón "Guardar Plan" (sin persistencia aún — muestra alerta/console.log)

## Resumen (columna derecha)
- Ingreso: $X
- Gastos Fijos: -$X
- **Dinero Disponible:** $X
- Meta de Ahorro: -$X
- **Dinero para Gastar:** $X
- Pilares: $X / $X (progreso)

## Componentes
- `PlanForm.astro` — formulario completo con estados
- `PlanSummary.astro` — panel derecho con cálculos

## Estados visuales
- Input focus: borde color acento
- Error: borde rojo + mensaje
- Cálculos automáticos en tiempo real (JS en `<script>`)
