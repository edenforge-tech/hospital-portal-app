import { getApi } from '../api';

export interface UserDepartmentAccessDto {
  id: string;
  userId: string;
  userName: string;
  departmentId: string;
  departmentName: string;
  accessLevel: string;
  isPrimary: boolean;
  status: string;
  validFrom?: string;
  validTo?: string;
  assignedOn?: string;
  assignedBy?: string;
}

export interface DepartmentAccessDto {
  departmentId: string;
  departmentName: string;
  departmentCode: string;
  departmentType: string;
  accessType: string;
  isPrimary: boolean;
  grantedAt?: string;
  status: string;
}

export interface UserAccessDto {
  userId: string;
  userName: string;
  email: string;
  accessLevel: string;
  isPrimary: boolean;
  assignedOn?: string;
}

export interface BulkAssignmentDto {
  userId: string;
  departmentId: string;
  accessType: string;
  isPrimary: boolean;
}

export interface AccessMatrixDto {
  departments: Array<{
    id: string;
    name: string;
    users: Array<{
      userId: string;
      userName: string;
      accessLevel: string;
      isPrimary: boolean;
    }>;
  }>;
  totalUsers: number;
  totalDepartments: number;
}

export const userDepartmentAccessApi = {
  /**
   * Assign a user to a department with specified access level
   */
  assign: async (
    userId: string,
    departmentId: string,
    accessType: string,
    isPrimary: boolean = false
  ) => {
    return getApi().post<UserDepartmentAccessDto>(`/users/${userId}/department-access`, {
      departmentId,
      accessLevel: accessType,
      isPrimary,
    });
  },

  /**
   * Revoke a user's access to a department
   */
  revoke: async (userId: string, departmentId: string) => {
    return getApi().delete(`/users/${userId}/department-access/${departmentId}`);
  },

  /**
   * Get all departments a user has access to
   */
  getUserDepartments: async (userId: string): Promise<DepartmentAccessDto[]> => {
    const response = await getApi().get<DepartmentAccessDto[]>(
      `/users/${userId}/department-access`
    );
    return response.data;
  },

  /**
   * Get all users who have access to a department
   */
  getDepartmentUsers: async (departmentId: string) => {
    return getApi().get<UserAccessDto[]>(
      `/departments/${departmentId}/user-access`
    );
  },

  /**
   * Update a user's access level for a department
   */
  updateAccessLevel: async (
    userId: string,
    departmentId: string,
    accessType: string
  ) => {
    return getApi().put(`/users/${userId}/department-access/${departmentId}`, {
      accessLevel: accessType,
    });
  },

  /**
   * Set a department as the user's primary department
   */
  setPrimary: async (userId: string, departmentId: string) => {
    return getApi().put(`/users/${userId}/department-access/${departmentId}`, {
      isPrimary: true,
    });
  },

  /**
   * Bulk assign multiple users to multiple departments
   */
  bulkAssign: async (assignments: BulkAssignmentDto[]) => {
    return getApi().post<UserDepartmentAccessDto[]>(
      '/user-department-access/bulk-assign',
      { assignments }
    );
  },

  /**
   * Get the complete access matrix (all user-department relationships)
   * @param departmentId Optional - filter by specific department
   */
  getAccessMatrix: async (departmentId?: string) => {
    const params = departmentId ? { departmentId } : {};
    return getApi().get<AccessMatrixDto>('/user-department-access/matrix', {
      params,
    });
  },
};
