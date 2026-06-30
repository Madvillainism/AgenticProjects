import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { type OutfitResult } from '../../core/models/outfit.interface';
import { DbService } from '../../core/services/db.service';

export interface DescriptionLine {
  type: 'title' | 'item' | 'closing';
  content: string;
}

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
  protected imageError = signal(false);

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

  protected parseDescription(text: string): DescriptionLine[] {
    const lines = text.split('\n');
    const result: DescriptionLine[] = [];
    let foundTitle = false;

    for (const raw of lines) {
      const line = raw.trim();
      if (!line) continue;

      if (line.startsWith('** ')) {
        result.push({ type: 'item', content: line.slice(3).trim() });
      } else if (!foundTitle) {
        result.push({ type: 'title', content: line });
        foundTitle = true;
      } else {
        result.push({ type: 'closing', content: line });
      }
    }

    return result;
  }

  protected get pinUrl(): string {
    const o = this.outfitData();
    if (o?.pinterestUrl) return o.pinterestUrl;
    if (o?.prompt) {
      return `https://www.pinterest.com/search/pins/?q=${encodeURIComponent('outfit ' + o.prompt + ' ' + this.genderLabel(o.gender) + ' anime')}`;
    }
    return '';
  }

  protected get hasPinUrl(): boolean {
    const o = this.outfitData();
    return !!o?.pinterestUrl;
  }

  protected genderLabel(g: string): string {
    return g === 'M' ? 'Hombre' : g === 'F' ? 'Mujer' : 'No binario';
  }

  onImageError(): void {
    this.imageError.set(true);
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
