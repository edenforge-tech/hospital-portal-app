'use client';

import { useState, useEffect } from 'react';
import { usersApi, rolesApi } from '@/lib/api';

interface Role {
  id: string;
  name: string;
  description: string;
}

interface UserRole {
  roleId: string;
  roleName: string;
  description: string;
  branchId: string;
  assignedAt: string;
}

interface RoleManagementModalProps {
  userId: string;
  userName: string;
  isOpen: boolean;
  onClose: () => void;
  onRoleUpdated: () => void;
}

export default function RoleManagementModal({ userId, userName, isOpen, onClose, onRoleUpdated }: RoleManagementModalProps) {
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [error, setError] = useState('');

  const fetchUserRoles = async () => {
    try {
      const res = await usersApi.getUserRoles(userId);
      setUserRoles(res.data || []);
    } catch (err: any) {
      setError('Failed to fetch user roles');
    }
  };

  const fetchAvailableRoles = async () => {
    try {
      const res = await rolesApi.getAll();
      setAvailableRoles(res.data || []);
    } catch (err: any) {
      setError('Failed to fetch available roles');
    }
  };

  const assignRole = async () => {
    if (!selectedRoleId) return;
    
    setLoading(true);
    try {
      await usersApi.assignRole(userId, selectedRoleId);
      setSelectedRoleId('');
      await fetchUserRoles();
      onRoleUpdated();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to assign role');
    } finally {
      setLoading(false);
    }
  };

  const removeRole = async (roleId: string, branchId?: string) => {
    setLoading(true);
    try {
      await usersApi.removeRole(userId, roleId, branchId);
      await fetchUserRoles();
      onRoleUpdated();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to remove role');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchUserRoles();
      fetchAvailableRoles();
    }
  }, [isOpen, userId]);

  const availableRolesFiltered = availableRoles.filter(
    role => !userRoles.some(ur => ur.roleId === role.id)
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Manage Roles - {userName}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-4">
            {error}
          </div>
        )}

        {/* Current Roles */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">Current Roles</h3>
          {userRoles.length === 0 ? (
            <p className="text-gray-500">No roles assigned</p>
          ) : (
            <div className="space-y-2">
              {userRoles.map((userRole) => (
                <div key={`${userRole.roleId}-${userRole.branchId}`} className="flex items-center justify-between bg-blue-50 p-3 rounded border">
                  <div>
                    <span className="font-medium text-blue-800">{userRole.roleName}</span>
                    {userRole.description && (
                      <p className="text-sm text-blue-600">{userRole.description}</p>
                    )}
                    <p className="text-xs text-gray-500">
                      Assigned: {new Date(userRole.assignedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => removeRole(userRole.roleId, userRole.branchId)}
                    disabled={loading}
                    className="text-red-600 hover:text-red-800 px-3 py-1 border border-red-300 rounded text-sm disabled:opacity-50"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Assign New Role */}
        <div className="mb-4">
          <h3 className="text-lg font-medium mb-3">Assign New Role</h3>
          <div className="flex gap-2">
            <select
              value={selectedRoleId}
              onChange={(e) => setSelectedRoleId(e.target.value)}
              className="flex-1 border border-gray-300 rounded px-3 py-2"
              disabled={loading}
            >
              <option value="">Select a role...</option>
              {availableRolesFiltered.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name} {role.description && `- ${role.description}`}
                </option>
              ))}
            </select>
            <button
              onClick={assignRole}
              disabled={!selectedRoleId || loading}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Assigning...' : 'Assign'}
            </button>
          </div>
          {availableRolesFiltered.length === 0 && userRoles.length > 0 && (
            <p className="text-gray-500 text-sm mt-2">All available roles are already assigned</p>
          )}
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}