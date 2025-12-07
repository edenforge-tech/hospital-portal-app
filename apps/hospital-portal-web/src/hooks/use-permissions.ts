import { useCachedAuthStore } from '@/lib/permission-cache';

/**
 * Hook to check if the current user has a specific permission
 * @param permissionCode - The permission code to check (e.g., 'patient.view', 'user.create')
 * @returns boolean indicating if the user has the permission
 */
export function useHasPermission(permissionCode: string): boolean {
  const { hasPermission } = useCachedAuthStore();
  return hasPermission(permissionCode);
}

/**
 * Hook to check if the current user has a specific role
 * @param roleName - The role name to check (e.g., 'Admin', 'Doctor')
 * @returns boolean indicating if the user has the role
 */
export function useHasRole(roleName: string): boolean {
  const { hasRole } = useCachedAuthStore();
  return hasRole(roleName);
}

/**
 * Hook to check if the current user has any of the specified permissions
 * @param permissionCodes - Array of permission codes to check
 * @returns boolean indicating if the user has at least one of the permissions
 */
export function useHasAnyPermission(permissionCodes: string[]): boolean {
  const { hasPermission } = useCachedAuthStore();
  return permissionCodes.some(code => hasPermission(code));
}

/**
 * Hook to check if the current user has all of the specified permissions
 * @param permissionCodes - Array of permission codes to check
 * @returns boolean indicating if the user has all the permissions
 */
export function useHasAllPermissions(permissionCodes: string[]): boolean {
  const { hasPermission } = useCachedAuthStore();
  return permissionCodes.every(code => hasPermission(code));
}

/**
 * Hook to get all permissions for the current user
 * @returns array of permission codes the user has
 */
export function usePermissions(): string[] {
  const { getPermissions } = useCachedAuthStore();
  return getPermissions();
}

/**
 * Hook to get all roles for the current user
 * @returns array of role names the user has
 */
export function useRoles(): string[] {
  const { getRoles } = useCachedAuthStore();
  return getRoles();
}

/**
 * Hook to check multiple permission conditions
 * @param conditions - Object with permission checks
 * @returns object with results of each check
 */
export function usePermissionChecks(conditions: {
  permissions?: string[];
  roles?: string[];
  requireAllPermissions?: boolean;
  requireAllRoles?: boolean;
}) {
  const { hasPermission, hasRole } = useCachedAuthStore();

  const hasPermissions = conditions.permissions
    ? conditions.requireAllPermissions
      ? conditions.permissions.every(p => hasPermission(p))
      : conditions.permissions.some(p => hasPermission(p))
    : true;

  const hasRoles = conditions.roles
    ? conditions.requireAllRoles
      ? conditions.roles.every(r => hasRole(r))
      : conditions.roles.some(r => hasRole(r))
    : true;

  return {
    hasPermissions,
    hasRoles,
    hasAccess: hasPermissions && hasRoles
  };
}