'use client';

import { useEffect, useState } from 'react';
import { getApi } from '@/lib/api';

interface Department {
  id: string;
  departmentName: string;
  departmentCode?: string;
  departmentType?: string;
  parentDepartmentId?: string | null;
  level?: number;
}

interface Props {
  value: string | null;
  onChange: (departmentId: string | null) => void;
  currentDepartmentId?: string | null;
  disabled?: boolean;
  error?: string;
}

export default function ParentDepartmentSelector({
  value,
  onChange,
  currentDepartmentId,
  disabled,
  error
}: Props) {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      setLoading(true);
      const response = await getApi().get<Department[]>('/departments');
      setDepartments(response.data || []);
    } catch (err: any) {
      console.error('Error loading departments:', err);
    } finally {
      setLoading(false);
    }
  };

  const getAvailableDepartments = () => {
    // Exclude current department to prevent self-parent
    return departments.filter(dept => dept.id !== currentDepartmentId);
  };

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newParentId = e.target.value || null;
    setValidationError('');

    // Validate if creating circular reference (basic client-side check)
    if (newParentId && currentDepartmentId) {
      try {
        // In a real scenario, we'd call a validation endpoint
        // For now, just check if trying to set parent to a descendant
        const selectedDept = departments.find(d => d.id === newParentId);
        if (selectedDept?.parentDepartmentId === currentDepartmentId) {
          setValidationError('Cannot create circular reference: Selected department is a child of this department');
          return;
        }
      } catch (err) {
        // Continue with change if validation fails
      }
    }

    onChange(newParentId);
  };

  const groupByLevel = () => {
    const grouped: Record<number, Department[]> = {};
    const available = getAvailableDepartments();

    available.forEach(dept => {
      const level = dept.level || 0;
      if (!grouped[level]) {
        grouped[level] = [];
      }
      grouped[level].push(dept);
    });

    return grouped;
  };

  const grouped = groupByLevel();
  const levels = Object.keys(grouped).sort((a, b) => Number(a) - Number(b));

  if (loading) {
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Parent Department <span className="text-gray-500 text-xs">(optional)</span>
        </label>
        <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
          <span className="text-gray-500">Loading departments...</span>
        </div>
      </div>
    );
  }

  const availableDepartments = getAvailableDepartments();

  return (
    <div className="mb-4">
      <label htmlFor="parentDepartmentId" className="block text-sm font-medium text-gray-700 mb-1">
        Parent Department <span className="text-gray-500 text-xs">(optional)</span>
      </label>
      
      <select
        id="parentDepartmentId"
        value={value || ''}
        onChange={handleChange}
        disabled={disabled || loading}
        className={`w-full px-3 py-2 border ${
          error || validationError ? 'border-red-500' : 'border-gray-300'
        } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed`}
      >
        <option value="">None (Root Level Department)</option>
        
        {levels.map(levelKey => {
          const level = Number(levelKey);
          const depts = grouped[level];
          
          return (
            <optgroup key={level} label={`Level ${level} Departments`}>
              {depts.map(dept => (
                <option key={dept.id} value={dept.id}>
                  {dept.departmentName}
                  {dept.departmentCode ? ` (${dept.departmentCode})` : ''}
                  {dept.departmentType ? ` - ${dept.departmentType}` : ''}
                </option>
              ))}
            </optgroup>
          );
        })}
      </select>

      {(error || validationError) && (
        <p className="mt-1 text-sm text-red-500">{error || validationError}</p>
      )}

      {!error && !validationError && (
        <p className="mt-1 text-xs text-gray-500">
          {value
            ? 'This department will inherit properties from its parent'
            : 'Root-level departments have no parent'}
        </p>
      )}

      {availableDepartments.length === 0 && (
        <p className="mt-1 text-xs text-yellow-600">
          ⚠️ No other departments available for selection
        </p>
      )}
    </div>
  );
}
