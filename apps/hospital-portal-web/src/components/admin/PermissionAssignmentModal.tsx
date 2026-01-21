'use client';

import { useState, useEffect } from 'react';
import { getApi, permissionsApi, rolesApi } from '@/lib/api';

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

interface PermissionGroup {
  module: string;
  permissions: Permission[];
}

interface PermissionAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  roleId: string;
  roleName: string;
  onPermissionsUpdated: () => void;
}

export default function PermissionAssignmentModal({
  isOpen,
  onClose,
  roleId,
  roleName,
  onPermissionsUpdated,
}: PermissionAssignmentModalProps) {
  const [permissions, setPermissions] = useState<PermissionGroup[]>([]);
  const [assignedPermissions, setAssignedPermissions] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModule, setSelectedModule] = useState<string>('all');

  useEffect(() => {
    if (isOpen && roleId) {
      loadPermissionsAndAssignments();
    }
  }, [isOpen, roleId]);

  const loadPermissionsAndAssignments = async () => {
    setLoading(true);
    try {
      // Load all permissions grouped by module
      const permissionsResponse = await permissionsApi.getAllGrouped();
      
      // Backend returns Dictionary<string, ModulePermissionsDto>, convert to array
      const permissionsData = permissionsResponse.data;
      if (permissionsData && typeof permissionsData === 'object') {
        const permissionGroups: PermissionGroup[] = Object.entries(permissionsData).map(([moduleName, moduleData]: [string, any]) => ({
          module: moduleName,
          permissions: (moduleData.permissions || []).map((p: any) => ({
            ...p,
            id: (p.id || p.Id)?.toString().toLowerCase()  // Normalize to lowercase string
          }))
        }));
        console.log('✅ Loaded permission groups:', permissionGroups.length);
        setPermissions(permissionGroups);
      } else {
        console.log('❌ No permissions data');
        setPermissions([]);
      }

      // Load current role permissions
      const rolePermissionsResponse = await rolesApi.getRolePermissions(roleId);
      const assignedData = rolePermissionsResponse.data || [];
      
      // Normalize IDs to lowercase strings for consistent comparison
      const assignedIds = assignedData.map((p: any) => (p.id || p.Id)?.toString().toLowerCase());
      
      console.log('✅ Role has', assignedIds.length, 'assigned permissions');
      console.log('📋 Assigned IDs:', assignedIds);
      
      setAssignedPermissions(new Set(assignedIds));
    } catch (error) {
      console.error('❌ Error loading permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionToggle = (permissionId: string) => {
    const newAssigned = new Set(assignedPermissions);
    if (newAssigned.has(permissionId)) {
      newAssigned.delete(permissionId);
    } else {
      newAssigned.add(permissionId);
    }
    setAssignedPermissions(newAssigned);
  };

  const handleModuleToggle = (moduleName: string, modulePermissions: Permission[]) => {
    const newAssigned = new Set(assignedPermissions);
    const allAssigned = modulePermissions.every(p => newAssigned.has(p.id));
    const noneAssigned = modulePermissions.every(p => !newAssigned.has(p.id));

    if (allAssigned) {
      // Remove all permissions from this module
      modulePermissions.forEach(p => newAssigned.delete(p.id));
    } else {
      // Add all permissions from this module
      modulePermissions.forEach(p => newAssigned.add(p.id));
    }

    setAssignedPermissions(newAssigned);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const permissionIds = Array.from(assignedPermissions);
      console.log('💾 Saving', permissionIds.length, 'permissions');
      await rolesApi.assignPermissions(roleId, permissionIds);
      onPermissionsUpdated();
      onClose();
    } catch (error) {
      console.error('❌ Error saving permissions:', error);
      alert('Failed to save permissions. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const filteredPermissions = permissions
    .map(group => ({
      ...group,
      permissions: group.permissions.filter(p =>
        (selectedModule === 'all' || group.module === selectedModule) &&
        (searchQuery === '' ||
         p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
         p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
         p.description?.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }))
    .filter(group => group.permissions.length > 0);

  const uniqueModules = Array.from(new Set(permissions.map(g => g.module)));

  // Format module name for display
  const formatModuleName = (moduleName: string) => {
    return moduleName
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Manage Permissions for {roleName}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Assign or remove permissions from this role
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search permissions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <select
                value={selectedModule}
                onChange={(e) => setSelectedModule(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="all">All Modules</option>
                {uniqueModules.sort().map(module => (
                  <option key={module} value={module}>{formatModuleName(module)}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto max-h-[60vh]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <span className="ml-2 text-gray-600">Loading permissions...</span>
            </div>
          ) : (
            <div className="p-6 space-y-6">
              {filteredPermissions.map((group) => (
                <div key={group.module} className="border border-gray-200 rounded-lg">
                  {/* Module Header */}
                  <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={group.permissions.every(p => assignedPermissions.has(p.id))}
                          ref={(el) => {
                            if (el) {
                              const someChecked = group.permissions.some(p => assignedPermissions.has(p.id));
                              const allChecked = group.permissions.every(p => assignedPermissions.has(p.id));
                              el.indeterminate = someChecked && !allChecked;
                            }
                          }}
                          onChange={() => handleModuleToggle(group.module, group.permissions)}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <h3 className="text-lg font-medium text-gray-900">
                          {formatModuleName(group.module)}
                        </h3>
                        <span className="text-sm text-gray-500">
                          ({group.permissions.filter(p => assignedPermissions.has(p.id)).length}/{group.permissions.length} selected)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Permissions List */}
                  <div className="p-4 space-y-3">
                    {group.permissions.map((permission) => (
                      <div key={permission.id} className="flex items-start gap-3 p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
                        <input
                          type="checkbox"
                          checked={assignedPermissions.has(permission.id)}
                          onChange={() => handlePermissionToggle(permission.id)}
                          className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{permission.name}</h4>
                          {permission.description && (
                            <p className="text-sm text-gray-600 mt-1">
                              {permission.description.replace(/billing_revenue/g, 'Billing Revenue')
                                .replace(/patient_management/g, 'Patient Management')
                                .replace(/clinical_documentation/g, 'Clinical Documentation')
                                .replace(/lab_diagnostics/g, 'Lab Diagnostics')
                                .replace(/ot_management/g, 'OT Management')
                                .replace(/vendor_procurement/g, 'Vendor Procurement')
                                .replace(/bed_management/g, 'Bed Management')
                                .replace(/document_sharing/g, 'Document Sharing')
                                .replace(/system_settings/g, 'System Settings')
                                .replace(/quality_assurance/g, 'Quality Assurance')
                                .replace(/_/g, ' ')}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {filteredPermissions.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">🔍</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No permissions found</h3>
                  <p className="text-gray-600">
                    {searchQuery ? 'Try a different search term' : 'No permissions available'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {Array.from(assignedPermissions).filter(id => 
                permissions.some(g => g.permissions.some(p => p.id === id))
              ).length} permission{assignedPermissions.size !== 1 ? 's' : ''} selected
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save Permissions'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}