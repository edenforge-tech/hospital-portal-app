// Notification Settings Tab Component
// Comprehensive notification configuration interface

'use client';

import React, { useState } from 'react';
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  Smartphone, 
  Eye, 
  EyeOff, 
  TestTube, 
  Plus, 
  Edit, 
  Trash2, 
  Send,
  CheckCircle,
  AlertTriangle,
  Settings
} from 'lucide-react';
import { TenantSettings, NotificationTemplate } from '../../lib/api/system-settings.api';

interface NotificationSettingsTabProps {
  settings: TenantSettings;
  templates: NotificationTemplate[];
  updateSettings: (path: string, value: any) => void;
  showPasswords: Record<string, boolean>;
  togglePasswordVisibility: (field: string) => void;
}

const providers = {
  sms: [
    { id: 'Twilio', name: 'Twilio', description: 'Popular SMS service provider' },
    { id: 'AWS_SNS', name: 'AWS SNS', description: 'Amazon Simple Notification Service' },
    { id: 'Other', name: 'Other', description: 'Custom SMS provider' }
  ]
};

const notificationEvents = [
  { id: 'appointment_reminder', name: 'Appointment Reminder', category: 'Appointments' },
  { id: 'appointment_confirmation', name: 'Appointment Confirmation', category: 'Appointments' },
  { id: 'appointment_cancellation', name: 'Appointment Cancellation', category: 'Appointments' },
  { id: 'welcome_email', name: 'Welcome Email', category: 'Patient Onboarding' },
  { id: 'portal_invitation', name: 'Portal Invitation', category: 'Patient Onboarding' },
  { id: 'password_reset', name: 'Password Reset', category: 'Security' },
  { id: 'account_locked', name: 'Account Locked', category: 'Security' },
  { id: 'payment_reminder', name: 'Payment Reminder', category: 'Billing' },
  { id: 'payment_received', name: 'Payment Received', category: 'Billing' },
  { id: 'lab_results', name: 'Lab Results Available', category: 'Medical' },
  { id: 'prescription_ready', name: 'Prescription Ready', category: 'Medical' },
];

