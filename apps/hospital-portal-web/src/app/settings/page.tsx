// System Settings & Configuration Management Page
// Comprehensive multi-tenant settings with HIPAA compliance

'use client';

import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Shield, 
  Bell, 
  Palette, 
  Globe, 
  Database, 
  Users, 
  Lock, 
  Code, 
  Activity, 
  Save, 
  RotateCcw, 
  Download, 
  Upload, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  Search,
  Filter,
  Eye,
  EyeOff,
  Copy,
  RefreshCw,
  ExternalLink,
  FileText,
  Calendar,
  Mail,
  Smartphone,
  Monitor,
  Zap,
  Building,
  Key
} from 'lucide-react';
import { systemSettingsApi, OrganizationSettings, UserPreferences } from '../../lib/api/system-settings.api';

interface SettingsTab {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  category: string;
  description: string;
}

export default function SystemSettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState<OrganizationSettings | null>(null);
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showPasswords, setShowPasswords] = useState<{ [key: string]: boolean }>({});
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});

  const settingsTabs: SettingsTab[] = [
    { id: 'general', label: 'General', icon: Settings, category: 'Organization', description: 'Basic organization settings and preferences' },
    { id: 'security', label: 'Security', icon: Shield, category: 'Security', description: 'Password policies, authentication, and access control' },
    { id: 'compliance', label: 'Compliance', icon: Lock, category: 'Security', description: 'HIPAA, GDPR, and regulatory compliance settings' },
    { id: 'notifications', label: 'Notifications', icon: Bell, category: 'Communication', description: 'Email, SMS, and push notification configuration' },
    { id: 'integrations', label: 'Integrations', icon: Code, category: 'Integrations', description: 'Third-party integrations and API settings' },
    { id: 'features', label: 'Features', icon: Zap, category: 'System', description: 'Feature toggles and module activation' },
    { id: 'appearance', label: 'Appearance', icon: Palette, category: 'Customization', description: 'Branding, themes, and UI customization' },
    { id: 'clinical', label: 'Clinical', icon: Activity, category: 'Clinical', description: 'Clinical workflows and medical settings' },
    { id: 'users', label: 'User Management', icon: Users, category: 'Administration', description: 'Default user settings and preferences' },
    { id: 'system', label: 'System', icon: Database, category: 'Administration', description: 'System defaults, maintenance, and health monitoring' }
  ];

  const filteredTabs = settingsTabs.filter(tab => 
    searchQuery === '' || 
    tab.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tab.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tab.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (unsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [unsavedChanges]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [orgSettings, userPrefs] = await Promise.all([
        systemSettingsApi.getOrganizationSettings(),
        systemSettingsApi.getUserPreferences('current') // Current user
      ]);
      
      setSettings(orgSettings);
      setUserPreferences(userPrefs);
    } catch (error) {
      console.error('Error loading settings:', error);
      setError('Failed to load system settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!settings) return;

    try {
      setSaving(true);
      setError('');
      setValidationErrors({});
      
      // Validate settings
      const validation = await systemSettingsApi.validateSystemConfiguration();
      const errors = validation.filter(v => v.severity === 'error');
      
      if (errors.length > 0) {
        const errorMap: { [key: string]: string } = {};
        errors.forEach(error => {
          errorMap[error.setting] = error.message;
        });
        setValidationErrors(errorMap);
        setError('Please fix validation errors before saving.');
        return;
      }

      await systemSettingsApi.updateOrganizationSettings(settings);
      setUnsavedChanges(false);
      setSuccess('Settings saved successfully.');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
      
    } catch (error) {
      console.error('Error saving settings:', error);
      setError('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = async () => {
    if (!confirm('Are you sure you want to reset all settings to their default values? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      await loadSettings(); // Reload from server
      setUnsavedChanges(false);
      setSuccess('Settings reset to defaults.');
    } catch (error) {
      console.error('Error resetting settings:', error);
      setError('Failed to reset settings.');
    } finally {
      setLoading(false);
    }
  };

  const exportSettings = async () => {
    try {
      const settingsData = await systemSettingsApi.exportSettings();
      const blob = new Blob([JSON.stringify(settingsData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `hospital-portal-settings-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting settings:', error);
      setError('Failed to export settings.');
    }
  };

  const importSettings = async (file: File) => {
    try {
      const text = await file.text();
      const settingsData = JSON.parse(text);
      await systemSettingsApi.importSettings(settingsData);
      await loadSettings();
      setSuccess('Settings imported successfully.');
    } catch (error) {
      console.error('Error importing settings:', error);
      setError('Failed to import settings. Please check the file format.');
    }
  };

  const updateSetting = (category: keyof OrganizationSettings, field: string, value: any) => {
    if (!settings) return;

    setSettings(prev => {
      if (!prev) return prev;
      
      const updated = { ...prev };
      if (field.includes('.')) {
        // Handle nested fields
        const keys = field.split('.');
        let current: any = updated[category];
        for (let i = 0; i < keys.length - 1; i++) {
          current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;
      } else {
        // Handle top-level fields
        (updated[category] as any)[field] = value;
      }
      
      return updated;
    });
    
    setUnsavedChanges(true);
  };

  const togglePassword = (key: string) => {
    setShowPasswords(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const runHealthCheck = async () => {
    try {
      const healthResult = await systemSettingsApi.runSystemHealthCheck();
      // Show health check results in a modal or expand a section
      console.log('Health check result:', healthResult);
    } catch (error) {
      console.error('Error running health check:', error);
      setError('Failed to run system health check.');
    }
  };

  const generateComplianceReport = async () => {
    try {
      const report = await systemSettingsApi.generateComplianceReport();
      window.open(report.downloadUrl, '_blank');
    } catch (error) {
      console.error('Error generating compliance report:', error);
      setError('Failed to generate compliance report.');
    }
  };

  const renderTabContent = () => {
    if (!settings) return null;

    switch (activeTab) {
      case 'general':
        return <GeneralSettings settings={settings} onUpdate={updateSetting} validationErrors={validationErrors} />;
      case 'security':
        return <SecuritySettings settings={settings} onUpdate={updateSetting} showPasswords={showPasswords} onTogglePassword={togglePassword} />;
      case 'compliance':
        return <ComplianceSettings settings={settings} onUpdate={updateSetting} onGenerateReport={generateComplianceReport} />;
      case 'notifications':
        return <NotificationSettings settings={settings} onUpdate={updateSetting} showPasswords={showPasswords} onTogglePassword={togglePassword} />;
      case 'integrations':
        return <IntegrationSettings settings={settings} onUpdate={updateSetting} showPasswords={showPasswords} onTogglePassword={togglePassword} />;
      case 'features':
        return <FeatureSettings settings={settings} onUpdate={updateSetting} />;
      case 'appearance':
        return <AppearanceSettings settings={settings} onUpdate={updateSetting} />;
      case 'clinical':
        return <ClinicalSettings settings={settings} onUpdate={updateSetting} />;
      case 'users':
        return <UserManagementSettings settings={settings} onUpdate={updateSetting} />;
      case 'system':
        return <SystemManagementSettings settings={settings} onUpdate={updateSetting} onHealthCheck={runHealthCheck} />;
      default:
        return <div className="p-8 text-center text-gray-500">Select a settings category from the sidebar.</div>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <RefreshCw className="h-6 w-6 animate-spin text-blue-500" />
          <span className="text-lg">Loading system settings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Settings className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
                <p className="text-sm text-gray-600">Configure your hospital management system</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Search */}
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search settings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                />
              </div>
              
              {/* Actions */}
              <button
                onClick={exportSettings}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
              
              <label className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
                <Upload className="h-4 w-4 mr-2" />
                Import
                <input
                  type="file"
                  accept=".json"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) importSettings(file);
                  }}
                  className="hidden"
                />
              </label>
              
              <button
                onClick={resetToDefaults}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </button>
              
              <button
                onClick={saveSettings}
                disabled={saving || !unsavedChanges}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start space-x-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-green-700">{success}</div>
          </div>
        )}

        {unsavedChanges && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <Info className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-yellow-700">
                You have unsaved changes. Don't forget to save your configuration.
              </div>
            </div>
            <button
              onClick={saveSettings}
              className="text-yellow-700 hover:text-yellow-900 font-medium"
            >
              Save Now
            </button>
          </div>
        )}

        <div className="flex space-x-8">
          {/* Sidebar */}
          <div className="w-80 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-medium text-gray-900">Settings Categories</h3>
              </div>
              
              <nav className="p-2">
                {filteredTabs.map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full text-left p-3 rounded-md transition-colors group ${
                        activeTab === tab.id
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <Icon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                          activeTab === tab.id ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium">{tab.label}</div>
                          <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                            {tab.description}
                          </div>
                          <div className="text-xs text-blue-600 mt-1 font-medium">
                            {tab.category}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Component placeholders for each settings section
// These would be implemented as separate components

function GeneralSettings({ settings, onUpdate, validationErrors }: any) {
  return (
    <div className="p-6 space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-lg font-semibold text-gray-900">General Settings</h2>
        <p className="text-gray-600">Basic organization information and preferences</p>
      </div>
      
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Organization Name</label>
          <input
            type="text"
            value={settings.organizationName || ''}
            onChange={(e) => onUpdate('general', 'organizationName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {validationErrors.organizationName && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.organizationName}</p>
          )}
        </div>
        
        {/* Add more general settings fields */}
      </div>
      
      <div className="text-center py-8 text-gray-500">
        General settings form will be implemented here with organization details,
        timezone, locale, business hours, and contact information.
      </div>
    </div>
  );
}

function SecuritySettings({ settings, onUpdate, showPasswords, onTogglePassword }: any) {
  return (
    <div className="p-6 space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-lg font-semibold text-gray-900">Security Settings</h2>
        <p className="text-gray-600">Password policies, authentication, and access control</p>
      </div>
      
      <div className="text-center py-8 text-gray-500">
        Security settings form will be implemented here with password policies,
        session management, two-factor authentication, and access controls.
      </div>
    </div>
  );
}

function ComplianceSettings({ settings, onUpdate, onGenerateReport }: any) {
  return (
    <div className="p-6 space-y-6">
      <div className="border-b border-gray-200 pb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Compliance Settings</h2>
          <p className="text-gray-600">HIPAA, GDPR, and regulatory compliance configuration</p>
        </div>
        <button
          onClick={onGenerateReport}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <FileText className="h-4 w-4 mr-2" />
          Generate Report
        </button>
      </div>
      
      <div className="text-center py-8 text-gray-500">
        Compliance settings form will be implemented here with HIPAA compliance settings,
        audit configurations, data retention policies, and compliance monitoring.
      </div>
    </div>
  );
}

function NotificationSettings({ settings, onUpdate, showPasswords, onTogglePassword }: any) {
  return (
    <div className="p-6 space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-lg font-semibold text-gray-900">Notification Settings</h2>
        <p className="text-gray-600">Email, SMS, and push notification configuration</p>
      </div>
      
      <div className="text-center py-8 text-gray-500">
        Notification settings form will be implemented here with email/SMS configuration,
        notification templates, and delivery preferences.
      </div>
    </div>
  );
}

function IntegrationSettings({ settings, onUpdate, showPasswords, onTogglePassword }: any) {
  return (
    <div className="p-6 space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-lg font-semibold text-gray-900">Integration Settings</h2>
        <p className="text-gray-600">Third-party integrations and API configuration</p>
      </div>
      
      <div className="text-center py-8 text-gray-500">
        Integration settings form will be implemented here with HL7/FHIR settings,
        payment gateways, EHR integrations, and API configurations.
      </div>
    </div>
  );
}

function FeatureSettings({ settings, onUpdate }: any) {
  return (
    <div className="p-6 space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-lg font-semibold text-gray-900">Feature Settings</h2>
        <p className="text-gray-600">Enable or disable system features and modules</p>
      </div>
      
      <div className="text-center py-8 text-gray-500">
        Feature toggles will be implemented here for enabling/disabling
        modules like telemedicine, patient portal, billing, etc.
      </div>
    </div>
  );
}

function AppearanceSettings({ settings, onUpdate }: any) {
  return (
    <div className="p-6 space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-lg font-semibold text-gray-900">Appearance Settings</h2>
        <p className="text-gray-600">Customize branding, themes, and user interface</p>
      </div>
      
      <div className="text-center py-8 text-gray-500">
        Appearance customization will be implemented here with logo upload,
        color schemes, themes, and branding options.
      </div>
    </div>
  );
}

function ClinicalSettings({ settings, onUpdate }: any) {
  return (
    <div className="p-6 space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-lg font-semibold text-gray-900">Clinical Settings</h2>
        <p className="text-gray-600">Clinical workflows and medical configuration</p>
      </div>
      
      <div className="text-center py-8 text-gray-500">
        Clinical settings will be implemented here with appointment defaults,
        medical record configuration, and clinical workflows.
      </div>
    </div>
  );
}

function UserManagementSettings({ settings, onUpdate }: any) {
  return (
    <div className="p-6 space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-lg font-semibold text-gray-900">User Management Settings</h2>
        <p className="text-gray-600">Default user settings and account policies</p>
      </div>
      
      <div className="text-center py-8 text-gray-500">
        User management settings will be implemented here with default roles,
        account policies, and user preferences.
      </div>
    </div>
  );
}

function SystemManagementSettings({ settings, onUpdate, onHealthCheck }: any) {
  return (
    <div className="p-6 space-y-6">
      <div className="border-b border-gray-200 pb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">System Management</h2>
          <p className="text-gray-600">System monitoring, maintenance, and health checks</p>
        </div>
        <button
          onClick={onHealthCheck}
          className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          <Activity className="h-4 w-4 mr-2" />
          Health Check
        </button>
      </div>
      
      <div className="text-center py-8 text-gray-500">
        System management will be implemented here with backup settings,
        maintenance windows, health monitoring, and system diagnostics.
      </div>
    </div>
  );
}