'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useAuthStore } from '@/lib/auth-store';
import { departmentsApi, Department, DepartmentFilters } from '@/lib/api/departments.api';
import { branchesApi } from '@/lib/api/branches.api';
import { usersApi } from '@/lib/api/users.api';
import { useRouter } from 'next/navigation';
import { SearchFilter } from '@/components/ui/SearchFilter';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import DepartmentForm from '@/components/admin/DepartmentForm';
import DepartmentDetailsModal from '@/components/admin/DepartmentDetailsModal';
import DepartmentHierarchyModal from '@/components/admin/DepartmentHierarchyModal';
import DepartmentHierarchyTree from '@/components/admin/DepartmentHierarchyTree';
import ParentDepartmentSelector from '@/components/admin/ParentDepartmentSelector';
import { DepartmentStatistics } from '@/components/admin/DepartmentStatistics';

// Dynamically import components that use browser APIs (react-beautiful-dnd uses document/window)
const DepartmentTree = dynamic(
  () => import('@/components/departments/DepartmentTree').then(mod => ({ default: mod.DepartmentTree })),
  { ssr: false }
);

const DepartmentCreationWizard = dynamic(
  () => import('@/components/departments/DepartmentCreationWizard').then(mod => ({ default: mod.DepartmentCreationWizard })),
  { ssr: false }
);

const DepartmentStaffModal = dynamic(
  () => import('@/components/departments/DepartmentStaffModal').then(mod => ({ default: mod.DepartmentStaffModal })),
  { ssr: false }
);

