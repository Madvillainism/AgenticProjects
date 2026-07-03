import { Injectable, signal, computed } from '@angular/core';
import { interval, Subscription } from 'rxjs';
import type { PomodoroPhase } from '../models/pomodoro.model';

const COMBAT_MINUTES = 10;
const REST_MINUTES = 5;
const STORAGE_KEY = 'moku_pomodoro';

@Injectable({ providedIn: 'root' })
export class PomodoroService {
  phase = signal<PomodoroPhase>('IDLE');
  remainingSeconds = signal(0);
  totalSeconds = signal(COMBAT_MINUTES * 60);

  progress = computed(() =>
    this.totalSeconds() > 0
      ? 1 - this.remainingSeconds() / this.totalSeconds()
      : 0
  );

  formattedTime = computed(() => {
    const m = Math.floor(this.remainingSeconds() / 60);
    const s = this.remainingSeconds() % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  });

  isRunning = signal(false);
  private timerSub: Subscription | null = null;

  start(): void {
    if (this.phase() === 'IDLE') {
      this.phase.set('COMBAT');
      this.totalSeconds.set(COMBAT_MINUTES * 60);
      this.remainingSeconds.set(COMBAT_MINUTES * 60);
    }
    this.isRunning.set(true);
    this.timerSub = interval(1000).subscribe(() => this.tick());
  }

  pause(): void {
    this.isRunning.set(false);
    this.timerSub?.unsubscribe();
    this.timerSub = null;
  }

  reset(): void {
    this.pause();
    this.phase.set('IDLE');
    this.remainingSeconds.set(0);
    this.totalSeconds.set(COMBAT_MINUTES * 60);
    localStorage.removeItem(STORAGE_KEY);
  }

  private tick(): void {
    const remaining = this.remainingSeconds() - 1;
    if (remaining <= 0) {
      this.pause();
      if (this.phase() === 'COMBAT') {
        this.phase.set('REST');
        this.totalSeconds.set(REST_MINUTES * 60);
        this.remainingSeconds.set(REST_MINUTES * 60);
        this.start();
      } else {
        this.phase.set('IDLE');
        this.remainingSeconds.set(0);
      }
      return;
    }
    this.remainingSeconds.set(remaining);
    this.persist();
  }

  private persist(): void {
    const data = {
      phase: this.phase(),
      remainingSeconds: this.remainingSeconds(),
      totalSeconds: this.totalSeconds(),
      timestamp: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  hydrate(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      const elapsed = Math.floor((Date.now() - data.timestamp) / 1000);
      const remaining = data.remainingSeconds - elapsed;
      if (remaining > 0 && data.phase !== 'IDLE') {
        this.phase.set(data.phase);
        this.remainingSeconds.set(remaining);
        this.totalSeconds.set(data.totalSeconds);
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {}
  }
}
