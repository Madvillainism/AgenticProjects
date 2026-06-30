import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { DbService } from '../../core/services/db.service';
import { type OutfitResult } from '../../core/models/outfit.interface';

@Component({
  selector: 'app-outfits-list',
  standalone: true,
  imports: [DatePipe, MatButtonModule, MatIconModule, MatCardModule],
  template: `
    <div class="saved-container">
      <button mat-icon-button class="back-btn" (click)="goBack()">
        <mat-icon>arrow_back</mat-icon>
      </button>

      <h1 class="page-title">Outfits guardados</h1>

      @if (loading()) {
        <p class="empty-state">Cargando...</p>
      } @else if (outfits().length === 0) {
        <div class="empty-state">
          <mat-icon class="empty-icon">bookmark_border</mat-icon>
          <p>No tienes outfits guardados aún.</p>
          <button mat-stroked-button (click)="goBack()">Crear uno</button>
        </div>
      } @else {
        <div class="outfits-grid">
          @for (o of outfits(); track o.id) {
            <mat-card class="outfit-card" (click)="viewOutfit(o.id!)">
              <div class="card-img">
                @if (o.imageUrl) {
                  <img [src]="o.imageUrl" [alt]="o.prompt" loading="lazy" />
                } @else {
                  <div class="no-img"><mat-icon>image</mat-icon></div>
                }
                @if (o.isFavorite) {
                  <mat-icon class="fav-badge">favorite</mat-icon>
                }
              </div>
              <mat-card-content>
                <p class="card-prompt">"{{ o.prompt }}"</p>
                <span class="card-meta">
                  {{ o.gender === 'M' ? 'Masculino' : o.gender === 'F' ? 'Femenino' : 'Unisex' }}
                  · {{ o.createdAt | date:'short' }}
                </span>
              </mat-card-content>
            </mat-card>
          }
        </div>
      }
    </div>
  `,
  styles: `
    .saved-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 1rem;
      position: relative;
    }
    .back-btn {
      position: absolute;
      top: 0; left: 0;
      z-index: 10;
      color: rgba(255,255,255,0.8);
      background: rgba(0,0,0,0.2);
      &:hover { background: rgba(0,0,0,0.4); }
    }
    .page-title {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 1.8rem;
      text-align: center;
      color: #fff;
      margin: 0 0 1.5rem;
    }
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
      padding: 3rem 1rem;
      text-align: center;
      color: rgba(255,255,255,0.5);
      .empty-icon { font-size: 3rem; width: 3rem; height: 3rem; }
      p { margin: 0; font-size: 1rem; }
      button { color: rgba(255,255,255,0.7); border-color: rgba(255,255,255,0.3); }
    }
    .outfits-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 1rem;
    }
    .outfit-card {
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 16px;
      overflow: hidden;
      cursor: pointer;
      transition: transform 0.15s, border-color 0.15s;
      &:hover {
        transform: translateY(-4px);
        border-color: #fbbf24;
      }
    }
    .card-img {
      position: relative;
      height: 180px;
      overflow: hidden;
      background: rgba(0,0,0,0.2);
      img { width: 100%; height: 100%; object-fit: cover; }
      .no-img {
        display: flex; align-items: center; justify-content: center;
        height: 100%; color: rgba(255,255,255,0.2);
        mat-icon { font-size: 2.5rem; width: 2.5rem; height: 2.5rem; }
      }
    }
    .fav-badge {
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      color: #f472b6;
      font-size: 1.2rem;
    }
    .card-prompt {
      color: #fff;
      font-size: 0.85rem;
      margin: 0.5rem 0 0.25rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .card-meta {
      color: rgba(255,255,255,0.4);
      font-size: 0.7rem;
    }
  `,
})
export class OutfitsListComponent {
  private router = inject(Router);
  private db = inject(DbService);

  outfits = signal<OutfitResult[]>([]);
  loading = signal(true);

  constructor() {
    this.loadOutfits();
  }

  private async loadOutfits() {
    try {
      const all = await this.db.getAllOutfits();
      this.outfits.set(all);
    } catch {
      this.outfits.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  viewOutfit(id: number) {
    this.router.navigate(['/result', id]);
  }

  goBack() {
    this.router.navigate(['/']);
  }
}
