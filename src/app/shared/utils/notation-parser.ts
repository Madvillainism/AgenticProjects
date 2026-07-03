import type { NotationToken } from '../models/notation.model';

const ARROW_MAP: Record<string, string> = {
  u: '↑',
  d: '↓',
  f: '→',
  b: '←',
  uf: '↗',
  df: '↘',
  ub: '↖',
  db: '↙',
  n: '',
};

const ARROWS = new Set(Object.keys(ARROW_MAP));
const BUTTON_RE = /^[1-4]$/;
const COMBO_RE = /^[1-4]\+[1-4]$/;

export function parseTekkenNotation(input: string): NotationToken[] {
  const tokens: NotationToken[] = [];
  const parts = input.split(',').map(p => p.trim()).filter(Boolean);

  for (const part of parts) {
    const lower = part.toLowerCase();

    if (ARROWS.has(lower)) {
      const arrow = ARROW_MAP[lower];
      tokens.push({ type: 'arrow', value: arrow || '·' });
    } else if (lower === 'n') {
      tokens.push({ type: 'neutral', value: '·' });
    } else if (COMBO_RE.test(lower)) {
      tokens.push({ type: 'combo', value: part });
    } else if (BUTTON_RE.test(lower)) {
      tokens.push({ type: 'button', value: part });
    } else {
      tokens.push({ type: 'text', value: part });
    }
  }

  return tokens;
}
