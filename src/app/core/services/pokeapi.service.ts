import { Injectable } from '@angular/core';
import { type PokemonSuggestion } from '../models/outfit.interface';

@Injectable({ providedIn: 'root' })
export class PokeapiService {
  async getPokemon(): Promise<PokemonSuggestion[]> {
    try {
      const ids = [7, 1, 4]; // Squirtle, Bulbasaur, Charmander
      const results = await Promise.all(
        ids.map(async (id) => {
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
      return [
        { name: 'squirtle', url: '', spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/7.png' },
        { name: 'bulbasaur', url: '', spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png' },
        { name: 'charmander', url: '', spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png' },
      ];
    }
  }
}
