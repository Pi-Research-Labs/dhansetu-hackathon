import React, { useEffect, useState } from 'react';
import { Text, TextProps } from 'react-native';
import { useMerchantStore } from '@/store/useMerchantStore';
import { translateText } from '@/utils/translator';

interface TranslateProps extends TextProps {
  children: string;
}

/**
 * A drop-in replacement for React Native's <Text> component that automatically
 * translates its string children into the user's selected app language.
 * It is completely free, client-side, and falls back gracefully to the original English text.
 */
export function Translate({ children, style, ...props }: TranslateProps) {
  const { lang } = useMerchantStore();
  const [translatedText, setTranslatedText] = useState(children);

  useEffect(() => {
    if (lang === 'en' || !children) {
      setTranslatedText(children);
      return;
    }

    let isMounted = true;
    translateText(children, lang).then((res) => {
      if (isMounted) {
        setTranslatedText(res);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [children, lang]);

  return (
    <Text style={style} {...props}>
      {translatedText}
    </Text>
  );
}
