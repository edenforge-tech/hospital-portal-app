'use client';

import { useState, useEffect } from 'react';
import { getApi } from '@/lib/api';

interface Role {
  id: string;
  name: string;
  description?: string;
  parentRoleId?: string | null;
  hierarchyLevel?: number;
}

interface ParentRoleSelectorProps {
  value: string | null;
  onChange: (parentRoleId: string | null) => void;
  currentRoleId?: string | null; // To exclude current role and its descendants
  disabled?: boolean;
  error?: string;
}

export default function ParentRoleSelector({
  value,
  onChange,
  currentRoleId,
  disabled,
  error
}: ParentRoleSelectorProps) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      setLoading(true);
      const response = await getApi().get('/roles');
      setRoles(response.data || []);
    } catch (err) {
      console.error('Error loading roles:', err);
    } finally {
      setLoading(false);
    }
  };

  const validateHierarchy = async (newParentId: string | null) => {
    if (!currentRoleId || !newParentId) {
      return true;
    }

    try {
      const response = await getApi().get(`/roles/${currentRoleId}/validate-hierarchy`, {
        params: { newParentId }
      });
      return response.data.isValid;
    } catch (err: any) {
      setValidationError(err.response?.data?.message || 'Failed to validate hierarchy');
      return false;
    }
  };

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value === '' ? null : e.target.value;
    setValidationError('');

    if (newValue && currentRoleId) {
      const isValid = await validateHierarchy(newValue);
      if (!isValid) {
        setValidationError('This selection would create a circular reference');
        return;
      }
    }

    onChange(newValue);
  };

  const getAvailableRoles = () => {
    return roles.filter(role => {
      // Exclude current role
      if (currentRoleId && role.id === currentRoleId) {
        return false;
      }
      return true;
    });
  };

  const availableRoles = getAvailableRoles();

  // Group roles by hierarchy level
  const rolesByLevel = availableRoles.reduce((acc, role) => {
    const level = role.hierarchyLevel || 0;
    if (!acc[level]) acc[level] = [];
    acc[level].push(role);
    return acc;
  }, {} as Record<number, Role[]>);

  const levels = Object.keys(rolesByLevel).map(Number).sort((a, b) => a - b);

  if (loading) {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Parent Role <span className="text-gray-400 font-normal">(Optional)</span>
        </label>
        <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50">
          <span className="text-gray-500">Loading roles...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Parent Role <span className="text-gray-400 font-normal">(Optional)</span>
      </label>
      <select
        value={value || ''}
        onChange={handleChange}
        disabled={disabled}
        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
          error || validationError ? 'border-red-500' : 'border-gray-300'
        } ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
      >
        <option value="">None (Root Level Role)</option>
        {levels.map(level => (
          <optgroup key={level} label={`Level ${level} ${level === 0 ? '(Root)' : ''}`}>
            {rolesByLevel[level].map(role => (
              <option key={role.id} value={role.id}>
                {'  '.repeat(level)}
                {role.name}
                {role.description ? ` - ${role.description.substring(0, 50)}${role.description.length > 50 ? '...' : ''}` : ''}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
      
      {(error || validationError) && (
        <p className="mt-1 text-sm text-red-600">{error || validationError}</p>
      )}
      
      <p className="mt-1 text-xs text-gray-500">
        {value 
          ? `This role will inherit permissions from its parent` 
          : `Leave empty to create a root-level role`
        }
      </p>
      
      {availableRoles.length === 0 && !currentRoleId && (
        <p className="mt-1 text-xs text-amber-600">
          No other roles available. This will be a root-level role.
        </p>
      )}
    </div>
  );
}
