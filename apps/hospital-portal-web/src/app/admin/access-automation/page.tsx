'use client';

import { useEffect, useState } from 'react';
import { Clock, Play, Pause, Settings as SettingsIcon, Bell, Calendar, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';

interface AutomationConfig {
  id: string;
  configName: string;
  automationType: 'expiration' | 'renewal' | 'notification' | 'cleanup';
  isEnabled: boolean;
  schedule: {
    frequency: 'daily' | 'weekly' | 'monthly';
    time: string; // HH:MM
    dayOfWeek?: number; // 0-6 for weekly
    dayOfMonth?: number; // 1-31 for monthly
  };
  expirationSettings?: {
    warningDaysBefore: number;
    autoRevokeOnExpiry: boolean;
    allowRenewal: boolean;
    renewalWindowDays: number;
  };
  notificationSettings?: {
    emailEnabled: boolean;
    smsEnabled: boolean;
    inAppEnabled: boolean;
    reminderFrequency: number; // days
  };
  lastRunTime?: string;
  nextRunTime?: string;
  status: 'Running' | 'Idle' | 'Failed' | 'Disabled';
}

interface JobHistory {
  id: string;
  configId: string;
  configName: string;
  runTime: string;
  status: 'Success' | 'Failed' | 'Partial';
  recordsProcessed: number;
  accessRevoked: number;
  notificationsSent: number;
  errors?: string[];
  duration: number; // seconds
}

export default function TimeBasedAccessAutomationPage() {
  const [configs, setConfigs] = useState<AutomationConfig[]>([]);
  const [jobHistory, setJobHistory] = useState<JobHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedConfig, setSelectedConfig] = useState<AutomationConfig | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      // Mock data - replace with actual API calls
      const mockConfigs: AutomationConfig[] = [
        {
          id: 'config-1',
          configName: 'Daily Access Expiration Check',
          automationType: 'expiration',
          isEnabled: true,
          schedule: {
            frequency: 'daily',
            time: '02:00',
          },
          expirationSettings: {
            warningDaysBefore: 7,
            autoRevokeOnExpiry: true,
            allowRenewal: true,
            renewalWindowDays: 30,
          },
          notificationSettings: {
            emailEnabled: true,
            smsEnabled: false,
            inAppEnabled: true,
            reminderFrequency: 3,
          },
          lastRunTime: '2025-12-09T02:00:00Z',
          nextRunTime: '2025-12-10T02:00:00Z',
          status: 'Idle',
        },
        {
          id: 'config-2',
          configName: 'Weekly Expiration Reminders',
          automationType: 'notification',
          isEnabled: true,
          schedule: {
            frequency: 'weekly',
            time: '09:00',
            dayOfWeek: 1, // Monday
          },
          notificationSettings: {
            emailEnabled: true,
            smsEnabled: true,
            inAppEnabled: true,
            reminderFrequency: 7,
          },
          lastRunTime: '2025-12-02T09:00:00Z',
          nextRunTime: '2025-12-09T09:00:00Z',
          status: 'Idle',
        },
        {
          id: 'config-3',
          configName: 'Monthly Access Cleanup',
          automationType: 'cleanup',
          isEnabled: false,
          schedule: {
            frequency: 'monthly',
            time: '03:00',
            dayOfMonth: 1,
          },
          lastRunTime: undefined,
          nextRunTime: undefined,
          status: 'Disabled',
        },
      ];

      const mockHistory: JobHistory[] = [
        {
          id: 'job-1',
          configId: 'config-1',
          configName: 'Daily Access Expiration Check',
          runTime: '2025-12-09T02:00:00Z',
          status: 'Success',
          recordsProcessed: 247,
          accessRevoked: 12,
          notificationsSent: 35,
          duration: 45,
        },
        {
          id: 'job-2',
          configId: 'config-2',
          configName: 'Weekly Expiration Reminders',
          runTime: '2025-12-02T09:00:00Z',
          status: 'Success',
          recordsProcessed: 156,
          accessRevoked: 0,
          notificationsSent: 156,
          duration: 22,
        },
        {
          id: 'job-3',
          configId: 'config-1',
          configName: 'Daily Access Expiration Check',
          runTime: '2025-12-08T02:00:00Z',
          status: 'Partial',
          recordsProcessed: 240,
          accessRevoked: 8,
          notificationsSent: 30,
          errors: ['Failed to send 5 email notifications'],
          duration: 48,
        },
      ];

      setConfigs(mockConfigs);
      setJobHistory(mockHistory);
    } catch (err: any) {
      setError('Failed to load automation configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleConfig = async (configId: string) => {
    try {
      setConfigs(configs.map(c =>
        c.id === configId
          ? {
              ...c,
              isEnabled: !c.isEnabled,
              status: !c.isEnabled ? 'Idle' : 'Disabled'
            }
          : c
      ));
      setSuccess('Configuration updated successfully');
    } catch (err: any) {
      setError('Failed to toggle configuration');
    }
  };

  const handleRunNow = async (configId: string) => {
    if (!confirm('Run this automation job now?')) return;

    try {
      setConfigs(configs.map(c =>
        c.id === configId ? { ...c, status: 'Running' } : c
      ));
      setSuccess('Job started successfully');

      // Simulate job completion
      setTimeout(() => {
        setConfigs(configs.map(c =>
          c.id === configId ? { ...c, status: 'Idle', lastRunTime: new Date().toISOString() } : c
        ));
        fetchData(); // Refresh to show new job history
      }, 3000);
    } catch (err: any) {
      setError('Failed to start job');
    }
  };

  const handleEditConfig = (config: AutomationConfig) => {
    setSelectedConfig({ ...config });
  };

  const handleSaveConfig = async () => {
    if (!selectedConfig) return;

    setError('');
    setSuccess('');
    try {
      setConfigs(configs.map(c =>
        c.id === selectedConfig.id ? selectedConfig : c
      ));
      setSuccess('Configuration saved successfully');
      setSelectedConfig(null);
    } catch (err: any) {
      setError('Failed to save configuration');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Success': return 'green';
      case 'Failed': return 'red';
      case 'Partial': return 'yellow';
      case 'Running': return 'blue';
      case 'Idle': return 'gray';
      case 'Disabled': return 'gray';
      default: return 'gray';
    }
  };

  const getAutomationIcon = (type: string) => {
    switch (type) {
      case 'expiration': return Clock;
      case 'renewal': return RefreshCw;
      case 'notification': return Bell;
      case 'cleanup': return AlertCircle;
      default: return SettingsIcon;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <Clock className="h-12 w-12 text-gray-400 mx-auto animate-spin" />
            <p className="mt-4 text-gray-600">Loading automation settings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Clock className="h-8 w-8 text-indigo-600" />
            Time-Based Access Automation
          </h1>
          <p className="text-gray-600 mt-2">
            Configure automatic access expiration, renewal reminders, and cleanup jobs
          </p>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            {success}
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-sm text-gray-600">Active Jobs</div>
            <div className="text-2xl font-bold text-green-600">
              {configs.filter(c => c.isEnabled).length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-sm text-gray-600">Last 24h Executions</div>
            <div className="text-2xl font-bold text-indigo-600">
              {jobHistory.filter(j => {
                const jobDate = new Date(j.runTime);
                const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
                return jobDate > oneDayAgo;
              }).length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-sm text-gray-600">Access Revoked Today</div>
            <div className="text-2xl font-bold text-red-600">
              {jobHistory
                .filter(j => new Date(j.runTime).toDateString() === new Date().toDateString())
                .reduce((sum, j) => sum + j.accessRevoked, 0)}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-sm text-gray-600">Notifications Sent</div>
            <div className="text-2xl font-bold text-blue-600">
              {jobHistory
                .filter(j => new Date(j.runTime).toDateString() === new Date().toDateString())
                .reduce((sum, j) => sum + j.notificationsSent, 0)}
            </div>
          </div>
        </div>

        {/* Automation Configurations */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Automation Jobs</h2>
          <div className="space-y-4">
            {configs.map(config => {
              const AutoIcon = getAutomationIcon(config.automationType);
              const statusColor = getStatusColor(config.status);

              return (
                <div
                  key={config.id}
                  className={`border rounded-lg p-4 ${
                    config.isEnabled ? 'border-gray-200' : 'border-gray-300 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <AutoIcon className="h-6 w-6 text-indigo-600" />
                        <h3 className="text-lg font-semibold text-gray-900">{config.configName}</h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium bg-${statusColor}-100 text-${statusColor}-800`}>
                          {config.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                        <div>
                          <p className="text-sm text-gray-600">Type</p>
                          <p className="font-medium text-gray-900 capitalize">{config.automationType}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Frequency</p>
                          <p className="font-medium text-gray-900 capitalize">{config.schedule.frequency}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Schedule Time</p>
                          <p className="font-medium text-gray-900">{config.schedule.time}</p>
                        </div>
                        {config.nextRunTime && (
                          <div>
                            <p className="text-sm text-gray-600">Next Run</p>
                            <p className="font-medium text-gray-900">
                              {new Date(config.nextRunTime).toLocaleString()}
                            </p>
                          </div>
                        )}
                      </div>

                      {config.expirationSettings && (
                        <div className="bg-gray-50 rounded p-3 text-sm">
                          <p className="text-gray-700">
                            <strong>Warning:</strong> {config.expirationSettings.warningDaysBefore} days before expiry
                            {config.expirationSettings.autoRevokeOnExpiry && ' • Auto-revoke enabled'}
                            {config.expirationSettings.allowRenewal && ` • Renewal window: ${config.expirationSettings.renewalWindowDays} days`}
                          </p>
                        </div>
                      )}

                      {config.notificationSettings && (
                        <div className="bg-blue-50 rounded p-3 text-sm mt-2">
                          <p className="text-blue-800">
                            <strong>Notifications:</strong>
                            {config.notificationSettings.emailEnabled && ' Email'}
                            {config.notificationSettings.smsEnabled && ' • SMS'}
                            {config.notificationSettings.inAppEnabled && ' • In-App'}
                            {` • Every ${config.notificationSettings.reminderFrequency} days`}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 ml-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={config.isEnabled}
                          onChange={() => handleToggleConfig(config.id)}
                          className="w-4 h-4"
                        />
                        <span className="text-sm text-gray-700">Enabled</span>
                      </label>
                      <button
                        onClick={() => handleEditConfig(config)}
                        className="flex items-center gap-2 text-indigo-600 hover:bg-indigo-50 px-3 py-1 rounded text-sm"
                      >
                        <SettingsIcon className="h-4 w-4" />
                        Configure
                      </button>
                      <button
                        onClick={() => handleRunNow(config.id)}
                        disabled={!config.isEnabled || config.status === 'Running'}
                        className="flex items-center gap-2 text-green-600 hover:bg-green-50 px-3 py-1 rounded text-sm disabled:opacity-50"
                      >
                        <Play className="h-4 w-4" />
                        Run Now
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Job History */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Execution History</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Job Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Run Time</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Records</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revoked</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notifications</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {jobHistory.map(job => {
                  const statusColor = getStatusColor(job.status);
                  return (
                    <tr key={job.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{job.configName}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(job.runTime).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full bg-${statusColor}-100 text-${statusColor}-800`}>
                          {job.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{job.recordsProcessed}</td>
                      <td className="px-4 py-3 text-sm text-red-600 font-medium">{job.accessRevoked}</td>
                      <td className="px-4 py-3 text-sm text-blue-600 font-medium">{job.notificationsSent}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{job.duration}s</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Edit Config Modal */}
        {selectedConfig && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-2xl p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Configure Automation</h2>

              <div className="space-y-4 mb-6">
                {/* Schedule */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Schedule</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Frequency</label>
                      <select
                        value={selectedConfig.schedule.frequency}
                        onChange={(e) => setSelectedConfig({
                          ...selectedConfig,
                          schedule: { ...selectedConfig.schedule, frequency: e.target.value as any }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                      <input
                        type="time"
                        value={selectedConfig.schedule.time}
                        onChange={(e) => setSelectedConfig({
                          ...selectedConfig,
                          schedule: { ...selectedConfig.schedule, time: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                </div>

                {/* Expiration Settings */}
                {selectedConfig.expirationSettings && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Expiration Settings</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Warning Days Before Expiry
                        </label>
                        <input
                          type="number"
                          value={selectedConfig.expirationSettings.warningDaysBefore}
                          onChange={(e) => setSelectedConfig({
                            ...selectedConfig,
                            expirationSettings: {
                              ...selectedConfig.expirationSettings!,
                              warningDaysBefore: parseInt(e.target.value)
                            }
                          })}
                          className="w-32 px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedConfig.expirationSettings.autoRevokeOnExpiry}
                          onChange={(e) => setSelectedConfig({
                            ...selectedConfig,
                            expirationSettings: {
                              ...selectedConfig.expirationSettings!,
                              autoRevokeOnExpiry: e.target.checked
                            }
                          })}
                          className="w-4 h-4"
                        />
                        <span className="text-sm text-gray-700">Auto-revoke access on expiry</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setSelectedConfig(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveConfig}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Save Configuration
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
