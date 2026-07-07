# Kakeibo

Aplicación de finanzas conscientes basada en el método Kakebo.

## Stack
- **Framework:** Astro 7 (static)
- **CSS:** Vanilla CSS con custom properties
- **Íconos:** astro-icon + @iconify-json/mdi
- **Tipografía:** Plus Jakarta Sans

## Especificaciones
Las features se especifican en `/spec/` con tres archivos por feature:
- `spec.md` — Especificación de diseño y datos
- `plan.md` — Plan de implementación
- `tasks.md` — Checklist de tareas

### Features (Implementadas)
- [Summary Cards](/spec/summary-cards/) — Dashboard con cards de ingresos, gastos y balance
- [Plan Mensual](/spec/plan-mensual/) — Formulario del ciclo Kakebo
- [Gastos](/spec/gastos/) — Ledger diario de gastos

### Features (En especificación)
- [Reflexión](/spec/reflexion/) — Cierre de mes y comparativa Plan vs Real
- [Exportar PDF](/spec/exportar-pdf/) — Descarga de resumen mensual en PDF
- [SQLite Database](/spec/sqlite-database/) — Persistencia local (futuro)

## Comandos
| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia servidor de desarrollo |
| `npm run build` | Build estático a `dist/` |
| `npm run preview` | Previsualiza el build |
