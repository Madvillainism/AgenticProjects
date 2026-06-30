import { Injectable } from '@angular/core';

interface EnvWindow {
  env?: { GEMINI_API_KEY: string };
}

interface GeminiResponse {
  candidates?: {
    content?: {
      parts?: { text?: string }[];
    };
  }[];
}

@Injectable({ providedIn: 'root' })
export class GeminiService {
  private apiKey: string;

  constructor() {
    this.apiKey = (window as unknown as EnvWindow).env?.GEMINI_API_KEY ?? '';
  }

  async generateDescription(character: string, gender: string): Promise<string> {
    const genderMap: Record<string, string> = { M: 'hombre', F: 'mujer', X: 'unisex' };
    const genderWord = genderMap[gender] ?? 'unisex';
    const article = genderWord === 'mujer' ? 'una' : 'un';

    const systemInstruction =
      `Eres un experto en moda urbana japonesa especializado en accesorios y ropa estilo anime. ` +
      `Proporciona consejos expertos sobre tendencias de moda basadas en outfits de personajes anime. ` +
      `Mantén la respuesta simple, no más de 3 párrafos y divídela en viñetas. ` +
      `Señala el género para el que está pensado el outfit. ` +
      `Usa los colores del personaje descrito como guía principal. ` +
      `Ejemplo: Goku usa un gi NARANJA y pantalones azules. ` +
      `Ejemplo: para un outfit inspirado en Itachi Uchiha podrías usar una camiseta negra con una banda roja, pantalones rojo oscuro y zapatos negros. ` +
      `Ejemplo 2: para un outfit femenino de Naruto Uzumaki: un top naranja, una falda negra y zapatos negros con un colgante kunai. ` +
      `Estructura la respuesta así:\n\n` +
      `TÍTULO\n\n` +
      `** Viñeta 1\n` +
      `** Viñeta 2\n` +
      `** Viñeta 3\n\n` +
      `Termina con la frase: "Recuerda: todas las cosas buenas están hechas con amor."`;

    const userMessage =
      `Crea un outfit para ${article} ${genderWord} joven basado fuertemente en "${character}"`;

    try {
      const data = await this.callGemini(systemInstruction, userMessage);
      const text = this.extractText(data);
      if (!text) throw new Error('Empty response');
      return text;
    } catch {
      return (
        `Outfit para ${genderWord}\n\n` +
        `** Prenda principal: Versión anime inspirada en "${character}", estilo ${genderWord}\n` +
        `** Accesorio: Complemento que combina con el estilo ${genderWord}\n` +
        `** Calzado: Zapatos que complementan el look\n\n` +
        `Recuerda: todas las cosas buenas están hechas con amor.`
      );
    }
  }

  private async callGemini(systemInstruction: string, userMessage: string): Promise<GeminiResponse> {
    const url =
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-001:generateContent?key=${this.apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemInstruction }] },
        contents: [{ parts: [{ text: userMessage }] }],
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status} ${await response.text()}`);
    }

    return response.json();
  }

  private extractText(data: GeminiResponse): string {
    const parts = data?.candidates?.[0]?.content?.parts;
    if (!parts || parts.length === 0) return '';
    return parts.map((p) => p.text ?? '').join('\n');
  }
}
