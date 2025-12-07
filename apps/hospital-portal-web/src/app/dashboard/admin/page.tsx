'use client';

import { useAuthStore } from '@/lib/auth-store';
import { dashboardApi, OverviewStats, QuickStats, RecentActivity, Alert } from '@/lib/api/dashboard.api';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { StatCard } from '@/components/ui/StatCard';
import { StatusBadge } from '@/components/ui/StatusBadge';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const router = useRouter();

  const [overviewStats, setOverviewStats] = useState<OverviewStats | null>(null);
  const [quickStats, setQuickStats] = useState<QuickStats | null>(null);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }

    loadDashboardData();
  }, [user, router]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load all dashboard data in parallel
      const [overview, stats, activities, alertsData] = await Promise.all([
        dashboardApi.getOverviewStats(),
        dashboardApi.getQuickStats(),
        dashboardApi.getRecentActivities(10),
        dashboardApi.getAlerts(5),
      ]);

      setOverviewStats(overview);
      setQuickStats(stats);
      setRecentActivities(activities);
      setAlerts(alertsData);
    } catch (err: any) {
      console.error('Error loading dashboard:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard data');
      
      // Set mock data for development
      setOverviewStats({
        totalTenants: 5,
        totalUsers: 250,
        totalDepartments: 45,
        totalBranches: 12,
        activeUsers: 89,
        systemHealthStatus: 'healthy',
        last24HoursActivity: 1234,
      });

      setQuickStats({
        userGrowth: {
          currentMonth: 25,
          lastMonth: 20,
          percentageChange: 25,
        },
        departmentOperations: {
          active: 42,
          total: 45,
          utilizationRate: 93.3,
        },
        complianceStatus: {
          hipaa: 'compliant',
          nabh: 'compliant',
          dpa: 'partial',
          overallScore: 85,
        },
        systemPerformance: {
          uptime: 99.8,
          responseTime: 125,
          errorRate: 0.2,
        },
      });

      setRecentActivities([
        {
          id: '1',
          type: 'user_registration',
          description: 'New user registered: Dr. Sarah Johnson',
          user: 'System',
          timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        },
        {
          id: '2',
          type: 'role_assignment',
          description: 'Assigned Doctor role to John Smith',
          user: 'Admin User',
          timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        },
        {
          id: '3',
          type: 'admin_action',
          description: 'Updated department settings: Cardiology',
          user: 'Admin User',
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        },
      ]);

      setAlerts([
        {
          id: '1',
          type: 'password_expiry',
          severity: 'medium',
          title: 'Password Expiry Warning',
          description: '15 users have passwords expiring in the next 7 days',
          timestamp: new Date().toISOString(),
          actionRequired: true,
          affectedUsers: 15,
        },
        {
          id: '2',
          type: 'compliance_issue',
          severity: 'high',
          title: 'DPA Compliance Issue',
          description: 'Data retention policy needs review',
          timestamp: new Date().toISOString(),
          actionRequired: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleDismissAlert = async (alertId: string) => {
    try {
      await dashboardApi.dismissAlert(alertId);
      setAlerts(alerts.filter((a) => a.id !== alertId));
    } catch (err) {
      console.error('Error dismissing alert:', err);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_registration':
        return '👤';
      case 'role_assignment':
        return '🔐';
      case 'permission_change':
        return '⚙️';
      case 'admin_action':
        return '⚡';
      default:
        return '📋';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'password_expiry':
        return '🔑';
      case 'compliance_issue':
        return '⚠️';
      case 'system_alert':
        return '🔔';
      case 'failed_login':
        return '🚫';
      default:
        return '📢';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user.firstName}! 👋
          </h1>
          <p className="mt-2 text-gray-600">Here's what's happening with your hospital today.</p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-yellow-300 bg-yellow-50 p-4">
            <div className="flex items-center">
              <span className="text-2xl">⚠️</span>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Using Demo Data</h3>
                <p className="mt-1 text-sm text-yellow-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Overview Cards */}
        {overviewStats && (
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Tenants"
              value={overviewStats.totalTenants}
              icon="🏢"
              color="blue"
              onClick={() => router.push('/dashboard/admin/tenants')}
            />
            <StatCard
              title="Total Users"
              value={overviewStats.totalUsers}
              icon="👥"
              color="green"
              subtitle={`${overviewStats.activeUsers} active now`}
              onClick={() => router.push('/dashboard/admin/users')}
            />
            <StatCard
              title="Departments"
              value={overviewStats.totalDepartments}
              icon="🏥"
              color="purple"
              onClick={() => router.push('/dashboard/admin/departments')}
            />
            <StatCard
              title="Branches"
              value={overviewStats.totalBranches}
              icon="📍"
              color="yellow"
              onClick={() => router.push('/dashboard/admin/branches')}
            />
          </div>
        )}

        {/* System Health and Activity */}
        {overviewStats && (
          <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">System Health</h2>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Current Status</p>
                  <div className="mt-2">
                    <StatusBadge status={overviewStats.systemHealthStatus} size="lg" />
                  </div>
                </div>
                <div className="text-6xl">
                  {overviewStats.systemHealthStatus === 'healthy' ? '✅' : '⚠️'}
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Last 24 Hours</h2>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Activities</p>
                  <p className="mt-2 text-3xl font-semibold text-gray-900">
                    {overviewStats.last24HoursActivity.toLocaleString()}
                  </p>
                </div>
                <div className="text-6xl">📊</div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        {quickStats && (
          <div className="mb-8">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">Quick Stats</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-medium text-gray-600">User Growth</p>
                <p className="mt-2 text-2xl font-semibold text-gray-900">
                  +{quickStats.userGrowth.currentMonth}
                </p>
                <p className="mt-1 text-xs text-green-600">
                  ↑ {quickStats.userGrowth.percentageChange}% vs last month
                </p>
              </div>

              <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-medium text-gray-600">Department Operations</p>
                <p className="mt-2 text-2xl font-semibold text-gray-900">
                  {quickStats.departmentOperations.active}/{quickStats.departmentOperations.total}
                </p>
                <p className="mt-1 text-xs text-gray-600">
                  {quickStats.departmentOperations.utilizationRate}% utilization
                </p>
              </div>

              <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-medium text-gray-600">Compliance Score</p>
                <p className="mt-2 text-2xl font-semibold text-gray-900">
                  {quickStats.complianceStatus.overallScore}%
                </p>
                <div className="mt-2 flex gap-2">
                  <StatusBadge status={quickStats.complianceStatus.hipaa} size="sm" />
                  <StatusBadge status={quickStats.complianceStatus.nabh} size="sm" />
                  <StatusBadge status={quickStats.complianceStatus.dpa} size="sm" />
                </div>
              </div>

              <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-medium text-gray-600">System Performance</p>
                <p className="mt-2 text-2xl font-semibold text-gray-900">
                  {quickStats.systemPerformance.uptime}%
                </p>
                <p className="mt-1 text-xs text-gray-600">
                  {quickStats.systemPerformance.responseTime}ms avg response
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Recent Activities and Alerts */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Recent Activities */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Activities</h2>
              <button
                onClick={() => router.push('/dashboard/admin/audit-logs')}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                View All →
              </button>
            </div>
            <div className="space-y-4">
              {recentActivities.length === 0 ? (
                <p className="text-center text-sm text-gray-500">No recent activities</p>
              ) : (
                recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start border-b border-gray-100 pb-4 last:border-0">
                    <div className="text-2xl">{getActivityIcon(activity.type)}</div>
                    <div className="ml-3 flex-1">
                      <p className="text-sm text-gray-900">{activity.description}</p>
                      <div className="mt-1 flex items-center text-xs text-gray-500">
                        <span>{activity.user}</span>
                        <span className="mx-2">•</span>
                        <span>{formatTimeAgo(activity.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Alerts */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Alerts</h2>
              <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
                {alerts.length} Active
              </span>
            </div>
            <div className="space-y-4">
              {alerts.length === 0 ? (
                <div className="text-center">
                  <p className="text-4xl">✅</p>
                  <p className="mt-2 text-sm text-gray-500">No active alerts</p>
                </div>
              ) : (
                alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`rounded-lg border-l-4 p-4 ${
                      alert.severity === 'critical'
                        ? 'border-red-500 bg-red-50'
                        : alert.severity === 'high'
                        ? 'border-orange-500 bg-orange-50'
                        : alert.severity === 'medium'
                        ? 'border-yellow-500 bg-yellow-50'
                        : 'border-blue-500 bg-blue-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start">
                        <div className="text-2xl">{getAlertIcon(alert.type)}</div>
                        <div className="ml-3">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-gray-900">{alert.title}</p>
                            <StatusBadge status={alert.severity} size="sm" />
                          </div>
                          <p className="mt-1 text-sm text-gray-700">{alert.description}</p>
                          {alert.affectedUsers && (
                            <p className="mt-1 text-xs text-gray-600">
                              Affects {alert.affectedUsers} user{alert.affectedUsers > 1 ? 's' : ''}
                            </p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDismissAlert(alert.id)}
                        className="text-gray-400 hover:text-gray-600"
                        title="Dismiss"
                      >
                        ✕
                      </button>
                    </div>
                    {alert.actionRequired && (
                      <button className="mt-3 w-full rounded bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
                        Take Action
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
