// Security Settings Component
// Password policies, authentication, and access control configuration

'use client';

import React, { useState } from 'react';
import { 
  Shield, 
  Lock, 
  Eye, 
  EyeOff, 
  Key, 
  Smartphone, 
  Globe, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  Settings,
  Users,
  Monitor,
  Wifi,
  FileText,
  Database,
  Zap
} from 'lucide-react';

interface SecuritySettingsProps {
  settings: any;
  onUpdate: (category: string, field: string, value: any) => void;
  showPasswords: { [key: string]: boolean };
  onTogglePassword: (key: string) => void;
}

export default function SecuritySettings({ 
  settings, 
  onUpdate, 
  showPasswords, 
  onTogglePassword 
}: SecuritySettingsProps) {
  const [activeSection, setActiveSection] = useState<string>('password-policy');

  const sections = [
    { id: 'password-policy', label: 'Password Policy', icon: Lock },
    { id: 'session-management', label: 'Session Management', icon: Clock },
    { id: 'two-factor-auth', label: 'Two-Factor Authentication', icon: Smartphone },
    { id: 'access-control', label: 'Access Control', icon: Shield },
    { id: 'audit-settings', label: 'Audit & Logging', icon: FileText },
    { id: 'data-protection', label: 'Data Protection', icon: Database }
  ];

  const encryptionAlgorithms = [
    'AES-256',
    'ChaCha20-Poly1305',
    'AES-192',
    'AES-128'
  ];

  const getPasswordStrength = (policy: any) => {
    let score = 0;
    if (policy?.minLength >= 12) score++;
    if (policy?.requireUppercase) score++;
    if (policy?.requireLowercase) score++;
    if (policy?.requireNumbers) score++;
    if (policy?.requireSymbols) score++;
    if (policy?.maxAge && policy.maxAge <= 90) score++;
    if (policy?.preventReuse && policy.preventReuse >= 5) score++;
    
    return score;
  };

  const getStrengthLabel = (score: number) => {
    if (score >= 6) return { label: 'Strong', color: 'text-green-600', bg: 'bg-green-50' };
    if (score >= 4) return { label: 'Medium', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    return { label: 'Weak', color: 'text-red-600', bg: 'bg-red-50' };
  };

  const renderPasswordPolicy = () => {
    const policy = settings.securitySettings?.passwordPolicy || {};
    const strength = getPasswordStrength(policy);
    const strengthInfo = getStrengthLabel(strength);

    return (
      <div className="space-y-6">
        <div className="border-b border-gray-200 pb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Password Policy</h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Current strength:</span>
            <span className={`px-2 py-1 rounded text-xs font-medium ${strengthInfo.bg} ${strengthInfo.color}`}>
              {strengthInfo.label}
            </span>
            <span className="text-xs text-gray-500">({strength}/7 requirements met)</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Password Length
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="range"
                min="6"
                max="32"
                value={policy.minLength || 8}
                onChange={(e) => onUpdate('securitySettings', 'passwordPolicy.minLength', parseInt(e.target.value))}
                className="flex-1"
              />
              <span className="w-16 px-2 py-1 border border-gray-300 rounded text-center text-sm">
                {policy.minLength || 8}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Recommended: 12 or more characters
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password Expiration (days)
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                min="0"
                max="365"
                value={policy.maxAge || 0}
                onChange={(e) => onUpdate('securitySettings', 'passwordPolicy.maxAge', parseInt(e.target.value))}
                className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-500">days (0 = never expires)</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password History
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                min="0"
                max="20"
                value={policy.preventReuse || 0}
                onChange={(e) => onUpdate('securitySettings', 'passwordPolicy.preventReuse', parseInt(e.target.value))}
                className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-500">previous passwords to remember</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Character Requirements</h4>
          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={policy.requireUppercase || false}
                onChange={(e) => onUpdate('securitySettings', 'passwordPolicy.requireUppercase', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Require uppercase letters (A-Z)</span>
            </label>

            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={policy.requireLowercase || false}
                onChange={(e) => onUpdate('securitySettings', 'passwordPolicy.requireLowercase', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Require lowercase letters (a-z)</span>
            </label>

            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={policy.requireNumbers || false}
                onChange={(e) => onUpdate('securitySettings', 'passwordPolicy.requireNumbers', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Require numbers (0-9)</span>
            </label>

            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={policy.requireSymbols || false}
                onChange={(e) => onUpdate('securitySettings', 'passwordPolicy.requireSymbols', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Require special characters (!@#$%)</span>
            </label>
          </div>
        </div>

        {/* Password Policy Preview */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h5 className="font-medium text-gray-900 mb-2">Policy Preview</h5>
          <div className="text-sm text-gray-700 space-y-1">
            <p>• Minimum {policy.minLength || 8} characters</p>
            {policy.requireUppercase && <p>• At least one uppercase letter</p>}
            {policy.requireLowercase && <p>• At least one lowercase letter</p>}
            {policy.requireNumbers && <p>• At least one number</p>}
            {policy.requireSymbols && <p>• At least one special character</p>}
            {policy.maxAge > 0 && <p>• Must be changed every {policy.maxAge} days</p>}
            {policy.preventReuse > 0 && <p>• Cannot reuse last {policy.preventReuse} passwords</p>}
          </div>
        </div>
      </div>
    );
  };

  const renderSessionManagement = () => {
    const sessionSettings = settings.securitySettings?.sessionSettings || {};

    return (
      <div className="space-y-6">
        <div className="border-b border-gray-200 pb-4">
          <h3 className="text-lg font-semibold text-gray-900">Session Management</h3>
          <p className="text-gray-600">Control user session behavior and timeouts</p>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Session Duration (hours)
            </label>
            <input
              type="number"
              min="1"
              max="24"
              value={sessionSettings.maxSessionDuration || 8}
              onChange={(e) => onUpdate('securitySettings', 'sessionSettings.maxSessionDuration', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Sessions will be terminated after this duration
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Auto-logout Idle Time (minutes)
            </label>
            <input
              type="number"
              min="5"
              max="120"
              value={sessionSettings.autoLogoutIdleTime || 30}
              onChange={(e) => onUpdate('securitySettings', 'sessionSettings.autoLogoutIdleTime', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Auto-logout after period of inactivity
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Concurrent Sessions
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={sessionSettings.maxConcurrentSessions || 3}
              onChange={(e) => onUpdate('securitySettings', 'sessionSettings.maxConcurrentSessions', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Number of simultaneous sessions per user
            </p>
          </div>

          <div>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={sessionSettings.enableRememberMe || false}
                onChange={(e) => onUpdate('securitySettings', 'sessionSettings.enableRememberMe', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <span className="text-sm font-medium text-gray-700">Enable "Remember Me"</span>
                <p className="text-xs text-gray-500">Allow users to stay logged in longer</p>
              </div>
            </label>
          </div>
        </div>
      </div>
    );
  };

  const renderTwoFactorAuth = () => {
    const accessControl = settings.securitySettings?.accessControl || {};

    return (
      <div className="space-y-6">
        <div className="border-b border-gray-200 pb-4">
          <h3 className="text-lg font-semibold text-gray-900">Two-Factor Authentication</h3>
          <p className="text-gray-600">Enhanced security with multi-factor authentication</p>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <Smartphone className="h-6 w-6 text-blue-600" />
              <div>
                <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
                <p className="text-sm text-gray-600">Require additional verification for login</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={accessControl.enableTwoFactorAuth || false}
                onChange={(e) => onUpdate('securitySettings', 'accessControl.enableTwoFactorAuth', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <Shield className="h-6 w-6 text-red-600" />
              <div>
                <h4 className="font-medium text-gray-900">Require 2FA for Administrators</h4>
                <p className="text-sm text-gray-600">Mandatory 2FA for admin roles</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={accessControl.requireTwoFactorForAdmins || false}
                onChange={(e) => onUpdate('securitySettings', 'accessControl.requireTwoFactorForAdmins', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <Key className="h-6 w-6 text-green-600" />
              <div>
                <h4 className="font-medium text-gray-900">Biometric Authentication</h4>
                <p className="text-sm text-gray-600">Enable fingerprint and face recognition</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={accessControl.enableBiometricAuth || false}
                onChange={(e) => onUpdate('securitySettings', 'accessControl.enableBiometricAuth', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-yellow-900">Important</h4>
              <p className="text-sm text-yellow-700 mt-1">
                Enabling two-factor authentication will require all users to set up 2FA on their next login.
                Ensure users have access to their mobile devices or email for verification codes.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderAccessControl = () => {
    const accessControl = settings.securitySettings?.accessControl || {};
    const auditSettings = settings.securitySettings?.auditSettings || {};

    return (
      <div className="space-y-6">
        <div className="border-b border-gray-200 pb-4">
          <h3 className="text-lg font-semibold text-gray-900">Access Control</h3>
          <p className="text-gray-600">Network restrictions and login security</p>
        </div>

        <div className="space-y-6">
          {/* IP Whitelisting */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              IP Whitelist (Optional)
            </label>
            <textarea
              value={(accessControl.ipWhitelisting || []).join('\n')}
              onChange={(e) => {
                const ips = e.target.value.split('\n').filter(ip => ip.trim());
                onUpdate('securitySettings', 'accessControl.ipWhitelisting', ips);
              }}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="192.168.1.0/24&#10;10.0.0.0/8&#10;Enter one IP/CIDR per line"
            />
            <p className="text-xs text-gray-500 mt-1">
              Only allow access from these IP addresses/ranges. Leave empty to allow all IPs.
            </p>
          </div>

          {/* Failed Login Protection */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Failed Login Attempts
              </label>
              <input
                type="number"
                min="3"
                max="20"
                value={auditSettings.maxFailedLoginAttempts || 5}
                onChange={(e) => onUpdate('securitySettings', 'auditSettings.maxFailedLoginAttempts', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Lockout Duration (minutes)
              </label>
              <input
                type="number"
                min="5"
                max="1440"
                value={auditSettings.lockoutDurationMinutes || 15}
                onChange={(e) => onUpdate('securitySettings', 'auditSettings.lockoutDurationMinutes', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Geographic Restrictions */}
          <div>
            <label className="flex items-center space-x-3 mb-4">
              <input
                type="checkbox"
                checked={accessControl.enableGeolocationRestrictions || false}
                onChange={(e) => onUpdate('securitySettings', 'accessControl.enableGeolocationRestrictions', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <span className="text-sm font-medium text-gray-700">Enable Geographic Restrictions</span>
                <p className="text-xs text-gray-500">Limit access to specific countries/regions</p>
              </div>
            </label>

            {accessControl.enableGeolocationRestrictions && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Allowed Countries
                </label>
                <textarea
                  value={(accessControl.allowedCountries || []).join('\n')}
                  onChange={(e) => {
                    const countries = e.target.value.split('\n').filter(c => c.trim());
                    onUpdate('securitySettings', 'accessControl.allowedCountries', countries);
                  }}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="US&#10;CA&#10;GB&#10;Enter country codes (ISO 3166-1 alpha-2)"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderAuditSettings = () => {
    const auditSettings = settings.securitySettings?.auditSettings || {};

    return (
      <div className="space-y-6">
        <div className="border-b border-gray-200 pb-4">
          <h3 className="text-lg font-semibold text-gray-900">Audit & Logging</h3>
          <p className="text-gray-600">Security monitoring and compliance logging</p>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <FileText className="h-6 w-6 text-blue-600" />
              <div>
                <h4 className="font-medium text-gray-900">Audit Logging</h4>
                <p className="text-sm text-gray-600">Log all user activities for compliance</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={auditSettings.enableAuditLogging || false}
                onChange={(e) => onUpdate('securitySettings', 'auditSettings.enableAuditLogging', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Audit Log Retention (days)
              </label>
              <input
                type="number"
                min="30"
                max="2555" // 7 years
                value={auditSettings.auditLogRetentionDays || 365}
                onChange={(e) => onUpdate('securitySettings', 'auditSettings.auditLogRetentionDays', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                HIPAA requires minimum 6 years (2190 days)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Security Alert Email
              </label>
              <input
                type="email"
                value={auditSettings.alertEmail || ''}
                onChange={(e) => onUpdate('securitySettings', 'auditSettings.alertEmail', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="security@hospital.com"
              />
            </div>
          </div>

          <div className="space-y-4">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={auditSettings.enableRealTimeAlerts || false}
                onChange={(e) => onUpdate('securitySettings', 'auditSettings.enableRealTimeAlerts', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <span className="text-sm font-medium text-gray-700">Real-time Security Alerts</span>
                <p className="text-xs text-gray-500">Immediate notifications for security events</p>
              </div>
            </label>

            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={auditSettings.enableFailedLoginTracking || false}
                onChange={(e) => onUpdate('securitySettings', 'auditSettings.enableFailedLoginTracking', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <span className="text-sm font-medium text-gray-700">Failed Login Tracking</span>
                <p className="text-xs text-gray-500">Monitor and alert on suspicious login attempts</p>
              </div>
            </label>
          </div>
        </div>
      </div>
    );
  };

  const renderDataProtection = () => {
    const dataProtection = settings.securitySettings?.dataProtection || {};

    return (
      <div className="space-y-6">
        <div className="border-b border-gray-200 pb-4">
          <h3 className="text-lg font-semibold text-gray-900">Data Protection</h3>
          <p className="text-gray-600">Encryption and data retention policies</p>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <Database className="h-6 w-6 text-green-600" />
                <div>
                  <h4 className="font-medium text-gray-900">Encryption at Rest</h4>
                  <p className="text-sm text-gray-600">Encrypt stored data</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={dataProtection.enableEncryptionAtRest || false}
                  onChange={(e) => onUpdate('securitySettings', 'dataProtection.enableEncryptionAtRest', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <Wifi className="h-6 w-6 text-blue-600" />
                <div>
                  <h4 className="font-medium text-gray-900">Encryption in Transit</h4>
                  <p className="text-sm text-gray-600">Encrypt data transmission</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={dataProtection.enableEncryptionInTransit || false}
                  onChange={(e) => onUpdate('securitySettings', 'dataProtection.enableEncryptionInTransit', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Encryption Algorithm
            </label>
            <select
              value={dataProtection.encryptionAlgorithm || 'AES-256'}
              onChange={(e) => onUpdate('securitySettings', 'dataProtection.encryptionAlgorithm', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {encryptionAlgorithms.map(algo => (
                <option key={algo} value={algo}>{algo}</option>
              ))}
            </select>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Data Retention Policy</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Patient Records (years)</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={dataProtection.dataRetentionPolicy?.patientRecordsYears || 7}
                  onChange={(e) => onUpdate('securitySettings', 'dataProtection.dataRetentionPolicy.patientRecordsYears', parseInt(e.target.value))}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">Audit Logs (years)</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={dataProtection.dataRetentionPolicy?.auditLogsYears || 6}
                  onChange={(e) => onUpdate('securitySettings', 'dataProtection.dataRetentionPolicy.auditLogsYears', parseInt(e.target.value))}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">Financial Records (years)</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={dataProtection.dataRetentionPolicy?.financialRecordsYears || 7}
                  onChange={(e) => onUpdate('securitySettings', 'dataProtection.dataRetentionPolicy.financialRecordsYears', parseInt(e.target.value))}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">Employee Records (years)</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={dataProtection.dataRetentionPolicy?.employeeRecordsYears || 7}
                  onChange={(e) => onUpdate('securitySettings', 'dataProtection.dataRetentionPolicy.employeeRecordsYears', parseInt(e.target.value))}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={dataProtection.enableDataAnonymization || false}
                onChange={(e) => onUpdate('securitySettings', 'dataProtection.enableDataAnonymization', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <span className="text-sm font-medium text-gray-700">Data Anonymization</span>
                <p className="text-xs text-gray-500">Remove PII from archived records</p>
              </div>
            </label>

            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={dataProtection.enableRightToBeForgetton || false}
                onChange={(e) => onUpdate('securitySettings', 'dataProtection.enableRightToBeForgetton', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <span className="text-sm font-medium text-gray-700">Right to be Forgotten</span>
                <p className="text-xs text-gray-500">Enable data deletion requests (GDPR)</p>
              </div>
            </label>
          </div>
        </div>
      </div>
    );
  };

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'password-policy':
        return renderPasswordPolicy();
      case 'session-management':
        return renderSessionManagement();
      case 'two-factor-auth':
        return renderTwoFactorAuth();
      case 'access-control':
        return renderAccessControl();
      case 'audit-settings':
        return renderAuditSettings();
      case 'data-protection':
        return renderDataProtection();
      default:
        return null;
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4 mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Security Settings</h2>
        <p className="text-gray-600">Configure security policies and access controls</p>
      </div>

      {/* Section Navigation */}
      <div className="mb-6">
        <nav className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {sections.map(section => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeSection === section.id
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{section.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Section Content */}
      {renderSectionContent()}

      {/* Security Tips */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-medium text-blue-900">Security Best Practices</h4>
            <ul className="mt-1 text-sm text-blue-700 space-y-1">
              <li>• Use strong password policies with minimum 12 characters</li>
              <li>• Enable two-factor authentication for all administrative accounts</li>
              <li>• Regularly review audit logs for suspicious activities</li>
              <li>• Keep encryption enabled for all sensitive data</li>
              <li>• Implement IP whitelisting for enhanced network security</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}