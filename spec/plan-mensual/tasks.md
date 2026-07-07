# Plan Mensual — Tasks

## Spec
- [x] Crear carpeta `spec/plan-mensual/`
- [x] Crear `spec.md`, `plan.md`, `tasks.md`

## Components
- [ ] Crear `src/components/PlanForm.astro`
- [ ] Crear `src/components/PlanSummary.astro`
- [ ] Crear `src/pages/plan.astro`

## Formulario
- [ ] Campos: Ingreso, Gastos Fijos, Meta Ahorro
- [ ] Campos: 4 Pilares (Necesidades, Deseos, Cultura, Imprevistos)
- [ ] Cálculo automático: Dinero Disponible y Dinero para Gastar
- [ ] Validación: ahorro <= disponible
- [ ] Validación: suma pilares == dinero para gastar
- [ ] Validación: imprevistos > 0
- [ ] Botón "Guardar Plan" con placeholder

## Review
- [ ] Build exitoso (0 errores)
- [ ] Ruta `/plan` accesible desde navbar
- [ ] Cálculos correctos en tiempo real
