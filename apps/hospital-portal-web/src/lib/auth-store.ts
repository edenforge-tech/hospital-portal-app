import { create } from 'zustand';
import jwtDecode from 'jwt-decode';

export interface User {
  id: string;
  userName: string;
  email: string;
  firstName: string;
  lastName: string;
  userType: string;
  tenantId: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  tenantId: string | null;
  roles: string[];
  permissions: string[];
  isLoading: boolean;
  mustChangePassword: boolean;
  
  // Actions
  setAuth: (token: string, refreshToken: string, user: User, roles: string[], permissions: string[], tenantId: string, mustChangePassword: boolean) => void;
  logout: () => void;
  clearMustChangePassword: () => void;
  hasPermission: (permissionCode: string) => boolean;
  hasRole: (roleName: string) => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  refreshToken: null,
  tenantId: null,
  roles: [],
  permissions: [],
  isLoading: false,
  mustChangePassword: false,

  setAuth: (token, refreshToken, user, roles, permissions, tenantId, mustChangePassword) => {
    set({
      token,
      refreshToken,
      user,
      roles,
      permissions,
      tenantId,
      mustChangePassword,
    });
    
    // Persist to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
      localStorage.setItem('refresh_token', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('roles', JSON.stringify(roles));
      localStorage.setItem('permissions', JSON.stringify(permissions));
      localStorage.setItem('tenant_id', tenantId);
    }
  },

  logout: () => {
    set({
      user: null,
      token: null,
      refreshToken: null,
      tenantId: null,
      roles: [],
      permissions: [],
      mustChangePassword: false,
    });
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      localStorage.removeItem('roles');
      localStorage.removeItem('permissions');
      localStorage.removeItem('tenant_id');
    }
  },

  clearMustChangePassword: () => set({ mustChangePassword: false }),

  hasPermission: (permissionCode: string) => {
    const { permissions } = get();
    // Handle undefined/null permissions or wildcard permission "*"
    if (!permissions || !Array.isArray(permissions)) return false;
    if (permissions.includes('*')) return true; // Admin has all permissions
    return permissions.includes(permissionCode);
  },

  hasRole: (roleName: string) => {
    const { roles } = get();
    // Handle undefined/null roles
    if (!roles || !Array.isArray(roles)) return false;
    return roles.includes(roleName);
  },
}));

// Hydrate auth state from localStorage (call on client startup)
export function hydrateAuthFromStorage() {
  if (typeof window === 'undefined') return;

  try {
    const token = localStorage.getItem('auth_token');
    const refreshToken = localStorage.getItem('refresh_token');
    const userJson = localStorage.getItem('user');
    const rolesJson = localStorage.getItem('roles');
    const permissionsJson = localStorage.getItem('permissions');
    const tenantId = localStorage.getItem('tenant_id');

    if (token && userJson) {
      const user = JSON.parse(userJson);
      const roles = rolesJson ? JSON.parse(rolesJson) : [];
      const permissions = permissionsJson ? JSON.parse(permissionsJson) : [];

      useAuthStore.getState().setAuth(token, refreshToken || null, user, roles, permissions, tenantId || null, useAuthStore.getState().mustChangePassword);
    }
  } catch (e) {
    // ignore malformed storage
    console.warn('Failed to hydrate auth from storage', e);
  }
}
