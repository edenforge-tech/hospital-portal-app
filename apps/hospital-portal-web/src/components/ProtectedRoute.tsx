'use client';

import { useCachedAuthStore } from '@/lib/permission-cache';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export function ProtectedRoute({
  children,
  requiredPermission,
  requiredRole,
  fallbackPath = '/dashboard/unauthorized'
}: {
  children: React.ReactNode;
  requiredPermission?: string;
  requiredRole?: string;
  fallbackPath?: string;
}) {
  const router = useRouter();
  const { token, hasPermission, hasRole } = useCachedAuthStore();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Small delay to ensure auth state is hydrated
    setTimeout(() => setIsHydrated(true), 50);
  }, []);

  useEffect(() => {
    // Only perform checks after hydration
    if (!isHydrated) return;

    if (!token) {
      router.push('/auth/login');
      return;
    }

    if (requiredPermission && !hasPermission(requiredPermission)) {
      router.push(fallbackPath);
      return;
    }

    if (requiredRole && !hasRole(requiredRole)) {
      router.push(fallbackPath);
      return;
    }
  }, [isHydrated, token, requiredPermission, requiredRole, router, hasPermission, hasRole]);

  // Show loading or nothing while hydrating
  if (!isHydrated || !token) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return <>{children}</>;
}
