"use client";

import React, { useEffect, useState } from "react";
import { useAppSelector } from "@/redux/hooks";
import { translateText } from "@/utils/translator";
import { LanguageCode } from "@/redux/slices/languageSlice";

interface TranslateProps {
  children: string;
  className?: string;
}

export function Translate({ children, className }: TranslateProps) {
  const storeLang = useAppSelector(
    (state) => state.language.currentLanguage || "en"
  ) as LanguageCode;

  const [mounted, setMounted] = useState(false);
  const [translated, setTranslated] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    if (storeLang === "en" || !children) {
      setTranslated(children);
      return;
    }

    setTranslated(""); // reset to empty to prevent flash of English
    let isMounted = true;
    translateText(children, storeLang).then((res) => {
      if (isMounted) {
        setTranslated(res);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [children, storeLang, mounted]);

  // Hide children on hydration if stored language is not English
  if (!mounted && typeof window !== "undefined") {
    return <span className={className}></span>;
  }

  // Hide children if mounted but translation is not ready yet
  if (mounted && storeLang !== "en" && translated === "") {
    return <span className={className}></span>;
  }

  return <span className={className}>{translated || (storeLang === "en" ? children : "")}</span>;
}
