import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap } from 'rxjs';
import { DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { type OutfitResult, type PieceType } from '../../core/models/outfit.interface';
import { DbService } from '../../core/services/db.service';

const PIECE_LABELS: Record<PieceType, string> = {
  head: 'Cabeza',
  top: 'Superior',
  bottom: 'Inferior',
  shoes: 'Zapatos',
  accessory: 'Accesorio',
};

const PIECE_ICONS: Record<PieceType, string> = {
  head: 'face',
  top: 'checkroom',
  bottom: 'accessibility_new',
  shoes: 'steps',
  accessory: 'diamond',
};

@Component({
  selector: 'app-outfit-result',
  standalone: true,
  imports: [DatePipe, MatButtonModule, MatIconModule],
  templateUrl: './outfit-result.component.html',
  styleUrl: './outfit-result.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OutfitResultComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private db = inject(DbService);

  private outfitData = signal<OutfitResult | undefined>(undefined);

  protected outfit = this.outfitData.asReadonly();

  private initialLoad = toSignal(
    this.route.paramMap.pipe(
      switchMap(p => {
        const id = Number(p.get('id'));
        return new Promise<OutfitResult | undefined>(resolve => {
          this.db.getOutfitById(id).then(result => {
            this.outfitData.set(result);
            resolve(result);
          });
        });
      })
    )
  );

  protected pinterestUrl = computed(() => {
    const o = this.outfitData();
    if (!o) return '';
    const genderWord = o.gender === 'M' ? 'hombre' : o.gender === 'F' ? 'mujer' : 'unisex';
    const q = `outfit ${o.character.name} ${genderWord}`;
    return `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(q)}`;
  });

  protected pieceLabels = PIECE_LABELS;
  protected pieceIcons = PIECE_ICONS;

  protected genderLabel(g: string): string {
    return g === 'M' ? 'Hombre' : g === 'F' ? 'Mujer' : 'No binario';
  }

  protected pieceTypeOrder = Object.keys(PIECE_LABELS) as PieceType[];

  async toggleFavorite(id: number): Promise<void> {
    const updated = await this.db.toggleFavorite(id);
    if (updated) {
      this.outfitData.set(updated);
    }
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}
