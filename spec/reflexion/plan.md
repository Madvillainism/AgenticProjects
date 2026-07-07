# Reflexión — Plan de Implementación

## Paso 1: Crear `src/components/ReflectionCompare.astro`
- Obtener plan del mes (del array/estado global, eventualmente de DB)
- Obtener gastos del mes
- Calcular totales por pilar
- Renderizar tabla comparativa con barras de progreso

## Paso 2: Crear `src/components/ReflectionJournal.astro`
- 2 textareas + checkbox + botón "Archivar Mes"
- Estados vacío/completo

## Paso 3: Crear `src/pages/reflexion.astro`
- Layout 2 columnas grid (55/45)
- Importa BaseLayout + ReflectionCompare + ReflectionJournal
- Manejo de estado: sin plan, sin gastos, completo

## Paso 4: Verificar
- Build exitoso
- Navegación desde navbar
