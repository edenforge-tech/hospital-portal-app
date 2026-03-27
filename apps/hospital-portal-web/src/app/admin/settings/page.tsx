'use client';

import React, { useState, useEffect } from 'react';
import {
  settingsApi,
  brandingSettingsApi,
  securitySettingsApi,
  emailSettingsApi,
  featureFlagsApi,
  systemHealthApi,
  type SettingsCategory,
  type GeneralSettings,
  type BrandingSettings,
  type SecuritySettings,
  type EmailSettings,
  type FeatureFlag,
  type SystemHealth,
} from '@/lib/api/settings.api';

const SettingsPage = () => {
  const [activeCategory, setActiveCategory] = useState<SettingsCategory>('general');
  const [generalSettings, setGeneralSettings] = useState<GeneralSettings | null>(null);
  const [brandingSettings, setBrandingSettings] = useState<BrandingSettings | null>(null);
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings | null>(null);
  const [emailSettings, setEmailSettings] = useState<EmailSettings | null>(null);
  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, [activeCategory]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      
      if (activeCategory === 'general') {
        const data = await settingsApi.getByCategory('general');
        setGeneralSettings(data as GeneralSettings);
      } else if (activeCategory === 'branding') {
        const data = await settingsApi.getByCategory('branding');
        setBrandingSettings(data as BrandingSettings);
      } else if (activeCategory === 'security') {
        const data = await settingsApi.getByCategory('security');
        setSecuritySettings(data as SecuritySettings);
      } else if (activeCategory === 'email') {
        const data = await settingsApi.getByCategory('email');
        setEmailSettings(data as EmailSettings);
      } else if (activeCategory === 'features') {
        const flags = await featureFlagsApi.list();
        setFeatureFlags(flags);
      }
      
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const loadSystemHealth = async () => {
    try {
      const health = await systemHealthApi.getDiagnostics();
      setSystemHealth(health);
    } catch (err) {
      console.error('Failed to load system health:', err);
    }
  };

  useEffect(() => {
    loadSystemHealth();
    const interval = setInterval(loadSystemHealth, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const handleSaveGeneral = async () => {
    if (!generalSettings) return;
    try {
      await settingsApi.updateCategory('general', generalSettings, 'Updated general settings');
      setSaveMessage('General settings saved successfully');
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save settings');
    }
  };

  const handleSaveSecurity = async () => {
    if (!securitySettings) return;
    try {
      await settingsApi.updateCategory('security', securitySettings, 'Updated security settings');
      setSaveMessage('Security settings saved successfully');
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save settings');
    }
  };

  const handleTestEmail = async () => {
    if (!emailSettings) return;
    try {
      await emailSettingsApi.testConnection();
      alert('Email connection test successful!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Email connection test failed');
    }
  };

  const handleLogoUpload = async (file: File) => {
    try {
      await brandingSettingsApi.uploadLogo(file);
      await loadSettings(); // Reload to get new logo URL
      setSaveMessage('Logo uploaded successfully');
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to upload logo');
    }
  };

  const handleToggleFeature = async (flagId: string, enabled: boolean) => {
    try {
      await featureFlagsApi.toggle(flagId, enabled);
      await loadSettings(); // Reload flags
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to toggle feature');
    }
  };

  const handleUpdateRollout = async (flagId: string, percentage: number) => {
    try {
      const flag = featureFlags.find(f => f.id === flagId);
      if (flag) {
        await featureFlagsApi.update(flagId, { ...flag, rolloutPercentage: percentage });
        await loadSettings();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update rollout');
    }
  };

  const CategoryButton = ({ category, label }: { category: SettingsCategory; label: string }) => (
    <button
      onClick={() => setActiveCategory(category)}
      className={`px-4 py-2 text-sm font-medium rounded-md ${
        activeCategory === category
          ? 'bg-blue-600 text-white'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      {label}
    </button>
  );

  const HealthMetric = ({ label, value, status }: { label: string; value: string; status: 'healthy' | 'warning' | 'critical' }) => {
    const colors = {
      healthy: 'text-green-600',
      warning: 'text-yellow-600',
      critical: 'text-red-600',
    };
    const icons = {
      healthy: '✅',
      warning: '⚠️',
      critical: '❌',
    };
    return (
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <span className="text-sm text-gray-700">{label}</span>
        <div className="flex items-center gap-2">
          <span className={`font-semibold ${colors[status]}`}>{value}</span>
          <span>{icons[status]}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">System Settings</h1>
        {systemHealth && (
          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${systemHealth.status === 'healthy' ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-gray-600">System {systemHealth.status}</span>
            </div>
            <span className="text-gray-400">|</span>
            <span className="text-gray-600">v{systemHealth.version}</span>
            <span className="text-gray-400">|</span>
            <span className="text-gray-600">Uptime: {Math.floor(systemHealth.uptime / 3600)}h</span>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-800">
          {error}
        </div>
      )}

      {saveMessage && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md text-green-800">
          {saveMessage}
        </div>
      )}

      <div className="flex gap-2 mb-6 flex-wrap">
        <CategoryButton category="general" label="General" />
        <CategoryButton category="branding" label="Branding" />
        <CategoryButton category="security" label="Security" />
        <CategoryButton category="email" label="Email" />
        <CategoryButton category="notifications" label="Notifications" />
        <CategoryButton category="appointments" label="Appointments" />
        <CategoryButton category="billing" label="Billing" />
        <CategoryButton category="clinical" label="Clinical" />
        <CategoryButton category="integrations" label="Integrations" />
        <CategoryButton category="compliance" label="Compliance" />
        <CategoryButton category="localization" label="Localization" />
        <CategoryButton category="features" label="Features" />
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading settings...</div>
        ) : (
          <>
            {activeCategory === 'general' && generalSettings && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold mb-4">General Settings</h2>
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      System Name
                    </label>
                    <input
                      type="text"
                      className="w-full border rounded-md px-3 py-2"
                      value={generalSettings.systemName || ''}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, systemName: e.target.value })}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Timezone
                    </label>
                    <select
                      className="w-full border rounded-md px-3 py-2"
                      value={generalSettings.timezone || ''}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, timezone: e.target.value })}
                    >
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">Eastern Time</option>
                      <option value="America/Chicago">Central Time</option>
                      <option value="America/Denver">Mountain Time</option>
                      <option value="America/Los_Angeles">Pacific Time</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date Format
                    </label>
                    <select
                      className="w-full border rounded-md px-3 py-2"
                      value={generalSettings.dateFormat || ''}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, dateFormat: e.target.value })}
                    >
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Time Format
                    </label>
                    <select
                      className="w-full border rounded-md px-3 py-2"
                      value={generalSettings.timeFormat || ''}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, timeFormat: e.target.value })}
                    >
                      <option value="12h">12-hour</option>
                      <option value="24h">24-hour</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Currency
                    </label>
                    <select
                      className="w-full border rounded-md px-3 py-2"
                      value={generalSettings.currency || ''}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, currency: e.target.value })}
                    >
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="GBP">GBP - British Pound</option>
                      <option value="CAD">CAD - Canadian Dollar</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Language
                    </label>
                    <select
                      className="w-full border rounded-md px-3 py-2"
                      value={generalSettings.language || ''}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, language: e.target.value })}
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Session Timeout (minutes)
                    </label>
                    <input
                      type="number"
                      className="w-full border rounded-md px-3 py-2"
                      value={generalSettings.sessionTimeout || 30}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, sessionTimeout: parseInt(e.target.value) })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Records Per Page
                    </label>
                    <select
                      className="w-full border rounded-md px-3 py-2"
                      value={generalSettings.recordsPerPage || 25}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, recordsPerPage: parseInt(e.target.value) })}
                    >
                      <option value="10">10</option>
                      <option value="25">25</option>
                      <option value="50">50</option>
                      <option value="100">100</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <button
                    onClick={() => loadSettings()}
                    className="px-4 py-2 border rounded-md hover:bg-gray-50"
                  >
                    Reset
                  </button>
                  <button
                    onClick={handleSaveGeneral}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            )}

            {activeCategory === 'branding' && brandingSettings && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold mb-4">Branding Settings</h2>
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Logo Upload
                    </label>
                    <div className="border-2 border-dashed rounded-lg p-6 text-center">
                      {brandingSettings.logoUrl ? (
                        <img src={brandingSettings.logoUrl} alt="Logo" className="h-20 mx-auto mb-2" />
                      ) : (
                        <div className="text-gray-400 mb-2">No logo uploaded</div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            handleLogoUpload(e.target.files[0]);
                          }
                        }}
                        className="hidden"
                        id="logo-upload"
                      />
                      <label
                        htmlFor="logo-upload"
                        className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md cursor-pointer hover:bg-blue-700"
                      >
                        Choose File
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Primary Color
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        className="border rounded-md h-10 w-20"
                        value={brandingSettings.primaryColor || '#3B82F6'}
                        onChange={(e) => setBrandingSettings({ ...brandingSettings, primaryColor: e.target.value })}
                      />
                      <input
                        type="text"
                        className="flex-1 border rounded-md px-3 py-2"
                        value={brandingSettings.primaryColor || '#3B82F6'}
                        onChange={(e) => setBrandingSettings({ ...brandingSettings, primaryColor: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Secondary Color
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        className="border rounded-md h-10 w-20"
                        value={brandingSettings.secondaryColor || '#10B981'}
                        onChange={(e) => setBrandingSettings({ ...brandingSettings, secondaryColor: e.target.value })}
                      />
                      <input
                        type="text"
                        className="flex-1 border rounded-md px-3 py-2"
                        value={brandingSettings.secondaryColor || '#10B981'}
                        onChange={(e) => setBrandingSettings({ ...brandingSettings, secondaryColor: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Font Family
                    </label>
                    <select
                      className="w-full border rounded-md px-3 py-2"
                      value={brandingSettings.fontFamily || 'Inter'}
                      onChange={(e) => setBrandingSettings({ ...brandingSettings, fontFamily: e.target.value })}
                    >
                      <option value="Inter">Inter</option>
                      <option value="Roboto">Roboto</option>
                      <option value="Open Sans">Open Sans</option>
                      <option value="Lato">Lato</option>
                      <option value="Montserrat">Montserrat</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeCategory === 'security' && securitySettings && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold mb-4">Security Settings</h2>
                
                <div className="space-y-6">
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-3">Password Policy</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={securitySettings.passwordPolicy?.requireUppercase || false}
                            onChange={(e) => setSecuritySettings({
                              ...securitySettings,
                              passwordPolicy: { ...securitySettings.passwordPolicy!, requireUppercase: e.target.checked }
                            })}
                            className="mr-2"
                          />
                          Require Uppercase
                        </label>
                      </div>
                      <div>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={securitySettings.passwordPolicy?.requireLowercase || false}
                            onChange={(e) => setSecuritySettings({
                              ...securitySettings,
                              passwordPolicy: { ...securitySettings.passwordPolicy!, requireLowercase: e.target.checked }
                            })}
                            className="mr-2"
                          />
                          Require Lowercase
                        </label>
                      </div>
                      <div>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={securitySettings.passwordPolicy?.requireDigit || false}
                            onChange={(e) => setSecuritySettings({
                              ...securitySettings,
                              passwordPolicy: { ...securitySettings.passwordPolicy!, requireDigit: e.target.checked }
                            })}
                            className="mr-2"
                          />
                          Require Digit
                        </label>
                      </div>
                      <div>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={securitySettings.passwordPolicy?.requireSpecialChar || false}
                            onChange={(e) => setSecuritySettings({
                              ...securitySettings,
                              passwordPolicy: { ...securitySettings.passwordPolicy!, requireSpecialChar: e.target.checked }
                            })}
                            className="mr-2"
                          />
                          Require Special Character
                        </label>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Minimum Length
                        </label>
                        <input
                          type="number"
                          className="w-full border rounded-md px-3 py-2"
                          value={securitySettings.passwordPolicy?.minLength || 8}
                          onChange={(e) => setSecuritySettings({
                            ...securitySettings,
                            passwordPolicy: { ...securitySettings.passwordPolicy!, minLength: parseInt(e.target.value) }
                          })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Password Expiry (days)
                        </label>
                        <input
                          type="number"
                          className="w-full border rounded-md px-3 py-2"
                          value={securitySettings.passwordPolicy?.expiryDays || 90}
                          onChange={(e) => setSecuritySettings({
                            ...securitySettings,
                            passwordPolicy: { ...securitySettings.passwordPolicy!, expiryDays: parseInt(e.target.value) }
                          })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-3">Multi-Factor Authentication</h3>
                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={securitySettings.mfaRequired || false}
                          onChange={(e) => setSecuritySettings({ ...securitySettings, mfaRequired: e.target.checked })}
                          className="mr-2"
                        />
                        Require MFA for all users
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        <label className="flex items-center">
                          <input type="checkbox" className="mr-2" defaultChecked />
                          Email OTP
                        </label>
                        <label className="flex items-center">
                          <input type="checkbox" className="mr-2" defaultChecked />
                          SMS OTP
                        </label>
                        <label className="flex items-center">
                          <input type="checkbox" className="mr-2" defaultChecked />
                          Authenticator App
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-3">Session Management</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Max Concurrent Sessions
                        </label>
                        <input
                          type="number"
                          className="w-full border rounded-md px-3 py-2"
                          value={securitySettings.maxConcurrentSessions || 3}
                          onChange={(e) => setSecuritySettings({ ...securitySettings, maxConcurrentSessions: parseInt(e.target.value) })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Session Timeout (minutes)
                        </label>
                        <input
                          type="number"
                          className="w-full border rounded-md px-3 py-2"
                          value={securitySettings.sessionTimeout || 30}
                          onChange={(e) => setSecuritySettings({ ...securitySettings, sessionTimeout: parseInt(e.target.value) })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-3">Login Attempt Policy</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Max Failed Attempts
                        </label>
                        <input
                          type="number"
                          className="w-full border rounded-md px-3 py-2"
                          value={securitySettings.maxLoginAttempts || 5}
                          onChange={(e) => setSecuritySettings({ ...securitySettings, maxLoginAttempts: parseInt(e.target.value) })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Lockout Duration (minutes)
                        </label>
                        <input
                          type="number"
                          className="w-full border rounded-md px-3 py-2"
                          value={securitySettings.lockoutDuration || 15}
                          onChange={(e) => setSecuritySettings({ ...securitySettings, lockoutDuration: parseInt(e.target.value) })}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <button
                    onClick={() => loadSettings()}
                    className="px-4 py-2 border rounded-md hover:bg-gray-50"
                  >
                    Reset
                  </button>
                  <button
                    onClick={handleSaveSecurity}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            )}

            {activeCategory === 'email' && emailSettings && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold mb-4">Email Settings</h2>
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Provider
                    </label>
                    <select
                      className="w-full border rounded-md px-3 py-2"
                      value={emailSettings.provider || 'smtp'}
                      onChange={(e) => setEmailSettings({ ...emailSettings, provider: e.target.value as any })}
                    >
                      <option value="smtp">SMTP</option>
                      <option value="sendgrid">SendGrid</option>
                      <option value="ses">AWS SES</option>
                      <option value="mailgun">Mailgun</option>
                    </select>
                  </div>

                  {emailSettings.provider === 'smtp' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          SMTP Host
                        </label>
                        <input
                          type="text"
                          className="w-full border rounded-md px-3 py-2"
                          value={emailSettings.smtpHost || ''}
                          onChange={(e) => setEmailSettings({ ...emailSettings, smtpHost: e.target.value })}
                          placeholder="smtp.example.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          SMTP Port
                        </label>
                        <input
                          type="number"
                          className="w-full border rounded-md px-3 py-2"
                          value={emailSettings.smtpPort || 587}
                          onChange={(e) => setEmailSettings({ ...emailSettings, smtpPort: parseInt(e.target.value) })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          SMTP Username
                        </label>
                        <input
                          type="text"
                          className="w-full border rounded-md px-3 py-2"
                          value={emailSettings.smtpUsername || ''}
                          onChange={(e) => setEmailSettings({ ...emailSettings, smtpUsername: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          SMTP Password
                        </label>
                        <input
                          type="password"
                          className="w-full border rounded-md px-3 py-2"
                          value={emailSettings.smtpPassword || ''}
                          onChange={(e) => setEmailSettings({ ...emailSettings, smtpPassword: e.target.value })}
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={emailSettings.smtpUseSsl || false}
                            onChange={(e) => setEmailSettings({ ...emailSettings, smtpUseSsl: e.target.checked })}
                            className="mr-2"
                          />
                          Use SSL/TLS
                        </label>
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      From Email
                    </label>
                    <input
                      type="email"
                      className="w-full border rounded-md px-3 py-2"
                      value={emailSettings.fromEmail || ''}
                      onChange={(e) => setEmailSettings({ ...emailSettings, fromEmail: e.target.value })}
                      placeholder="noreply@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      From Name
                    </label>
                    <input
                      type="text"
                      className="w-full border rounded-md px-3 py-2"
                      value={emailSettings.fromName || ''}
                      onChange={(e) => setEmailSettings({ ...emailSettings, fromName: e.target.value })}
                      placeholder="Hospital Portal"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <button
                    onClick={handleTestEmail}
                    className="px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50"
                  >
                    Test Connection
                  </button>
                  <button
                    onClick={() => loadSettings()}
                    className="px-4 py-2 border rounded-md hover:bg-gray-50"
                  >
                    Reset
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        await settingsApi.updateCategory('email', emailSettings, 'Updated email settings');
                        setSaveMessage('Email settings saved successfully');
                        setTimeout(() => setSaveMessage(null), 3000);
                      } catch (err: any) {
                        alert(err.response?.data?.message || 'Failed to save settings');
                      }
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            )}

            {activeCategory === 'features' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold mb-4">Feature Flags</h2>
                
                <div className="space-y-3">
                  {featureFlags.map((flag) => (
                    <div key={flag.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={flag.enabled}
                              onChange={(e) => handleToggleFeature(flag.id, e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                          <div>
                            <div className="font-semibold">{flag.name}</div>
                            <div className="text-sm text-gray-600">{flag.description}</div>
                          </div>
                        </div>
                        <div className="text-sm">
                          <span className={`px-2 py-1 rounded-full ${flag.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {flag.enabled ? 'Enabled' : 'Disabled'}
                          </span>
                        </div>
                      </div>
                      {flag.enabled && (
                        <div className="mt-3">
                          <label className="block text-sm text-gray-700 mb-1">
                            Rollout Percentage: {flag.rolloutPercentage}%
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={flag.rolloutPercentage || 100}
                            onChange={(e) => handleUpdateRollout(flag.id, parseInt(e.target.value))}
                            className="w-full"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeCategory === 'notifications' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold mb-4">Notification Settings</h2>
                <div className="text-gray-500 text-center py-12">
                  Notification settings coming soon...
                </div>
              </div>
            )}

            {activeCategory === 'appointments' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold mb-4">Appointment Settings</h2>
                <div className="text-gray-500 text-center py-12">
                  Appointment settings coming soon...
                </div>
              </div>
            )}

            {activeCategory === 'billing' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold mb-4">Billing Settings</h2>
                <div className="text-gray-500 text-center py-12">
                  Billing settings coming soon...
                </div>
              </div>
            )}

            {activeCategory === 'clinical' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold mb-4">Clinical Settings</h2>
                <div className="text-gray-500 text-center py-12">
                  Clinical settings coming soon...
                </div>
              </div>
            )}

            {activeCategory === 'integrations' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold mb-4">Integration Settings</h2>
                <div className="text-gray-500 text-center py-12">
                  Integration settings coming soon...
                </div>
              </div>
            )}

            {activeCategory === 'compliance' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold mb-4">Compliance Settings</h2>
                <div className="text-gray-500 text-center py-12">
                  Compliance settings coming soon...
                </div>
              </div>
            )}

            {activeCategory === 'localization' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold mb-4">Localization Settings</h2>
                <div className="text-gray-500 text-center py-12">
                  Localization settings coming soon...
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {systemHealth && (
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">System Health</h2>
          <div className="grid grid-cols-4 gap-4">
            <HealthMetric
              label="Database"
              value={systemHealth.database?.status || 'Unknown'}
              status={systemHealth.database?.status === 'connected' ? 'healthy' : 'critical'}
            />
            <HealthMetric
              label="Cache"
              value={systemHealth.cache?.status || 'Unknown'}
              status={systemHealth.cache?.status === 'connected' ? 'healthy' : 'warning'}
            />
            <HealthMetric
              label="Queue"
              value={systemHealth.queue?.status || 'Unknown'}
              status={systemHealth.queue?.status === 'running' ? 'healthy' : 'warning'}
            />
            <HealthMetric
              label="Storage"
              value={`${systemHealth.storage?.usedPercentage || 0}%`}
              status={
                (systemHealth.storage?.usedPercentage || 0) < 70 ? 'healthy' :
                (systemHealth.storage?.usedPercentage || 0) < 90 ? 'warning' : 'critical'
              }
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
