'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authApi, initializeApi, getApi } from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';
import axios from 'axios';

interface Tenant {
  id: string;
  name: string;
  tenantCode: string;
}

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  
  const [email, setEmail] = useState('admin@hospital.com');
  const [password, setPassword] = useState('Admin@123456');
  const [tenantId, setTenantId] = useState('');
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingTenants, setIsLoadingTenants] = useState(true);

  // Fetch tenants on component mount
  useEffect(() => {
    const fetchTenants = async () => {
      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5072/api';
        console.log('Fetching tenants from:', API_BASE_URL);
        
        // Try database first, fallback to mock data
        let response;
        try {
          response = await axios.get(`${API_BASE_URL}/tenants/debug/codes/db`, {
            timeout: 3000
          });
          console.log('Database tenants response:', response.data);
        } catch (dbError) {
          console.log('Database tenants not available, using mock data');
          response = await axios.get(`${API_BASE_URL}/tenants/debug/codes`, {
            timeout: 3000
          });
          console.log('Mock tenants response:', response.data);
        }
        
        // Check multiple possible response formats
        let tenantsList = [];
        if (response.data && Array.isArray(response.data.tenants)) {
          tenantsList = response.data.tenants;
        } else if (response.data && Array.isArray(response.data)) {
          tenantsList = response.data;
        }
        
        console.log('Parsed tenants list:', tenantsList);
        
        if (tenantsList.length > 0) {
          setTenants(tenantsList);
          setTenantId(tenantsList[0].id);
          console.log('Set tenants successfully:', tenantsList.length);
        } else {
          throw new Error('No tenants found in response');
        }
      } catch (err) {
        console.error('Error fetching tenants:', err);
        // Fallback to hardcoded tenant only if both APIs fail
        const fallbackTenants = [
          { id: '11111111-1111-1111-1111-111111111111', name: 'Apollo Hospitals - Main', tenantCode: 'APOLLO-MAIN' },
          { id: '22222222-2222-2222-2222-222222222222', name: 'Fortis Healthcare', tenantCode: 'FORTIS-01' },
          { id: '33333333-3333-3333-3333-333333333333', name: 'Max Healthcare', tenantCode: 'MAX-HC' },
          { id: '44444444-4444-4444-4444-444444444444', name: 'Narayana Health', tenantCode: 'NARAYANA' },
          { id: '55555555-5555-5555-5555-555555555555', name: 'Sankara Eye Hospital', tenantCode: 'SANKARA' }
        ];
        setTenants(fallbackTenants);
        setTenantId(fallbackTenants[0].id);
        console.log('Using fallback tenants:', fallbackTenants.length);
      } finally {
        setIsLoadingTenants(false);
      }
    };

    fetchTenants();
  }, []);

  const handleCreateAdmin = async () => {
    setError('');
    setIsLoading(true);

    try {
      const api = getApi();
      
      // Use the selected tenant or default to Apollo
      const createTenantId = tenantId || '11111111-1111-1111-1111-111111111111';
      
      const response = await api.post(`/auth/debug/create-admin?tenantId=${createTenantId}`);
      
      alert('Admin user created successfully! Email: admin@hospital.com, Password: Admin@123456');
      
      // Pre-fill the credentials
      setEmail('admin@hospital.com');
      setPassword('Admin@123456');
      setTenantId(createTenantId);
      
    } catch (err: any) {
      console.error('Create admin error:', err);
      const errorMessage = err.response?.data?.message 
        || err.response?.data?.error
        || err.message 
        || 'Failed to create admin user. Check backend logs.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Initialize API with tenant ID
      initializeApi();

      console.log('Attempting login with:', { email, password, tenantId });
      const response = await authApi.login(email, password, tenantId);
      console.log('Login response:', response);
      const { data } = response;
      console.log('Login data:', data);

      if (!data.success) {
        console.log('Login failed - no success flag');
        setError(data.message || 'Login failed');
        return;
      }

      console.log('Login successful, calling setAuth...');
      // Store auth state
      setAuth(
        data.accessToken,
        data.refreshToken,
        data.user,
        data.roles,
        data.permissions,
        tenantId,
        data.mustChangePassword
      );

      console.log('Auth state set, checking mustChangePassword:', data.mustChangePassword);
      // Redirect based on must change password flag
      if (data.mustChangePassword) {
        console.log('Redirecting to change password');
        router.push('/auth/change-password');
      } else {
        console.log('Redirecting to dashboard');
        router.push('/dashboard');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      let errorMessage = 'An error occurred during login. ';
      
      if (err.response?.data?.message) {
        errorMessage += err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage += err.response.data.error;
      } else if (err.message) {
        errorMessage += err.message;
      }
      
      // Add helpful hint if generic error
      if (errorMessage.includes('An error occurred during login') && !errorMessage.includes('user')) {
        errorMessage += ' (Database may be empty. Try clicking "Create Admin User" below.)';
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-indigo-600">Eye Hospital</h1>
          <p className="text-gray-600 mt-2">Hospital Management System</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tenant
            </label>
            {isLoadingTenants ? (
              <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500">
                Loading tenants...
              </div>
            ) : tenants.length > 0 ? (
              <select
                value={tenantId}
                onChange={(e) => setTenantId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                required
              >
                <option value="">Select your hospital</option>
                {tenants.map((tenant) => (
                  <option key={tenant.id} value={tenant.id}>
                    {tenant.name}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={tenantId}
                onChange={(e) => setTenantId(e.target.value)}
                placeholder="Enter your hospital tenant ID"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>

          <button
            type="button"
            onClick={handleCreateAdmin}
            disabled={isLoading}
            className="w-full mt-2 bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {isLoading ? 'Creating...' : 'Create Admin User (Dev Only)'}
          </button>
        </form>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700">
            <strong>Demo Credentials:</strong><br/>
            Email: admin@hospital.com<br/>
            Password: Use the one provided<br/>
            Tenant: Select from dropdown above
          </p>
        </div>
      </div>
    </div>
  );
}
