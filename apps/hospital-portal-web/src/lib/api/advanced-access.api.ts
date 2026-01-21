import { getApi } from '../api';

// ===== Type Definitions =====

export interface DepartmentAccessRuleFilters {
  search?: string;
  isActive?: boolean;
  requiresApproval?: boolean;
  requiresSupervisor?: boolean;
  departmentType?: string;
}

export interface DepartmentAccessRuleFormData {
  departmentId: string;
  requiresApproval: boolean;
  approverRoleIds?: string[];
  requiresSupervisor: boolean;
  supervisorRoleIds?: string[];
  enableAutoExpiration: boolean;
  maxAccessDurationDays?: number;
  restrictedPermissions?: string[];
  requiresJustification: boolean;
  minJustificationLength?: number;
  allowEmergencyAccess: boolean;
  emergencyRoleIds?: string[];
  isActive: boolean;
}

export interface SupervisedUserFilters {
  search?: string;
  supervisorId?: string;
  oversightLevel?: string;
  requiresCoSignature?: boolean;
  status?: string;
  minComplianceScore?: number;
}

export interface SupervisedUserFormData {
  userId: string;
  assignedSupervisorId?: string;
  oversightLevel: string;
  requiresCoSignature: boolean;
  supervisionStartDate?: string;
  supervisionEndDate?: string;
  complianceNotes?: string;
}

export interface SupervisorCapacity {
  supervisorUserId: string;
  supervisorName: string;
  specialty?: string;
  maxSupervisees: number;
  currentSupervisees: number;
  availableSlots: number;
  utilizationPercentage: number;
  averageComplianceScore: number;
  isActive: boolean;
  status: string;
  currentSupervisedUsers?: any[];
}

// ===== Department Rules API =====

export const departmentRulesApi = {
  /**
   * Get all department access rules with optional filters
   */
  getAll: async (filters?: DepartmentAccessRuleFilters) => {
    const api = getApi();
    const response = await api.get('/admin/department-rules', { params: filters });
    return response.data;
  },

  /**
   * Get department access rule by ID
   */
  getById: async (ruleId: string) => {
    const api = getApi();
    const response = await api.get(`/admin/department-rules/${ruleId}`);
    return response.data;
  },

  /**
   * Get department access rule by department ID
   */
  getByDepartment: async (departmentId: string) => {
    const api = getApi();
    const response = await api.get(`/admin/department-rules/by-department/${departmentId}`);
    return response.data;
  },

  /**
   * Create new department access rule
   */
  create: async (data: DepartmentAccessRuleFormData) => {
    const api = getApi();
    const response = await api.post('/admin/department-rules', data);
    return response.data;
  },

  /**
   * Update existing department access rule
   */
  update: async (ruleId: string, data: DepartmentAccessRuleFormData) => {
    const api = getApi();
    const response = await api.put(`/admin/department-rules/${ruleId}`, data);
    return response.data;
  },

  /**
   * Delete department access rule (soft delete)
   */
  delete: async (ruleId: string) => {
    const api = getApi();
    await api.delete(`/admin/department-rules/${ruleId}`);
  },

  /**
   * Get statistics for department access rules
   */
  getStats: async () => {
    const api = getApi();
    const response = await api.get('/admin/department-rules/stats');
    return response.data;
  },
};

// ===== Supervised Access API =====

export const supervisedAccessApi = {
  /**
   * Get all supervised users with optional filters
   */
  getAllUsers: async (filters?: SupervisedUserFilters) => {
    const api = getApi();
    const response = await api.get('/admin/supervised-access/users', { params: filters });
    return response.data;
  },

  /**
   * Get supervised user by ID
   */
  getUserById: async (id: string) => {
    const api = getApi();
    const response = await api.get(`/admin/supervised-access/users/${id}`);
    return response.data;
  },

  /**
   * Create new supervised user
   */
  createUser: async (data: SupervisedUserFormData) => {
    const api = getApi();
    const response = await api.post('/admin/supervised-access/users', data);
    return response.data;
  },

  /**
   * Update existing supervised user
   */
  updateUser: async (id: string, data: SupervisedUserFormData) => {
    const api = getApi();
    const response = await api.put(`/admin/supervised-access/users/${id}`, data);
    return response.data;
  },

  /**
   * Delete supervised user (soft delete)
   */
  deleteUser: async (id: string) => {
    const api = getApi();
    await api.delete(`/admin/supervised-access/users/${id}`);
  },

  /**
   * Get supervisor capacity information
   */
  getSupervisorCapacities: async () => {
    const api = getApi();
    const response = await api.get('/admin/supervised-access/supervisors/capacity');
    return response.data;
  },

  /**
   * Get statistics for supervised access
   */
  getStats: async () => {
    const api = getApi();
    const response = await api.get('/admin/supervised-access/stats');
    return response.data;
  },

  /**
   * Recalculate compliance score for a supervised user
   */
  recalculateCompliance: async (id: string) => {
    const api = getApi();
    const response = await api.post(`/admin/supervised-access/users/${id}/recalculate-compliance`);
    return response.data;
  },
};
