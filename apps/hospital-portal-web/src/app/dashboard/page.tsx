'use client';

import { useEffect, useState } from 'react';
import { dashboardApi, OverviewStats, QuickStats, RecentActivity, Alert } from '@/lib/api/dashboard.api';
import { AlertTriangle, Activity, Users, Building2, CheckCircle, XCircle, Clock, TrendingUp, TrendingDown } from 'lucide-react';

export default function DashboardHome() {
  const [overviewStats, setOverviewStats] = useState<OverviewStats | null>(null);
  const [quickStats, setQuickStats] = useState<QuickStats | null>(null);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [overview, quick, activities, alertsData] = await Promise.all([
        dashboardApi.getOverviewStats().catch(() => null),
        dashboardApi.getQuickStats().catch(() => null),
        dashboardApi.getRecentActivities(10).catch(() => []),
        dashboardApi.getAlerts(5).catch(() => [])
      ]);

      setOverviewStats(overview);
      setQuickStats(quick);
      setRecentActivities(activities);
      setAlerts(alertsData);
    } catch (err: any) {
      console.error('Failed to load dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleDismissAlert = async (alertId: string) => {
    try {
      await dashboardApi.dismissAlert(alertId);
      setAlerts(alerts.filter(a => a.id !== alertId));
    } catch (err) {
      console.error('Failed to dismiss alert:', err);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_registration': return <Users className="h-4 w-4" />;
      case 'role_assignment': return <CheckCircle className="h-4 w-4" />;
      case 'permission_change': return <AlertTriangle className="h-4 w-4" />;
      case 'admin_action': return <Activity className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening in your hospital.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          {error}
        </div>
      )}

      {/* Overview Stats */}
      {overviewStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-3xl font-bold text-blue-600">{overviewStats.totalUsers}</p>
                <p className="text-xs text-gray-500 mt-1">{overviewStats.activeUsers} active</p>
              </div>
              <Users className="h-12 w-12 text-blue-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Departments</p>
                <p className="text-3xl font-bold text-green-600">{overviewStats.totalDepartments}</p>
                <p className="text-xs text-gray-500 mt-1">Across all branches</p>
              </div>
              <Building2 className="h-12 w-12 text-green-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Branches</p>
                <p className="text-3xl font-bold text-purple-600">{overviewStats.totalBranches}</p>
                <p className="text-xs text-gray-500 mt-1">{overviewStats.totalTenants} tenant(s)</p>
              </div>
              <Building2 className="h-12 w-12 text-purple-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-indigo-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">System Health</p>
                <p className={`text-3xl font-bold ${
                  overviewStats.systemHealthStatus === 'healthy' ? 'text-green-600' :
                  overviewStats.systemHealthStatus === 'warning' ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {overviewStats.systemHealthStatus === 'healthy' ? '✓' :
                   overviewStats.systemHealthStatus === 'warning' ? '!' : '✗'}
                </p>
                <p className="text-xs text-gray-500 mt-1 capitalize">{overviewStats.systemHealthStatus}</p>
              </div>
              <Activity className="h-12 w-12 text-indigo-500 opacity-20" />
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      {quickStats && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Growth */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">User Growth</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">This Month</span>
                <span className="text-lg font-bold">{quickStats.userGrowth.currentMonth}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Last Month</span>
                <span className="text-lg">{quickStats.userGrowth.lastMonth}</span>
              </div>
              <div className={`flex items-center gap-2 ${
                quickStats.userGrowth.percentageChange >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {quickStats.userGrowth.percentageChange >= 0 ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                <span className="text-sm font-semibold">
                  {Math.abs(quickStats.userGrowth.percentageChange).toFixed(1)}% 
                  {quickStats.userGrowth.percentageChange >= 0 ? ' increase' : ' decrease'}
                </span>
              </div>
            </div>
          </div>

          {/* Department Operations */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Department Operations</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Active</span>
                <span className="text-lg font-bold text-green-600">{quickStats.departmentOperations.active}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total</span>
                <span className="text-lg">{quickStats.departmentOperations.total}</span>
              </div>
              <div className="mt-2">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600">Utilization</span>
                  <span className="font-semibold">{quickStats.departmentOperations.utilizationRate.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all"
                    style={{ width: `${quickStats.departmentOperations.utilizationRate}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Compliance Status */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Compliance Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">HIPAA</span>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                  quickStats.complianceStatus.hipaa === 'compliant' ? 'bg-green-100 text-green-800' :
                  quickStats.complianceStatus.hipaa === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {quickStats.complianceStatus.hipaa}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">NABH</span>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                  quickStats.complianceStatus.nabh === 'compliant' ? 'bg-green-100 text-green-800' :
                  quickStats.complianceStatus.nabh === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {quickStats.complianceStatus.nabh}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">DPA</span>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                  quickStats.complianceStatus.dpa === 'compliant' ? 'bg-green-100 text-green-800' :
                  quickStats.complianceStatus.dpa === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {quickStats.complianceStatus.dpa}
                </span>
              </div>
              <div className="pt-2 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700">Overall Score</span>
                  <span className="text-lg font-bold text-indigo-600">{quickStats.complianceStatus.overallScore}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Active Alerts
          </h3>
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded border ${getSeverityColor(alert.severity)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">{alert.title}</span>
                      <span className="text-xs px-2 py-1 rounded bg-white bg-opacity-50">
                        {alert.severity}
                      </span>
                    </div>
                    <p className="text-sm mb-2">{alert.description}</p>
                    <div className="flex items-center gap-4 text-xs">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(alert.timestamp).toLocaleString()}
                      </span>
                      {alert.affectedUsers && (
                        <span>{alert.affectedUsers} user(s) affected</span>
                      )}
                      {alert.actionRequired && (
                        <span className="font-semibold">Action Required</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDismissAlert(alert.id)}
                    className="ml-4 text-gray-500 hover:text-gray-700"
                  >
                    <XCircle className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activities */}
      {recentActivities.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {recentActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded"
              >
                <div className="mt-1 p-2 bg-blue-100 text-blue-600 rounded-full">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                    <span>{activity.user}</span>
                    <span>•</span>
                    <span>{new Date(activity.timestamp).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && !overviewStats && (
        <div className="bg-white p-12 rounded-lg shadow text-center">
          <Activity className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No Dashboard Data Available</h3>
          <p className="text-gray-500">Dashboard statistics will appear here once data is available.</p>
        </div>
      )}
    </div>
  );
}
