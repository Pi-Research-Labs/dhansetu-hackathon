"use client";

import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setLanguage, LanguageCode } from "@/redux/slices/languageSlice";
import { translations, TranslationDictionary } from "./dictionary";

export function useTranslation() {
  const dispatch = useAppDispatch();
  const currentLanguage = useAppSelector(
    (state) => state.language.currentLanguage || "en"
  ) as LanguageCode;

  const t: TranslationDictionary = translations[currentLanguage] || translations.en;

  const changeLanguage = (lang: LanguageCode) => {
    dispatch(setLanguage(lang));
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
