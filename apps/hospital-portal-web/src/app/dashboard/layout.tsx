'use client';

import { useAuthStore } from '@/lib/auth-store';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import TopNav from '@/components/TopNav';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { hydrateAuthFromStorage } from '@/lib/auth-store';
import { initializeApi } from '@/lib/api';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { token, user } = useAuthStore();
  const [isClient, setIsClient] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // Hydrate auth from storage first
    hydrateAuthFromStorage();
    initializeApi();
    
    // Mark as hydrated after a short delay to ensure state is set
    setTimeout(() => setIsHydrated(true), 100);
  }, []);

  useEffect(() => {
    // Only check authentication after hydration is complete
    if (isHydrated && !token) {
      router.push('/auth/login');
    }
  }, [isHydrated, token, router]);

  if (!isClient || !isHydrated || !token) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopNav />
          <main className="flex-1 overflow-auto">
            <div className="p-6">{children}</div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
