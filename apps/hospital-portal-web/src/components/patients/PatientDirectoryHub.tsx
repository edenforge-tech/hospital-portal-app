'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, User, Phone, Mail, Calendar, MapPin, Activity, LogIn, CheckCircle2, Clock, CalendarPlus, Filter, Download, ChevronLeft, ChevronRight, SortAsc, SortDesc, X, RefreshCw, LayoutGrid, List } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PatientDetailsModal } from './PatientDetailsModal';
import { CheckInDialog, CheckInData } from './CheckInDialog';
import { TokenSlip } from './TokenSlip';
import { checkInApi, CheckInStatus } from '@/lib/check-in-api';
import { getApi } from '@/lib/api';
import { ClinicalSummaryWidget } from './widgets/ClinicalSummaryWidget';
import { AppointmentsWidget } from './widgets/AppointmentsWidget';
import { BillingWidget } from './widgets/BillingWidget';
import { LabResultsWidget } from './widgets/LabResultsWidget';
import { MedicationsWidget } from './widgets/MedicationsWidget';
import { VitalsTrendsWidget } from './widgets/VitalsTrendsWidget';
import { CommunicationsWidget } from './widgets/CommunicationsWidget';
import { ImagingWidget } from './widgets/ImagingWidget';
import { InsuranceWidget } from './widgets/InsuranceWidget';
import { EngagementWidget } from './widgets/EngagementWidget';
import { CareTeamPanel } from './CareTeamPanel';

// Sort options
type SortField = 'name' | 'mrn' | 'lastVisit' | 'age';
type SortDirection = 'asc' | 'desc';

const PAGE_SIZE = 20;

