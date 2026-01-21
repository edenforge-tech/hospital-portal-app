'use client';

import { useState, useEffect } from 'react';
import { X, Loader2, Building2, MapPin, Phone, Mail, Globe, Calendar, FileText } from 'lucide-react';
import { useAuthStore } from '@/lib/auth-store';
import { Country, State, City } from 'country-state-city';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import {
  organizationsApi,
  CreateOrganizationRequest,
  UpdateOrganizationRequest,
  OrganizationDetails,
  Organization,
} from '@/lib/api/organizations.api';

interface OrganizationFormModalProps {
  organization?: OrganizationDetails;
  onClose: () => void;
  onSaved: () => void;
}

export default function OrganizationFormModal({ organization, onClose, onSaved }: OrganizationFormModalProps) {
  const { user } = useAuthStore();
  const isEditMode = !!organization;

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'contact' | 'config'>('basic');
  
  // Cascading address state
  const [selectedCountryIso, setSelectedCountryIso] = useState<string>('');
  const [selectedStateIso, setSelectedStateIso] = useState<string>('');
  const [availableStates, setAvailableStates] = useState<any[]>([]);
  const [availableCities, setAvailableCities] = useState<any[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    name: organization?.name || '',
    code: organization?.code || '',
    type: organization?.type || '',
    description: organization?.description || '',
    status: organization?.status || 'active',
    
    // Address
    addressLine1: organization?.addressLine1 || '',
    addressLine2: organization?.addressLine2 || '',
    city: organization?.city || '',
    stateProvince: organization?.stateProvince || '',
    postalCode: organization?.postalCode || '',
    countryCode: organization?.countryCode || 'US',
    
    // Contact
    phone: organization?.phone || '',
    email: organization?.email || '',
    website: organization?.website || '',
    primaryContactName: organization?.primaryContactName || '',
    primaryContactEmail: organization?.primaryContactEmail || '',
    primaryContactPhone: organization?.primaryContactPhone || '',
    
    // Configuration
    timezone: organization?.timezone || 'UTC',
    languageCode: organization?.languageCode || 'en',
    currencyCode: organization?.currencyCode || 'USD',
    
    // Operations
    operationalSince: organization?.operationalSince?.split('T')[0] || '',
    registrationNumber: organization?.registrationNumber || '',
  });

  // Initialize country/state/city from existing data
  useEffect(() => {
    if (organization) {
      // Find country ISO code from country name
      const country = Country.getAllCountries().find(c => 
        c.name === organization.countryCode || c.isoCode === organization.countryCode
      );
      if (country) {
        setSelectedCountryIso(country.isoCode);
        const states = State.getStatesOfCountry(country.isoCode);
        setAvailableStates(states);
        
        // Find state ISO code from state name
        const state = states.find(s => s.name === organization.stateProvince);
        if (state) {
          setSelectedStateIso(state.isoCode);
          const cities = City.getCitiesOfState(country.isoCode, state.isoCode);
          setAvailableCities(cities);
        }
      }
    }
  }, [organization]);

  const handleCountryChange = (countryIso: string) => {
    setSelectedCountryIso(countryIso);
    setSelectedStateIso('');
    setFormData({ ...formData, countryCode: countryIso, stateProvince: '', city: '' });
    
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
    setFormData({ ...formData, stateProvince: stateName, city: '' });
    
    if (stateIso && selectedCountryIso) {
      const cities = City.getCitiesOfState(selectedCountryIso, stateIso);
      setAvailableCities(cities);
    } else {
      setAvailableCities([]);
    }
  };

  const handleCityChange = (cityName: string) => {
    setFormData({ ...formData, city: cityName });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Organization name is required');
      return;
    }

    try {
      setLoading(true);

      if (isEditMode && organization) {
        // Update existing organization
        const updateData: UpdateOrganizationRequest = {
          name: formData.name,
          type: formData.type || undefined,
          description: formData.description || undefined,
          status: formData.status,
          
          addressLine1: formData.addressLine1 || undefined,
          addressLine2: formData.addressLine2 || undefined,
          city: formData.city || undefined,
          stateProvince: formData.stateProvince || undefined,
          postalCode: formData.postalCode || undefined,
          countryCode: formData.countryCode || undefined,
          
          phone: formData.phone || undefined,
          email: formData.email || undefined,
          website: formData.website || undefined,
          primaryContactName: formData.primaryContactName || undefined,
          primaryContactEmail: formData.primaryContactEmail || undefined,
          primaryContactPhone: formData.primaryContactPhone || undefined,
          
          timezone: formData.timezone || undefined,
          languageCode: formData.languageCode || undefined,
          currencyCode: formData.currencyCode || undefined,
          
          operationalSince: formData.operationalSince || undefined,
          registrationNumber: formData.registrationNumber || undefined,
        };

        await organizationsApi.updateOrganization(organization.id, updateData);
      } else {
        // Create new organization
        const createData: CreateOrganizationRequest = {
          tenantId: user?.tenantId || '',
          name: formData.name,
          code: formData.code || undefined,
          type: formData.type || undefined,
          description: formData.description || undefined,
          status: formData.status,
          parentOrganizationId: formData.parentOrganizationId || undefined,
          
          addressLine1: formData.addressLine1 || undefined,
          addressLine2: formData.addressLine2 || undefined,
          city: formData.city || undefined,
          stateProvince: formData.stateProvince || undefined,
          postalCode: formData.postalCode || undefined,
          countryCode: formData.countryCode || undefined,
          
          phone: formData.phone || undefined,
          email: formData.email || undefined,
          website: formData.website || undefined,
          primaryContactName: formData.primaryContactName || undefined,
          primaryContactEmail: formData.primaryContactEmail || undefined,
          primaryContactPhone: formData.primaryContactPhone || undefined,
          
          timezone: formData.timezone || undefined,
          languageCode: formData.languageCode || undefined,
          currencyCode: formData.currencyCode || undefined,
          
          operationalSince: formData.operationalSince || undefined,
          registrationNumber: formData.registrationNumber || undefined,
        };

        await organizationsApi.createOrganization(createData);
      }

      onSaved();
    } catch (err: any) {
      console.error('Error saving organization:', err);
      alert(err.response?.data?.message || 'Failed to save organization');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Building2 className="h-6 w-6 text-indigo-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              {isEditMode ? 'Edit Organization' : 'Create New Organization'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 px-6">
          <button
            onClick={() => setActiveTab('basic')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'basic'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Basic Info
          </button>
          <button
            onClick={() => setActiveTab('contact')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'contact'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Contact & Address
          </button>
          <button
            onClick={() => setActiveTab('config')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'config'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Configuration
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          {/* Basic Info Tab */}
          {activeTab === 'basic' && (
            <div className="space-y-4">
              {/* Basic Details */}
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Details</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Organization Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Enter organization name"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Organization Code
                      </label>
                      <input
                        type="text"
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono"
                        placeholder="ORG001"
                        disabled={isEditMode}
                      />
                      {isEditMode && (
                        <p className="text-xs text-gray-500 mt-1">Code cannot be changed after creation</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Organization Type
                      </label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      >
                        <option value="">Select type</option>
                        <option value="Hospital">Hospital</option>
                        <option value="Clinic">Clinic</option>
                        <option value="Diagnostic">Diagnostic Center</option>
                        <option value="Pharmacy">Pharmacy</option>
                        <option value="Laboratory">Laboratory</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="suspended">Suspended</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <FileText className="h-4 w-4 inline mr-1" />
                        Registration Number
                      </label>
                      <input
                        type="text"
                        value={formData.registrationNumber}
                        onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="REG123456"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={2}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Enter organization description"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="h-4 w-4 inline mr-1" />
                      Operational Since
                    </label>
                    <input
                      type="date"
                      value={formData.operationalSince}
                      onChange={(e) => setFormData({ ...formData, operationalSince: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Contact & Address Tab */}
          {activeTab === 'contact' && (
            <div className="space-y-6">
              {/* Contact Information */}
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Primary Contact Name
                    </label>
                    <input
                      type="text"
                      value={formData.primaryContactName}
                      onChange={(e) => setFormData({ ...formData, primaryContactName: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Primary Contact Email
                    </label>
                    <input
                      type="email"
                      value={formData.primaryContactEmail}
                      onChange={(e) => setFormData({ ...formData, primaryContactEmail: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="john.doe@organization.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Primary Contact Phone
                    </label>
                    <PhoneInput
                      country={'us'}
                      value={formData.primaryContactPhone}
                      onChange={(phone) => setFormData({ ...formData, primaryContactPhone: phone })}
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
                      Website
                    </label>
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="https://www.organization.com"
                    />
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Address Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Street Address
                    </label>
                    <input
                      type="text"
                      value={formData.addressLine1}
                      onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="123 Main Street, Suite 100"
                    />
                  </div>
                  
                  <div>
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Zip/Postal Code
                      </label>
                      <input
                        type="text"
                        value={formData.postalCode}
                        onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="12345"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Configuration Tab */}
          {activeTab === 'config' && (
            <div className="space-y-4">
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Regional Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Timezone
                    </label>
                    <select
                      value={formData.timezone}
                      onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">Eastern Time</option>
                      <option value="America/Chicago">Central Time</option>
                      <option value="America/Denver">Mountain Time</option>
                      <option value="America/Los_Angeles">Pacific Time</option>
                      <option value="Asia/Kolkata">India Standard Time</option>
                      <option value="Europe/London">London</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Language
                    </label>
                    <select
                      value={formData.languageCode}
                      onChange={(e) => setFormData({ ...formData, languageCode: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                      <option value="hi">Hindi</option>
                      <option value="ar">Arabic</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Currency
                    </label>
                    <select
                      value={formData.currencyCode}
                      onChange={(e) => setFormData({ ...formData, currencyCode: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="GBP">GBP - British Pound</option>
                      <option value="INR">INR - Indian Rupee</option>
                      <option value="AED">AED - UAE Dirham</option>
                      <option value="CAD">CAD - Canadian Dollar</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> These configuration settings will be used as defaults for all branches
                  under this organization. Individual branches can override these settings if needed.
                </p>
              </div>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {isEditMode ? 'Update Organization' : 'Create Organization'}
          </button>
        </div>
      </div>
    </div>
  );
}
