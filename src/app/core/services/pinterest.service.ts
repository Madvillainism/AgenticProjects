import { Injectable } from '@angular/core';

const CORS_PROXIES = [
  (u: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
  (u: string) => `https://corsproxy.io/?url=${encodeURIComponent(u)}`,
  (u: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(u)}`,
];

export interface PinterestResult {
  imageUrl: string;
  pinUrl: string;
}

@Injectable({ providedIn: 'root' })
export class PinterestService {
  async searchImage(query: string): Promise<PinterestResult> {
    const searchUrl = `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(query)}`;

    for (const buildProxyUrl of CORS_PROXIES) {
      try {
        const proxyUrl = buildProxyUrl(searchUrl);
        const response = await fetch(proxyUrl, { signal: AbortSignal.timeout(10000) });
        if (!response.ok) continue;
        const html = await response.text();
        const imageUrl = this.extractFirstImage(html);
        const pinUrl = this.extractFirstPinUrl(html);
        if (imageUrl) {
          return { imageUrl, pinUrl: pinUrl ? `https://www.pinterest.com${pinUrl}` : '' };
        }
      } catch {
        continue;
      }
    }

    return { imageUrl: '', pinUrl: '' };
  }

  private extractFirstImage(html: string): string | null {
    const regex = /https?:\/\/i\.pinimg\.com\/[^\s"'>]+/g;
    const matches = html.match(regex);
    if (!matches) return null;
    const filtered = [...new Set(matches)].find((url) => url.match(/\.(jpg|png)(\?.*)?$/i));
    return filtered ?? null;
  }

  private extractFirstPinUrl(html: string): string | null {
    const regex = /\/pin\/\d+\//;
    const match = html.match(regex);
    return match ? match[0] : null;
  }
}
