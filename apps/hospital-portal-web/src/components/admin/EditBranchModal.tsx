'use client';

import { useState, useEffect } from 'react';
import { Country, State, City } from 'country-state-city';
import { X, Building2, MapPin, Phone, Clock, Bed, Shield, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

interface EditBranchModalProps {
  isOpen: boolean;
  onClose: () => void;
  branch: any;
  organizations: any[];
  onSave: (data: any) => Promise<void>;
}

type FormStep = 1 | 2 | 3 | 4;

export default function EditBranchModal({ isOpen, onClose, branch, organizations, onSave }: EditBranchModalProps) {
  const [formStep, setFormStep] = useState<FormStep>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
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
    latitude: undefined as number | undefined,
    longitude: undefined as number | undefined,
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

  const [selectedCountryIso, setSelectedCountryIso] = useState<string>('US');
  const [selectedStateIso, setSelectedStateIso] = useState<string>('');
  const [availableStates, setAvailableStates] = useState<any[]>([]);
  const [availableCities, setAvailableCities] = useState<any[]>([]);

  useEffect(() => {
    if (branch) {
      setFormData({
        organizationId: branch.organizationId || '',
        branchName: branch.name || branch.branchName || '',
        branchCode: branch.code || branch.branchCode || '',
        branchType: branch.branchType || 'Hospital',
        region: branch.region || 'North America',
        status: branch.status || 'Active',
        operationalStatus: branch.operationalStatus || 'Operational',
        description: branch.description || '',
        address: branch.addressLine1 || branch.address || '',
        city: branch.city || '',
        state: branch.stateProvince || branch.state || '',
        country: branch.countryCode || branch.country || 'US',
        postalCode: branch.postalCode || '',
        latitude: branch.latitude,
        longitude: branch.longitude,
        phoneNumber: branch.phone || branch.phoneNumber || '',
        faxNumber: branch.fax || branch.faxNumber || '',
        email: branch.email || '',
        website: branch.website || '',
        timezone: branch.timezone || 'America/New_York',
        currency: branch.currency || 'USD',
        primaryLanguage: branch.languagePrimary || branch.primaryLanguage || 'English',
        operatingHoursStart: branch.operationalHoursStart ? String(branch.operationalHoursStart).substring(0, 5) : '08:00',
        operatingHoursEnd: branch.operationalHoursEnd ? String(branch.operationalHoursEnd).substring(0, 5) : '17:00',
        emergencySupport24x7: branch.emergencySupport24x7 || false,
        totalBeds: branch.totalBeds || 0,
        icuBeds: branch.icuBeds || 0,
        emergencyBeds: branch.emergencyBeds || 0,
        hipaaCompliant: branch.hipaaCompliant || false,
        nabhAccredited: branch.nabhAccredited || false,
        jciAccredited: branch.jciAccredited || false,
        iso9001Certified: branch.iso9001Certified || false,
      });
      
      const countryCode = branch.countryCode || branch.country || 'US';
      setSelectedCountryIso(countryCode);
      const states = State.getStatesOfCountry(countryCode);
      setAvailableStates(states);
    }
  }, [branch]);

  useEffect(() => {
    const states = State.getStatesOfCountry(selectedCountryIso);
    setAvailableStates(states);
    setAvailableCities([]);
    setSelectedStateIso('');
  }, [selectedCountryIso]);

  useEffect(() => {
    if (selectedStateIso && selectedCountryIso) {
      const cities = City.getCitiesOfState(selectedCountryIso, selectedStateIso);
      setAvailableCities(cities);
    } else {
      setAvailableCities([]);
    }
  }, [selectedStateIso, selectedCountryIso]);

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      await onSave(formData);
      onClose();
      setFormStep(1);
    } catch (err: any) {
      setError(err.message || 'Failed to update branch');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (formStep < 4) setFormStep((formStep + 1) as FormStep);
  };

  const prevStep = () => {
    if (formStep > 1) setFormStep((formStep - 1) as FormStep);
  };

  if (!isOpen) return null;

  const steps = [
    { number: 1, name: 'Basic Info', icon: Building2 },
    { number: 2, name: 'Location', icon: MapPin },
    { number: 3, name: 'Operations', icon: Clock },
    { number: 4, name: 'Compliance', icon: Shield },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-teal-600 px-4 sm:px-8 py-4 sm:py-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold mb-2">Edit Branch</h2>
              <p className="text-teal-100 text-sm">Update branch information and settings</p>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg"
            >
              <X size={24} />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between mt-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = formStep === step.number;
              const isCompleted = formStep > step.number;
              
              return (
                <div key={step.number} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                        isActive
                          ? 'bg-white text-teal-600 border-white shadow-lg scale-110'
                          : isCompleted
                          ? 'bg-teal-500 text-white border-teal-300'
                          : 'bg-teal-700/50 text-teal-200 border-teal-500'
                      }`}
                    >
                      {isCompleted ? <Check size={24} /> : <Icon size={20} />}
                    </div>
                    <span
                      className={`mt-2 text-xs font-medium ${
                        isActive || isCompleted ? 'text-white' : 'text-teal-200'
                      }`}
                    >
                      {step.name}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="flex-1 h-0.5 bg-teal-500/30 mx-2 -mt-6">
                      <div
                        className={`h-full bg-white transition-all duration-300 ${
                          isCompleted ? 'w-full' : 'w-0'
                        }`}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-8 mt-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Form Content */}
        <div className="p-8 overflow-y-auto max-h-[calc(90vh-280px)]">
          {/* Step 1: Basic Info */}
          {formStep === 1 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Organization *
                  </label>
                  <select
                    value={formData.organizationId}
                    onChange={(e) => setFormData({ ...formData, organizationId: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                    required
                  >
                    <option value="">Select Organization</option>
                    {organizations.map((org) => (
                      <option key={org.id} value={org.id}>
                        {org.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Branch Name *
                  </label>
                  <input
                    type="text"
                    value={formData.branchName}
                    onChange={(e) => setFormData({ ...formData, branchName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Downtown Medical Center"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Branch Code *
                  </label>
                  <input
                    type="text"
                    value={formData.branchCode}
                    onChange={(e) => setFormData({ ...formData, branchCode: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="DMC-001"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Branch Type
                  </label>
                  <select
                    value={formData.branchType}
                    onChange={(e) => setFormData({ ...formData, branchType: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                  >
                    <option value="Hospital">Hospital</option>
                    <option value="Clinic">Clinic</option>
                    <option value="Diagnostic Center">Diagnostic Center</option>
                    <option value="Specialty Center">Specialty Center</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="UnderMaintenance">Under Maintenance</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                    rows={3}
                    placeholder="Comprehensive multi-specialty hospital with state-of-the-art facilities..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Location */}
          {formStep === 2 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Street Address
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="123 Medical Drive"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Country
                  </label>
                  <select
                    value={selectedCountryIso}
                    onChange={(e) => {
                      setSelectedCountryIso(e.target.value);
                      setFormData({ ...formData, country: e.target.value });
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                  >
                    {Country.getAllCountries().map((country) => (
                      <option key={country.isoCode} value={country.isoCode}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    State/Province
                  </label>
                  <select
                    value={selectedStateIso}
                    onChange={(e) => {
                      setSelectedStateIso(e.target.value);
                      const state = availableStates.find(s => s.isoCode === e.target.value);
                      setFormData({ ...formData, state: state?.name || e.target.value });
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                  >
                    <option value="">Select State</option>
                    {availableStates.map((state) => (
                      <option key={state.isoCode} value={state.isoCode}>
                        {state.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    City
                  </label>
                  <select
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                  >
                    <option value="">Select City</option>
                    {availableCities.map((city) => (
                      <option key={city.name} value={city.name}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="10001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.latitude || ''}
                    onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="40.7128"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.longitude || ''}
                    onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="-74.0060"
                  />
                </div>

                <div className="col-span-2 space-y-4">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <PhoneInput
                        country={'us'}
                        value={formData.phoneNumber}
                        onChange={(phone) => setFormData({ ...formData, phoneNumber: phone })}
                        containerClass="w-full"
                        inputClass="w-full"
                        buttonClass="border-gray-300"
                        inputStyle={{
                          width: '100%',
                          height: '50px',
                          fontSize: '14px',
                          paddingLeft: '48px',
                          borderRadius: '0.75rem',
                          border: '1px solid #d1d5db',
                        }}
                        buttonStyle={{
                          borderRadius: '0.75rem 0 0 0.75rem',
                          border: '1px solid #d1d5db',
                          backgroundColor: '#f9fafb',
                        }}
                        dropdownStyle={{
                          borderRadius: '0.75rem',
                        }}
                        enableSearch
                        searchPlaceholder="Search country"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="contact@branch.com"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Operations */}
          {formStep === 3 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Operating Hours Start
                  </label>
                  <input
                    type="time"
                    value={formData.operatingHoursStart}
                    onChange={(e) => setFormData({ ...formData, operatingHoursStart: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Operating Hours End
                  </label>
                  <input
                    type="time"
                    value={formData.operatingHoursEnd}
                    onChange={(e) => setFormData({ ...formData, operatingHoursEnd: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                <div className="col-span-2">
                  <label className="flex items-center space-x-3 cursor-pointer p-4 bg-teal-50 rounded-xl hover:bg-teal-100 transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.emergencySupport24x7}
                      onChange={(e) => setFormData({ ...formData, emergencySupport24x7: e.target.checked })}
                      className="w-5 h-5 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                    />
                    <span className="text-sm font-semibold text-gray-700">
                      24/7 Emergency Support Available
                    </span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Bed className="inline-block w-4 h-4 mr-1" />
                    Total Beds
                  </label>
                  <input
                    type="number"
                    value={formData.totalBeds}
                    onChange={(e) => setFormData({ ...formData, totalBeds: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    ICU Beds
                  </label>
                  <input
                    type="number"
                    value={formData.icuBeds}
                    onChange={(e) => setFormData({ ...formData, icuBeds: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Emergency Beds
                  </label>
                  <input
                    type="number"
                    value={formData.emergencyBeds}
                    onChange={(e) => setFormData({ ...formData, emergencyBeds: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Timezone
                  </label>
                  <select
                    value={formData.timezone}
                    onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                  >
                    <option value="America/New_York">Eastern Time (ET)</option>
                    <option value="America/Chicago">Central Time (CT)</option>
                    <option value="America/Denver">Mountain Time (MT)</option>
                    <option value="America/Los_Angeles">Pacific Time (PT)</option>
                    <option value="Europe/London">GMT</option>
                    <option value="Asia/Kolkata">IST</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Compliance */}
          {formStep === 4 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="space-y-4">
                <div className="p-4 bg-teal-50 rounded-xl border border-teal-200">
                  <label className="flex items-start cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.hipaaCompliant}
                      onChange={(e) => setFormData({ ...formData, hipaaCompliant: e.target.checked })}
                      className="w-5 h-5 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                    />
                    <div>
                      <span className="text-sm font-semibold text-gray-900">HIPAA Compliant</span>
                      <p className="text-xs text-gray-600 mt-1">Meets Health Insurance Portability and Accountability Act standards</p>
                    </div>
                  </label>
                </div>

                <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.nabhAccredited}
                      onChange={(e) => setFormData({ ...formData, nabhAccredited: e.target.checked })}
                      className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <div>
                      <span className="text-sm font-semibold text-gray-900">NABH Accredited</span>
                      <p className="text-xs text-gray-600 mt-1">National Accreditation Board for Hospitals & Healthcare Providers</p>
                    </div>
                  </label>
                </div>

                <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.jciAccredited}
                      onChange={(e) => setFormData({ ...formData, jciAccredited: e.target.checked })}
                      className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <div>
                      <span className="text-sm font-semibold text-gray-900">JCI Accredited</span>
                      <p className="text-xs text-gray-600 mt-1">Joint Commission International standards certification</p>
                    </div>
                  </label>
                </div>

                <div className="p-4 bg-orange-50 rounded-xl border border-orange-200">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.iso9001Certified}
                      onChange={(e) => setFormData({ ...formData, iso9001Certified: e.target.checked })}
                      className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                    />
                    <div>
                      <span className="text-sm font-semibold text-gray-900">ISO 9001 Certified</span>
                      <p className="text-xs text-gray-600 mt-1">International quality management system standards</p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="mt-6 p-6 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl border border-teal-200">
                <h4 className="font-semibold text-gray-900 mb-2">Compliance Summary</h4>
                <p className="text-sm text-gray-600">
                  {[formData.hipaaCompliant, formData.nabhAccredited, formData.jciAccredited, formData.iso9001Certified].filter(Boolean).length} of 4 certifications enabled
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-gray-200 px-8 py-6 bg-gray-50 flex justify-between items-center">
          <button
            onClick={prevStep}
            disabled={formStep === 1}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all ${
              formStep === 1
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:shadow-md'
            }`}
          >
            <ChevronLeft size={20} />
            <span>Previous</span>
          </button>

          <div className="text-sm text-gray-500">
            Step {formStep} of 4
          </div>

          {formStep < 4 ? (
            <button
              onClick={nextStep}
              className="flex items-center space-x-2 px-6 py-3 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 transition-all hover:shadow-lg"
            >
              <span>Continue</span>
              <ChevronRight size={20} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center space-x-2 px-6 py-3 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check size={20} />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
