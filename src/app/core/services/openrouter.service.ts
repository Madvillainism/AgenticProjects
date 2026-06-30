import { Injectable } from '@angular/core';
import OpenAI from 'openai';
import { OPENROUTER_API_KEY } from '../../../env';

@Injectable({ providedIn: 'root' })
export class OpenrouterService {
  private client = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: OPENROUTER_API_KEY,
    dangerouslyAllowBrowser: true,
  });

  async generateText(
    system: string,
    user: string,
    model = 'openrouter/free'
  ): Promise<string> {
    const res = await this.client.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      temperature: 0.8,
      max_tokens: 1024,
    });
    return res.choices[0]?.message?.content || '';
  }

  private imageModels = [
    'bytedance-seed/seedream-4.5',
    'black-forest-labs/flux-1.1-pro',
    'black-forest-labs/flux-schnell',
  ];

  async generateImage(prompt: string): Promise<string> {
    const errors: string[] = [];
    for (const model of this.imageModels) {
      try {
        const res = await fetch('https://openrouter.ai/api/v1/images', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ model, prompt, n: 1 }),
        });
        const json = await res.json();
        if (!res.ok) {
          errors.push(`${model}: ${json.error?.message || res.statusText}`);
          continue;
        }
        const data = json.data?.[0];
        const b64 = data?.b64_json;
        const url = data?.url;
        if (b64) return `data:image/png;base64,${b64}`;
        if (url) return url;
        errors.push(`${model}: no image in response`);
      } catch (e) {
        errors.push(`${model}: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
    throw new Error(`Image models failed: ${errors.join('; ')}`);
  }
}
