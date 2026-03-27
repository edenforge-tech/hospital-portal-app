// Breach Detection Alerts Component
// Detects and displays unusual access patterns that may indicate security breaches

'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, TrendingUp, Clock, MapPin, Shield, RefreshCw } from 'lucide-react';
import { getApi } from '@/lib/api';

interface BreachAlert {
  id: string;
  timestamp: string;
  alertType: 'high_volume' | 'after_hours' | 'geographic_anomaly' | 'failed_attempts' | 'suspicious_query' | 'bulk_export';
  severity: 'critical' | 'high' | 'medium';
  userId: string;
  userName: string;
  description: string;
  details: string;
  ipAddress: string;
  location?: string;
  recordsAccessed?: number;
  status: 'new' | 'investigating' | 'resolved' | 'false_positive';
}

interface BreachDetectionAlertsProps {
  tenantId: string;
}

export default function BreachDetectionAlerts({ tenantId }: BreachDetectionAlertsProps) {
  const [alerts, setAlerts] = useState<BreachAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [alertTypeFilter, setAlertTypeFilter] = useState<string>('');

  useEffect(() => {
    loadBreachAlerts();
  }, [severityFilter, statusFilter, alertTypeFilter]);

  const loadBreachAlerts = async () => {
    try {
      setLoading(true);
      setError('');

      const api = getApi();
      const params: any = {};
      
      if (severityFilter) params.severity = severityFilter;
      if (statusFilter) params.status = statusFilter;
      if (alertTypeFilter) params.alertType = alertTypeFilter;

      const response = await api.get('/auditlogs/breach-detection', { params });
      
      setAlerts(response.data.alerts || []);
    } catch (err: any) {
      console.error('Error loading breach alerts:', err);
      setError(err.response?.data?.message || 'Failed to load breach detection alerts');
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'high_volume':
        return <TrendingUp className="text-red-500" size={20} />;
      case 'after_hours':
        return <Clock className="text-orange-500" size={20} />;
      case 'geographic_anomaly':
        return <MapPin className="text-red-500" size={20} />;
      case 'failed_attempts':
        return <Shield className="text-yellow-500" size={20} />;
      case 'suspicious_query':
        return <AlertTriangle className="text-orange-500" size={20} />;
      case 'bulk_export':
        return <TrendingUp className="text-red-500" size={20} />;
      default:
        return <AlertTriangle className="text-gray-500" size={20} />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-red-100 text-red-800';
      case 'investigating':
        return 'bg-yellow-100 text-yellow-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'false_positive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatAlertType = (type: string) => {
    return type
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const filteredAlerts = alerts.filter((alert) => {
    if (severityFilter && alert.severity !== severityFilter) return false;
    if (statusFilter && alert.status !== statusFilter) return false;
    if (alertTypeFilter && alert.alertType !== alertTypeFilter) return false;
    return true;
  });

  const criticalCount = alerts.filter((a) => a.severity === 'critical' && a.status === 'new').length;
  const highCount = alerts.filter((a) => a.severity === 'high' && a.status === 'new').length;

  return (
    <div className="space-y-6">
      {/* Header with Statistics */}
      <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-6 border border-red-200">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <AlertTriangle className="mr-3 text-red-600" size={28} />
              Breach Detection & Security Alerts
            </h2>
            <p className="text-gray-600 mt-2">
              Real-time monitoring of suspicious access patterns and potential security breaches
            </p>
          </div>
          <button
            onClick={loadBreachAlerts}
            className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            <RefreshCw size={18} className="mr-2" />
            Refresh
          </button>
        </div>

        {/* Alert Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Critical Alerts</p>
                <p className="text-3xl font-bold text-red-600">{criticalCount}</p>
              </div>
              <AlertTriangle className="text-red-500" size={32} />
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">High Priority</p>
                <p className="text-3xl font-bold text-orange-600">{highCount}</p>
              </div>
              <Shield className="text-orange-500" size={32} />
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Investigating</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {alerts.filter((a) => a.status === 'investigating').length}
                </p>
              </div>
              <Clock className="text-yellow-500" size={32} />
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Alerts</p>
                <p className="text-3xl font-bold text-gray-700">{alerts.length}</p>
              </div>
              <TrendingUp className="text-gray-500" size={32} />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
            >
              <option value="">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
            >
              <option value="">All Statuses</option>
              <option value="new">New</option>
              <option value="investigating">Investigating</option>
              <option value="resolved">Resolved</option>
              <option value="false_positive">False Positive</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Alert Type</label>
            <select
              value={alertTypeFilter}
              onChange={(e) => setAlertTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
            >
              <option value="">All Types</option>
              <option value="high_volume">High Volume Access</option>
              <option value="after_hours">After Hours Access</option>
              <option value="geographic_anomaly">Geographic Anomaly</option>
              <option value="failed_attempts">Failed Login Attempts</option>
              <option value="suspicious_query">Suspicious Query</option>
              <option value="bulk_export">Bulk Export</option>
            </select>
          </div>
        </div>
      </div>

      {/* Alerts List */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">{error}</div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          <span className="ml-3 text-gray-600">Loading breach alerts...</span>
        </div>
      ) : filteredAlerts.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center text-gray-500">
          No breach alerts found
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${
                alert.severity === 'critical'
                  ? 'border-red-500'
                  : alert.severity === 'high'
                  ? 'border-orange-500'
                  : 'border-yellow-500'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="mt-1">{getAlertIcon(alert.alertType)}</div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{alert.description}</h3>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(
                          alert.severity
                        )} border`}
                      >
                        {alert.severity.toUpperCase()}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(alert.status)}`}>
                        {alert.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>

                    <p className="text-sm text-gray-700 mb-3">{alert.details}</p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">User</p>
                        <p className="font-medium text-gray-900">{alert.userName}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Type</p>
                        <p className="font-medium text-gray-900">{formatAlertType(alert.alertType)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">IP Address</p>
                        <p className="font-mono text-gray-900">{alert.ipAddress}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Timestamp</p>
                        <p className="text-gray-900">{new Date(alert.timestamp).toLocaleString()}</p>
                      </div>
                      {alert.location && (
                        <div>
                          <p className="text-gray-500">Location</p>
                          <p className="text-gray-900">{alert.location}</p>
                        </div>
                      )}
                      {alert.recordsAccessed && (
                        <div>
                          <p className="text-gray-500">Records Accessed</p>
                          <p className="font-bold text-red-600">{alert.recordsAccessed}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col space-y-2 ml-4">
                  <button className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition">
                    Investigate
                  </button>
                  <button className="px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300 transition">
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
