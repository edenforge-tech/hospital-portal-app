import { getApi } from '../api';

export interface DepartmentAccessRequest {
  requestId: string;
  requestNumber: string;
  userId: string;
  userName: string;
  userEmail: string;
  departmentId: string;
  departmentName: string;
  departmentCode: string;
  justification: string;
  requestedAccessType: string;
  
  // Requested permissions
  requestedCanView: boolean;
  requestedCanCreate: boolean;
  requestedCanEdit: boolean;
  requestedCanDelete: boolean;
  requestedCanApprove: boolean;
  requestedCanExport: boolean;
  
  // Status
  status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';
  createdAt: string;
  reviewedBy?: string;
  reviewedByName?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  rejectionReason?: string;
  autoApproved: boolean;
}

export interface AuditLog {
  auditNumber: string;
  userId: string;
  userName: string;
  departmentId: string;
  departmentName: string;
  action: string;
  actionCategory: string;
  previousState?: any;
  newState?: any;
  changesSummary: string;
  performedBy: string;
  performedByName: string;
  performedByIp?: string;
  userAgent?: string;
  sessionId?: string;
  complianceFlags?: any;
  isEmergencyAccess: boolean;
  timestamp: string;
}

export interface ComplianceReport {
  reportPeriod: string;
  startDate: string;
  endDate: string;
  hipaaCompliance: {
    phiAccessLogged: number;
    auditTrailComplete: boolean;
    unauthorizedAccessAttempts: number;
    complianceScore: number;
  };
  nabhCompliance: {
    qualifiedPersonnelOversight: number;
    documentationComplete: boolean;
    supervisionProtocol: string;
  };
  riskIndicators: string[];
  totalAccessChanges: number;
  totalApprovals: number;
  totalRejections: number;
}

export interface AuditStatistics {
  totalLogs: number;
  actionBreakdown: Record<string, number>;
  categoryBreakdown: Record<string, number>;
  emergencyAccessCount: number;
  topUsers: Array<{ userId: string; userName: string; count: number }>;
  topDepartments: Array<{ departmentId: string; departmentName: string; count: number }>;
}

export const departmentAccessApprovalApi = {
  /**
   * Request department access (creates a pending approval request)
   */
  requestAccess: async (request: {
    userId: string;
    departmentId: string;
    justification: string;
    requestedAccessType: string;
    permissions: {
      canView: boolean;
      canCreate: boolean;
      canEdit: boolean;
      canDelete: boolean;
      canApprove: boolean;
      canExport: boolean;
    };
  }) => {
    const response = await getApi().post<{ 
      success: boolean; 
      requestId: string; 
      requestNumber: string;
      requiresApproval: boolean;
      message: string;
    }>('/department-access/request', {
      userId: request.userId,
      departmentId: request.departmentId,
      justification: request.justification,
      requestedAccessType: request.requestedAccessType,
      requestedCanView: request.permissions.canView,
      requestedCanCreate: request.permissions.canCreate,
      requestedCanEdit: request.permissions.canEdit,
      requestedCanDelete: request.permissions.canDelete,
      requestedCanApprove: request.permissions.canApprove,
      requestedCanExport: request.permissions.canExport,
    });
    return response.data;
  },

  /**
   * Get pending approval requests (for approvers)
   */
  getPendingApprovals: async () => {
    const response = await getApi().get<DepartmentAccessRequest[]>(
      '/department-access/pending-approvals'
    );
    return response.data;
  },

  /**
   * Get user's own access requests
   */
  getMyRequests: async () => {
    const response = await getApi().get<DepartmentAccessRequest[]>(
      '/department-access/my-requests'
    );
    return response.data;
  },

  /**
   * Approve an access request
   */
  approveRequest: async (requestId: string, notes?: string) => {
    const response = await getApi().post<{ success: boolean; message: string }>(
      `/department-access/${requestId}/approve`,
      { notes }
    );
    return response.data;
  },

  /**
   * Reject an access request
   */
  rejectRequest: async (requestId: string, reason: string) => {
    const response = await getApi().post<{ success: boolean; message: string }>(
      `/department-access/${requestId}/reject`,
      { rejectionReason: reason }
    );
    return response.data;
  },

  /**
   * Cancel a pending request (by requester)
   */
  cancelRequest: async (requestId: string) => {
    const response = await getApi().post<{ success: boolean; message: string }>(
      `/department-access/${requestId}/cancel`
    );
    return response.data;
  },

  /**
   * Get audit logs with filters
   */
  getAuditLogs: async (filters?: {
    startDate?: string;
    endDate?: string;
    action?: string;
    userId?: string;
    departmentId?: string;
    page?: number;
    pageSize?: number;
  }) => {
    const response = await getApi().get<{
      logs: AuditLog[];
      totalCount: number;
      page: number;
      pageSize: number;
    }>('/department-access/audit-logs', { params: filters });
    return response.data;
  },

  /**
   * Get audit statistics
   */
  getAuditStatistics: async (filters?: {
    startDate?: string;
    endDate?: string;
  }) => {
    const response = await getApi().get<AuditStatistics>(
      '/department-access/audit-statistics',
      { params: filters }
    );
    return response.data;
  },

  /**
   * Get compliance report (HIPAA/NABH)
   */
  getComplianceReport: async (startDate: string, endDate: string) => {
    const response = await getApi().get<ComplianceReport>(
      '/department-access/compliance-report',
      { params: { startDate, endDate } }
    );
    return response.data;
  },

  /**
   * Validate department access (dry-run)
   */
  validateAccess: async (userId: string, departmentId: string) => {
    const response = await getApi().post<{
      isValid: boolean;
      requiresApproval: boolean;
      approverRoles: string[];
      errors: string[];
      warnings: string[];
      message: string;
    }>('/department-access/validate', { userId, departmentId });
    return response.data;
  },

  /**
   * Get recommended permissions for user/department combo
   */
  getRecommendedPermissions: async (userId: string, departmentId: string) => {
    const response = await getApi().get<{
      canView: boolean;
      canCreate: boolean;
      canEdit: boolean;
      canDelete: boolean;
      canApprove: boolean;
      canExport: boolean;
      rationale: string;
    }>('/department-access/recommended-permissions', {
      params: { userId, departmentId },
    });
    return response.data;
  },
};
