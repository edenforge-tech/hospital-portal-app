import { getApi } from '../api';

export interface DashboardOverview {
  totalPatients: number;
  totalAppointments: number;
  totalEmployees: number;
  activeDepartments: number;
}

export interface QuickStats {
  todayAppointments: number;
  pendingApprovals: number;
  activeTrainings: number;
  expiringLicenses: number;
}

export interface TrendData {
  date: string;
  value: number;
  label?: string;
}

export interface DistributionData {
  category: string;
  count: number;
  percentage: number;
}

/**
 * Analytics API Client
 * Dashboard statistics and insights
 */
export const analyticsApi = {
  /**
   * Get dashboard overview statistics
   */
  async getOverview(): Promise<{ data: DashboardOverview }> {
    return getApi().get('/dashboard/overview');
  },

  /**
   * Get quick statistics
   */
  async getQuickStats(): Promise<{ data: QuickStats }> {
    return getApi().get('/dashboard/quick-stats');
  },

  /**
   * Get appointment trends
   */
  async getAppointmentTrends(days: number = 30): Promise<{ data: TrendData[] }> {
    return getApi().get('/dashboard/stats/appointment-trends', { params: { days } });
  },

  /**
   * Get patient distribution by department
   */
  async getPatientDistribution(): Promise<{ data: DistributionData[] }> {
    return getApi().get('/dashboard/stats/patient-distribution');
  },

  /**
   * Get employee performance metrics
   */
  async getEmployeeMetrics(): Promise<{ data: any }> {
    return getApi().get('/dashboard/stats/employee-metrics');
  },

  /**
   * Get department performance
   */
  async getDepartmentPerformance(): Promise<{ data: DistributionData[] }> {
    return getApi().get('/dashboard/stats/department-performance');
  }
};
