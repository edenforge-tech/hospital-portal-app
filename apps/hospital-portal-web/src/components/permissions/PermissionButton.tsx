'use client';

import { useCachedAuthStore } from '@/lib/permission-cache';
import { ReactNode } from 'react';

interface PermissionButtonProps {
  /** Permission code required to enable the button */
  permission?: string;
  /** Role name required to enable the button */
  role?: string;
  /** Whether to require ALL permissions (AND) or ANY permission (OR) when multiple permissions are provided */
  requireAll?: boolean;
  /** Custom disabled message */
  disabledMessage?: string;
  /** Whether to hide the button completely when permission is denied (default: false) */
  hideWhenDisabled?: boolean;
  /** Button content */
  children: ReactNode;
  /** Click handler */
  onClick?: () => void;
  /** Additional CSS classes */
  className?: string;
  /** Button type */
  type?: 'button' | 'submit' | 'reset';
}

/**
 * PermissionButton component that conditionally enables/disables a button based on user permissions.
 * Extends all Button props and adds permission-based access control.
 *
 * @example
 * // Basic permission button
 * <PermissionButton permission="patient.create" onClick={handleCreate}>
 *   Create Patient
 * </PermissionButton>
 *
 * // Hide button when no permission
 * <PermissionButton permission="user.delete" hideWhenDisabled onClick={handleDelete}>
 *   Delete User
 * </PermissionButton>
 *
 * // Custom disabled message
 * <PermissionButton
 *   permission="appointment.cancel"
 *   disabledMessage="You don't have permission to cancel appointments"
 *   onClick={handleCancel}
 * >
 *   Cancel Appointment
 * </PermissionButton>
 */
export function PermissionButton({
  permission,
  role,
  requireAll = false,
  disabledMessage,
  hideWhenDisabled = false,
  children,
  onClick,
  className = '',
  type = 'button'
}: PermissionButtonProps) {
  const { hasPermission, hasRole } = useCachedAuthStore();

  // Check role-based access
  const hasRoleAccess = !role || hasRole(role);

  // Check permission-based access
  let hasPermissionAccess = true;
  if (permission) {
    const permissions = permission.split(',').map(p => p.trim());

    if (requireAll) {
      // ALL permissions required (AND logic)
      hasPermissionAccess = permissions.every(p => hasPermission(p));
    } else {
      // ANY permission required (OR logic)
      hasPermissionAccess = permissions.some(p => hasPermission(p));
    }
  }

  const hasAccess = hasRoleAccess && hasPermissionAccess;

  // Hide button completely if requested and no access
  if (hideWhenDisabled && !hasAccess) {
    return null;
  }

  const handleClick = () => {
    if (!hasAccess) {
      return;
    }
    onClick?.();
  };

  const buttonClassName = hasAccess
    ? `px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 ${className}`
    : `px-4 py-2 bg-gray-400 text-gray-200 rounded-lg cursor-not-allowed ${className}`;

  return (
    <button
      type={type}
      disabled={!hasAccess}
      onClick={handleClick}
      className={buttonClassName}
      title={!hasAccess && disabledMessage ? disabledMessage : undefined}
    >
      {children}
    </button>
  );
}