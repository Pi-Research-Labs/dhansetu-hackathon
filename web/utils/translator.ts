import { LanguageCode } from "@/redux/slices/languageSlice";

const translationCache = new Map<string, Promise<string>>();

async function requestTranslation(text: string, targetLang: LanguageCode): Promise<string> {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Accept": "application/json",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP Translation error status: ${response.status}`);
  }

  const data = (await response.json()) as [unknown[][]?];
  const translated = (data?.[0] ?? [])
    .map((chunk) => (typeof chunk?.[0] === "string" ? chunk[0] : ""))
    .filter(Boolean)
    .join("");

  if (!translated) {
    throw new Error("Translation response contained no usable text");
  }

  return translated;
}

export async function translateText(text: string, targetLang: LanguageCode): Promise<string> {
  if (!text || targetLang === "en") {
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
    console.warn("Auto translation failed, falling back to original English text:", error);
    return text;
  }
}
