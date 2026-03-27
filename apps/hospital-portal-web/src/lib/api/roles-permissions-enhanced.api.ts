import { getApi } from './base.api';

// Enhanced Role and Permission Interfaces
export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  conditions?: PermissionCondition[];
  description: string;
  category: string;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  isSystemPermission: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PermissionCondition {
  id: string;
  type: 'TimeRestriction' | 'LocationRestriction' | 'DataSensitivity' | 'ApprovalRequired' | 'Custom';
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'in_range' | 'not_equals';
  value: any;
  field: string;
  description: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  category: string;
  isSystemRole: boolean;
  parentRoleId?: string;
  permissions: Permission[];
  inheritedPermissions?: Permission[];
  users: RoleUser[];
  metadata: {
    maxUsers?: number;
    expirationDate?: string;
    requiresApproval: boolean;
    autoAssignmentRules?: AutoAssignmentRule[];
  };
  hierarchy: {
    level: number;
    path: string;
    children: Role[];
    parent?: Role;
  };
  compliance: {
    regulatoryTags: string[];
    auditRequired: boolean;
    lastAuditDate?: string;
    complianceScore: number;
  };
  analytics: {
    usageCount: number;
    activeUsers: number;
    permissionUtilization: PermissionUsage[];
    riskScore: number;
  };
  status: 'Active' | 'Inactive' | 'Deprecated' | 'PendingApproval';
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  lastModifiedBy: string;
}

export interface RoleUser {
  userId: string;
  userName: string;
  email: string;
  assignedAt: string;
  assignedBy: string;
  expirationDate?: string;
  isTemporary: boolean;
  assignmentReason?: string;
}

export interface AutoAssignmentRule {
  id: string;
  name: string;
  condition: {
    field: string;
    operator: string;
    value: any;
  };
  action: 'assign' | 'remove' | 'suggest';
  priority: number;
  isActive: boolean;
}

export interface PermissionUsage {
  permissionId: string;
  permissionName: string;
  usageCount: number;
  lastUsed?: string;
  utilizationRate: number;
}

export interface PermissionTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  permissions: Permission[];
  tags: string[];
  isSystemTemplate: boolean;
  applicableRoles: string[];
  compliance: {
    regulatoryFramework: string;
    complianceLevel: string;
    requirements: string[];
  };
  usage: {
    usedCount: number;
    lastUsed?: string;
  };
  createdAt: string;
  createdBy: string;
}

export interface RoleHierarchy {
  id: string;
  name: string;
  level: number;
  parentId?: string;
  children: RoleHierarchy[];
  permissions: Permission[];
  inheritanceRules: {
    inheritPermissions: boolean;
    allowOverrides: boolean;
    restrictiveMode: boolean;
  };
}

export interface PermissionAuditLog {
  id: string;
  action: 'Grant' | 'Revoke' | 'Modify' | 'Approve' | 'Deny';
  targetType: 'User' | 'Role' | 'Permission';
  targetId: string;
  targetName: string;
  permissionId?: string;
  permissionName?: string;
  roleId?: string;
  roleName?: string;
  performedBy: string;
  performerName: string;
  reason?: string;
  previousState?: any;
  newState?: any;
  ipAddress: string;
  userAgent: string;
  sessionId: string;
  riskAssessment: {
    riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
    riskFactors: string[];
    autoApproved: boolean;
  };
  timestamp: string;
}

export interface RoleAnalytics {
  roleDistribution: {
    roleId: string;
    roleName: string;
    userCount: number;
    percentage: number;
  }[];
  permissionUsage: {
    permissionId: string;
    permissionName: string;
    usageCount: number;
    riskLevel: string;
  }[];
  complianceMetrics: {
    overallScore: number;
    auditCoverage: number;
    riskDistribution: { level: string; count: number }[];
    violationCount: number;
  };
  trends: {
    roleGrowth: { month: string; count: number }[];
    permissionChanges: { date: string; additions: number; removals: number }[];
    userActivity: { date: string; activeUsers: number }[];
  };
  recommendations: {
    type: 'RoleConsolidation' | 'PermissionReduction' | 'ComplianceImprovement' | 'SecurityEnhancement';
    title: string;
    description: string;
    priority: 'High' | 'Medium' | 'Low';
    impact: string;
    effort: 'Low' | 'Medium' | 'High';
  }[];
}

