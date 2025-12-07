'use client';

import { useEffect, useState } from 'react';
import Select from 'react-select';
import { X, Search, CheckCircle, Trash2 } from 'lucide-react';
import { userDepartmentAccessApi, DepartmentAccessDto } from '@/lib/api/user-department-access.api';
import { departmentsApi } from '@/lib/api';

interface UserDepartmentAccessModalProps {
  userId: string;
  userName: string;
  onClose: () => void;
}

interface Department {
  id: string;
  departmentName: string;
  departmentCode: string;
  departmentType: string;
  parentDepartmentName?: string;
}

const ACCESS_LEVELS = [
  { value: 'Full Access', label: 'Full Access', description: 'Can view, edit, and delete' },
  { value: 'ReadOnly', label: 'Read Only', description: 'Can only view data' },
  { value: 'ApprovalOnly', label: 'Approval Only', description: 'Can approve/reject only' },
];

export default function UserDepartmentAccessModal({
  userId,
  userName,
  onClose,
}: UserDepartmentAccessModalProps) {
  const [allDepartments, setAllDepartments] = useState<Department[]>([]);
  const [userDepartments, setUserDepartments] = useState<DepartmentAccessDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartments, setSelectedDepartments] = useState<Department[]>([]);
  const [selectedAccessLevel, setSelectedAccessLevel] = useState('Full Access');
  const [isPrimary, setIsPrimary] = useState(false);

  useEffect(() => {
    fetchData();
  }, [userId]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [departments, userDepartments] = await Promise.all([
        departmentsApi.getAll(),
        userDepartmentAccessApi.getUserDepartments(userId),
      ]);

      console.log('🔍 Raw departments response:', departments);
      console.log('🔍 Departments length:', departments?.length);
      console.log('🔍 First department:', departments?.[0]);
      console.log('🔍 User departments:', userDepartments);
      console.log('🔍 User departments type:', typeof userDepartments, Array.isArray(userDepartments));

      // Ensure we always work with arrays
      const depts = Array.isArray(departments) ? departments : [];
      const userDepts = Array.isArray(userDepartments) ? userDepartments : [];

      setAllDepartments(depts);
      setUserDepartments(userDepts);
      console.log('✅ State updated - departments:', depts.length, 'user depts:', userDepts.length);
    } catch (err: any) {
      console.error('❌ Failed to load department data:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedDepartments.length) {
      setError('Please select at least one department');
      return;
    }

    // Filter out already assigned departments
    const assignedIds = userDepartments.map((d) => d.departmentId);
    const toAssign = selectedDepartments.filter((d) => !assignedIds.includes(d.id));
    if (!toAssign.length) {
      setError('All selected departments are already assigned');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');
    try {
      // Use bulkAssign API for multiple departments
      const assignments = toAssign.map((dept) => ({
        userId,
        departmentId: dept.id,
        accessType: selectedAccessLevel,
        isPrimary,
      }));
      await userDepartmentAccessApi.bulkAssign(assignments);
      setSuccess('Department access assigned successfully');
      setSelectedDepartments([]);
      setSelectedAccessLevel('Full Access');
      setIsPrimary(false);
      await fetchData(); // Refresh the list
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to assign department access');
    } finally {
      setSaving(false);
    }
  };

  const handleRevoke = async (departmentId: string) => {
    if (!confirm('Are you sure you want to revoke access to this department?')) {
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await userDepartmentAccessApi.revoke(userId, departmentId);
      setSuccess('Department access revoked successfully');
      await fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to revoke access');
    } finally {
      setSaving(false);
    }
  };

  const handleSetPrimary = async (departmentId: string) => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await userDepartmentAccessApi.setPrimary(userId, departmentId);
      setSuccess('Primary department updated successfully');
      await fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to set primary department');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateAccessLevel = async (departmentId: string, newAccessLevel: string) => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await userDepartmentAccessApi.updateAccessLevel(userId, departmentId, newAccessLevel);
      setSuccess('Access level updated successfully');
      await fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update access level');
    } finally {
      setSaving(false);
    }
  };

  // Filter available departments (exclude already assigned)
  const assignedDepartmentIds = userDepartments.map((d) => d.departmentId);
  const availableDepartments = allDepartments.filter(
    (d) => !assignedDepartmentIds.includes(d.id)
  );

  // Filter departments by search term
  const filteredDepartments = availableDepartments.filter((d) =>
    d.departmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.departmentCode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // For react-select options
  const departmentOptions = filteredDepartments.map((dept) => ({
    value: dept.id,
    label: `${dept.departmentCode} - ${dept.departmentName}${dept.parentDepartmentName ? ` (${dept.parentDepartmentName})` : ''}`,
    dept,
  }));
  
  console.log('🔍 Render - allDepartments:', allDepartments.length);
  console.log('🔍 Render - availableDepartments:', availableDepartments.length);
  console.log('🔍 Render - filteredDepartments:', filteredDepartments.length);
  console.log('🔍 Render - searchTerm:', searchTerm);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Manage Department Access
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              User: <span className="font-medium">{userName}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {/* Error/Success Messages */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              {success}
            </div>
          )}

          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : (
            <>
              {/* Assign New Department Section */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Assign New Department
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Department Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Department *
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search departments..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div className="mt-2">
                      <Select
                        isMulti
                        options={departmentOptions}
                        value={departmentOptions.filter(opt => selectedDepartments.some(sel => sel.id === opt.value))}
                        onChange={(selected) => {
                          setSelectedDepartments(Array.isArray(selected) ? selected.map(opt => opt.dept) : []);
                        }}
                        placeholder="Select departments..."
                        classNamePrefix="react-select"
                        styles={{
                          menu: (base) => ({ ...base, zIndex: 9999 }),
                        }}
                        isDisabled={saving}
                        noOptionsMessage={() => searchTerm ? 'No departments found' : 'No departments available'}
                      />
                    </div>
                  </div>

                  {/* Access Level Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Access Level *
                    </label>
                    <div className="space-y-2">
                      {ACCESS_LEVELS.map((level) => (
                        <label
                          key={level.value}
                          className="flex items-start p-3 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50"
                        >
                          <input
                            type="radio"
                            name="accessLevel"
                            value={level.value}
                            checked={selectedAccessLevel === level.value}
                            onChange={(e) => setSelectedAccessLevel(e.target.value)}
                            className="mt-1 mr-3"
                          />
                          <div>
                            <div className="font-medium text-gray-900">{level.label}</div>
                            <div className="text-xs text-gray-500">{level.description}</div>
                          </div>
                        </label>
                      ))}
                    </div>

                    {/* Primary Department Checkbox */}
                    <label className="flex items-center mt-3 p-3 bg-indigo-50 border border-indigo-200 rounded-md cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isPrimary}
                        onChange={(e) => setIsPrimary(e.target.checked)}
                        className="mr-3"
                      />
                      <div>
                        <div className="font-medium text-indigo-900">Set as Primary Department</div>
                        <div className="text-xs text-indigo-700">
                          User's default department for login
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <button
                    onClick={handleAssign}
                    disabled={saving || !selectedDepartments.length}
                    className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Assigning...' : 'Assign Department'}
                  </button>
                </div>
              </div>

              {/* Current Departments Section */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Current Departments ({userDepartments.length})
                </h3>

                {userDepartments.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 border border-gray-200 rounded-lg">
                    No department assignments yet
                  </div>
                ) : (
                  <div className="space-y-3">
                    {userDepartments.map((dept) => (
                      <div
                        key={dept.departmentId}
                        className={`p-4 border rounded-lg ${
                          dept.isPrimary
                            ? 'border-indigo-300 bg-indigo-50'
                            : 'border-gray-200 bg-white'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-gray-900">
                                {dept.departmentName}
                              </h4>
                              {dept.isPrimary && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                                  Primary
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              Code: {dept.departmentCode}
                            </p>
                            
                            {/* Access Level Selector */}
                            <div className="mt-3">
                              <label className="text-sm font-medium text-gray-700">
                                Access Level:
                              </label>
                              <select
                                value={dept.accessType}
                                onChange={(e) =>
                                  handleUpdateAccessLevel(dept.departmentId, e.target.value)
                                }
                                disabled={saving}
                                className="ml-2 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-indigo-500 focus:border-indigo-500"
                              >
                                {ACCESS_LEVELS.map((level) => (
                                  <option key={level.value} value={level.value}>
                                    {level.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div className="flex gap-2 ml-4">
                            {!dept.isPrimary && (
                              <button
                                onClick={() => handleSetPrimary(dept.departmentId)}
                                disabled={saving}
                                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium disabled:opacity-50"
                              >
                                Set Primary
                              </button>
                            )}
                            <button
                              onClick={() => handleRevoke(dept.departmentId)}
                              disabled={saving}
                              className="text-red-600 hover:text-red-800 disabled:opacity-50"
                              title="Revoke Access"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
