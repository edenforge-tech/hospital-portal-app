'use client';

import React from 'react';
import { useTranslation, locales, type Locale } from '@/lib/i18n';
import { ChevronDown, Globe } from 'lucide-react';

interface LanguageSelectorProps {
  variant?: 'dropdown' | 'inline' | 'compact';
  className?: string;
}

export function LanguageSelector({ variant = 'dropdown', className = '' }: LanguageSelectorProps) {
  const { locale, setLocale, t } = useTranslation();
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentLocale = locales.find(l => l.code === locale) || locales[0];

  if (variant === 'compact') {
    return (
      <div ref={dropdownRef} className={`relative ${className}`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1 px-2 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
          title={t('settings.language')}
        >
          <Globe className="w-4 h-4" />
          <span className="font-medium">{currentLocale.code.toUpperCase()}</span>
        </button>
        
        {isOpen && (
          <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
            {locales.map((loc) => (
              <button
                key={loc.code}
                onClick={() => {
                  setLocale(loc.code as Locale);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${
                  locale === loc.code ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                }`}
              >
                <span className="text-lg">{loc.flag}</span>
                <span className="flex-1 text-left">{loc.name}</span>
                {locale === loc.code && (
                  <span className="text-blue-600">✓</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Globe className="w-4 h-4 text-gray-500" />
        <div className="flex items-center gap-1">
          {locales.map((loc, index) => (
            <React.Fragment key={loc.code}>
              <button
                onClick={() => setLocale(loc.code as Locale)}
                className={`px-2 py-1 text-sm rounded transition-colors ${
                  locale === loc.code
                    ? 'bg-blue-100 text-blue-700 font-medium'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {loc.code.toUpperCase()}
              </button>
              {index < locales.length - 1 && (
                <span className="text-gray-300">|</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  }

  // Default: dropdown
  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <Globe className="w-4 h-4" />
        <span className="text-lg">{currentLocale.flag}</span>
        <span className="font-medium">{currentLocale.name}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
          {locales.map((loc) => (
            <button
              key={loc.code}
              onClick={() => {
                setLocale(loc.code as Locale);
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${
                locale === loc.code ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
              }`}
            >
              <span className="text-lg">{loc.flag}</span>
              <span className="flex-1 text-left font-medium">{loc.name}</span>
              {locale === loc.code && (
                <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default LanguageSelector;
