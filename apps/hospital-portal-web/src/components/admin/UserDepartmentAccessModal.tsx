'use client';

import { useEffect, useState } from 'react';
import Select from 'react-select';
import { X, CheckCircle, Trash2, Building2, Shield, AlertTriangle, CheckCircle2, Stethoscope, Users, Clock, Info, Eye, FilePlus, Edit3, Download } from 'lucide-react';
import { userDepartmentAccessApi, DepartmentAccessDto } from '@/lib/api/user-department-access.api';
import { departmentsApi } from '@/lib/api';
import GranularPermissionSelector, { GranularPermissions } from './GranularPermissionSelector';

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
  const [selectedDepartments, setSelectedDepartments] = useState<Department[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<GranularPermissions>({
    canView: true,
    canCreate: false,
    canEdit: false,
    canDelete: false,
    canApprove: false,
    canExport: false,
  });
  
  // Edit permissions modal state
  const [editingDepartment, setEditingDepartment] = useState<DepartmentAccessDto | null>(null);
  const [editPermissions, setEditPermissions] = useState<GranularPermissions>({
    canView: false,
    canCreate: false,
    canEdit: false,
    canDelete: false,
    canApprove: false,
    canExport: false,
  });

  useEffect(() => {
    fetchData();
  }, [userId]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      console.log('🔍 Starting fetchData...');
      console.log('🔍 API Base URL:', process.env.NEXT_PUBLIC_API_URL);
      
      // Check auth store state
      const authState = (window as any).useAuthStore?.getState();
      console.log('🔍 Auth State:', {
        hasToken: !!authState?.token,
        tenantId: authState?.tenantId,
        user: authState?.user
      });
      
      console.log('🔍 Fetching departments...');
      const departmentsResponse = await departmentsApi.getAll();
      
      console.log('🔍 Raw departments response:', departmentsResponse);
      console.log('🔍 Response type:', typeof departmentsResponse, 'isArray:', Array.isArray(departmentsResponse));
      
      // Handle both direct array and Axios response object with .data property
      const departments = Array.isArray(departmentsResponse) 
        ? departmentsResponse 
        : (departmentsResponse as any)?.data || [];
      
      console.log('🔍 Extracted departments:', departments);
      console.log('🔍 Departments length:', departments?.length);
      
      if (departments && departments.length > 0) {
        console.log('🔍 First department sample:', JSON.stringify(departments[0], null, 2));
      } else {
        console.warn('⚠️ No departments after extraction!');
      }
      
      console.log('🔍 Fetching user department access...');
      const userDepartmentsResponse = await userDepartmentAccessApi.getUserDepartments(userId);
      
      console.log('🔍 User departments response:', userDepartmentsResponse);
      console.log('🔍 User departments response type:', typeof userDepartmentsResponse, 'isArray:', Array.isArray(userDepartmentsResponse));
      console.log('🔍 User departments response length:', Array.isArray(userDepartmentsResponse) ? userDepartmentsResponse.length : 'N/A');

      // Ensure we always work with arrays
      const depts = Array.isArray(departments) ? departments : [];
      // getUserDepartments already returns response.data (an array), so use it directly
      const userDepts = Array.isArray(userDepartmentsResponse) ? userDepartmentsResponse : [];

      console.log('✅ Setting state - departments:', depts.length, 'user depts:', userDepts.length);
      if (userDepts.length > 0) {
        console.log('✅ First user dept sample:', JSON.stringify(userDepts[0], null, 2));
      }
      setAllDepartments(depts);
      setUserDepartments(userDepts);
      
      if (depts.length === 0) {
        console.error('❌ Zero departments after processing, setting error message');
        setError('No departments available. Please contact your administrator.');
      }
    } catch (err: any) {
      console.error('❌ Exception in fetchData:', err);
      console.error('❌ Error message:', err.message);
      console.error('❌ Error response:', err.response);
      console.error('❌ Error response data:', err.response?.data);
      console.error('❌ Error response status:', err.response?.status);
      console.error('❌ Full error object:', JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
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
      // Assign with default "View" permission - use Edit Permissions to customize
      const assignments = toAssign.map((dept) => ({
        userId,
        departmentId: dept.id,
        isPrimary: false, // Never set as primary during initial assignment
        canView: true,  // Default permission
        canCreate: false,
        canEdit: false,
        canDelete: false,
        canApprove: false,
        canExport: false,
      }));
      await userDepartmentAccessApi.bulkAssign(assignments);
      setSuccess('Department access assigned successfully. Use "Edit Permissions" to customize access levels.');
      setSelectedDepartments([]);
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

  const handleUpdatePermissions = async (departmentId: string, permissions: GranularPermissions) => {
    console.log('🔄 Updating permissions:', { userId, departmentId, permissions });
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const response = await userDepartmentAccessApi.updatePermissions(userId, departmentId, permissions);
      console.log('✅ Permissions updated successfully:', response);
      setSuccess('Permissions updated successfully');
      setEditingDepartment(null); // Close edit modal
      await fetchData();
    } catch (err: any) {
      console.error('❌ Failed to update permissions:', err);
      console.error('Error response:', err.response?.data);
      setError(err.response?.data?.message || err.message || 'Failed to update permissions');
    } finally {
      setSaving(false);
    }
  };
  
  const handleOpenEditPermissions = (dept: DepartmentAccessDto) => {
    setEditingDepartment(dept);
    setEditPermissions({
      canView: dept.canView || false,
      canCreate: dept.canCreate || false,
      canEdit: dept.canEdit || false,
      canDelete: dept.canDelete || false,
      canApprove: dept.canApprove || false,
      canExport: dept.canExport || false,
    });
    setError('');
    setSuccess('');
  };
  
  const handleSaveEditPermissions = async () => {
    if (!editingDepartment) return;
    await handleUpdatePermissions(editingDepartment.departmentId, editPermissions);
  };

  // Filter available departments (exclude already assigned)
  const assignedDepartmentIds = userDepartments.map((d) => d.departmentId);
  const availableDepartments = allDepartments.filter(
    (d) => !assignedDepartmentIds.includes(d.id)
  );

  // Group departments by parent for hierarchical display
  const standardDepartments = availableDepartments.filter((d) => !d.parentDepartmentName);
  const subDepartments = availableDepartments.filter((d) => d.parentDepartmentName);
  
  // Create a map of parent department IDs to their sub-departments
  const subDepartmentsByParent: { [key: string]: Department[] } = {};
  allDepartments.forEach((parent) => {
    if (!parent.parentDepartmentName) {
      subDepartmentsByParent[parent.departmentName] = allDepartments.filter(
        (sub) => sub.parentDepartmentName === parent.departmentName
      );
    }
  });

  // Simple flat list of department options (react-select handles search/filtering)
  const departmentOptions: any[] = availableDepartments.map((dept) => ({
    value: dept.id,
    label: `${dept.departmentCode} - ${dept.departmentName}`,
    dept,
  }));
  
  console.log('🔍 Render - allDepartments:', allDepartments.length);
  console.log('🔍 Render - availableDepartments:', availableDepartments.length);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Modern Healthcare Header */}
        <div className="bg-gradient-to-r from-blue-600 to-teal-600 px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  Department Access Management
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <Users className="h-4 w-4 text-blue-100" />
                  <p className="text-sm text-blue-100">
                    Managing access for: <span className="font-semibold text-white">{userName}</span>
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="flex items-center justify-center w-10 h-10 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition-all"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Stats Bar */}
          <div className="mt-4 flex gap-4">
            <div className="flex items-center gap-2 px-3 py-2 bg-white/10 backdrop-blur-sm rounded-lg">
              <Building2 className="h-4 w-4 text-white/80" />
              <span className="text-sm text-white/90">
                <span className="font-semibold">{userDepartments.length}</span> Active Assignments
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-white/10 backdrop-blur-sm rounded-lg">
              <Stethoscope className="h-4 w-4 text-white/80" />
              <span className="text-sm text-white/90">
                <span className="font-semibold">{availableDepartments.length}</span> Available Departments
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 bg-gray-50">
          {/* Error/Success Messages - Enhanced */}
          {error && (
            <div className="mb-6 bg-gradient-to-r from-red-50 to-rose-50 border-l-4 border-red-500 text-red-800 px-4 py-4 rounded-lg shadow-sm flex items-start gap-3">
              <div className="flex-shrink-0 p-2 bg-white rounded-lg shadow-sm">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <div className="font-semibold mb-1">Access Management Error</div>
                <div className="text-sm">{error}</div>
              </div>
            </div>
          )}
          {success && (
            <div className="mb-6 bg-gradient-to-r from-emerald-50 to-teal-50 border-l-4 border-emerald-500 text-emerald-800 px-4 py-4 rounded-lg shadow-sm flex items-start gap-3 animate-slideIn">
              <div className="flex-shrink-0 p-2 bg-white rounded-lg shadow-sm">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <div className="font-semibold mb-1">Success</div>
                <div className="text-sm">{success}</div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-500">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-sm">Loading department data...</p>
            </div>
          ) : (
            <>
              {/* Assign New Department Section - Modern Card */}
              <div className="mb-6 p-6 bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center gap-3 mb-5">
                  <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-teal-500 rounded-lg shadow-sm">
                    <Building2 className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      Assign New Department Access
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Select departments to grant access (use Edit Permissions button to customize permissions)
                    </p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  {/* Department Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-blue-600" />
                      Select Department(s)
                      <span className="text-red-500">*</span>
                    </label>
                    <Select
                      isMulti
                      options={departmentOptions}
                      value={departmentOptions.filter(opt => selectedDepartments.some(sel => sel.id === opt.value))}
                      onChange={(selected) => {
                        setSelectedDepartments(Array.isArray(selected) ? selected.map(opt => opt.dept) : []);
                      }}
                      placeholder="Search and select departments (type to filter)..."
                      classNamePrefix="react-select"
                      styles={{
                        control: (base, state) => ({
                          ...base,
                          minHeight: '44px',
                          borderRadius: '0.5rem',
                          borderWidth: '2px',
                          borderColor: state.isFocused ? '#3b82f6' : '#e5e7eb',
                          boxShadow: state.isFocused ? '0 0 0 3px rgba(59, 130, 246, 0.1)' : 'none',
                          '&:hover': {
                            borderColor: '#3b82f6',
                          },
                        }),
                        multiValue: (base) => ({
                          ...base,
                          backgroundColor: '#dbeafe',
                          borderRadius: '0.375rem',
                          padding: '2px',
                        }),
                        multiValueLabel: (base) => ({
                          ...base,
                          color: '#1e40af',
                          fontWeight: '500',
                          fontSize: '0.875rem',
                        }),
                        multiValueRemove: (base) => ({
                          ...base,
                          color: '#3b82f6',
                          '&:hover': {
                            backgroundColor: '#3b82f6',
                            color: 'white',
                          },
                        }),
                        menu: (base) => ({ 
                          ...base, 
                          zIndex: 9999,
                          borderRadius: '0.5rem',
                          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                        }),
                        option: (base, state) => ({
                          ...base,
                          backgroundColor: state.isSelected 
                            ? '#3b82f6' 
                            : state.isFocused 
                            ? '#eff6ff' 
                            : 'white',
                          color: state.isSelected ? 'white' : '#374151',
                          padding: '10px 12px',
                        }),
                      }}
                      isDisabled={saving}
                      noOptionsMessage={() => 'No departments available to assign'}
                    />
                    {selectedDepartments.length > 0 && (
                      <div className="mt-2 flex items-center gap-2 text-xs text-gray-600">
                        <Info className="h-3.5 w-3.5" />
                        <span>{selectedDepartments.length} department{selectedDepartments.length > 1 ? 's' : ''} selected</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200 flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setSelectedDepartments([]);
                      setSelectedPermissions({
                        canView: true,
                        canCreate: false,
                        canEdit: false,
                        canDelete: false,
                        canApprove: false,
                        canExport: false,
                      });
                    }}
                    disabled={saving}
                    className="px-5 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-all disabled:opacity-50"
                  >
                    Clear Selection
                  </button>
                  <button
                    onClick={handleAssign}
                    disabled={saving || !selectedDepartments.length}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-teal-600 text-white px-6 py-2.5 rounded-lg hover:from-blue-700 hover:to-teal-700 font-semibold shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md transition-all"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Assigning Access...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Assign Department Access</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Current Departments Section - Enhanced */}
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-lg shadow-sm">
                      <Stethoscope className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        Current Department Assignments
                      </h3>
                      <p className="text-xs text-gray-500">
                        {userDepartments.length} active assignment{userDepartments.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                </div>

                {userDepartments.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-300">
                    <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">No department assignments yet</p>
                    <p className="text-sm text-gray-400 mt-1">Assign departments above to grant access</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userDepartments.map((dept) => (
                      <div
                        key={dept.departmentId}
                        className={`
                          group p-5 border-2 rounded-xl transition-all hover:shadow-lg
                          ${dept.isPrimary
                            ? 'border-blue-300 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-md'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                          }
                        `}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <div className={`
                                flex items-center justify-center w-10 h-10 rounded-lg
                                ${dept.isPrimary 
                                  ? 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-sm' 
                                  : 'bg-gray-100 border border-gray-200'
                                }
                              `}>
                                <Building2 className={`h-5 w-5 ${dept.isPrimary ? 'text-white' : 'text-gray-600'}`} />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-bold text-gray-900">
                                    {dept.departmentName}
                                  </h4>
                                  {dept.isPrimary && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 shadow-sm">
                                      <Clock className="h-3 w-3" />
                                      Primary
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-1.5 mt-1">
                                  <span className="text-xs text-gray-500">Code:</span>
                                  <span className="text-xs font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-700">
                                    {dept.departmentCode}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            {/* Current Permissions Display - Enhanced */}
                            <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                              <div className="flex items-center gap-2 mb-2.5">
                                <Shield className="h-4 w-4 text-gray-600" />
                                <span className="text-sm font-semibold text-gray-700">Access Permissions</span>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {dept.canView && (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-lg">
                                    <Eye className="h-3 w-3" />
                                    View
                                  </span>
                                )}
                                {dept.canCreate && (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-teal-100 text-teal-700 text-xs font-medium rounded-lg">
                                    <FilePlus className="h-3 w-3" />
                                    Create
                                  </span>
                                )}
                                {dept.canEdit && (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-lg">
                                    <Edit3 className="h-3 w-3" />
                                    Edit
                                  </span>
                                )}
                                {dept.canDelete && (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-100 text-rose-700 text-xs font-medium rounded-lg">
                                    <Trash2 className="h-3 w-3" />
                                    Delete
                                  </span>
                                )}
                                {dept.canApprove && (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-lg">
                                    <CheckCircle className="h-3 w-3" />
                                    Approve
                                  </span>
                                )}
                                {dept.canExport && (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-lg">
                                    <Download className="h-3 w-3" />
                                    Export
                                  </span>
                                )}
                              </div>
                              <button
                                onClick={() => handleOpenEditPermissions(dept)}
                                disabled={saving}
                                className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 font-semibold shadow-md hover:shadow-lg disabled:opacity-50 transition-all text-sm"
                              >
                                <Edit3 className="h-4 w-4" />
                                Edit Permissions
                              </button>
                            </div>
                          </div>

                          <div className="flex flex-col gap-2 ml-4">
                            {!dept.isPrimary && (
                              <button
                                onClick={() => {
                                  if (confirm('Set this as the primary department?\n\nThis will become the user\'s default department upon login.')) {
                                    handleSetPrimary(dept.departmentId);
                                  }
                                }}
                                disabled={saving}
                                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-all disabled:opacity-50 border border-blue-200"
                              >
                                <Clock className="h-4 w-4" />
                                Set Primary
                              </button>
                            )}
                            <button
                              onClick={() => {
                                if (confirm(`⚠️ Revoke access to "${dept.departmentName}"?\n\nThis will remove all permissions and access to this department. This action cannot be undone.`)) {
                                  handleRevoke(dept.departmentId);
                                }
                              }}
                              disabled={saving}
                              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-all disabled:opacity-50 border border-rose-200"
                              title="Revoke Access"
                            >
                              <Trash2 className="h-4 w-4" />
                              Revoke
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

        {/* Footer - Modern */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Info className="h-4 w-4" />
            <span>Changes take effect immediately</span>
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-white hover:border-gray-400 font-medium transition-all shadow-sm"
          >
            Close
          </button>
        </div>
      </div>
      
      {/* Edit Permissions Modal */}
      {editingDepartment && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[60] p-2 sm:p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-teal-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg">
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Edit Permissions</h3>
                    <p className="text-sm text-blue-100">{editingDepartment.departmentName}</p>
                  </div>
                </div>
                <button
                  onClick={() => setEditingDepartment(null)}
                  className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-6 flex-1 overflow-y-auto">
              <div className="mb-4 p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
                <p className="text-sm text-blue-800">
                  Update clinical access permissions for <strong>{userName}</strong> in this department.
                </p>
              </div>
              
              <GranularPermissionSelector
                permissions={editPermissions}
                onChange={setEditPermissions}
                disabled={saving}
              />
            </div>
            
            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setEditingDepartment(null)}
                disabled={saving}
                className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-white hover:border-gray-400 font-medium transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEditPermissions}
                disabled={saving || !Object.values(editPermissions).some(v => v)}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-lg hover:shadow-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save Permissions'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
