'use client';

import { useState } from 'react';
import { 
  Shield, 
  Lock, 
  Clock, 
  Smartphone, 
  Globe,
  AlertTriangle,
  CheckCircle,
  Settings,
  Save,
  RefreshCw
} from 'lucide-react';

export default function DeviceSettingsPage() {
  const [settings, setSettings] = useState({
    autoTrustDevices: false,
    maxDevicesPerUser: 10,
    deviceSessionTimeout: 24, // hours
    requireDeviceApproval: true,
    allowUnknownDevices: false,
    enableGeolocationTracking: true,
    blockSuspiciousDevices: true,
    deviceTrustTimeout: 30, // days
    enableDeviceAnalytics: true,
    requireMFAForNewDevices: true,
  });
  
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess('Device settings saved successfully');
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setSettings({
      autoTrustDevices: false,
      maxDevicesPerUser: 10,
      deviceSessionTimeout: 24,
      requireDeviceApproval: true,
      allowUnknownDevices: false,
      enableGeolocationTracking: true,
      blockSuspiciousDevices: true,
      deviceTrustTimeout: 30,
      enableDeviceAnalytics: true,
      requireMFAForNewDevices: true,
    });
  };

  const SettingCard = ({ 
    icon, 
    title, 
    description, 
    children 
  }: { 
    icon: React.ReactNode;
    title: string;
    description: string;
    children: React.ReactNode;
  }) => (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center mb-4">
        <div className="p-2 bg-gray-100 rounded-lg mr-3">
          {icon}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
      {children}
    </div>
  );

  const ToggleSetting = ({ 
    label, 
    description, 
    value, 
    onChange 
  }: { 
    label: string;
    description?: string;
    value: boolean;
    onChange: (value: boolean) => void;
  }) => (
    <div className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0">
      <div>
        <h4 className="text-sm font-medium text-gray-900">{label}</h4>
        {description && <p className="text-sm text-gray-600">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          value ? 'bg-indigo-600' : 'bg-gray-300'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            value ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );

  const NumberSetting = ({ 
    label, 
    description, 
    value, 
    onChange, 
    min, 
    max, 
    suffix 
  }: { 
    label: string;
    description?: string;
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    suffix?: string;
  }) => (
    <div className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0">
      <div>
        <h4 className="text-sm font-medium text-gray-900">{label}</h4>
        {description && <p className="text-sm text-gray-600">{description}</p>}
      </div>
      <div className="flex items-center space-x-2">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value) || 0)}
          min={min}
          max={max}
          className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        {suffix && <span className="text-sm text-gray-600">{suffix}</span>}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Device Settings</h1>
            <p className="text-gray-600">Configure device management policies and security</p>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={handleReset}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors flex items-center"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center disabled:opacity-50"
            >
              {saving ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Success</h3>
                <p className="text-sm text-green-700">{success}</p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {/* Security Settings */}
          <SettingCard
            icon={<Shield className="h-5 w-5 text-blue-600" />}
            title="Security & Trust"
            description="Configure device security and trust policies"
          >
            <div className="space-y-1">
              <ToggleSetting
                label="Require Device Approval"
                description="New devices must be manually approved before access"
                value={settings.requireDeviceApproval}
                onChange={(value) => setSettings(prev => ({ ...prev, requireDeviceApproval: value }))}
              />
              
              <ToggleSetting
                label="Auto-Trust Known Devices"
                description="Automatically trust devices from known locations"
                value={settings.autoTrustDevices}
                onChange={(value) => setSettings(prev => ({ ...prev, autoTrustDevices: value }))}
              />
              
              <ToggleSetting
                label="Block Suspicious Devices"
                description="Automatically block devices with suspicious activity"
                value={settings.blockSuspiciousDevices}
                onChange={(value) => setSettings(prev => ({ ...prev, blockSuspiciousDevices: value }))}
              />
              
              <ToggleSetting
                label="Allow Unknown Devices"
                description="Allow access from unrecognized devices"
                value={settings.allowUnknownDevices}
                onChange={(value) => setSettings(prev => ({ ...prev, allowUnknownDevices: value }))}
              />
              
              <ToggleSetting
                label="Require MFA for New Devices"
                description="Require multi-factor authentication for new device registration"
                value={settings.requireMFAForNewDevices}
                onChange={(value) => setSettings(prev => ({ ...prev, requireMFAForNewDevices: value }))}
              />
            </div>
          </SettingCard>

          {/* Device Limits */}
          <SettingCard
            icon={<Smartphone className="h-5 w-5 text-purple-600" />}
            title="Device Limits"
            description="Set limits for device registration and usage"
          >
            <div className="space-y-1">
              <NumberSetting
                label="Maximum Devices per User"
                description="Maximum number of devices a user can register"
                value={settings.maxDevicesPerUser}
                onChange={(value) => setSettings(prev => ({ ...prev, maxDevicesPerUser: value }))}
                min={1}
                max={50}
                suffix="devices"
              />
              
              <NumberSetting
                label="Device Trust Timeout"
                description="Days after which device trust expires"
                value={settings.deviceTrustTimeout}
                onChange={(value) => setSettings(prev => ({ ...prev, deviceTrustTimeout: value }))}
                min={1}
                max={365}
                suffix="days"
              />
            </div>
          </SettingCard>

          {/* Session Management */}
          <SettingCard
            icon={<Clock className="h-5 w-5 text-green-600" />}
            title="Session Management"
            description="Configure device session timeouts and policies"
          >
            <div className="space-y-1">
              <NumberSetting
                label="Device Session Timeout"
                description="Hours after which device sessions expire"
                value={settings.deviceSessionTimeout}
                onChange={(value) => setSettings(prev => ({ ...prev, deviceSessionTimeout: value }))}
                min={1}
                max={168}
                suffix="hours"
              />
            </div>
          </SettingCard>

          {/* Tracking & Analytics */}
          <SettingCard
            icon={<Globe className="h-5 w-5 text-orange-600" />}
            title="Tracking & Analytics"
            description="Configure device tracking and analytics settings"
          >
            <div className="space-y-1">
              <ToggleSetting
                label="Enable Geolocation Tracking"
                description="Track device locations for security monitoring"
                value={settings.enableGeolocationTracking}
                onChange={(value) => setSettings(prev => ({ ...prev, enableGeolocationTracking: value }))}
              />
              
              <ToggleSetting
                label="Enable Device Analytics"
                description="Collect device usage analytics for insights"
                value={settings.enableDeviceAnalytics}
                onChange={(value) => setSettings(prev => ({ ...prev, enableDeviceAnalytics: value }))}
              />
            </div>
          </SettingCard>

          {/* Policy Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <Settings className="h-5 w-5 text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold text-blue-900">Current Policy Summary</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium text-blue-900 mb-2">Security Level</h4>
                <ul className="space-y-1 text-blue-800">
                  <li>• {settings.requireDeviceApproval ? 'Manual approval required' : 'Auto-approval enabled'}</li>
                  <li>• {settings.blockSuspiciousDevices ? 'Auto-blocking enabled' : 'Manual blocking only'}</li>
                  <li>• {settings.requireMFAForNewDevices ? 'MFA required for new devices' : 'MFA optional'}</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-blue-900 mb-2">Limits & Timeouts</h4>
                <ul className="space-y-1 text-blue-800">
                  <li>• Max {settings.maxDevicesPerUser} devices per user</li>
                  <li>• {settings.deviceSessionTimeout}h session timeout</li>
                  <li>• {settings.deviceTrustTimeout} day trust timeout</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}