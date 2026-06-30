import { Injectable } from '@angular/core';
import { OutfitPiece, PieceType, Gender } from '../models/outfit.interface';

interface KnownAccessory {
  head: string;
  accessory: string;
}

const FALLBACK_IMAGES: Record<Gender, Record<PieceType, string>> = {
  F: {
    head: 'https://cdn.pixabay.com/photo/2015/07/12/17/56/girl-842237_640.jpg',
    top: 'https://cdn.pixabay.com/photo/2017/05/29/17/15/t-shirt-2351761_1280.jpg',
    bottom: 'https://cdn.pixabay.com/photo/2019/09/17/06/43/plaid-skirt-4478003_640.jpg',
    shoes: 'https://images.unsplash.com/photo-1585488434451-7ee645d0574b?fm=jpg&w=1280',
    accessory: 'https://cdn.pixabay.com/photo/2016/02/02/15/53/jewellery-1175526_1280.jpg',
  },
  M: {
    head: 'https://cdn.pixabay.com/photo/2015/12/28/18/41/cap-1106942_1280.jpg',
    top: 'https://cdn.pixabay.com/photo/2014/07/31/22/55/man-407095_1280.jpg',
    bottom: 'https://cdn.pixabay.com/photo/2014/08/28/16/16/jeans-428614_1280.jpg',
    shoes: 'https://cdn.pixabay.com/photo/2018/09/29/06/26/sneakers-3706741_1280.jpg',
    accessory: 'https://cdn.pixabay.com/photo/2018/03/16/16/28/isolated-3230523_1280.jpg',
  },
  X: {
    head: 'https://images.unsplash.com/photo-1544967919-44c1ef2f9e7a?fm=jpg&w=1280',
    top: 'https://images.unsplash.com/photo-1560800125-e06c763fdc2c?fm=jpg&w=1280',
    bottom: 'https://images.unsplash.com/photo-1584642425274-db2c9bf955a8?fm=jpg&w=1280',
    shoes: 'https://images.unsplash.com/photo-1656164847621-4665c4c397da?fm=jpg&w=1280',
    accessory: 'https://images.unsplash.com/photo-1758887952896-8491d393afe2?fm=jpg&w=1280',
  },
};

const KNOWN_ACCESSORIES: Record<string, KnownAccessory> = {
  squirtle: { head: 'Caparazón azul', accessory: 'Gafas de sol' },
  bulbasaur: { head: 'Horquilla de flor', accessory: 'Pulsera enredadera' },
  charmander: { head: 'Horquilla flamígera', accessory: 'Collar de cola de fuego' },
  pikachu: { head: 'Diadema de orejas Pikachu', accessory: 'Collar rayo' },
  eevee: { head: 'Diadema de orejas Eevee', accessory: 'Collar de zorro' },
  'naruto uzumaki': { head: 'Cinta de Konoha', accessory: 'Colgante kunai' },
  'itachi uchiha': { head: 'Cinta de Akatsuki', accessory: 'Anillo Sharingan' },
  goku: { head: 'Peluca Saiyan', accessory: 'Bastón Power Pole' },
};

const KNOWN_PALETTES: Record<string, string[]> = {
  squirtle: ['#6890F0', '#F8D030', '#E0E0E0', '#303030', '#F08030'],
  bulbasaur: ['#78C850', '#6890F0', '#F8D030', '#D4A574', '#303030'],
  charmander: ['#F08030', '#F8D030', '#E0E0E0', '#6890F0', '#303030'],
  pikachu: ['#FFD700', '#F08030', '#2C1810', '#C41E3A', '#303030'],
  'naruto uzumaki': ['#F8D030', '#F08030', '#4169E1', '#2C1810', '#D4A574'],
  'itachi uchiha': ['#C41E3A', '#2C1810', '#303030', '#8B4513', '#E0E0E0'],
  goku: ['#F08030', '#4169E1', '#D4A574', '#F8D030', '#2C1810'],
};

const DEFAULT_PALETTE = ['#303030', '#E0E0E0', '#F08030', '#4169E1', '#78C850'];

@Injectable({ providedIn: 'root' })
export class CuratedPieceImagesService {
  getPiece(characterName: string, type: PieceType, gender: Gender = 'X'): OutfitPiece {
    const normalized = characterName.trim().toLowerCase();
    const known = KNOWN_ACCESSORIES[normalized];

    let name: string;
    if (type === 'head' && known) {
      name = known.head;
    } else if (type === 'accessory' && known) {
      name = known.accessory;
    } else {
      name = this.defaultName(type);
    }

    return {
      type,
      name,
      imageUrl: this.getFallbackImage(gender, type),
      color: this.pickColor(normalized, type),
      sourceUrl: '',
      description: '',
    };
  }

  getPalette(characterName: string): string[] {
    return KNOWN_PALETTES[characterName.trim().toLowerCase()] ?? DEFAULT_PALETTE;
  }

  getFallbackImage(gender: Gender, type: PieceType): string {
    return FALLBACK_IMAGES[gender]?.[type] ?? FALLBACK_IMAGES.X[type];
  }

  isKnownCharacter(name: string): boolean {
    return !!KNOWN_ACCESSORIES[name.trim().toLowerCase()];
  }

  private defaultName(type: PieceType): string {
    const names: Record<PieceType, string> = {
      head: 'Accesorio para cabeza',
      top: 'Prenda superior',
      bottom: 'Prenda inferior',
      shoes: 'Calzado',
      accessory: 'Accesorio',
    };
    return names[type];
  }

  private pickColor(characterName: string, type: PieceType): string {
    const palette = this.getPalette(characterName);
    const indexMap: Record<PieceType, number> = {
      head: 0, top: 1, bottom: 2, shoes: 3, accessory: 4,
    };
    return palette[indexMap[type] % palette.length];
  }
}
