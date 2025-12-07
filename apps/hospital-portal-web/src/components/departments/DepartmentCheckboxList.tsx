// =====================================================
// Department Selection Component - 77 Departments
// =====================================================
// React component for multi-select department checkboxes
// Matches the UI design from the image
// =====================================================

import React, { useState, useEffect } from 'react';
import { getApi } from '@/lib/api';

interface Department {
  id: string;
  departmentCode: string;
  departmentName: string;
  departmentType: string;
  category: string;
  status: string;
}

interface DepartmentCheckboxProps {
  selectedDepartments: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  columns?: number;
}

export const DepartmentCheckboxList: React.FC<DepartmentCheckboxProps> = ({
  selectedDepartments = [],
  onSelectionChange,
  columns = 4
}) => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch departments from API
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const api = getApi();
        const response = await api.get('/departments');
        setDepartments(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load departments');
        setLoading(false);
        console.error('Error fetching departments:', err);
      }
    };

    fetchDepartments();
  }, []);

  // Handle checkbox change
  const handleCheckboxChange = (departmentId: string) => {
    const newSelection = selectedDepartments.includes(departmentId)
      ? selectedDepartments.filter(id => id !== departmentId)
      : [...selectedDepartments, departmentId];
    
    onSelectionChange(newSelection);
  };

  // Handle select all / deselect all
  const handleSelectAll = () => {
    if (selectedDepartments.length === departments.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(departments.map(d => d.id));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading departments...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  // Group departments by category
  const departmentsByCategory = departments.reduce((acc, dept) => {
    const category = dept.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(dept);
    return acc;
  }, {} as Record<string, Department[]>);

  // Flatten for grid display (as shown in UI image)
  const displayDepartments = [
    { id: 'outpatient', name: 'Outpatient Department', code: 'GENERAL_OPD' },
    { id: 'inpatient', name: 'Inpatient Department', code: 'GENERAL_WARD' },
    { id: 'admin', name: 'Administration Department', code: 'ADMINISTRATION' },
    { id: 'emergency', name: 'Emergency Department', code: 'EMERGENCY' },
    { id: 'optical', name: 'Optical Department', code: 'OPHTHALMOLOGY_OPD' },
    { id: 'ophthal', name: 'Ophthal Department', code: 'OPHTHALMOLOGY_OPD' },
    { id: 'patient', name: 'Patient Department', code: 'PATIENT_SERVICES' },
    { id: 'radiology', name: 'Radiology Department', code: 'RADIOLOGY' },
    { id: 'maintenance', name: 'Maintenance Department', code: 'MAINTENANCE' },
    { id: 'marketing', name: 'Marketing Department', code: 'MARKETING' },
    { id: 'scm', name: 'SCM Audit Department', code: 'SCM_AUDIT' },
    { id: 'central', name: 'Central Hub Department', code: 'CENTRAL_HUB' },
    { id: 'ot', name: 'OT Department', code: 'OT' },
    { id: 'stationery', name: 'Stationery Department', code: 'STATIONERY' },
    { id: 'clinical_audit', name: 'Clinical Audit Department', code: 'CLINICAL_AUDIT' },
    { id: 'pharmacy', name: 'Pharmacy Department', code: 'INPATIENT_PHARMACY' },
    { id: 'lab', name: 'Laboratory department', code: 'LABORATORY' },
    { id: 'ot_store', name: 'OT Store Department', code: 'OT_STORE' },
    { id: 'housekeeping', name: 'House Keeping Department', code: 'HOUSEKEEPING' },
    { id: 'finance_audit', name: 'Finance Audit Department', code: 'FINANCE_AUDIT' },
  ];

  return (
    <div className="space-y-4">
      {/* Header with Select All */}
      <div className="flex items-center justify-between border-b pb-3">
        <h3 className="text-lg font-semibold text-gray-900">
          Departments List
        </h3>
        <button
          onClick={handleSelectAll}
          className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
        >
          {selectedDepartments.length === departments.length ? 'Deselect All' : 'Select All'}
        </button>
      </div>

      {/* Department Checkboxes Grid */}
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${columns} gap-3`}>
        {displayDepartments.map((dept) => {
          // Find actual department from API data
          const actualDept = departments.find(d => d.departmentCode === dept.code);
          const deptId = actualDept?.id || dept.id;
          const isChecked = selectedDepartments.includes(deptId);

          return (
            <label
              key={dept.id}
              className={`
                flex items-center space-x-3 p-3 rounded-lg border cursor-pointer
                transition-all duration-200
                ${isChecked 
                  ? 'bg-blue-50 border-blue-300 shadow-sm' 
                  : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
                }
              `}
            >
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => handleCheckboxChange(deptId)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              <span className={`text-sm ${isChecked ? 'font-medium text-gray-900' : 'text-gray-700'}`}>
                {dept.name}
              </span>
            </label>
          );
        })}
      </div>

      {/* Selection Summary */}
      <div className="mt-4 pt-4 border-t">
        <p className="text-sm text-gray-600">
          <span className="font-semibold text-gray-900">{selectedDepartments.length}</span>
          {' '}of{' '}
          <span className="font-semibold text-gray-900">{departments.length}</span>
          {' '}departments selected
        </p>
      </div>
    </div>
  );
};

// =====================================================
// Alternative: Categorized Department List
// =====================================================

export const CategorizedDepartmentList: React.FC<DepartmentCheckboxProps> = ({
  selectedDepartments = [],
  onSelectionChange,
}) => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const api = getApi();
        const response = await api.get('/departments');
        setDepartments(response.data);
        setLoading(false);
        
        // Auto-expand all categories
        const categories = [...new Set(response.data.map((d: Department) => d.category || 'Other'))];
        setExpandedCategories(categories);
      } catch (err) {
        console.error('Error fetching departments:', err);
        setLoading(false);
      }
    };

    fetchDepartments();
  }, []);

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleCheckboxChange = (departmentId: string) => {
    const newSelection = selectedDepartments.includes(departmentId)
      ? selectedDepartments.filter(id => id !== departmentId)
      : [...selectedDepartments, departmentId];
    
    onSelectionChange(newSelection);
  };

  const handleCategorySelectAll = (category: string, depts: Department[]) => {
    const categoryDeptIds = depts.map(d => d.id);
    const allSelected = categoryDeptIds.every(id => selectedDepartments.includes(id));
    
    if (allSelected) {
      onSelectionChange(selectedDepartments.filter(id => !categoryDeptIds.includes(id)));
    } else {
      const newSelection = [...new Set([...selectedDepartments, ...categoryDeptIds])];
      onSelectionChange(newSelection);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading departments...</div>;
  }

  // Group by category
  const categoryGroups = departments.reduce((acc, dept) => {
    const category = dept.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(dept);
    return acc;
  }, {} as Record<string, Department[]>);

  const categoryOrder = [
    'OPD',
    'Clinical',
    'Diagnostics',
    'Pharmacy',
    'Administrative',
    'Ancillary/Support',
    'Audit',
    'Other'
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 border-b pb-3">
        Departments by Category ({departments.length} total)
      </h3>

      {categoryOrder.map(category => {
        const depts = categoryGroups[category] || [];
        if (depts.length === 0) return null;

        const isExpanded = expandedCategories.includes(category);
        const selectedCount = depts.filter(d => selectedDepartments.includes(d.id)).length;

        return (
          <div key={category} className="border rounded-lg overflow-hidden">
            {/* Category Header */}
            <div
              className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => toggleCategory(category)}
            >
              <div className="flex items-center space-x-3">
                <svg
                  className={`w-5 h-5 text-gray-500 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span className="font-semibold text-gray-900">{category}</span>
                <span className="text-sm text-gray-500">
                  ({selectedCount}/{depts.length} selected)
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCategorySelectAll(category, depts);
                }}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                {selectedCount === depts.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            {/* Category Departments */}
            {isExpanded && (
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 bg-white">
                {depts.map(dept => (
                  <label
                    key={dept.id}
                    className={`
                      flex items-center space-x-2 p-2 rounded cursor-pointer
                      ${selectedDepartments.includes(dept.id)
                        ? 'bg-blue-50 text-blue-900'
                        : 'hover:bg-gray-50'
                      }
                    `}
                  >
                    <input
                      type="checkbox"
                      checked={selectedDepartments.includes(dept.id)}
                      onChange={() => handleCheckboxChange(dept.id)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm">{dept.departmentName}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default DepartmentCheckboxList;
