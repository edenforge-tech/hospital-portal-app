// Enhanced System Settings Page
// Comprehensive multi-tenant configuration interface with advanced settings management

'use client';

import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Save, 
  RotateCcw, 
  Download, 
  Upload, 
  Shield, 
  Bell, 
  Palette, 
  Globe, 
  Zap, 
  Database, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Users, 
  FileText, 
  Link, 
  Monitor, 
  Key, 
  Mail, 
  MessageSquare, 
  Smartphone, 
  HardDrive, 
  RefreshCw,
  Eye,
  EyeOff,
  TestTube,
  AlertCircle
} from 'lucide-react';
import { systemSettingsApi, TenantSettings, FeatureFlag, NotificationTemplate } from '../../lib/api/system-settings.api';
import GeneralSettingsTab from './GeneralSettingsTab';
import FeaturesSettingsTab from './FeaturesSettingsTab';
import SecuritySettingsTab from './SecuritySettingsTab';
import NotificationSettingsTab from './NotificationSettingsTab';

export default function SystemSettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState<TenantSettings | null>(null);
  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>([]);
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [lastSaved, setLastSaved] = useState<string>('');

  const tabs = [
    { id: 'general', name: 'General', icon: Globe },
    { id: 'branding', name: 'Branding', icon: Palette },
    { id: 'features', name: 'Features', icon: Zap },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'integrations', name: 'Integrations', icon: Link },
    { id: 'system', name: 'System', icon: Settings },
    { id: 'health', name: 'Health', icon: Activity },
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [settingsResponse, flagsResponse, templatesResponse] = await Promise.all([
        systemSettingsApi.getTenantSettings(),
        systemSettingsApi.getFeatureFlags(),
        systemSettingsApi.getNotificationTemplates(),
      ]);
      
      setSettings(settingsResponse.settings);
      setFeatureFlags(flagsResponse);
      setTemplates(templatesResponse);
      setLastSaved(settingsResponse.lastModified);
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;
    
    try {
      setSaving(true);
      setValidationErrors([]);
      
      // Validate configuration first
      const validation = await systemSettingsApi.validateConfiguration();
      if (!validation.isValid) {
        setValidationErrors(validation.errors);
        return;
      }

      await systemSettingsApi.updateTenantSettings({
        settings: settings,
        reason: 'Settings updated via admin panel'
      });
      
      setLastSaved(new Date().toISOString());
      // Show success toast here
    } catch (error) {
      console.error('Error saving settings:', error);
      // Show error toast here
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('Are you sure you want to reset all settings to defaults? This action cannot be undone.')) return;
    
    try {
      const resetSettings = await systemSettingsApi.resetTenantSettings();
      setSettings(resetSettings);
      // Show success toast here
    } catch (error) {
      console.error('Error resetting settings:', error);
    }
  };

  const handleExport = async () => {
    try {
      const blob = await systemSettingsApi.exportTenantSettings();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `settings-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting settings:', error);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const importedSettings = await systemSettingsApi.importTenantSettings(file);
      setSettings(importedSettings);
      // Show success toast here
    } catch (error) {
      console.error('Error importing settings:', error);
    }
  };

  const toggleFeature = async (featureName: string, enabled: boolean) => {
    try {
      const updatedFlag = await systemSettingsApi.toggleFeature(featureName, enabled);
      setFeatureFlags(flags => flags.map(flag => 
        flag.featureName === featureName ? updatedFlag : flag
      ));
    } catch (error) {
      console.error('Error toggling feature:', error);
    }
  };

  const updateSettings = (path: string, value: any) => {
    if (!settings) return;
    
    const keys = path.split('.');
    const updatedSettings = { ...settings };
    let current: any = updatedSettings;
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (!(keys[i] in current)) {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
    setSettings(updatedSettings);
  };

  const togglePasswordVisibility = (field: string) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-6 w-6 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600">Loading system settings...</span>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="flex items-center justify-center h-64">
        <AlertTriangle className="h-6 w-6 text-red-500" />
        <span className="ml-2 text-gray-600">Failed to load system settings</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Settings className="h-6 w-6 mr-2 text-blue-500" />
              System Settings & Configuration
            </h1>
            <p className="text-gray-600 mt-1">
              Configure your system settings, features, and integrations
            </p>
            {lastSaved && (
              <p className="text-sm text-gray-500 mt-1">
                Last saved: {new Date(lastSaved).toLocaleString()}
              </p>
            )}
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={handleExport}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
            
            <label className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 cursor-pointer">
              <Upload className="h-4 w-4 mr-2" />
              Import
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </label>
            
            <button
              onClick={handleReset}
              className="flex items-center px-4 py-2 border border-red-300 rounded-md text-red-700 hover:bg-red-50"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </button>
            
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Changes
            </button>
          </div>
        </div>

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Configuration Validation Errors
                </h3>
                <ul className="mt-2 text-sm text-red-700">
                  {validationErrors.map((error, index) => (
                    <li key={index} className="list-disc list-inside">{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <nav className="flex space-x-1 mt-6 bg-gray-100 p-1 rounded-lg">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <IconComponent className="h-4 w-4 mr-2" />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* General Settings Tab */}
        {activeTab === 'general' && (
          <GeneralSettingsTab settings={settings} updateSettings={updateSettings} />
        )}

        {/* Branding Tab */}
        {activeTab === 'branding' && (
          <BrandingSettingsTab settings={settings} updateSettings={updateSettings} />
        )}

        {/* Features Tab */}
        {activeTab === 'features' && (
          <FeaturesSettingsTab 
            settings={settings} 
            featureFlags={featureFlags}
            updateSettings={updateSettings}
            toggleFeature={toggleFeature}
          />
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <SecuritySettingsTab 
            settings={settings} 
            updateSettings={updateSettings}
            showPasswords={showPasswords}
            togglePasswordVisibility={togglePasswordVisibility}
          />
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <NotificationSettingsTab 
            settings={settings} 
            templates={templates}
            updateSettings={updateSettings}
            showPasswords={showPasswords}
            togglePasswordVisibility={togglePasswordVisibility}
          />
        )}

        {/* Integrations Tab */}
        {activeTab === 'integrations' && (
          <IntegrationsSettingsTab 
            settings={settings} 
            updateSettings={updateSettings}
            showPasswords={showPasswords}
            togglePasswordVisibility={togglePasswordVisibility}
          />
        )}

        {/* System Tab */}
        {activeTab === 'system' && (
          <SystemPreferencesTab settings={settings} updateSettings={updateSettings} />
        )}

        {/* Health Tab */}
        {activeTab === 'health' && (
          <SystemHealthTab />
        )}
      </div>
    </div>
  );
}

// Placeholder components that will be implemented separately
function BrandingSettingsTab({ settings, updateSettings }: any) {
  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold mb-4">Branding & Appearance</h3>
      <div className="text-center text-gray-500 py-8">
        Branding and appearance settings form will be implemented here
      </div>
    </div>
  );
}

function NotificationsSettingsTab({ settings, templates, updateSettings, showPasswords, togglePasswordVisibility }: any) {
  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold mb-4">Notification Configuration</h3>
      <div className="text-center text-gray-500 py-8">
        Notification providers and templates management will be implemented here
      </div>
    </div>
  );
}

function IntegrationsSettingsTab({ settings, updateSettings, showPasswords, togglePasswordVisibility }: any) {
  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold mb-4">Integration Configuration</h3>
      {/* Integrations settings form will go here */}
      <div className="text-center text-gray-500 py-8">
        Third-party integrations and API configurations will be implemented here
      </div>
    </div>
  );
}

function SystemPreferencesTab({ settings, updateSettings }: any) {
  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold mb-4">System Preferences</h3>
      {/* System preferences form will go here */}
      <div className="text-center text-gray-500 py-8">
        Data retention, backup, and system maintenance settings will be implemented here
      </div>
    </div>
  );
}

function SystemHealthTab() {
  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold mb-4">System Health & Monitoring</h3>
      {/* System health dashboard will go here */}
      <div className="text-center text-gray-500 py-8">
        System health monitoring and diagnostics dashboard will be implemented here
      </div>
    </div>
  );
}