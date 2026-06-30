import { Injectable } from '@angular/core';
import {
  type CharacterInfo, type OutfitPiece, type OutfitResult,
  type PieceType, type Gender,
} from '../models/outfit.interface';
import { CuratedPieceImagesService } from './curated-piece-images.service';
import { AiDescriptionService } from './ai-description.service';
import { ImagenService } from './imagen.service';

const PIECE_TYPES: PieceType[] = ['head', 'top', 'bottom', 'shoes', 'accessory'];

@Injectable({ providedIn: 'root' })
export class OutfitGenerationService {
  constructor(
    private curated: CuratedPieceImagesService,
    private aiDescription: AiDescriptionService,
    private imagen: ImagenService,
  ) {}

  async generateOutfit(
    character: CharacterInfo,
    gender: Gender,
    prompt: string,
  ): Promise<OutfitResult> {
    let pieces: OutfitPiece[];
    let mainImageUrl = '';

    try {
      pieces = await this.aiDescription.generateOutfitPieces(
        character.name, gender, character.colorPalette
      );

      const descSummary = pieces.map(p => `${p.name} (${p.color})`).join(', ');
      mainImageUrl = await this.imagen.generateOutfitImage(character.name, descSummary);

      pieces = this.assignFallbackImages(pieces, gender);
    } catch (err) {
      console.warn('AI generation failed, using fallback:', err);
      pieces = this.fallbackPieces(character, gender);
    }

    return {
      prompt,
      gender,
      character,
      pieces,
      mainImageUrl: mainImageUrl || undefined,
      createdAt: new Date(),
      isFavorite: false,
    };
  }

  private assignFallbackImages(pieces: OutfitPiece[], gender: Gender): OutfitPiece[] {
    return pieces.map(piece => ({
      ...piece,
      imageUrl: piece.imageUrl || this.curated.getFallbackImage(gender, piece.type),
    }));
  }

  private fallbackPieces(character: CharacterInfo, gender: Gender): OutfitPiece[] {
    return PIECE_TYPES.map(type => this.curated.getPiece(character.name, type, gender));
  }
}
