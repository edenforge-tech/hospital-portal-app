'use client';

import { useCachedAuthStore } from '@/lib/permission-cache';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { permissionsApi, rolesApi } from '@/lib/api';

interface Permission {
  id: string;
  code: string;
  name: string;
  description: string;
  module: string;
  resourceType: string;
  action: string;
  scope: string;
  isSystemPermission: boolean;
  isActive: boolean;
}

interface Role {
  id: string;
  name: string;
  description: string;
  userCount?: number;
}

interface PermissionMatrix {
  permissions: Permission[];
  roles: Role[];
  assignments: { [roleId: string]: string[] }; // roleId -> permissionIds
}

export default function PermissionsPage() {
  const { user } = useCachedAuthStore();
  const router = useRouter();
  const [matrix, setMatrix] = useState<PermissionMatrix | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModule, setSelectedModule] = useState<string>('all');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set());
  const [selectedRoles, setSelectedRoles] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (user) {
      loadPermissionMatrix();
    }
  }, [user]);

  const loadPermissionMatrix = async () => {
    try {
      setLoading(true);
      
      // Load all permissions
      const permissionsResponse = await permissionsApi.getAll();
      const allPermissions = permissionsResponse.data?.permissions || [];
      
      // Load all roles
      const rolesResponse = await rolesApi.getAllWithUserCount();
      const allRoles = rolesResponse.data || [];
      
      // Load assignments for each role (in parallel for efficiency)
      const assignmentPromises = allRoles.map(role => 
        rolesApi.getRolePermissions(role.id).catch(() => ({ data: [] }))
      );
      const assignmentResponses = await Promise.all(assignmentPromises);
      
      // Build assignments dictionary
      const assignments: { [roleId: string]: string[] } = {};
      allRoles.forEach((role, index) => {
        assignments[role.id] = assignmentResponses[index].data?.map((p: any) => p.id) || [];
      });
      
      setMatrix({
        permissions: allPermissions,
        roles: allRoles,
        assignments
      });
    } catch (err: any) {
      console.error('Error loading permission matrix:', err);
      setError('Failed to load permission matrix');
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionToggle = (roleId: string, permissionId: string) => {
    if (!matrix) return;

    const newMatrix = { ...matrix };
    const roleAssignments = newMatrix.assignments[roleId] || [];

    if (roleAssignments.includes(permissionId)) {
      newMatrix.assignments[roleId] = roleAssignments.filter(id => id !== permissionId);
    } else {
      newMatrix.assignments[roleId] = [...roleAssignments, permissionId];
    }

    setMatrix(newMatrix);
  };

  const handleBulkAssign = async () => {
    if (!matrix || selectedPermissions.size === 0 || selectedRoles.size === 0) return;

    setSaving(true);
    try {
      const updates: { roleId: string; permissionIds: string[] }[] = [];

      for (const roleId of selectedRoles) {
        const currentAssignments = matrix.assignments[roleId] || [];
        const newPermissions = Array.from(selectedPermissions).filter(
          permId => !currentAssignments.includes(permId)
        );

        if (newPermissions.length > 0) {
          updates.push({
            roleId,
            permissionIds: [...currentAssignments, ...newPermissions]
          });
        }
      }

      // Apply all updates
      for (const update of updates) {
        await rolesApi.assignPermissions(update.roleId, update.permissionIds);
      }

      setSuccess(`Bulk assigned ${selectedPermissions.size} permissions to ${selectedRoles.size} roles`);
      setSelectedPermissions(new Set());
      setSelectedRoles(new Set());
      loadPermissionMatrix();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to assign permissions');
    } finally {
      setSaving(false);
    }
  };

  const handleBulkRemove = async () => {
    if (!matrix || selectedPermissions.size === 0 || selectedRoles.size === 0) return;

    setSaving(true);
    try {
      const updates: { roleId: string; permissionIds: string[] }[] = [];

      for (const roleId of selectedRoles) {
        const currentAssignments = matrix.assignments[roleId] || [];
        const remainingPermissions = currentAssignments.filter(
          permId => !selectedPermissions.has(permId)
        );

        updates.push({
          roleId,
          permissionIds: remainingPermissions
        });
      }

      // Apply all updates
      for (const update of updates) {
        await rolesApi.assignPermissions(update.roleId, update.permissionIds);
      }

      setSuccess(`Bulk removed ${selectedPermissions.size} permissions from ${selectedRoles.size} roles`);
      setSelectedPermissions(new Set());
      setSelectedRoles(new Set());
      loadPermissionMatrix();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to remove permissions');
    } finally {
      setSaving(false);
    }
  };

  const togglePermissionSelection = (permissionId: string) => {
    setSelectedPermissions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(permissionId)) {
        newSet.delete(permissionId);
      } else {
        newSet.add(permissionId);
      }
      return newSet;
    });
  };

  const toggleRoleSelection = (roleId: string) => {
    setSelectedRoles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(roleId)) {
        newSet.delete(roleId);
      } else {
        newSet.add(roleId);
      }
      return newSet;
    });
  };

  const selectAllPermissions = () => {
    setSelectedPermissions(new Set(filteredPermissions.map(p => p.id)));
  };

  const clearAllPermissions = () => {
    setSelectedPermissions(new Set());
  };

  const selectAllRoles = () => {
    setSelectedRoles(new Set(matrix?.roles.map(r => r.id) || []));
  };

  const clearAllRoles = () => {
    setSelectedRoles(new Set());
  };

  const filteredPermissions = matrix?.permissions.filter(p =>
    (selectedModule === 'all' || p.module === selectedModule) &&
    (p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
     p.code.toLowerCase().includes(searchQuery.toLowerCase()))
  ) || [];

  const modules = [...new Set(matrix?.permissions.map(p => p.module) || [])];

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading permissions matrix...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Permissions Management</h1>
            <p className="text-gray-600 mt-2">Manage permissions and bulk assignments across roles</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleBulkAssign}
              disabled={saving || selectedPermissions.size === 0 || selectedRoles.size === 0}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Assigning...' : `Assign to ${selectedRoles.size} Roles`}
            </button>
            <button
              onClick={handleBulkRemove}
              disabled={saving || selectedPermissions.size === 0 || selectedRoles.size === 0}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Removing...' : `Remove from ${selectedRoles.size} Roles`}
            </button>
          </div>
        </div>

                  {/* Bulk Selection Controls */}
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">Bulk Operations</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-blue-800 mb-2">Permissions ({selectedPermissions.size} selected)</h4>
                <div className="flex gap-2">
                  <button
                    onClick={selectAllPermissions}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  >
                    Select All
                  </button>
                  <button
                    onClick={clearAllPermissions}
                    className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
                  >
                    Clear All
                  </button>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-blue-800 mb-2">Roles ({selectedRoles.size} selected)</h4>
                <div className="flex gap-2">
                  <button
                    onClick={selectAllRoles}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  >
                    Select All
                  </button>
                  <button
                    onClick={clearAllRoles}
                    className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
                  >
                    Clear All
                  </button>
                </div>
              </div>
            </div>
          </div>
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

        {/* Filters */}
        <div className="mb-6 flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search permissions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div>
            <select
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Modules</option>
              {modules.map(module => (
                <option key={module} value={module}>{module}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Permission Matrix */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50">
                    Permission
                  </th>
                  {matrix?.roles.map(role => (
                    <th key={role.id} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                      <div className="flex flex-col items-center gap-1">
                        <input
                          type="checkbox"
                          checked={selectedRoles.has(role.id)}
                          onChange={() => toggleRoleSelection(role.id)}
                          className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          title="Select role for bulk operation"
                        />
                        <div className="text-center">
                          {role.name}
                          <br />
                          <span className="text-xs text-gray-400">({role.userCount || 0} users)</span>
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPermissions.map((permission) => (
                  <tr key={permission.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 sticky left-0 bg-white border-r border-gray-200">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedPermissions.has(permission.id)}
                          onChange={() => togglePermissionSelection(permission.id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          title="Select for bulk operation"
                        />
                        <div>
                          <div className="font-medium text-gray-900">{permission.name}</div>
                          <div className="text-sm text-gray-500">{permission.code}</div>
                          <div className="text-xs text-gray-400 mt-1">
                            {permission.module} • {permission.resourceType} • {permission.action}
                          </div>
                          {permission.description && (
                            <div className="text-xs text-gray-600 mt-1">{permission.description}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    {matrix?.roles.map(role => {
                      const isAssigned = (matrix.assignments[role.id] || []).includes(permission.id);

                      return (
                        <td key={role.id} className="px-6 py-4 text-center">
                          <input
                            type="checkbox"
                            checked={isAssigned}
                            onChange={() => handlePermissionToggle(role.id, permission.id)}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredPermissions.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔐</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No Permissions Found</h3>
              <p className="text-gray-600">
                {searchQuery || selectedModule !== 'all' ? 'Try adjusting your filters' : 'No permissions available'}
              </p>
            </div>
          )}
        </div>

        {/* Statistics */}
        {matrix && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Permissions</h3>
              <p className="text-3xl font-bold text-indigo-600">{matrix.permissions.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Roles</h3>
              <p className="text-3xl font-bold text-green-600">{matrix.roles.length}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}