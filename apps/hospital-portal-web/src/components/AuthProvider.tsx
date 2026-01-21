'use client';

import { useEffect } from 'react';
import { hydrateAuthFromStorage, useAuthStore } from '@/lib/auth-store';
import { initializeApi } from '@/lib/api';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Hydrate auth from localStorage on mount
    hydrateAuthFromStorage();
    
    // Initialize API with interceptors
    initializeApi();
    
    // Debug: log auth state
    const state = useAuthStore.getState();
    console.log('🔐 Auth Provider initialized:', {
      hasToken: !!state.token,
      tenantId: state.tenantId,
      user: state.user?.email
    });
  }, []);

  return <>{children}</>;
}
