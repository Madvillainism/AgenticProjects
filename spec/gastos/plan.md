# Gastos — Plan de Implementación

## Paso 1: Crear `src/components/ExpenseForm.astro`
- Campos: fecha, categoría, monto, descripción
- Botón "Registrar Gasto"
- Dispara evento personalizado o llama a función global

## Paso 2: Crear `src/components/ExpenseTable.astro`
- Tabla con columnas Fecha | Categoría | Monto | Descripción | Acción
- Filtro por categoría
- Totales por categoría en footer
- Botón eliminar por fila

## Paso 3: Crear `src/pages/gastos.astro`
- Layout 2 columnas grid (35/65)
- Importa BaseLayout + ExpenseForm + ExpenseTable
- `<script>` global para estado compartido (array de gastos)

## Paso 4: Verificar
- Build exitoso
- Formulario agrega filas a la tabla
- Eliminar funciona
- Filtro por categoría funciona
