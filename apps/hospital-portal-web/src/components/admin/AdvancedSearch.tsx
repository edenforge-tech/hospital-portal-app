// Todo #7: Advanced Search & Saved Filters
'use client';

import { useState, useEffect } from 'react';
import { Search, Save, Star, X, Filter, Plus } from 'lucide-react';

interface SearchFilter {
  field: string;
  operator: 'equals' | 'contains' | 'starts_with' | 'greater_than' | 'less_than' | 'between';
  value: string | string[];
  logic?: 'AND' | 'OR';
}

interface SavedFilter {
  id: string;
  name: string;
  description?: string;
  filters: SearchFilter[];
  module: string;
  isDefault: boolean;
  createdAt: string;
}

export default function AdvancedSearch({ module = 'users', onSearch }: { module?: string; onSearch?: (filters: SearchFilter[]) => void }) {
  const [filters, setFilters] = useState<SearchFilter[]>([]);
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [filterName, setFilterName] = useState('');
  const [filterDescription, setFilterDescription] = useState('');

  useEffect(() => {
    loadSavedFilters();
  }, [module]);

  const loadSavedFilters = async () => {
    // In production: const response = await savedFiltersApi.getByModule(module);
    const mockFilters: SavedFilter[] = [
      {
        id: '1',
        name: 'My Team',
        description: 'Users in my department',
        filters: [
          { field: 'department', operator: 'equals', value: 'Ophthalmology', logic: 'AND' },
          { field: 'status', operator: 'equals', value: 'active' },
        ],
        module: 'users',
        isDefault: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        name: 'Expiring Licenses',
        description: 'Staff with licenses expiring in 90 days',
        filters: [
          { field: 'licenseExpiryDate', operator: 'less_than', value: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], logic: 'AND' },
          { field: 'userType', operator: 'equals', value: 'Staff' },
        ],
        module: 'users',
        isDefault: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: '3',
        name: 'On Probation',
        description: 'Employees currently on probation',
        filters: [
          { field: 'probationEndDate', operator: 'greater_than', value: new Date().toISOString().split('T')[0], logic: 'AND' },
          { field: 'employmentStatus', operator: 'equals', value: 'probation' },
        ],
        module: 'users',
        isDefault: false,
        createdAt: new Date().toISOString(),
      },
    ];
    setSavedFilters(mockFilters);
  };

  const addFilter = () => {
    setFilters([
      ...filters,
      { field: 'firstName', operator: 'contains', value: '', logic: 'AND' },
    ]);
  };

  const updateFilter = (index: number, updates: Partial<SearchFilter>) => {
    const newFilters = [...filters];
    newFilters[index] = { ...newFilters[index], ...updates };
    setFilters(newFilters);
  };

  const removeFilter = (index: number) => {
    setFilters(filters.filter((_, i) => i !== index));
  };

  const applyFilters = () => {
    if (onSearch) {
      onSearch(filters);
    }
  };

  const loadSavedFilter = (savedFilter: SavedFilter) => {
    setFilters(savedFilter.filters);
    applyFilters();
  };

  const saveCurrentFilter = async () => {
    if (!filterName.trim()) {
      alert('Please enter a filter name');
      return;
    }

    const newFilter: SavedFilter = {
      id: Date.now().toString(),
      name: filterName,
      description: filterDescription,
      filters: filters,
      module: module,
      isDefault: false,
      createdAt: new Date().toISOString(),
    };

    // In production: await savedFiltersApi.create(newFilter);
    setSavedFilters([...savedFilters, newFilter]);
    setShowSaveDialog(false);
    setFilterName('');
    setFilterDescription('');
  };

  const deleteSavedFilter = async (id: string) => {
    if (!confirm('Are you sure you want to delete this saved filter?')) return;
    // In production: await savedFiltersApi.delete(id);
    setSavedFilters(savedFilters.filter(f => f.id !== id));
  };

  const fieldOptions = [
    { value: 'firstName', label: 'First Name' },
    { value: 'lastName', label: 'Last Name' },
    { value: 'email', label: 'Email' },
    { value: 'phoneNumber', label: 'Phone Number' },
    { value: 'userType', label: 'User Type' },
    { value: 'userStatus', label: 'Status' },
    { value: 'department', label: 'Department' },
    { value: 'branch', label: 'Branch' },
    { value: 'role', label: 'Role' },
    { value: 'licenseNumber', label: 'License Number' },
    { value: 'licenseExpiryDate', label: 'License Expiry Date' },
    { value: 'hireDate', label: 'Hire Date' },
    { value: 'employmentStatus', label: 'Employment Status' },
    { value: 'probationEndDate', label: 'Probation End Date' },
    { value: 'createdAt', label: 'Created Date' },
  ];

  const operatorOptions = [
    { value: 'equals', label: 'Equals' },
    { value: 'contains', label: 'Contains' },
    { value: 'starts_with', label: 'Starts With' },
    { value: 'greater_than', label: 'Greater Than' },
    { value: 'less_than', label: 'Less Than' },
    { value: 'between', label: 'Between' },
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Filter className="w-8 h-8 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Advanced Search</h2>
            <p className="text-sm text-gray-600">Build complex search queries with AND/OR logic</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={addFilter}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Filter
          </button>
          <button
            onClick={() => setShowSaveDialog(true)}
            disabled={filters.length === 0}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white rounded-lg font-medium flex items-center gap-2 transition-all"
          >
            <Save className="w-4 h-4" />
            Save Filter
          </button>
        </div>
      </div>

      {/* Saved Filters */}
      {savedFilters.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Quick Filters</h3>
          <div className="flex flex-wrap gap-2">
            {savedFilters.map((savedFilter) => (
              <div key={savedFilter.id} className="group relative">
                <button
                  onClick={() => loadSavedFilter(savedFilter)}
                  className="px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-800 rounded-lg font-medium flex items-center gap-2 transition-all"
                >
                  {savedFilter.isDefault && <Star className="w-4 h-4 fill-current" />}
                  {savedFilter.name}
                </button>
                {!savedFilter.isDefault && (
                  <button
                    onClick={() => deleteSavedFilter(savedFilter.id)}
                    className="absolute -top-2 -right-2 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter Builder */}
      <div className="space-y-3 mb-6">
        {filters.map((filter, index) => (
          <div key={index} className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4">
            <div className="grid grid-cols-12 gap-3 items-end">
              {index > 0 && (
                <div className="col-span-1">
                  <select
                    value={filter.logic}
                    onChange={(e) => updateFilter(index, { logic: e.target.value as 'AND' | 'OR' })}
                    className="w-full px-2 py-2 border border-gray-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="AND">AND</option>
                    <option value="OR">OR</option>
                  </select>
                </div>
              )}

              <div className={index > 0 ? 'col-span-3' : 'col-span-4'}>
                <label className="block text-xs font-medium text-gray-700 mb-1">Field</label>
                <select
                  value={filter.field}
                  onChange={(e) => updateFilter(index, { field: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {fieldOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-span-3">
                <label className="block text-xs font-medium text-gray-700 mb-1">Operator</label>
                <select
                  value={filter.operator}
                  onChange={(e) => updateFilter(index, { operator: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {operatorOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-span-4">
                <label className="block text-xs font-medium text-gray-700 mb-1">Value</label>
                <input
                  type="text"
                  value={Array.isArray(filter.value) ? filter.value.join(', ') : filter.value}
                  onChange={(e) => updateFilter(index, { value: e.target.value })}
                  placeholder="Enter search value"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="col-span-1">
                <button
                  onClick={() => removeFilter(index)}
                  className="w-full p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-all"
                >
                  <X className="w-5 h-5 mx-auto" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filters.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <Search className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No filters added yet</p>
            <p className="text-sm text-gray-500 mt-1">Click "Add Filter" to start building your search query</p>
          </div>
        )}
      </div>

      {filters.length > 0 && (
        <div className="flex gap-3">
          <button
            onClick={applyFilters}
            className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-all"
          >
            <Search className="w-5 h-5" />
            Apply Filters
          </button>
          <button
            onClick={() => setFilters([])}
            className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-all"
          >
            Clear All
          </button>
        </div>
      )}

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Save Filter</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Filter Name *</label>
                <input
                  type="text"
                  value={filterName}
                  onChange={(e) => setFilterName(e.target.value)}
                  placeholder="e.g., Active Doctors"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description (optional)</label>
                <textarea
                  value={filterDescription}
                  onChange={(e) => setFilterDescription(e.target.value)}
                  placeholder="Describe what this filter does..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={saveCurrentFilter}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all"
                >
                  Save
                </button>
                <button
                  onClick={() => setShowSaveDialog(false)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
