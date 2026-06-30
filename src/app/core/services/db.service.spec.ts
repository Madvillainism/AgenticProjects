import { TestBed } from '@angular/core/testing';
import { DbService } from './db.service';
import { OutfitResult } from '../models/outfit.interface';

describe('DbService', () => {
  let service: DbService;
  const mockCharacter = {
    name: 'Test',
    imageUrl: '',
    colorPalette: [],
    description: 'A test character',
  };

  beforeEach(async () => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DbService);
    await service.open();
  });

  afterEach(async () => {
    await service.delete();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should save and retrieve an outfit', async () => {
    const outfit: OutfitResult = {
      prompt: 'test outfit',
      gender: 'F',
      character: mockCharacter,
      pieces: [],
      createdAt: new Date(),
      isFavorite: false,
    };

    const id = await service.saveOutfit(outfit);
    expect(id).toBeGreaterThan(0);

    const retrieved = await service.getOutfitById(id);
    expect(retrieved).toBeDefined();
    expect(retrieved!.prompt).toBe('test outfit');
  });

  it('should toggle favorite status', async () => {
    const outfit: OutfitResult = {
      prompt: 'fave test',
      gender: 'M',
      character: mockCharacter,
      pieces: [],
      createdAt: new Date(),
      isFavorite: false,
    };

    const id = await service.saveOutfit(outfit);

    const toggled = await service.toggleFavorite(id);
    expect(toggled).toBeDefined();
    expect(toggled!.isFavorite).toBeTrue();

    const toggledBack = await service.toggleFavorite(id);
    expect(toggledBack!.isFavorite).toBeFalse();
  });

  it('should return undefined for non-existent id', async () => {
    const result = await service.getOutfitById(9999);
    expect(result).toBeUndefined();
  });

  it('should return all outfits ordered by creation date', async () => {
    const o1: OutfitResult = {
      prompt: 'first', gender: 'F',
      character: mockCharacter, pieces: [],
      createdAt: new Date('2024-01-01'), isFavorite: false,
    };
    const o2: OutfitResult = {
      prompt: 'second', gender: 'F',
      character: mockCharacter, pieces: [],
      createdAt: new Date('2024-06-01'), isFavorite: false,
    };

    await service.saveOutfit(o1);
    await service.saveOutfit(o2);

    const all = await service.getAllOutfits();
    expect(all.length).toBe(2);
    expect(all[0].prompt).toBe('second');
  });
});
