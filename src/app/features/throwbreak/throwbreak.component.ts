import { Component, inject, computed, signal, ChangeDetectionStrategy, HostListener, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ThrowBreakService } from '../../shared/services/throwbreak.service';
import { THROW_LABELS, THROW_INPUTS, BREAK_WINDOW_FRAMES } from '../../shared/models/throw-break.model';
import type { ThrowBreakType, ThrowResult } from '../../shared/models/throw-break.model';

interface HistoryEntry {
  answer: string;
  input: string;
  frame: number;
  streak: number;
  correctness: ThrowResult;
}

@Component({
  selector: 'app-throwbreak',
  imports: [FormsModule],
  templateUrl: './throwbreak.component.html',
  styleUrl: './throwbreak.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThrowBreakComponent implements OnDestroy {
  service = inject(ThrowBreakService);

  showSettings = signal(false);
  history = signal<HistoryEntry[]>([]);
  feedbackBg = signal('');

  BREAK_WINDOW = BREAK_WINDOW_FRAMES;
  ROUND_TYPES: ThrowBreakType[] = ['1', '2', '1+2'];
  readonly THROW_LABELS = THROW_LABELS;

  progress = computed(() => {
    const f = this.service.frame();
    if (f === 0) return 0;
    return Math.min(1, (f - 1) / this.BREAK_WINDOW);
  });

  windowPassed = computed(() => this.service.frame() > this.BREAK_WINDOW);

  throwLabel = computed(() => {
    const t = this.service.throwType();
    return t ? THROW_LABELS[t] : '';
  });

  hasAnyInput = computed(() => {
    return ['1', '2', '1+2'].some(k =>
      (this.service.enabledTypes() as string[]).includes(k)
    );
  });

  @HostListener('document:keydown', ['$event'])
  onKeydown(e: KeyboardEvent): void {
    if (['Alt', 'Control', 'Meta', 'Shift'].includes(e.key)) return;
    const input = THROW_INPUTS[e.key];
    if (input && (this.service.enabledTypes() as string[]).includes(input)) {
      this.handleInput(input);
    }
  }

  handleInput(input: ThrowBreakType): void {
    this.service.handleInput(input);
    const r = this.service.result();
    const bg = r === 'correct'
      ? 'rgba(0, 80, 40, 0.3)'
      : r === 'slow'
      ? 'rgba(160, 120, 0, 0.3)'
      : 'rgba(120, 0, 0, 0.3)';
    this.feedbackBg.set(bg);
    setTimeout(() => this.feedbackBg.set(''), 300);

    this.history.update(h => [...h, {
      answer: THROW_LABELS[this.service.throwType() ?? '1'],
      input: THROW_LABELS[input as ThrowBreakType] ?? input,
      frame: this.service.frame(),
      streak: this.service.streak(),
      correctness: this.service.result(),
    }]);
  }

  start(): void {
    this.service.startRound();
  }

  stop(): void {
    this.service.stop();
    this.history.set([]);
    this.feedbackBg.set('');
  }

  toggleType(t: ThrowBreakType): void {
    const current = this.service.enabledTypes();
    const exists = current.includes(t);
    const next = exists
      ? current.filter(x => x !== t)
      : [...current, t].sort((a, b) => this.ROUND_TYPES.indexOf(a) - this.ROUND_TYPES.indexOf(b));
    if (next.length > 0) {
      this.service.enabledTypes.set(next);
    }
  }

  isEnabled(t: ThrowBreakType): boolean {
    return this.service.enabledTypes().includes(t);
  }

  ngOnDestroy(): void {
    this.service.stop();
    this.history.set([]);
    this.feedbackBg.set('');
  }

  adjustSpeed(delta: number): void {
    const next = Math.max(0.25, Math.min(4, this.service.speed() + delta));
    this.service.speed.set(Math.round(next * 100) / 100);
  }
}
