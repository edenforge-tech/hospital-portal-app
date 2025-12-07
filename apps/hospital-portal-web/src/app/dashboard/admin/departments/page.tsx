'use client';

import { useAuthStore } from '@/lib/auth-store';
import { departmentsApi, Department, DepartmentFilters } from '@/lib/api/departments.api';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { SearchFilter } from '@/components/ui/SearchFilter';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import DepartmentForm from '@/components/admin/DepartmentForm';
import DepartmentDetailsModal from '@/components/admin/DepartmentDetailsModal';
import DepartmentHierarchyModal from '@/components/admin/DepartmentHierarchyModal';

export default function DepartmentsPage() {
  const { user } = useAuthStore();
  const router = useRouter();

  const [departments, setDepartments] = useState<Department[]>([]);
  const [filteredDepartments, setFilteredDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    let filtered = [...departments];

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (dept) =>
          dept.departmentName.toLowerCase().includes(search) ||
          dept.departmentCode.toLowerCase().includes(search) ||
          dept.departmentHeadName?.toLowerCase().includes(search)
      );
    }

    // Status filter
    if (statusFilter) {
      filtered = filtered.filter((dept) => dept.status === statusFilter);
    }

    // Type filter
    if (typeFilter) {
      filtered = filtered.filter((dept) => dept.departmentType === typeFilter);
    }

    setFilteredDepartments(filtered);
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
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-gray-600">Loading departments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Departments Management</h1>
            <p className="mt-2 text-gray-600">Manage hospital departments and their hierarchies</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowHierarchy(true)}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
            >
              📊 View Hierarchy
            </button>
            <button
              onClick={handleCreate}
              className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
            >
              + Create Department
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-300 bg-red-50 p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

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

        {/* Stats */}
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-sm text-gray-600">Total Departments</p>
            <p className="mt-1 text-2xl font-semibold text-gray-900">{departments.length}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-sm text-gray-600">Active</p>
            <p className="mt-1 text-2xl font-semibold text-green-600">
              {departments.filter((d) => d.status === 'Active').length}
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-sm text-gray-600">Total Staff</p>
            <p className="mt-1 text-2xl font-semibold text-blue-600">
              {departments.reduce((sum, d) => sum + ((d as any).staffCount || d.totalStaff || 0), 0)}
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-sm text-gray-600">With Sub-departments</p>
            <p className="mt-1 text-2xl font-semibold text-purple-600">
              {departments.filter((d) => (d.totalSubDepartments || 0) > 0).length}
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
                  {filteredDepartments.map((department) => (
                    <tr key={department.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{department.departmentName}</p>
                          <p className="text-sm text-gray-500">{department.departmentCode}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-700">{department.departmentType}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-700">
                          {department.departmentHeadName || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-gray-900">
                          {(department as any).staffCount || department.totalStaff || 0}
                        </span>
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
                            className="text-blue-600 hover:text-blue-700"
                            title="View Details"
                          >
                            👁️
                          </button>
                          <button
                            onClick={() => handleEdit(department)}
                            className="text-gray-600 hover:text-gray-700"
                            title="Edit"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDelete(department)}
                            className="text-red-600 hover:text-red-700"
                            title="Delete"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
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
