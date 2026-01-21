'use client';

import { useAuthStore } from '@/lib/auth-store';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getApi } from '@/lib/api';
import { Country, State, City } from 'country-state-city';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

interface Tenant {
  id: string;
  name: string;
  tenantCode: string;
  tenantType: string;
  status: 'Active' | 'Inactive' | 'Suspended';
  tier: 'Starter' | 'Standard' | 'Professional' | 'Enterprise';
  region: string;
  currentUserCount: number;
  maxUsers: number;
  subscriptionEndDate: string;
  complianceStatus: 'Compliant' | 'Non-Compliant' | 'Pending';
  currency?: string;
  language?: string;
  primaryDomain?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  features?: string[];
  createdAt?: string;
  updatedAt?: string;
}

type ViewMode = 'list' | 'create' | 'edit';

export default function TenantsPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterTier, setFilterTier] = useState<string>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState<Partial<Tenant>>({
    name: '',
    tenantCode: '',
    tenantType: 'Hospital',
    status: 'Active',
    tier: 'Standard',
    region: 'North America',
    maxUsers: 50,
    currency: 'USD',
    language: 'English',
    complianceStatus: 'Pending',
    primaryDomain: '',
    contactEmail: '',
    contactPhone: '',
    address: '',
    country: '',
    state: '',
    city: '',
    zipCode: '',
  });
  
  // Cascading address state
  const [selectedCountryIso, setSelectedCountryIso] = useState<string>('');
  const [selectedStateIso, setSelectedStateIso] = useState<string>('');
  const [availableStates, setAvailableStates] = useState<any[]>([]);
  const [availableCities, setAvailableCities] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      loadTenants();
    }
  }, [user]);

  const loadTenants = async () => {
    try {
      setLoading(true);
      setError(''); // Clear previous errors
      console.log('Loading tenants from /api/tenants...');
      const response = await getApi().get('/tenants');
      console.log('Tenants response:', response.data);
      setTenants(response.data || []);
      if (!response.data || response.data.length === 0) {
        console.log('No tenants found in database');
      }
    } catch (err: any) {
      console.error('Error loading tenants:', err);
      console.error('Error response:', err.response);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load tenants';
      setError(`Failed to load tenants: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // Cascading address handlers
  const handleCountryChange = (countryIso: string) => {
    const country = Country.getCountryByCode(countryIso);
    setSelectedCountryIso(countryIso);
    setFormData({ 
      ...formData, 
      country: country?.name || '',
      state: '',
      city: '',
      zipCode: ''
    });
    
    // Load states for selected country
    const states = State.getStatesOfCountry(countryIso);
    setAvailableStates(states);
    setSelectedStateIso('');
    setAvailableCities([]);
  };

  const handleStateChange = (stateIso: string) => {
    const state = availableStates.find(s => s.isoCode === stateIso);
    setSelectedStateIso(stateIso);
    setFormData({ 
      ...formData, 
      state: state?.name || '',
      city: '',
      zipCode: ''
    });
    
    // Load cities for selected state
    if (selectedCountryIso && stateIso) {
      const cities = City.getCitiesOfState(selectedCountryIso, stateIso);
      setAvailableCities(cities);
    }
  };

  const handleCityChange = (cityName: string) => {
    setFormData({ 
      ...formData, 
      city: cityName
    });
    // Note: Pincode auto-population would require additional data source
  };

  const handleCreate = async () => {
    if (!formData.name?.trim() || !formData.tenantCode?.trim()) {
      setError('Name and Tenant Code are required');
      return;
    }
    
    // Validate address if country is selected
    if (formData.country) {
      if (availableStates.length > 0 && !formData.state) {
        setError('State is required for the selected country');
        return;
      }
    }

    try {
      const payload = {
        ...formData,
        subscriptionEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
        currentUserCount: 0,
      };
      
      await getApi().post('/tenants', payload);
      setSuccess('Tenant created successfully');
      setViewMode('list');
      resetForm();
      loadTenants();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create tenant');
    }
  };

  const handleEdit = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setFormData(tenant);
    
    // Populate cascading address dropdowns if data exists
    if (tenant.country) {
      // Find country ISO code by name
      const country = Country.getAllCountries().find(c => c.name === tenant.country);
      if (country) {
        setSelectedCountryIso(country.isoCode);
        const states = State.getStatesOfCountry(country.isoCode);
        setAvailableStates(states);
        
        if (tenant.state) {
          // Find state ISO code by name
          const state = states.find(s => s.name === tenant.state);
          if (state) {
            setSelectedStateIso(state.isoCode);
            const cities = City.getCitiesOfState(country.isoCode, state.isoCode);
            setAvailableCities(cities);
          }
        }
      }
    }
        setViewMode('edit');
  };

  const handleUpdate = async () => {
    if (!selectedTenant?.id) return;
    
    // Validate address if country is selected
    if (formData.country) {
      if (availableStates.length > 0 && !formData.state) {
        setError('State is required for the selected country');
        return;
      }
    }

    try {
      setIsSaving(true);
      setError('');
      await getApi().put(`/tenants/${selectedTenant.id}/details`, formData);
      setSuccess('Tenant updated successfully');
      setViewMode('list');
      resetForm();
      loadTenants();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update tenant');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (tenantId: string) => {
    if (!confirm('Are you sure you want to delete this tenant? This action will soft-delete the tenant.')) return;

    try {
      await getApi().delete(`/tenants/${tenantId}`);
      setSuccess('Tenant deleted successfully');
      loadTenants();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete tenant');
    }
  };

  const handleStatusChange = async (tenantId: string, newStatus: string) => {
    try {
      await getApi().patch(`/tenants/${tenantId}/status`, { status: newStatus });
      setSuccess('Tenant status updated');
      loadTenants();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update status');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      tenantCode: '',
      tenantType: 'Hospital',
      status: 'Active',
      tier: 'Standard',
      region: 'North America',
      maxUsers: 50,
      currency: 'USD',
      language: 'English',
      complianceStatus: 'Pending',
      primaryDomain: '',
      contactEmail: '',
      contactPhone: '',
      address: '',
      country: '',
      state: '',
      city: '',
      zipCode: '',
    });
    setSelectedCountryIso('');
    setSelectedStateIso('');
    setAvailableStates([]);
    setAvailableCities([]);
    setSelectedTenant(null);
    setError('');
    setIsSaving(false);
  };

  const filteredTenants = tenants.filter(tenant => {
    const matchesSearch = 
      tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tenant.tenantCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tenant.contactEmail?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || tenant.status === filterStatus;
    const matchesTier = filterTier === 'all' || tenant.tier === filterTier;
    
    return matchesSearch && matchesStatus && matchesTier;
  });

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // List View
  if (viewMode === 'list') {
    return (
      <div className="p-6">
        <div>
          {/* Header */}
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Tenant Management</h1>
              <p className="text-gray-600 mt-2">Manage hospital tenants and subscriptions</p>
            </div>
            <button
              onClick={() => {
                resetForm();
                setViewMode('create');
              }}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
            >
              + Create Tenant
            </button>
          </div>

          {/* Success/Error Messages */}
          {success && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
              {success}
            </div>
          )}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
              {error}
              <button onClick={() => setError('')} className="float-right font-bold">×</button>
            </div>
          )}

          {/* Filters */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Search tenants..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Suspended">Suspended</option>
            </select>
            <select
              value={filterTier}
              onChange={(e) => setFilterTier(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Tiers</option>
              <option value="Starter">Starter</option>
              <option value="Standard">Standard</option>
              <option value="Professional">Professional</option>
              <option value="Enterprise">Enterprise</option>
            </select>
          </div>

          {/* Tenants Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                <p className="mt-2 text-gray-600">Loading tenants...</p>
              </div>
            ) : filteredTenants.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🏛️</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No Tenants Found</h3>
                <p className="text-gray-600 mb-4">
                  {searchQuery || filterStatus !== 'all' || filterTier !== 'all'
                    ? 'Try adjusting your filters'
                    : 'Create your first tenant to get started'}
                </p>
                {!searchQuery && filterStatus === 'all' && filterTier === 'all' && (
                  <button
                    onClick={() => setViewMode('create')}
                    className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
                  >
                    Create Tenant
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tenant
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tier
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Region
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Users
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Subscription
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Compliance
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredTenants.map((tenant) => (
                      <tr key={tenant.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{tenant.name}</div>
                          <div className="text-sm text-gray-500">{tenant.tenantCode}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            tenant.status === 'Active' ? 'bg-green-100 text-green-800' :
                            tenant.status === 'Suspended' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {tenant.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            tenant.tier === 'Enterprise' ? 'bg-purple-100 text-purple-800' :
                            tenant.tier === 'Professional' ? 'bg-blue-100 text-blue-800' :
                            tenant.tier === 'Standard' ? 'bg-indigo-100 text-indigo-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {tenant.tier}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {tenant.region}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {tenant.currentUserCount} / {tenant.maxUsers}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {new Date(tenant.subscriptionEndDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            tenant.complianceStatus === 'Compliant' ? 'bg-green-100 text-green-800' :
                            tenant.complianceStatus === 'Non-Compliant' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {tenant.complianceStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button
                            onClick={() => handleEdit(tenant)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(tenant.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Create/Edit Form View
  return (
    <div className="p-6">
      <div>
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            {viewMode === 'create' ? 'Create New Tenant' : 'Edit Tenant'}
          </h1>
          <p className="text-gray-600 mt-2">
            {viewMode === 'create' 
              ? 'Add a new hospital tenant to the system' 
              : 'Update tenant information and settings'}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
            {error}
            <button onClick={() => setError('')} className="float-right font-bold">×</button>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tenant Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="e.g., Apollo Eye Hospital"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tenant Code *
                  </label>
                  <input
                    type="text"
                    value={formData.tenantCode}
                    onChange={(e) => setFormData({ ...formData, tenantCode: e.target.value.toUpperCase() })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="e.g., APOLLO"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tenant Type
                  </label>
                  <select
                    value={formData.tenantType}
                    onChange={(e) => setFormData({ ...formData, tenantType: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="Hospital">Hospital</option>
                    <option value="Clinic">Clinic</option>
                    <option value="Healthcare System">Healthcare System</option>
                    <option value="Research Center">Research Center</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Subscription Settings */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Subscription Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subscription Tier
                  </label>
                  <select
                    value={formData.tier}
                    onChange={(e) => setFormData({ ...formData, tier: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="Starter">Starter</option>
                    <option value="Standard">Standard</option>
                    <option value="Professional">Professional</option>
                    <option value="Enterprise">Enterprise</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Users
                  </label>
                  <input
                    type="number"
                    value={formData.maxUsers}
                    onChange={(e) => setFormData({ ...formData, maxUsers: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    min="1"
                  />
                </div>
              </div>
            </div>

            {/* Regional Configuration */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Regional Configuration</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Region
                  </label>
                  <select
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="North America">North America</option>
                    <option value="South America">South America</option>
                    <option value="Europe">Europe</option>
                    <option value="Asia">Asia</option>
                    <option value="Africa">Africa</option>
                    <option value="Australia">Australia</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Currency
                  </label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                    <option value="INR">INR - Indian Rupee</option>
                    <option value="AUD">AUD - Australian Dollar</option>
                    <option value="CAD">CAD - Canadian Dollar</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Language
                  </label>
                  <select
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="English">English</option>
                    <option value="Spanish">Spanish</option>
                    <option value="French">French</option>
                    <option value="German">German</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Mandarin">Mandarin</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primary Domain
                  </label>
                  <input
                    type="text"
                    value={formData.primaryDomain}
                    onChange={(e) => setFormData({ ...formData, primaryDomain: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="e.g., apolloeye.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="admin@apolloeye.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Phone
                  </label>
                  <PhoneInput
                    country={'us'}
                    value={formData.contactPhone}
                    onChange={(phone) => setFormData({ ...formData, contactPhone: phone })}
                    containerClass="w-full"
                    inputClass="w-full"
                    buttonClass="border-gray-300"
                    inputStyle={{
                      width: '100%',
                      height: '42px',
                      fontSize: '14px',
                      paddingLeft: '48px',
                      borderRadius: '0.5rem',
                      border: '1px solid #d1d5db',
                    }}
                    buttonStyle={{
                      borderRadius: '0.5rem 0 0 0.5rem',
                      border: '1px solid #d1d5db',
                      backgroundColor: '#f9fafb',
                    }}
                    dropdownStyle={{
                      borderRadius: '0.5rem',
                    }}
                    enableSearch
                    searchPlaceholder="Search country"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>
            </div>

            {/* Address Section */}
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Address Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="123 Main Street, Suite 100"
                  />
                </div>
                
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedCountryIso}
                    onChange={(e) => handleCountryChange(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">Select Country</option>
                    {Country.getAllCountries().map((country) => (
                      <option key={country.isoCode} value={country.isoCode}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State/Province {selectedCountryIso && availableStates.length > 0 && <span className="text-red-500">*</span>}
                  </label>
                  <select
                    value={selectedStateIso}
                    onChange={(e) => handleStateChange(e.target.value)}
                    disabled={!selectedCountryIso || availableStates.length === 0}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {!selectedCountryIso ? 'Select country first' : availableStates.length === 0 ? 'No states available' : 'Select State'}
                    </option>
                    {availableStates.map((state) => (
                      <option key={state.isoCode} value={state.isoCode}>
                        {state.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <select
                    value={formData.city}
                    onChange={(e) => handleCityChange(e.target.value)}
                    disabled={!selectedStateIso || availableCities.length === 0}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {!selectedStateIso ? 'Select state first' : availableCities.length === 0 ? 'No cities available' : 'Select City'}
                    </option>
                    {availableCities.map((city) => (
                      <option key={city.name} value={city.name}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Zip/Postal Code
                  </label>
                  <input
                    type="text"
                    value={formData.zipCode}
                    onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="12345"
                  />
                </div>
              </div>
            </div>

            {/* Compliance Section */}
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Compliance Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Compliance Status
                  </label>
                  <select
                    value={formData.complianceStatus}
                    onChange={(e) => setFormData({ ...formData, complianceStatus: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="Compliant">Compliant</option>
                    <option value="Non-Compliant">Non-Compliant</option>
                    <option value="Pending">Pending Review</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <button
                onClick={() => {
                  setViewMode('list');
                  resetForm();
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={viewMode === 'create' ? handleCreate : handleUpdate}
                disabled={isSaving}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSaving && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                {isSaving 
                  ? 'Saving...' 
                  : viewMode === 'create' ? 'Create Tenant' : 'Update Tenant'
                }
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
