import { getApi } from '../api';

// Types
export interface Department {
  id: string;
  tenantId: string;
  organizationId: string;
  branchId: string;
  departmentCode: string;
  departmentName: string;
  departmentType: string;
  description?: string;
  parentDepartmentId?: string;
  departmentHeadId?: string;
  departmentHeadName?: string;
  operatingHours?: string;
  budget?: number;
  currency?: string;
  maxConcurrentPatients?: number;
  approvalWorkflowRequired: boolean;
  status: 'Active' | 'Inactive' | 'UnderMaintenance';
  totalStaff?: number;
  totalSubDepartments?: number;
  activePatients?: number;
  createdBy?: string;
  createdAt: string;
  updatedAt?: string;
  isDeleted: boolean;
}

export interface DepartmentFormData {
  departmentCode: string;
  departmentName: string;
  departmentType: string;
  description?: string;
  branchId: string;
  organizationId?: string;
  parentDepartmentId?: string;
  departmentHeadId?: string;
  operatingHours?: string;
  budget?: number;
  currency?: string;
  maxConcurrentPatients?: number;
  approvalWorkflowRequired: boolean;
  status: 'Active' | 'Inactive' | 'UnderMaintenance';
}

export interface DepartmentHierarchy {
  id: string;
  departmentCode: string;
  departmentName: string;
  departmentType: string;
  departmentHeadName?: string;
  totalStaff: number;
  status: string;
  children: DepartmentHierarchy[];
}

export interface DepartmentDetails {
  department: Department;
  staff: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    designation?: string;
    status: string;
  }[];
  subDepartments: Department[];
  metrics: {
    activePatients: number;
    totalAppointmentsToday: number;
    averageWaitTime: number;
    utilizationRate: number;
  };
}

export interface DepartmentFilters {
  search?: string;
  departmentType?: string;
  status?: string;
  branchId?: string;
  parentDepartmentId?: string;
}

// API functions
export const departmentsApi = {
  getAll: async (filters?: DepartmentFilters): Promise<Department[]> => {
    const response = await getApi().get('/departments', { params: filters });
    return response.data;
  },

  getAllWithStaffCount: async (): Promise<Array<Department & { staffCount: number; parentDepartmentName?: string }>> => {
    const response = await getApi().get('/departments/with-staff-count');
    return response.data;
  },

  getById: async (id: string): Promise<Department> => {
    const response = await getApi().get(`/departments/${id}`);
    return response.data;
  },

  create: async (data: DepartmentFormData): Promise<Department> => {
    const response = await getApi().post('/departments', data);
    return response.data;
  },

  update: async (id: string, data: Partial<DepartmentFormData>): Promise<Department> => {
    const response = await getApi().put(`/departments/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await getApi().delete(`/departments/${id}`);
  },

  getHierarchy: async (branchId?: string): Promise<DepartmentHierarchy[]> => {
    const response = await getApi().get('/departments/hierarchy', {
      params: { branchId }
    });
    return response.data;
  },

  getSubDepartments: async (parentId: string): Promise<Department[]> => {
    const response = await getApi().get(`/departments/${parentId}/sub-departments`);
    return response.data;
  },

  getDetails: async (id: string): Promise<DepartmentDetails> => {
    const response = await getApi().get(`/departments/${id}/details`);
    return response.data;
  },

  getStaff: async (id: string): Promise<any[]> => {
    const response = await getApi().get(`/departments/${id}/staff`);
    return response.data;
  },

  getMetrics: async (id: string): Promise<any> => {
    const response = await getApi().get(`/departments/${id}/metrics`);
    return response.data;
  },

  getDepartmentTypes: async (): Promise<string[]> => {
    const response = await getApi().get('/departments/types');
    return response.data;
  },
};