export interface BulkRoleOperation {
  operationType: 'assign' | 'revoke' | 'modify' | 'approve' | 'bulk_create';
  targets: {
    userIds?: string[];
    roleIds?: string[];
    permissionIds?: string[];
  };
  changes: any;
  validationRules: {
    requireApproval: boolean;
    maxBatchSize: number;
    allowRiskEscalation: boolean;
  };
  results?: BulkOperationResult[];
}

export interface BulkOperationResult {
  targetId: string;
  targetName: string;
  status: 'Success' | 'Failed' | 'Skipped' | 'PendingApproval';
  message: string;
  riskAssessment?: {
    riskLevel: string;
    requiresApproval: boolean;
  };
}

// API Filters and Pagination
export interface RoleFilters {
  search?: string;
  category?: string;
  status?: string;
  riskLevel?: string;
  hasUsers?: boolean;
  parentRoleId?: string;
  permissionIds?: string[];
  createdAfter?: string;
  createdBefore?: string;
  includeInherited?: boolean;
}

export interface PermissionFilters {
  search?: string;
  category?: string;
  resource?: string;
  action?: string;
  riskLevel?: string;
  hasConditions?: boolean;
  isSystemPermission?: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pageSize: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Enhanced RBAC API
export const rolesPermissionsEnhancedApi = {
  // Role Management
  async getRoles(filters?: RoleFilters, page = 1, pageSize = 20): Promise<PaginatedResponse<Role>> {
    const api = getApi();
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
      ...Object.fromEntries(Object.entries(filters || {}).map(([k, v]) => [k, String(v)]))
    });
    const response = await api.get(`/roles/enhanced?${params}`);
    return response.data;
  },

  async getRole(roleId: string, includeHierarchy = false, includeAnalytics = false): Promise<Role> {
    const api = getApi();
    const params = new URLSearchParams({
      includeHierarchy: includeHierarchy.toString(),
      includeAnalytics: includeAnalytics.toString()
    });
    const response = await api.get(`/roles/${roleId}/enhanced?${params}`);
    return response.data;
  },

  async createRole(roleData: Partial<Role>): Promise<Role> {
    const api = getApi();
    const response = await api.post('/roles/enhanced', roleData);
    return response.data;
  },

  async updateRole(roleId: string, updates: Partial<Role>): Promise<Role> {
    const api = getApi();
    const response = await api.put(`/roles/${roleId}/enhanced`, updates);
    return response.data;
  },

  async deleteRole(roleId: string, transferUsersToRole?: string): Promise<void> {
    const api = getApi();
    const params = transferUsersToRole ? { transferToRole: transferUsersToRole } : {};
    await api.delete(`/roles/${roleId}`, { params });
  },

  // Role Hierarchy Management
  async getRoleHierarchy(): Promise<RoleHierarchy[]> {
    const api = getApi();
    const response = await api.get('/roles/hierarchy');
    return response.data;
  },

  async updateRoleHierarchy(hierarchyUpdates: Partial<RoleHierarchy>[]): Promise<RoleHierarchy[]> {
    const api = getApi();
    const response = await api.put('/roles/hierarchy', hierarchyUpdates);
    return response.data;
  },

  async moveRoleInHierarchy(roleId: string, newParentId?: string, position?: number): Promise<RoleHierarchy[]> {
    const api = getApi();
    const response = await api.post(`/roles/${roleId}/move`, {
      newParentId,
      position
    });
    return response.data;
  },

  // Permission Management
  async getPermissions(filters?: PermissionFilters, page = 1, pageSize = 50): Promise<PaginatedResponse<Permission>> {
    const api = getApi();
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
      ...Object.fromEntries(Object.entries(filters || {}).map(([k, v]) => [k, String(v)]))
    });
    const response = await api.get(`/permissions/enhanced?${params}`);
    return response.data;
  },

  async getPermission(permissionId: string): Promise<Permission> {
    const api = getApi();
    const response = await api.get(`/permissions/${permissionId}/enhanced`);
    return response.data;
  },

  async createPermission(permissionData: Partial<Permission>): Promise<Permission> {
    const api = getApi();
    const response = await api.post('/permissions/enhanced', permissionData);
    return response.data;
  },

  async updatePermission(permissionId: string, updates: Partial<Permission>): Promise<Permission> {
    const api = getApi();
    const response = await api.put(`/permissions/${permissionId}/enhanced`, updates);
    return response.data;
  },

  async deletePermission(permissionId: string): Promise<void> {
    const api = getApi();
    await api.delete(`/permissions/${permissionId}`);
  },

  // Permission Templates
  async getPermissionTemplates(category?: string): Promise<PermissionTemplate[]> {
    const api = getApi();
    const params = category ? { category } : {};
    const response = await api.get('/permissions/templates', { params });
    return response.data;
  },

  async getPermissionTemplate(templateId: string): Promise<PermissionTemplate> {
    const api = getApi();
    const response = await api.get(`/permissions/templates/${templateId}`);
    return response.data;
  },

  async createPermissionTemplate(templateData: Partial<PermissionTemplate>): Promise<PermissionTemplate> {
    const api = getApi();
    const response = await api.post('/permissions/templates', templateData);
    return response.data;
  },

  async applyPermissionTemplate(templateId: string, roleIds: string[]): Promise<BulkOperationResult[]> {
    const api = getApi();
    const response = await api.post(`/permissions/templates/${templateId}/apply`, { roleIds });
    return response.data;
  },

  // Role Assignments
  async assignRoleToUser(roleId: string, userId: string, assignmentData?: {
    expirationDate?: string;
    reason?: string;
    isTemporary?: boolean;
  }): Promise<void> {
    const api = getApi();
    await api.post(`/roles/${roleId}/assign`, {
      userId,
      ...assignmentData
    });
  },

  async removeRoleFromUser(roleId: string, userId: string, reason?: string): Promise<void> {
    const api = getApi();
    await api.post(`/roles/${roleId}/remove`, {
      userId,
      reason
    });
  },

  async getUserRoles(userId: string, includeInherited = false): Promise<Role[]> {
    const api = getApi();
    const params = { includeInherited: includeInherited.toString() };
    const response = await api.get(`/users/${userId}/roles/enhanced`, { params });
    return response.data;
  },

  // Bulk Operations
  async performBulkRoleOperation(operation: BulkRoleOperation): Promise<BulkOperationResult[]> {
    const api = getApi();
    const response = await api.post('/roles/bulk-operations', operation);
    return response.data;
  },

  async validateBulkOperation(operation: BulkRoleOperation): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
    riskAssessment: { riskLevel: string; riskFactors: string[] };
  }> {
    const api = getApi();
    const response = await api.post('/roles/bulk-operations/validate', operation);
    return response.data;
  },

  // Approval Workflow
  async getPendingApprovals(filters?: {
    requestType?: string;
    requestedBy?: string;
    riskLevel?: string;
  }): Promise<{
    id: string;
    requestType: string;
    requestedBy: string;
    requestData: any;
    riskLevel: string;
    submittedAt: string;
    reason?: string;
  }[]> {
    const api = getApi();
    const response = await api.get('/roles/approvals/pending', { params: filters });
    return response.data;
  },

  async approveRoleRequest(approvalId: string, decision: 'approve' | 'deny', comments?: string): Promise<void> {
    const api = getApi();
    await api.post(`/roles/approvals/${approvalId}`, {
      decision,
      comments
    });
  },

  // Analytics and Reporting
  async getRoleAnalytics(timeRange: '7d' | '30d' | '90d' | '1y' = '30d'): Promise<RoleAnalytics> {
    const api = getApi();
    const response = await api.get('/roles/analytics', {
      params: { timeRange }
    });
    return response.data;
  },

  async getComplianceReport(format: 'json' | 'pdf' | 'csv' = 'json'): Promise<any> {
    const api = getApi();
    const response = await api.get('/roles/compliance/report', {
      params: { format },
      responseType: format === 'json' ? 'json' : 'blob'
    });
    return response.data;
  },

  async getRoleUsageReport(roleId: string, timeRange: '7d' | '30d' | '90d' = '30d'): Promise<{
    roleInfo: Role;
    usageMetrics: {
      loginCount: number;
      activeUsers: number;
      permissionUsage: PermissionUsage[];
      actionBreakdown: { action: string; count: number }[];
    };
    trends: { date: string; activeUsers: number; actionsPerformed: number }[];
  }> {
    const api = getApi();
    const response = await api.get(`/roles/${roleId}/usage-report`, {
      params: { timeRange }
    });
    return response.data;
  },

  // Audit Trail
  async getPermissionAuditLog(filters?: {
    userId?: string;
    roleId?: string;
    permissionId?: string;
    action?: string;
    dateFrom?: string;
    dateTo?: string;
    riskLevel?: string;
  }, page = 1, pageSize = 20): Promise<PaginatedResponse<PermissionAuditLog>> {
    const api = getApi();
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
      ...Object.fromEntries(Object.entries(filters || {}).map(([k, v]) => [k, String(v)]))
    });
    const response = await api.get(`/roles/audit-log?${params}`);
    return response.data;
  },

  // Risk Assessment
  async assessPermissionRisk(permissionIds: string[], userId?: string): Promise<{
    overallRisk: 'Low' | 'Medium' | 'High' | 'Critical';
    riskFactors: string[];
    recommendations: string[];
    requiresApproval: boolean;
    autoApprovable: boolean;
  }> {
    const api = getApi();
    const response = await api.post('/roles/risk-assessment', {
      permissionIds,
      userId
    });
    return response.data;
  },

  // Import/Export
  async exportRoles(format: 'json' | 'xlsx' | 'csv' = 'xlsx', includePermissions = true): Promise<Blob> {
    const api = getApi();
    const response = await api.get('/roles/export', {
      params: { format, includePermissions },
      responseType: 'blob'
    });
    return response.data;
  },

  async importRoles(file: File, options?: {
    validateOnly?: boolean;
    skipDuplicates?: boolean;
    requireApproval?: boolean;
  }): Promise<{
    success: boolean;
    importedCount: number;
    errors: string[];
    warnings: string[];
    requiresApproval: boolean;
  }> {
    const api = getApi();
    const formData = new FormData();
    formData.append('file', file);
    if (options) {
      Object.entries(options).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
    }
    const response = await api.post('/roles/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // Search and Discovery
  async searchRolesAndPermissions(query: string, options?: {
    includeRoles?: boolean;
    includePermissions?: boolean;
    includeTemplates?: boolean;
    fuzzySearch?: boolean;
  }): Promise<{
    roles: Role[];
    permissions: Permission[];
    templates: PermissionTemplate[];
    totalResults: number;
  }> {
    const api = getApi();
    const response = await api.get('/roles/search', {
      params: { query, ...options }
    });
    return response.data;
  },

  async suggestPermissions(roleId: string, userId?: string): Promise<{
    suggestions: Permission[];
    reasoning: string[];
    confidence: number;
  }> {
    const api = getApi();
    const response = await api.get(`/roles/${roleId}/suggest-permissions`, {
      params: { userId }
    });
    return response.data;
  }
};

export default rolesPermissionsEnhancedApi;