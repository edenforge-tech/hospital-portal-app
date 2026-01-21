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
  // Granular permissions
  canView?: boolean;
  canCreate?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  canApprove?: boolean;
  canExport?: boolean;
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
  accessType?: string;
  isPrimary: boolean;
  // Granular permissions
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canApprove: boolean;
  canExport: boolean;
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
   * Update permissions for a user's department access
   */
  updatePermissions: async (
    userId: string,
    departmentId: string,
    permissions: {
      canView: boolean;
      canCreate: boolean;
      canEdit: boolean;
      canDelete: boolean;
      canApprove: boolean;
      canExport: boolean;
    }
  ) => {
    return getApi().put(`/users/${userId}/department-access/${departmentId}/permissions`, permissions);
  },

  /**
   * Bulk assign multiple departments to a user with granular permissions
   */
  bulkAssign: async (assignments: BulkAssignmentDto[]) => {
    // Group assignments by userId and make separate calls for each user
    const groupedByUser = assignments.reduce((acc, assignment) => {
      if (!acc[assignment.userId]) {
        acc[assignment.userId] = [];
      }
      acc[assignment.userId].push({
        departmentId: assignment.departmentId,
        isPrimary: assignment.isPrimary,
        canView: assignment.canView,
        canCreate: assignment.canCreate,
        canEdit: assignment.canEdit,
        canDelete: assignment.canDelete,
        canApprove: assignment.canApprove,
        canExport: assignment.canExport,
      });
      return acc;
    }, {} as Record<string, any[]>);

    // Make a bulk call for each user
    const results = await Promise.all(
      Object.entries(groupedByUser).map(([userId, userAssignments]) =>
        getApi().post<UserDepartmentAccessDto[]>(
          `/users/${userId}/department-access/bulk`,
          userAssignments
        )
      )
    );

    // Flatten results
    return results.flatMap(r => r.data);
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
