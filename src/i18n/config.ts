export type Locale = 'en' | 'es';
export const defaultLocale: Locale = 'en';
export const locales: Locale[] = ['en', 'es'];

import enCommon from './en/common.json';
import esCommon from './es/common.json';
import enCalculators from './en/calculators.json';
import esCalculators from './es/calculators.json';
import enHomepage from './en/homepage.json';
import esHomepage from './es/homepage.json';

const translations: Record<Locale, Record<string, Record<string, string>>> = {
  en: {
    common: enCommon,
    calculators: enCalculators as Record<string, string>,
    homepage: enHomepage as Record<string, string>,
  },
  es: {
    common: esCommon,
    calculators: esCalculators as Record<string, string>,
    homepage: esHomepage as Record<string, string>,
  },
};

export function getLocaleFromUrl(url: URL): Locale {
  const [, segment] = url.pathname.split('/');
  if (locales.includes(segment as Locale)) return segment as Locale;
  return defaultLocale;
}

export function t(locale: Locale, ns: string, key: string): string {
  return (
    translations[locale]?.[ns]?.[key] ??
    translations[defaultLocale]?.[ns]?.[key] ??
    key
  );
}

export function useTranslations(locale: Locale, ns: string) {
  return (key: string) => t(locale, ns, key);
}

export function getLocalizedPath(path: string, locale: Locale): string {
  if (locale === defaultLocale) {
    return path.startsWith('/') ? path : `/${path}`;
  }
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `/${locale}${cleanPath}`;
}

export function getTranslationObject(locale: Locale, ns: string): Record<string, string> {
  return translations[locale]?.[ns] ?? translations[defaultLocale]?.[ns] ?? {};
}
