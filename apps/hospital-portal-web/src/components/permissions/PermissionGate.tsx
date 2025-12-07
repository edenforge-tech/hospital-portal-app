'use client';

import { useCachedAuthStore } from '@/lib/permission-cache';
import { ReactNode } from 'react';

interface PermissionGateProps {
  /** Permission code required to render children */
  permission?: string;
  /** Role name required to render children */
  role?: string;
  /** Fallback component to render when permission/role check fails */
  fallback?: ReactNode;
  /** Whether to require ALL permissions (AND) or ANY permission (OR) when multiple permissions are provided */
  requireAll?: boolean;
  /** Children to render when permission/role check passes */
  children: ReactNode;
}

/**
 * PermissionGate component for conditional rendering based on user permissions or roles.
 * Renders children only if the user has the required permission(s) or role(s).
 *
 * @example
 * // Single permission
 * <PermissionGate permission="patient.view">
 *   <PatientList />
 * </PermissionGate>
 *
 * // Multiple permissions (OR logic by default)
 * <PermissionGate permission="patient.create,patient.update">
 *   <EditButton />
 * </PermissionGate>
 *
 * // Multiple permissions (AND logic)
 * <PermissionGate permission="patient.view,appointment.view" requireAll={true}>
 *   <CombinedView />
 * </PermissionGate>
 *
 * // Role-based access
 * <PermissionGate role="Admin">
 *   <AdminPanel />
 * </PermissionGate>
 *
 * // Custom fallback
 * <PermissionGate permission="user.delete" fallback={<div>Access Denied</div>}>
 *   <DeleteButton />
 * </PermissionGate>
 */
export function PermissionGate({
  permission,
  role,
  fallback = null,
  requireAll = false,
  children
}: PermissionGateProps) {
  const { hasPermission, hasRole } = useCachedAuthStore();

  // Check role-based access
  if (role && !hasRole(role)) {
    return <>{fallback}</>;
  }

  // Check permission-based access
  if (permission) {
    const permissions = permission.split(',').map(p => p.trim());

    if (requireAll) {
      // ALL permissions required (AND logic)
      const hasAllPermissions = permissions.every(p => hasPermission(p));
      if (!hasAllPermissions) {
        return <>{fallback}</>;
      }
    } else {
      // ANY permission required (OR logic)
      const hasAnyPermission = permissions.some(p => hasPermission(p));
      if (!hasAnyPermission) {
        return <>{fallback}</>;
      }
    }
  }

  // All checks passed, render children
  return <>{children}</>;
}