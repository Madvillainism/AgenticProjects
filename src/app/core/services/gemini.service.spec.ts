import { TestBed } from '@angular/core/testing';
import { GeminiService } from './gemini.service';

describe('GeminiService', () => {
  let service: GeminiService;

  function setApiKey(key: string) {
    (window as unknown as Record<string, unknown>)['env'] = { GEMINI_API_KEY: key };
  }

  beforeEach(() => {
    setApiKey('test-key');
    TestBed.configureTestingModule({});
    service = TestBed.inject(GeminiService);
  });

  afterEach(() => {
    delete (window as unknown as Record<string, unknown>)['env'];
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return empty string when API call fails', async () => {
    spyOn(window, 'fetch').and.rejectWith(new Error('API error'));

    const text = await service.generateDescription('pikachu', 'F');

    expect(text).toBe('');
  });

  it('should return text from a valid API response', async () => {
    const mockResponse = {
      candidates: [{
        content: {
          parts: [{ text: 'Un outfit fresco con una camiseta amarilla y jeans azules.' }],
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

    expect(text).toContain('camiseta amarilla');
  });

  it('should return empty string when API returns empty response', async () => {
    spyOn(window, 'fetch').and.resolveTo(
      new Response(JSON.stringify({}), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    const text = await service.generateDescription('test', 'M');

    expect(text).toBe('');
  });

  it('should handle unisex gender', async () => {
    spyOn(window, 'fetch').and.rejectWith(new Error('API error'));

    const text = await service.generateDescription('gengar', 'X');

    expect(text).toBe('');
  });
});
