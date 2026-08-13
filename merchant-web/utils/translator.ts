import { SupportedLang } from '@/i18n/translations';

/**
 * Translates a given English string into the target language using Google's free client translation endpoint.
 * This is an unofficial, completely free API. It falls back to the original text if it fails or hits limits.
 *
 * @param text The source text in English
 * @param targetLang Target language code ('en' | 'hi' | 'mr' | 'te')
 */

/**
 * One network call per (text, language) pair, for the lifetime of the session.
 *
 * A translation is immutable for a given pair, so re-requesting it is pure
 * waste -- and the endpoint below is the unofficial free one, which rate-limits
 * by IP. When it starts refusing, every string silently falls back to English,
 * which looks exactly like the language switch being broken. Uncached, a single
 * screen re-render could fire dozens of requests for strings already
 * translated.
 *
 * The *promise* is cached rather than the resolved string, so that several
 * components mounting at once with the same text share one request instead of
 * racing to make the same call.
 *
 * Failed keys are evicted. Caching a failure would pin that string to its
 * English fallback for the rest of the session, turning one transient 429 into
 * a permanent one.
 */
const translationCache = new Map<string, Promise<string>>();

async function requestTranslation(text: string, targetLang: SupportedLang): Promise<string> {
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

  // Shape is [[[translatedChunk, sourceChunk, ...], ...], ...] -- a sentence
  // comes back split across chunks, so they are joined back together.
  const data = (await response.json()) as [unknown[][]?];
  const translated = (data?.[0] ?? [])
    .map((chunk) => (typeof chunk?.[0] === 'string' ? chunk[0] : ''))
    .filter(Boolean)
    .join('');

  // An OK response with nothing usable in it is treated as a failure so the
  // key is evicted and retried, rather than caching the English fallback.
  if (!translated) {
    throw new Error('Translation response contained no usable text');
  }

  return translated;
}

export async function translateText(text: string, targetLang: SupportedLang): Promise<string> {
  if (!text || targetLang === 'en') {
    return text;
  }

  const cacheKey = `${targetLang}|${text}`;
  const cached = translationCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const pending = requestTranslation(text, targetLang);
  translationCache.set(cacheKey, pending);

  try {
    return await pending;
  } catch (error) {
    translationCache.delete(cacheKey);
    console.warn('Auto translation failed, falling back to original English text:', error);
    return text;
  }
}
