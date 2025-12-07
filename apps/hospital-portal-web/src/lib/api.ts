import axios, { AxiosInstance } from 'axios';
import { useAuthStore } from './auth-store';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

let axiosInstance: AxiosInstance;

export const initializeApi = () => {
  axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Add request interceptor to include tenant ID and token
  axiosInstance.interceptors.request.use((config) => {
    const { tenantId, token } = useAuthStore.getState();
    
    if (tenantId) {
      (config.headers as any)['X-Tenant-ID'] = tenantId;
    }
    
    if (token) {
      (config.headers as any).Authorization = `Bearer ${token}`;
    }
    
    return config;
  });

  // Add response interceptor for error handling
  axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        useAuthStore.getState().logout();
        window.location.href = '/auth/login';
      } else if (error.response?.status === 403) {
        // Permission denied - redirect to unauthorized page
        window.location.href = '/dashboard/unauthorized';
      }
      return Promise.reject(error);
    }
  );

  return axiosInstance;
};

export const getApi = () => {
  if (!axiosInstance) {
    return initializeApi();
  }
  return axiosInstance;
};

export const patientApi = {
  getAll: () => getApi().get('/patients'),
  getById: (id: string) => getApi().get(`/patients/${id}`),
  create: (data: any) => getApi().post('/patients', data),
  update: (id: string, data: any) => getApi().put(`/patients/${id}`, data),
  delete: (id: string) => getApi().delete(`/patients/${id}`)
};

export const examinationApi = {
  getAll: () => getApi().get('/examinations'),
  getById: (id: string) => getApi().get(`/examinations/${id}`),
  getByPatient: (patientId: string) => getApi().get(`/examinations/patient/${patientId}`),
  create: (data: any) => getApi().post('/examinations', data),
  update: (id: string, data: any) => getApi().put(`/examinations/${id}`, data),
  delete: (id: string) => getApi().delete(`/examinations/${id}`)
};

export const authApi = {
  login: (email: string, password: string, tenantId: string) =>
    getApi().post('/auth/login', { email, password, tenantId }),
  
  changePassword: (currentPassword: string, newPassword: string) =>
    getApi().post('/auth/change-password', { currentPassword, newPassword }),
};

export const usersApi = {
  getAll: () => getApi().get('/users'),
  getAllWithDetails: () => getApi().get('/users/with-details'),
  getById: (id: string) => getApi().get(`/users/${id}`),
  create: (data: any) => getApi().post('/users', data),
  update: (id: string, data: any) => getApi().put(`/users/${id}`, data),
  deactivate: (id: string) => getApi().post(`/users/${id}/deactivate`),
};

export const rolesApi = {
  getAll: () => getApi().get('/roles'),
  getAllWithUserCount: () => getApi().get('/roles/with-user-count'),
  getById: (id: string) => getApi().get(`/roles/${id}`),
  create: (data: any) => getApi().post('/roles', data),
  update: (id: string, data: any) => getApi().put(`/roles/${id}`, data),
  delete: (id: string) => getApi().delete(`/roles/${id}`),
  assignRole: (userId: string, roleId: string, branchId?: string) =>
    getApi().post(`/users/${userId}/roles`, { roleId, branchId }),
  getRolePermissions: (roleId: string) => getApi().get(`/roles/${roleId}/permissions`),
  assignPermissions: (roleId: string, permissionIds: string[]) =>
    getApi().post(`/roles/${roleId}/permissions`, { permissionIds }),
  removePermissions: (roleId: string, permissionIds: string[]) =>
    getApi().delete(`/roles/${roleId}/permissions`, { data: { permissionIds } }),
  cloneRole: (roleId: string, newRoleName: string, newRoleDescription?: string) =>
    getApi().post(`/roles/${roleId}/clone`, { name: newRoleName, description: newRoleDescription }),
};

export const permissionsApi = {
  getAll: () => getApi().get('/permissions'),
  getAllGrouped: () => getApi().get('/permissions/grouped'),
  getById: (id: string) => getApi().get(`/permissions/${id}`),
  create: (data: any) => getApi().post('/permissions', data),
  update: (id: string, data: any) => getApi().put(`/permissions/${id}`, data),
  delete: (id: string) => getApi().delete(`/permissions/${id}`),
  getByCategory: (category: string) => getApi().get(`/permissions/category/${category}`),
  bulkAssign: (roleId: string, permissionIds: string[]) =>
    getApi().post('/permissions/bulk-assign', { roleId, permissionIds }),
  bulkRemove: (roleId: string, permissionIds: string[]) =>
    getApi().delete('/permissions/bulk-remove', { data: { roleId, permissionIds } }),
  getMatrix: () => getApi().get('/permissions/matrix'),
  getStatistics: () => getApi().get('/permissions/statistics'),
};

export const departmentsApi = {
  getAll: () => getApi().get('/departments'),
  getAllWithStaffCount: () => getApi().get('/departments/with-staff-count'),
  getById: (id: string) => getApi().get(`/departments/${id}`),
};

export const branchesApi = {
  getAll: () => getApi().get('/branches'),
};

export const dashboardApi = {
  getStats: () => getApi().get('/admin/dashboard/stats'),
};

export { userDepartmentAccessApi } from './api/user-department-access.api';
