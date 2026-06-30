import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/outfit-form/outfit-form.component').then(c => c.OutfitFormComponent),
  },
  {
    path: 'result/:id',
    loadComponent: () =>
      import('./features/outfit-result/outfit-result.component').then(c => c.OutfitResultComponent),
  },
  {
    path: 'saved',
    loadComponent: () =>
      import('./features/outfits-list/outfits-list.component').then(c => c.OutfitsListComponent),
  },
];
