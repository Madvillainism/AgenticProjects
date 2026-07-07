# Summary Cards — Especificación

## Propósito
Mostrar un resumen visual rápido de las finanzas del usuario en la página de inicio: Ingresos totales, Gastos totales y Balance general.

## Referencia de diseño
Dashboard musical oscuro con glassmorphism, gradientes sutiles y tipografía limpia. Las cards siguen esa estética: fondo semitransparente, bordes sutiles, íconos destacados y montos en tipografía bold.

## Layout (Desktop-only)
```css
display: grid;
grid-template-columns: repeat(3, 1fr);
gap: 1.5rem;
```
Sin media queries, sin responsive.

## Cards

### 1. Ingresos
- **Ícono:** `mdi:arrow-up-bold`
- **Color acento:** `--dorado` (#BDBF7F)
- **Label:** "INGRESOS"
- **Valor:** $0.00 (placeholder)

### 2. Gastos
- **Ícono:** `mdi:arrow-down-bold`
- **Color acento:** `--rojo` (#D3381C)
- **Label:** "GASTOS"
- **Valor:** $0.00 (placeholder)

### 3. Balance
- **Ícono:** `mdi:wallet`
- **Color acento:** `--text-primary` (#F5F5F5)
- **Label:** "BALANCE"
- **Valor:** $0.00 (placeholder)

## Estilos compartidos
- Fondo: `var(--surface)`
- Borde: `1px solid var(--border)`
- Border-radius: `12px`
- Padding: `1.5rem`
- Glassmorphism ligero
- Tipografía: Plus Jakarta Sans
