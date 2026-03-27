'use client';

import { useAuthStore } from '@/lib/auth-store';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import TopNav from '@/components/TopNav';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { hydrateAuthFromStorage } from '@/lib/auth-store';
import { initializeApi } from '@/lib/api';
import { useNotifications } from '@/hooks/useNotifications';
import { Toaster } from 'react-hot-toast';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { token, user } = useAuthStore();
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isInIframe, setIsInIframe] = useState(false);

  // Immersive routes hide TopNav and remove wrapper padding for full-bleed dashboards
  const immersiveRoutes = ['/dashboard/optometrist', '/dashboard/optometrist/exam'];
  const isImmersive = immersiveRoutes.some(r => pathname === r);

  // No-pad routes: keep TopNav but render children directly (no padding wrapper, no outer scroll)
  const noPadRoutes = ['/dashboard/counselor/sessions', '/dashboard/counselor'];
  const isNoPad = noPadRoutes.some(r => pathname.startsWith(r));
  
  // Phase 3: Initialize real-time notifications
  const { isConnected, notifications } = useNotifications();

  useEffect(() => {
    setIsClient(true);
    
    // Detect if we're in an iframe
    setIsInIframe(window.self !== window.top);
    
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

  // If in iframe, render only children without dashboard layout
  if (isInIframe) {
    return (
      <ProtectedRoute>
        {children}
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      {/* Phase 3: Toast notifications for real-time updates */}
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
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
            duration: 6000,
          },
        }}
      />
      
      <div className="flex h-screen bg-gray-100 p-3 gap-3">
        {/* Nav Sidebar — always a floating rounded card */}
        <div className="flex-shrink-0 rounded-2xl overflow-hidden shadow-md">
          <Sidebar />
        </div>

        {/* Right column: TopNav card + main content */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0 gap-3">
          {!isImmersive && (
            <div className="rounded-2xl overflow-hidden shadow-md flex-shrink-0">
              <TopNav />
            </div>
          )}
          <main id="main-content" className={`flex-1 min-h-0 ${isNoPad ? 'overflow-hidden' : 'overflow-auto'}`} role="main" aria-label="Main content">
            {isNoPad
              ? children
              : <div className={isImmersive ? '' : 'p-3'}>{children}</div>
            }
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
