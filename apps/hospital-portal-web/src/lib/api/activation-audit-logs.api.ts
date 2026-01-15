import { getApi } from '../api';

export interface ActivationAuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  activationStep: string;
  status: string;
  errorMessage?: string;
  ipAddress: string;
  userAgent?: string;
  deviceInfo?: string;
  geolocationInfo?: string;
  suspiciousActivity: boolean;
  complianceNotes?: string;
  requestData?: string;
  responseData?: string;
  responseTimeMs?: number;
  completedAt?: string;
}

export interface ActivationAuditLogFilters {
  page?: number;
  pageSize?: number;
  search?: string;
  startDate?: string;
  endDate?: string;
  activationStep?: string;
  status?: string;
  suspiciousOnly?: boolean;
  userId?: string;
}

export interface ActivationAuditLogResponse {
  logs: ActivationAuditLog[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export interface ActivationAuditStats {
  totalLogs: number;
  successCount: number;
  failedCount: number;
  suspiciousCount: number;
  successRate: number;
  failureRate: number;
  avgResponseTimeMs: number;
  stepStats: Array<{
    step: string;
    count: number;
    successCount: number;
    failedCount: number;
  }>;
}

export const activationAuditLogsApi = {
  /**
   * Get all activation audit logs with filters
   */
  async getAll(filters?: ActivationAuditLogFilters): Promise<{ data: ActivationAuditLogResponse }> {
    const api = getApi();
    const params = new URLSearchParams();
    
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.pageSize) params.append('pageSize', filters.pageSize.toString());
    if (filters?.search) params.append('search', filters.search);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.activationStep) params.append('activationStep', filters.activationStep);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.suspiciousOnly !== undefined) params.append('suspiciousOnly', filters.suspiciousOnly.toString());
    if (filters?.userId) params.append('userId', filters.userId);

    const queryString = params.toString();
    const url = queryString ? `/activationauditlogs?${queryString}` : '/activationauditlogs';
    
    const response = await api.get(url);
    return { data: response.data };
  },

  /**
   * Get activation audit logs for a specific user
   */
  async getByUser(userId: string, page = 1, pageSize = 25): Promise<{ data: ActivationAuditLogResponse }> {
    const api = getApi();
    const response = await api.get(`/activationauditlogs/user/${userId}?page=${page}&pageSize=${pageSize}`);
    return { data: response.data };
  },

  /**
   * Get activation audit statistics
   */
  async getStats(startDate?: string, endDate?: string): Promise<{ data: ActivationAuditStats }> {
    const api = getApi();
    const params = new URLSearchParams();
    
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const queryString = params.toString();
    const url = queryString ? `/activationauditlogs/stats?${queryString}` : '/activationauditlogs/stats';
    
    const response = await api.get(url);
    return { data: response.data };
  },

  /**
   * Get suspicious activation activities
   */
  async getSuspicious(page = 1, pageSize = 25): Promise<{ data: ActivationAuditLogResponse }> {
    const api = getApi();
    const response = await api.get(`/activationauditlogs/suspicious?page=${page}&pageSize=${pageSize}`);
    return { data: response.data };
  }
};