export default function NotificationSettingsTab({ 
  settings, 
  templates, 
  updateSettings, 
  showPasswords, 
  togglePasswordVisibility 
}: NotificationSettingsTabProps) {
  const [activeProvider, setActiveProvider] = useState('email');
  const [testNotification, setTestNotification] = useState({ type: '', recipient: '', status: '' });
  const { notifications } = settings;

  const testEmailSettings = async () => {
    setTestNotification({ type: 'email', recipient: 'test@example.com', status: 'sending' });
    
    // Simulate API call
    setTimeout(() => {
      setTestNotification({ type: 'email', recipient: 'test@example.com', status: 'success' });
      setTimeout(() => setTestNotification({ type: '', recipient: '', status: '' }), 3000);
    }, 2000);
  };

  const testSMSSettings = async () => {
    setTestNotification({ type: 'sms', recipient: '+1234567890', status: 'sending' });
    
    // Simulate API call
    setTimeout(() => {
      setTestNotification({ type: 'sms', recipient: '+1234567890', status: 'success' });
      setTimeout(() => setTestNotification({ type: '', recipient: '', status: '' }), 3000);
    }, 2000);
  };

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center space-x-3 mb-6">
        <Bell className="h-6 w-6 text-blue-500" />
        <h3 className="text-lg font-semibold text-gray-900">Notification Configuration</h3>
      </div>

      {/* Provider Selection */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-semibold text-gray-800 mb-3">Notification Providers</h4>
        <div className="flex space-x-1 bg-white p-1 rounded-md">
          {[
            { id: 'email', name: 'Email', icon: Mail },
            { id: 'sms', name: 'SMS', icon: MessageSquare },
            { id: 'push', name: 'Push', icon: Smartphone },
            { id: 'inApp', name: 'In-App', icon: Bell }
          ].map((provider) => {
            const IconComponent = provider.icon;
            return (
              <button
                key={provider.id}
                onClick={() => setActiveProvider(provider.id)}
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeProvider === provider.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <IconComponent className="h-4 w-4 mr-2" />
                {provider.name}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Provider Configuration */}
        <div>
          {/* Email Configuration */}
          {activeProvider === 'email' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-semibold text-gray-800 flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  Email Configuration
                </h4>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={notifications.email.enabled}
                    onChange={(e) => updateSettings('notifications.email.enabled', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Enabled</span>
                </label>
              </div>

              {notifications.email.enabled && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        SMTP Server
                      </label>
                      <input
                        type="text"
                        value={notifications.email.smtpServer}
                        onChange={(e) => updateSettings('notifications.email.smtpServer', e.target.value)}
                        placeholder="smtp.gmail.com"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        SMTP Port
                      </label>
                      <input
                        type="number"
                        value={notifications.email.smtpPort}
                        onChange={(e) => updateSettings('notifications.email.smtpPort', parseInt(e.target.value))}
                        placeholder="587"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Username
                    </label>
                    <input
                      type="text"
                      value={notifications.email.smtpUsername}
                      onChange={(e) => updateSettings('notifications.email.smtpUsername', e.target.value)}
                      placeholder="your-email@gmail.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.smtpPassword ? 'text' : 'password'}
                        value={notifications.email.smtpPassword || ''}
                        onChange={(e) => updateSettings('notifications.email.smtpPassword', e.target.value)}
                        placeholder="App password or SMTP password"
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('smtpPassword')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPasswords.smtpPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        From Address
                      </label>
                      <input
                        type="email"
                        value={notifications.email.fromAddress}
                        onChange={(e) => updateSettings('notifications.email.fromAddress', e.target.value)}
                        placeholder="noreply@hospital.com"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        From Name
                      </label>
                      <input
                        type="text"
                        value={notifications.email.fromName}
                        onChange={(e) => updateSettings('notifications.email.fromName', e.target.value)}
                        placeholder="Hospital Portal"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={notifications.email.useSSL}
                      onChange={(e) => updateSettings('notifications.email.useSSL', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Use SSL/TLS</span>
                  </label>

                  <button
                    onClick={testEmailSettings}
                    disabled={testNotification.status === 'sending'}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    <TestTube className="h-4 w-4 mr-2" />
                    {testNotification.type === 'email' && testNotification.status === 'sending' 
                      ? 'Testing...' 
                      : 'Test Email Settings'
                    }
                  </button>

                  {testNotification.type === 'email' && testNotification.status && (
                    <div className={`p-3 rounded-md flex items-center ${
                      testNotification.status === 'success' 
                        ? 'bg-green-50 text-green-800 border border-green-200'
                        : testNotification.status === 'sending'
                        ? 'bg-blue-50 text-blue-800 border border-blue-200'
                        : 'bg-red-50 text-red-800 border border-red-200'
                    }`}>
                      {testNotification.status === 'success' && <CheckCircle className="h-4 w-4 mr-2" />}
                      {testNotification.status === 'sending' && <Settings className="h-4 w-4 mr-2 animate-spin" />}
                      {testNotification.status === 'error' && <AlertTriangle className="h-4 w-4 mr-2" />}
                      <span>
                        {testNotification.status === 'success' && 'Test email sent successfully!'}
                        {testNotification.status === 'sending' && 'Sending test email...'}
                        {testNotification.status === 'error' && 'Failed to send test email'}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* SMS Configuration */}
          {activeProvider === 'sms' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-semibold text-gray-800 flex items-center">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  SMS Configuration
                </h4>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={notifications.sms.enabled}
                    onChange={(e) => updateSettings('notifications.sms.enabled', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Enabled</span>
                </label>
              </div>

              {notifications.sms.enabled && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      SMS Provider
                    </label>
                    <select
                      value={notifications.sms.provider}
                      onChange={(e) => updateSettings('notifications.sms.provider', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {providers.sms.map((provider) => (
                        <option key={provider.id} value={provider.id}>
                          {provider.name} - {provider.description}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      API Key
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.smsApiKey ? 'text' : 'password'}
                        value={notifications.sms.apiKey || ''}
                        onChange={(e) => updateSettings('notifications.sms.apiKey', e.target.value)}
                        placeholder="Enter your SMS API key"
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('smsApiKey')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPasswords.smsApiKey ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      API Secret
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.smsApiSecret ? 'text' : 'password'}
                        value={notifications.sms.apiSecret || ''}
                        onChange={(e) => updateSettings('notifications.sms.apiSecret', e.target.value)}
                        placeholder="Enter your SMS API secret"
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('smsApiSecret')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPasswords.smsApiSecret ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      From Number
                    </label>
                    <input
                      type="tel"
                      value={notifications.sms.fromNumber}
                      onChange={(e) => updateSettings('notifications.sms.fromNumber', e.target.value)}
                      placeholder="+1234567890"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <button
                    onClick={testSMSSettings}
                    disabled={testNotification.status === 'sending'}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    <TestTube className="h-4 w-4 mr-2" />
                    {testNotification.type === 'sms' && testNotification.status === 'sending' 
                      ? 'Testing...' 
                      : 'Test SMS Settings'
                    }
                  </button>

                  {testNotification.type === 'sms' && testNotification.status && (
                    <div className={`p-3 rounded-md flex items-center ${
                      testNotification.status === 'success' 
                        ? 'bg-green-50 text-green-800 border border-green-200'
                        : testNotification.status === 'sending'
                        ? 'bg-blue-50 text-blue-800 border border-blue-200'
                        : 'bg-red-50 text-red-800 border border-red-200'
                    }`}>
                      {testNotification.status === 'success' && <CheckCircle className="h-4 w-4 mr-2" />}
                      {testNotification.status === 'sending' && <Settings className="h-4 w-4 mr-2 animate-spin" />}
                      {testNotification.status === 'error' && <AlertTriangle className="h-4 w-4 mr-2" />}
                      <span>
                        {testNotification.status === 'success' && 'Test SMS sent successfully!'}
                        {testNotification.status === 'sending' && 'Sending test SMS...'}
                        {testNotification.status === 'error' && 'Failed to send test SMS'}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Push Notifications */}
          {activeProvider === 'push' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-semibold text-gray-800 flex items-center">
                  <Smartphone className="h-4 w-4 mr-2" />
                  Push Notification Configuration
                </h4>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={notifications.push.enabled}
                    onChange={(e) => updateSettings('notifications.push.enabled', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Enabled</span>
                </label>
              </div>

              {notifications.push.enabled && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Firebase Server Key
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.firebaseKey ? 'text' : 'password'}
                        value={notifications.push.firebaseKey || ''}
                        onChange={(e) => updateSettings('notifications.push.firebaseKey', e.target.value)}
                        placeholder="Enter Firebase server key"
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('firebaseKey')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPasswords.firebaseKey ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      APNS Key (for iOS)
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.apnsKey ? 'text' : 'password'}
                        value={notifications.push.apnsKey || ''}
                        onChange={(e) => updateSettings('notifications.push.apnsKey', e.target.value)}
                        placeholder="Enter APNS key"
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('apnsKey')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPasswords.apnsKey ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                    <p className="text-sm text-yellow-800">
                      Push notifications require a mobile app to be configured. Contact support for mobile app setup.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* In-App Notifications */}
          {activeProvider === 'inApp' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-semibold text-gray-800 flex items-center">
                  <Bell className="h-4 w-4 mr-2" />
                  In-App Notification Configuration
                </h4>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={notifications.inApp.enabled}
                    onChange={(e) => updateSettings('notifications.inApp.enabled', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Enabled</span>
                </label>
              </div>

              {notifications.inApp.enabled && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notification Retention (days)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="365"
                      value={notifications.inApp.retentionDays}
                      onChange={(e) => updateSettings('notifications.inApp.retentionDays', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      How long to keep in-app notifications before auto-deletion
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                    <p className="text-sm text-blue-800">
                      In-app notifications appear in the user's notification panel within the application.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Notification Templates */}
        <div>
          <h4 className="text-base font-semibold text-gray-800 mb-4">Notification Templates</h4>
          
          <div className="space-y-4">
            {notificationEvents.slice(0, 6).map((event) => {
              const template = templates.find(t => t.event === event.id);
              return (
                <div key={event.id} className="border border-gray-200 rounded-md p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-medium text-gray-900">{event.name}</h5>
                      <p className="text-sm text-gray-600">{event.category}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        template?.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {template?.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <button className="p-1 text-gray-400 hover:text-gray-600">
                        <Edit className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  {template && (
                    <div className="mt-3 text-sm text-gray-600">
                      <p className="font-medium">Subject: {template.subject}</p>
                      <p className="mt-1 truncate">Body: {template.body.substring(0, 100)}...</p>
                    </div>
                  )}
                </div>
              );
            })}
            
            <button className="w-full flex items-center justify-center px-4 py-3 border border-dashed border-gray-300 rounded-md text-gray-600 hover:text-gray-800 hover:border-gray-400">
              <Plus className="h-4 w-4 mr-2" />
              Add Custom Template
            </button>
          </div>
        </div>
      </div>

      {/* Configuration Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
        <h4 className="font-semibold text-blue-800 mb-4 flex items-center">
          <Bell className="h-4 w-4 mr-2" />
          Notification Configuration Summary
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-md p-3">
            <div className={`text-2xl font-bold ${notifications.email.enabled ? 'text-green-600' : 'text-gray-400'}`}>
              {notifications.email.enabled ? 'ON' : 'OFF'}
            </div>
            <div className="text-sm text-gray-600">Email</div>
          </div>
          
          <div className="bg-white rounded-md p-3">
            <div className={`text-2xl font-bold ${notifications.sms.enabled ? 'text-green-600' : 'text-gray-400'}`}>
              {notifications.sms.enabled ? 'ON' : 'OFF'}
            </div>
            <div className="text-sm text-gray-600">SMS</div>
          </div>
          
          <div className="bg-white rounded-md p-3">
            <div className={`text-2xl font-bold ${notifications.push.enabled ? 'text-green-600' : 'text-gray-400'}`}>
              {notifications.push.enabled ? 'ON' : 'OFF'}
            </div>
            <div className="text-sm text-gray-600">Push</div>
          </div>
          
          <div className="bg-white rounded-md p-3">
            <div className="text-2xl font-bold text-blue-600">
              {templates.filter(t => t.isActive).length}
            </div>
            <div className="text-sm text-gray-600">Active Templates</div>
          </div>
        </div>
        
        <div className="mt-4 text-sm text-blue-700">
          <p>• Test your notification settings before going live</p>
          <p>• All credentials are encrypted and stored securely</p>
          <p>• Template changes affect future notifications only</p>
        </div>
      </div>
    </div>
  );
}