"use client";

import { useMerchantStore } from "@/store/useMerchantStore";
import { translations, TranslationDictionary, LanguageCode } from "./dictionary";

export function useTranslation() {
  const { lang, setLang } = useMerchantStore();

  const currentLanguage = (lang || "en") as LanguageCode;
  const t: TranslationDictionary = translations[currentLanguage] || translations.en;

  const changeLanguage = (newLang: LanguageCode) => {
    // Both dictionaries use same language codes, map correctly
    setLang(newLang);
  };

  return {
    t,
    currentLanguage,
    changeLanguage,
    availableLanguages: [
      { code: "en", name: "English" },
      { code: "hi", name: "हिंदी" },
      { code: "te", name: "తెలుగు" },
      { code: "mr", name: "मराठी" },
    ],
  };
}
