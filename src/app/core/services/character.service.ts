import { Injectable } from '@angular/core';
import { CharacterInfo } from '../models/outfit.interface';
import { PokeapiService } from './pokeapi.service';

@Injectable({ providedIn: 'root' })
export class CharacterService {
  private static readonly POKEMON_NAMES: Record<string, number> = {
    pikachu: 25, charizard: 6, mewtwo: 150,
    bulbasaur: 1, charmander: 4, squirtle: 7,
    eevee: 133, gengar: 94, snorlax: 143, lucario: 448,
  };

  private static readonly DEFAULT_PALETTE = ['#303030', '#E0E0E0', '#F08030', '#4169E1', '#78C850'];

  constructor(private pokeapi: PokeapiService) {}

  async getCharacter(name: string): Promise<CharacterInfo> {
    const normalized = name.trim().toLowerCase();
    const pokemonId = CharacterService.POKEMON_NAMES[normalized];

    if (pokemonId) {
      const info = await this.pokeapi.getPokemonInfo(pokemonId);
      if (info) {
        return {
          name: this.capitalize(info.name),
          imageUrl: info.spriteUrl || '',
          colorPalette: info.colorPalette,
          description: `Un ${info.name} salvaje apareció — ideal para un outfit ${info.types.join(' y ')}.`,
        };
      }
    }

    if (pokemonId) {
      const fallback = await this.fromPokeApiFallback(normalized, pokemonId);
      if (fallback) return fallback;
    }

    return this.fromJikan(normalized);
  }

  private async fromPokeApiFallback(name: string, id: number): Promise<CharacterInfo | null> {
    try {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
      const data = await res.json();
      const spriteUrl: string = data.sprites?.front_default || '';
      const types: string[] = (data.types || []).map((t: { type: { name: string } }) => t.type.name);
      return {
        name: this.capitalize(name),
        imageUrl: spriteUrl,
        colorPalette: CharacterService.DEFAULT_PALETTE,
        description: `Un ${name} salvaje apareció — ideal para un outfit ${types.join(' y ')}.`,
      };
    } catch {
      return null;
    }
  }

  private async fromJikan(name: string): Promise<CharacterInfo> {
    try {
      const res = await fetch(
        `https://api.jikan.moe/v4/characters?q=${encodeURIComponent(name)}&limit=1&sfw=true`
      );
      const json = await res.json();
      const char = json.data?.[0];

      let imageUrl = '';
      let description = '';
      if (char) {
        imageUrl = char.images?.jpg?.image_url || '';
        description = char.about
          ? char.about.replace(/<[^>]*>/g, '').split('.')[0] + '.'
          : `Personaje de anime: ${name}`;
      } else {
        description = `Personaje de anime: ${name}`;
      }

      return {
        name: char?.name || this.capitalize(name),
        imageUrl,
        colorPalette: CharacterService.DEFAULT_PALETTE,
        description,
      };
    } catch {
      return {
        name: this.capitalize(name),
        imageUrl: '',
        colorPalette: CharacterService.DEFAULT_PALETTE,
        description: `Personaje de anime: ${name}`,
      };
    }
  }

  private capitalize(s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }
}
