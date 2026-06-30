export type Gender = 'M' | 'F' | 'X';

export interface OutfitResult {
  id?: number;
  prompt: string;
  gender: Gender;
  imageUrl: string;
  pinterestUrl?: string;
  descriptionText: string;
  createdAt: Date;
  isFavorite: boolean;
}

export interface PokemonSuggestion {
  name: string;
  url: string;
  spriteUrl?: string;
}
