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
    expect(text).toContain('** ');
  });

  it('should return text from API response', async () => {
    const mockResponse = {
      candidates: [{
        content: {
          parts: [{
            text: 'Outfit para mujer\n\n** Vestido amarillo con rayos\n** Diadema con orejas\n\nRecuerda: todas las cosas buenas están hechas con amor.',
          }],
        },
      }],
    };

    spyOn(window, 'fetch').and.resolveTo(
      new Response(JSON.stringify(mockResponse), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    const text = await service.generateDescription('pikachu', 'F');

    expect(text).toContain('Vestido');
    expect(text).toContain('Diadema');
  });

  it('should handle empty API response', async () => {
    spyOn(window, 'fetch').and.resolveTo(
      new Response(JSON.stringify({}), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    const text = await service.generateDescription('test', 'M');

    expect(text).toContain('Recuerda');
    expect(text).toContain('** ');
  });

  it('should work with unisex gender', async () => {
    spyOn(window, 'fetch').and.rejectWith(new Error('API error'));

    const text = await service.generateDescription('gengar', 'X');

    expect(text).toContain('unisex');
  });
});
