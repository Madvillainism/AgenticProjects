export type ThrowBreakType = '1' | '2' | '1+2';

export type ThrowResult = 'correct' | 'slow' | 'wrong' | 'none';

export type BreakPhase = 'idle' | 'throwing' | 'result';

export const THROW_LABELS: Record<ThrowBreakType, string> = {
  '1': 'LEFT',
  '2': 'RIGHT',
  '1+2': 'BOTH',
};

export const THROW_INPUTS: Record<string, ThrowBreakType> = {
  'j': '1',
  'J': '1',
  'k': '2',
  'K': '2',
  'l': '1+2',
  'L': '1+2',
};

export const BREAK_WINDOW_FRAMES = 20;

export interface ThrowSessionStats {
  id?: number;
  date: Date;
  totalThrows: number;
  correct: number;
  slow: number;
  wrong: number;
  highestStreak: number;
}
