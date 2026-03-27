// Security Settings Tab Component
// Comprehensive security configuration interface

'use client';

import React from 'react';
import { 
  Shield, 
  Lock, 
  Eye, 
  EyeOff, 
  Clock, 
  Smartphone, 
  AlertTriangle, 
  CheckCircle,
  Key,
  Users,
  Globe,
  Database
} from 'lucide-react';
import { TenantSettings } from '../../lib/api/system-settings.api';

interface SecuritySettingsTabProps {
  settings: TenantSettings;
  updateSettings: (path: string, value: any) => void;
  showPasswords: Record<string, boolean>;
  togglePasswordVisibility: (field: string) => void;
}

export default function SecuritySettingsTab({ 
  settings, 
  updateSettings, 
  showPasswords, 
  togglePasswordVisibility 
}: SecuritySettingsTabProps) {
  const { security } = settings;

  const getPasswordStrengthLevel = () => {
    const { passwordPolicy } = security;
    let score = 0;
    
    if (passwordPolicy.minLength >= 8) score += 1;
    if (passwordPolicy.minLength >= 12) score += 1;
    if (passwordPolicy.requireUppercase) score += 1;
    if (passwordPolicy.requireLowercase) score += 1;
    if (passwordPolicy.requireNumbers) score += 1;
    if (passwordPolicy.requireSpecialChars) score += 1;
    if (passwordPolicy.passwordExpiry > 0) score += 1;
    if (passwordPolicy.preventReuse > 0) score += 1;
    
    if (score <= 3) return { level: 'Weak', color: 'red', score };
    if (score <= 5) return { level: 'Medium', color: 'yellow', score };
    return { level: 'Strong', color: 'green', score };
  };

  const passwordStrength = getPasswordStrengthLevel();

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center space-x-3 mb-6">
        <Shield className="h-6 w-6 text-blue-500" />
        <h3 className="text-lg font-semibold text-gray-900">Security Configuration</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Password Policy */}
        <div className="space-y-6">
          <div>
            <h4 className="text-base font-semibold text-gray-800 mb-4 flex items-center">
              <Lock className="h-4 w-4 mr-2" />
              Password Policy
            </h4>
            
            {/* Password Strength Indicator */}
            <div className={`mb-4 p-3 rounded-md border ${
              passwordStrength.color === 'red' 
                ? 'bg-red-50 border-red-200' 
                : passwordStrength.color === 'yellow'
                ? 'bg-yellow-50 border-yellow-200'
                : 'bg-green-50 border-green-200'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Policy Strength</span>
                <div className={`flex items-center space-x-2 text-sm font-semibold ${
                  passwordStrength.color === 'red' 
                    ? 'text-red-700' 
                    : passwordStrength.color === 'yellow'
                    ? 'text-yellow-700'
                    : 'text-green-700'
                }`}>
                  {passwordStrength.color === 'green' && <CheckCircle className="h-4 w-4" />}
                  {passwordStrength.color !== 'green' && <AlertTriangle className="h-4 w-4" />}
                  <span>{passwordStrength.level} ({passwordStrength.score}/8)</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum Password Length
                </label>
                <input
                  type="number"
                  min="6"
                  max="50"
                  value={security.passwordPolicy.minLength}
                  onChange={(e) => updateSettings('security.passwordPolicy.minLength', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Password Requirements
                </label>
                
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={security.passwordPolicy.requireUppercase}
                      onChange={(e) => updateSettings('security.passwordPolicy.requireUppercase', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Require uppercase letters</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={security.passwordPolicy.requireLowercase}
                      onChange={(e) => updateSettings('security.passwordPolicy.requireLowercase', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Require lowercase letters</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={security.passwordPolicy.requireNumbers}
                      onChange={(e) => updateSettings('security.passwordPolicy.requireNumbers', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Require numbers</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={security.passwordPolicy.requireSpecialChars}
                      onChange={(e) => updateSettings('security.passwordPolicy.requireSpecialChars', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Require special characters</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password Expiry (days, 0 = never)
                </label>
                <input
                  type="number"
                  min="0"
                  max="365"
                  value={security.passwordPolicy.passwordExpiry}
                  onChange={(e) => updateSettings('security.passwordPolicy.passwordExpiry', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prevent Password Reuse (last N passwords)
                </label>
                <input
                  type="number"
                  min="0"
                  max="24"
                  value={security.passwordPolicy.preventReuse}
                  onChange={(e) => updateSettings('security.passwordPolicy.preventReuse', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Account Lockout */}
          <div>
            <h4 className="text-base font-semibold text-gray-800 mb-4 flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Account Lockout
            </h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Maximum Login Attempts
                </label>
                <input
                  type="number"
                  min="3"
                  max="20"
                  value={security.passwordPolicy.maxLoginAttempts}
                  onChange={(e) => updateSettings('security.passwordPolicy.maxLoginAttempts', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lockout Duration (minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  max="1440"
                  value={security.passwordPolicy.lockoutDuration}
                  onChange={(e) => updateSettings('security.passwordPolicy.lockoutDuration', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Session Management & MFA */}
        <div className="space-y-6">
          {/* Session Settings */}
          <div>
            <h4 className="text-base font-semibold text-gray-800 mb-4 flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              Session Management
            </h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Session Timeout (minutes)
                </label>
                <input
                  type="number"
                  min="5"
                  max="480"
                  value={security.sessionSettings.sessionTimeout}
                  onChange={(e) => updateSettings('security.sessionSettings.sessionTimeout', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={security.sessionSettings.multipleSessionsAllowed}
                  onChange={(e) => updateSettings('security.sessionSettings.multipleSessionsAllowed', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Allow multiple sessions</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={security.sessionSettings.forceLogoutInactive}
                  onChange={(e) => updateSettings('security.sessionSettings.forceLogoutInactive', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Force logout on inactivity</span>
              </label>
            </div>
          </div>

          {/* Multi-Factor Authentication */}
          <div>
            <h4 className="text-base font-semibold text-gray-800 mb-4 flex items-center">
              <Smartphone className="h-4 w-4 mr-2" />
              Multi-Factor Authentication
            </h4>
            <div className="space-y-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={security.mfaSettings.required}
                  onChange={(e) => updateSettings('security.mfaSettings.required', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Require MFA for all users</span>
              </label>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Allowed MFA Methods
                </label>
                <div className="space-y-2">
                  {['SMS', 'Email', 'Authenticator'].map((method) => (
                    <label key={method} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={security.mfaSettings.methods.includes(method as any)}
                        onChange={(e) => {
                          const methods = [...security.mfaSettings.methods];
                          if (e.target.checked) {
                            if (!methods.includes(method as any)) {
                              methods.push(method as any);
                            }
                          } else {
                            const index = methods.indexOf(method as any);
                            if (index > -1) {
                              methods.splice(index, 1);
                            }
                          }
                          updateSettings('security.mfaSettings.methods', methods);
                        }}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">{method}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  MFA Grace Period (days)
                </label>
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={security.mfaSettings.gracePeriod}
                  onChange={(e) => updateSettings('security.mfaSettings.gracePeriod', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Time users have to set up MFA before being locked out
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* IP Restrictions & Data Encryption */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        {/* IP Restrictions */}
        <div>
          <h4 className="text-base font-semibold text-gray-800 mb-4 flex items-center">
            <Globe className="h-4 w-4 mr-2" />
            IP Access Control
          </h4>
          <div className="space-y-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={security.ipRestrictions.enabled}
                onChange={(e) => updateSettings('security.ipRestrictions.enabled', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Enable IP restrictions</span>
            </label>

            {security.ipRestrictions.enabled && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Allowed IP Addresses
                  </label>
                  <textarea
                    value={security.ipRestrictions.allowedIPs.join('\n')}
                    onChange={(e) => updateSettings('security.ipRestrictions.allowedIPs', e.target.value.split('\n').filter(ip => ip.trim()))}
                    rows={4}
                    placeholder="192.168.1.1&#10;10.0.0.0/24&#10;Enter one IP or CIDR block per line"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={security.ipRestrictions.restrictAdmins}
                    onChange={(e) => updateSettings('security.ipRestrictions.restrictAdmins', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Also restrict administrator access</span>
                </label>
              </>
            )}
          </div>
        </div>

        {/* Data Encryption */}
        <div>
          <h4 className="text-base font-semibold text-gray-800 mb-4 flex items-center">
            <Database className="h-4 w-4 mr-2" />
            Data Encryption
          </h4>
          <div className="space-y-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={security.dataEncryption.encryptPatientData}
                onChange={(e) => updateSettings('security.dataEncryption.encryptPatientData', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Encrypt patient data at rest</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={security.dataEncryption.encryptCommunications}
                onChange={(e) => updateSettings('security.dataEncryption.encryptCommunications', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Encrypt communications in transit</span>
            </label>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Key Rotation Period (days)
              </label>
              <input
                type="number"
                min="30"
                max="365"
                value={security.dataEncryption.keyRotationDays}
                onChange={(e) => updateSettings('security.dataEncryption.keyRotationDays', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Security Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
        <h4 className="font-semibold text-blue-800 mb-4 flex items-center">
          <Shield className="h-4 w-4 mr-2" />
          Security Configuration Summary
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-md p-3">
            <div className={`text-2xl font-bold ${
              passwordStrength.color === 'red' 
                ? 'text-red-600' 
                : passwordStrength.color === 'yellow'
                ? 'text-yellow-600'
                : 'text-green-600'
            }`}>
              {passwordStrength.level}
            </div>
            <div className="text-sm text-gray-600">Password Policy</div>
          </div>
          
          <div className="bg-white rounded-md p-3">
            <div className={`text-2xl font-bold ${security.mfaSettings.required ? 'text-green-600' : 'text-red-600'}`}>
              {security.mfaSettings.required ? 'ON' : 'OFF'}
            </div>
            <div className="text-sm text-gray-600">Multi-Factor Auth</div>
          </div>
          
          <div className="bg-white rounded-md p-3">
            <div className={`text-2xl font-bold ${security.ipRestrictions.enabled ? 'text-green-600' : 'text-gray-400'}`}>
              {security.ipRestrictions.enabled ? 'ON' : 'OFF'}
            </div>
            <div className="text-sm text-gray-600">IP Restrictions</div>
          </div>
          
          <div className="bg-white rounded-md p-3">
            <div className={`text-2xl font-bold ${security.dataEncryption.encryptPatientData ? 'text-green-600' : 'text-red-600'}`}>
              {security.dataEncryption.encryptPatientData ? 'ON' : 'OFF'}
            </div>
            <div className="text-sm text-gray-600">Data Encryption</div>
          </div>
        </div>
        
        <div className="mt-4 text-sm text-blue-700">
          <p>• Security changes take effect immediately for new sessions</p>
          <p>• Existing sessions may need to be refreshed</p>
          <p>• Consider testing changes in a development environment first</p>
        </div>
      </div>
    </div>
  );
}