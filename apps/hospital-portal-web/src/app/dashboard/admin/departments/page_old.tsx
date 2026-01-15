'use client';

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import { departmentsApi, Department, DepartmentFilters } from '@/lib/api/departments.api';
import { useRouter } from 'next/navigation';
import { SearchFilter } from '@/components/ui/SearchFilter';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import DepartmentForm from '@/components/admin/DepartmentForm';
import DepartmentDetailsModal from '@/components/admin/DepartmentDetailsModal';
import DepartmentHierarchyModal from '@/components/admin/DepartmentHierarchyModal';

// Department type icons mapping
const getDepartmentIcon = (type: string) => {
  const icons: Record<string, string> = {
    'Clinical': '🏥',
    'Administrative': '📋',
    'Support': '🔧',
    'Diagnostics': '🔬',
    'Therapeutic': '💊',
    'Emergency': '🚑',
    'Surgical': '⚕️',
    'Medical': '🩺'
  };
  return icons[type] || '🏢';
};

export default function DepartmentsPage() {
  const { user } = useAuthStore();
  const router = useRouter();

  const [departments, setDepartments] = useState<Department[]>([]);
  const [filteredDepartments, setFilteredDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Hierarchy state
  const [expandedDepartments, setExpandedDepartments] = useState<Set<string>>(new Set());
  const [standardDepartments, setStandardDepartments] = useState<Department[]>([]);
  const [subDepartmentsMap, setSubDepartmentsMap] = useState<Map<string, Department[]>>(new Map());

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [departmentTypes, setDepartmentTypes] = useState<string[]>([]);

  // Modals
  const [showForm, setShowForm] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showHierarchy, setShowHierarchy] = useState(false);

  useEffect(() => {
    if (user) {
      loadDepartments();
      loadDepartmentTypes();
    }
  }, [user]);

  useEffect(() => {
    filterDepartments();
  }, [departments, searchTerm, statusFilter, typeFilter]);

  const loadDepartments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await departmentsApi.getAllWithStaffCount();
      setDepartments(data as any);
      
      // Separate standard departments and sub-departments
      const standard = (data as any[]).filter((d: any) => !d.parentDepartmentId);
      const subDepts = (data as any[]).filter((d: any) => d.parentDepartmentId);
      
      setStandardDepartments(standard);
      
      // Group sub-departments by parent
      const subDeptMap = new Map<string, Department[]>();
      subDepts.forEach((subDept: any) => {
        const parentId = subDept.parentDepartmentId;
        if (!subDeptMap.has(parentId)) {
          subDeptMap.set(parentId, []);
        }
        subDeptMap.get(parentId)!.push(subDept);
      });
      setSubDepartmentsMap(subDeptMap);
    } catch (err: any) {
      console.error('Error loading departments:', err);
      setError(err.response?.data?.message || 'Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  const loadDepartmentTypes = async () => {
    try {
      const types = await departmentsApi.getDepartmentTypes();
      setDepartmentTypes(types);
    } catch (err) {
      console.error('Error loading department types:', err);
      // Use default types
      setDepartmentTypes([
        'Clinical',
        'Administrative',
        'Support',
        'Diagnostic',
        'Therapeutic',
        'Emergency',
        'Surgical',
        'Medical',
      ]);
    }
  };

  const filterDepartments = () => {
    let filteredStandard = [...standardDepartments];

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      // Filter standard departments
      filteredStandard = filteredStandard.filter(
        (dept) =>
          dept.departmentName.toLowerCase().includes(search) ||
          dept.departmentCode.toLowerCase().includes(search) ||
          dept.departmentHeadName?.toLowerCase().includes(search)
      );
      
      // Also include parents whose sub-departments match the search
      const matchingParents = standardDepartments.filter(parent => {
        const subs = subDepartmentsMap.get(parent.id) || [];
        return subs.some(sub =>
          sub.departmentName.toLowerCase().includes(search) ||
          sub.departmentCode.toLowerCase().includes(search) ||
          sub.departmentHeadName?.toLowerCase().includes(search)
        );
      });
      
      // Merge and remove duplicates
      const allMatching = [...filteredStandard, ...matchingParents];
      filteredStandard = Array.from(new Map(allMatching.map(d => [d.id, d])).values());
    }

    // Status filter
    if (statusFilter) {
      filteredStandard = filteredStandard.filter((dept) => dept.status === statusFilter);
    }

    // Type filter
    if (typeFilter) {
      filteredStandard = filteredStandard.filter((dept) => dept.departmentType === typeFilter);
    }

    // Build flat list for backward compatibility
    const flatFiltered: Department[] = [];
    filteredStandard.forEach(parent => {
      flatFiltered.push(parent);
      if (expandedDepartments.has(parent.id)) {
        const subs = subDepartmentsMap.get(parent.id) || [];
        flatFiltered.push(...subs);
      }
    });
    
    setFilteredDepartments(flatFiltered);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setTypeFilter('');
  };

  const handleCreate = () => {
    setSelectedDepartment(null);
    setShowForm(true);
  };

  const handleEdit = (department: Department) => {
    setSelectedDepartment(department);
    setShowForm(true);
  };

  const toggleDepartment = (departmentId: string) => {
    setExpandedDepartments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(departmentId)) {
        newSet.delete(departmentId);
      } else {
        newSet.add(departmentId);
      }
      return newSet;
    });
  };

  const handleViewDetails = (department: Department) => {
    setSelectedDepartment(department);
    setShowDetails(true);
  };

  const handleDelete = async (department: Department) => {
    if (!confirm(`Are you sure you want to delete department "${department.departmentName}"?`)) {
      return;
    }

    try {
      await departmentsApi.delete(department.id);
      await loadDepartments();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete department');
    }
  };

  const handleFormClose = async (saved: boolean) => {
    setShowForm(false);
    setSelectedDepartment(null);
    if (saved) {
      await loadDepartments();
    }
  };

  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-16 w-16 animate-spin rounded-full border-4 border-teal-600 border-t-transparent mx-auto"></div>
          <p className="text-gray-600 font-medium">Loading departments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50 p-6">
      <div className="mx-auto max-w-full">
        {/* Header with Healthcare Design */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 text-3xl shadow-lg">
                🏥
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Departments Management</h1>
                <p className="mt-1 text-sm text-gray-600">Organize and manage hospital departments with hierarchical structure</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowHierarchy(true)}
                className="flex items-center gap-2 rounded-xl border-2 border-teal-200 bg-white px-5 py-2.5 font-semibold text-teal-700 shadow-sm transition-all hover:border-teal-300 hover:bg-teal-50 hover:shadow-md"
              >
                <span className="text-xl">📊</span>
                <span>View Hierarchy</span>
              </button>
              <button
                onClick={handleCreate}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-teal-700 px-5 py-2.5 font-semibold text-white shadow-md transition-all hover:from-teal-700 hover:to-teal-800 hover:shadow-lg"
              >
                <span className="text-xl">+</span>
                <span>Create Department</span>
              </button>
            </div>
          </div>
        </div>


        {error && (
          <div className="mb-6 rounded-xl border-2 border-red-200 bg-gradient-to-r from-red-50 to-red-100 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚠️</span>
              <p className="font-medium text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Enhanced Stats Cards */}
        <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-4">
          <div className="group rounded-2xl border border-teal-100 bg-gradient-to-br from-white to-teal-50 p-6 shadow-md transition-all hover:shadow-xl hover:scale-105">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-teal-700 uppercase tracking-wide">Standard Departments</p>
                <p className="mt-3 text-4xl font-bold text-gray-900">{standardDepartments.length}</p>
              </div>
              <div className="rounded-xl bg-teal-100 p-3 text-2xl shadow-inner">🏢</div>
            </div>
            <div className="mt-4 h-1 w-full rounded-full bg-teal-200">
              <div className="h-1 rounded-full bg-teal-600" style={{ width: '100%' }}></div>
            </div>
          </div>
          
          <div className="group rounded-2xl border border-blue-100 bg-gradient-to-br from-white to-blue-50 p-6 shadow-md transition-all hover:shadow-xl hover:scale-105">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-blue-700 uppercase tracking-wide">Sub-Departments</p>
                <p className="mt-3 text-4xl font-bold text-blue-600">
                  {departments.filter((d) => d.parentDepartmentId).length}
                </p>
              </div>
              <div className="rounded-xl bg-blue-100 p-3 text-2xl shadow-inner">📂</div>
            </div>
            <div className="mt-4 h-1 w-full rounded-full bg-blue-200">
              <div className="h-1 rounded-full bg-blue-600" style={{ width: '85%' }}></div>
            </div>
          </div>
          
          <div className="group rounded-2xl border border-purple-100 bg-gradient-to-br from-white to-purple-50 p-6 shadow-md transition-all hover:shadow-xl hover:scale-105">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-purple-700 uppercase tracking-wide">Total Departments</p>
                <p className="mt-3 text-4xl font-bold text-purple-600">{departments.length}</p>
              </div>
              <div className="rounded-xl bg-purple-100 p-3 text-2xl shadow-inner">🏥</div>
            </div>
            <div className="mt-4 h-1 w-full rounded-full bg-purple-200">
              <div className="h-1 rounded-full bg-purple-600" style={{ width: '95%' }}></div>
            </div>
          </div>
          
          <div className="group rounded-2xl border border-green-100 bg-gradient-to-br from-white to-green-50 p-6 shadow-md transition-all hover:shadow-xl hover:scale-105">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-green-700 uppercase tracking-wide">Total Staff</p>
                <p className="mt-3 text-4xl font-bold text-green-600">
                  {departments.reduce((sum, d) => sum + ((d as any).staffCount || d.totalStaff || 0), 0)}
                </p>
              </div>
              <div className="rounded-xl bg-green-100 p-3 text-2xl shadow-inner">👥</div>
            </div>
            <div className="mt-4 h-1 w-full rounded-full bg-green-200">
              <div className="h-1 rounded-full bg-green-600" style={{ width: '70%' }}></div>
            </div>
          </div>
        </div>
        
        {/* Search and Filters - Enhanced */}
        <div className="mb-6">
          <SearchFilter
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            placeholder="🔍 Search by department name, code, or head..."
            filters={[
              {
                label: 'All Statuses',
                value: statusFilter,
                options: [
                  { label: 'Active', value: 'Active' },
                  { label: 'Inactive', value: 'Inactive' },
                  { label: 'Under Maintenance', value: 'UnderMaintenance' },
                ],
                onChange: setStatusFilter,
              },
              {
                label: 'All Types',
                value: typeFilter,
                options: departmentTypes.map((type) => ({ label: type, value: type })),
                onChange: setTypeFilter,
              },
            ]}
            onClearFilters={handleClearFilters}
          />
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-sm text-gray-600">Standard Departments</p>
            <p className="mt-1 text-2xl font-semibold text-gray-900">{standardDepartments.length}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-sm text-gray-600">Sub-Departments</p>
            <p className="mt-1 text-2xl font-semibold text-blue-600">
              {departments.filter((d) => d.parentDepartmentId).length}
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-sm text-gray-600">Total (All)</p>
            <p className="mt-1 text-2xl font-semibold text-purple-600">{departments.length}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-sm text-gray-600">Total Staff</p>
            <p className="mt-1 text-2xl font-semibold text-green-600">
              {departments.reduce((sum, d) => sum + ((d as any).staffCount || d.totalStaff || 0), 0)}
            </p>
          </div>
        </div>

        {/* Departments Table */}
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
          {filteredDepartments.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon="🏥"
                title={searchTerm || statusFilter || typeFilter ? 'No departments found' : 'No departments yet'}
                description={
                  searchTerm || statusFilter || typeFilter
                    ? 'Try adjusting your search or filters'
                    : 'Get started by creating your first department'
                }
                action={
                  searchTerm || statusFilter || typeFilter
                    ? { label: 'Clear Filters', onClick: handleClearFilters }
                    : { label: 'Create Department', onClick: handleCreate }
                }
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-200 bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Department
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Department Head
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Staff
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Sub-Depts
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredDepartments.map((department) => {
                    const isStandardDept = !department.parentDepartmentId;
                    const isExpanded = expandedDepartments.has(department.id);
                    const subDepts = subDepartmentsMap.get(department.id) || [];
                    const hasSubDepts = subDepts.length > 0;

                    return (
                      <React.Fragment key={department.id}>
                        {/* Main Department Row */}
                        <tr className={`transition-all duration-200 ${!isStandardDept ? 'bg-blue-50 hover:bg-blue-100' : 'hover:bg-gray-50'} ${isStandardDept && hasSubDepts ? 'border-l-4 border-l-blue-500' : ''}`}>
                          <td className="px-6 py-4">
                            <div className={`flex items-center gap-3 ${!isStandardDept ? 'pl-12' : ''}`}>
                              {isStandardDept && hasSubDepts && (
                                <button
                                  onClick={() => toggleDepartment(department.id)}
                                  className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 transition-all duration-200"
                                  title={isExpanded ? 'Collapse' : 'Expand'}
                                >
                                  <span className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}>
                                    ▶
                                  </span>
                                </button>
                              )}
                              {!isStandardDept && (
                                <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                                  <div className="w-4 h-4 rounded-full bg-blue-200 border-2 border-blue-400"></div>
                                </div>
                              )}
                              <div className="flex items-center gap-3 flex-1">
                                {isStandardDept && hasSubDepts && (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    {subDepts.length} Sub-Depts
                                  </span>
                                )}
                                <div>
                                  <p className={`font-semibold ${isStandardDept ? 'text-gray-900 text-base' : 'text-gray-700 text-sm'}`}>
                                    {department.departmentName}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-0.5">{department.departmentCode}</p>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                              department.departmentType === 'Clinical' ? 'bg-green-100 text-green-800' :
                              department.departmentType === 'Administrative' ? 'bg-purple-100 text-purple-800' :
                              department.departmentType === 'Support' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {department.departmentType}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-gray-700">
                              {department.departmentHeadName || <span className="text-gray-400 italic">Not assigned</span>}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">👥</span>
                              <span className="text-sm font-semibold text-gray-900">
                                {(department as any).staffCount || department.totalStaff || 0}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm font-medium text-gray-900">
                              {department.totalSubDepartments || 0}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <StatusBadge status={department.status} />
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => handleViewDetails(department)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="View Details"
                              >
                                👁️
                              </button>
                              <button
                                onClick={() => handleEdit(department)}
                                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                title="Edit"
                              >
                                ✏️
                              </button>
                              <button
                                onClick={() => handleDelete(department)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete"
                              >
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* Sub-Department Rows (only if expanded) */}
                        {isStandardDept && isExpanded && subDepts.map((subDept, index) => (
                          <tr key={subDept.id} className="bg-blue-50 hover:bg-blue-100 transition-colors duration-150 border-l-4 border-l-blue-300">
                            <td className="px-6 py-3">
                              <div className="flex items-center gap-3 pl-12">
                                <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                                  <div className="w-4 h-4 rounded-full bg-blue-300 border-2 border-blue-500"></div>
                                </div>
                                <div className="flex items-center gap-3 flex-1">
                                  <div>
                                    <p className="font-medium text-gray-800 text-sm">{subDept.departmentName}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">{subDept.departmentCode}</p>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-3">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                                subDept.departmentType === 'Clinical' ? 'bg-green-100 text-green-800' :
                                subDept.departmentType === 'Administrative' ? 'bg-purple-100 text-purple-800' :
                                subDept.departmentType === 'Support' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {subDept.departmentType}
                              </span>
                            </td>
                            <td className="px-6 py-3">
                              <span className="text-sm text-gray-700">
                                {subDept.departmentHeadName || <span className="text-gray-400 italic">Not assigned</span>}
                              </span>
                            </td>
                            <td className="px-6 py-3">
                              <div className="flex items-center gap-2">
                                <span className="text-base">👤</span>
                                <span className="text-sm font-medium text-gray-700">
                                  {(subDept as any).staffCount || subDept.totalStaff || 0}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-3">
                              <span className="text-sm font-medium text-gray-700">
                                {subDept.totalSubDepartments || 0}
                              </span>
                            </td>
                            <td className="px-6 py-3">
                              <StatusBadge status={subDept.status} />
                            </td>
                            <td className="px-6 py-3 text-right">
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => handleViewDetails(subDept)}
                                  className="p-2 text-blue-600 hover:bg-blue-200 rounded-lg transition-colors"
                                  title="View Details"
                                >
                                  👁️
                                </button>
                                <button
                                  onClick={() => handleEdit(subDept)}
                                  className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                                  title="Edit"
                                >
                                  ✏️
                                </button>
                                <button
                                  onClick={() => handleDelete(subDept)}
                                  className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                  title="Delete"
                                >
                                  🗑️
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showForm && (
        <DepartmentForm
          department={selectedDepartment}
          onClose={handleFormClose}
        />
      )}

      {showDetails && selectedDepartment && (
        <DepartmentDetailsModal
          departmentId={selectedDepartment.id}
          onClose={() => {
            setShowDetails(false);
            setSelectedDepartment(null);
          }}
        />
      )}

      {showHierarchy && (
        <DepartmentHierarchyModal onClose={() => setShowHierarchy(false)} />
      )}
    </div>
  );
}
