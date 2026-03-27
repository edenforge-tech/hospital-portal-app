// General Settings Component
// Organization information, business hours, and basic configuration

'use client';

import React, { useState } from 'react';
import { 
  Building, 
  Clock, 
  Globe, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Info,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface GeneralSettingsProps {
  settings: any;
  onUpdate: (category: string, field: string, value: any) => void;
  validationErrors: { [key: string]: string };
}

export default function GeneralSettings({ settings, onUpdate, validationErrors }: GeneralSettingsProps) {
  const [showBusinessHours, setShowBusinessHours] = useState(false);

  const timezones = [
    'America/New_York',
    'America/Chicago', 
    'America/Denver',
    'America/Los_Angeles',
    'America/Phoenix',
    'America/Anchorage',
    'Pacific/Honolulu',
    'UTC'
  ];

  const currencies = [
    { code: 'USD', name: 'US Dollar ($)' },
    { code: 'EUR', name: 'Euro (€)' },
    { code: 'GBP', name: 'British Pound (£)' },
    { code: 'CAD', name: 'Canadian Dollar (C$)' },
    { code: 'AUD', name: 'Australian Dollar (A$)' }
  ];

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'pt', name: 'Portuguese' }
  ];

  const dateFormats = [
    { format: 'MM/DD/YYYY', example: '12/31/2024' },
    { format: 'DD/MM/YYYY', example: '31/12/2024' },
    { format: 'YYYY-MM-DD', example: '2024-12-31' }
  ];

  const timeFormats = [
    { format: '12h', example: '2:30 PM' },
    { format: '24h', example: '14:30' }
  ];

  const daysOfWeek = [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
  ];

  const updateBusinessHours = (day: string, field: string, value: any) => {
    const businessHours = settings.businessHours || {};
    const daySchedule = businessHours[day] || { isOpen: false };
    
    onUpdate('general', `businessHours.${day}.${field}`, value);
    
    // If setting isOpen to false, clear other fields
    if (field === 'isOpen' && !value) {
      onUpdate('general', `businessHours.${day}.openTime`, '');
      onUpdate('general', `businessHours.${day}.closeTime`, '');
    }
  };

  const addHoliday = () => {
    const holidays = settings.holidayCalendar || [];
    const newDate = new Date().toISOString().split('T')[0];
    onUpdate('general', 'holidayCalendar', [...holidays, newDate]);
  };

  const removeHoliday = (index: number) => {
    const holidays = settings.holidayCalendar || [];
    const updated = holidays.filter((_: any, i: number) => i !== index);
    onUpdate('general', 'holidayCalendar', updated);
  };

  const updateHoliday = (index: number, date: string) => {
    const holidays = settings.holidayCalendar || [];
    const updated = [...holidays];
    updated[index] = date;
    onUpdate('general', 'holidayCalendar', updated);
  };

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-lg font-semibold text-gray-900">General Settings</h2>
        <p className="text-gray-600">Basic organization information and preferences</p>
      </div>

      {/* Organization Information */}
      <div className="space-y-6">
        <div className="flex items-center space-x-2 mb-4">
          <Building className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-medium text-gray-900">Organization Information</h3>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Organization Name *
            </label>
            <input
              type="text"
              value={settings.organizationName || ''}
              onChange={(e) => onUpdate('general', 'organizationName', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                validationErrors.organizationName ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter organization name"
              required
            />
            {validationErrors.organizationName && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertTriangle className="h-4 w-4 mr-1" />
                {validationErrors.organizationName}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Organization Code
            </label>
            <input
              type="text"
              value={settings.organizationCode || ''}
              onChange={(e) => onUpdate('general', 'organizationCode', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="ORG001"
              maxLength={10}
            />
            <p className="mt-1 text-xs text-gray-500">
              Unique identifier for your organization (max 10 characters)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Primary Phone
            </label>
            <div className="relative">
              <Phone className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="tel"
                value={settings.contactInfo?.phone || ''}
                onChange={(e) => onUpdate('general', 'contactInfo.phone', e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="(555) 123-4567"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={settings.contactInfo?.email || ''}
                onChange={(e) => onUpdate('general', 'contactInfo.email', e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="admin@hospital.com"
              />
            </div>
          </div>
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Address
          </label>
          <div className="grid grid-cols-1 gap-4">
            <div className="relative">
              <MapPin className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                value={settings.address?.street1 || ''}
                onChange={(e) => onUpdate('general', 'address.street1', e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Street Address"
              />
            </div>
            
            <input
              type="text"
              value={settings.address?.street2 || ''}
              onChange={(e) => onUpdate('general', 'address.street2', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Apartment, suite, etc. (optional)"
            />
            
            <div className="grid grid-cols-3 gap-4">
              <input
                type="text"
                value={settings.address?.city || ''}
                onChange={(e) => onUpdate('general', 'address.city', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="City"
              />
              <input
                type="text"
                value={settings.address?.state || ''}
                onChange={(e) => onUpdate('general', 'address.state', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="State"
              />
              <input
                type="text"
                value={settings.address?.postalCode || ''}
                onChange={(e) => onUpdate('general', 'address.postalCode', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="ZIP Code"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Regional Settings */}
      <div className="space-y-6">
        <div className="flex items-center space-x-2 mb-4">
          <Globe className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-medium text-gray-900">Regional Settings</h3>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time Zone
            </label>
            <select
              value={settings.timezone || ''}
              onChange={(e) => onUpdate('general', 'timezone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select timezone</option>
              {timezones.map(tz => (
                <option key={tz} value={tz}>{tz.replace('_', ' ')}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Language
            </label>
            <select
              value={settings.locale || ''}
              onChange={(e) => onUpdate('general', 'locale', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select language</option>
              {languages.map(lang => (
                <option key={lang.code} value={lang.code}>{lang.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Currency
            </label>
            <select
              value={settings.currency || ''}
              onChange={(e) => onUpdate('general', 'currency', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select currency</option>
              {currencies.map(currency => (
                <option key={currency.code} value={currency.code}>{currency.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fiscal Year Start
            </label>
            <input
              type="date"
              value={settings.fiscalYearStart || ''}
              onChange={(e) => onUpdate('general', 'fiscalYearStart', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              First day of your fiscal year
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Format
            </label>
            <select
              value={settings.dateFormat || ''}
              onChange={(e) => onUpdate('general', 'dateFormat', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select format</option>
              {dateFormats.map(format => (
                <option key={format.format} value={format.format}>
                  {format.format} ({format.example})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time Format
            </label>
            <select
              value={settings.timeFormat || ''}
              onChange={(e) => onUpdate('general', 'timeFormat', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select format</option>
              {timeFormats.map(format => (
                <option key={format.format} value={format.format}>
                  {format.format} ({format.example})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Business Hours */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-medium text-gray-900">Business Hours</h3>
          </div>
          <button
            onClick={() => setShowBusinessHours(!showBusinessHours)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            {showBusinessHours ? 'Hide' : 'Configure'}
          </button>
        </div>

        {showBusinessHours && (
          <div className="bg-gray-50 rounded-lg p-4 space-y-4">
            {daysOfWeek.map(day => {
              const daySchedule = settings.businessHours?.[day] || { isOpen: false };
              
              return (
                <div key={day} className="flex items-center space-x-4">
                  <div className="w-24">
                    <span className="font-medium text-gray-700">{day}</span>
                  </div>
                  
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={daySchedule.isOpen || false}
                      onChange={(e) => updateBusinessHours(day, 'isOpen', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-600">Open</span>
                  </label>
                  
                  {daySchedule.isOpen && (
                    <>
                      <input
                        type="time"
                        value={daySchedule.openTime || ''}
                        onChange={(e) => updateBusinessHours(day, 'openTime', e.target.value)}
                        className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <span className="text-gray-500">to</span>
                      <input
                        type="time"
                        value={daySchedule.closeTime || ''}
                        onChange={(e) => updateBusinessHours(day, 'closeTime', e.target.value)}
                        className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Holiday Calendar */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-medium text-gray-900">Holiday Calendar</h3>
          </div>
          <button
            onClick={addHoliday}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Add Holiday
          </button>
        </div>

        <div className="space-y-3">
          {(settings.holidayCalendar || []).map((holiday: string, index: number) => (
            <div key={index} className="flex items-center space-x-3 bg-gray-50 p-3 rounded-md">
              <input
                type="date"
                value={holiday}
                onChange={(e) => updateHoliday(index, e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => removeHoliday(index)}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                Remove
              </button>
            </div>
          ))}
          
          {(!settings.holidayCalendar || settings.holidayCalendar.length === 0) && (
            <div className="text-center py-6 text-gray-500">
              <Calendar className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p>No holidays configured</p>
              <p className="text-sm">Click "Add Holiday" to get started</p>
            </div>
          )}
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-medium text-blue-900">Configuration Tips</h4>
            <div className="mt-1 text-sm text-blue-700 space-y-1">
              <p>• Organization name and code will appear throughout the system</p>
              <p>• Regional settings affect how dates, times, and currencies are displayed</p>
              <p>• Business hours are used for appointment scheduling and system availability</p>
              <p>• Holiday calendar affects appointment scheduling and business day calculations</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}