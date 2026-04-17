'use client';

import { useAuthStore } from '@/lib/auth-store';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import TopNav from '@/components/TopNav';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { hydrateAuthFromStorage } from '@/lib/auth-store';
import { initializeApi } from '@/lib/api';
import { Toaster } from 'react-hot-toast';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { token } = useAuthStore();
  const [isClient, setIsClient] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setIsClient(true);
    hydrateAuthFromStorage();
    initializeApi();
    setTimeout(() => setIsHydrated(true), 100);
  }, []);

  useEffect(() => {
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
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#363636',
            padding: '16px',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          },
          success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
          error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' }, duration: 6000 },
        }}
      />

      {/* Mobile/tablet drawer */}
      <Sidebar isMobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} drawerOnly />

      <div className="flex h-screen bg-gray-100 p-3 gap-3">
        {/* Sidebar card — desktop only */}
        <div className="hidden lg:flex flex-shrink-0 rounded-2xl overflow-hidden shadow-md">
          <Sidebar />
        </div>

        {/* Right column: TopNav + main content */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0 gap-3">
          <div className="rounded-2xl overflow-hidden shadow-md flex-shrink-0">
            <TopNav onMenuClick={() => setSidebarOpen(true)} />
          </div>
          <main
            id="main-content"
            className="flex-1 min-h-0 overflow-auto rounded-2xl bg-white shadow-sm"
            role="main"
            aria-label="Main content"
          >
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
