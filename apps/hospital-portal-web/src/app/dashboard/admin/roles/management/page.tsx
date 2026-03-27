'use client';

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import { rolesApi } from '@/lib/api';
import { 
  RoleHierarchyDto, 
  RoleTemplateDto, 
  TemplateCategory,
  CreateRoleFromTemplateRequest,
  UpdateHierarchyRequest,
  InheritanceType 
} from '@/types/roles';
import { RoleTree } from '@/components/roles/RoleTree';
import { RoleTemplateGallery } from '@/components/roles/RoleTemplateGallery';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/Modal';
import { 
  Network, 
  FileTextIcon, 
  PlusIcon, 
  RefreshCwIcon,
  SettingsIcon,
  ChevronRightIcon,
  ShieldCheckIcon
} from 'lucide-react';

export default function RoleManagementPage() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Data states
  const [roleHierarchy, setRoleHierarchy] = useState<RoleHierarchyDto[]>([]);
  const [roleTemplates, setRoleTemplates] = useState<RoleTemplateDto[]>([]);
  const [selectedRole, setSelectedRole] = useState<RoleHierarchyDto | null>(null);
  
  // UI states
  const [activeView, setActiveView] = useState<'hierarchy' | 'templates'>('hierarchy');
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | undefined>(undefined);
  const [showCreateFromTemplate, setShowCreateFromTemplate] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<RoleTemplateDto | null>(null);
  const [showHierarchyEditor, setShowHierarchyEditor] = useState(false);

  // Form states
  const [createFormData, setCreateFormData] = useState<CreateRoleFromTemplateRequest>({
    name: '',
    description: '',
    parentRoleId: undefined,
    inheritanceType: InheritanceType.InheritAll,
    customPermissions: []
  });

  const [hierarchyFormData, setHierarchyFormData] = useState<UpdateHierarchyRequest>({
    parentRoleId: undefined,
    inheritanceType: InheritanceType.InheritAll,
    inheritanceConfig: {}
  });

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [hierarchyResponse, templatesResponse] = await Promise.all([
        rolesApi.getHierarchy(),
        rolesApi.getTemplates()
      ]);

      setRoleHierarchy(hierarchyResponse.data || []);
      setRoleTemplates(templatesResponse.data || []);
    } catch (err: any) {
      console.error('Error loading role management data:', err);
      setError(err.response?.data?.message || 'Failed to load role data');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleSelect = (role: RoleHierarchyDto) => {
    setSelectedRole(role);
    setHierarchyFormData({
      parentRoleId: role.parentRoleId,
      inheritanceType: role.inheritanceType,
      inheritanceConfig: {}
    });
  };

  const handleUpdateHierarchy = async (roleId: string, parentRoleId?: string) => {
    try {
      setError('');
      await rolesApi.updateHierarchy(roleId, {
        parentRoleId,
        inheritanceType: hierarchyFormData.inheritanceType,
        inheritanceConfig: hierarchyFormData.inheritanceConfig
      });
      
      setSuccess('Role hierarchy updated successfully');
      setShowHierarchyEditor(false);
      await loadData();
      setTimeout(() => setSuccess(''), 5000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update hierarchy');
    }
  };

  const handleSelectTemplate = (template: RoleTemplateDto) => {
    setSelectedTemplate(template);
    setCreateFormData({
      name: template.name,
      description: template.description || '',
      parentRoleId: undefined,
      inheritanceType: InheritanceType.InheritAll,
      customPermissions: template.previewPermissions || []
    });
    setShowCreateFromTemplate(true);
  };

  const handleCreateFromTemplate = async () => {
    if (!selectedTemplate) return;

    try {
      setError('');
      await rolesApi.createFromTemplate(selectedTemplate.id, createFormData);
      
      setSuccess(`Role "${createFormData.name}" created successfully from template`);
      setShowCreateFromTemplate(false);
      setSelectedTemplate(null);
      setCreateFormData({
        name: '',
        description: '',
        parentRoleId: undefined,
        inheritanceType: InheritanceType.InheritAll,
        customPermissions: []
      });
      await loadData();
      setTimeout(() => setSuccess(''), 5000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create role from template');
    }
  };

  const handleRefreshInheritance = async () => {
    if (!selectedRole) return;

    try {
      setError('');
      await rolesApi.refreshInheritance(selectedRole.roleId);
      setSuccess('Permission inheritance refreshed successfully');
      await loadData();
      setTimeout(() => setSuccess(''), 5000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to refresh inheritance');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
              <Network className="w-6 h-6" />
              <span>Role Management</span>
            </h1>
            <p className="text-gray-600 mt-1">
              Manage role hierarchies, templates, and permission inheritance
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={loadData}
              disabled={loading}
              className="flex items-center space-x-2"
            >
              <RefreshCwIcon className="w-4 h-4" />
              <span>Refresh</span>
            </Button>
            
            <Button
              onClick={() => setActiveView('templates')}
              className="flex items-center space-x-2"
            >
              <PlusIcon className="w-4 h-4" />
              <span>Create from Template</span>
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-1 mt-6 bg-gray-100 rounded-lg p-1">
          <Button
            variant={activeView === 'hierarchy' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveView('hierarchy')}
            className="flex items-center space-x-2"
          >
            <Network className="w-4 h-4" />
            <span>Role Hierarchy</span>
          </Button>
          
          <Button
            variant={activeView === 'templates' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveView('templates')}
            className="flex items-center space-x-2"
          >
            <FileTextIcon className="w-4 h-4" />
            <span>Role Templates</span>
          </Button>
        </div>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-red-800">
            <span className="font-medium">Error:</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-green-800">
            <span className="font-medium">Success:</span>
            <span>{success}</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main View */}
        <div className="lg:col-span-3">
          {activeView === 'hierarchy' ? (
            <RoleTree
              roles={roleHierarchy}
              onRoleSelect={handleRoleSelect}
              onUpdateHierarchy={handleUpdateHierarchy}
              selectedRoleId={selectedRole?.roleId}
            />
          ) : (
            <RoleTemplateGallery
              templates={roleTemplates}
              onSelectTemplate={handleSelectTemplate}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />
          )}
        </div>

        {/* Side Panel */}
        <div className="space-y-4">
          {selectedRole && activeView === 'hierarchy' && (
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Role Details</h3>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowHierarchyEditor(true)}
                  className="flex items-center space-x-1"
                >
                  <SettingsIcon className="w-3 h-3" />
                  <span>Edit</span>
                </Button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">Name</label>
                  <p className="text-gray-900">{selectedRole.roleName}</p>
                </div>

                {selectedRole.description && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Description</label>
                    <p className="text-gray-600 text-sm">{selectedRole.description}</p>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-gray-700">Level</label>
                  <Badge variant="secondary">Level {selectedRole.level}</Badge>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Inheritance</label>
                  <Badge variant="outline">{selectedRole.inheritanceType}</Badge>
                </div>

                {selectedRole.parentRoleName && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Parent Role</label>
                    <p className="text-gray-900 flex items-center space-x-1">
                      <span>{selectedRole.parentRoleName}</span>
                      <ChevronRightIcon className="w-3 h-3" />
                    </p>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-gray-700">Permissions</label>
                  <div className="flex items-center space-x-2 mt-1">
                    <ShieldCheckIcon className="w-4 h-4 text-blue-500" />
                    <span className="text-sm">{selectedRole.permissions?.length || 0} permissions</span>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleRefreshInheritance}
                  className="w-full"
                >
                  Refresh Inheritance
                </Button>
              </div>
            </div>
          )}

          {/* Statistics */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Statistics</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Roles</span>
                <span className="font-medium">{roleHierarchy.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Templates</span>
                <span className="font-medium">{roleTemplates.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Max Depth</span>
                <span className="font-medium">
                  {Math.max(...roleHierarchy.map(r => r.level), 0)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create from Template Modal */}
      {showCreateFromTemplate && selectedTemplate && (
        <Modal isOpen={showCreateFromTemplate} onClose={() => setShowCreateFromTemplate(false)} size="lg">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Create Role from Template</h2>
            <p className="text-gray-600 mb-6">Template: {selectedTemplate.name}</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role Name</label>
                <input
                  type="text"
                  value={createFormData.name}
                  onChange={(e) => setCreateFormData({ ...createFormData, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Enter role name..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={createFormData.description}
                  onChange={(e) => setCreateFormData({ ...createFormData, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  rows={3}
                  placeholder="Enter role description..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Parent Role (Optional)</label>
                <select
                  value={createFormData.parentRoleId || ''}
                  onChange={(e) => setCreateFormData({ ...createFormData, parentRoleId: e.target.value || undefined })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="">No parent (root role)</option>
                  {roleHierarchy.map(role => (
                    <option key={role.roleId} value={role.roleId}>
                      {role.roleName} (Level {role.level})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Inheritance Type</label>
                <select
                  value={createFormData.inheritanceType}
                  onChange={(e) => setCreateFormData({ ...createFormData, inheritanceType: e.target.value as InheritanceType })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value={InheritanceType.InheritAll}>Inherit All Permissions</option>
                  <option value={InheritanceType.InheritSelective}>Inherit Selected Permissions</option>
                  <option value={InheritanceType.None}>No Inheritance</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6 pt-6 border-t">
              <Button variant="outline" onClick={() => setShowCreateFromTemplate(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateFromTemplate} disabled={!createFormData.name.trim()}>
                Create Role
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Hierarchy Editor Modal */}
      {showHierarchyEditor && selectedRole && (
        <Modal isOpen={showHierarchyEditor} onClose={() => setShowHierarchyEditor(false)} size="lg">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Edit Role Hierarchy</h2>
            <p className="text-gray-600 mb-6">Role: {selectedRole.roleName}</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Parent Role</label>
                <select
                  value={hierarchyFormData.parentRoleId || ''}
                  onChange={(e) => setHierarchyFormData({ ...hierarchyFormData, parentRoleId: e.target.value || undefined })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="">No parent (root role)</option>
                  {roleHierarchy
                    .filter(role => role.roleId !== selectedRole.roleId)
                    .map(role => (
                      <option key={role.roleId} value={role.roleId}>
                        {role.roleName} (Level {role.level})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Inheritance Type</label>
                <select
                  value={hierarchyFormData.inheritanceType}
                  onChange={(e) => setHierarchyFormData({ ...hierarchyFormData, inheritanceType: e.target.value as InheritanceType })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value={InheritanceType.InheritAll}>Inherit All Permissions</option>
                  <option value={InheritanceType.InheritSelective}>Inherit Selected Permissions</option>
                  <option value={InheritanceType.None}>No Inheritance</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6 pt-6 border-t">
              <Button variant="outline" onClick={() => setShowHierarchyEditor(false)}>
                Cancel
              </Button>
              <Button onClick={() => handleUpdateHierarchy(selectedRole.roleId, hierarchyFormData.parentRoleId)}>
                Update Hierarchy
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}