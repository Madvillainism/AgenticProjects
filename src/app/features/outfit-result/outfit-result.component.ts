import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { type OutfitResult } from '../../core/models/outfit.interface';
import { DbService } from '../../core/services/db.service';

@Component({
  selector: 'app-outfit-result',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
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
    const q = `outfit ${o.prompt} ${genderWord} inspo`;
    return `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(q)}`;
  });

  protected genderLabel(g: string): string {
    return g === 'M' ? 'Hombre' : g === 'F' ? 'Mujer' : 'No binario';
  }

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
