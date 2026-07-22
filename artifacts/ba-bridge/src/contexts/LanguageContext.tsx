import React, { createContext, useContext, useEffect, useState } from 'react';
import { translations, type Lang, type TranslationKey } from '@/lib/i18n';

type LanguageContextType = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: TranslationKey) => string;
  isRTL: boolean;
};

const LanguageContext = createContext<LanguageContextType | null>(null);

function applyLangToDOM(l: Lang) {
  document.documentElement.dir = l === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.lang = l;
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    return (localStorage.getItem('ba_bridge_lang') as Lang) ?? 'en';
  });

  // Apply on first mount
  useEffect(() => { applyLangToDOM(lang); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem('ba_bridge_lang', l);
    applyLangToDOM(l);
  };

  const t = (key: TranslationKey): string => {
    return (translations[lang] as Record<string, string>)[key]
      ?? (translations.en as Record<string, string>)[key]
      ?? key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, isRTL: lang === 'ar' }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
