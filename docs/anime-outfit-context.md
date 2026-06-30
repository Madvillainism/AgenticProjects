# Contexto del Proyecto: Generador de Outfits Anime & Pokémon

## Tecnologías y Estructura

- **Framework:** Angular 17+ (Componentes Standalone).
- **Lógica de Estado:** Angular Signals para manejar el formulario, las sugerencias y el resultado del outfit.
- **Estilos:** SCSS con Angular Material

## Directrices de Diseño (Estilo Anime/Gaming)

1. **Estética:** Colorida, vibrante e intuitiva.
2. **Componentes Visuales:**
   - Bordes redondeados sutiles (`rounded-xl` o `rounded-2xl`).
   - Efectos visuales sencillos pero atractivos: sombras suaves (`shadow-md`), transiciones de escala al hacer hover en botones (`hover:scale-105 transition-all duration-200`).
   - Fondos dinámicos (ej: gradientes sutiles estilo anime como `bg-gradient-to-br from-violet-100 to-pink-100`).

## Especificaciones del Formulario y Datos

1. **Inputs Clave:**
   - Textarea para la descripción libre del estilo deseado.
   - Radio buttons o select para Género inclusivo: Masculino (M), Femenino (F) o No Binario / X (X).
   - Selector de Categoría: Peinado, Outfit Completo o Accesorios.
2. **Sugerencias de PokeAPI (`pokeapi.co`):**
   - El componente debe consumir la PokeAPI para mostrar una lista de sugerencias rápidas (ej: nombres de Pokémon populares como Pikachu, Charizard, Gengar) en forma de etiquetas/badges clickeables que autorellenan o complementan el textarea.
3. **Estructura del Resultado:**
   - Una imagen principal representativa (URL simulada de banco de imágenes gratuito como Unsplash o Pinterest embed).
   - Un desglose dinámico detallando cada pieza generada (ej: Gorro, Pantalón, Franela, Accesorios) con una descripción breve al lado.
