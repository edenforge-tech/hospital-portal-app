'use client';

import { useAuthStore } from '@/lib/auth-store';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getApi } from '@/lib/api';
import { Country, State, City } from 'country-state-city';
import BranchDetailsModal from '@/components/admin/BranchDetailsModal';
import EditBranchModal from '@/components/admin/EditBranchModal';
import AddBranchModal from '@/components/admin/AddBranchModal';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

interface Branch {
  id: string;
  organizationId: string;
  organizationName?: string;
  name: string; // API returns "Name" (PascalCase)
  code: string; // API returns "Code" (PascalCase)
  branchName?: string; // Keep for backward compatibility
  branchCode?: string; // Keep for backward compatibility
  branchType?: string;
  region: string;
  status: 'Active' | 'Inactive' | 'UnderMaintenance' | 'Closed';
  operationalStatus?: 'Operational' | 'Limited' | 'Closed';
  description?: string;
  
  // Address
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  
  // Contact
  phoneNumber?: string;
  faxNumber?: string;
  email?: string;
  website?: string;
  
  // Regional
  timezone?: string;
  currency?: string;
  primaryLanguage?: string;
  
  // Operational
  operatingHoursStart?: string;
  operatingHoursEnd?: string;
  emergencySupport24x7?: boolean;
  
  // Capacity
  totalBeds?: number;
  availableBeds?: number;
  icuBeds?: number;
  emergencyBeds?: number;
  
  // Statistics
  departmentCount?: number;
  staffCount?: number;
  patientCount?: number;
  
  // Compliance
  hipaaCompliant?: boolean;
  nabhAccredited?: boolean;
  jciAccredited?: boolean;
  iso9001Certified?: boolean;
  
  // Metadata
  createdAt?: string;
  updatedAt?: string;
}

type ViewMode = 'list' | 'map' | 'create' | 'edit' | 'details';
type FormStep = 1 | 2 | 3 | 4 | 5;

