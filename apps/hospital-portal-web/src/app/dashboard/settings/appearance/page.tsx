'use client';

import React from 'react';
import { 
  Palette, 
  Globe, 
  Monitor,
  Sun,
  Moon,
  Check,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import { useTheme } from '@/lib/theme/ThemeProvider';
import { useTranslation, locales, type Locale } from '@/lib/i18n';

export default function AppearanceSettingsPage() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { locale, setLocale, t, formatCurrency } = useTranslation();

  const themeOptions = [
    { value: 'light', label: 'Light', icon: Sun, description: 'Use light colors for the interface' },
    { value: 'dark', label: 'Dark', icon: Moon, description: 'Use dark colors, easier on eyes in low light' },
    { value: 'system', label: 'System', icon: Monitor, description: 'Automatically match your device settings' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/dashboard/settings" 
            className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Settings
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <Palette className="w-8 h-8 text-gray-700 dark:text-gray-300" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Appearance & Language</h1>
          </div>
          <p className="text-gray-500 dark:text-gray-400">Customize how Hospital Portal looks and feels</p>
        </div>

        <div className="space-y-8">
          {/* Theme Selection */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Theme</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Choose how Hospital Portal looks to you. Select a single theme or sync with your system settings.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {themeOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = theme === option.value;
                return (
                  <button
                    key={option.value}
                    onClick={() => setTheme(option.value as 'light' | 'dark' | 'system')}
                    className={`relative flex flex-col items-center p-6 rounded-xl border-2 transition-all duration-200 ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2">
                        <Check className="w-5 h-5 text-blue-500" />
                      </div>
                    )}
                    <div className={`p-3 rounded-lg mb-3 ${
                      isSelected ? 'bg-blue-100 dark:bg-blue-800' : 'bg-gray-100 dark:bg-gray-700'
                    }`}>
                      <Icon className={`w-6 h-6 ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`} />
                    </div>
                    <span className={`font-medium ${isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-gray-900 dark:text-white'}`}>
                      {option.label}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1">
                      {option.description}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Current Theme Preview */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Preview</h4>
              <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm">
                    HP
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white text-sm">Hospital Portal</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Eye Care Specialist</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    Active
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                    Premium
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Currently using <strong className="text-gray-700 dark:text-gray-300">{resolvedTheme}</strong> theme
                {theme === 'system' && ' (following system preference)'}
              </p>
            </div>
          </div>

          {/* Language Selection */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-2 mb-2">
              <Globe className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('settings.language')}</h3>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Select your preferred language. This will change all text throughout the application.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {locales.map((loc) => (
                <button
                  key={loc.code}
                  onClick={() => setLocale(loc.code as Locale)}
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 ${
                    locale === loc.code
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
                  }`}
                >
                  <span className="text-3xl">{loc.flag}</span>
                  <div className="flex-1 text-left">
                    <div className={`font-medium ${locale === loc.code ? 'text-blue-700 dark:text-blue-300' : 'text-gray-900 dark:text-white'}`}>
                      {loc.name}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {loc.code.toUpperCase()}
                    </div>
                  </div>
                  {locale === loc.code && (
                    <Check className="w-5 h-5 text-blue-500" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Regional Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Regional Settings</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              These settings are automatically configured based on your language selection.
            </p>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">Currency</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Indian Rupee (INR)</div>
                </div>
                <div className="font-mono text-gray-700 dark:text-gray-300">
                  {formatCurrency(12500)}
                </div>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">Date Format</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">DD/MM/YYYY</div>
                </div>
                <div className="font-mono text-gray-700 dark:text-gray-300">
                  {new Date().toLocaleDateString('en-IN')}
                </div>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">Time Zone</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">India Standard Time</div>
                </div>
                <div className="font-mono text-gray-700 dark:text-gray-300">IST (UTC+5:30)</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
