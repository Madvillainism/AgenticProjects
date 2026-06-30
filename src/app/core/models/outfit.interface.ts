/** Género para el que se genera el outfit */
export type Gender = 'M' | 'F' | 'X';

/** Tipo de pieza de vestir */
export type PieceType = 'head' | 'top' | 'bottom' | 'shoes' | 'accessory';

/** Información del personaje/anime usada como inspiración */
export interface CharacterInfo {
  /** Nombre del personaje */
  name: string;
  /** URL de la imagen del personaje (sprite de Pokémon o imagen de Jikan) */
  imageUrl: string;
  /** Hasta 5 colores hex representativos extraídos del personaje */
  colorPalette: string[];
  /** Breve descripción del personaje */
  description: string;
}

/** Una pieza concreta del outfit (head, top, bottom, shoes o accessory) */
export interface OutfitPiece {
  /** Tipo de pieza */
  type: PieceType;
  /** Nombre descriptivo (ej: "Konoha headband", "Orange jacket") */
  name: string;
  /** URL de la imagen curada que representa esta prenda */
  imageUrl: string;
  /** Color hex asociado a esta pieza */
  color: string;
  /** URL de la fuente original de la imagen (Pixabay, Pixabay, etc.) */
  sourceUrl: string;
  /** Descripción generada por IA */
  description?: string;
}

/** Resultado completo de una generación de outfit */
export interface OutfitResult {
  id?: number;
  /** Texto ingresado por el usuario (nombre del personaje) */
  prompt: string;
  /** Género seleccionado */
  gender: Gender;
  /** Personaje que inspiró el outfit */
  character: CharacterInfo;
  /** Las 5 piezas que componen el outfit */
  pieces: OutfitPiece[];
  /** URL de la imagen principal generada por Imagen 3 */
  mainImageUrl?: string;
  /** Fecha de creación */
  createdAt: Date;
  /** Si el usuario lo marcó como favorito */
  isFavorite: boolean;
}

/** Sugerencia de Pokémon para el autocompletado */
export interface PokemonSuggestion {
  name: string;
  url: string;
  spriteUrl?: string;
}
