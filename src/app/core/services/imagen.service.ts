import { Injectable } from '@angular/core';
import { GeminiCacheService } from './gemini-cache.service';
import { OpenrouterService } from './openrouter.service';

@Injectable({ providedIn: 'root' })
export class ImagenService {
  constructor(
    private cache: GeminiCacheService,
    private openrouter: OpenrouterService,
  ) {}

  async generateOutfitImage(
    characterName: string,
    piecesDescription: string
  ): Promise<string> {
    const prompt = `Anime-style fashion outfit inspired by ${characterName}: ${piecesDescription}. Clean background, full body view, vibrant colors, anime art style.`;
    const cacheKey = GeminiCacheService.makeKey('image', characterName, piecesDescription);
    const cached = await this.cache.get(cacheKey, 'image');

    if (cached) {
      return cached.output;
    }

    try {
      const imageUrl = await this.openrouter.generateImage(prompt);
      if (imageUrl) {
        await this.cache.set(cacheKey, 'image', prompt, imageUrl);
      }
      return imageUrl;
    } catch (err) {
      console.error('OpenRouter image generation failed:', err);
      return '';
    }
  }
}
