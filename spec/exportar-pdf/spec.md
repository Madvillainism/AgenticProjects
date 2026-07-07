# Exportar PDF — Especificación

## Propósito
Generar un PDF descargable con el resumen mensual completo: plan, gastos reales, comparativa y reflexión.

## Disparador
Botón "Descargar PDF" en página de Reflexión (y opcionalmente en Home).

## Implementación (por decidir)
- Opción A: `jsPDF` + `html2canvas` — renderiza HTML a canvas y lo incrusta en PDF
- Opción B: Print API nativa del navegador (`window.print()` con CSS `@media print`)
- Opción C: `@react-pdf/renderer` (si migramos a React)

## Contenido del PDF
1. **Encabezado:** Logo Kakeibo, mes/año, "Resumen Mensual"
2. **Plan:** Ingreso, Gastos Fijos, Meta Ahorro, Dinero Disponible, Dinero para Gastar
3. **Real:** Totales por pilar (Necesidades, Deseos, Cultura, Imprevistos)
4. **Comparativa:** Tabla Plan vs Real con diferencia
5. **Reflexión:** Notas del usuario
6. **Balance final:** Ingreso - Gastos = Ahorro Real
7. **Footer:** "Generado por Kakeibo"

## Componentes
- `ExportPDF.astro` — botón + lógica (oculto hasta implementar librería)
