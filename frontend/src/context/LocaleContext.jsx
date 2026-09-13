import React, { createContext, useContext, useMemo, useCallback } from 'react';

export const LocaleContext = createContext({
  locale: 'en',
  setLocale: () => {},
  t: (key, locale) => key
});

import en from '../locales/en.json';
import zh from '../locales/zh.json';
import ja from '../locales/ja.json';
import hi from '../locales/hi.json';

const LOCALES = { en, zh, ja, hi };

export function LocaleProvider({ children, locale: initialLocale, onLocaleChange }) {
  const locale = initialLocale || 'en';

  const t = useCallback((key, params = {}) => {
    const parts = key.split('.');
    let value = LOCALES[locale] || en;
    for (const part of parts) {
      value = value?.[part];
    }
    if (typeof value !== 'string') return key;
    return value.replace(/\{(\w+)\}/g, (_, k) => params[k] ?? _);
  }, [locale]);

  const setLocale = useCallback((nextLocale) => {
    if (onLocaleChange) onLocaleChange(nextLocale);
  }, [onLocaleChange]);

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  return React.createElement(LocaleContext.Provider, { value }, children);
}

export function useLocale() {
  return useContext(LocaleContext);
}
