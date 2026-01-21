'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { departmentsApi } from '@/lib/api/departments.api';
import { useAuthStore } from '@/lib/auth-store';

export default function TestApiPage() {
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const { token, tenantId } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    const testApi = async () => {
      try {
        console.log('🧪 Test API - Token:', token ? 'Present' : 'Missing');
        console.log('🧪 Test API - TenantId:', tenantId);
        
        const response = await departmentsApi.getAll();
        
        console.log('🧪 Test API - Response:', response);
        console.log('🧪 Test API - Response type:', typeof response);
        console.log('🧪 Test API - Is Array:', Array.isArray(response));
        console.log('🧪 Test API - Length:', response?.length);
        
        setResult(response);
      } catch (err: any) {
        console.error('🧪 Test API - Error:', err);
        setError(err.response?.data?.message || err.message || 'Unknown error');
      }
    };

    if (token && tenantId) {
      testApi();
    } else {
      setError('Not logged in - missing token or tenantId. Please login first.');
    }
  }, [token, tenantId]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">API Test Page</h1>
      
      <div className="mb-4">
        <p><strong>Token:</strong> {token ? '✅ Present' : '❌ Missing'}</p>
        <p><strong>Tenant ID:</strong> {tenantId || '❌ Missing'}</p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
          {!token && (
            <button
              onClick={() => router.push('/auth/login')}
              className="mt-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Go to Login
            </button>
          )}
        </div>
      )}

      {result && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          <p><strong>Success! Received {Array.isArray(result) ? result.length : 0} departments</strong></p>
        </div>
      )}

      <div className="bg-gray-100 p-4 rounded">
        <h2 className="font-bold mb-2">Raw Response:</h2>
        <pre className="text-xs overflow-auto max-h-96">
          {JSON.stringify(result, null, 2)}
        </pre>
      </div>
    </div>
  );
}
