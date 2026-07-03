export type PomodoroPhase = 'IDLE' | 'COMBAT' | 'REST';

export interface PomodoroState {
  phase: PomodoroPhase;
  remainingSeconds: number;
  totalSeconds: number;
}
