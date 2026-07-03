import { Injectable, signal } from '@angular/core';
import type { CharacterPunishData } from '../models/punishable-move.model';

@Injectable({ providedIn: 'root' })
export class PunishableMovesService {
  data = signal<CharacterPunishData[]>([]);
  loading = signal(true);

  constructor() {
    this.load();
  }

  private async load(): Promise<void> {
    try {
      const data = (await import('../../../assets/data/punishable-moves.json')).default as CharacterPunishData[];
      this.data.set(data);
    } catch {
      this.data.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  getBySlug(slug: string): CharacterPunishData | undefined {
    return this.data().find(c => c.slug === slug);
  }
}
