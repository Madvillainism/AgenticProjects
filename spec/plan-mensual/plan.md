# Plan Mensual — Plan de Implementación

## Paso 1: Crear `src/components/PlanForm.astro`
- Formulario con 3 secciones (ingreso/gastos, ahorro, pilares)
- Labels + inputs + validación visual
- Botón "Guardar Plan"
- `<script>` inline para cálculos automáticos y validación en tiempo real

## Paso 2: Crear `src/components/PlanSummary.astro`
- Panel derecho con resumen de valores ingresados
- Muestra: Ingreso, Gastos Fijos, Dinero Disponible, Meta Ahorro, Dinero para Gastar
- Progreso de pilares vs total

## Paso 3: Crear `src/pages/plan.astro`
- Layout: 2 columnas grid (60/40)
- Importa BaseLayout + PlanForm + PlanSummary

## Paso 4: Verificar
- `astro build` → 0 errores
- Navegación desde navbar funciona
- Formulario calcula correctamente
