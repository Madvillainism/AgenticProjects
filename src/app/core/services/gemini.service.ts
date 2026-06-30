import { Injectable } from '@angular/core';
import { GoogleGenAI } from '@google/genai';

@Injectable({ providedIn: 'root' })
export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    const key = (window as unknown as { env?: { GEMINI_API_KEY: string } }).env?.GEMINI_API_KEY ?? '';
    this.ai = new GoogleGenAI({ apiKey: key });
  }

  async generateDescription(character: string, gender: string): Promise<string> {
    const genderMap: Record<string, string> = { M: 'hombre', F: 'mujer', X: 'unisex' };
    const genderWord = genderMap[gender] ?? 'unisex';
    const article = genderWord === 'mujer' ? 'una' : 'un';

    const prompt = `Crea un outfit para ${article} ${genderWord} joven basado fuertemente en "${character}"`;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.0-flash',
        config: {
          systemInstruction:
            'Eres un experto en moda urbana japonesa. Da ideas de outfits en español, ' +
            'menciona prendas, colores y accesorios. Termina con: "Recuerda: todas las cosas buenas están hechas con amor."',
        },
        contents: prompt,
      });

      return response.text ?? prompt;
    } catch {
      return (
        `Outfit para ${genderWord}\n\n` +
        `Prenda principal: Versión anime inspirada en "${character}", estilo ${genderWord}\n` +
        `Accesorio: Complemento que combina\n` +
        `Calzado: Zapatos que complementan\n\n` +
        `Recuerda: todas las cosas buenas están hechas con amor.`
      );
    }
  }
}