export default function PatientDirectoryHub() {
  const router = useRouter();
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [expandedWidget, setExpandedWidget] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [checkInStatuses, setCheckInStatuses] = useState<Record<string, CheckInStatus>>({});
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [showTokenSlip, setShowTokenSlip] = useState(false);
  const [tokenData, setTokenData] = useState<any>(null);
  const [showCheckInDialog, setShowCheckInDialog] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Advanced filters
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [genderFilter, setGenderFilter] = useState<string>('all');
  const [bloodGroupFilter, setBloodGroupFilter] = useState<string>('all');
  const [ageMinFilter, setAgeMinFilter] = useState<string>('');
  const [ageMaxFilter, setAgeMaxFilter] = useState<string>('');

  // Enhanced Search Filters - Week 3
  const [mrnFilter, setMrnFilter] = useState<string>('');
  const [mobileFilter, setMobileFilter] = useState<string>('');
  const [emailFilter, setEmailFilter] = useState<string>('');
  const [dobFilter, setDobFilter] = useState<string>('');
  const [cityFilter, setCityFilter] = useState<string>('all');
  const [stateFilter, setStateFilter] = useState<string>('all');
  const [referralSourceFilter, setReferralSourceFilter] = useState<string>('all');
  const [insuranceProviderFilter, setInsuranceProviderFilter] = useState<string>('all');
  const [diagnosisFilter, setDiagnosisFilter] = useState<string>('');
  const [lastVisitStartDate, setLastVisitStartDate] = useState<string>('');
  const [lastVisitEndDate, setLastVisitEndDate] = useState<string>('');
  const [outstandingBillsOnly, setOutstandingBillsOnly] = useState<boolean>(false);
  
  // Auto-complete and recent searches
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('patientSearchRecent');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [savedFilters, setSavedFilters] = useState<any[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('patientSearchSavedFilters');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  
  // Auto-complete suggestions - Week 4
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<any[]>([]);
  
  // Active filter chips - Week 4
  const [activeFilterChips, setActiveFilterChips] = useState<Array<{key: string, label: string, value: string}>>([]);

  // Sort
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // KPI Filter state - for clickable stats
  const [kpiFilter, setKpiFilter] = useState<'all' | 'outstanding-bills' | 'critical-alerts' | 'pending-labs' | 'active-appointments'>('all');

  // Auto-complete: Generate suggestions when search query >= 3 characters - Week 4
  useEffect(() => {
    if (searchQuery.trim().length >= 3) {
      const query = searchQuery.toLowerCase();
      const suggestions = patients.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.mrn.toLowerCase().includes(query) ||
        p.phone.includes(query) ||
        p.email.toLowerCase().includes(query)
      ).slice(0, 5); // Limit to 5 suggestions
      setSearchSuggestions(suggestions);
      setShowSuggestions(true);
    } else {
      setSearchSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchQuery, patients]);

  // Update filter chips whenever filters change - Week 4
  useEffect(() => {
    const chips: Array<{key: string, label: string, value: string}> = [];
    
    if (statusFilter !== 'all') chips.push({key: 'status', label: 'Status', value: statusFilter});
    if (genderFilter !== 'all') chips.push({key: 'gender', label: 'Gender', value: genderFilter});
    if (bloodGroupFilter !== 'all') chips.push({key: 'bloodGroup', label: 'Blood Group', value: bloodGroupFilter});
    if (ageMinFilter) chips.push({key: 'ageMin', label: 'Age Min', value: ageMinFilter});
    if (ageMaxFilter) chips.push({key: 'ageMax', label: 'Age Max', value: ageMaxFilter});
    if (mrnFilter) chips.push({key: 'mrn', label: 'MRN', value: mrnFilter});
    if (mobileFilter) chips.push({key: 'mobile', label: 'Mobile', value: mobileFilter});
    if (emailFilter) chips.push({key: 'email', label: 'Email', value: emailFilter});
    if (dobFilter) chips.push({key: 'dob', label: 'DOB', value: new Date(dobFilter).toLocaleDateString()});
    if (cityFilter !== 'all') chips.push({key: 'city', label: 'City', value: cityFilter});
    if (diagnosisFilter) chips.push({key: 'diagnosis', label: 'Diagnosis', value: diagnosisFilter});
    if (lastVisitStartDate) chips.push({key: 'visitStart', label: 'Visit From', value: new Date(lastVisitStartDate).toLocaleDateString()});
    if (lastVisitEndDate) chips.push({key: 'visitEnd', label: 'Visit To', value: new Date(lastVisitEndDate).toLocaleDateString()});
    if (outstandingBillsOnly) chips.push({key: 'bills', label: 'Outstanding Bills', value: 'Yes'});
    
    setActiveFilterChips(chips);
  }, [statusFilter, genderFilter, bloodGroupFilter, ageMinFilter, ageMaxFilter, mrnFilter, mobileFilter, emailFilter, dobFilter, cityFilter, diagnosisFilter, lastVisitStartDate, lastVisitEndDate, outstandingBillsOnly]);

  // Fetch real patient data from API
  const fetchPatients = useCallback(async () => {
    setLoading(true);
    try {
      const api = getApi();
      const response = await api.get('/patients');
      
      if (response.data && Array.isArray(response.data)) {
        const transformedPatients = response.data.map((p: any) => {
          const photoUrl = p.photoUrl || p.photo_url || p.photo || p.profilePhoto || null;
          
          return {
            id: p.id,
            name: `${p.firstName} ${p.lastName}`,
            firstName: p.firstName,
            lastName: p.lastName,
            mrn: p.medicalRecordNumber || 'N/A',
            age: p.dateOfBirth ? Math.floor((Date.now() - new Date(p.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : 0,
            gender: p.gender || 'Not specified',
            phone: p.contactNumber || 'N/A',
            mobile: p.contactNumber || 'N/A',
            email: p.email || 'N/A',
            photo: photoUrl,
            bloodType: p.bloodGroup || 'N/A',
            status: p.status || 'Active',
            lastVisit: p.updatedAt ? new Date(p.updatedAt).toLocaleDateString() : 'N/A',
            lastVisitDate: p.updatedAt ? new Date(p.updatedAt) : null,
            address: p.address || 'Not provided',
            dateOfBirth: p.dateOfBirth ? new Date(p.dateOfBirth).toLocaleDateString() : 'N/A',
            emergencyContact: p.emergencyContactNumber || p.emergencyContact || 'Not provided',
            insuranceProvider: p.insuranceProvider || p.insuranceCompany || 'No Insurance',
            insuranceNumber: p.insurancePolicyNumber || p.insuranceNumber || ''
          };
        });
        
        setPatients(transformedPatients);
        setTotalCount(transformedPatients.length);
        // Load with patient grid by default (no patient selected)
      }
    } catch (error) {
      console.error('Failed to fetch patients:', error);
      setPatients([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load patients on mount
  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  // Listen for patient creation from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'PATIENT_CREATED') {
        setShowRegistrationModal(false);
        fetchPatients();
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [fetchPatients]);

  // Filter, sort, and paginate patients
  const filteredPatients = useMemo(() => {
    let result = [...patients];

    // KPI Filter - Applied first based on clicked stat
    if (kpiFilter !== 'all') {
      switch (kpiFilter) {
        case 'outstanding-bills':
          // Mock: Filter patients with outstanding bills (every 3rd patient)
          result = result.filter((_, idx) => idx % 3 === 0);
          break;
        case 'critical-alerts':
          // Mock: Filter patients with critical conditions (age > 60 or age < 10)
          result = result.filter(p => p.age > 60 || p.age < 10);
          break;
        case 'pending-labs':
          // Mock: Filter patients with pending lab results (every 4th patient)
          result = result.filter((_, idx) => idx % 4 === 0);
          break;
        case 'active-appointments':
          // Mock: Filter patients with active appointments (every other patient)
          result = result.filter((_, idx) => idx % 2 === 0);
          break;
      }
    }

    // Text search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(patient =>
        patient.name.toLowerCase().includes(query) ||
        patient.mrn.toLowerCase().includes(query) ||
        patient.phone.includes(query) ||
        patient.email.toLowerCase().includes(query)
      );
    }

    // Enhanced Filters - Week 3
    if (mrnFilter.trim()) {
      result = result.filter(p => p.mrn.toLowerCase() === mrnFilter.toLowerCase().trim());
    }
    if (mobileFilter.trim()) {
      result = result.filter(p => p.phone.includes(mobileFilter.trim()));
    }
    if (emailFilter.trim()) {
      result = result.filter(p => p.email.toLowerCase() === emailFilter.toLowerCase().trim());
    }
    if (dobFilter) {
      result = result.filter(p => p.dateOfBirth === dobFilter);
    }
    if (cityFilter !== 'all') {
      result = result.filter(p => p.address?.toLowerCase().includes(cityFilter.toLowerCase()));
    }
    if (diagnosisFilter.trim()) {
      const diagQuery = diagnosisFilter.toLowerCase();
      result = result.filter(p => 
        p.medicalConditions?.toLowerCase().includes(diagQuery) ||
        p.allergies?.toLowerCase().includes(diagQuery)
      );
    }
    if (lastVisitStartDate) {
      result = result.filter(p => {
        if (!p.lastVisitDate) return false;
        return p.lastVisitDate >= new Date(lastVisitStartDate);
      });
    }
    if (lastVisitEndDate) {
      result = result.filter(p => {
        if (!p.lastVisitDate) return false;
        return p.lastVisitDate <= new Date(lastVisitEndDate);
      });
    }
    // Note: outstandingBillsOnly would require billing data integration

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter(p => p.status?.toLowerCase() === statusFilter.toLowerCase());
    }

    // Gender filter
    if (genderFilter !== 'all') {
      result = result.filter(p => p.gender?.toLowerCase() === genderFilter.toLowerCase());
    }

    // Blood group filter
    if (bloodGroupFilter !== 'all') {
      result = result.filter(p => p.bloodType === bloodGroupFilter);
    }

    // Age range filter
    if (ageMinFilter) {
      result = result.filter(p => p.age >= parseInt(ageMinFilter));
    }
    if (ageMaxFilter) {
      result = result.filter(p => p.age <= parseInt(ageMaxFilter));
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'mrn':
          comparison = a.mrn.localeCompare(b.mrn);
          break;
        case 'age':
          comparison = a.age - b.age;
          break;
        case 'lastVisit':
          const dateA = a.lastVisitDate ? a.lastVisitDate.getTime() : 0;
          const dateB = b.lastVisitDate ? b.lastVisitDate.getTime() : 0;
          comparison = dateA - dateB;
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [patients, searchQuery, statusFilter, genderFilter, bloodGroupFilter, ageMinFilter, ageMaxFilter, sortField, sortDirection, mrnFilter, mobileFilter, emailFilter, dobFilter, cityFilter, diagnosisFilter, lastVisitStartDate, lastVisitEndDate, outstandingBillsOnly, kpiFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredPatients.length / PAGE_SIZE);
  const paginatedPatients = useMemo(() => {
    const startIdx = (currentPage - 1) * PAGE_SIZE;
    return filteredPatients.slice(startIdx, startIdx + PAGE_SIZE);
  }, [filteredPatients, currentPage]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, genderFilter, bloodGroupFilter, ageMinFilter, ageMaxFilter]);

  const activeFilterCount = [
    statusFilter !== 'all',
    genderFilter !== 'all',
    bloodGroupFilter !== 'all',
    ageMinFilter !== '',
    ageMaxFilter !== '',
    mrnFilter !== '',
    mobileFilter !== '',
    emailFilter !== '',
    dobFilter !== '',
    cityFilter !== 'all',
    referralSourceFilter !== 'all',
    insuranceProviderFilter !== 'all',
    diagnosisFilter !== '',
    lastVisitStartDate !== '',
    lastVisitEndDate !== '',
    outstandingBillsOnly
  ].filter(Boolean).length;

  const clearFilters = () => {
    setStatusFilter('all');
    setGenderFilter('all');
    setBloodGroupFilter('all');
    setAgeMinFilter('');
    setAgeMaxFilter('');
    setMrnFilter('');
    setMobileFilter('');
    setEmailFilter('');
    setDobFilter('');
    setCityFilter('all');
    setStateFilter('all');
    setReferralSourceFilter('all');
    setInsuranceProviderFilter('all');
    setDiagnosisFilter('');
    setLastVisitStartDate('');
    setLastVisitEndDate('');
    setOutstandingBillsOnly(false);
  };

  // Save search to recent searches
  const saveRecentSearch = (query: string) => {
    if (!query.trim()) return;
    const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
    setRecentSearches(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('patientSearchRecent', JSON.stringify(updated));
    }
  };

  // Remove individual filter chip - Week 4
  const removeFilterChip = (key: string) => {
    switch(key) {
      case 'status': setStatusFilter('all'); break;
      case 'gender': setGenderFilter('all'); break;
      case 'bloodGroup': setBloodGroupFilter('all'); break;
      case 'ageMin': setAgeMinFilter(''); break;
      case 'ageMax': setAgeMaxFilter(''); break;
      case 'mrn': setMrnFilter(''); break;
      case 'mobile': setMobileFilter(''); break;
      case 'email': setEmailFilter(''); break;
      case 'dob': setDobFilter(''); break;
      case 'city': setCityFilter('all'); break;
      case 'diagnosis': setDiagnosisFilter(''); break;
      case 'visitStart': setLastVisitStartDate(''); break;
      case 'visitEnd': setLastVisitEndDate(''); break;
      case 'bills': setOutstandingBillsOnly(false); break;
    }
  };

  // Apply widget-based filter (drill-down from dashboard) - Week 4
  const applyWidgetFilter = useCallback((filterType: string, value: string) => {
    setSelectedPatient(null); // Return to patient grid
    
    switch(filterType) {
      case 'status':
        setStatusFilter(value);
        break;
      case 'upcomingAppointments':
        // Filter patients with appointments in next 7 days
        const weekAhead = new Date();
        weekAhead.setDate(weekAhead.getDate() + 7);
        setLastVisitEndDate(weekAhead.toISOString().split('T')[0]);
        break;
      case 'outstandingBills':
        setOutstandingBillsOnly(true);
        break;
      case 'recentLabs':
        // Show patients with recent lab results
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        setLastVisitStartDate(weekAgo.toISOString().split('T')[0]);
        break;
      case 'activeMedications':
        setStatusFilter('active');
        break;
      case 'criticalVitals':
        // This would filter patients with abnormal vitals
        setStatusFilter('active');
        break;
    }
  }, []);

  // Select search suggestion - Week 4
  const selectSuggestion = useCallback((patient: any) => {
    setSearchQuery(patient.name);
    setSelectedPatient(patient);
    setShowSuggestions(false);
    saveRecentSearch(patient.name);
  }, [saveRecentSearch]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Export patients to CSV
  const exportToCSV = () => {
    const headers = ['Name', 'MRN', 'Age', 'Gender', 'Phone', 'Email', 'Blood Type', 'Status', 'Last Visit', 'Address'];
    const csvRows = [
      headers.join(','),
      ...filteredPatients.map(p => [
        `"${p.name}"`, `"${p.mrn}"`, p.age, `"${p.gender}"`, `"${p.phone}"`,
        `"${p.email}"`, `"${p.bloodType}"`, `"${p.status}"`, `"${p.lastVisit}"`, `"${p.address}"`
      ].join(','))
    ];
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `patients_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    return parts.map(p => p[0]).join('').toUpperCase();
  };

  const handleCheckIn = async (data: CheckInData) => {
    if (!selectedPatient) return;

    setIsCheckingIn(true);
    try {
      const response = await checkInApi.checkIn({
        patientId: selectedPatient.id,
        departmentId: data.departmentId,
        doctorId: data.doctorId,
        checkInType: data.checkInType,
        reasonForVisit: data.reasonForVisit
      });

      // Update check-in status
      setCheckInStatuses(prev => ({
        ...prev,
        [selectedPatient.id]: {
          patientId: selectedPatient.id,
          isCheckedIn: true,
          checkedInAt: response.checkedInAt,
          tokenNumber: response.tokenNumber,
          checkInType: data.checkInType,
          visitId: response.visitId
        }
      }));

      setShowCheckInDialog(false);

      // Fetch token data and show token slip
      try {
        const api = getApi();
        const tokenResponse = await api.get(`/visits/${response.visitId}/token`);
        setTokenData(tokenResponse.data);
        setShowTokenSlip(true);
      } catch (error) {
        console.error('Failed to fetch token data:', error);
        // Fallback: show basic alert if token fetch fails
        alert(`✓ ${response.message}\nToken: ${response.tokenNumber}`);
      }
    } catch (error) {
      console.error('Check-in failed:', error);
      alert('❌ Check-in failed. Please try again.');
    } finally {
      setIsCheckingIn(false);
    }
  };

  // Component render
  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* Modern Compact Header - Only show when no patient selected */}
      {!selectedPatient && (
        <div className="bg-white border-b px-3 py-1.5 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Patient Directory</h1>
            <p className="text-xs text-gray-600">{filteredPatients.length} patients</p>
          </div>
          
          {/* Search Bar */}
          <div className="relative w-96">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 z-10" />
            <Input
              placeholder="Search name, MRN, phone, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              className="pl-10 pr-4 h-9"
            />
            
            {/* Auto-complete Suggestions Dropdown */}
            {showSuggestions && searchSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-50 max-h-64 overflow-y-auto">
                {searchSuggestions.map((patient) => (
                  <div
                    key={patient.id}
                    onClick={() => selectSuggestion(patient)}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex items-center gap-2">
                      {patient.photo ? (
                        <img src={patient.photo} alt={patient.name} className="w-8 h-8 rounded-lg object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-semibold">
                          {getInitials(patient.name)}
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{patient.name}</p>
                        <p className="text-xs text-gray-500">MRN: {patient.mrn} • {patient.age}y • {patient.gender}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      )}

      {/* Main Content - Single Scroll Only in Widgets */}
      <div className="flex-1 bg-gray-50 flex flex-col overflow-hidden">
          {/* 5 KPI Stats Cards - Only visible when no patient selected (grid view) */}
          {!selectedPatient && (
            <div className="grid grid-cols-5 gap-2 mb-2 mx-2 mt-1 flex-shrink-0">
            {/* Total Patients */}
            <Card 
              className={`bg-gradient-to-br from-blue-500 to-blue-600 text-white cursor-pointer hover:shadow-lg transition-shadow ${kpiFilter === 'all' ? 'ring-4 ring-white ring-opacity-50' : ''}`}
              onClick={() => {
                setKpiFilter('all');
                setSelectedPatient(null);
              }}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase font-semibold text-blue-100 mb-1">Total Patients</p>
                    <h3 className="text-3xl font-bold">{patients.length}</h3>
                  </div>
                  <User className="w-10 h-10 text-blue-200" />
                </div>
              </CardContent>
            </Card>
            
            {/* Active Appointments */}
            <Card 
              className={`bg-gradient-to-br from-green-500 to-green-600 text-white cursor-pointer hover:shadow-lg transition-shadow ${kpiFilter === 'active-appointments' ? 'ring-4 ring-white ring-opacity-50' : ''}`}
              onClick={() => {
                setKpiFilter('active-appointments');
                setSelectedPatient(null);
              }}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase font-semibold text-green-100 mb-1">Active Appointments</p>
                    <h3 className="text-3xl font-bold">24</h3>
                  </div>
                  <Calendar className="w-10 h-10 text-green-200" />
                </div>
              </CardContent>
            </Card>
            
            {/* Pending Labs */}
            <Card 
              className={`bg-gradient-to-br from-purple-500 to-purple-600 text-white cursor-pointer hover:shadow-lg transition-shadow ${kpiFilter === 'pending-labs' ? 'ring-4 ring-white ring-opacity-50' : ''}`}
              onClick={() => {
                setKpiFilter('pending-labs');
                setSelectedPatient(null);
              }}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase font-semibold text-purple-100 mb-1">Pending Labs</p>
                    <h3 className="text-3xl font-bold">8</h3>
                  </div>
                  <Activity className="w-10 h-10 text-purple-200" />
                </div>
              </CardContent>
            </Card>
            
            {/* Outstanding Bills */}
            <Card 
              className={`bg-gradient-to-br from-orange-500 to-orange-600 text-white cursor-pointer hover:shadow-lg transition-shadow ${kpiFilter === 'outstanding-bills' ? 'ring-4 ring-white ring-opacity-50' : ''}`}
              onClick={() => {
                setKpiFilter('outstanding-bills');
                setSelectedPatient(null);
              }}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase font-semibold text-orange-100 mb-1">Outstanding Bills</p>
                    <h3 className="text-3xl font-bold">₹1.2L</h3>
                  </div>
                  <Download className="w-10 h-10 text-orange-200" />
                </div>
              </CardContent>
            </Card>
            
            {/* Critical Alerts */}
            <Card 
              className={`bg-gradient-to-br from-red-500 to-red-600 text-white cursor-pointer hover:shadow-lg transition-shadow ${kpiFilter === 'critical-alerts' ? 'ring-4 ring-white ring-opacity-50' : ''}`}
              onClick={() => {
                setKpiFilter('critical-alerts');
                setSelectedPatient(null);
              }}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase font-semibold text-red-100 mb-1">Critical Alerts</p>
                    <h3 className="text-3xl font-bold">3</h3>
                  </div>
                  <CheckCircle2 className="w-10 h-10 text-red-200" />
                </div>
              </CardContent>
            </Card>
          </div>
          )}
          
          {/* Patient Dashboard View */}
          {selectedPatient ? (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* PATIENT DASHBOARD - Ultra Compact Design */}
              {/* Minimal Header with Back Button Only */}
              <div className="flex-shrink-0 bg-gradient-to-r from-indigo-50 to-blue-50 px-4 py-3">
                <button
                  onClick={() => {
                    setSelectedPatient(null);
                    setKpiFilter('all');
                  }}
                  className="px-3 py-1.5 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-md hover:from-indigo-600 hover:to-indigo-700 font-medium flex items-center gap-1.5 text-sm shadow-sm transition-all hover:shadow-md"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back to Patient List
                </button>
              </div>
                  
                  {/* Scrollable Widgets Area - ONLY SCROLL HERE */}
                  <div className="flex-1 overflow-y-auto px-4 pt-4 pb-6 bg-gradient-to-r from-indigo-50 to-blue-50">
                  {!expandedWidget ? (
                  <>
                    {/* Patient Info Row - Photo, Demographics Widget, and Quick Actions */}
                    <div className="flex items-start gap-4 mb-6">
                      {/* Patient Photo */}
                      <div className="flex-shrink-0">
                        {selectedPatient.photo ? (
                          <img src={selectedPatient.photo} alt={selectedPatient.name} className="w-36 h-36 rounded-2xl object-cover border-3 border-indigo-400 shadow-lg" />
                        ) : (
                          <div className="w-36 h-36 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white font-bold text-4xl shadow-lg border-3 border-indigo-400">
                            {getInitials(selectedPatient.name)}
                          </div>
                        )}
                      </div>
                      
                      {/* Patient Demographics Widget - Compact Width */}
                      <div className="flex-shrink-0 bg-white rounded-lg border border-gray-200 shadow-sm p-4 w-[480px]">
                        <div className="flex items-center gap-2 mb-3">
                          <User className="w-5 h-5 text-indigo-600" />
                          <h3 className="font-semibold text-gray-900">Patient Demographics</h3>
                        </div>
                        <div className="space-y-2.5">
                          <div className="flex items-center gap-2">
                            <h2 className="text-lg font-bold text-gray-900">{selectedPatient.name}</h2>
                            <Badge className="bg-green-500 text-white text-xs px-2 py-0.5">{selectedPatient.status}</Badge>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-700">
                            <span className="font-semibold">MRN: {selectedPatient.mrn}</span>
                            <span>•</span>
                            <span>{selectedPatient.age}y</span>
                            <span>•</span>
                            <span>{selectedPatient.gender}</span>
                            <span>•</span>
                            <span className="font-semibold text-red-600">{selectedPatient.bloodType}</span>
                            <span>•</span>
                            <span>DOB: {selectedPatient.dateOfBirth || 'N/A'}</span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-600">
                            <div className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              <span>{selectedPatient.mobile || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              <span className="truncate max-w-[200px]">{selectedPatient.email || 'N/A'}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-600">
                            <MapPin className="w-3 h-3" />
                            <span className="truncate">{selectedPatient.address || 'Not provided'}</span>
                          </div>
                          <div className="pt-2 border-t border-gray-100 space-y-1 text-xs text-gray-600">
                            <div className="flex items-center gap-1">
                              <span className="font-medium">Emergency Contact:</span>
                              <span>{selectedPatient.emergencyContact || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="font-medium">Insurance:</span>
                              <span>{selectedPatient.insuranceProvider || 'No Insurance'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Quick Actions Widget */}
                      <div className="flex-shrink-0 bg-white rounded-lg border border-indigo-200 shadow-md p-4 w-80">
                        <h3 className="text-sm font-bold text-indigo-900 mb-3 uppercase tracking-wider">Quick Actions</h3>
                        <div className="grid grid-cols-2 gap-2">
                          <button className="px-3 py-2.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 text-sm font-medium flex items-center justify-center gap-1.5 border border-blue-200 transition-all hover:shadow-sm">
                            <Activity className="w-4 h-4" />
                            <span>Vitals</span>
                          </button>
                          <button className="px-3 py-2.5 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 text-sm font-medium flex items-center justify-center gap-1.5 border border-purple-200 transition-all hover:shadow-sm">
                            <CalendarPlus className="w-4 h-4" />
                            <span>Prescribe</span>
                          </button>
                          <button className="px-3 py-2.5 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 text-sm font-medium flex items-center justify-center gap-1.5 border border-green-200 transition-all hover:shadow-sm">
                            <Activity className="w-4 h-4" />
                            <span>Labs</span>
                          </button>
                          <button className="px-3 py-2.5 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 text-sm font-medium flex items-center justify-center gap-1.5 border border-orange-200 transition-all hover:shadow-sm">
                            <Calendar className="w-4 h-4" />
                            <span>Imaging</span>
                          </button>
                          <button className="px-3 py-2.5 bg-pink-50 text-pink-700 rounded-lg hover:bg-pink-100 text-sm font-medium flex items-center justify-center gap-1.5 border border-pink-200 transition-all hover:shadow-sm">
                            <User className="w-4 h-4" />
                            <span>Referral</span>
                          </button>
                          <button className="px-3 py-2.5 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 text-sm font-medium flex items-center justify-center gap-1.5 border border-indigo-200 transition-all hover:shadow-sm">
                            <CalendarPlus className="w-4 h-4" />
                            <span>Follow-up</span>
                          </button>
                          <button className="px-3 py-2.5 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 text-sm font-medium flex items-center justify-center gap-1.5 border border-gray-200 transition-all hover:shadow-sm">
                            <Mail className="w-4 h-4" />
                            <span>Message</span>
                          </button>
                          <button className="px-3 py-2.5 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 text-sm font-medium flex items-center justify-center gap-1.5 border border-red-200 transition-all hover:shadow-sm">
                            <Download className="w-4 h-4" />
                            <span>Print</span>
                          </button>
                        </div>
                      </div>
                      
                      {/* Quick Info Cards - Fill Empty Space */}
                      <div className="flex-1 grid grid-cols-2 gap-4 min-w-[300px]">
                        {/* Allergies Quick Card */}
                        <Card className="cursor-pointer transition-transform hover:scale-105">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Activity className="w-5 h-5 text-orange-600" />
                              <h3 className="font-semibold text-sm text-gray-900">Allergies</h3>
                            </div>
                            <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">No Known</Badge>
                          </CardContent>
                        </Card>
                        
                        {/* Last Visit Quick Card */}
                        <Card className="cursor-pointer transition-transform hover:scale-105">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Calendar className="w-5 h-5 text-blue-600" />
                              <h3 className="font-semibold text-sm text-gray-900">Last Visit</h3>
                            </div>
                            <p className="text-xs text-gray-600">2 days ago</p>
                          </CardContent>
                        </Card>
                        
                        {/* Active Meds Quick Card */}
                        <Card className="cursor-pointer transition-transform hover:scale-105">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Activity className="w-5 h-5 text-green-600" />
                              <h3 className="font-semibold text-sm text-gray-900">Medications</h3>
                            </div>
                            <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">2 Active</Badge>
                          </CardContent>
                        </Card>
                        
                        {/* Diagnoses Quick Card */}
                        <Card className="cursor-pointer transition-transform hover:scale-105">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Activity className="w-5 h-5 text-red-600" />
                              <h3 className="font-semibold text-sm text-gray-900">Diagnoses</h3>
                            </div>
                            <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">0 Active</Badge>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                    
                    {/* Widgets Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Row 1 - Big: Vitals (2 cols) + Medium: Appointments + Labs */}
                    <div onClick={() => setExpandedWidget('vitals')} className="lg:col-span-2 lg:row-span-2 cursor-pointer transition-transform hover:scale-105">
                      <VitalsTrendsWidget patientId={selectedPatient.id} />
                    </div>
                    <div onClick={() => setExpandedWidget('appointments')} className="lg:row-span-2 cursor-pointer transition-transform hover:scale-105">
                      <AppointmentsWidget patientId={selectedPatient.id} />
                    </div>
                    <div onClick={() => setExpandedWidget('labs')} className="lg:row-span-2 cursor-pointer transition-transform hover:scale-105">
                      <LabResultsWidget patientId={selectedPatient.id} />
                    </div>
                    
                    {/* Row 2 - Medium: Medications + Diagnoses + Big: Clinical Summary (2 cols) */}
                    <div onClick={() => setExpandedWidget('medications')} className="cursor-pointer transition-transform hover:scale-105">
                      <MedicationsWidget patientId={selectedPatient.id} />
                    </div>
                    <Card onClick={() => setExpandedWidget('diagnoses')} className="cursor-pointer transition-transform hover:scale-105">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Activity className="w-5 h-5 text-red-600" />
                          <h3 className="font-semibold text-gray-900">Diagnoses</h3>
                          <Badge variant="outline" className="ml-auto text-xs">0 Active</Badge>
                        </div>
                        <div className="text-sm text-gray-600">
                          <p>No active diagnoses</p>
                        </div>
                      </CardContent>
                    </Card>
                    <div onClick={() => setExpandedWidget('clinical')} className="lg:col-span-2 cursor-pointer transition-transform hover:scale-105">
                      <ClinicalSummaryWidget patientId={selectedPatient.id} />
                    </div>
                    
                    {/* Row 3 - Big: Billing (2 cols) + Medium: Allergies + Imaging */}
                    <div onClick={() => setExpandedWidget('billing')} className="lg:col-span-2 cursor-pointer transition-transform hover:scale-105">
                      <BillingWidget patientId={selectedPatient.id} />
                    </div>
                    <Card onClick={() => setExpandedWidget('allergies')} className="cursor-pointer transition-transform hover:scale-105">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Activity className="w-5 h-5 text-orange-600" />
                          <h3 className="font-semibold text-gray-900">Allergies</h3>
                          <Badge variant="outline" className="ml-auto text-xs">Active</Badge>
                        </div>
                        <div className="text-sm text-gray-600">
                          <p>No known allergies</p>
                        </div>
                      </CardContent>
                    </Card>
                    <div onClick={() => setExpandedWidget('imaging')} className="cursor-pointer transition-transform hover:scale-105">
                      <ImagingWidget patientId={selectedPatient.id} />
                    </div>
                    
                    {/* Row 4 - Medium: Insurance + Communications + Prescriptions + Visits */}
                    <div onClick={() => setExpandedWidget('insurance')} className="cursor-pointer transition-transform hover:scale-105">
                      <InsuranceWidget patientId={selectedPatient.id} />
                    </div>
                    <div onClick={() => setExpandedWidget('communications')} className="cursor-pointer transition-transform hover:scale-105">
                      <CommunicationsWidget patientId={selectedPatient.id} />
                    </div>
                    <Card onClick={() => setExpandedWidget('prescriptions')} className="cursor-pointer transition-transform hover:scale-105">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Activity className="w-5 h-5 text-pink-600" />
                          <h3 className="font-semibold text-gray-900">Prescriptions</h3>
                          <Badge variant="outline" className="ml-auto text-xs">2 Active</Badge>
                        </div>
                        <div className="text-sm text-gray-600">
                          <p>2 active prescriptions</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card onClick={() => setExpandedWidget('visits')} className="cursor-pointer transition-transform hover:scale-105">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Calendar className="w-5 h-5 text-blue-600" />
                          <h3 className="font-semibold text-gray-900">Visits</h3>
                          <Badge variant="outline" className="ml-auto text-xs">12 Total</Badge>
                        </div>
                        <div className="text-sm text-gray-600">
                          <p>Last visit: 2 days ago</p>
                        </div>
                      </CardContent>
                    </Card>
                    
                    {/* Row 5 - Medium: Documents + Big: Engagement (2 cols) + Consents */}
                    <Card onClick={() => setExpandedWidget('documents')} className="cursor-pointer transition-transform hover:scale-105">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Activity className="w-5 h-5 text-indigo-600" />
                          <h3 className="font-semibold text-gray-900">Documents</h3>
                          <Badge variant="outline" className="ml-auto text-xs">8 Files</Badge>
                        </div>
                        <div className="text-sm text-gray-600">
                          <p>8 documents on file</p>
                        </div>
                      </CardContent>
                    </Card>
                    <div onClick={() => setExpandedWidget('engagement')} className="lg:col-span-2 cursor-pointer transition-transform hover:scale-105">
                      <EngagementWidget patientId={selectedPatient.id} />
                    </div>
                    <Card onClick={() => setExpandedWidget('consents')} className="cursor-pointer transition-transform hover:scale-105">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                          <h3 className="font-semibold text-gray-900">Consents</h3>
                          <Badge variant="outline" className="ml-auto text-xs bg-green-50">5 Signed</Badge>
                        </div>
                        <div className="text-sm text-gray-600">
                          <p>All required consents</p>
                        </div>
                      </CardContent>
                    </Card>
                    
                    {/* Row 6 - Medium: Referrals + Queue Status (remaining widgets) */}
                    <Card onClick={() => setExpandedWidget('referrals')} className="cursor-pointer transition-transform hover:scale-105">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Activity className="w-5 h-5 text-teal-600" />
                          <h3 className="font-semibold text-gray-900">Referrals</h3>
                          <Badge variant="outline" className="ml-auto text-xs">0 Active</Badge>
                        </div>
                        <div className="text-sm text-gray-600">
                          <p>No active referrals</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card onClick={() => setExpandedWidget('queue')} className="cursor-pointer transition-transform hover:scale-105">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Clock className="w-5 h-5 text-purple-600" />
                          <h3 className="font-semibold text-gray-900">Queue Status</h3>
                          <Badge variant="outline" className="ml-auto text-xs bg-green-50">In Queue</Badge>
                        </div>
                        <div className="text-sm text-gray-600">
                          <p>Token: A-012 • Position: 3rd</p>
                        </div>
                      </CardContent>
                    </Card>
                    </div>
                    </>
                  ) : (
                  <div className="relative bg-white rounded-lg border border-gray-200 shadow-lg p-6 animate-fadeIn h-full">
                    {/* Expanded Widget View - Full Width with Close Button */}
                    <button
                      onClick={() => setExpandedWidget(null)}
                      className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
                      title="Close"
                    >
                      <X className="w-6 h-6 text-gray-600" />
                    </button>
                    
                    <div className="pr-12">
                      {expandedWidget === 'vitals' && <VitalsTrendsWidget patientId={selectedPatient.id} expanded />}
                      {expandedWidget === 'appointments' && <AppointmentsWidget patientId={selectedPatient.id} expanded />}
                      {expandedWidget === 'labs' && <LabResultsWidget patientId={selectedPatient.id} expanded />}
                      {expandedWidget === 'medications' && <MedicationsWidget patientId={selectedPatient.id} expanded />}
                      {expandedWidget === 'clinical' && <ClinicalSummaryWidget patientId={selectedPatient.id} expanded />}
                      {expandedWidget === 'imaging' && <ImagingWidget patientId={selectedPatient.id} expanded />}
                      {expandedWidget === 'billing' && <BillingWidget patientId={selectedPatient.id} expanded />}
                      {expandedWidget === 'insurance' && <InsuranceWidget patientId={selectedPatient.id} expanded />}
                      {expandedWidget === 'communications' && <CommunicationsWidget patientId={selectedPatient.id} expanded />}
                      {expandedWidget === 'engagement' && <EngagementWidget patientId={selectedPatient.id} expanded />}
                      
                      {expandedWidget === 'diagnoses' && (
                        <div className="space-y-4">
                          <h2 className="text-2xl font-bold text-gray-900">Patient Diagnoses</h2>
                          <p className="text-gray-600">No active diagnoses recorded. Add diagnosis to track patient conditions and treatment plans.</p>
                          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Add Diagnosis</button>
                        </div>
                      )}
                      {expandedWidget === 'allergies' && (
                        <div className="space-y-4">
                          <h2 className="text-2xl font-bold text-gray-900">Allergies & Reactions</h2>
                          <p className="text-gray-600">No known allergies recorded. Record any drug, food, or environmental allergies.</p>
                          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Add Allergy</button>
                        </div>
                      )}
                      {expandedWidget === 'prescriptions' && (
                        <div className="space-y-4">
                          <h2 className="text-2xl font-bold text-gray-900">Active Prescriptions</h2>
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="font-medium">2 active prescriptions on file</p>
                          </div>
                          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">View All Prescriptions</button>
                        </div>
                      )}
                      {expandedWidget === 'visits' && (
                        <div className="space-y-4">
                          <h2 className="text-2xl font-bold text-gray-900">Visit History</h2>
                          <p className="text-gray-600">12 total visits • Last visit: 2 days ago</p>
                          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">View All Visits</button>
                        </div>
                      )}
                      {expandedWidget === 'documents' && (
                        <div className="space-y-4">
                          <h2 className="text-2xl font-bold text-gray-900">Patient Documents</h2>
                          <p className="text-gray-600">8 documents on file including medical records, images, and reports.</p>
                          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Browse Documents</button>
                        </div>
                      )}
                      {expandedWidget === 'consents' && (
                        <div className="space-y-4">
                          <h2 className="text-2xl font-bold text-gray-900">Patient Consents</h2>
                          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <p className="font-medium text-green-800">✓ All required consents signed (5 total)</p>
                          </div>
                          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">View All Consents</button>
                        </div>
                      )}
                      {expandedWidget === 'referrals' && (
                        <div className="space-y-4">
                          <h2 className="text-2xl font-bold text-gray-900">Referrals</h2>
                          <p className="text-gray-600">No active referrals. Create referrals to specialist providers.</p>
                          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Create Referral</button>
                        </div>
                      )}
                      {expandedWidget === 'queue' && (
                        <div className="space-y-4">
                          <h2 className="text-2xl font-bold text-gray-900">Queue Status</h2>
                          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                            <p className="font-medium">Token: A-012</p>
                            <p className="text-sm text-gray-600">Position: 3rd in queue</p>
                          </div>
                          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">View Queue Details</button>
                        </div>
                      )}
                    </div>
                  </div>
                  )}
                  </div>
                </div>
          ) : (
            <div className="flex-1 overflow-y-auto px-2">
              {/* PATIENT GRID - No Patient Selected */}
              <div className="mb-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {kpiFilter === 'all' ? 'All Patients' : 
                   kpiFilter === 'outstanding-bills' ? 'Patients with Outstanding Bills' :
                   kpiFilter === 'critical-alerts' ? 'Patients with Critical Alerts' :
                   kpiFilter === 'pending-labs' ? 'Patients with Pending Labs' :
                   'Patients with Active Appointments'}
                </h3>
                <p className="text-sm text-gray-600">Select a patient to view their dashboard</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {filteredPatients.slice(0, 20).map((patient) => (
                  <Card
                    key={patient.id}
                    className="cursor-pointer hover:shadow-lg transition-all hover:border-indigo-500"
                    onClick={() => {
                      setSelectedPatient(patient);
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3 mb-3">
                        {patient.photo ? (
                          <img src={patient.photo} alt={patient.name} className="w-12 h-12 rounded-lg object-cover" />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-semibold text-sm">
                            {getInitials(patient.name)}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 truncate">{patient.name}</h4>
                          <p className="text-xs text-gray-500">{patient.mrn}</p>
                        </div>
                        <Badge variant="outline" className="text-xs">{patient.status}</Badge>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <User className="w-3 h-3" />
                          <span>{patient.age}y • {patient.gender}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <Phone className="w-3 h-3" />
                          <span>{patient.mobile || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <Calendar className="w-3 h-3" />
                          <span>Last visit: {patient.lastVisit || 'Never'}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
      </div>

      {/* Check-In Dialog */}
      <CheckInDialog
        isOpen={showCheckInDialog}
        onClose={() => setShowCheckInDialog(false)}
        onCheckIn={handleCheckIn}
        patientName={selectedPatient?.name || ''}
        isLoading={isCheckingIn}
      />

      {/* Token Slip Dialog - Day 6 */}
      {tokenData && (
        <TokenSlip
          isOpen={showTokenSlip}
          onClose={() => setShowTokenSlip(false)}
          tokenData={tokenData}
        />
      )}

      {/* New Patient Registration Modal */}
      {showRegistrationModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden">
            {/* Close button in top-right corner */}
            <button
              onClick={() => setShowRegistrationModal(false)}
              className="absolute top-4 right-4 z-20 p-2 hover:bg-gray-100 rounded-full transition-colors bg-white shadow-md"
              type="button"
              title="Close"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {/* Modal Content - Iframe to registration page */}
            <div className="overflow-y-auto h-full">
              <iframe
                src="/dashboard/patients/new"
                className="w-full h-full border-0"
                style={{ minHeight: '700px' }}
                title="New Patient Registration"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