import { getApi } from '@/lib/api';

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

  // View mode: list or tree or stats
  const [viewMode, setViewMode] = useState<'list' | 'tree' | 'stats'>('list');

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
  
  // New modals for Week 11-12
  const [showWizard, setShowWizard] = useState(false);
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [staffModalData, setStaffModalData] = useState<{ department: Department; staff: any[] }>({ 
    department: null as any, 
    staff: [] 
  });
  const [staffLoading, setStaffLoading] = useState(false);
  
  // Data for wizard
  const [branches, setBranches] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [templates, setTemplates] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      loadDepartments();
      loadDepartmentTypes();
      loadBranches();
      loadUsers();
      loadTemplates();
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
  
  const loadBranches = async () => {
    try {
      const api = getApi();
      const response = await api.get('/branches');
      setBranches(response.data);
    } catch (err) {
      console.error('Error loading branches:', err);
    }
  };
  
  const loadUsers = async () => {
    try {
      const api = getApi();
      const response = await api.get('/users');
      setUsers(response.data.users || response.data);
    } catch (err) {
      console.error('Error loading users:', err);
    }
  };
  
  const loadTemplates = async () => {
    try {
      const api = getApi();
      const response = await api.get('/departments/templates');
      setTemplates(response.data);
    } catch (err) {
      console.error('Error loading templates:', err);
      setTemplates([]);
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
  
  const handleMoveDepartment = async (departmentId: string, newParentId: string | null) => {
    try {
      const api = getApi();
      await api.put(`/departments/${departmentId}/move`, { newParentId });
      await loadDepartments();
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to move department');
    }
  };
  
  const handleViewStaff = async (department: Department) => {
    setStaffLoading(true);
    setShowStaffModal(true);
    setStaffModalData({ department, staff: [] });
    
    try {
      const api = getApi();
      const response = await api.get(`/departments/${department.id}/staff`);
      setStaffModalData({ department, staff: response.data });
    } catch (err) {
      console.error('Error loading staff:', err);
    } finally {
      setStaffLoading(false);
    }
  };
  
  const handleWizardSubmit = async (data: any, templateName?: string) => {
    try {
      const api = getApi();
      if (templateName) {
        await api.post('/departments/from-template', {
          templateName,
          data
        });
      } else {
        await api.post('/departments', data);
      }
      await loadDepartments();
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create department');
    }
  };

  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-teal-600 border-t-transparent mx-auto"></div>
          <p className="text-gray-600">Loading departments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-full">
        {/* Clean Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Departments Management</h1>
            <p className="mt-1 text-sm text-gray-600">Manage hospital departments and their hierarchies</p>
          </div>
          <div className="flex gap-3">
            {/* View Mode Toggle */}
            <div className="flex rounded-lg border border-gray-300 bg-white">
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
                  viewMode === 'list'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                📋 List
              </button>
              <button
                onClick={() => setViewMode('tree')}
                className={`px-4 py-2 text-sm font-medium ${
                  viewMode === 'tree'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                🌳 Tree
              </button>
              <button
                onClick={() => setViewMode('stats')}
                className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
                  viewMode === 'stats'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                📊 Stats
              </button>
            </div>
            
            <button
              onClick={() => router.push('/dashboard/admin/departments/management')}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              🏗️ Department Hierarchy
            </button>
            <button
              onClick={() => setShowWizard(true)}
              className="flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
            >
              ✨ Create from Template
            </button>
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              + Create Department
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Simple Stats Cards */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="text-sm font-medium text-gray-600">Standard Departments</div>
            <div className="mt-2 text-3xl font-bold text-gray-900">{standardDepartments.length}</div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="text-sm font-medium text-gray-600">Sub-Departments</div>
            <div className="mt-2 text-3xl font-bold text-blue-600">
              {departments.filter((d) => d.parentDepartmentId).length}
            </div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="text-sm font-medium text-gray-600">Total (All)</div>
            <div className="mt-2 text-3xl font-bold text-purple-600">{departments.length}</div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="text-sm font-medium text-gray-600">Total Staff</div>
            <div className="mt-2 text-3xl font-bold text-green-600">
              {departments.reduce((sum, d) => sum + ((d as any).staffCount || d.totalStaff || 0), 0)}
            </div>
          </div>
        </div>
        
        {/* Search and Filters */}
        <div className="mb-6">
          <SearchFilter
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            placeholder="Search by department name, code, or head..."
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

        {/* Content: Tree, List, or Stats View */}
        {viewMode === 'stats' ? (
          <DepartmentStatistics 
            departments={departments as any}
            standardDepartments={standardDepartments as any}
            subDepartmentsMap={subDepartmentsMap as any}
          />
        ) : viewMode === 'tree' ? (
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow">
            <DepartmentTree
              departments={departments as any}
              onMove={handleMoveDepartment}
              onViewStaff={handleViewStaff}
              onEdit={handleEdit}
            />
          </div>
        ) : (
          /* Clean Table Design */
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow">
          {filteredDepartments.length === 0 ? (
            <div className="p-12">
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
            <table className="w-full">
              <thead className="bg-gray-50">
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
                  const staffCount = (department as any).staffCount || department.totalStaff || 0;

                  if (!isStandardDept) return null;

                  return (
                    <React.Fragment key={department.id}>
                      {/* Main Department Row */}
                      <tr className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {hasSubDepts && (
                              <button
                                onClick={() => toggleDepartment(department.id)}
                                className="flex h-6 w-6 items-center justify-center rounded text-gray-400 hover:bg-gray-200 hover:text-gray-600"
                              >
                                <span className={`transform text-xs transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
                                  ▶
                                </span>
                              </button>
                            )}
                            <div>
                              <div className="flex items-center gap-2">
                                <div className="font-medium text-gray-900">{department.departmentName}</div>
                                {hasSubDepts && (
                                  <span className="inline-flex items-center rounded-full bg-teal-100 px-2 py-0.5 text-xs font-medium text-teal-800">
                                    {subDepts.length} Sub-Depts
                                  </span>
                                )}
                              </div>
                              <div className="text-sm text-gray-500">{department.departmentCode}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            department.departmentType === 'Clinical' ? 'bg-green-100 text-green-800' :
                            department.departmentType === 'Administrative' ? 'bg-purple-100 text-purple-800' :
                            department.departmentType === 'Support' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {department.departmentType}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {department.departmentHeadName || <span className="text-gray-400">Not assigned</span>}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{staffCount}</div>
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={department.status} />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleViewDetails(department)}
                              className="rounded p-1 text-blue-600 hover:bg-blue-50"
                              title="View"
                            >
                              👁️
                            </button>
                            <button
                              onClick={() => handleEdit(department)}
                              className="rounded p-1 text-teal-600 hover:bg-teal-50"
                              title="Edit"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleDelete(department)}
                              className="rounded p-1 text-red-600 hover:bg-red-50"
                              title="Delete"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Sub-Departments */}
                      {hasSubDepts && isExpanded && subDepts.map((subDept) => {
                        const subStaffCount = (subDept as any).staffCount || subDept.totalStaff || 0;
                        return (
                          <tr key={subDept.id} className="bg-gray-50">
                            <td className="px-6 py-3">
                              <div className="flex items-center gap-3 pl-9">
                                <div className="h-2 w-2 rounded-full bg-gray-400"></div>
                                <div>
                                  <div className="font-medium text-gray-900">{subDept.departmentName}</div>
                                  <div className="text-sm text-gray-500">{subDept.departmentCode}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-3">
                              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                subDept.departmentType === 'Clinical' ? 'bg-green-100 text-green-800' :
                                subDept.departmentType === 'Administrative' ? 'bg-purple-100 text-purple-800' :
                                subDept.departmentType === 'Support' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {subDept.departmentType}
                              </span>
                            </td>
                            <td className="px-6 py-3 text-sm text-gray-900">
                              {subDept.departmentHeadName || <span className="text-gray-400">Not assigned</span>}
                            </td>
                            <td className="px-6 py-3">
                              <div className="text-sm font-medium text-gray-900">{subStaffCount}</div>
                            </td>
                            <td className="px-6 py-3">
                              <StatusBadge status={subDept.status} />
                            </td>
                            <td className="px-6 py-3">
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => handleViewDetails(subDept)}
                                  className="rounded p-1 text-blue-600 hover:bg-blue-100"
                                  title="View"
                                >
                                  👁️
                                </button>
                                <button
                                  onClick={() => handleEdit(subDept)}
                                  className="rounded p-1 text-teal-600 hover:bg-teal-100"
                                  title="Edit"
                                >
                                  ✏️
                                </button>
                                <button
                                  onClick={() => handleDelete(subDept)}
                                  className="rounded p-1 text-red-600 hover:bg-red-100"
                                  title="Delete"
                                >
                                  🗑️
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
        )}
      </div>

      {/* Modals */}
      {showForm && (
        <DepartmentForm
          department={selectedDepartment}
          onClose={handleFormClose}
        />
      )}
      
      {showWizard && (
        <DepartmentCreationWizard
          isOpen={showWizard}
          onClose={() => setShowWizard(false)}
          onSubmit={handleWizardSubmit}
          branches={branches}
          users={users}
          departments={departments}
          templates={templates}
        />
      )}
      
      {showStaffModal && (
        <DepartmentStaffModal
          isOpen={showStaffModal}
          onClose={() => setShowStaffModal(false)}
          departmentName={staffModalData.department?.departmentName || ''}
          staff={staffModalData.staff}
          loading={staffLoading}
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
