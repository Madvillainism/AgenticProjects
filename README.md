# Amaterasu Store — Graffiti Edition

Catálogo mobile-first con estética urbana/graffiti, animaciones fluidas, buscador interactivo y carrito con toast. Construido con **Astro 7** + **Vanilla JS** (0 dependencias de framework).

`ash
npm install
npm run dev       # http://localhost:4321
npm run build     # → dist/
npm run preview   # Vista previa del build
`

---

## Stack

| Tecnología | Propósito |
|---|---|
| **Astro 7** | Static Site Generator — cero JS en página renderizada |
| **CSS Grid + Custom Properties** | Layout responsive sin frameworks externos |
| **Vanilla JS** | Carrito + búsqueda (localStorage, toast, drawer) |
| **Unsplash** | Imágenes urbanas libres de regalías |

## Estética Graffiti (Sutil)

| Variable | Color | Uso |
|---|---|---|
| --charcoal | #0a0a0a | Fondo principal |
| --concrete | #1a1a1a | Cards, superficies |
| --concrete-light | #2a2a2a | Bordes, separadores |
| --neon-cyan | #00f0ff | CTAs, glows, acentos |
| --neon-magenta | #ff00aa | Badges, highlights |
| --neon-yellow | #ffe600 | Precios |

- **Tipografía**: Bebas Neue (títulos urbanos) + Inter (cuerpo legible)
- **Grain texture**: Overlay SVG de ruido fractal en ody::after — textura mural sutil
- **Drip dividers**: SVG decorativos tipo drip entre secciones (cyan/magenta/yellow)
- **Tag accents**: Texto "AMATERASU" vertical en productos, spray icon en hero

## Arquitectura

`
amaterasu-store/
├── public/
│   ├── images/
│   │   ├── hero.jpg              # Hero (graffiti mural, 634KB)
│   │   ├── jersey.jpg            # Kits / productos
│   │   ├── chain.jpg             # Chains
│   │   ├── streetwear.jpg        # Streetwear
│   │   ├── tattoo.jpg            # Tattoos
│   │   ├── hoodie.jpg            # Hoodie
│   │   ├── ring.jpg              # Ring
│   │   ├── testimonial1-3.jpg    # 3 avatares testimonios
│   │   ├── drip-divider.svg      # SVG decorativo drip
│   │   └── spray-icon.svg        # SVG spray can
│   ├── scripts/
│   │   └── cart.js               # JS vanilla: carrito + toast
│   └── favicon.svg
├── src/
│   ├── components/               # 9 componentes Astro
│   │   ├── Header.astro          # Nav + search toggle + cart badge
│   │   ├── Hero.astro            # Fullscreen parallax + spray-in
│   │   ├── ProductCard.astro     # Card con badges, tag, neonPulse
│   │   ├── ProductGrid.astro     # Grid responsive + data injection
│   │   ├── CategorySection.astro # 3 categorías con border glow
│   │   ├── CartDrawer.astro      # Drawer lateral con slide-in
│   │   ├── Testimonials.astro    # 3 testimonios con drip dividers
│   │   ├── Footer.astro          # Social + copyright
│   │   └── SearchOverlay.astro   # Búsqueda + filtros + JS embebido
│   ├── layouts/
│   │   └── BaseLayout.astro      # Meta, fonts, grain, toast, scripts
│   ├── pages/
│   │   └── index.astro           # Página única (Hero → Cat → Products → Testimonials)
│   ├── data/
│   │   └── products.json         # 8 productos mock con badges
│   └── styles/
│       ├── graffiti.css          # Variables, reset, search, toast, buttons
│       ├── grid.css              # CSS Grid 1→2→3 columnas
│       └── animations.css        # Todos los @keyframes + micro-interacciones
├── .gitignore
├── astro.config.mjs
├── package.json
├── tsconfig.json
└── README.md
`

## CSS Grid (Mobile-First)

| Viewport | Columnas | Gap | Padding |
|---|---|---|---|
| < 600px | 1 | 1rem | 1rem |
| 600px+ | 2 | 1.25rem | 1.5rem |
| 1024px+ | 3 | 1.5rem | 2rem (max-width: 1200px) |

## Animaciones y Micro-interacciones

| Animación | Elemento | Efecto |
|---|---|---|
| 
eonPulse | .product-card | Brillo neón pulsante infinito (cyan/magenta) |
| staggerFadeIn | .product-card | Entrada escalonada (delays 0–350ms) |
| dripPulse | .section-title | Leve movimiento vertical tipo drip |
| sprayIn | .hero__content | Revelado con clip-path circular |
| heroParallax | .hero__bg | Parallax suave al scroll (CSS scroll-driven) |
| priceGlow | .card__price | Brillo dorado pulsante en precios |
| orderGlow | .category__image-wrap | Borde alterna cyan/magenta |
| slideInRight | .drawer__item | Entrada lateral al abrir carrito |
| loatEmpty | .drawer__empty svg | Flotación suave del icono vacío |
| checkoutPulse | .drawer__checkout | Pulso magenta en botón checkout |
| cartBounce | .cart-badge | Rebote al agregar items |
| 	oastIn/Out | #cartToast | Notificación slide up + fade |
| Ripple | .btn::after | Radial gradient en click |

Todas las animaciones se desactivan con prefers-reduced-motion: reduce.

## Search UI

- **Overlay**: Fullscreen con ackdrop-filter: blur(8px)
- **Input**: Búsqueda en tiempo real con debounce 150ms
- **Filtros**: Botones por categoría (All, Kits, Chains, Streetwear, Tattoos)
- **Resultados**: Grid de items con imagen, nombre y precio
- **Cerrar**: Botón X, click en overlay, tecla Escape
- **Animación**: Resultados con staggerFadeIn

## Carrito (Vanilla JS)

- **Estado**: Array en memoria + persistencia localStorage
- **Toast**: Notificación animada al agregar/remover items
- **Drawer**: Slide-in lateral con cubic-bezier(0.4, 0, 0.2, 1)
- **Cantidad**: Botones +/− con feedback neón en active
- **Badge**: Contador con animación bounce
- **Cerrar**: Botón X, overlay, Escape

## Products JSON

`json
{
  "id": 1,
  "name": "Graffiti Kit",
  "category": "Kits",
  "price": 25,
  "currency": "$",
  "image": "/images/jersey.jpg",
  "description": "Bold street-ready jersey with custom graffiti print.",
  "badges": ["Edición Callejera", "Neón"],
  "featured": true
}
`

Campos: id, name, category, price, currency, image, description, badges (tags visuales), featured.

## Comandos

`ash
npm install        # Instalar dependencias
npm run dev        # Servidor desarrollo (localhost:4321)
npm run build      # Build producción → dist/
npm run preview    # Vista previa del build
`

## Fases de Desarrollo

| Fase | Descripción |
|---|---|
| 1 | Setup Astro, estructura, .gitignore, configs |
| 2 | products.json, 9 componentes, layout, estilos graffiti |
| 3 | CSS Grid, animaciones, micro-interacciones, drip dividers |
| 4 | Fix cart.js, search UI, toast, decorative SVGs, README |