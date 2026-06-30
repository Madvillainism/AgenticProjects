import { TestBed } from '@angular/core/testing';
import { GeminiService } from './gemini.service';

describe('GeminiService', () => {
  let service: GeminiService;

  beforeEach(() => {
    (window as unknown as Record<string, unknown>)['env'] = { GEMINI_API_KEY: 'test-key' };
    TestBed.configureTestingModule({});
    service = TestBed.inject(GeminiService);
  });

  afterEach(() => {
    delete (window as unknown as Record<string, unknown>)['env'];
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return fallback when API call fails', async () => {
    spyOn(window, 'fetch').and.rejectWith(new Error('API error'));

    const text = await service.generateDescription('pikachu', 'F');

    expect(text).toBeTruthy();
    expect(text).toContain('Recuerda');
    expect(text).toContain('Prenda principal');
  });

  it('should work with unisex gender', async () => {
    spyOn(window, 'fetch').and.rejectWith(new Error('API error'));

    const text = await service.generateDescription('gengar', 'X');

    expect(text).toContain('unisex');
  });
});
