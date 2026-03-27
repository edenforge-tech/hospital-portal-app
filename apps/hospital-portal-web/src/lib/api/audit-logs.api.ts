import { getApi } from '../api';

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  entityType: string;
  entityId: string;
  description: string;
  oldValues?: string;
  newValues?: string;
  ipAddress: string;
  severity: string;
  success: boolean;
  details?: string;
}

export interface AuditLogFilters {
  page?: number;
  pageSize?: number;
  search?: string;
  startDate?: string;
  endDate?: string;
  action?: string;
  entityType?: string;
  severity?: string;
  userId?: string;
}

export interface AuditLogResponse {
  logs: AuditLog[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export const auditLogsApi = {
  /**
   * Get all audit logs with filters
   */
  async getAll(filters?: AuditLogFilters): Promise<{ data: AuditLogResponse }> {
    const api = getApi();
    const params = new URLSearchParams();
    
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.pageSize) params.append('pageSize', filters.pageSize.toString());
    if (filters?.search) params.append('search', filters.search);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.action) params.append('action', filters.action);
    if (filters?.entityType) params.append('entityType', filters.entityType);
    if (filters?.severity) params.append('severity', filters.severity);
    if (filters?.userId) params.append('userId', filters.userId);

    const queryString = params.toString();
    const url = queryString ? `/auditlogs?${queryString}` : '/auditlogs';
    
    const response = await api.get(url);
    return { data: response.data };
  },

  /**
   * Get audit logs for a specific user
   */
  async getByUser(userId: string, page = 1, pageSize = 25): Promise<{ data: AuditLogResponse }> {
    const api = getApi();
    const response = await api.get(`/auditlogs/user/${userId}?page=${page}&pageSize=${pageSize}`);
    return { data: response.data };
  },

  /**
   * Get audit logs for a specific entity
   */
  async getByEntity(entityType: string, entityId: string, page = 1, pageSize = 25): Promise<{ data: AuditLogResponse }> {
    const api = getApi();
    const response = await api.get(`/auditlogs/entity/${entityType}/${entityId}?page=${page}&pageSize=${pageSize}`);
    return { data: response.data };
  },

  /**
   * Export audit logs to CSV
   */
  async export(format: 'csv' | 'json', filters?: Omit<AuditLogFilters, 'page' | 'pageSize'>): Promise<{ data: any }> {
    const api = getApi();
    const params = new URLSearchParams();
    
    params.append('format', format);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.action) params.append('action', filters.action);
    if (filters?.entityType) params.append('entityType', filters.entityType);
    if (filters?.severity) params.append('severity', filters.severity);

    const response = await api.get(`/auditlogs/export?${params.toString()}`, {
      responseType: 'blob'
    });
    return { data: response.data };
  },

  /**
   * Get audit log statistics
   */
  async getStats(startDate?: string, endDate?: string): Promise<{ data: any }> {
    const api = getApi();
    const params = new URLSearchParams();
    
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const queryString = params.toString();
    const url = queryString ? `/auditlogs/stats?${queryString}` : '/auditlogs/stats';
    
    const response = await api.get(url);
    return { data: response.data };
  }
};

export const activationAuditLogsApi = {
  /**
   * Get activation audit logs with filters
   */
  async getAll(filters?: any): Promise<{ data: any }> {
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

    const queryString = params.toString();
    const url = queryString ? `/activationauditlogs?${queryString}` : '/activationauditlogs';
    
    const response = await api.get(url);
    return { data: response.data };
  }
};
