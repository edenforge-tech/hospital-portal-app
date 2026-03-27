import { getApi } from '../api';

// ============================================================================
// Types
// ============================================================================

export interface AuditLog {
  id: string;
  tenantId: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  userRole?: string;
  action: AuditAction;
  category: AuditCategory;
  entityType: string;
  entityId?: string;
  entityName?: string;
  description: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  changedFields?: string[];
  metadata: {
    ipAddress?: string;
    userAgent?: string;
    sessionId?: string;
    requestId?: string;
    endpoint?: string;
    method?: string;
    statusCode?: number;
    duration?: number;
    location?: {
      country?: string;
      city?: string;
      coordinates?: { lat: number; lng: number };
    };
  };
  severity: 'info' | 'warning' | 'error' | 'critical';
  status: 'success' | 'failure' | 'pending';
  errorMessage?: string;
  correlationId?: string;
  parentLogId?: string;
  branchId?: string;
  branchName?: string;
  timestamp: string;
}

export type AuditAction =
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'login'
  | 'logout'
  | 'login_failed'
  | 'password_change'
  | 'password_reset'
  | 'permission_change'
  | 'role_change'
  | 'export'
  | 'import'
  | 'print'
  | 'download'
  | 'upload'
  | 'share'
  | 'approve'
  | 'reject'
  | 'archive'
  | 'restore'
  | 'bulk_operation'
  | 'config_change'
  | 'system_event';

export type AuditCategory =
  | 'authentication'
  | 'authorization'
  | 'patient_data'
  | 'clinical_data'
  | 'financial_data'
  | 'administrative'
  | 'system_config'
  | 'user_management'
  | 'document'
  | 'communication'
  | 'integration'
  | 'security'
  | 'compliance';

export interface AuditLogListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  userId?: string;
  action?: string;
  category?: string;
  entityType?: string;
  entityId?: string;
  severity?: string;
  status?: string;
  branchId?: string;
  dateFrom?: string;
  dateTo?: string;
  ipAddress?: string;
  correlationId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface AuditSummary {
  totalEvents: number;
  eventsByCategory: Record<AuditCategory, number>;
  eventsByAction: Record<AuditAction, number>;
  eventsBySeverity: Record<string, number>;
  eventsByStatus: Record<string, number>;
  topUsers: { userId: string; userName: string; eventCount: number }[];
  topEntities: { entityType: string; eventCount: number }[];
  recentSecurityEvents: AuditLog[];
  failedLoginAttempts: number;
  dataAccessEvents: number;
  configurationChanges: number;
}

