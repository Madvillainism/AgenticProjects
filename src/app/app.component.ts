import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  navItems = [
    { path: '/', label: 'Drills', icon: '⏱' },
    { path: '/todos', label: 'To-Dos', icon: '📋' },
    { path: '/moves', label: 'Moves', icon: '⇧' },
    { path: '/throwbreak', label: 'Breaks', icon: '✋' },
    { path: '/pros', label: 'Pros', icon: '★' },
  ];

  playNavSound(): void {
    const audio = new Audio('assets/audio/Great.wav');
    audio.volume = 0.15;
    audio.play().catch(() => {});
  }
}
