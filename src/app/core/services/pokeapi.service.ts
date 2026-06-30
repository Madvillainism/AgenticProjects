import { Injectable } from '@angular/core';
import { type PokemonSuggestion } from '../models/outfit.interface';

const POKEMON_LIST = [
  { id: 25, name: 'pikachu' },
  { id: 6, name: 'charizard' },
  { id: 150, name: 'mewtwo' },
  { id: 1, name: 'bulbasaur' },
  { id: 4, name: 'charmander' },
  { id: 7, name: 'squirtle' },
  { id: 133, name: 'eevee' },
  { id: 94, name: 'gengar' },
  { id: 143, name: 'snorlax' },
  { id: 448, name: 'lucario' },
];

const POKEAPI_COLOR_TO_HEX: Record<string, string> = {
  black: '#303030',
  blue: '#3D7EF7',
  brown: '#8B6C42',
  gray: '#9E9E9E',
  green: '#78C850',
  pink: '#F8A0B0',
  purple: '#A040A0',
  red: '#E3350D',
  white: '#E0E0E0',
  yellow: '#FFD700',
};

const DEFAULT_PALETTE = ['#303030', '#E0E0E0', '#F08030', '#4169E1', '#78C850'];

export interface ExpandedPokemonInfo extends PokemonSuggestion {
  colorPalette: string[];
  types: string[];
  speciesColor: string;
}

@Injectable({ providedIn: 'root' })
export class PokeapiService {
  async getPokemon(): Promise<PokemonSuggestion[]> {
    try {
      const results = await Promise.all(
        POKEMON_LIST.map(async ({ id }) => {
          const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
          const data = await res.json();
          return {
            name: data.name as string,
            url: `https://pokeapi.co/api/v2/pokemon/${id}/`,
            spriteUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
          };
        })
      );
      return results;
    } catch {
      return POKEMON_LIST.map(({ id, name }) => ({
        name,
        url: '',
        spriteUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
      }));
    }
  }

  async getPokemonInfo(id: number): Promise<ExpandedPokemonInfo | null> {
    try {
      const [pokemonRes, speciesRes] = await Promise.all([
        fetch(`https://pokeapi.co/api/v2/pokemon/${id}`),
        fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`),
      ]);
      const pokemon = await pokemonRes.json();
      const species = await speciesRes.json();

      const colorName: string = species.color?.name || 'gray';

      return {
        name: pokemon.name as string,
        url: `https://pokeapi.co/api/v2/pokemon/${id}/`,
        spriteUrl: pokemon.sprites?.front_default || '',
        colorPalette: this.buildPalette(colorName),
        types: (pokemon.types || []).map((t: { type: { name: string } }) => t.type.name),
        speciesColor: colorName,
      };
    } catch {
      return null;
    }
  }

  findPokemonId(name: string): number | undefined {
    const entry = POKEMON_LIST.find(
      p => p.name === name.trim().toLowerCase()
    );
    return entry?.id;
  }

  getColorHex(colorName: string): string {
    return POKEAPI_COLOR_TO_HEX[colorName] ?? DEFAULT_PALETTE[0];
  }

  private buildPalette(colorName: string): string[] {
    const variations: Record<string, string[]> = {
      black: ['#303030', '#E0E0E0', '#F08030', '#4169E1', '#78C850'],
      blue: ['#3D7EF7', '#F8D030', '#E0E0E0', '#303030', '#F08030'],
      brown: ['#8B6C42', '#D4A574', '#E0E0E0', '#303030', '#78C850'],
      gray: ['#9E9E9E', '#E0E0E0', '#303030', '#F08030', '#4169E1'],
      green: ['#78C850', '#6890F0', '#F8D030', '#D4A574', '#303030'],
      pink: ['#F8A0B0', '#E0E0E0', '#303030', '#F08030', '#D4A574'],
      purple: ['#A040A0', '#F8D030', '#E0E0E0', '#303030', '#F08030'],
      red: ['#E3350D', '#F8D030', '#E0E0E0', '#6890F0', '#303030'],
      white: ['#E0E0E0', '#303030', '#F08030', '#4169E1', '#78C850'],
      yellow: ['#FFD700', '#F08030', '#2C1810', '#C41E3A', '#303030'],
    };
    return variations[colorName] ?? DEFAULT_PALETTE;
  }
}
