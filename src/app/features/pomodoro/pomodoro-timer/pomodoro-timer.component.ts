import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { PomodoroService } from '../../../shared/services/pomodoro.service';

@Component({
  selector: 'app-pomodoro-timer',
  imports: [],
  templateUrl: './pomodoro-timer.component.html',
  styleUrl: './pomodoro-timer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PomodoroTimerComponent {
  pom = inject(PomodoroService);

  handleStart(): void {
    if (this.pom.isRunning()) {
      this.pom.pause();
    } else {
      this.pom.start();
    }
  }

  handleReset(): void {
    this.pom.reset();
  }
}
