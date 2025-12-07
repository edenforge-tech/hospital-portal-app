import { getApi } from '../api';

// Types
export interface OverviewStats {
  totalTenants: number;
  totalUsers: number;
  totalDepartments: number;
  totalBranches: number;
  activeUsers: number;
  systemHealthStatus: 'healthy' | 'warning' | 'critical';
  last24HoursActivity: number;
}

export interface QuickStats {
  userGrowth: {
    currentMonth: number;
    lastMonth: number;
    percentageChange: number;
  };
  departmentOperations: {
    active: number;
    total: number;
    utilizationRate: number;
  };
  complianceStatus: {
    hipaa: 'compliant' | 'partial' | 'non-compliant';
    nabh: 'compliant' | 'partial' | 'non-compliant';
    dpa: 'compliant' | 'partial' | 'non-compliant';
    overallScore: number;
  };
  systemPerformance: {
    uptime: number;
    responseTime: number;
    errorRate: number;
  };
}

export interface RecentActivity {
  id: string;
  type: 'user_registration' | 'role_assignment' | 'permission_change' | 'admin_action';
  description: string;
  user: string;
  timestamp: string;
  metadata?: any;
}

export interface Alert {
  id: string;
  type: 'password_expiry' | 'compliance_issue' | 'system_alert' | 'failed_login';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  timestamp: string;
  actionRequired: boolean;
  affectedUsers?: number;
}

// API functions
export const dashboardApi = {
  getOverviewStats: async (): Promise<OverviewStats> => {
    const response = await getApi().get('/admin/dashboard/overview');
    return response.data;
  },

  getQuickStats: async (): Promise<QuickStats> => {
    const response = await getApi().get('/admin/dashboard/quick-stats');
    return response.data;
  },

  getRecentActivities: async (limit: number = 10): Promise<RecentActivity[]> => {
    const response = await getApi().get('/admin/dashboard/recent-activities', {
      params: { limit }
    });
    return response.data;
  },

  getAlerts: async (limit: number = 5): Promise<Alert[]> => {
    const response = await getApi().get('/admin/dashboard/alerts', {
      params: { limit }
    });
    return response.data;
  },

  dismissAlert: async (alertId: string): Promise<void> => {
    await getApi().delete(`/admin/dashboard/alerts/${alertId}`);
  },

  getStats: async () => {
    const response = await getApi().get('/admin/dashboard/stats');
    return response.data;
  },
};