export interface AuditReport {
  id: string;
  tenantId: string;
  name: string;
  type: 'compliance' | 'security' | 'activity' | 'access' | 'custom';
  description?: string;
  filters: AuditLogListParams;
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    time: string;
    recipients: string[];
    format: 'pdf' | 'csv' | 'excel';
  };
  lastGeneratedAt?: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditRetentionPolicy {
  id: string;
  tenantId: string;
  category: AuditCategory;
  retentionDays: number;
  archiveAfterDays?: number;
  archiveLocation?: string;
  isActive: boolean;
  lastPurgedAt?: string;
  lastArchivedAt?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ============================================================================
// Audit Logs API
// ============================================================================

export const auditLogsApi = {
  list: async (params?: AuditLogListParams): Promise<PaginatedResponse<AuditLog>> => {
    const api = getApi();
    const response = await api.get('/audit/logs', { params });
    return response.data;
  },

  get: async (id: string): Promise<AuditLog> => {
    const api = getApi();
    const response = await api.get(`/audit/logs/${id}`);
    return response.data;
  },

  getByCorrelation: async (correlationId: string): Promise<AuditLog[]> => {
    const api = getApi();
    const response = await api.get(`/audit/logs/correlation/${correlationId}`);
    return response.data;
  },

  getByEntity: async (entityType: string, entityId: string, params?: { page?: number; pageSize?: number }): Promise<PaginatedResponse<AuditLog>> => {
    const api = getApi();
    const response = await api.get(`/audit/logs/entity/${entityType}/${entityId}`, { params });
    return response.data;
  },

  getByUser: async (userId: string, params?: AuditLogListParams): Promise<PaginatedResponse<AuditLog>> => {
    const api = getApi();
    const response = await api.get(`/audit/logs/user/${userId}`, { params });
    return response.data;
  },

  getSummary: async (params?: { dateFrom?: string; dateTo?: string; branchId?: string }): Promise<AuditSummary> => {
    const api = getApi();
    const response = await api.get('/audit/summary', { params });
    return response.data;
  },

  getTimeline: async (entityType: string, entityId: string): Promise<AuditLog[]> => {
    const api = getApi();
    const response = await api.get(`/audit/timeline/${entityType}/${entityId}`);
    return response.data;
  },

  getSecurityEvents: async (params?: { severity?: string; dateFrom?: string; dateTo?: string }): Promise<AuditLog[]> => {
    const api = getApi();
    const response = await api.get('/audit/security-events', { params });
    return response.data;
  },

  getLoginHistory: async (userId?: string, params?: { page?: number; pageSize?: number }): Promise<PaginatedResponse<AuditLog>> => {
    const api = getApi();
    const response = await api.get('/audit/login-history', { params: { userId, ...params } });
    return response.data;
  },

  getDataAccessLog: async (params?: AuditLogListParams): Promise<PaginatedResponse<AuditLog>> => {
    const api = getApi();
    const response = await api.get('/audit/data-access', { params });
    return response.data;
  },

  export: async (params: AuditLogListParams & { format: 'csv' | 'pdf' | 'excel' }): Promise<Blob> => {
    const api = getApi();
    const response = await api.get('/audit/logs/export', { params, responseType: 'blob' });
    return response.data;
  },

  search: async (query: string, params?: AuditLogListParams): Promise<PaginatedResponse<AuditLog>> => {
    const api = getApi();
    const response = await api.get('/audit/logs/search', { params: { query, ...params } });
    return response.data;
  },
};

// ============================================================================
// Audit Reports API
// ============================================================================

export const auditReportsApi = {
  list: async (): Promise<AuditReport[]> => {
    const api = getApi();
    const response = await api.get('/audit/reports');
    return response.data;
  },

  get: async (id: string): Promise<AuditReport> => {
    const api = getApi();
    const response = await api.get(`/audit/reports/${id}`);
    return response.data;
  },

  create: async (data: Omit<AuditReport, 'id' | 'tenantId' | 'lastGeneratedAt' | 'createdById' | 'createdAt' | 'updatedAt'>): Promise<AuditReport> => {
    const api = getApi();
    const response = await api.post('/audit/reports', data);
    return response.data;
  },

  update: async (id: string, data: Partial<AuditReport>): Promise<AuditReport> => {
    const api = getApi();
    const response = await api.put(`/audit/reports/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    const api = getApi();
    await api.delete(`/audit/reports/${id}`);
  },

  generate: async (id: string, format: 'pdf' | 'csv' | 'excel'): Promise<Blob> => {
    const api = getApi();
    const response = await api.post(`/audit/reports/${id}/generate`, { format }, { responseType: 'blob' });
    return response.data;
  },

  preview: async (id: string): Promise<PaginatedResponse<AuditLog>> => {
    const api = getApi();
    const response = await api.get(`/audit/reports/${id}/preview`);
    return response.data;
  },

  getComplianceReport: async (params: { standard: 'hipaa' | 'gdpr' | 'sox'; dateFrom: string; dateTo: string }): Promise<Blob> => {
    const api = getApi();
    const response = await api.get('/audit/reports/compliance', { params, responseType: 'blob' });
    return response.data;
  },

  getAccessReport: async (params: { userId?: string; entityType?: string; dateFrom: string; dateTo: string }): Promise<Blob> => {
    const api = getApi();
    const response = await api.get('/audit/reports/access', { params, responseType: 'blob' });
    return response.data;
  },
};

// ============================================================================
// Retention Policies API
// ============================================================================

export const auditRetentionApi = {
  list: async (): Promise<AuditRetentionPolicy[]> => {
    const api = getApi();
    const response = await api.get('/audit/retention-policies');
    return response.data;
  },

  get: async (id: string): Promise<AuditRetentionPolicy> => {
    const api = getApi();
    const response = await api.get(`/audit/retention-policies/${id}`);
    return response.data;
  },

  create: async (data: Omit<AuditRetentionPolicy, 'id' | 'tenantId' | 'lastPurgedAt' | 'lastArchivedAt'>): Promise<AuditRetentionPolicy> => {
    const api = getApi();
    const response = await api.post('/audit/retention-policies', data);
    return response.data;
  },

  update: async (id: string, data: Partial<AuditRetentionPolicy>): Promise<AuditRetentionPolicy> => {
    const api = getApi();
    const response = await api.put(`/audit/retention-policies/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    const api = getApi();
    await api.delete(`/audit/retention-policies/${id}`);
  },

  runPurge: async (id: string): Promise<{ purgedCount: number; message: string }> => {
    const api = getApi();
    const response = await api.post(`/audit/retention-policies/${id}/purge`);
    return response.data;
  },

  runArchive: async (id: string): Promise<{ archivedCount: number; archiveLocation: string; message: string }> => {
    const api = getApi();
    const response = await api.post(`/audit/retention-policies/${id}/archive`);
    return response.data;
  },

  getStats: async (): Promise<{ totalLogs: number; oldestLog: string; storageUsed: string; byCategory: Record<string, number> }> => {
    const api = getApi();
    const response = await api.get('/audit/retention-policies/stats');
    return response.data;
  },
};

// ============================================================================
// Real-time Monitoring API
// ============================================================================

export const auditMonitoringApi = {
  getLiveEvents: async (limit: number = 50): Promise<AuditLog[]> => {
    const api = getApi();
    const response = await api.get('/audit/live', { params: { limit } });
    return response.data;
  },

  getAlerts: async (): Promise<AuditLog[]> => {
    const api = getApi();
    const response = await api.get('/audit/alerts');
    return response.data;
  },

  acknowledgeAlert: async (id: string): Promise<void> => {
    const api = getApi();
    await api.post(`/audit/alerts/${id}/acknowledge`);
  },

  getMetrics: async (timeRange: '1h' | '6h' | '24h' | '7d' | '30d'): Promise<{
    totalEvents: number;
    eventsPerMinute: number;
    errorRate: number;
    topActions: { action: string; count: number }[];
    timeline: { timestamp: string; count: number }[];
  }> => {
    const api = getApi();
    const response = await api.get('/audit/metrics', { params: { timeRange } });
    return response.data;
  },
};
