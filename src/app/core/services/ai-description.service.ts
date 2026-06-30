import { Injectable } from '@angular/core';
import { type OutfitPiece, type PieceType, type Gender } from '../models/outfit.interface';
import { GeminiCacheService } from './gemini-cache.service';
import { OpenrouterService } from './openrouter.service';

const PIECE_TYPES: PieceType[] = ['head', 'top', 'bottom', 'shoes', 'accessory'];

@Injectable({ providedIn: 'root' })
export class AiDescriptionService {
  constructor(
    private cache: GeminiCacheService,
    private openrouter: OpenrouterService,
  ) {}

  async generateOutfitPieces(
    characterName: string,
    gender: Gender,
    colorPalette: string[]
  ): Promise<OutfitPiece[]> {
    const genderLabel = gender === 'F' ? 'femenino' : gender === 'M' ? 'masculino' : 'unisex';
    const systemPrompt = 'Eres un experto en moda urbana japonesa y accesorios anime.';
    const userPrompt = `Genera un outfit de 5 piezas para ${characterName} (género: ${genderLabel}).
Usa la paleta de colores ${colorPalette.join(', ')} como guía principal.
Responde SOLO con JSON válido, sin markdown:

[
  { "type": "head", "name": "...", "description": "...", "color": "#hex" },
  { "type": "top", "name": "...", "description": "...", "color": "#hex" },
  { "type": "bottom", "name": "...", "description": "...", "color": "#hex" },
  { "type": "shoes", "name": "...", "description": "...", "color": "#hex" },
  { "type": "accessory", "name": "...", "description": "...", "color": "#hex" }
]`;

    const cacheKey = GeminiCacheService.makeKey('text', characterName, genderLabel, colorPalette.join(','));
    const cached = await this.cache.get(cacheKey, 'text');
    let text: string;

    if (cached) {
      text = cached.output;
    } else {
      text = await this.openrouter.generateText(systemPrompt, userPrompt);
      if (!text) throw new Error('OpenRouter returned empty response');
      await this.cache.set(cacheKey, 'text', userPrompt, text);
    }

    interface ParsedPiece { name?: string; color?: string; description?: string; type?: string; }
    let parsed: ParsedPiece[];
    try {
      parsed = JSON.parse(text);
    } catch {
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Failed to parse AI response as JSON');
      }
    }

    return PIECE_TYPES.map((type, i) => {
      const item = parsed[i] || {};
      return {
        type,
        name: item.name || `Prenda ${i + 1}`,
        imageUrl: '',
        color: item.color || colorPalette[i % colorPalette.length],
        sourceUrl: '',
        description: item.description || '',
      };
    });
  }
}
