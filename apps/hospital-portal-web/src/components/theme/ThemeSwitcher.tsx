'use client';

import React from 'react';
import { useTheme } from '@/lib/theme/ThemeProvider';
import { Sun, Moon, Monitor, ChevronDown } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

type Theme = 'light' | 'dark' | 'system';

interface ThemeSwitcherProps {
  variant?: 'toggle' | 'dropdown' | 'buttons';
  className?: string;
  showLabel?: boolean;
}

const themeIcons: Record<Theme, React.ElementType> = {
  light: Sun,
  dark: Moon,
  system: Monitor
};

export function ThemeSwitcher({ variant = 'toggle', className = '', showLabel = false }: ThemeSwitcherProps) {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();
  const { t } = useTranslation();
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

  const themes: { value: Theme; label: string; icon: React.ElementType }[] = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor }
  ];

  // Simple toggle between light and dark
  if (variant === 'toggle') {
    return (
      <button
        onClick={toggleTheme}
        className={`relative flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800 ${className}`}
        title={t('settings.darkMode')}
        aria-label={resolvedTheme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      >
        <Sun className={`w-5 h-5 absolute transition-all duration-300 ${
          resolvedTheme === 'dark' 
            ? 'rotate-90 scale-0 opacity-0' 
            : 'rotate-0 scale-100 opacity-100 text-yellow-500'
        }`} />
        <Moon className={`w-5 h-5 absolute transition-all duration-300 ${
          resolvedTheme === 'dark' 
            ? 'rotate-0 scale-100 opacity-100 text-blue-400' 
            : '-rotate-90 scale-0 opacity-0'
        }`} />
      </button>
    );
  }

  // Button group for all three options
  if (variant === 'buttons') {
    return (
      <div className={`inline-flex items-center rounded-lg bg-gray-100 dark:bg-gray-800 p-1 ${className}`}>
        {themes.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            onClick={() => setTheme(value)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
              theme === value
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            title={label}
          >
            <Icon className="w-4 h-4" />
            {showLabel && <span>{label}</span>}
          </button>
        ))}
      </div>
    );
  }

  // Dropdown selector
  const CurrentIcon = themeIcons[theme];
  const currentLabel = themes.find(t => t.value === theme)?.label || 'System';

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        <CurrentIcon className="w-4 h-4" />
        {showLabel && <span className="font-medium">{currentLabel}</span>}
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
          {themes.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => {
                setTheme(value);
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                theme === value
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="flex-1 text-left font-medium">{label}</span>
              {theme === value && (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
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

// Compact theme toggle for headers
export function ThemeToggle({ className = '' }: { className?: string }) {
  const { resolvedTheme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${className}`}
      aria-label={resolvedTheme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
    >
      {resolvedTheme === 'light' ? (
        <Moon className="w-5 h-5" />
      ) : (
        <Sun className="w-5 h-5" />
      )}
    </button>
  );
}

export default ThemeSwitcher;
