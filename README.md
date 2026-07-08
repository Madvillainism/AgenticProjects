# Kakeibo

Aplicación de finanzas conscientes basada en el método Kakebo. Persistencia local vía Dexie.js (IndexedDB) con gráficos Chart.js y modo oscuro.

## Stack
- **Framework:** Astro 7
- **CSS:** Vanilla CSS con custom properties (tema violeta / Frutiger Metro)
- **Persistencia:** Dexie.js (IndexedDB) + localStorage sync
- **Gráficos:** Chart.js (doughnut, tooltips interactivos)
- **Íconos:** astro-icon + @iconify-json/mdi
- **Tipografía:** Plus Jakarta Sans
- **Tests:** Playwright (7 E2E tests)

## Arquitectura

| Capa | Tecnología |
|------|-----------|
| UI | Astro components + Vanilla CSS |
| CRUD | `src/lib/db.js` — Dexie.js con sync a localStorage |
| Gráficos | Chart.js (tree-shaken: DoughnutController, ArcElement, Tooltip) |
| Tests | Playwright con servidor dev integrado |

### Flujo de datos
```
Form → db.js (savePlan/addEntry/saveReflection) → Dexie (IndexedDB) → sync a localStorage
```

## Features
- **Dashboard principal:** SummaryCards, MonthlyBreakdown (donut Chart.js + categorías), RecentExpenses, ArchivedMonths
- **Plan Mensual:** Formulario Kakebo (ingreso, gastos fijos, ahorro, 4 pilares)
- **Gastos:** Registro diario por categoría, filtros, totales, eliminación
- **Reflexión:** Comparativa Plan vs Real (tabla + donut), diario de reflexión, archivar mes
- **PDF:** Descarga de reporte mensual por mes archivado
- **Snapshot:** Charts interactivos con tooltips y colores del tema

## Comandos

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia servidor de desarrollo |
| `npm run build` | Build a `dist/` |
| `npm run preview` | Previsualiza el build |
| `npm test` | Ejecuta E2E tests con Playwright |

## Especificaciones
Las features se especifican en `/spec/` con tres archivos por feature:
- `spec.md` — Especificación de diseño y datos
- `plan.md` — Plan de implementación
- `tasks.md` — Checklist de tareas
