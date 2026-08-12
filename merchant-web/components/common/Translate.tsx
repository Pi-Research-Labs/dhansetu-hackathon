"use client";

import React, { useEffect, useState } from 'react';
import { useMerchantStore } from '@/store/useMerchantStore';
import { translateText } from '@/utils/translator';
import { L, SupportedLang } from '@/i18n/translations';

interface TranslateProps {
  children: string;
  className?: string;
}

const getStoredLang = (): SupportedLang => {
  if (typeof window === 'undefined') return 'en';
  try {
    const val = localStorage.getItem('@dhansetu_lang');
    if (val === 'en' || val === 'hi' || val === 'mr' || val === 'te') {
      return val;
    }
  } catch (e) {
    // ignore
  }
  return 'en';
};

export function Translate({ children, className }: TranslateProps) {
  const { lang: storeLang } = useMerchantStore();
  const [mounted, setMounted] = useState(false);
  const [translated, setTranslated] = useState('');

  // Determine active language: read synchronously from localStorage during client mount frame
  const activeLang = mounted ? storeLang : (typeof window !== 'undefined' ? getStoredLang() : 'en');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    if (activeLang === 'en' || !children) {
      setTranslated(children);
      return;
    }

    setTranslated(''); // reset to empty to prevent flash of English
    let isMounted = true;
    translateText(children, activeLang).then((res) => {
      if (isMounted) {
        setTranslated(res);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [children, activeLang, mounted]);

  // Hide children on hydration if stored language is not English
  if (!mounted && typeof window !== 'undefined' && getStoredLang() !== 'en') {
    return <span className={className}></span>;
  }

  // Hide children if mounted but translation is not ready yet
  if (mounted && activeLang !== 'en' && translated === '') {
    return <span className={className}></span>;
  }

  return <span className={className}>{translated || (activeLang === 'en' ? children : '')}</span>;
}
