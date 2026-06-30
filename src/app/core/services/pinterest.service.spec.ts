import { TestBed } from '@angular/core/testing';
import { PinterestService } from './pinterest.service';

describe('PinterestService', () => {
  let service: PinterestService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PinterestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return empty result when all proxies fail', async () => {
    spyOn(window, 'fetch').and.rejectWith(new Error('network error'));

    const result = await service.searchImage('test query');
    expect(result.imageUrl).toBe('');
    expect(result.pinUrl).toBe('');
  });

  it('should return empty result when proxy returns non-ok', async () => {
    spyOn(window, 'fetch').and.resolveTo(new Response(null, { status: 500 }));

    const result = await service.searchImage('test query');
    expect(result.imageUrl).toBe('');
    expect(result.pinUrl).toBe('');
  });

  it('should extract first pinimg URL and pin URL from HTML', async () => {
    const html = `
      <html>
        <a href="/pin/31947478604708570/">
          <img src="https://i.pinimg.com/123x456/test1.jpg" />
        </a>
        <img src="https://i.pinimg.com/789x012/test2.png" />
      </html>
    `;

    spyOn(window, 'fetch').and.resolveTo(
      new Response(html, { status: 200, headers: { 'Content-Type': 'text/html' } })
    );

    const result = await service.searchImage('test query');
    expect(result.imageUrl).toBe('https://i.pinimg.com/123x456/test1.jpg');
    expect(result.pinUrl).toBe('https://www.pinterest.com/pin/31947478604708570/');
  });

  it('should handle empty HTML gracefully', async () => {
    spyOn(window, 'fetch').and.resolveTo(
      new Response('<html></html>', { status: 200 })
    );

    const result = await service.searchImage('test query');
    expect(result.imageUrl).toBe('');
    expect(result.pinUrl).toBe('');
  });
});
