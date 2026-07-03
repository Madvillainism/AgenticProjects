import { Injectable, signal } from '@angular/core';
import { interval, Subscription } from 'rxjs';
import type { ThrowBreakType, ThrowResult, BreakPhase } from '../models/throw-break.model';
import { BREAK_WINDOW_FRAMES } from '../models/throw-break.model';

const STREAK_KEY = 'moku_throw_streak';

@Injectable({ providedIn: 'root' })
export class ThrowBreakService {
  phase = signal<BreakPhase>('idle');
  throwType = signal<ThrowBreakType | null>(null);
  frame = signal(0);
  result = signal<ThrowResult>('none');
  streak = signal(0);
  highestStreak = signal(0);

  enabledTypes = signal<ThrowBreakType[]>(['1', '2', '1+2']);
  speed = signal(1);
  isStanding = signal(true);

  totalThrows = signal(0);
  correct = signal(0);
  slow = signal(0);
  wrong = signal(0);

  private sub: Subscription | null = null;
  private nextTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    const saved = localStorage.getItem(STREAK_KEY);
    if (saved) this.highestStreak.set(parseInt(saved, 10));
  }

  startRound(): void {
    this.cleanup();
    const types = this.enabledTypes();
    if (types.length === 0) return;
    const pick = types[Math.floor(Math.random() * types.length)];
    this.throwType.set(pick);
    this.frame.set(0);
    this.result.set('none');
    this.phase.set('throwing');

    const msPerFrame = Math.max(4, Math.round(16.67 / this.speed()));
    this.sub = interval(msPerFrame).subscribe(() => {
      const f = this.frame() + 1;
      this.frame.set(f);
      if (f > BREAK_WINDOW_FRAMES) {
        this.sub?.unsubscribe();
        this.evaluate(null);
      }
    });
  }

  handleInput(input: ThrowBreakType): void {
    if (this.phase() !== 'throwing') return;
    this.sub?.unsubscribe();
    this.evaluate(input);
  }

  private evaluate(input: ThrowBreakType | null): void {
    this.phase.set('result');
    const answer = this.throwType();
    const f = this.frame();

    let result: ThrowResult;
    if (input === null) {
      result = 'wrong';
    } else if (input === answer && f <= BREAK_WINDOW_FRAMES) {
      result = 'correct';
    } else if (input === answer) {
      result = 'slow';
    } else {
      result = 'wrong';
    }
    this.result.set(result);

    if (result === 'correct') {
      this.streak.update(s => s + 1);
      if (this.streak() > this.highestStreak()) {
        this.highestStreak.set(this.streak());
        localStorage.setItem(STREAK_KEY, this.streak().toString());
      }
    } else {
      this.streak.set(0);
    }

    this.totalThrows.update(s => s + 1);
    if (result === 'correct') this.correct.update(s => s + 1);
    else if (result === 'slow') this.slow.update(s => s + 1);
    else this.wrong.update(s => s + 1);

    const delay = result === 'correct' ? 250 : 2000;
    this.nextTimeout = setTimeout(() => this.startRound(), delay / this.speed());
  }

  stop(): void {
    this.cleanup();
    this.phase.set('idle');
  }

  private cleanup(): void {
    this.sub?.unsubscribe();
    this.sub = null;
    if (this.nextTimeout !== null) {
      clearTimeout(this.nextTimeout);
      this.nextTimeout = null;
    }
  }

  resetSession(): void {
    this.totalThrows.set(0);
    this.correct.set(0);
    this.slow.set(0);
    this.wrong.set(0);
    this.streak.set(0);
  }
}
