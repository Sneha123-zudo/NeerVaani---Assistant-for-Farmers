
'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { translations, type TranslationKey } from '@/lib/i18n';

type LanguageContextType = {
  locale: string;
  setLocale: (locale: string) => void;
  t: (key: TranslationKey, ...args: any[]) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [locale, setLocaleState] = useState('en'); 

  useEffect(() => {
    const savedLocale = localStorage.getItem('locale') || 'en';
    setLocaleState(savedLocale);
  }, []);

  const setLocale = (newLocale: string) => {
    setLocaleState(newLocale);
    localStorage.setItem('locale', newLocale);
  };

  const t = useCallback((key: TranslationKey, ...args: any[]): string => {
      const langTranslations = translations[locale] || translations['en'];
      let translation = langTranslations[key] || key;
      
      if (args.length > 0) {
          translation = translation.replace(/%s/g, () => args.shift() || '');
      }
      
      return translation;
  }, [locale]);

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
