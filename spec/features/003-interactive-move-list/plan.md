# Plan de Implementación - Notation Parser

- **Tokenizer Engine:** Crear un pipe o función pura en TypeScript `TekkenNotationParser` que use expresiones regulares (RegEx) para romper el string (ej: `"f, n, d, d/f+2"`) en un array de objetos visuales:
  `[{ type: 'arrow', val: 'f' }, { type: 'neutral' }, { type: 'button', val: '2' }]`.
- **Renderizado:** Un bucle `*ngFor` que pinte componentes pequeños de botones con fuentes retro de PlayStation.
