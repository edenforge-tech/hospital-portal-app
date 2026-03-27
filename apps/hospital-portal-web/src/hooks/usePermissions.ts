import { useAuthStore } from '@/lib/auth-store';

export function useHasPermission(permission: string): boolean {
  const { user } = useAuthStore();
  
  // For now, return true for admin users
  // TODO: Implement proper permission checking based on user roles
  return true;
}

export function usePermissions() {
  const { user } = useAuthStore();
  
  return {
    hasPermission: (permission: string) => true, // TODO: Implement proper permission checking
    permissions: user?.permissions || [],
  };
}
