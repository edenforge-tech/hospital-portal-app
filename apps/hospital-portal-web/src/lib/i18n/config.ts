// i18n configuration for Hospital Portal
// Supports: English (en), Hindi (hi), Tamil (ta), Telugu (te)

export const locales = ['en', 'hi', 'ta', 'te'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export const localeNames: Record<Locale, string> = {
  en: 'English',
  hi: 'हिन्दी',
  ta: 'தமிழ்',
  te: 'తెలుగు'
};

export const localeFlags: Record<Locale, string> = {
  en: '🇬🇧',
  hi: '🇮🇳',
  ta: '🇮🇳',
  te: '🇮🇳'
};

// Date format locales mapping
export const dateLocales: Record<Locale, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  ta: 'ta-IN',
  te: 'te-IN'
};

// Number format locales
export const numberLocales: Record<Locale, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  ta: 'ta-IN',
  te: 'te-IN'
};

// Currency settings
export const currencyConfig = {
  currency: 'INR',
  currencyDisplay: 'symbol' as const
};

// RTL languages (none for our current set)
export const rtlLocales: Locale[] = [];

export const isRTL = (locale: Locale): boolean => rtlLocales.includes(locale);

export function getDateLocale(locale: Locale): string {
  return dateLocales[locale] ?? dateLocales[defaultLocale];
}

export function getNumberLocale(locale: Locale): string {
  return numberLocales[locale] ?? numberLocales[defaultLocale];
}
