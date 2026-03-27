'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { locales, defaultLocale, type Locale, getDateLocale, getNumberLocale } from './config';
import en from './locales/en';
import hi from './locales/hi';
import ta from './locales/ta';
import te from './locales/te';

// Translation type based on English structure
type TranslationKeys = typeof en;

// All translations
const translations: Record<Locale, TranslationKeys> = {
  en,
  hi,
  ta,
  te
};

// i18n store state
interface I18nState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

// Zustand store with persistence
export const useI18nStore = create<I18nState>()(
  persist(
    (set) => ({
      locale: defaultLocale,
      setLocale: (locale: Locale) => set({ locale })
    }),
    {
      name: 'hospital-portal-i18n'
    }
  )
);

// Get nested translation value
function getNestedValue(obj: any, path: string): string {
  const keys = path.split('.');
  let current = obj;
  
  for (const key of keys) {
    if (current === undefined || current === null) {
      return path; // Return key if not found
    }
    current = current[key];
  }
  
  return typeof current === 'string' ? current : path;
}

// Translation hook
export function useTranslation() {
  const { locale, setLocale } = useI18nStore();
  const t = translations[locale] || translations[defaultLocale];

  // Translation function with interpolation support
  const translate = (key: string, params?: Record<string, string | number>): string => {
    let text = getNestedValue(t, key);
    
    if (params) {
      Object.entries(params).forEach(([paramKey, value]) => {
        text = text.replace(new RegExp(`{{${paramKey}}}`, 'g'), String(value));
      });
    }
    
    return text;
  };

  // Format date according to locale
  const formatDate = (date: Date | string, options?: Intl.DateTimeFormatOptions): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const dateLocale = getDateLocale(locale);
    return d.toLocaleDateString(dateLocale, options || {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Format number according to locale
  const formatNumber = (num: number, options?: Intl.NumberFormatOptions): string => {
    const numberLocale = getNumberLocale(locale);
    return new Intl.NumberFormat(numberLocale, options).format(num);
  };

  // Format currency (INR)
  const formatCurrency = (amount: number): string => {
    const numberLocale = getNumberLocale(locale);
    return new Intl.NumberFormat(numberLocale, {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Format relative time
  const formatRelativeTime = (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return translate('datetime.today');
    if (diffDays === 1) return translate('datetime.yesterday');
    if (diffDays === -1) return translate('datetime.tomorrow');
    if (diffDays > 1 && diffDays < 7) return `${diffDays} ${translate('datetime.days')} ${translate('datetime.ago')}`;
    
    return formatDate(d);
  };

  return {
    t: translate,
    locale,
    setLocale,
    locales,
    formatDate,
    formatNumber,
    formatCurrency,
    formatRelativeTime,
    translations: t
  };
}

// Static translation helper (for non-React contexts)
export function getTranslation(locale: Locale = defaultLocale) {
  const t = translations[locale] || translations[defaultLocale];
  
  return {
    t: (key: string, params?: Record<string, string | number>): string => {
      let text = getNestedValue(t, key);
      
      if (params) {
        Object.entries(params).forEach(([paramKey, value]) => {
          text = text.replace(new RegExp(`{{${paramKey}}}`, 'g'), String(value));
        });
      }
      
      return text;
    },
    formatDate: (date: Date | string, options?: Intl.DateTimeFormatOptions): string => {
      const d = typeof date === 'string' ? new Date(date) : date;
      const dateLocale = getDateLocale(locale);
      return d.toLocaleDateString(dateLocale, options || {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    },
    formatCurrency: (amount: number): string => {
      const numberLocale = getNumberLocale(locale);
      return new Intl.NumberFormat(numberLocale, {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      }).format(amount);
    }
  };
}

// Export types
export type { Locale, TranslationKeys };
export { locales, defaultLocale };
