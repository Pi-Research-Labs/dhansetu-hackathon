import { SupportedLang } from '@/i18n/translations';

/**
 * Translates a given English string into the target language using Google's free client translation endpoint.
 * This is an unofficial, completely free API. It falls back to the original text if it fails or hits limits.
 *
 * @param text The source text in English
 * @param targetLang Target language code ('en' | 'hi' | 'mr' | 'te')
 */
export async function translateText(text: string, targetLang: SupportedLang): Promise<string> {
  if (!text || targetLang === 'en') {
    return text;
  }

  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP Translation error status: ${response.status}`);
    }

    const data = await response.json();
    if (data && data[0]) {
      const translated = data[0]
        .map((item: any) => item[0])
        .filter(Boolean)
        .join('');
      return translated || text;
    }
  } catch (error) {
    console.warn('Auto translation failed, falling back to original English text:', error);
  }

  return text;
}
