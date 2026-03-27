/**
 * Enhanced Patient Search Bar
 * Searches real patients from the backend API (name, MRN, phone).
 * Selecting a patient starts a new counseling session.
 */

'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, Loader2, User, Phone, MapPin } from 'lucide-react';
import { getApi } from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';

interface PatientResult {
  id: string;
  firstName: string;
  lastName: string;
  medicalRecordNumber: string;
  contactNumber?: string;
  dateOfBirth?: string;
  gender?: string;
  email?: string;
}

interface PatientSearchBarEnhancedProps {
  onSelectPatient: (patient: any) => void;
}

function calcAge(dob?: string): number | null {
  if (!dob) return null;
  const diff = Date.now() - new Date(dob).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}

export function PatientSearchBarEnhanced({ onSelectPatient }: PatientSearchBarEnhancedProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [allPatients, setAllPatients] = useState<PatientResult[]>([]);
  const [results, setResults] = useState<PatientResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { user } = useAuthStore();

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Fetch all patients once when user starts typing (cached in allPatients)
  const fetchPatients = useCallback(async () => {
    if (hasFetched) return;
    setIsLoading(true);
    setError(null);
    try {
      const api = getApi();
      const response = await api.get('/patients');
      const data: PatientResult[] = Array.isArray(response.data)
        ? response.data
        : response.data?.items ?? [];
      setAllPatients(data);
      setHasFetched(true);
    } catch (err: any) {
      setError('Could not load patients. Check your connection.');
      console.error('[PatientSearch] fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [hasFetched]);

  // Debounced filter
  useEffect(() => {
    if (searchTerm.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      if (!hasFetched) {
        await fetchPatients();
      }
      const q = searchTerm.toLowerCase();
      const filtered = allPatients.filter(
        (p) =>
          `${p.firstName} ${p.lastName}`.toLowerCase().includes(q) ||
          p.medicalRecordNumber?.toLowerCase().includes(q) ||
          (p.contactNumber ?? '').includes(searchTerm)
      );
      setResults(filtered.slice(0, 20));
      setIsOpen(true);
    }, 300);

    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, allPatients, hasFetched]);

  // Re-filter when patients list loads
  useEffect(() => {
    if (hasFetched && searchTerm.length >= 2) {
      const q = searchTerm.toLowerCase();
      const filtered = allPatients.filter(
        (p) =>
          `${p.firstName} ${p.lastName}`.toLowerCase().includes(q) ||
          p.medicalRecordNumber?.toLowerCase().includes(q) ||
          (p.contactNumber ?? '').includes(searchTerm)
      );
      setResults(filtered.slice(0, 20));
      setIsOpen(filtered.length > 0 || error !== null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allPatients, hasFetched]);

  const handleSelect = (patient: PatientResult) => {
    // Build queue-item-compatible object so handleSelectPatient in page.tsx
    // creates a new counseling session for this patient.
    onSelectPatient({
      id: `search-${patient.id}`,
      patientId: patient.id,
      patientName: `${patient.firstName} ${patient.lastName}`,
      mrn: patient.medicalRecordNumber,
      tokenNumber: 'WALK-IN',
      sessionId: undefined,
      queueStatus: undefined,
      tenantId: user?.tenantId,
      sessionType: 'Initial',
      patientType: 'Cash',
      urgencyLevel: 'Routine',
    });
    setSearchTerm('');
    setResults([]);
    setIsOpen(false);
  };

  const handleClear = () => {
    setSearchTerm('');
    setResults([]);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => {
            if (searchTerm.length >= 2 && results.length > 0) setIsOpen(true);
          }}
          placeholder="Search patients by name, MRN or phone..."
          className="w-full pl-9 pr-8 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-500 animate-spin" />
        )}
        {!isLoading && searchTerm && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Results dropdown */}
      {isOpen && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden">
          {error ? (
            <div className="px-4 py-3 text-sm text-red-600 bg-red-50">
              {error}
            </div>
          ) : isLoading ? (
            <div className="flex items-center gap-2 px-4 py-3 text-sm text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Searching patients...
            </div>
          ) : results.length === 0 ? (
            <div className="px-4 py-4 text-center">
              <User className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600">No patients found</p>
              <p className="text-xs text-gray-400 mt-0.5">Try a different name, MRN, or phone number</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
              {results.map((patient) => {
                const age = calcAge(patient.dateOfBirth);
                const fullName = `${patient.firstName} ${patient.lastName}`;
                return (
                  <li
                    key={patient.id}
                    onClick={() => handleSelect(patient)}
                    className="flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-blue-50 transition-colors group"
                  >
                    {/* Avatar */}
                    <div className="flex-shrink-0 w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-semibold">
                      {patient.firstName?.[0]?.toUpperCase() ?? '?'}
                    </div>

                    {/* Patient info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-gray-900 group-hover:text-blue-700 truncate">
                          {fullName}
                        </span>
                        <span className="text-xs font-mono text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                          {patient.medicalRecordNumber}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-500">
                        {age !== null && (
                          <span>
                            {age}y{patient.gender ? ` · ${patient.gender}` : ''}
                          </span>
                        )}
                        {patient.contactNumber && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {patient.contactNumber}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* CTA */}
                    <div className="flex-shrink-0 self-center">
                      <span className="text-xs text-blue-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        Start Session →
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {results.length > 0 && (
            <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-400">
                {results.length} patient{results.length !== 1 ? 's' : ''} found · Click to start a new counseling session
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}