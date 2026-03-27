'use client';

import React, { useState, useEffect } from 'react';
import { getApi } from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';

export function SeedButton() {
  const [status, setStatus] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const { token, tenantId, user } = useAuthStore();
  
  // Debug: Log auth state on mount
  useEffect(() => {
    console.log('SeedButton - Auth state:', {
      hasToken: !!token,
      hasTenantId: !!tenantId,
      tenantId: tenantId,
      hasUser: !!user
    });
  }, [token, tenantId, user]);

  const handleSeed = async () => {
    setLoading(true);
    setStatus('🌱 Seeding...');
    
    try {
      // Check if logged in
      if (!token || !tenantId) {
        const debugInfo = `Token: ${!!token}, TenantId: ${!!tenantId}`;
        console.error('Not logged in:', debugInfo);
        setStatus(`❌ Not logged in. ${debugInfo}`);
        setLoading(false);
        return;
      }
      
      console.log('Seeding for tenant:', tenantId);
      
      const api = getApi();
      
      // Call the seed endpoint
      const response = await api.post(`/patient-type-configurations/seed/${tenantId}`, {});
      
      console.log('Seed response:', response.data);
      setStatus(`✅ SUCCESS! Seeded: ${response.data.patientTypes.join(', ')}`);
      
      // Wait a bit then refresh the page
      setTimeout(() => {
        console.log('Refreshing page...');
        window.location.reload();
      }, 2000);
      
    } catch (error: any) {
      console.error('Seed error:', error);
      const errorMsg = error.response?.data?.message || error.message;
      setStatus(`❌ Error: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'white',
      padding: '15px',
      border: '2px solid #333',
      borderRadius: '8px',
      zIndex: 9999,
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      minWidth: '250px'
    }}>
      {/* Auth Status Display */}
      <div style={{
        fontSize: '11px',
        marginBottom: '10px',
        padding: '8px',
        background: '#f0f0f0',
        borderRadius: '4px',
        fontFamily: 'monospace'
      }}>
        <div>Token: {token ? '✅ Yes' : '❌ No'}</div>
        <div>Tenant: {tenantId ? `✅ ${tenantId.substring(0, 8)}...` : '❌ None'}</div>
        <div>User: {user ? '✅ Logged in' : '❌ Not logged in'}</div>
      </div>
      
      <button
        onClick={handleSeed}
        disabled={loading || !token || !tenantId}
        style={{
          padding: '10px 20px',
          background: (loading || !token || !tenantId) ? '#ccc' : '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: (loading || !token || !tenantId) ? 'not-allowed' : 'pointer',
          fontSize: '14px',
          fontWeight: 'bold',
          width: '100%'
        }}
      >
        {loading ? 'Seeding...' : '🌱 Seed Patient Types'}
      </button>
      {status && (
        <div style={{
          marginTop: '10px',
          fontSize: '12px',
          maxWidth: '300px',
          wordBreak: 'break-word',
          padding: '8px',
          background: status.startsWith('✅') ? '#d4edda' : '#f8d7da',
          borderRadius: '4px'
        }}>
          {status}
        </div>
      )}
    </div>
  );
}
