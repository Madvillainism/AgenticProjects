import { Injectable } from '@angular/core';
import Dexie, { Table } from 'dexie';

export interface CacheEntry {
  id?: number;
  cacheKey: string;
  type: 'text' | 'image';
  input: string;
  output: string;
  createdAt: Date;
}

@Injectable({ providedIn: 'root' })
export class GeminiCacheService extends Dexie {
  gemini_cache!: Table<CacheEntry, number>;

  constructor() {
    super('AniDressCache');

    this.version(1).stores({
      gemini_cache: '++id, cacheKey, type, createdAt',
    });
  }

  get(cacheKey: string, type: 'text' | 'image'): Promise<CacheEntry | undefined> {
    return this.gemini_cache
      .where({ cacheKey, type })
      .first();
  }

  set(cacheKey: string, type: 'text' | 'image', input: string, output: string): Promise<number> {
    return this.gemini_cache.add({
      cacheKey,
      type,
      input,
      output,
      createdAt: new Date(),
    });
  }

  getAll(type?: 'text' | 'image'): Promise<CacheEntry[]> {
    if (type) {
      return this.gemini_cache
        .where('type')
        .equals(type)
        .reverse()
        .sortBy('createdAt');
    }
    return this.gemini_cache
      .orderBy('createdAt')
      .reverse()
      .toArray();
  }

  async clear(): Promise<void> {
    await this.gemini_cache.clear();
  }

  async removeEntry(id: number): Promise<void> {
    await this.gemini_cache.delete(id);
  }

  static makeKey(service: string, ...parts: string[]): string {
    return `${service}:${parts.join('|').toLowerCase().trim()}`;
  }
}
