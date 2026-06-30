import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DbService } from '../../core/services/db.service';
import { GeminiService } from '../../core/services/gemini.service';
import { PokeapiService } from '../../core/services/pokeapi.service';
import { OutfitResult, PokemonSuggestion } from '../../core/models/outfit.interface';

@Component({
  selector: 'app-outfit-form',
  standalone: true,
  imports: [
    ReactiveFormsModule, MatButtonModule, MatCardModule,
    MatFormFieldModule, MatInputModule, MatRadioModule,
    MatIconModule, MatProgressSpinnerModule,
  ],
  templateUrl: './outfit-form.component.html',
  styleUrls: ['./outfit-form.component.scss'],
})
export class OutfitFormComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private db = inject(DbService);
  private gemini = inject(GeminiService);
  private pokeapi = inject(PokeapiService);

  pokemonList = signal<PokemonSuggestion[]>([]);
  loading = signal(false);
  errorMessage = signal('');

  form = this.fb.group({
    prompt: ['', Validators.required],
    gender: ['F', Validators.required],
  });

  constructor() {
    this.loadPokemon();
  }

  private async loadPokemon() {
    try {
      const pokemon = await this.pokeapi.getPokemon();
      this.pokemonList.set(pokemon);
    } catch {
      this.pokemonList.set([]);
    }
  }

  addSuggestion(name: string) {
    this.form.patchValue({ prompt: `un outfit comodo de ${name} con accesorios` });
  }

  async onSubmit() {
    if (this.form.invalid) return;

    this.loading.set(true);
    this.errorMessage.set('');
    const { prompt, gender } = this.form.value as { prompt: string; gender: string };

    try {
      const [descriptionText] = await Promise.all([
        this.gemini.generateDescription(prompt, gender),
        new Promise((r) => setTimeout(r, 3000)),
      ]);

      console.log('=== Gemini Response ===');
      console.log(descriptionText);
      console.log('=======================');

      const outfit: OutfitResult = {
        prompt,
        gender: gender as OutfitResult['gender'],
        descriptionText,
        createdAt: new Date(),
        isFavorite: false,
      };

      const id = await this.db.saveOutfit(outfit);
      this.router.navigate(['/result', id]);
    } catch (err) {
      this.errorMessage.set('Error al generar el outfit. Intenta de nuevo.');
      console.error('Error generating outfit:', err);
    } finally {
      this.loading.set(false);
    }
  }

  goToSaved() {
    this.router.navigate(['/saved']);
  }
}
