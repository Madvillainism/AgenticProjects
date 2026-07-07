# Summary Cards — Plan de Implementación

## Paso 1: Crear `src/components/SummaryCards.astro`
- Importar `Icon` desde astro-icon/components
- 3 `<article>` cards dentro de un `<section>` grid
- Cada card: header (icon + h2 label) + p.amount
- Estilos scoped con CSS Grid 3 columnas

## Paso 2: Integrar en `src/pages/index.astro`
- Importar `SummaryCards` desde components
- Colocar dentro de `<BaseLayout>` después del título

## Paso 3: Verificar
- `astro build` → 0 errores
- `astro dev` → cards visibles con estilos correctos
