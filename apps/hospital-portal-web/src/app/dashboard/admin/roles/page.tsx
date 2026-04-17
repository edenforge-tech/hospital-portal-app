'use client';

import { useAuthStore } from '@/lib/auth-store';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ConfirmationDialog } from '@/components/common/ConfirmationDialog';
import { rolesApi, getApi } from '@/lib/api';
import PermissionAssignmentModal from '@/components/admin/PermissionAssignmentModal';
import ParentRoleSelector from '@/components/admin/ParentRoleSelector';
import { EditButton, PermissionsButton, CloneButton, DeleteButton, PrimaryButton, SecondaryButton } from '@/components/ui/ActionButtons';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { UserCountBadge } from '@/components/ui/UserCountBadge';

interface Role {
  id: string;
  name: string;
  description: string;
  isActive?: boolean;
  userCount?: number;
  users?: Array<{ id: string; firstName: string; lastName: string; email: string }>;
  permissions?: string[];
  parentRoleId?: string | null;
  hierarchyLevel?: number;
}

type SortField = 'name' | 'description' | 'userCount' | 'status';
type SortOrder = 'asc' | 'desc';

export default function RolesPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '', parentRoleId: null as string | null });
  const [formErrors, setFormErrors] = useState<{ name?: string; description?: string; parentRoleId?: string }>({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [expandedRole, setExpandedRole] = useState<string | null>(null);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [permissionRole, setPermissionRole] = useState<{ id: string; name: string } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    if (user) {
      loadRoles();
    }
  }, [user]);

  const loadRoles = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await rolesApi.getAllWithUserCount();
      setRoles(response.data || []);
    } catch (err: any) {
      console.error('Error loading roles:', err);
      setError(err.response?.data?.message || 'Failed to load roles. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: { name?: string; description?: string } = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Role name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Role name must be at least 2 characters';
    } else if (formData.name.trim().length > 50) {
      errors.name = 'Role name must not exceed 50 characters';
    } else if (!/^[a-zA-Z0-9\s\-_]+$/.test(formData.name)) {
      errors.name = 'Role name can only contain letters, numbers, spaces, hyphens, and underscores';
    }

    // Check for duplicate role name
    const isDuplicate = roles.some(
      role => role.name.toLowerCase() === formData.name.trim().toLowerCase() && 
      (!selectedRole || role.id !== selectedRole.id)
    );
    if (isDuplicate) {
      errors.name = 'A role with this name already exists';
    }

    if (formData.description && formData.description.length > 500) {
      errors.description = 'Description must not exceed 500 characters';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreate = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    setError('');

    try {
      if (selectedRole) {
        // Update existing role
        await getApi().put(`/roles/${selectedRole.id}`, {
          name: formData.name.trim(),
          description: formData.description.trim(),
          parentRoleId: formData.parentRoleId
        });
        setSuccess('Role updated successfully');
      } else {
        // Create new role
        await getApi().post('/roles', {
          name: formData.name.trim(),
          description: formData.description.trim(),
          parentRoleId: formData.parentRoleId
        });
        setSuccess('Role created successfully');
      }
      
      setShowCreateModal(false);
      setFormData({ name: '', description: '', parentRoleId: null });
      setFormErrors({});
      setSelectedRole(null);
      await loadRoles();
      setTimeout(() => setSuccess(''), 5000);
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to ${selectedRole ? 'update' : 'create'} role`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (role: Role) => {
    setSelectedRole(role);
    setFormData({ 
      name: role.name, 
      description: role.description || '',
      parentRoleId: role.parentRoleId || null
    });
    setFormErrors({});
    setError('');
    setShowCreateModal(true);
  };

  const handleDelete = async (roleId: string, roleName: string) => {
    setShowDeleteConfirm(null);
    setIsSubmitting(true);
    setError('');

    try {
      await getApi().delete(`/roles/${roleId}`);
      setSuccess(`Role "${roleName}" deleted successfully`);
      await loadRoles();
      setTimeout(() => setSuccess(''), 5000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete role. This role may be assigned to users.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleManagePermissions = (role: Role) => {
    setPermissionRole({ id: role.id, name: role.name });
    setShowPermissionModal(true);
  };

  const handlePermissionsUpdated = () => {
    setSuccess('Permissions updated successfully');
    loadRoles();
    setTimeout(() => setSuccess(''), 5000);
  };

  const handleCloneRole = async (role: Role) => {
    const newName = prompt(`Enter name for cloned role (original: ${role.name}):`, `${role.name} (Copy)`);
    if (!newName || !newName.trim()) return;

    setIsSubmitting(true);
    setError('');

    try {
      await rolesApi.cloneRole(role.id, { 
        name: newName.trim(), 
        description: role.description ? `${role.description} (Cloned)` : ''
      });
      setSuccess(`Role "${newName}" cloned successfully`);
      await loadRoles();
      setTimeout(() => setSuccess(''), 5000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to clone role');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const getSortedAndFilteredRoles = () => {
    let filtered = roles.filter(role => {
      // Search filter
      const matchesSearch = !searchQuery || 
        role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        role.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Status filter
      const matchesStatus = filterStatus === 'all' ||
        (filterStatus === 'active' && role.isActive !== false) ||
        (filterStatus === 'inactive' && role.isActive === false);
      
      return matchesSearch && matchesStatus;
    });

    // Sort
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortField) {
        case 'name':
          aValue = (a.name || '').toLowerCase();
          bValue = (b.name || '').toLowerCase();
          break;
        case 'description':
          aValue = (a.description || '').toLowerCase();
          bValue = (b.description || '').toLowerCase();
          break;
        case 'userCount':
          aValue = a.userCount || 0;
          bValue = b.userCount || 0;
          break;
        case 'status':
          aValue = a.isActive !== false ? 1 : 0;
          bValue = b.isActive !== false ? 1 : 0;
          break;
        default:
          return 0;
      }
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  };

  const filteredRoles = getSortedAndFilteredRoles();

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) return <span className="text-gray-400">↕</span>;
    return sortOrder === 'asc' ? <span>↑</span> : <span>↓</span>;
  };

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading roles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="w-full">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Role Management</h1>
            <p className="text-gray-600 mt-2">Manage roles and permissions</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/dashboard/admin/roles/management')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              🏗️ Role Hierarchy
            </button>
            <PrimaryButton
              onClick={() => {
                setSelectedRole(null);
                setFormData({ name: '', description: '', parentRoleId: null });
                setShowCreateModal(true);
              }}
            >
              + Create Role
            </PrimaryButton>
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-4 bg-green-50 border-l-4 border-green-500 text-green-800 px-4 py-3 rounded-lg flex justify-between items-center shadow-sm">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>{success}</span>
            </div>
            <button onClick={() => setSuccess('')} className="text-green-800 hover:text-green-900 font-bold">×</button>
          </div>
        )}
        {error && (
          <div className="mb-4 bg-red-50 border-l-4 border-red-500 text-red-800 px-4 py-3 rounded-lg flex justify-between items-center shadow-sm">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
            <button onClick={() => setError('')} className="text-red-800 hover:text-red-900 font-bold">×</button>
          </div>
        )}

        {/* Search and Filters */}
        <div className="mb-6 flex gap-4 flex-wrap">
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'inactive')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
            <span className="font-medium">{filteredRoles.length}</span>
            <span>role{filteredRoles.length !== 1 ? 's' : ''} found</span>
          </div>
        </div>

        {/* Roles Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <p className="mt-2 text-gray-600">Loading roles...</p>
            </div>
          ) : filteredRoles.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔐</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No Roles Found</h3>
              <p className="text-gray-600 mb-4">
                {searchQuery ? 'Try a different search term' : 'Create your first role to get started'}
              </p>
              {!searchQuery && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
                >
                  Create Role
                </button>
              )}
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center gap-2">
                      <span>Role Name</span>
                      {renderSortIcon('name')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('description')}
                  >
                    <div className="flex items-center gap-2">
                      <span>Description</span>
                      {renderSortIcon('description')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('userCount')}
                  >
                    <div className="flex items-center gap-2">
                      <span>User Count</span>
                      {renderSortIcon('userCount')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center gap-2">
                      <span>Status</span>
                      {renderSortIcon('status')}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRoles.map((role) => (
                  <>
                    <tr key={role.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{role.name || role.description || 'Unnamed Role'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600">{role.description || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <UserCountBadge 
                            count={role.userCount || 0}
                            onClick={() => setExpandedRole(expandedRole === role.id ? null : role.id)}
                          />
                          {(role.userCount || 0) > 0 && (
                            <span className="text-xs text-gray-400">{expandedRole === role.id ? '▼' : '▶'}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={role.isActive !== false ? 'Active' : 'Inactive'} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-3">
                          <EditButton onClick={() => handleEdit(role)} disabled={isSubmitting} />
                          <PermissionsButton onClick={() => handleManagePermissions(role)} disabled={isSubmitting} />
                          <CloneButton onClick={() => handleCloneRole(role)} disabled={isSubmitting} />
                          <DeleteButton onClick={() => setShowDeleteConfirm(role.id)} disabled={isSubmitting} />
                        </div>
                      </td>
                    </tr>
                    {expandedRole === role.id && role.users && role.users.length > 0 && (
                      <tr className="bg-gray-50">
                        <td colSpan={5} className="px-6 py-4">
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-700 mb-2">Assigned Users:</p>
                            <div className="grid grid-cols-2 gap-2">
                              {role.users.map((u) => (
                                <div key={u.id} className="flex items-center gap-2 text-sm text-gray-600 bg-white px-3 py-2 rounded border">
                                  <span className="font-medium">{u.firstName} {u.lastName}</span>
                                  <span className="text-gray-400">•</span>
                                  <span className="text-xs">{u.email}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {selectedRole ? 'Edit Role' : 'Create New Role'}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {selectedRole ? 'Update role information' : 'Add a new role to the system'}
              </p>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    setFormErrors({ ...formErrors, name: undefined });
                  }}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                    formErrors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Doctor, Nurse, Admin"
                  maxLength={50}
                  disabled={isSubmitting}
                />
                {formErrors.name && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  {formData.name.length}/50 characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => {
                    setFormData({ ...formData, description: e.target.value });
                    setFormErrors({ ...formErrors, description: undefined });
                  }}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none ${
                    formErrors.description ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Describe the role's responsibilities and purpose..."
                  rows={4}
                  maxLength={500}
                  disabled={isSubmitting}
                />
                {formErrors.description && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.description}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  {formData.description.length}/500 characters
                </p>
              </div>

              {/* Parent Role Selector */}
              <ParentRoleSelector
                value={formData.parentRoleId}
                onChange={(parentRoleId) => {
                  setFormData({ ...formData, parentRoleId });
                  setFormErrors({ ...formErrors, parentRoleId: undefined });
                }}
                currentRoleId={selectedRole?.id}
                disabled={isSubmitting}
                error={formErrors.parentRoleId}
              />

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-3 py-2 rounded text-sm">
                  {error}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex gap-3">
              <SecondaryButton
                onClick={() => {
                  setShowCreateModal(false);
                  setSelectedRole(null);
                  setFormData({ name: '', description: '', parentRoleId: null });
                  setFormErrors({});
                  setError('');
                }}
                disabled={isSubmitting}
              >
                Cancel
              </SecondaryButton>
              <PrimaryButton
                onClick={handleCreate}
                disabled={isSubmitting || !formData.name.trim()}
                loading={isSubmitting}
              >
                {selectedRole ? 'Update Role' : 'Create Role'}
              </PrimaryButton>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationDialog
        isOpen={!!showDeleteConfirm}
        title="Delete Role?"
        message="This action cannot be undone. Users assigned to this role will lose their permissions."
        variant="danger"
        confirmText="Delete Role"
        cancelText="Cancel"
        isLoading={isSubmitting}
        onConfirm={() => {
          const role = roles.find(r => r.id === showDeleteConfirm);
          if (role) handleDelete(role.id, role.name);
        }}
        onClose={() => setShowDeleteConfirm(null)}
      />

      {/* Permission Assignment Modal */}
      {showPermissionModal && permissionRole && (
        <PermissionAssignmentModal
          isOpen={showPermissionModal}
          onClose={() => {
            setShowPermissionModal(false);
            setPermissionRole(null);
          }}
          roleId={permissionRole.id}
          roleName={permissionRole.name}
          onPermissionsUpdated={handlePermissionsUpdated}
        />
      )}
    </div>
  );
}
