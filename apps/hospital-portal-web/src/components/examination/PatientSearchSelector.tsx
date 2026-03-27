'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, User, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { patientApi, Patient as PatientType } from '@/lib/api/patients.api';
import { useAuthStore } from '@/lib/auth-store';
import { useClinicalStore } from '@/lib/stores/clinical-store';

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  patientCode: string;
  dateOfBirth?: string;
  phone?: string;
  email?: string;
}

interface PatientSearchSelectorProps {
  onPatientSelect?: (patientId: string) => void;
  currentPath: string;
}

export default function PatientSearchSelector({ onPatientSelect, currentPath }: PatientSearchSelectorProps) {
  const router = useRouter();
  const { token } = useAuthStore();
  const { setCurrentPatient } = useClinicalStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch patients list only if token is available
    const fetchPatients = async () => {
      if (!token) {
        console.warn('⚠️ No auth token available - skipping patient fetch');
        setAuthError(true);
        return;
      }
      
      setAuthError(false);
      
      try {
        setIsLoading(true);
        console.log('🔍 Fetching patients with token:', token.substring(0, 20) + '...');
        const response = await patientApi.getAll({ pageSize: 100 });
        console.log('✅ Patient API response:', response);
        
        // Extract data from Axios response
        const patientData = response.data || response;
        
        if (patientData && Array.isArray(patientData)) {
          console.log('📦 Raw backend response (first patient):', patientData[0]);
          
          // Map backend response to our Patient interface
          const mappedPatients = patientData.map((p: any) => {
            const mapped = {
              id: p.id,
              firstName: p.firstName || '',
              lastName: p.lastName || '',
              patientCode: p.medicalRecordNumber || p.patientCode || '', // Backend uses medicalRecordNumber
              dateOfBirth: p.dateOfBirth,
              phone: p.contactNumber || p.phone || '',
              email: p.email || '',
            };
            return mapped;
          });
          
          console.log(`✅ Loaded ${mappedPatients.length} patients`);
          console.log('✅ Sample mapped patient:', mappedPatients[0]);
          setPatients(mappedPatients);
        } else {
          console.error('❌ Invalid response format. Expected array, got:', typeof patientData);
        }
      } catch (error: any) {
        console.error('❌ Failed to fetch patients:', error);
        console.error('❌ Error details:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          statusText: error.response?.statusText
        });
        
        if (error.response?.status === 401) {
          setAuthError(true);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatients();
  }, [token]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      console.log('🔍 Filtering patients with query:', query);
      console.log('📋 Total patients to filter:', patients.length);
      console.log('📋 Sample patient data:', patients[0]);
      
      const filtered = patients.filter(
        (patient) => {
          const firstNameMatch = (patient.firstName || '').toLowerCase().includes(query);
          const lastNameMatch = (patient.lastName || '').toLowerCase().includes(query);
          const patientCodeMatch = (patient.patientCode || '').toLowerCase().includes(query);
          const emailMatch = (patient.email || '').toLowerCase().includes(query);
          const phoneMatch = (patient.phone || '').includes(query);
          
          return firstNameMatch || lastNameMatch || patientCodeMatch || emailMatch || phoneMatch;
        }
      );
      
      console.log('✅ Filtered patients count:', filtered.length);
      console.log('✅ Filtered patients:', filtered.slice(0, 3));
      
      setFilteredPatients(filtered);
      setShowDropdown(true);
    } else {
      setFilteredPatients([]);
      setShowDropdown(false);
    }
  }, [searchQuery, patients]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectPatient = (patient: Patient) => {
    setSearchQuery(`${patient.firstName} ${patient.lastName} (${patient.patientCode})`);
    setShowDropdown(false);
    
    // Set patient in clinical store
    setCurrentPatient({
      id: patient.id,
      firstName: patient.firstName,
      lastName: patient.lastName,
      medicalRecordNumber: patient.patientCode,
      patientCode: patient.patientCode,
      dateOfBirth: patient.dateOfBirth,
      phone: patient.phone,
      email: patient.email,
    } as any);
    
    // Navigate to current page with patient ID
    router.push(`${currentPath}?patientId=${patient.id}`);
    
    if (onPatientSelect) {
      onPatientSelect(patient.id);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setFilteredPatients([]);
    setShowDropdown(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => searchQuery && setShowDropdown(true)}
          disabled={isLoading}
          className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
        {isLoading && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          </div>
        )}
        {searchQuery && !isLoading && (
          <button
            onClick={clearSearch}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && !isLoading && (
        <>
          {filteredPatients.length > 0 ? (
            <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-y-auto">
              <ul className="py-1">
                {filteredPatients.map((patient) => (
                  <li key={patient.id}>
                    <button
                      onClick={() => handleSelectPatient(patient)}
                      className="w-full px-4 py-3 hover:bg-gray-50 flex items-start text-left transition-colors"
                    >
                      <User className="h-5 w-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900">
                          {patient.firstName} {patient.lastName}
                        </div>
                        <div className="text-sm text-gray-600 space-y-0.5">
                          <div>MRN: {patient.patientCode}</div>
                          {patient.dateOfBirth && (
                            <div>DOB: {new Date(patient.dateOfBirth).toLocaleDateString()}</div>
                          )}
                          {patient.phone && <div>Phone: {patient.phone}</div>}
                        </div>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : searchQuery && !authError ? (
            <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg p-4 text-center text-gray-500">
              No patients found matching "{searchQuery}"
            </div>
          ) : null}
        </>
      )}

      {/* Auth error */}
      {authError && (
        <div className="absolute z-50 mt-1 w-full bg-red-50 border border-red-300 rounded-lg shadow-lg p-4">
          <div className="text-red-800 font-medium">Authentication Error</div>
          <div className="text-red-600 text-sm mt-1">
            Please log out and log in again to search for patients.
          </div>
        </div>
      )}
    </div>
  );
}
