import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { AiDescriptionService } from '../../core/services/ai-description.service';
import { ImagenService } from '../../core/services/imagen.service';
import { OpenrouterService } from '../../core/services/openrouter.service';
import { GeminiCacheService, CacheEntry } from '../../core/services/gemini-cache.service';
import { OPENROUTER_API_KEY } from '../../../env';

@Component({
  selector: 'app-test-page',
  standalone: true,
  imports: [
    ReactiveFormsModule, MatButtonModule, MatCardModule,
    MatFormFieldModule, MatInputModule, MatRadioModule,
    MatSelectModule, MatIconModule, MatProgressSpinnerModule,
    DatePipe,
  ],
  template: `
    <div class="test-container">
      <header class="test-header">
        <button mat-icon-button class="back-btn" (click)="goBack()">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h1 class="test-title">AI TEST</h1>
        <span class="test-badge">DEV</span>
      </header>

      @if (!apiKeyReady()) {
        <div class="error-banner">
          <mat-icon>vpn_key_off</mat-icon>
          API key no disponible — verifica <strong>src/env.ts</strong>
        </div>
      }

      <mat-card class="test-card test-card--connect">
        <mat-card-header>
          <mat-card-title>
            <mat-icon [class.connected]="connected()">wifi{{ connected() ? '' : '_off' }}</mat-icon>
            Conexión con OpenRouter
          </mat-card-title>
          <mat-card-subtitle>
            @if (connected()) {
              <span class="status-ok">Conectado</span>
            } @else if (connecting()) {
              <span class="status-working">Verificando...</span>
            } @else {
              <span class="status-idle">Sin probar</span>
            }
          </mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <p class="connect-desc">
            OpenRouter <code>chat/completions</code> con modelo
            <em>openrouter/free</em>
          </p>
          <div class="connect-actions">
            <button mat-raised-button color="primary"
                    (click)="testConnection()"
                    [disabled]="connecting() || !apiKeyReady()">
              @if (connecting()) {
                <mat-spinner diameter="20" />
              } @else {
                <mat-icon>play_arrow</mat-icon>
              }
              Probar conexión
            </button>
            @if (connected()) {
              <span class="latency">{{ latency() }}ms</span>
            }
          </div>
          @if (connectionResponse(); as r) {
            <div class="connect-response">
              <ul class="bullet-list">
                @for (point of splitBullets(r); track $index) {
                  <li>{{ point }}</li>
                }
              </ul>
            </div>
          }
        </mat-card-content>
      </mat-card>

      <mat-card class="test-card">
        <mat-card-header>
          <mat-card-title>Probar modelos</mat-card-title>
          <mat-card-subtitle>Texto (openrouter/free) + Imagen (Seedream 4.5)</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="testForm">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Personaje</mat-label>
              <input matInput formControlName="character" placeholder="Ej: Pikachu" />
            </mat-form-field>

            <mat-radio-group formControlName="gender" class="gender-group">
              <mat-radio-button value="F">Femenino</mat-radio-button>
              <mat-radio-button value="M">Masculino</mat-radio-button>
              <mat-radio-button value="X">Unisex</mat-radio-button>
            </mat-radio-group>

            <div class="button-row">
              <button mat-raised-button color="primary"
                      (click)="testText()"
                      [disabled]="testForm.invalid || loadingText()">
                @if (loadingText()) {
                  <mat-spinner diameter="18" />
                } @else {
                  <mat-icon>text_snippet</mat-icon>
                }
                Probar Texto
              </button>

              <button mat-raised-button color="accent"
                      (click)="testImage()"
                      [disabled]="testForm.invalid || loadingImage()">
                @if (loadingImage()) {
                  <mat-spinner diameter="18" />
                } @else {
                  <mat-icon>image</mat-icon>
                }
                Probar Imagen
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>

      @if (textResult(); as r) {
        <mat-card class="result-card">
          <mat-card-header>
            <mat-card-title>Respuesta de texto</mat-card-title>
            <mat-card-subtitle>OpenRouter</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <pre class="json-block">{{ r }}</pre>
          </mat-card-content>
        </mat-card>
      }

      @if (imageUrl()) {
        <mat-card class="result-card">
          <mat-card-header>
            <mat-card-title>Imagen generada</mat-card-title>
            <mat-card-subtitle>Seedream 4.5</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content class="image-result">
            <img [src]="imageUrl()" alt="Generated outfit" class="gen-image" />
          </mat-card-content>
        </mat-card>
      }

      @if (error()) {
        <div class="error-banner">
          <mat-icon>error</mat-icon>
          {{ error() }}
        </div>
      }

      <mat-card class="cache-card">
        <mat-card-header>
          <mat-card-title>Cache de respuestas</mat-card-title>
          <mat-card-subtitle>
            {{ cachedEntries().length }} entradas
            @if (cachedEntries().length > 0) {
              <button mat-button color="warn" (click)="clearCache()" class="clear-btn">
                <mat-icon>delete_sweep</mat-icon>
                Limpiar
              </button>
            }
          </mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          @if (cachedEntries().length === 0) {
            <p class="empty-cache">No hay respuestas cacheadas aún.</p>
          }
          @for (entry of cachedEntries(); track entry.id) {
            <div class="cache-item">
              <div class="cache-meta">
                <span class="cache-type" [class.text-type]="entry.type === 'text'" [class.image-type]="entry.type === 'image'">
                  {{ entry.type === 'text' ? 'TEXT' : 'IMG' }}
                </span>
                <span class="cache-key">{{ entry.cacheKey }}</span>
                <span class="cache-date">{{ entry.createdAt | date:'HH:mm:ss' }}</span>
                <button mat-icon-button (click)="deleteEntry(entry.id!)" class="delete-btn">
                  <mat-icon>close</mat-icon>
                </button>
              </div>
              @if (entry.type === 'text') {
                <pre class="cache-preview">{{ entry.output.slice(0, 300) }}{{ entry.output.length > 300 ? '...' : '' }}</pre>
              } @else {
                <div class="cache-image-preview">
                  <img [src]="entry.output" alt="cached" class="cache-thumb" />
                </div>
              }
            </div>
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: `
    .test-container { max-width: 720px; margin: 0 auto; padding: 1rem; display: flex; flex-direction: column; gap: 1rem; }
    .test-header { display: flex; align-items: center; gap: 0.75rem; position: relative; }
    .back-btn { color: rgba(255,255,255,0.7); background: rgba(0,0,0,0.2); }
    .test-title { font-family: 'Space Grotesk', sans-serif; font-size: 1.6rem; color: #fff; margin: 0; flex: 1; }
    .test-badge { font-size: 0.6rem; font-weight: 700; letter-spacing: 0.1em; background: #f44336; color: #fff; padding: 0.2rem 0.6rem; border-radius: 4px; }
    .test-card, .result-card, .cache-card { background: rgba(255,255,255,0.08); backdrop-filter: blur(16px); border-radius: 20px; border: 1px solid rgba(255,255,255,0.12); }
    .test-card--connect { border-color: rgba(76,175,80,0.2); }
    .test-card--connect mat-card-title mat-icon { vertical-align: middle; margin-right: 0.3rem; font-size: 1.1rem; }
    .test-card--connect mat-card-title .connected { color: #81c784; }
    .connect-desc { font-size: 0.8rem; color: rgba(255,255,255,0.55); margin: 0 0 0.75rem; }
    .connect-desc code { background: rgba(0,0,0,0.2); padding: 0.1rem 0.3rem; border-radius: 4px; font-size: 0.75rem; }
    .connect-actions { display: flex; align-items: center; gap: 0.75rem; }
    .connect-actions button { min-width: 180px; }
    .latency { font-size: 0.7rem; color: #81c784; font-weight: 600; }
    .connect-response { margin-top: 0.75rem; background: rgba(0,0,0,0.25); border-radius: 8px; padding: 0.75rem 1rem; }
    .bullet-list { margin: 0; padding-left: 1.2rem; list-style: disc; color: #e0e0e0; font-size: 0.85rem; line-height: 1.6; }
    .bullet-list li { margin-bottom: 0.25rem; }
    .status-ok { color: #81c784; font-weight: 600; }
    .status-working { color: #fbbf24; font-weight: 600; }
    .status-idle { color: rgba(255,255,255,0.35); }
    .full-width { width: 100%; margin-bottom: 1rem; }
    .gender-group { display: flex; gap: 1rem; margin-bottom: 1.5rem; }
    .button-row { display: flex; gap: 0.75rem; flex-wrap: wrap; }
    .button-row button { flex: 1; min-width: 140px; }
    .json-block { background: rgba(0,0,0,0.3); border-radius: 8px; padding: 1rem; font-size: 0.75rem; line-height: 1.5; overflow-x: auto; color: #a5d6ff; max-height: 400px; overflow-y: auto; }
    .image-result { display: flex; justify-content: center; }
    .gen-image { max-width: 100%; max-height: 400px; border-radius: 12px; }
    .error-banner { display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1rem; background: rgba(244,67,54,0.15); border: 1px solid rgba(244,67,54,0.3); border-radius: 12px; color: #ef9a9a; }
    .key-ok { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; background: rgba(76,175,80,0.12); border: 1px solid rgba(76,175,80,0.25); border-radius: 12px; color: #81c784; font-size: 0.85rem; }
    .key-ok mat-icon { font-size: 1.1rem; }
    .clear-btn { margin-left: 1rem; font-size: 0.7rem; }
    .empty-cache { color: rgba(255,255,255,0.4); font-size: 0.85rem; text-align: center; padding: 1rem; }
    .cache-item { background: rgba(0,0,0,0.15); border-radius: 10px; padding: 0.75rem; margin-bottom: 0.5rem; }
    .cache-meta { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem; }
    .cache-type { font-size: 0.6rem; font-weight: 700; padding: 0.15rem 0.4rem; border-radius: 4px; }
    .text-type { background: #1565c0; color: #fff; }
    .image-type { background: #e65100; color: #fff; }
    .cache-key { font-size: 0.7rem; color: rgba(255,255,255,0.5); flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .cache-date { font-size: 0.65rem; color: rgba(255,255,255,0.3); }
    .delete-btn { width: 24px; height: 24px; line-height: 24px; mat-icon { font-size: 14px; } }
    .cache-preview { font-size: 0.7rem; color: rgba(255,255,255,0.6); margin: 0; max-height: 60px; overflow: hidden; }
    .cache-image-preview { display: flex; }
    .cache-thumb { width: 48px; height: 48px; border-radius: 6px; object-fit: cover; }
  `,
})
export class TestPageComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private aiDescription = inject(AiDescriptionService);
  private imagen = inject(ImagenService);
  private openrouter = inject(OpenrouterService);
  private cache = inject(GeminiCacheService);

  testForm = this.fb.group({
    character: ['Pikachu', Validators.required],
    gender: ['F' as 'F' | 'M' | 'X', Validators.required],
  });

  loadingText = signal(false);
  loadingImage = signal(false);
  textResult = signal('');
  imageUrl = signal('');
  error = signal('');
  cachedEntries = signal<CacheEntry[]>([]);
  apiKeyReady = signal(this.checkApiKey());
  connecting = signal(false);
  connected = signal(false);
  latency = signal(0);
  connectionResponse = signal('');

  constructor() {
    this.loadCache();
  }

  private checkApiKey(): boolean {
    return !!OPENROUTER_API_KEY;
  }

  splitBullets(text: string): string[] {
    return text
      .split(/(?<=\.)\s+|\n+/)
      .map(s => s.trim())
      .filter(s => s.length > 0);
  }

  async testConnection() {
    this.connecting.set(true);
    this.connected.set(false);
    this.connectionResponse.set('');
    this.error.set('');

    const start = performance.now();
    try {
      const text = await this.openrouter.generateText(
        'You are a helpful assistant.',
        'Explain how AI works in a few words.',
      );
      this.latency.set(Math.round(performance.now() - start));
      this.connected.set(true);
      this.connectionResponse.set(text || '(respuesta vacía)');
    } catch (err: unknown) {
      this.latency.set(Math.round(performance.now() - start));
      this.connected.set(false);
      this.error.set(err instanceof Error ? err.message : String(err));
    } finally {
      this.connecting.set(false);
    }
  }

  private async loadCache() {
    const entries = await this.cache.getAll();
    this.cachedEntries.set(entries);
  }

  async testText() {
    const { character, gender } = this.testForm.value as { character: string; gender: 'F' | 'M' | 'X' };
    this.loadingText.set(true);
    this.textResult.set('');
    this.error.set('');
    try {
      const pieces = await this.aiDescription.generateOutfitPieces(character, gender, ['#303030', '#E0E0E0', '#F08030']);
      this.textResult.set(JSON.stringify(pieces, null, 2));
    } catch (err: unknown) {
      this.error.set(err instanceof Error ? err.message : String(err));
    } finally {
      this.loadingText.set(false);
      this.loadCache();
    }
  }

  async testImage() {
    const { character } = this.testForm.value as { character: string };
    this.loadingImage.set(true);
    this.imageUrl.set('');
    this.error.set('');
    try {
      const url = await this.imagen.generateOutfitImage(character, 'colorful anime outfit');
      if (url) {
        this.imageUrl.set(url);
      } else {
        this.error.set('No se generó ninguna imagen');
      }
    } catch (err: unknown) {
      this.error.set(err instanceof Error ? err.message : String(err));
    } finally {
      this.loadingImage.set(false);
      this.loadCache();
    }
  }

  async clearCache() {
    await this.cache.clear();
    this.cachedEntries.set([]);
  }

  async deleteEntry(id: number) {
    await this.cache.removeEntry(id);
    this.loadCache();
  }

  goBack() {
    this.router.navigate(['/']);
  }
}
