'use client';

import { useAuthStore } from '@/lib/auth-store';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { rolesApi, getApi } from '@/lib/api';
import PermissionAssignmentModal from '@/components/admin/PermissionAssignmentModal';

interface Role {
  id: string;
  name: string;
  description: string;
  isActive?: boolean;
  userCount?: number;
  users?: Array<{ id: string; firstName: string; lastName: string; email: string }>;
  permissions?: string[];
}

export default function RolesPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [expandedRole, setExpandedRole] = useState<string | null>(null);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [permissionRole, setPermissionRole] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    if (user) {
      loadRoles();
    }
  }, [user]);

  const loadRoles = async () => {
    try {
      setLoading(true);
      const response = await rolesApi.getAllWithUserCount();
      setRoles(response.data || []);
    } catch (err: any) {
      console.error('Error loading roles:', err);
      setError('Failed to load roles');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.name.trim()) {
      setError('Role name is required');
      return;
    }

    try {
      await getApi().post('/roles', formData);
      setSuccess('Role created successfully');
      setShowCreateModal(false);
      setFormData({ name: '', description: '' });
      loadRoles();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create role');
    }
  };

  const handleEdit = (role: Role) => {
    setSelectedRole(role);
    setFormData({ name: role.name, description: role.description });
    setShowCreateModal(true);
  };

  const handleDelete = async (roleId: string) => {
    if (!confirm('Are you sure you want to delete this role?')) return;

    try {
      await getApi().delete(`/roles/${roleId}`);
      setSuccess('Role deleted successfully');
      loadRoles();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete role');
    }
  };

  const handleManagePermissions = (role: Role) => {
    setPermissionRole({ id: role.id, name: role.name });
    setShowPermissionModal(true);
  };

  const handlePermissionsUpdated = () => {
    setSuccess('Permissions updated successfully');
    loadRoles();
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleCloneRole = async (role: Role) => {
    const newName = prompt(`Enter name for cloned role (original: ${role.name}):`, `${role.name} (Copy)`);
    if (!newName || !newName.trim()) return;

    try {
      await rolesApi.cloneRole(role.id, { name: newName.trim(), description: role.description });
      setSuccess('Role cloned successfully');
      loadRoles();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to clone role');
    }
  };

  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    role.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Role Management</h1>
            <p className="text-gray-600 mt-2">Manage roles and permissions</p>
          </div>
          <button
            onClick={() => {
              setSelectedRole(null);
              setFormData({ name: '', description: '' });
              setShowCreateModal(true);
            }}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            + Create Role
          </button>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
            {error}
            <button onClick={() => setError('')} className="float-right font-bold">×</button>
          </div>
        )}

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search roles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User Count
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
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
                        <div className="font-medium text-gray-900">{role.name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600">{role.description || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => setExpandedRole(expandedRole === role.id ? null : role.id)}
                          className="flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-800"
                        >
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                            {role.userCount || 0} users
                          </span>
                          <span className="text-xs">{expandedRole === role.id ? '▼' : '▶'}</span>
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          role.isActive !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {role.isActive !== false ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEdit(role)}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleManagePermissions(role)}
                          className="text-green-600 hover:text-green-900 mr-4"
                        >
                          Permissions
                        </button>
                        <button
                          onClick={() => handleCloneRole(role)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          Clone
                        </button>
                        <button
                          onClick={() => handleDelete(role.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-6">
              {selectedRole ? 'Edit Role' : 'Create New Role'}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="e.g., Doctor, Nurse, Admin"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Describe the role's responsibilities..."
                  rows={3}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setSelectedRole(null);
                  setFormData({ name: '', description: '' });
                  setError('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                {selectedRole ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

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
