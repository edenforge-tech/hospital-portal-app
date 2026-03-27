/**
 * Patient Search Bar Component
 * Global search to find any patient and start counseling session
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, X, User, Phone, Calendar, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/lib/auth-store';

interface SearchResult {
  id: string;
  mrn: string;
  firstName: string;
  lastName: string;
  age: number;
  gender: string;
  phone?: string;
  lastVisit?: string;
  hasActiveSession?: boolean;
}

interface PatientSearchBarProps {
  onSelectPatient: (patient: SearchResult) => void;
  placeholder?: string;
  className?: string;
}

export function PatientSearchBar({
  onSelectPatient,
  placeholder = "Search patients by name, MRN, or phone...",
  className,
}: PatientSearchBarProps) {
  const { user } = useAuthStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search patients
  useEffect(() => {
    const searchPatients = async () => {
      if (query.trim().length < 2) {
        setResults([]);
        setIsOpen(false);
        return;
      }

      setIsSearching(true);
      setIsOpen(true);

      try {
        // TODO: Replace with actual API call
        // const response = await fetch(`/api/patients/search?q=${encodeURIComponent(query)}`);
        // const data = await response.json();
        
        // Mock data for now
        await new Promise(resolve => setTimeout(resolve, 300));
        const mockResults: SearchResult[] = [
          {
            id: '1',
            mrn: 'MRN001234',
            firstName: 'Rajesh',
            lastName: 'Kumar',
            age: 45,
            gender: 'Male',
            phone: '+91 98765 43210',
            lastVisit: '2 days ago',
            hasActiveSession: false,
          },
          {
            id: '2',
            mrn: 'MRN005678',
            firstName: 'Priya',
            lastName: 'Sharma',
            age: 38,
            gender: 'Female',
            phone: '+91 98765 12345',
            lastVisit: '1 week ago',
            hasActiveSession: false,
          },
          {
            id: '3',
            mrn: 'MRN009876',
            firstName: 'Amit',
            lastName: 'Patel',
            age: 52,
            gender: 'Male',
            phone: '+91 98765 67890',
            lastVisit: '3 hours ago',
            hasActiveSession: true,
          },
        ];

        setResults(mockResults.filter(p => 
          p.firstName.toLowerCase().includes(query.toLowerCase()) ||
          p.lastName.toLowerCase().includes(query.toLowerCase()) ||
          p.mrn.toLowerCase().includes(query.toLowerCase()) ||
          (p.phone && p.phone.includes(query))
        ));
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(searchPatients, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  const handleSelectPatient = (patient: SearchResult) => {
    onSelectPatient(patient);
    setQuery('');
    setResults([]);
    setIsOpen(false);
  };

  return (
    <div ref={searchRef} className={cn('relative', className)}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim().length >= 2 && setIsOpen(true)}
          placeholder={placeholder}
          className="w-full pl-12 pr-10 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setResults([]);
              setIsOpen(false);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
          >
            <X className="h-4 w-4 text-gray-400" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl max-h-96 overflow-y-auto z-50">
          {isSearching ? (
            <div className="p-8 text-center">
              <Activity className="h-8 w-8 mx-auto mb-2 text-blue-500 animate-spin" />
              <p className="text-sm text-gray-500">Searching patients...</p>
            </div>
          ) : results.length === 0 ? (
            <div className="p-8 text-center">
              <Search className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm text-gray-500">
                {query.trim().length < 2 
                  ? 'Type at least 2 characters to search'
                  : 'No patients found matching your search'
                }
              </p>
            </div>
          ) : (
            <div className="py-2">
              {results.map((patient) => (
                <button
                  key={patient.id}
                  onClick={() => handleSelectPatient(patient)}
                  className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-0"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <User className="h-4 w-4 text-gray-400" />
                        <p className="font-semibold text-gray-900">
                          {patient.firstName} {patient.lastName}
                        </p>
                        <span className="text-xs text-gray-500">
                          ({patient.age}yr, {patient.gender})
                        </span>
                        {patient.hasActiveSession && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                            Active Session
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-600">
                        <span className="font-mono">{patient.mrn}</span>
                        {patient.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {patient.phone}
                          </span>
                        )}
                        {patient.lastVisit && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Last visit: {patient.lastVisit}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-blue-600 font-medium">
                      Start Session →
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
