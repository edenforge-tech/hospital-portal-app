'use client';

import { useEffect, useState } from 'react';
import { deviceManagementApi, DeviceAnalytics, DeviceSecurityMetrics } from '@/lib/api/device-management.api';
import { 
  Shield, 
  Smartphone, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Monitor,
  Tablet,
  BarChart3
} from 'lucide-react';

export default function DeviceAnalyticsPage() {
  const [analytics, setAnalytics] = useState<DeviceAnalytics | null>(null);
  const [securityMetrics, setSecurityMetrics] = useState<DeviceSecurityMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const [analyticsResponse, securityResponse] = await Promise.all([
        deviceManagementApi.getAnalytics(),
        deviceManagementApi.getSecurityMetrics()
      ]);
      setAnalytics(analyticsResponse.data);
      setSecurityMetrics(securityResponse.data);
    } catch (err: any) {
      console.error('Error loading analytics:', err);
      setError(err.response?.data?.message || 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow h-32"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-700">{error}</p>
                <button
                  onClick={loadAnalytics}
                  className="mt-2 text-sm text-red-600 underline hover:text-red-500"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Device Analytics</h1>
            <p className="text-gray-600">Monitor device usage, security, and trends</p>
          </div>
          <button
            onClick={loadAnalytics}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Refresh Data
          </button>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Smartphone className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">{analytics?.totalDevices}</h3>
                <p className="text-gray-600">Total Devices</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">{analytics?.activeDevices}</h3>
                <p className="text-gray-600">Active Devices</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Shield className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">{analytics?.trustedDevices}</h3>
                <p className="text-gray-600">Trusted Devices</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">{analytics?.blockedDevices}</h3>
                <p className="text-gray-600">Blocked Devices</p>
              </div>
            </div>
          </div>
        </div>

        {/* Security Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Overview</h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Security Incidents</span>
                <span className="font-semibold text-red-600">{securityMetrics?.securityIncidents}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Blocked Attempts</span>
                <span className="font-semibold text-orange-600">{securityMetrics?.blockedAttempts}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Suspicious Logins</span>
                <span className="font-semibold text-yellow-600">{securityMetrics?.suspiciousLogins}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Avg Trust Score</span>
                <span className="font-semibold text-green-600">{securityMetrics?.trustScoreAverage.toFixed(1)}%</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Device Distribution</h3>
            <div className="space-y-3">
              {Object.entries(analytics?.deviceTypeDistribution || {}).map(([type, count]) => (
                <div key={type} className="flex justify-between items-center">
                  <div className="flex items-center">
                    {type.toLowerCase().includes('mobile') || type.toLowerCase().includes('phone') ? (
                      <Smartphone className="h-4 w-4 text-blue-500 mr-2" />
                    ) : type.toLowerCase().includes('tablet') ? (
                      <Tablet className="h-4 w-4 text-green-500 mr-2" />
                    ) : (
                      <Monitor className="h-4 w-4 text-gray-500 mr-2" />
                    )}
                    <span className="text-gray-600">{type}</span>
                  </div>
                  <span className="font-semibold">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Trust Level Distribution */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Trust Level Distribution</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(analytics?.trustLevelDistribution || {}).map(([level, count]) => (
              <div key={level} className="text-center p-4 bg-gray-50 rounded-lg">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-2 ${
                  level === 'Verified' ? 'bg-green-100 text-green-600' :
                  level === 'Trusted' ? 'bg-yellow-100 text-yellow-600' :
                  'bg-red-100 text-red-600'
                }`}>
                  <Shield className="h-6 w-6" />
                </div>
                <div className="text-2xl font-bold">{count}</div>
                <div className="text-sm text-gray-600">{level}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Registration Trends */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Registration Trends (Last 6 Months)</h3>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            {Object.entries(analytics?.monthlyRegistrations || {}).map(([month, count]) => (
              <div key={month} className="text-center p-3 bg-gray-50 rounded">
                <div className="text-lg font-bold text-indigo-600">{count}</div>
                <div className="text-xs text-gray-600">{month}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Block Reasons */}
        {securityMetrics?.blockReasons && Object.keys(securityMetrics.blockReasons).length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Block Reasons</h3>
            <div className="space-y-3">
              {Object.entries(securityMetrics.blockReasons).map(([reason, count]) => (
                <div key={reason} className="flex justify-between items-center">
                  <span className="text-gray-600">{reason}</span>
                  <span className="font-semibold text-red-600">{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Key Insights */}
        <div className="bg-white p-6 rounded-lg shadow mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900">Average Devices per User</h4>
              <p className="text-blue-800">{analytics?.averageDevicesPerUser.toFixed(1)} devices</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-900">Most Active Device Types</h4>
              <p className="text-green-800">{analytics?.mostActiveDeviceTypes.join(', ')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}