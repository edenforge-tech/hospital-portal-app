// Todo #4: Breach Detection Rules Engine with Auto-Alerts
'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, Shield, Bell, Settings, CheckCircle, XCircle } from 'lucide-react';

interface BreachRule {
  id: string;
  name: string;
  description: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  enabled: boolean;
  conditions: string[];
  actions: string[];
  notifyRoles: string[];
}

interface BreachAlert {
  id: string;
  timestamp: string;
  ruleName: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  description: string;
  triggeredBy: string;
  affectedEntities: string[];
  status: 'New' | 'Investigating' | 'Resolved' | 'False Positive';
  assignedTo?: string;
}

export default function BreachDetectionEngine() {
  const [activeTab, setActiveTab] = useState<'alerts' | 'rules'>('alerts');
  const [alerts, setAlerts] = useState<BreachAlert[]>([]);
  const [rules, setRules] = useState<BreachRule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    // In production: load from API
    setAlerts([
      {
        id: '1',
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        ruleName: 'Excessive Failed Login Attempts',
        severity: 'High',
        description: 'User attempted to login 10 times in 5 minutes with incorrect password',
        triggeredBy: 'john.doe@hospital.com',
        affectedEntities: ['User Account'],
        status: 'Investigating',
        assignedTo: 'Security Team',
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        ruleName: 'PHI Access Outside Business Hours',
        severity: 'Medium',
        description: 'PHI accessed at 2:30 AM without emergency access approval',
        triggeredBy: 'jane.smith@hospital.com',
        affectedEntities: ['Patient Records'],
        status: 'New',
      },
    ]);

    setRules([
      {
        id: '1',
        name: 'Excessive Failed Login Attempts',
        description: 'Detects when a user fails to login more than 5 times in 10 minutes',
        severity: 'High',
        enabled: true,
        conditions: ['Failed login attempts > 5', 'Time window: 10 minutes'],
        actions: ['Lock account', 'Notify security team', 'Send email alert'],
        notifyRoles: ['Security Admin', 'Compliance Officer'],
      },
      {
        id: '2',
        name: 'PHI Access Outside Business Hours',
        description: 'Detects PHI access between 10 PM and 6 AM without emergency approval',
        severity: 'Medium',
        enabled: true,
        conditions: ['Time: 10 PM - 6 AM', 'Entity: Patient Record', 'No emergency access'],
        actions: ['Flag for review', 'Notify compliance officer'],
        notifyRoles: ['Compliance Officer', 'Medical Director'],
      },
      {
        id: '3',
        name: 'Bulk Data Export',
        description: 'Detects when a user exports more than 100 patient records at once',
        severity: 'Critical',
        enabled: true,
        conditions: ['Export count > 100', 'Entity: Patient Records'],
        actions: ['Block export', 'Alert security', 'Require approval'],
        notifyRoles: ['Security Admin', 'CTO', 'Compliance Officer'],
      },
      {
        id: '4',
        name: 'Unusual Access Pattern',
        description: 'Detects when a user accesses more than 50 patient records in 1 hour',
        severity: 'High',
        enabled: true,
        conditions: ['Record access > 50', 'Time window: 1 hour'],
        actions: ['Flag for review', 'Notify supervisor'],
        notifyRoles: ['Department Head', 'Compliance Officer'],
      },
      {
        id: '5',
        name: 'Access from Unauthorized Location',
        description: 'Detects access from IP addresses outside allowed ranges',
        severity: 'Critical',
        enabled: false,
        conditions: ['IP not in whitelist', 'User role: Doctor/Nurse'],
        actions: ['Block access', 'Alert security'],
        notifyRoles: ['Security Admin', 'IT Administrator'],
      },
    ]);

    setLoading(false);
  };

  const getSeverityColor = (severity: string) => {
    const colors = {
      Critical: 'bg-red-100 text-red-800 border-red-300',
      High: 'bg-orange-100 text-orange-800 border-orange-300',
      Medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      Low: 'bg-blue-100 text-blue-800 border-blue-300',
    };
    return colors[severity as keyof typeof colors] || colors.Low;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      New: 'bg-red-100 text-red-800',
      Investigating: 'bg-yellow-100 text-yellow-800',
      Resolved: 'bg-green-100 text-green-800',
      'False Positive': 'bg-gray-100 text-gray-800',
    };
    return colors[status as keyof typeof colors] || colors.New;
  };

  const toggleRule = (ruleId: string) => {
    setRules(rules.map(rule => 
      rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
    ));
    // In production: await breachRulesApi.toggle(ruleId);
  };

  const updateAlertStatus = (alertId: string, newStatus: BreachAlert['status']) => {
    setAlerts(alerts.map(alert => 
      alert.id === alertId ? { ...alert, status: newStatus } : alert
    ));
    // In production: await breachAlertsApi.updateStatus(alertId, newStatus);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-red-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Breach Detection Engine</h2>
            <p className="text-sm text-gray-600">Monitor and prevent security breaches in real-time</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-4 py-2 bg-green-100 text-green-800 rounded-lg font-semibold flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            {rules.filter(r => r.enabled).length} Rules Active
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex gap-1">
          <button
            onClick={() => setActiveTab('alerts')}
            className={`px-4 py-3 font-medium text-sm transition-all ${
              activeTab === 'alerts'
                ? 'border-b-2 border-red-500 text-red-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Active Alerts ({alerts.filter(a => a.status === 'New' || a.status === 'Investigating').length})
            </div>
          </button>
          <button
            onClick={() => setActiveTab('rules')}
            className={`px-4 py-3 font-medium text-sm transition-all ${
              activeTab === 'rules'
                ? 'border-b-2 border-red-500 text-red-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Detection Rules ({rules.length})
            </div>
          </button>
        </div>
      </div>

      {/* Alerts Tab */}
      {activeTab === 'alerts' && (
        <div className="space-y-4">
          {alerts.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <p className="text-gray-600 font-medium">No active alerts</p>
              <p className="text-sm text-gray-500 mt-1">Your system is secure</p>
            </div>
          ) : (
            alerts.map((alert) => (
              <div key={alert.id} className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4 hover:shadow-md transition-all">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                    <div>
                      <h3 className="font-semibold text-gray-900">{alert.ruleName}</h3>
                      <p className="text-sm text-gray-600">{alert.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-lg font-semibold border-2 text-sm ${getSeverityColor(alert.severity)}`}>
                      {alert.severity}
                    </span>
                    <span className={`px-3 py-1 rounded-lg font-semibold text-sm ${getStatusColor(alert.status)}`}>
                      {alert.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Triggered By</p>
                    <p className="text-sm font-medium">{alert.triggeredBy}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Timestamp</p>
                    <p className="text-sm font-medium">{new Date(alert.timestamp).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Assigned To</p>
                    <p className="text-sm font-medium">{alert.assignedTo || 'Unassigned'}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => updateAlertStatus(alert.id, 'Investigating')}
                    className="px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 text-white text-sm rounded-lg transition-all"
                  >
                    Investigate
                  </button>
                  <button
                    onClick={() => updateAlertStatus(alert.id, 'Resolved')}
                    className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-all"
                  >
                    Resolve
                  </button>
                  <button
                    onClick={() => updateAlertStatus(alert.id, 'False Positive')}
                    className="px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-lg transition-all"
                  >
                    False Positive
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Rules Tab */}
      {activeTab === 'rules' && (
        <div className="space-y-4">
          {rules.map((rule) => (
            <div key={rule.id} className={`border-2 rounded-lg p-4 ${rule.enabled ? 'bg-white border-green-300' : 'bg-gray-50 border-gray-300'}`}>
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900">{rule.name}</h3>
                    <span className={`px-3 py-1 rounded-lg font-semibold border-2 text-xs ${getSeverityColor(rule.severity)}`}>
                      {rule.severity}
                    </span>
                    {rule.enabled ? (
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-lg font-semibold text-xs flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Enabled
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-lg font-semibold text-xs flex items-center gap-1">
                        <XCircle className="w-3 h-3" />
                        Disabled
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{rule.description}</p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                    <div>
                      <p className="text-xs text-gray-500 mb-2 font-semibold">Conditions</p>
                      <ul className="space-y-1">
                        {rule.conditions.map((condition, index) => (
                          <li key={index} className="text-xs text-gray-700">• {condition}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-2 font-semibold">Actions</p>
                      <ul className="space-y-1">
                        {rule.actions.map((action, index) => (
                          <li key={index} className="text-xs text-gray-700">• {action}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-2 font-semibold">Notify</p>
                      <ul className="space-y-1">
                        {rule.notifyRoles.map((role, index) => (
                          <li key={index} className="text-xs text-gray-700">• {role}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="ml-4">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rule.enabled}
                      onChange={() => toggleRule(rule.id)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
