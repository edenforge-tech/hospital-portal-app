'use client';

import { useState } from 'react';
import * as React from 'react';
import { Search, Grid, List, Shield, Users, CheckCircle2, Circle, ChevronDown, ChevronRight, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { cn } from '@/lib/utils';

interface Permission {
  id: string;
  name: string;
  code: string;
  module: string;
  description: string;
  isSystemPermission: boolean;
}

interface Role {
  id: string;
  name: string;
  isClinical: boolean;
  isSystemRole: boolean;
  permissions: string[];
}

const mockPermissions: Permission[] = [
  // Patient Module
  { id: '1', name: 'View Patients', code: 'patients.view', module: 'Patients', description: 'View patient records and information', isSystemPermission: false },
  { id: '2', name: 'Create Patients', code: 'patients.create', module: 'Patients', description: 'Register new patients in the system', isSystemPermission: false },
  { id: '3', name: 'Edit Patients', code: 'patients.edit', module: 'Patients', description: 'Update patient information', isSystemPermission: false },
  { id: '4', name: 'Delete Patients', code: 'patients.delete', module: 'Patients', description: 'Remove patient records (soft delete)', isSystemPermission: false },
  { id: '5', name: 'Export Patient Data', code: 'patients.export', module: 'Patients', description: 'Export patient data to files', isSystemPermission: false },
  
  // Appointments Module
  { id: '6', name: 'View Appointments', code: 'appointments.view', module: 'Appointments', description: 'View appointment schedule', isSystemPermission: false },
  { id: '7', name: 'Create Appointments', code: 'appointments.create', module: 'Appointments', description: 'Schedule new appointments', isSystemPermission: false },
  { id: '8', name: 'Edit Appointments', code: 'appointments.edit', module: 'Appointments', description: 'Modify existing appointments', isSystemPermission: false },
  { id: '9', name: 'Cancel Appointments', code: 'appointments.cancel', module: 'Appointments', description: 'Cancel appointments', isSystemPermission: false },
  { id: '10', name: 'Reschedule Appointments', code: 'appointments.reschedule', module: 'Appointments', description: 'Move appointments to different time slots', isSystemPermission: false },
  
  // Clinical Module
  { id: '11', name: 'View Clinical Records', code: 'clinical.view', module: 'Clinical', description: 'Access clinical examination records', isSystemPermission: false },
  { id: '12', name: 'Create Clinical Records', code: 'clinical.create', module: 'Clinical', description: 'Create new examination records', isSystemPermission: false },
  { id: '13', name: 'Edit Clinical Records', code: 'clinical.edit', module: 'Clinical', description: 'Update clinical data', isSystemPermission: false },
  { id: '14', name: 'View Prescriptions', code: 'prescriptions.view', module: 'Clinical', description: 'View prescription records', isSystemPermission: false },
  { id: '15', name: 'Create Prescriptions', code: 'prescriptions.create', module: 'Clinical', description: 'Issue new prescriptions', isSystemPermission: false },
  { id: '16', name: 'View Lab Results', code: 'lab.view', module: 'Clinical', description: 'Access laboratory test results', isSystemPermission: false },
  
  // Users Module
  { id: '17', name: 'View Users', code: 'users.view', module: 'Users', description: 'View user accounts', isSystemPermission: false },
  { id: '18', name: 'Create Users', code: 'users.create', module: 'Users', description: 'Create new user accounts', isSystemPermission: false },
  { id: '19', name: 'Edit Users', code: 'users.edit', module: 'Users', description: 'Modify user accounts', isSystemPermission: false },
  { id: '20', name: 'Delete Users', code: 'users.delete', module: 'Users', description: 'Remove user accounts', isSystemPermission: false },
  { id: '21', name: 'Assign Roles', code: 'users.roles', module: 'Users', description: 'Assign roles to users', isSystemPermission: false },
  
  // Departments Module
  { id: '22', name: 'View Departments', code: 'departments.view', module: 'Departments', description: 'View department information', isSystemPermission: false },
  { id: '23', name: 'Manage Departments', code: 'departments.manage', module: 'Departments', description: 'Create and edit departments', isSystemPermission: false },
  { id: '24', name: 'View Department Staff', code: 'departments.staff', module: 'Departments', description: 'View staff assigned to departments', isSystemPermission: false },
  
  // Branches Module
  { id: '25', name: 'View Branches', code: 'branches.view', module: 'Branches', description: 'View branch information', isSystemPermission: false },
  { id: '26', name: 'Manage Branches', code: 'branches.manage', module: 'Branches', description: 'Create and edit branches', isSystemPermission: false },
  
  // System Module
  { id: '27', name: 'View Audit Logs', code: 'audit.view', module: 'System', description: 'Access system audit logs', isSystemPermission: true },
  { id: '28', name: 'System Settings', code: 'system.settings', module: 'System', description: 'Configure system-wide settings', isSystemPermission: true },
  { id: '29', name: 'Manage Roles', code: 'roles.manage', module: 'System', description: 'Create and edit roles', isSystemPermission: false },
  { id: '30', name: 'Manage Permissions', code: 'permissions.manage', module: 'System', description: 'Assign permissions to roles', isSystemPermission: true },
];

const mockRoles: Role[] = [
  { id: '1', name: 'Super Admin', isClinical: false, isSystemRole: true, permissions: mockPermissions.map(p => p.id) },
  { id: '2', name: 'Ophthalmologist', isClinical: true, isSystemRole: false, permissions: ['1', '2', '3', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '22', '25'] },
  { id: '3', name: 'Receptionist', isClinical: false, isSystemRole: false, permissions: ['1', '2', '3', '6', '7', '8', '10', '22', '25'] },
  { id: '4', name: 'Nurse', isClinical: true, isSystemRole: false, permissions: ['1', '6', '11', '12', '14', '16', '22', '25'] },
  { id: '5', name: 'Department Manager', isClinical: false, isSystemRole: false, permissions: ['1', '17', '18', '19', '21', '22', '23', '24', '25', '27', '29'] },
];

type ViewMode = 'list' | 'matrix';

export function PermissionsManagement() {
  const [viewMode, setViewMode] = useState<ViewMode>('matrix');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set(['Patients', 'Appointments']));
  const [rolePermissions, setRolePermissions] = useState<Record<string, string[]>>(
    mockRoles.reduce((acc, role) => ({ ...acc, [role.id]: role.permissions }), {})
  );
  const [selectedModule, setSelectedModule] = useState<string | null>(null);

  const filteredPermissions = mockPermissions.filter(perm =>
    perm.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    perm.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    perm.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    perm.module.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group permissions by module
  const permissionsByModule = filteredPermissions.reduce((acc, permission) => {
    if (!acc[permission.module]) {
      acc[permission.module] = [];
    }
    acc[permission.module].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  const toggleModule = (module: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(module)) {
      newExpanded.delete(module);
    } else {
      newExpanded.add(module);
    }
    setExpandedModules(newExpanded);
  };

  const togglePermissionForRole = (roleId: string, permissionId: string) => {
    const role = mockRoles.find(r => r.id === roleId);
    if (role?.isSystemRole) return; // Can't modify system roles

    setRolePermissions(prev => {
      const rolePerms = prev[roleId] || [];
      const hasPermission = rolePerms.includes(permissionId);
      
      return {
        ...prev,
        [roleId]: hasPermission
          ? rolePerms.filter(id => id !== permissionId)
          : [...rolePerms, permissionId]
      };
    });
  };

  const toggleAllPermissionsForRole = (roleId: string, permissionIds: string[]) => {
    const role = mockRoles.find(r => r.id === roleId);
    if (role?.isSystemRole) return;

    setRolePermissions(prev => {
      const rolePerms = prev[roleId] || [];
      const allSelected = permissionIds.every(id => rolePerms.includes(id));
      
      if (allSelected) {
        return {
          ...prev,
          [roleId]: rolePerms.filter(id => !permissionIds.includes(id))
        };
      } else {
        const newPerms = [...new Set([...rolePerms, ...permissionIds])];
        return {
          ...prev,
          [roleId]: newPerms
        };
      }
    });
  };

  const toggleRoleForPermission = (permissionId: string, roleId: string) => {
    togglePermissionForRole(roleId, permissionId);
  };

  const exportPermissionsMatrix = () => {
    // Generate CSV content
    const headers = ['Permission', 'Code', 'Module', ...mockRoles.map(r => r.name)];
    const rows = mockPermissions.map(perm => [
      perm.name,
      perm.code,
      perm.module,
      ...mockRoles.map(role => {
        const perms = rolePermissions[role.id] || [];
        return perms.includes(perm.id) ? 'Yes' : 'No';
      })
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'permissions-matrix.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Statistics
  const stats = {
    totalPermissions: mockPermissions.length,
    modules: Object.keys(permissionsByModule).length,
    roles: mockRoles.length,
    systemPermissions: mockPermissions.filter(p => p.isSystemPermission).length,
    totalAssignments: Object.values(rolePermissions).reduce((sum, perms) => sum + perms.length, 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900">Permissions Management</h1>
          <p className="text-sm text-gray-600 mt-1">Manage system permissions and role assignments</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="md"
            leftIcon={<Download className="h-4 w-4" />}
            onClick={exportPermissionsMatrix}
          >
            Export Matrix
          </Button>
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <Button
              variant={viewMode === 'matrix' ? 'primary' : 'ghost'}
              size="sm"
              leftIcon={<Grid className="h-4 w-4" />}
              onClick={() => setViewMode('matrix')}
            >
              Matrix
            </Button>
            <Button
              variant={viewMode === 'list' ? 'primary' : 'ghost'}
              size="sm"
              leftIcon={<List className="h-4 w-4" />}
              onClick={() => setViewMode('list')}
            >
              List
            </Button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Permissions</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalPermissions}</p>
            </div>
            <Shield className="h-8 w-8 text-blue-500" />
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Modules</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">{stats.modules}</p>
            </div>
            <Grid className="h-8 w-8 text-purple-500" />
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Roles</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.roles}</p>
            </div>
            <Users className="h-8 w-8 text-emerald-500" />
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">System Perms</p>
              <p className="text-2xl font-bold text-amber-600 mt-1">{stats.systemPermissions}</p>
            </div>
            <Shield className="h-8 w-8 text-amber-500" />
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Assignments</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalAssignments}</p>
            </div>
            <CheckCircle2 className="h-8 w-8 text-gray-500" />
          </div>
        </Card>
      </div>

      {/* Search */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search permissions by name, code, module, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="h-4 w-4 text-gray-400" />}
            />
          </div>
        </div>
      </Card>

      {/* Matrix View */}
      {viewMode === 'matrix' && (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <Table caption="Role-Permission assignment matrix">
              <TableHeader>
                <TableRow>
                  <TableHead className="sticky left-0 bg-white z-10 min-w-[300px]">
                    Permission
                  </TableHead>
                  {mockRoles.map(role => (
                    <TableHead key={role.id} className="text-center min-w-[120px]">
                      <div className="space-y-1">
                        <p className="font-semibold">{role.name}</p>
                        {role.isSystemRole && (
                          <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                            System
                          </span>
                        )}
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(permissionsByModule).map(([module, permissions]) => {
                  const isExpanded = expandedModules.has(module);
                  
                  return (
                    <React.Fragment key={module}>
                      {/* Module Header Row */}
                      <TableRow className="bg-gray-50 hover:bg-gray-100">
                        <TableCell className="sticky left-0 bg-gray-50 z-10">
                          <button
                            onClick={() => toggleModule(module)}
                            className="flex items-center gap-2 w-full text-left font-semibold text-gray-900"
                          >
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                            {module} ({permissions.length})
                          </button>
                        </TableCell>
                        {mockRoles.map(role => {
                          const rolePerms = rolePermissions[role.id] || [];
                          const modulePermIds = permissions.map(p => p.id);
                          const selectedCount = modulePermIds.filter(id => rolePerms.includes(id)).length;
                          const allSelected = selectedCount === modulePermIds.length;
                          
                          return (
                            <TableCell key={role.id} className="text-center bg-gray-50">
                              <button
                                onClick={() => toggleAllPermissionsForRole(role.id, modulePermIds)}
                                disabled={role.isSystemRole}
                                className="inline-flex items-center justify-center gap-1 px-2 py-1 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                title={role.isSystemRole ? 'Cannot modify system role' : `Toggle all ${module} permissions`}
                              >
                                {allSelected ? (
                                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                ) : selectedCount > 0 ? (
                                  <Circle className="h-4 w-4 fill-blue-200 text-blue-600" />
                                ) : (
                                  <Circle className="h-4 w-4 text-gray-400" />
                                )}
                                <span className="text-xs text-gray-600">
                                  {selectedCount}/{modulePermIds.length}
                                </span>
                              </button>
                            </TableCell>
                          );
                        })}
                      </TableRow>
                      
                      {/* Permission Rows */}
                      {isExpanded && permissions.map(permission => (
                        <TableRow key={permission.id} className="hover:bg-gray-50">
                          <TableCell className="sticky left-0 bg-white z-10">
                            <div className="py-1">
                              <p className="font-medium text-gray-900">{permission.name}</p>
                              <p className="text-xs text-gray-500 mt-0.5">
                                {permission.code}
                              </p>
                              <p className="text-xs text-gray-600 mt-1">
                                {permission.description}
                              </p>
                              {permission.isSystemPermission && (
                                <span className="inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                                  System Permission
                                </span>
                              )}
                            </div>
                          </TableCell>
                          {mockRoles.map(role => {
                            const hasPermission = (rolePermissions[role.id] || []).includes(permission.id);
                            
                            return (
                              <TableCell key={role.id} className="text-center">
                                <button
                                  onClick={() => togglePermissionForRole(role.id, permission.id)}
                                  disabled={role.isSystemRole}
                                  className={cn(
                                    'inline-flex items-center justify-center w-8 h-8 rounded-lg transition-all',
                                    hasPermission
                                      ? 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200'
                                      : 'bg-gray-100 text-gray-400 hover:bg-gray-200',
                                    role.isSystemRole && 'opacity-50 cursor-not-allowed'
                                  )}
                                  title={role.isSystemRole ? 'Cannot modify system role' : hasPermission ? 'Remove permission' : 'Grant permission'}
                                >
                                  {hasPermission ? (
                                    <CheckCircle2 className="h-5 w-5" />
                                  ) : (
                                    <Circle className="h-5 w-5" />
                                  )}
                                </button>
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      ))}
                    </React.Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <Card>
          <div className="divide-y divide-gray-200">
            {Object.entries(permissionsByModule).map(([module, permissions]) => {
              const isExpanded = expandedModules.has(module);
              
              return (
                <div key={module}>
                  <button
                    onClick={() => toggleModule(module)}
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {isExpanded ? (
                        <ChevronDown className="h-5 w-5 text-gray-600" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-gray-600" />
                      )}
                      <h3 className="text-lg font-semibold text-gray-900">{module}</h3>
                      <span className="text-sm text-gray-500">({permissions.length} permissions)</span>
                    </div>
                  </button>
                  
                  {isExpanded && (
                    <div className="p-4 bg-gray-50 space-y-3">
                      {permissions.map(permission => (
                        <Card key={permission.id} className="p-4">
                          <div className="space-y-3">
                            <div>
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-gray-900">{permission.name}</h4>
                                  <p className="text-sm text-gray-600 mt-1">{permission.description}</p>
                                  <p className="text-xs text-gray-500 mt-1 font-mono">{permission.code}</p>
                                </div>
                                {permission.isSystemPermission && (
                                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-amber-100 text-amber-800">
                                    System
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            <div>
                              <p className="text-sm font-medium text-gray-700 mb-2">Assigned to roles:</p>
                              <div className="flex flex-wrap gap-2">
                                {mockRoles.map(role => {
                                  const hasPermission = (rolePermissions[role.id] || []).includes(permission.id);
                                  
                                  return (
                                    <button
                                      key={role.id}
                                      onClick={() => toggleRoleForPermission(permission.id, role.id)}
                                      disabled={role.isSystemRole}
                                      className={cn(
                                        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                                        hasPermission
                                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                          : 'bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200',
                                        role.isSystemRole && 'opacity-50 cursor-not-allowed'
                                      )}
                                      title={role.isSystemRole ? 'Cannot modify system role' : ''}
                                    >
                                      {hasPermission ? (
                                        <CheckCircle2 className="h-4 w-4" />
                                      ) : (
                                        <Circle className="h-4 w-4" />
                                      )}
                                      {role.name}
                                      {role.isClinical && (
                                        <span className="text-xs bg-purple-200 text-purple-800 px-1.5 py-0.5 rounded">
                                          Clinical
                                        </span>
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Save Changes Footer */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Changes are saved automatically. System roles cannot be modified.
          </p>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700">
              {stats.totalAssignments} total permission assignments
            </span>
            <Button variant="primary" size="md">
              Save Changes
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
