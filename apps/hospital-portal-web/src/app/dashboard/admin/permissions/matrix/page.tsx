'use client';

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import { permissionsApi, rolesApi } from '@/lib/api';
import { PermissionMatrix } from '@/components/admin/PermissionMatrix';
import { ArrowLeft, Download, RefreshCw } from 'lucide-react';
import Link from 'next/link';

interface Permission {
  id: string;
  code: string;
  name: string;
  module: string;
  action: string;
  description?: string;
}

interface Role {
  id: string;
  name: string;
  description?: string;
  userCount?: number;
  isActive?: boolean;
}

export default function PermissionMatrixPage() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [rolePermissions, setRolePermissions] = useState<Map<string, string[]>>(new Map());
  const [pendingChanges, setPendingChanges] = useState<Array<{ roleId: string; permissionId: string; action: 'add' | 'remove' }>>([]);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      // Load permissions and roles
      const [permsRes, rolesRes] = await Promise.all([
        permissionsApi.getAll(),
        rolesApi.getAllWithUserCount()
      ]);

      const loadedPermissions = permsRes.data?.Permissions || permsRes.data?.permissions || [];
      const validRoles = (rolesRes.data || []).filter((r: any) => r.name && r.name.trim().length > 0);

      setPermissions(loadedPermissions);
      setRoles(validRoles);

      // Load role permissions
      const rolePermMap = new Map<string, string[]>();
      const batchSize = 10;
      
      for (let i = 0; i < validRoles.length; i += batchSize) {
        const batch = validRoles.slice(i, i + batchSize);
        const batchPromises = batch.map(async (role: any) => {
          try {
            const rolePermsRes = await rolesApi.getRolePermissions(role.id);
            return { roleId: role.id, permissions: (rolePermsRes.data || []).map((p: any) => p.id) };
          } catch {
            return { roleId: role.id, permissions: [] };
          }
        });
        
        const batchResults = await Promise.all(batchPromises);
        batchResults.forEach(({ roleId, permissions }) => {
          rolePermMap.set(roleId, permissions);
        });
      }

      setRolePermissions(rolePermMap);
    } catch (err: any) {
      console.error('Error loading matrix data:', err);
      setError(err.response?.data?.message || 'Failed to load permission data');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePermission = (roleId: string, permissionId: string, hasPermission: boolean) => {
    // Update local state immediately for UI responsiveness
    setRolePermissions(prev => {
      const newMap = new Map(prev);
      const rolePerms = [...(newMap.get(roleId) || [])];
      
      if (hasPermission) {
        // Remove permission
        const idx = rolePerms.indexOf(permissionId);
        if (idx > -1) rolePerms.splice(idx, 1);
      } else {
        // Add permission
        if (!rolePerms.includes(permissionId)) {
          rolePerms.push(permissionId);
        }
      }
      
      newMap.set(roleId, rolePerms);
      return newMap;
    });

    // Track pending changes
    setPendingChanges(prev => {
      // Check if there's already a pending change for this role/permission
      const existingIdx = prev.findIndex(c => c.roleId === roleId && c.permissionId === permissionId);
      
      if (existingIdx > -1) {
        // Remove the existing change (they cancel out)
        const newChanges = [...prev];
        newChanges.splice(existingIdx, 1);
        return newChanges;
      } else {
        // Add new change
        return [...prev, { roleId, permissionId, action: hasPermission ? 'remove' : 'add' }];
      }
    });
  };

  const saveChanges = async () => {
    if (pendingChanges.length === 0) return;

    try {
      setSaving(true);
      setError('');

      // Group changes by role
      const changesByRole = new Map<string, { add: string[]; remove: string[] }>();
      pendingChanges.forEach(change => {
        if (!changesByRole.has(change.roleId)) {
          changesByRole.set(change.roleId, { add: [], remove: [] });
        }
        const roleChanges = changesByRole.get(change.roleId)!;
        if (change.action === 'add') {
          roleChanges.add.push(change.permissionId);
        } else {
          roleChanges.remove.push(change.permissionId);
        }
      });

      // Apply changes for each role
      for (const [roleId, changes] of changesByRole) {
        // Get current permissions for this role
        const currentPerms = rolePermissions.get(roleId) || [];
        
        // Calculate new permissions
        const newPerms = [...currentPerms.filter(p => !changes.remove.includes(p)), ...changes.add];
        
        // Update role permissions via API
        await rolesApi.updateRolePermissions(roleId, newPerms);
      }

      setPendingChanges([]);
      setSuccess('Changes saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('Error saving changes:', err);
      setError(err.response?.data?.message || 'Failed to save changes');
      // Reload data to reset state
      loadData();
    } finally {
      setSaving(false);
    }
  };

  const discardChanges = () => {
    setPendingChanges([]);
    loadData();
  };

  const exportMatrix = () => {
    // Create CSV export
    const headers = ['Permission Code', 'Permission Name', 'Module', ...roles.map(r => r.name)];
    const rows = permissions.map(perm => {
      const row = [perm.code, perm.name, perm.module];
      roles.forEach(role => {
        row.push(rolePermissions.get(role.id)?.includes(perm.id) ? 'Yes' : 'No');
      });
      return row;
    });

    const csv = [headers.join(','), ...rows.map(row => row.map(cell => `"${cell}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `permission-matrix-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading permission matrix...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-full">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <Link 
              href="/dashboard/admin/permissions"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Permissions
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Permission Matrix</h1>
          <p className="text-gray-600 mt-1">
            Visual overview of all role-permission assignments ({permissions.length} permissions × {roles.length} roles)
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={exportMatrix}
            className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
          <button
            onClick={loadData}
            className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Pending Changes Banner */}
      {pendingChanges.length > 0 && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-100 rounded-full p-2">
              <span className="text-yellow-700 font-bold">{pendingChanges.length}</span>
            </div>
            <div>
              <p className="font-medium text-yellow-900">Unsaved Changes</p>
              <p className="text-sm text-yellow-700">
                {pendingChanges.filter(c => c.action === 'add').length} additions, 
                {' '}{pendingChanges.filter(c => c.action === 'remove').length} removals
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={discardChanges}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              disabled={saving}
            >
              Discard
            </button>
            <button
              onClick={saveChanges}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}

      {/* Success/Error Messages */}
      {success && (
        <div className="mb-4 bg-green-50 border-l-4 border-green-500 text-green-800 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}
      {error && (
        <div className="mb-4 bg-red-50 border-l-4 border-red-500 text-red-800 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Matrix Component */}
      <PermissionMatrix
        permissions={permissions}
        roles={roles}
        rolePermissions={rolePermissions}
        onTogglePermission={handleTogglePermission}
      />
    </div>
  );
}