export default function BranchesPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  
  const [branches, setBranches] = useState<Branch[]>([]);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOrganization, setFilterOrganization] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterRegion, setFilterRegion] = useState<string>('all');
  const [filterTimezone, setFilterTimezone] = useState<string>('all');
  const [filterEmergency, setFilterEmergency] = useState<boolean | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formStep, setFormStep] = useState<FormStep>(1);
  const [activeTab, setActiveTab] = useState<'overview' | 'departments' | 'staff' | 'activities'>('overview');
  
  // Cascading address dropdowns
  const [selectedCountryIso, setSelectedCountryIso] = useState<string>('US');
  const [selectedStateIso, setSelectedStateIso] = useState<string>('');
  const [availableStates, setAvailableStates] = useState<any[]>([]);
  const [availableCities, setAvailableCities] = useState<any[]>([]);
  
  // Form state
  const [formData, setFormData] = useState<Partial<Branch>>({
    organizationId: '',
    branchName: '',
    branchCode: '',
    branchType: 'Hospital',
    region: 'North America',
    status: 'Active',
    operationalStatus: 'Operational',
    description: '',
    address: '',
    city: '',
    state: '',
    country: 'US',
    postalCode: '',
    phoneNumber: '',
    faxNumber: '',
    email: '',
    website: '',
    timezone: 'America/New_York',
    currency: 'USD',
    primaryLanguage: 'English',
    operatingHoursStart: '08:00',
    operatingHoursEnd: '17:00',
    emergencySupport24x7: false,
    totalBeds: 0,
    icuBeds: 0,
    emergencyBeds: 0,
    hipaaCompliant: false,
    nabhAccredited: false,
    jciAccredited: false,
    iso9001Certified: false,
  });
  
  const [departmentTemplate, setDepartmentTemplate] = useState<string>('');

  useEffect(() => {
    if (!user) {
      router.push('/');
    } else {
      loadData();
    }
  }, [user, router]);

  // Initialize cascading dropdowns when form data changes
  useEffect(() => {
    if (formData.country || formData.state || formData.city) {
      // Find country ISO code
      const countries = Country.getAllCountries();
      const country = countries.find(c => 
        c.name === formData.country || c.isoCode === formData.country
      );
      
      if (country) {
        setSelectedCountryIso(country.isoCode);
        const states = State.getStatesOfCountry(country.isoCode);
        setAvailableStates(states);
        
        // Find state ISO code
        if (formData.state) {
          const state = states.find(s => s.name === formData.state || s.isoCode === formData.state);
          if (state) {
            setSelectedStateIso(state.isoCode);
            const cities = City.getCitiesOfState(country.isoCode, state.isoCode);
            setAvailableCities(cities);
          }
        }
      }
    }
  }, [formData.country, formData.state, formData.city]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Load branches
      console.log('Loading branches from /api/branches...');
      const branchesResponse = await getApi().get('/branches');
      console.log('Branches response:', branchesResponse.data);
      
      // The API returns { branches: [...], totalCount: ..., pageNumber: ..., etc }
      // Extract the branches array from the response
      const branchesData = branchesResponse.data?.branches || branchesResponse.data?.Branches || branchesResponse.data || [];
      console.log('Extracted branches array:', branchesData);
      setBranches(Array.isArray(branchesData) ? branchesData : []);
      
      // Load organizations
      try {
        const orgsResponse = await getApi().get('/organizations');
        console.log('Organizations response:', orgsResponse.data);
        
        // The API returns { organizations: [...], totalCount: ..., etc }
        // Extract the organizations array from the response
        const orgsData = orgsResponse.data?.organizations || orgsResponse.data?.Organizations || orgsResponse.data || [];
        console.log('Extracted organizations array:', orgsData);
        setOrganizations(Array.isArray(orgsData) ? orgsData : []);
      } catch (orgErr) {
        console.warn('Failed to load organizations:', orgErr);
        setOrganizations([]);
      }
      
    } catch (err: any) {
      console.error('Error loading data:', err);
      console.error('Error response:', err.response);
      console.error('Error response data:', err.response?.data);
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to load branches';
      const stack = err.response?.data?.stack;
      setError(`Failed to load branches: ${errorMessage}${stack ? '\n\nStack: ' + stack.substring(0, 500) : ''}`);
      // Auto-clear error after 10 seconds
      setTimeout(() => setError(''), 10000);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBranch = () => {
    setIsAddModalOpen(true);
    setSelectedBranch(null);
    setFormData({
      organizationId: '',
      branchName: '',
      branchCode: '',
      branchType: 'Hospital',
      region: 'North America',
      status: 'Active',
      operationalStatus: 'Operational',
      description: '',
      address: '',
      city: '',
      state: '',
      country: 'US',
      postalCode: '',
      phoneNumber: '',
      faxNumber: '',
      email: '',
      website: '',
      timezone: 'America/New_York',
      currency: 'USD',
      primaryLanguage: 'English',
      operatingHoursStart: '08:00',
      operatingHoursEnd: '17:00',
      emergencySupport24x7: false,
      totalBeds: 0,
      icuBeds: 0,
      emergencyBeds: 0,
      hipaaCompliant: false,
      nabhAccredited: false,
      jciAccredited: false,
      iso9001Certified: false,
    });
    setDepartmentTemplate('');
  };

  const handleEditBranch = async (branch: Branch) => {
    setSelectedBranch(branch);
    
    // Fetch full details from backend
    try {
      const response = await getApi().get(`/branches/${branch.id}`);
      const details = response.data;
      
      // Map backend field names to frontend field names
      setFormData({
        organizationId: details.organizationId || branch.organizationId,
        branchName: details.name || branch.name || branch.branchName || '',
        branchCode: details.code || branch.code || branch.branchCode || '',
        branchType: details.branchType || branch.branchType || 'Hospital',
        region: details.region || branch.region || 'North America',
        status: details.status || branch.status || 'Active',
        operationalStatus: details.operationalStatus || branch.operationalStatus || 'Operational',
        description: details.description || branch.description || '',
        
        // Address fields
        address: details.addressLine1 || branch.address || '',
        city: details.city || branch.city || '',
        state: details.stateProvince || branch.state || '',
        country: details.countryCode || branch.country || '',
        postalCode: details.postalCode || branch.postalCode || '',
        latitude: details.latitude || branch.latitude,
        longitude: details.longitude || branch.longitude,
        
        // Contact fields
        phoneNumber: details.phone || branch.phoneNumber || branch.phone || '',
        faxNumber: details.fax || branch.faxNumber || branch.fax || '',
        email: details.email || branch.email || '',
        website: details.website || branch.website || '',
        
        // Regional settings
        timezone: details.timezone || branch.timezone || 'America/New_York',
        currency: details.currency || branch.currency || 'USD',
        primaryLanguage: details.languagePrimary || branch.primaryLanguage || 'English',
        
        // Operational hours
        operatingHoursStart: details.operationalHoursStart ? String(details.operationalHoursStart).substring(0, 5) : branch.operatingHoursStart || '08:00',
        operatingHoursEnd: details.operationalHoursEnd ? String(details.operationalHoursEnd).substring(0, 5) : branch.operatingHoursEnd || '17:00',
        emergencySupport24x7: details.emergencySupport24x7 !== undefined ? details.emergencySupport24x7 : branch.emergencySupport24x7 || false,
        
        // Capacity fields
        totalBeds: details.totalBeds !== undefined ? details.totalBeds : branch.totalBeds || 0,
        icuBeds: details.icuBeds !== undefined ? details.icuBeds : branch.icuBeds || 0,
        emergencyBeds: details.emergencyBeds !== undefined ? details.emergencyBeds : branch.emergencyBeds || 0,
        
        // Compliance fields
        hipaaCompliant: details.hipaaCompliant !== undefined ? details.hipaaCompliant : branch.hipaaCompliant || false,
        nabhAccredited: details.nabhAccredited !== undefined ? details.nabhAccredited : branch.nabhAccredited || false,
        jciAccredited: details.jciAccredited !== undefined ? details.jciAccredited : branch.jciAccredited || false,
        iso9001Certified: details.iso9001Certified !== undefined ? details.iso9001Certified : branch.iso9001Certified || false,
      });
      
      // Close view modal and open edit modal
      setViewMode('list');
      setIsEditModalOpen(true);
    } catch (err) {
      console.error('Failed to load branch details:', err);
      // Fall back to existing data
      setFormData({
        ...branch,
        branchName: branch.name || branch.branchName || '',
        branchCode: branch.code || branch.branchCode || '',
        phoneNumber: branch.phoneNumber || branch.phone || '',
        faxNumber: branch.faxNumber || branch.fax || '',
      });
      
      // Close view modal and open edit modal even with fallback data
      setViewMode('list');
      setIsEditModalOpen(true);
    }
  };

  const handleViewBranch = (branch: Branch) => {
    setSelectedBranch(branch);
    setViewMode('details');
    setActiveTab('overview'); // Reset to overview tab when viewing a branch
  };

  const handleDeleteBranch = async (branchId: string) => {
    if (!confirm('Are you sure you want to delete this branch? This action cannot be undone.')) {
      return;
    }

    try {
      await getApi().delete(`/branches/${branchId}`);
      setSuccess('Branch deleted successfully');
      loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to delete branch';
      setError(`Failed to delete branch: ${errorMessage}`);
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleSaveFromModal = async (updatedData: Partial<Branch>) => {
    if (!selectedBranch) return;

    try {
      // Transform form data to match backend API field names
      const apiPayload = {
        ...updatedData,
        name: updatedData.branchName,
        code: updatedData.branchCode,
        addressLine1: updatedData.address,
        stateProvince: updatedData.state,
        countryCode: updatedData.country,
        phone: updatedData.phoneNumber,
        fax: updatedData.faxNumber,
        languagePrimary: updatedData.primaryLanguage,
        operationalHoursStart: updatedData.operatingHoursStart,
        operationalHoursEnd: updatedData.operatingHoursEnd,
      };

      await getApi().put(`/branches/${selectedBranch.id}`, apiPayload);
      setSuccess('Branch updated successfully');
      setIsEditModalOpen(false);
      loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to save branch';
      setError(`Failed to save branch: ${errorMessage}`);
      console.error('Branch save error:', err.response?.data);
      throw err; // Rethrow so modal can handle it
    }
  };

  const handleCreateFromModal = async (newData: Partial<Branch>) => {
    try {
      // Transform form data to match backend API field names
      const apiPayload = {
        ...newData,
        name: newData.branchName,
        code: newData.branchCode,
        addressLine1: newData.address,
        stateProvince: newData.state,
        countryCode: newData.country,
        phone: newData.phoneNumber,
        fax: newData.faxNumber,
        languagePrimary: newData.primaryLanguage,
        operationalHoursStart: newData.operatingHoursStart,
        operationalHoursEnd: newData.operatingHoursEnd,
      };

      await getApi().post('/branches', apiPayload);
      setSuccess('Branch created successfully');
      setIsAddModalOpen(false);
      loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to create branch';
      setError(`Failed to create branch: ${errorMessage}`);
      console.error('Branch create error:', err.response?.data);
      throw err; // Rethrow so modal can handle it
    }
  };

  const handleSubmitBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent form submission if not on the final step
    if (viewMode === 'edit' && formStep !== 4) {
      return; // Don't submit if not on final step in edit mode
    }
    if (viewMode === 'create' && formStep !== 5) {
      return; // Don't submit if not on final step in create mode
    }
    
    setError('');
    setSuccess('');

    try {
      // Transform form data to match backend API field names
      const apiPayload = {
        ...formData,
        name: formData.branchName,
        code: formData.branchCode,
        addressLine1: formData.address,
        stateProvince: formData.state,
        countryCode: formData.country,
        phone: formData.phoneNumber,
        fax: formData.faxNumber,
        languagePrimary: formData.primaryLanguage,
        operationalHoursStart: formData.operatingHoursStart,
        operationalHoursEnd: formData.operatingHoursEnd,
      };
      
      if (viewMode === 'create') {
        await getApi().post('/branches', apiPayload);
        setSuccess('Branch created successfully');
      } else if (viewMode === 'edit' && selectedBranch) {
        await getApi().put(`/branches/${selectedBranch.id}`, apiPayload);
        setSuccess('Branch updated successfully');
      }
      
      setViewMode('list');
      loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to save branch';
      setError(`Failed to save branch: ${errorMessage}`);
      console.error('Branch save error:', err.response?.data);
    }
  };

  const handleFormChange = (field: keyof Branch, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCountryChange = (countryIso: string) => {
    setSelectedCountryIso(countryIso);
    setSelectedStateIso('');
    
    // Store ISO code instead of country name (database expects VARCHAR(4))
    setFormData(prev => ({ ...prev, country: countryIso, state: '', city: '' }));
    
    if (countryIso) {
      const states = State.getStatesOfCountry(countryIso);
      setAvailableStates(states);
      setAvailableCities([]);
    } else {
      setAvailableStates([]);
      setAvailableCities([]);
    }
  };

  const handleStateChange = (stateIso: string) => {
    setSelectedStateIso(stateIso);
    const stateName = availableStates.find(s => s.isoCode === stateIso)?.name || '';
    setFormData(prev => ({ ...prev, state: stateName, city: '' }));
    
    if (stateIso && selectedCountryIso) {
      const cities = City.getCitiesOfState(selectedCountryIso, stateIso);
      setAvailableCities(cities);
    } else {
      setAvailableCities([]);
    }
  };

  const handleCityChange = (cityName: string) => {
    setFormData(prev => ({ ...prev, city: cityName }));
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Inactive': return 'bg-gray-100 text-gray-800';
      case 'UnderMaintenance': return 'bg-yellow-100 text-yellow-800';
      case 'Closed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getOperationalBadgeColor = (status?: string) => {
    switch (status) {
      case 'Operational': return 'bg-green-100 text-green-800';
      case 'Limited': return 'bg-yellow-100 text-yellow-800';
      case 'Closed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Filter branches
  const filteredBranches = branches.filter(branch => {
    const branchName = branch.name || branch.branchName || '';
    const branchCode = branch.code || branch.branchCode || '';
    
    const matchesSearch = 
      branchName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      branchCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      branch.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      branch.organizationName?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesOrg = filterOrganization === 'all' || branch.organizationId === filterOrganization;
    const matchesStatus = filterStatus === 'all' || branch.status === filterStatus;
    const matchesRegion = filterRegion === 'all' || branch.region === filterRegion;
    const matchesTimezone = filterTimezone === 'all' || branch.timezone === filterTimezone;
    const matchesEmergency = filterEmergency === null || branch.emergencySupport24x7 === filterEmergency;
    
    return matchesSearch && matchesOrg && matchesStatus && matchesRegion && matchesTimezone && matchesEmergency;
  });

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="p-8">
        <div>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading branches...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // LIST VIEW
  if (viewMode === 'list') {
    return (
      <div className="p-8">
        <div>
          {/* Header */}
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Branch Management</h1>
              <p className="text-gray-600 mt-2">Manage hospital branches and locations</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setViewMode(viewMode === 'list' ? 'map' : 'list')}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
              >
                {viewMode === 'list' ? '🗺️ Map View' : '📋 List View'}
              </button>
              <button
                onClick={handleCreateBranch}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                + Add Branch
              </button>
            </div>
          </div>

          {/* Success/Error Messages */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
              {success}
            </div>
          )}

          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              {/* Search */}
              <div className="lg:col-span-2">
                <input
                  type="text"
                  placeholder="Search branches (name, code, city)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              {/* Organization Filter */}
              <div>
                <select
                  value={filterOrganization}
                  onChange={(e) => setFilterOrganization(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="all">All Organizations</option>
                  {organizations.map(org => (
                    <option key={org.id} value={org.id}>{org.name}</option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="all">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="UnderMaintenance">Under Maintenance</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              {/* Region Filter */}
              <div>
                <select
                  value={filterRegion}
                  onChange={(e) => setFilterRegion(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="all">All Regions</option>
                  <option value="North America">North America</option>
                  <option value="Europe">Europe</option>
                  <option value="Asia Pacific">Asia Pacific</option>
                  <option value="Middle East">Middle East</option>
                  <option value="Latin America">Latin America</option>
                  <option value="Africa">Africa</option>
                </select>
              </div>

              {/* Emergency Support Filter */}
              <div>
                <select
                  value={filterEmergency === null ? 'all' : filterEmergency.toString()}
                  onChange={(e) => setFilterEmergency(e.target.value === 'all' ? null : e.target.value === 'true')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="all">24/7 Emergency</option>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
            </div>
          </div>

          {/* Branches Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {filteredBranches.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <div className="text-6xl mb-4">🏥</div>
                <p className="text-lg">No branches found</p>
                <p className="text-sm mt-2">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Branch
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Organization
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Operational
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Departments
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Staff
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredBranches.map((branch) => (
                      <tr key={branch.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="text-sm font-medium text-gray-900">{branch.name || branch.branchName}</div>
                          </div>
                          <div className="text-sm text-gray-500">{branch.code || branch.branchCode}</div>
                          {branch.emergencySupport24x7 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 mt-1">
                              24/7 Emergency
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{branch.organizationName || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{branch.city || 'N/A'}</div>
                          <div className="text-sm text-gray-500">{branch.region}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(branch.status)}`}>
                            {branch.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getOperationalBadgeColor(branch.operationalStatus)}`}>
                            {branch.operationalStatus || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {branch.departmentCount || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {branch.staffCount || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleViewBranch(branch)}
                            className="text-indigo-600 hover:text-indigo-900 mr-3"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleEditBranch(branch)}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteBranch(branch.id)}
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


          {/* Summary */}
          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredBranches.length} of {branches.length} branches
          </div>
        </div>

        {/* Edit Branch Modal */}
        <EditBranchModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          branch={selectedBranch}
          organizations={organizations}
          onSave={handleSaveFromModal}
        />

        {/* Add Branch Modal */}
        <AddBranchModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          organizations={organizations}
          onCreate={handleCreateFromModal}
        />
      </div>
    );
  }

  // CREATE/EDIT FORM VIEW
  if (viewMode === 'create' || viewMode === 'edit') {
    return (
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => setViewMode('list')}
              className="text-indigo-600 hover:text-indigo-800 mb-4"
            >
              ← Back to Branches
            </button>
            <h1 className="text-3xl font-bold text-gray-900">
              {viewMode === 'create' ? 'Create New Branch' : 'Edit Branch'}
            </h1>
            <p className="text-gray-600 mt-2">
              {viewMode === 'create' ? 'Add a new hospital branch' : 'Update branch information'}
            </p>
          </div>

          {/* Error Messages */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {/* Multi-step Form Progress */}
          <div className="mb-8 bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              {(viewMode === 'edit' ? [1, 2, 3, 4] : [1, 2, 3, 4, 5]).map((step) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                      formStep === step
                        ? 'bg-indigo-600 text-white'
                        : formStep > step
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {formStep > step ? '✓' : step}
                  </div>
                  <div className="ml-2 text-sm">
                    <div className="font-medium">
                      {step === 1 && 'Basic Info'}
                      {step === 2 && 'Address & Contact'}
                      {step === 3 && 'Regional Config'}
                      {step === 4 && 'Operations'}
                      {step === 5 && 'Departments'}
                    </div>
                  </div>
                  {step < (viewMode === 'edit' ? 4 : 5) && (
                    <div className="w-12 h-1 mx-4 bg-gray-200">
                      <div
                        className={`h-full ${formStep > step ? 'bg-green-500' : 'bg-gray-200'}`}
                      ></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <div className="bg-white rounded-lg shadow-md p-6">
            {/* Step 1: Basic Info */}
            {formStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
                
                {/* Organization */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Organization <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.organizationId}
                    onChange={(e) => handleFormChange('organizationId', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">Select Organization</option>
                    {organizations.map(org => (
                      <option key={org.id} value={org.id}>{org.name}</option>
                    ))}
                  </select>
                </div>

                {/* Branch Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Branch Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.branchName}
                    onChange={(e) => handleFormChange('branchName', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="e.g., Central Hospital"
                  />
                </div>

                {/* Branch Code */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Branch Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.branchCode}
                    onChange={(e) => handleFormChange('branchCode', e.target.value.toUpperCase())}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="e.g., HOSP-001"
                  />
                </div>

                {/* Region & Type */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Region <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={formData.region}
                      onChange={(e) => handleFormChange('region', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="North America">North America</option>
                      <option value="Europe">Europe</option>
                      <option value="Asia Pacific">Asia Pacific</option>
                      <option value="Middle East">Middle East</option>
                      <option value="Latin America">Latin America</option>
                      <option value="Africa">Africa</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Branch Type
                    </label>
                    <select
                      value={formData.branchType}
                      onChange={(e) => handleFormChange('branchType', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="Hospital">Hospital</option>
                      <option value="Clinic">Clinic</option>
                      <option value="DiagnosticCenter">Diagnostic Center</option>
                      <option value="Pharmacy">Pharmacy</option>
                      <option value="Laboratory">Laboratory</option>
                    </select>
                  </div>
                </div>

                {/* Status */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => handleFormChange('status', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="UnderMaintenance">Under Maintenance</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Operational Status
                    </label>
                    <select
                      value={formData.operationalStatus}
                      onChange={(e) => handleFormChange('operationalStatus', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="Operational">Operational</option>
                      <option value="Limited">Limited</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleFormChange('description', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Brief description of the branch..."
                  />
                </div>
              </div>
            )}

            {/* Step 2: Address & Contact */}
            {formStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Address & Contact Information</h2>
                
                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address Line 1
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleFormChange('address', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Street address, building number"
                  />
                </div>

                {/* Country */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
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

                {/* State/Province and City */}
                <div className="grid grid-cols-2 gap-4">
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
                      value={formData.city || ''}
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
                </div>

                {/* Postal Code */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Postal Code
                  </label>
                  <input
                      type="text"
                      value={formData.postalCode}
                      onChange={(e) => handleFormChange('postalCode', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                </div>

                {/* Coordinates */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Latitude
                    </label>
                    <input
                      type="number"
                      step="0.000001"
                      value={formData.latitude || ''}
                      onChange={(e) => handleFormChange('latitude', parseFloat(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="e.g., 40.7128"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Longitude
                    </label>
                    <input
                      type="number"
                      step="0.000001"
                      value={formData.longitude || ''}
                      onChange={(e) => handleFormChange('longitude', parseFloat(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="e.g., -74.0060"
                    />
                  </div>
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <PhoneInput
                      country={'us'}
                      value={formData.phoneNumber}
                      onChange={(phone) => handleFormChange('phoneNumber', phone)}
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fax Number
                    </label>
                    <PhoneInput
                      country={'us'}
                      value={formData.faxNumber}
                      onChange={(phone) => handleFormChange('faxNumber', phone)}
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleFormChange('email', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="branch@hospital.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Website
                    </label>
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) => handleFormChange('website', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="https://branch.hospital.com"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Regional Configuration */}
            {formStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Regional Configuration</h2>
                
                {/* Timezone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Timezone
                  </label>
                  <select
                    value={formData.timezone}
                    onChange={(e) => handleFormChange('timezone', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="America/New_York">Eastern Time (ET)</option>
                    <option value="America/Chicago">Central Time (CT)</option>
                    <option value="America/Denver">Mountain Time (MT)</option>
                    <option value="America/Los_Angeles">Pacific Time (PT)</option>
                    <option value="Europe/London">London (GMT)</option>
                    <option value="Europe/Paris">Central European Time (CET)</option>
                    <option value="Asia/Dubai">Gulf Standard Time (GST)</option>
                    <option value="Asia/Kolkata">India Standard Time (IST)</option>
                    <option value="Asia/Singapore">Singapore Time (SGT)</option>
                    <option value="Asia/Tokyo">Japan Standard Time (JST)</option>
                    <option value="Australia/Sydney">Australian Eastern Time (AET)</option>
                  </select>
                </div>

                {/* Currency */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Currency
                  </label>
                  <select
                    value={formData.currency}
                    onChange={(e) => handleFormChange('currency', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                    <option value="INR">INR - Indian Rupee</option>
                    <option value="AED">AED - UAE Dirham</option>
                    <option value="SAR">SAR - Saudi Riyal</option>
                    <option value="SGD">SGD - Singapore Dollar</option>
                    <option value="JPY">JPY - Japanese Yen</option>
                    <option value="AUD">AUD - Australian Dollar</option>
                    <option value="CAD">CAD - Canadian Dollar</option>
                  </select>
                </div>

                {/* Primary Language */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primary Language
                  </label>
                  <select
                    value={formData.primaryLanguage}
                    onChange={(e) => handleFormChange('primaryLanguage', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="English">English</option>
                    <option value="Spanish">Spanish</option>
                    <option value="French">French</option>
                    <option value="German">German</option>
                    <option value="Arabic">Arabic</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Mandarin">Mandarin</option>
                    <option value="Japanese">Japanese</option>
                    <option value="Portuguese">Portuguese</option>
                  </select>
                </div>
              </div>
            )}

            {/* Step 4: Operational Details */}
            {formStep === 4 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Operational Details</h2>
                
                {/* Operating Hours */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={formData.operatingHoursStart}
                      onChange={(e) => handleFormChange('operatingHoursStart', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Time
                    </label>
                    <input
                      type="time"
                      value={formData.operatingHoursEnd}
                      onChange={(e) => handleFormChange('operatingHoursEnd', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Emergency Support */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.emergencySupport24x7}
                    onChange={(e) => handleFormChange('emergencySupport24x7', e.target.checked)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    24/7 Emergency Support
                  </label>
                </div>

                {/* Bed Capacity */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Total Beds
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.totalBeds}
                      onChange={(e) => handleFormChange('totalBeds', parseInt(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ICU Beds
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.icuBeds}
                      onChange={(e) => handleFormChange('icuBeds', parseInt(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Emergency Beds
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.emergencyBeds}
                      onChange={(e) => handleFormChange('emergencyBeds', parseInt(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Compliance Certifications */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Compliance & Certifications
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.hipaaCompliant}
                        onChange={(e) => handleFormChange('hipaaCompliant', e.target.checked)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 block text-sm text-gray-900">
                        HIPAA Compliant
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.nabhAccredited}
                        onChange={(e) => handleFormChange('nabhAccredited', e.target.checked)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 block text-sm text-gray-900">
                        NABH Accredited
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.jciAccredited}
                        onChange={(e) => handleFormChange('jciAccredited', e.target.checked)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 block text-sm text-gray-900">
                        JCI Accredited
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.iso9001Certified}
                        onChange={(e) => handleFormChange('iso9001Certified', e.target.checked)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 block text-sm text-gray-900">
                        ISO 9001 Certified
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Department Template */}
            {formStep === 5 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Department Template Selection</h2>
                <p className="text-sm text-gray-600 mb-4">
                  Choose a department template to automatically create departments for this branch
                </p>
                
                {/* Template Options */}
                <div className="space-y-4">
                  <div
                    onClick={() => setDepartmentTemplate('small')}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition ${
                      departmentTemplate === 'small'
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-300 hover:border-indigo-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">Small Clinic</h3>
                        <p className="text-sm text-gray-600 mt-1">3-5 basic departments</p>
                      </div>
                      <div className="text-indigo-600 font-semibold">5 departments</div>
                    </div>
                    {departmentTemplate === 'small' && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <ul className="text-sm text-gray-700 space-y-1">
                          <li>• General Medicine</li>
                          <li>• Emergency Services</li>
                          <li>• Laboratory</li>
                          <li>• Pharmacy</li>
                          <li>• Administration</li>
                        </ul>
                      </div>
                    )}
                  </div>

                  <div
                    onClick={() => setDepartmentTemplate('medium')}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition ${
                      departmentTemplate === 'medium'
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-300 hover:border-indigo-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">Medium Hospital</h3>
                        <p className="text-sm text-gray-600 mt-1">10-15 specialized departments</p>
                      </div>
                      <div className="text-indigo-600 font-semibold">12 departments</div>
                    </div>
                    {departmentTemplate === 'medium' && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <ul className="text-sm text-gray-700 space-y-1 grid grid-cols-2 gap-1">
                          <li>• General Medicine</li>
                          <li>• Surgery</li>
                          <li>• Cardiology</li>
                          <li>• Orthopedics</li>
                          <li>• Pediatrics</li>
                          <li>• Obstetrics & Gynecology</li>
                          <li>• Emergency Services</li>
                          <li>• ICU</li>
                          <li>• Laboratory</li>
                          <li>• Radiology</li>
                          <li>• Pharmacy</li>
                          <li>• Administration</li>
                        </ul>
                      </div>
                    )}
                  </div>

                  <div
                    onClick={() => setDepartmentTemplate('large')}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition ${
                      departmentTemplate === 'large'
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-300 hover:border-indigo-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">Large Hospital</h3>
                        <p className="text-sm text-gray-600 mt-1">20+ comprehensive departments</p>
                      </div>
                      <div className="text-indigo-600 font-semibold">22 departments</div>
                    </div>
                    {departmentTemplate === 'large' && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <ul className="text-sm text-gray-700 space-y-1 grid grid-cols-2 gap-1">
                          <li>• General Medicine</li>
                          <li>• Surgery</li>
                          <li>• Cardiology</li>
                          <li>• Neurology</li>
                          <li>• Orthopedics</li>
                          <li>• Pediatrics</li>
                          <li>• Obstetrics & Gynecology</li>
                          <li>• Dermatology</li>
                          <li>• Psychiatry</li>
                          <li>• Ophthalmology</li>
                          <li>• ENT</li>
                          <li>• Oncology</li>
                          <li>• Nephrology</li>
                          <li>• Urology</li>
                          <li>• Emergency Services</li>
                          <li>• ICU</li>
                          <li>• NICU</li>
                          <li>• Laboratory</li>
                          <li>• Radiology</li>
                          <li>• Pharmacy</li>
                          <li>• Physical Therapy</li>
                          <li>• Administration</li>
                        </ul>
                      </div>
                    )}
                  </div>

                  <div
                    onClick={() => setDepartmentTemplate('custom')}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition ${
                      departmentTemplate === 'custom'
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-300 hover:border-indigo-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">Custom Selection</h3>
                        <p className="text-sm text-gray-600 mt-1">Manually select departments after creation</p>
                      </div>
                      <div className="text-indigo-600 font-semibold">0 departments</div>
                    </div>
                  </div>

                  <div
                    onClick={() => setDepartmentTemplate('none')}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition ${
                      departmentTemplate === 'none'
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-300 hover:border-indigo-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">Skip Department Setup</h3>
                        <p className="text-sm text-gray-600 mt-1">Add departments later</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Form Navigation */}
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => {
                  if (formStep > 1) {
                    setFormStep((formStep - 1) as FormStep);
                  } else {
                    setViewMode('list');
                  }
                }}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                {formStep === 1 ? 'Cancel' : 'Previous'}
              </button>

              {/* Show Update button on step 4 for edit mode, Next for create mode or earlier steps */}
              {viewMode === 'edit' && formStep === 4 ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    handleSubmitBranch(e as any);
                  }}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  Update Branch
                </button>
              ) : viewMode === 'create' && formStep === 5 ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    handleSubmitBranch(e as any);
                  }}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  Create Branch
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    const maxStep = viewMode === 'edit' ? 4 : 5;
                    const nextStep = Math.min(formStep + 1, maxStep) as FormStep;
                    setFormStep(nextStep);
                  }}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                  Next
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // DETAILS VIEW (Modal)
  if (viewMode === 'details' && selectedBranch) {
    return (
      <BranchDetailsModal
        branch={selectedBranch}
        onClose={() => setViewMode('list')}
        onEdit={handleEditBranch}
      />
    );
  }

  // MAP VIEW (Placeholder)
  if (viewMode === 'map') {
    return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Branch Map View</h1>
              <p className="text-gray-600 mt-2">Interactive map showing all branch locations</p>
            </div>
            <button
              onClick={() => setViewMode('list')}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
            >
              📋 List View
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="text-center">
              <div className="text-6xl mb-4">🗺️</div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">Map Integration Coming Soon</h2>
              <p className="text-gray-600 mb-4">
                Interactive Google Maps/Mapbox integration will be added here
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-left max-w-2xl mx-auto">
                <h3 className="font-semibold text-blue-900 mb-3">Planned Features:</h3>
                <ul className="space-y-2 text-blue-800">
                  <li>• Branch markers with info windows</li>
                  <li>• Click marker to view branch details</li>
                  <li>• Filter markers by organization/region</li>
                  <li>• Get directions link</li>
                  <li>• Cluster markers for dense areas</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}