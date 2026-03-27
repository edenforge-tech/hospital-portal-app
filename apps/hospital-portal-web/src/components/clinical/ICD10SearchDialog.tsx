// ICD10SearchDialog - Diagnosis Code Search & Selection
// Phase 3: Prescription & Clinical Examination

'use client';

import { Fragment, useState, useEffect, useCallback } from 'react';
import { Dialog, Transition, RadioGroup } from '@headlessui/react';
import { 
  X, 
  Search, 
  Eye, 
  TrendingUp, 
  Info,
  CheckCircle2,
  AlertCircle 
} from 'lucide-react';
import { 
  searchDiagnosisCodes, 
  getDiagnosisSuggestions 
} from '@/lib/api/diagnoses.api';
import type { 
  DiagnosisCode, 
  DiagnosisSearchResult, 
  DiagnosisSuggestion 
} from '@/types/diagnosis';

interface ICD10SearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (code: DiagnosisCode, laterality: 'OD' | 'OS' | 'OU', isPrimary: boolean) => void;
  patientId?: string;
  patientAge?: number;
  patientGender?: string;
  existingDiagnoses?: DiagnosisCode[];
}

type Laterality = 'OD' | 'OS' | 'OU';

export default function ICD10SearchDialog({
  isOpen,
  onClose,
  onSelect,
  patientId,
  patientAge,
  patientGender,
  existingDiagnoses = [],
}: ICD10SearchDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [laterality, setLaterality] = useState<Laterality>('OU');
  const [isPrimary, setIsPrimary] = useState(false);
  const [searchResults, setSearchResults] = useState<DiagnosisSearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<DiagnosisSuggestion[]>([]);
  const [selectedCode, setSelectedCode] = useState<DiagnosisCode | null>(null);
  const [loading, setLoading] = useState(false);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'search' | 'suggestions'>('search');

  // Load smart suggestions when dialog opens
  useEffect(() => {
    if (isOpen && patientId && suggestions.length === 0) {
      loadSuggestions();
    }
  }, [isOpen, patientId]);

  // Debounced search
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    const timeoutId = setTimeout(() => {
      performSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const loadSuggestions = async () => {
    if (!patientId) return;

    try {
      setSuggestionsLoading(true);
      const results = await getDiagnosisSuggestions(patientId, patientAge, patientGender);
      setSuggestions(results);
      if (results.length > 0) {
        setActiveTab('suggestions');
      }
    } catch (error) {
      console.error('Error loading diagnosis suggestions:', error);
    } finally {
      setSuggestionsLoading(false);
    }
  };

  const performSearch = async (query: string) => {
    try {
      setLoading(true);
      const results = await searchDiagnosisCodes(query, true, 20);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching diagnosis codes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCode = (code: DiagnosisCode) => {
    setSelectedCode(code);
    // Auto-set laterality from code if available
    if (code.laterality) {
      setLaterality(code.laterality);
    }
  };

  const handleConfirmSelection = () => {
    if (selectedCode) {
      onSelect(selectedCode, laterality, isPrimary);
      handleClose();
    }
  };

  const handleClose = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSelectedCode(null);
    setLaterality('OU');
    setIsPrimary(false);
    setActiveTab('search');
    onClose();
  };

  const isCodeAlreadyAdded = (code: DiagnosisCode) => {
    return existingDiagnoses.some(d => d.id === code.id);
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 flex items-center gap-2"
                  >
                    <Eye className="h-5 w-5 text-blue-600" />
                    ICD-10 Diagnosis Search
                  </Dialog.Title>
                  <button
                    onClick={handleClose}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 mb-4">
                  <button
                    onClick={() => setActiveTab('search')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === 'search'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Search className="inline h-4 w-4 mr-2" />
                    Search
                  </button>
                  <button
                    onClick={() => setActiveTab('suggestions')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === 'suggestions'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <TrendingUp className="inline h-4 w-4 mr-2" />
                    Smart Suggestions {suggestions.length > 0 && `(${suggestions.length})`}
                  </button>
                </div>

                {/* Search Tab */}
                {activeTab === 'search' && (
                  <div>
                    {/* Search Input */}
                    <div className="mb-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search by ICD-10 code or description (e.g., H40.11 or 'glaucoma')..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          autoFocus
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Type at least 2 characters to search
                      </p>
                    </div>

                    {/* Search Results */}
                    <div className="max-h-96 overflow-y-auto mb-4">
                      {loading && (
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                          <p className="text-sm text-gray-500 mt-2">Searching...</p>
                        </div>
                      )}

                      {!loading && searchQuery.length >= 2 && searchResults.length === 0 && (
                        <div className="text-center py-8">
                          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-500">No diagnosis codes found</p>
                          <p className="text-sm text-gray-400">Try a different search term</p>
                        </div>
                      )}

                      {searchResults.map((result) => (
                        <button
                          key={result.code.id}
                          onClick={() => handleSelectCode(result.code)}
                          disabled={isCodeAlreadyAdded(result.code)}
                          className={`w-full text-left p-4 mb-2 rounded-lg border-2 transition-all ${
                            selectedCode?.id === result.code.id
                              ? 'border-blue-600 bg-blue-50'
                              : isCodeAlreadyAdded(result.code)
                              ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-mono text-sm font-semibold text-blue-600">
                                  {result.code.code}
                                </span>
                                <span className={`text-xs px-2 py-0.5 rounded ${
                                  result.matchType === 'exact' 
                                    ? 'bg-green-100 text-green-800'
                                    : result.matchType === 'partial'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {result.matchType}
                                </span>
                                {isCodeAlreadyAdded(result.code) && (
                                  <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                                    Already Added
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-900 mb-1">
                                {result.code.description}
                              </p>
                              <div className="flex items-center gap-3 text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                  <Info className="h-3 w-3" />
                                  {result.code.category}
                                </span>
                                {result.code.laterality && (
                                  <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded">
                                    {result.code.laterality}
                                  </span>
                                )}
                              </div>
                            </div>
                            {selectedCode?.id === result.code.id && (
                              <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 ml-2" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggestions Tab */}
                {activeTab === 'suggestions' && (
                  <div className="max-h-96 overflow-y-auto mb-4">
                    {suggestionsLoading && (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="text-sm text-gray-500 mt-2">Loading suggestions...</p>
                      </div>
                    )}

                    {!suggestionsLoading && suggestions.length === 0 && (
                      <div className="text-center py-8">
                        <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500">No suggestions available</p>
                        <p className="text-sm text-gray-400">Use the search tab to find diagnoses</p>
                      </div>
                    )}

                    {suggestions.map((suggestion) => (
                      <button
                        key={suggestion.code.id}
                        onClick={() => handleSelectCode(suggestion.code)}
                        disabled={isCodeAlreadyAdded(suggestion.code)}
                        className={`w-full text-left p-4 mb-2 rounded-lg border-2 transition-all ${
                          selectedCode?.id === suggestion.code.id
                            ? 'border-blue-600 bg-blue-50'
                            : isCodeAlreadyAdded(suggestion.code)
                            ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-mono text-sm font-semibold text-blue-600">
                                {suggestion.code.code}
                              </span>
                              <span className="text-xs px-2 py-0.5 rounded bg-purple-100 text-purple-700">
                                {Math.round(suggestion.confidence * 100)}% match
                              </span>
                              {isCodeAlreadyAdded(suggestion.code) && (
                                <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                                  Already Added
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-900 mb-1">
                              {suggestion.code.description}
                            </p>
                            <p className="text-xs text-gray-600 italic mb-2">
                              💡 {suggestion.reason}
                            </p>
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Info className="h-3 w-3" />
                                {suggestion.code.category}
                              </span>
                            </div>
                          </div>
                          {selectedCode?.id === suggestion.code.id && (
                            <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 ml-2" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Selection Options */}
                {selectedCode && (
                  <div className="border-t pt-4 space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Selected Diagnosis</h4>
                      <p className="text-sm">
                        <span className="font-mono font-semibold text-blue-600">{selectedCode.code}</span>
                        {' - '}
                        <span className="text-gray-900">{selectedCode.description}</span>
                      </p>
                    </div>

                    {/* Laterality Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Eye Affected <span className="text-red-500">*</span>
                      </label>
                      <RadioGroup value={laterality} onChange={setLaterality}>
                        <div className="grid grid-cols-3 gap-3">
                          <RadioGroup.Option value="OD">
                            {({ checked }) => (
                              <div
                                className={`cursor-pointer rounded-lg px-4 py-3 text-center font-medium border-2 transition-all ${
                                  checked
                                    ? 'border-blue-600 bg-blue-50 text-blue-900'
                                    : 'border-gray-300 bg-white text-gray-900 hover:border-gray-400'
                                }`}
                              >
                                <div className="text-sm">OD</div>
                                <div className="text-xs text-gray-500">Right Eye</div>
                              </div>
                            )}
                          </RadioGroup.Option>
                          <RadioGroup.Option value="OS">
                            {({ checked }) => (
                              <div
                                className={`cursor-pointer rounded-lg px-4 py-3 text-center font-medium border-2 transition-all ${
                                  checked
                                    ? 'border-blue-600 bg-blue-50 text-blue-900'
                                    : 'border-gray-300 bg-white text-gray-900 hover:border-gray-400'
                                }`}
                              >
                                <div className="text-sm">OS</div>
                                <div className="text-xs text-gray-500">Left Eye</div>
                              </div>
                            )}
                          </RadioGroup.Option>
                          <RadioGroup.Option value="OU">
                            {({ checked }) => (
                              <div
                                className={`cursor-pointer rounded-lg px-4 py-3 text-center font-medium border-2 transition-all ${
                                  checked
                                    ? 'border-blue-600 bg-blue-50 text-blue-900'
                                    : 'border-gray-300 bg-white text-gray-900 hover:border-gray-400'
                                }`}
                              >
                                <div className="text-sm">OU</div>
                                <div className="text-xs text-gray-500">Both Eyes</div>
                              </div>
                            )}
                          </RadioGroup.Option>
                        </div>
                      </RadioGroup>
                    </div>

                    {/* Primary Diagnosis Checkbox */}
                    <div className="flex items-center">
                      <input
                        id="isPrimary"
                        type="checkbox"
                        checked={isPrimary}
                        onChange={(e) => setIsPrimary(e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="isPrimary" className="ml-2 block text-sm text-gray-900">
                        Mark as <span className="font-semibold">Primary Diagnosis</span>
                      </label>
                    </div>
                  </div>
                )}

                {/* Footer Actions */}
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={handleClose}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmSelection}
                    disabled={!selectedCode}
                    className={`px-4 py-2 rounded-lg text-sm font-medium text-white ${
                      selectedCode
                        ? 'bg-blue-600 hover:bg-blue-700'
                        : 'bg-gray-300 cursor-not-allowed'
                    }`}
                  >
                    Add Diagnosis
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
