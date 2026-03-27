'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X, User } from 'lucide-react';
import { useDoctorSearch } from '@/hooks/use-master-data';
import type { DoctorSearchResult } from '@/lib/api/master-data.api';

interface DoctorSearchComboboxProps {
  onSelect: (doctor: DoctorSearchResult) => void;
  branchId?: string;
  specialty?: string;
  placeholder?: string;
  value?: DoctorSearchResult | null;
  errorMessage?: string;
  disabled?: boolean;
}

export default function DoctorSearchCombobox({
  onSelect,
  branchId,
  specialty,
  placeholder = 'Search for a doctor...',
  value,
  errorMessage,
  disabled = false,
}: DoctorSearchComboboxProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch doctors based on search (only when search term is provided)
  const { data, isLoading, error: fetchError } = useDoctorSearch(
    {
      searchTerm: debouncedSearch,
      specialty,
      branchId,
      limit: 20,
    },
    {
      enabled: debouncedSearch.length >= 2, // Only fetch when 2+ characters
    }
  );

  const doctors = data?.data || [];

  // Log errors for debugging
  if (fetchError) {
    console.error('Doctor search error:', fetchError);
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (doctor: DoctorSearchResult) => {
    onSelect(doctor);
    setSearchTerm('');
    setIsOpen(false);
  };

  const handleClear = () => {
    onSelect(null as any);
    setSearchTerm('');
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Selected Doctor Display */}
      {value && !isOpen ? (
        <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="p-2 bg-blue-100 rounded-full flex-shrink-0">
              <User className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">{value.fullName}</p>
              <p className="text-sm text-gray-500 truncate">
                {value.specialization} • {value.department}
              </p>
            </div>
          </div>
          {!disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 hover:bg-gray-100 rounded transition-colors flex-shrink-0"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              disabled={disabled}
              placeholder={placeholder}
              className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 ${
                errorMessage ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {isLoading ? (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 transition-transform ${
                  isOpen ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </div>

          {/* Dropdown Results */}
          {isOpen && !disabled && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto">
              {isLoading ? (
                <div className="p-4 text-center text-gray-500">
                  <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-sm">Searching for doctors...</p>
                </div>
              ) : doctors.length > 0 ? (
                <ul className="py-1">
                  {doctors.map((doctor) => (
                    <li key={doctor.id}>
                      <button
                        type="button"
                        onClick={() => handleSelect(doctor)}
                        className="w-full px-4 py-3 hover:bg-blue-50 transition-colors text-left flex items-start gap-3"
                      >
                        <div className="p-2 bg-blue-100 rounded-full flex-shrink-0 mt-0.5">
                          <User className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900">{doctor.fullName}</p>
                          <p className="text-sm text-gray-600">{doctor.specialization}</p>
                          <p className="text-xs text-gray-500">
                            {doctor.department}
                            {doctor.qualification && ` • ${doctor.qualification}`}
                          </p>
                          {doctor.licenseNumber && (
                            <p className="text-xs text-gray-400 mt-1">
                              License: {doctor.licenseNumber}
                            </p>
                          )}
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : searchTerm.length >= 2 ? (
                <div className="p-4 text-center text-gray-500">
                  <User className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No doctors found for "{searchTerm}"</p>
                  <p className="text-xs text-gray-400 mt-1">Try a different search term</p>
                </div>
              ) : (
                <div className="p-4 text-center text-gray-500">
                  <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">Type at least 2 characters to search</p>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Error Message */}
      {(errorMessage || fetchError) && (
        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
          <X className="w-4 h-4" /> {errorMessage || 'Failed to load doctors'}
        </p>
      )}
    </div>
  );
}
