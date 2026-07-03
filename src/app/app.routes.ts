import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/pomodoro/pomodoro-timer/pomodoro-timer.component').then(m => m.PomodoroTimerComponent),
    title: 'Pomodoro Drills - MokuApp',
  },
  {
    path: 'todos',
    loadComponent: () => import('./features/todos/todo-list/todo-list.component').then(m => m.TodoListComponent),
    title: 'Training To-Dos - MokuApp',
  },
  {
    path: 'moves',
    loadComponent: () => import('./features/moves/move-list/move-list.component').then(m => m.MoveListComponent),
    title: 'Punishment Training - MokuApp',
  },
  {
    path: 'pros',
    loadComponent: () => import('./features/pros/pro-directory/pro-directory.component').then(m => m.ProDirectoryComponent),
    title: 'Combo Inspo & Pros - MokuApp',
  },
  {
    path: 'throwbreak',
    loadComponent: () => import('./features/throwbreak/throwbreak.component').then(m => m.ThrowBreakComponent),
    title: 'Throw Break Training - MokuApp',
  },
  {
    path: '**',
    redirectTo: '',
  },
];
