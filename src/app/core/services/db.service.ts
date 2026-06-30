import { Injectable } from '@angular/core';
import Dexie, { Table } from 'dexie';
import { OutfitResult } from '../models/outfit.interface';

@Injectable({ providedIn: 'root' })
export class DbService extends Dexie {
  outfits!: Table<OutfitResult, number>;

  constructor() {
    super('AniDressDB');

    this.version(6).stores({
      outfits: '++id, createdAt, isFavorite',
    }).upgrade(async tx => {
      await tx.table('outfits').clear();
    });
  }

  async saveOutfit(outfit: OutfitResult): Promise<number> {
    return this.outfits.add(outfit);
  }

  async getAllOutfits(): Promise<OutfitResult[]> {
    return this.outfits.reverse().sortBy('createdAt');
  }

  async getOutfitById(id: number): Promise<OutfitResult | undefined> {
    return this.outfits.get(id);
  }

  async toggleFavorite(id: number): Promise<OutfitResult | undefined> {
    const outfit = await this.outfits.get(id);
    if (!outfit) return undefined;
    const updated = { ...outfit, isFavorite: !outfit.isFavorite };
    await this.outfits.put(updated, id);
    return this.outfits.get(id);
  }
}
