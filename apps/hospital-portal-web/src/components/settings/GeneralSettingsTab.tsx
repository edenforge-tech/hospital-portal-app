// General Settings Tab Component
// Comprehensive general configuration interface for system settings

'use client';

import React from 'react';
import { Globe, Clock, Calendar, DollarSign, Languages } from 'lucide-react';
import { TenantSettings } from '../../lib/api/system-settings.api';

interface GeneralSettingsTabProps {
  settings: TenantSettings;
  updateSettings: (path: string, value: any) => void;
}

const timezones = [
  'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
  'America/Phoenix', 'America/Anchorage', 'Pacific/Honolulu', 'Europe/London',
  'Europe/Paris', 'Europe/Berlin', 'Asia/Tokyo', 'Asia/Shanghai', 'Australia/Sydney'
];

const languages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ja', name: 'Japanese' },
];

const currencies = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
];

const dateFormats = [
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (US)', example: '12/31/2024' },
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (EU)', example: '31/12/2024' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (ISO)', example: '2024-12-31' },
];

const timeFormats = [
  { value: '12h', label: '12-hour (AM/PM)', example: '2:30 PM' },
  { value: '24h', label: '24-hour', example: '14:30' },
];

export default function GeneralSettingsTab({ settings, updateSettings }: GeneralSettingsTabProps) {
  const { generalSettings } = settings;

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center space-x-3 mb-6">
        <Globe className="h-6 w-6 text-blue-500" />
        <h3 className="text-lg font-semibold text-gray-900">General Configuration</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Organization Information */}
        <div className="space-y-6">
          <div>
            <h4 className="text-base font-semibold text-gray-800 mb-4">Organization Information</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Organization Name
                </label>
                <input
                  type="text"
                  value={generalSettings.organizationName}
                  onChange={(e) => updateSettings('generalSettings.organizationName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter organization name"
                />
                <p className="mt-1 text-xs text-gray-500">
                  This name will appear throughout the system and in communications
                </p>
              </div>
            </div>
          </div>

          {/* Localization Settings */}
          <div>
            <h4 className="text-base font-semibold text-gray-800 mb-4 flex items-center">
              <Languages className="h-4 w-4 mr-2" />
              Localization
            </h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Default Language
                </label>
                <select
                  value={generalSettings.language}
                  onChange={(e) => updateSettings('generalSettings.language', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {languages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Clock className="inline h-4 w-4 mr-1" />
                  Time Zone
                </label>
                <select
                  value={generalSettings.timeZone}
                  onChange={(e) => updateSettings('generalSettings.timeZone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {timezones.map((tz) => (
                    <option key={tz} value={tz}>
                      {tz.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  All times will be displayed in this timezone
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Format Settings */}
        <div className="space-y-6">
          <div>
            <h4 className="text-base font-semibold text-gray-800 mb-4 flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Date & Time Formats
            </h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date Format
                </label>
                <select
                  value={generalSettings.dateFormat}
                  onChange={(e) => updateSettings('generalSettings.dateFormat', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {dateFormats.map((format) => (
                    <option key={format.value} value={format.value}>
                      {format.label} - {format.example}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time Format
                </label>
                <select
                  value={generalSettings.timeFormat}
                  onChange={(e) => updateSettings('generalSettings.timeFormat', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {timeFormats.map((format) => (
                    <option key={format.value} value={format.value}>
                      {format.label} - {format.example}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Financial Settings */}
          <div>
            <h4 className="text-base font-semibold text-gray-800 mb-4 flex items-center">
              <DollarSign className="h-4 w-4 mr-2" />
              Financial Settings
            </h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Default Currency
                </label>
                <select
                  value={generalSettings.currency}
                  onChange={(e) => updateSettings('generalSettings.currency', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {currencies.map((currency) => (
                    <option key={currency.code} value={currency.code}>
                      {currency.symbol} - {currency.name} ({currency.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fiscal Year Start
                </label>
                <input
                  type="date"
                  value={`2024-${generalSettings.fiscalYearStart}`}
                  onChange={(e) => {
                    const date = new Date(e.target.value);
                    const monthDay = `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                    updateSettings('generalSettings.fiscalYearStart', monthDay);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Used for financial reporting and analytics
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Section */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h4 className="text-base font-semibold text-gray-800 mb-4">Format Preview</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-white rounded-md p-3">
            <div className="font-medium text-gray-700">Date Format</div>
            <div className="text-gray-900">
              {new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: generalSettings.dateFormat.includes('MM/DD') ? '2-digit' : 'numeric',
                day: '2-digit'
              })}
            </div>
          </div>
          
          <div className="bg-white rounded-md p-3">
            <div className="font-medium text-gray-700">Time Format</div>
            <div className="text-gray-900">
              {new Date().toLocaleTimeString('en-US', {
                hour12: generalSettings.timeFormat === '12h',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
          
          <div className="bg-white rounded-md p-3">
            <div className="font-medium text-gray-700">Currency</div>
            <div className="text-gray-900">
              {currencies.find(c => c.code === generalSettings.currency)?.symbol || '$'}123.45
            </div>
          </div>
        </div>
      </div>

      {/* Help Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h5 className="text-sm font-semibold text-blue-800 mb-2">Configuration Tips</h5>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Changes to date/time formats will apply to all new data and reports</li>
          <li>• Time zone changes affect appointment scheduling and notifications</li>
          <li>• Currency settings impact billing and financial reporting</li>
          <li>• Organization name appears in emails, documents, and system headers</li>
        </ul>
      </div>
    </div>
  );
}