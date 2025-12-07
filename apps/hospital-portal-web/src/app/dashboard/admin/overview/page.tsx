'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Users, Building2, Briefcase, MapPin, Activity, TrendingUp, 
  AlertTriangle, CheckCircle2, Clock, Shield, Server, Database,
  UserPlus, Key, Settings, XCircle, Bell
} from 'lucide-react';

interface DashboardStats {
  totalTenants: number;
  totalUsers: number;
  totalDepartments: number;
  totalBranches: number;
  activeUsers: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
  last24HourActivities: number;
}

interface QuickStats {
  userGrowthThisMonth: number;
  userGrowthPercentage: number;
  departmentOperations: number;
  complianceStatus: {
    hipaa: boolean;
    nabh: boolean;
    dpa: boolean;
  };
  systemPerformance: {
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
    uptime: string;
  };
}

interface RecentActivity {
  id: number;
  type: 'registration' | 'role_assignment' | 'permission_change' | 'admin_action';
  description: string;
  user: string;
  timestamp: string;
}

interface Alert {
  id: number;
  type: 'password_expiry' | 'compliance' | 'system' | 'security';
  severity: 'info' | 'warning' | 'error';
  title: string;
  description: string;
  count?: number;
  timestamp: string;
}

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalTenants: 0,
    totalUsers: 0,
    totalDepartments: 0,
    totalBranches: 0,
    activeUsers: 0,
    systemHealth: 'healthy',
    last24HourActivities: 0
  });

  const [quickStats, setQuickStats] = useState<QuickStats>({
    userGrowthThisMonth: 0,
    userGrowthPercentage: 0,
    departmentOperations: 0,
    complianceStatus: {
      hipaa: true,
      nabh: true,
      dpa: true
    },
    systemPerformance: {
      cpuUsage: 0,
      memoryUsage: 0,
      diskUsage: 0,
      uptime: '0d 0h'
    }
  });

  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all dashboard data in parallel
      const [statsResponse, quickStatsResponse, activitiesResponse, alertsResponse] = await Promise.all([
        fetch('/api/dashboard/admin/stats'),
        fetch('/api/dashboard/admin/quick-stats'),
        fetch('/api/dashboard/admin/recent-activities'),
        fetch('/api/dashboard/admin/alerts')
      ]);

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      if (quickStatsResponse.ok) {
        const quickStatsData = await quickStatsResponse.json();
        setQuickStats(quickStatsData);
      }

      if (activitiesResponse.ok) {
        const activitiesData = await activitiesResponse.json();
        setRecentActivities(activitiesData);
      }

      if (alertsResponse.ok) {
        const alertsData = await alertsResponse.json();
        setAlerts(alertsData);
      }

      // Mock data for development if API fails
      if (!statsResponse.ok) {
        setStats({
          totalTenants: 12,
          totalUsers: 3847,
          totalDepartments: 156,
          totalBranches: 45,
          activeUsers: 287,
          systemHealth: 'healthy',
          last24HourActivities: 1523
        });
      }

      if (!quickStatsResponse.ok) {
        setQuickStats({
          userGrowthThisMonth: 234,
          userGrowthPercentage: 6.5,
          departmentOperations: 12847,
          complianceStatus: {
            hipaa: true,
            nabh: true,
            dpa: true
          },
          systemPerformance: {
            cpuUsage: 45,
            memoryUsage: 62,
            diskUsage: 38,
            uptime: '45d 12h'
          }
        });
      }

      if (!activitiesResponse.ok) {
        setRecentActivities([
          {
            id: 1,
            type: 'registration',
            description: 'New user registered',
            user: 'Dr. Sarah Johnson',
            timestamp: '5 minutes ago'
          },
          {
            id: 2,
            type: 'role_assignment',
            description: 'Assigned role "Doctor" to user',
            user: 'Admin User',
            timestamp: '12 minutes ago'
          },
          {
            id: 3,
            type: 'permission_change',
            description: 'Updated permissions for "Nurse" role',
            user: 'System Admin',
            timestamp: '1 hour ago'
          },
          {
            id: 4,
            type: 'admin_action',
            description: 'Created new department "Neurology"',
            user: 'Hospital Admin',
            timestamp: '2 hours ago'
          }
        ]);
      }

      if (!alertsResponse.ok) {
        setAlerts([
          {
            id: 1,
            type: 'password_expiry',
            severity: 'warning',
            title: 'Password Expiry Warning',
            description: '23 users have passwords expiring in the next 7 days',
            count: 23,
            timestamp: '10 minutes ago'
          },
          {
            id: 2,
            type: 'security',
            severity: 'error',
            title: 'Failed Login Attempts',
            description: '15 failed login attempts detected from IP 192.168.1.100',
            count: 15,
            timestamp: '30 minutes ago'
          },
          {
            id: 3,
            type: 'system',
            severity: 'info',
            title: 'System Update Available',
            description: 'A new system update is available for installation',
            timestamp: '1 hour ago'
          }
        ]);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'critical': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'healthy': return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'critical': return <XCircle className="h-5 w-5 text-red-500" />;
      default: return <Activity className="h-5 w-5 text-gray-500" />;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'registration': return <UserPlus className="h-4 w-4" />;
      case 'role_assignment': return <Users className="h-4 w-4" />;
      case 'permission_change': return <Key className="h-4 w-4" />;
      case 'admin_action': return <Settings className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'password_expiry': return <Clock className="h-4 w-4" />;
      case 'compliance': return <Shield className="h-4 w-4" />;
      case 'system': return <Server className="h-4 w-4" />;
      case 'security': return <AlertTriangle className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Hospital Portal System Overview
          </p>
        </div>
        <div className="flex items-center gap-2">
          {getHealthIcon(stats.systemHealth)}
          <span className={`font-semibold ${getHealthColor(stats.systemHealth)}`}>
            System {stats.systemHealth.charAt(0).toUpperCase() + stats.systemHealth.slice(1)}
          </span>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tenants</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTenants}</div>
            <p className="text-xs text-muted-foreground">
              Hospital organizations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500">{stats.activeUsers}</span> currently active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Departments</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDepartments}</div>
            <p className="text-xs text-muted-foreground">
              Across all branches
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Branches</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBranches}</div>
            <p className="text-xs text-muted-foreground">
              Physical locations
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Activity Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle>Last 24 Hours Activity</CardTitle>
          <CardDescription>System-wide activity summary</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold text-blue-600">
            {stats.last24HourActivities.toLocaleString()}
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Total actions performed across the system
          </p>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* User Growth */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">User Growth (This Month)</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quickStats.userGrowthThisMonth}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500">+{quickStats.userGrowthPercentage}%</span> from last month
            </p>
            <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-500 transition-all"
                style={{ width: `${quickStats.userGrowthPercentage * 10}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Department Operations */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Department Operations</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quickStats.departmentOperations.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Total operations this month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Status & System Performance */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Compliance Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Compliance Status
            </CardTitle>
            <CardDescription>Regulatory compliance overview</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-medium">HIPAA</span>
                <Badge variant={quickStats.complianceStatus.hipaa ? "default" : "destructive"}>
                  {quickStats.complianceStatus.hipaa ? "Compliant" : "Non-Compliant"}
                </Badge>
              </div>
              {quickStats.complianceStatus.hipaa ? 
                <CheckCircle2 className="h-5 w-5 text-green-500" /> : 
                <XCircle className="h-5 w-5 text-red-500" />
              }
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-medium">NABH</span>
                <Badge variant={quickStats.complianceStatus.nabh ? "default" : "destructive"}>
                  {quickStats.complianceStatus.nabh ? "Compliant" : "Non-Compliant"}
                </Badge>
              </div>
              {quickStats.complianceStatus.nabh ? 
                <CheckCircle2 className="h-5 w-5 text-green-500" /> : 
                <XCircle className="h-5 w-5 text-red-500" />
              }
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-medium">DPA</span>
                <Badge variant={quickStats.complianceStatus.dpa ? "default" : "destructive"}>
                  {quickStats.complianceStatus.dpa ? "Compliant" : "Non-Compliant"}
                </Badge>
              </div>
              {quickStats.complianceStatus.dpa ? 
                <CheckCircle2 className="h-5 w-5 text-green-500" /> : 
                <XCircle className="h-5 w-5 text-red-500" />
              }
            </div>
          </CardContent>
        </Card>

        {/* System Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              System Performance
            </CardTitle>
            <CardDescription>Real-time system metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">CPU Usage</span>
                <span className="text-sm text-muted-foreground">{quickStats.systemPerformance.cpuUsage}%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all ${
                    quickStats.systemPerformance.cpuUsage > 80 ? 'bg-red-500' : 
                    quickStats.systemPerformance.cpuUsage > 60 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${quickStats.systemPerformance.cpuUsage}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Memory Usage</span>
                <span className="text-sm text-muted-foreground">{quickStats.systemPerformance.memoryUsage}%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all ${
                    quickStats.systemPerformance.memoryUsage > 80 ? 'bg-red-500' : 
                    quickStats.systemPerformance.memoryUsage > 60 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${quickStats.systemPerformance.memoryUsage}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Disk Usage</span>
                <span className="text-sm text-muted-foreground">{quickStats.systemPerformance.diskUsage}%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all ${
                    quickStats.systemPerformance.diskUsage > 80 ? 'bg-red-500' : 
                    quickStats.systemPerformance.diskUsage > 60 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${quickStats.systemPerformance.diskUsage}%` }}
                />
              </div>
            </div>
            <div className="flex items-center justify-between pt-2 border-t">
              <span className="text-sm font-medium">System Uptime</span>
              <Badge variant="outline">{quickStats.systemPerformance.uptime}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities & Alerts */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>Latest system activities</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="users">Users</TabsTrigger>
                <TabsTrigger value="roles">Roles</TabsTrigger>
                <TabsTrigger value="admin">Admin</TabsTrigger>
              </TabsList>
              <TabsContent value="all" className="space-y-4 mt-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="mt-0.5">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">{activity.description}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{activity.user}</span>
                        <span>•</span>
                        <span>{activity.timestamp}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </TabsContent>
              <TabsContent value="users">
                {recentActivities.filter(a => a.type === 'registration').map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50">
                    <UserPlus className="h-4 w-4 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.description}</p>
                      <p className="text-xs text-muted-foreground">{activity.user} • {activity.timestamp}</p>
                    </div>
                  </div>
                ))}
              </TabsContent>
              <TabsContent value="roles">
                {recentActivities.filter(a => a.type === 'role_assignment' || a.type === 'permission_change').map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50">
                    {getActivityIcon(activity.type)}
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.description}</p>
                      <p className="text-xs text-muted-foreground">{activity.user} • {activity.timestamp}</p>
                    </div>
                  </div>
                ))}
              </TabsContent>
              <TabsContent value="admin">
                {recentActivities.filter(a => a.type === 'admin_action').map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50">
                    <Settings className="h-4 w-4 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.description}</p>
                      <p className="text-xs text-muted-foreground">{activity.user} • {activity.timestamp}</p>
                    </div>
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>System Alerts</CardTitle>
            <CardDescription>Important notifications and warnings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {alerts.map((alert) => (
              <Alert key={alert.id} variant={alert.severity === 'error' ? 'destructive' : 'default'}>
                <div className="flex items-start gap-3">
                  {getAlertIcon(alert.type)}
                  <div className="flex-1">
                    <AlertTitle className="flex items-center gap-2">
                      {alert.title}
                      {alert.count && (
                        <Badge variant={alert.severity === 'error' ? 'destructive' : 'secondary'}>
                          {alert.count}
                        </Badge>
                      )}
                    </AlertTitle>
                    <AlertDescription className="mt-1">
                      {alert.description}
                    </AlertDescription>
                    <p className="text-xs text-muted-foreground mt-2">{alert.timestamp}</p>
                  </div>
                </div>
              </Alert>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
