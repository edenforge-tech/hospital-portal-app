'use client';

import { useState, useEffect } from 'react';
import { getApi } from '@/lib/api';
import { Bell, Save, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface NotificationPreference {
  id: string;
  userId: string;
  tenantId: string;
  notificationType: string;
  enabled: boolean;
  deliveryMethod: string;
  createdAt: string;
  updatedAt: string;
}

const notificationTypes = [
  { type: 'new_user_created', label: 'New User Created', description: 'When a new user is added to the system', category: 'Users' },
  { type: 'user_deactivated', label: 'User Deactivated', description: 'When a user is suspended or deactivated', category: 'Users' },
  { type: 'emergency_access', label: 'Emergency Access Granted', description: 'Critical: When emergency access is used', category: 'Security' },
  { type: 'breach_detected', label: 'Security Breach', description: 'Critical: When a potential security breach is detected', category: 'Security' },
  { type: 'license_expiring', label: 'License Expiring', description: 'When professional licenses are approaching expiration', category: 'Compliance' },
  { type: 'contract_expiring', label: 'Contract Expiring', description: 'When employment contracts need renewal', category: 'HR' },
  { type: 'audit_threshold', label: 'Audit Threshold Exceeded', description: 'When audit metrics exceed defined thresholds', category: 'Compliance' },
  { type: 'system_alert', label: 'System Alerts', description: 'General system notifications and alerts', category: 'System' },
  { type: 'mfa_required', label: 'MFA Required', description: 'When multi-factor authentication is needed', category: 'Security' },
  { type: 'device_approval', label: 'Device Approval Required', description: 'When a new device needs approval', category: 'Security' },
  { type: 'appointment_updated', label: 'Appointment Updates', description: 'When appointments are created or modified', category: 'Clinical' },
  { type: 'appointment_reminder', label: 'Appointment Reminders', description: 'Reminders for upcoming appointments', category: 'Clinical' },
];

export default function NotificationPreferencesPage() {
  const [preferences, setPreferences] = useState<NotificationPreference[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changes, setChanges] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const response = await getApi().get('/user-notification-preferences');
      setPreferences(response.data);
    } catch (error) {
      console.error('Failed to load notification preferences:', error);
      toast.error('Failed to load preferences');
    } finally {
      setLoading(false);
    }
  };

  const togglePreference = (notificationType: string) => {
    const current = preferences.find((p) => p.notificationType === notificationType);
    const newValue = !current?.enabled;
    
    setChanges((prev) => ({
      ...prev,
      [notificationType]: newValue,
    }));
  };

  const savePreferences = async () => {
    try {
      setSaving(true);
      
      const updates = Object.entries(changes).map(([notificationType, enabled]) => ({
        notificationType,
        enabled,
        deliveryMethod: 'in_app',
      }));

      await getApi().put('/user-notification-preferences/bulk', { preferences: updates });
      
      toast.success('Notification preferences saved');
      setChanges({});
      await loadPreferences();
    } catch (error) {
      console.error('Failed to save preferences:', error);
      toast.error('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const isEnabled = (notificationType: string): boolean => {
    if (notificationType in changes) {
      return changes[notificationType];
    }
    const pref = preferences.find((p) => p.notificationType === notificationType);
    return pref?.enabled ?? true; // Default to enabled
  };

  const hasChanges = Object.keys(changes).length > 0;

  const groupedTypes = notificationTypes.reduce((acc, type) => {
    if (!acc[type.category]) {
      acc[type.category] = [];
    }
    acc[type.category].push(type);
    return acc;
  }, {} as Record<string, typeof notificationTypes>);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Bell className="w-6 h-6 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Notification Preferences</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Manage how you receive real-time updates and alerts
                </p>
              </div>
            </div>
            {hasChanges && (
              <button
                onClick={savePreferences}
                disabled={saving}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Notification categories */}
        <div className="divide-y divide-gray-200">
          {Object.entries(groupedTypes).map(([category, types]) => (
            <div key={category} className="px-6 py-5">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">{category}</h2>
              <div className="space-y-4">
                {types.map((type) => (
                  <div key={type.type} className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id={type.type}
                        type="checkbox"
                        checked={isEnabled(type.type)}
                        onChange={() => togglePreference(type.type)}
                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded cursor-pointer"
                      />
                    </div>
                    <div className="ml-3 flex-1">
                      <label htmlFor={type.type} className="font-medium text-gray-900 cursor-pointer">
                        {type.label}
                      </label>
                      <p className="text-sm text-gray-600">{type.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer info */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
          <p className="text-sm text-gray-600">
            <strong>Note:</strong> Critical security alerts (Emergency Access, Security Breaches) cannot be disabled
            for compliance and safety reasons.
          </p>
        </div>
      </div>
    </div>
  );
}
