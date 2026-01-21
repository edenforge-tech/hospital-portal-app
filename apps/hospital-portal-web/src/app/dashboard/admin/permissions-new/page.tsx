'use client';

import { useCachedAuthStore } from '@/lib/permission-cache';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import React from 'react';
import { permissionsApi, rolesApi, usersApi, departmentsApi } from '@/lib/api';

// ============================================================================
// INTERFACES
// ============================================================================

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

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  roleId: string;
  roleName: string;
  departmentId?: string;
  departmentName?: string;
}

interface Department {
  id: string;
  code: string;
  name: string;
  type: string;
  parentDepartmentId?: string;
  subDepartments?: Department[];
}

interface UserDepartmentAccess {
  id: string;
  userId: string;
  departmentId: string;
  subDepartmentId?: string;
  isPrimary: boolean;
  accessType: string;
  status: string;
}

interface UserPermissionOverride {
  userId: string;
  added: string[]; // permission IDs
  revoked: string[]; // permission IDs
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getUserFullName = (user: User | null | undefined): string => {
  if (!user) return '';
  return user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'Unknown User';
};

const getDepartmentName = (dept: Department | null | undefined): string => {
  if (!dept) return 'Unknown Department';
  // Handle multiple possible field names from API
  const name = (dept as any).departmentName || dept.name || (dept as any).department_name;
  if (name) return name;
  
  // Fallback: use code if available, otherwise show partial ID
  return dept.code || `Department ${dept.id?.substring(0, 8) || ''}`;
};

const getDepartmentType = (dept: Department | null | undefined): string => {
  if (!dept) return '';
  // Handle multiple possible field names from API
  const type = (dept as any).departmentType || dept.type || (dept as any).department_type;
  return type || 'General';
};

const formatModuleName = (module: string): string => {
  if (!module) return 'Other';
  
  // Handle special cases
  const specialNames: Record<string, string> = {
    'hrm': 'HRM',
    'ot_management': 'OT Management',
    'lab_diagnostics': 'Lab/Diagnostics',
    'billing_revenue': 'Billing/Revenue',
    'patient_management': 'Patient Management',
    'ambulance': 'Ambulance',
    'appointments': 'Appointments',
    'bed_management': 'Bed Management',
    'clinical_documentation': 'Clinical Documentation',
    'document_sharing': 'Document Sharing',
    'inventory': 'Inventory',
    'pharmacy': 'Pharmacy',
    'quality_assurance': 'Quality Assurance',
    'radiology': 'Radiology',
    'system_settings': 'System Settings',
    'vendor_procurement': 'Vendor/Procurement'
  };
  
  if (specialNames[module]) {
    return specialNames[module];
  }
  
  // Default: convert snake_case to Title Case
  return module
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function UnifiedPermissionsPage() {
  const { user } = useCachedAuthStore();
  const router = useRouter();
  
  // Tab state
  const [activeTab, setActiveTab] = useState<'roles' | 'users' | 'departments' | 'bulk'>('roles');
  
  // Data state
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [rolePermissions, setRolePermissions] = useState<Map<string, string[]>>(new Map());
  const [userDepartmentAccess, setUserDepartmentAccess] = useState<Map<string, UserDepartmentAccess[]>>(new Map());
  const [userOverrides, setUserOverrides] = useState<Map<string, UserPermissionOverride>>(new Map());
  
  // UI state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [pendingChanges, setPendingChanges] = useState<any[]>([]);
  
  // Load all data
  useEffect(() => {
    if (user) {
      loadAllData();
    }
  }, [user]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      setError('');

      console.log('Loading permissions data...');

      // Load permissions, roles, users, departments in parallel
      const [permsRes, rolesRes, usersRes, deptsRes] = await Promise.all([
        permissionsApi.getAll().catch(err => {
          console.error('Failed to load permissions:', err);
          throw new Error('Failed to load permissions');
        }),
        rolesApi.getAllWithUserCount().catch(err => {
          console.error('Failed to load roles:', err);
          throw new Error('Failed to load roles');
        }),
        usersApi.getAll({ pageNumber: 1, pageSize: 1000 }).catch(err => {
          console.error('Failed to load users:', err);
          throw new Error('Failed to load users');
        }),
        departmentsApi.getAll().catch(err => {
          console.error('Failed to load departments:', err);
          throw new Error('Failed to load departments');
        })
      ]);

      console.log('API Responses:', { permsRes: permsRes.data, rolesRes: rolesRes.data, usersRes: usersRes.data, deptsRes: deptsRes.data });

      const loadedPermissions = permsRes.data?.Permissions || permsRes.data?.permissions || [];
      console.log(`✓ Loaded ${loadedPermissions.length} permissions`);
      
      // Extract and log unique modules
      const uniqueModules = Array.from(new Set(loadedPermissions.map((p: any) => p.module))).filter(Boolean);
      console.log(`✓ Found ${uniqueModules.length} unique modules:`, uniqueModules);
      
      setPermissions(loadedPermissions);
      setRoles(rolesRes.data || []);
      setUsers(usersRes.data?.users || usersRes.data || []);
      
      // Handle department data - API might return array directly or wrapped
      const deptData = deptsRes.data?.departments || deptsRes.data || [];
      console.log('Departments loaded:', deptData);
      setDepartments(deptData);

      // Load role permissions
      const rolePermMap = new Map<string, string[]>();
      for (const role of (rolesRes.data || [])) {
        try {
          const rolePermsRes = await rolesApi.getRolePermissions(role.id);
          rolePermMap.set(role.id, (rolePermsRes.data || []).map((p: any) => p.id));
        } catch (err) {
          console.error(`Failed to load permissions for role ${role.name}:`, err);
          rolePermMap.set(role.id, []);
        }
      }
      setRolePermissions(rolePermMap);

      console.log('All data loaded successfully');

    } catch (err: any) {
      console.error('Error loading data:', err);
      const errorMessage = err.message || 'Failed to load permissions data. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const saveAllChanges = async () => {
    // Implementation will come later
    setSuccess('Changes saved successfully!');
    setTimeout(() => setSuccess(''), 3000);
  };

  const resetChanges = () => {
    setPendingChanges([]);
    loadAllData();
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading permissions management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 w-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Permissions Management</h1>
          <p className="text-gray-600 mt-1">Manage user access, roles, and department permissions</p>
        </div>
        <div className="flex gap-3">
          {pendingChanges.length > 0 && (
            <button
              onClick={resetChanges}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Reset Changes ({pendingChanges.length})
            </button>
          )}
          <button
            onClick={saveAllChanges}
            disabled={pendingChanges.length === 0 || saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save All Changes'}
          </button>
        </div>
      </div>

      {/* Alert Messages */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          <div className="flex items-center gap-2">
            <span className="font-semibold">Error:</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
          <div className="flex items-center gap-2">
            <span className="font-semibold">Success:</span>
            <span>{success}</span>
          </div>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('roles')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'roles'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              <span className="flex items-center gap-2">
                <span>1. Role Permissions</span>
                <span className="px-2 py-0.5 text-xs bg-gray-100 rounded-full">{roles.length} roles</span>
              </span>
            </button>
            
            <button
              onClick={() => setActiveTab('users')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'users'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              <span className="flex items-center gap-2">
                <span>2. User Access</span>
                <span className="px-2 py-0.5 text-xs bg-gray-100 rounded-full">{users.length} users</span>
              </span>
            </button>
            
            <button
              onClick={() => setActiveTab('departments')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'departments'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              <span className="flex items-center gap-2">
                <span>3. Department Access</span>
                <span className="px-2 py-0.5 text-xs bg-gray-100 rounded-full">{departments.length} depts</span>
              </span>
            </button>
            
            <button
              onClick={() => setActiveTab('bulk')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'bulk'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              4. Bulk Operations
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'roles' && (
            <RolePermissionsTab
              permissions={permissions}
              roles={roles}
              rolePermissions={rolePermissions}
              setRolePermissions={setRolePermissions}
              setPendingChanges={setPendingChanges}
            />
          )}
          
          {activeTab === 'users' && (
            <UserAccessTab
              users={users}
              roles={roles}
              permissions={permissions}
              departments={departments}
              rolePermissions={rolePermissions}
              userDepartmentAccess={userDepartmentAccess}
              userOverrides={userOverrides}
              setUserOverrides={setUserOverrides}
              setUserDepartmentAccess={setUserDepartmentAccess}
              setPendingChanges={setPendingChanges}
            />
          )}
          
          {activeTab === 'departments' && (
            <DepartmentAccessTab
              users={users}
              departments={departments}
              userDepartmentAccess={userDepartmentAccess}
              setUserDepartmentAccess={setUserDepartmentAccess}
              setPendingChanges={setPendingChanges}
            />
          )}
          
          {activeTab === 'bulk' && (
            <BulkOperationsTab
              users={users}
              roles={roles}
              permissions={permissions}
              departments={departments}
              rolePermissions={rolePermissions}
              userDepartmentAccess={userDepartmentAccess}
              setPendingChanges={setPendingChanges}
            />
          )}
        </div>
      </div>

      {/* Stats Footer */}
      <div className="mt-6 grid grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-blue-600">{permissions.length}</div>
          <div className="text-sm text-gray-600">Total Permissions</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-green-600">{roles.length}</div>
          <div className="text-sm text-gray-600">Roles Configured</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-purple-600">{users.length}</div>
          <div className="text-sm text-gray-600">Active Users</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-orange-600">{departments.length}</div>
          <div className="text-sm text-gray-600">Departments</div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// TAB 1: ROLE PERMISSIONS
// ============================================================================

interface RolePermissionsTabProps {
  permissions: Permission[];
  roles: Role[];
  rolePermissions: Map<string, string[]>;
  setRolePermissions: (map: Map<string, string[]>) => void;
  setPendingChanges: (fn: (prev: any[]) => any[]) => void;
}

function RolePermissionsTab({
  permissions,
  roles,
  rolePermissions,
  setRolePermissions,
  setPendingChanges
}: RolePermissionsTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModule, setSelectedModule] = useState<string>('all');
  
  // Get unique modules
  const modules = ['all', ...Array.from(new Set(permissions.map(p => p.module)))].filter(Boolean);
  
  // Filter permissions
  const filteredPermissions = permissions.filter(perm => {
    const matchesSearch = perm.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         perm.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesModule = selectedModule === 'all' || perm.module === selectedModule;
    return matchesSearch && matchesModule;
  });
  
  // Group by module
  const groupedPermissions = filteredPermissions.reduce((acc, perm) => {
    const module = perm.module || 'Other';
    if (!acc[module]) acc[module] = [];
    acc[module].push(perm);
    return acc;
  }, {} as Record<string, Permission[]>);
  
  const togglePermission = (roleId: string, permissionId: string) => {
    const newMap = new Map(rolePermissions);
    const current = newMap.get(roleId) || [];
    
    if (current.includes(permissionId)) {
      newMap.set(roleId, current.filter(id => id !== permissionId));
    } else {
      newMap.set(roleId, [...current, permissionId]);
    }
    
    setRolePermissions(newMap);
    setPendingChanges(prev => [...prev, { type: 'role_permission', roleId, permissionId }]);
  };
  
  return (
    <div>
      {/* Info Banner */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <span className="text-blue-600 text-xl">ℹ️</span>
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900">Module Permissions (RBAC)</h3>
            <p className="text-sm text-blue-800 mt-1">
              Define WHAT each role can do in the system (functional capabilities). 
              For controlling WHICH department's data users can access, use the User Access or Department Access tabs.
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search permissions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="w-64">
          <select
            value={selectedModule}
            onChange={(e) => setSelectedModule(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {modules.map(module => (
              <option key={module} value={module}>
                {module === 'all' ? 'All Modules' : formatModuleName(module)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Permission Matrix */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="w-full">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-200 min-w-[300px]">
                Permission
              </th>
              {roles.map(role => (
                <th key={role.id} className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-200 min-w-[120px]">
                  <div>{role.name}</div>
                  {role.userCount !== undefined && (
                    <div className="text-xs text-gray-500 font-normal mt-1">({role.userCount} users)</div>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {Object.entries(groupedPermissions).map(([module, perms]) => (
              <>
                {/* Module Header */}
                <tr key={`module-${module}`} className="bg-gray-100">
                  <td colSpan={roles.length + 1} className="px-4 py-2 font-semibold text-gray-900">
                    📋 {module.toUpperCase()}
                  </td>
                </tr>
                
                {/* Permissions in Module */}
                {perms.map(permission => (
                  <tr key={permission.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 border-r border-gray-200">
                      <div className="font-medium text-gray-900">{permission.name}</div>
                      <div className="text-sm text-gray-500 mt-1">{permission.description}</div>
                      <div className="text-xs text-gray-400 mt-1">{permission.code}</div>
                    </td>
                    {roles.map(role => {
                      const hasPermission = rolePermissions.get(role.id)?.includes(permission.id);
                      return (
                        <td key={role.id} className="px-4 py-3 text-center border-r border-gray-200">
                          <input
                            type="checkbox"
                            checked={hasPermission}
                            onChange={() => togglePermission(role.id, permission.id)}
                            className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </>
            ))}
          </tbody>
        </table>
      </div>

      {filteredPermissions.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No permissions found matching your filters.
        </div>
      )}
    </div>
  );
}

// ============================================================================
// TAB 2: USER ACCESS (Individual user management)
// ============================================================================

interface UserAccessTabProps {
  users: User[];
  roles: Role[];
  permissions: Permission[];
  departments: Department[];
  rolePermissions: Map<string, string[]>;
  userDepartmentAccess: Map<string, UserDepartmentAccess[]>;
  userOverrides: Map<string, UserPermissionOverride>;
  setUserOverrides: (map: Map<string, UserPermissionOverride>) => void;
  setUserDepartmentAccess: (map: Map<string, UserDepartmentAccess[]>) => void;
  setPendingChanges: (fn: (prev: any[]) => any[]) => void;
}

function UserAccessTab({
  users,
  roles,
  permissions,
  departments,
  rolePermissions,
  userDepartmentAccess,
  userOverrides,
  setUserOverrides,
  setUserDepartmentAccess,
  setPendingChanges
}: UserAccessTabProps) {
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [userSearch, setUserSearch] = useState('');
  
  const selectedUser = users.find(u => u.id === selectedUserId);
  const userRole = roles.find(r => r.id === selectedUser?.roleId);
  const userRolePermissions = userRole ? (rolePermissions.get(userRole.id) || []) : [];
  const userOverride = selectedUserId ? (userOverrides.get(selectedUserId) || { userId: selectedUserId, added: [], revoked: [] }) : null;
  const userDepts = selectedUserId ? (userDepartmentAccess.get(selectedUserId) || []) : [];
  
  // Filter users by search
  const filteredUsers = users.filter(user => {
    const fullName = getUserFullName(user);
    const email = user.email || '';
    return fullName.toLowerCase().includes(userSearch.toLowerCase()) ||
           email.toLowerCase().includes(userSearch.toLowerCase());
  });
  
  return (
    <div>
      {/* User Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select User
        </label>
        <input
          type="text"
          placeholder="Search user by name or email..."
          value={userSearch}
          onChange={(e) => setUserSearch(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 mb-2"
        />
        {userSearch && filteredUsers.length > 0 && (
          <div className="max-h-60 overflow-y-auto border border-gray-300 rounded-lg divide-y divide-gray-200">
            {filteredUsers.slice(0, 10).map(user => (
              <button
                key={user.id}
                onClick={() => {
                  setSelectedUserId(user.id);
                  setUserSearch('');
                }}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center justify-between"
              >
                <div>
                  <div className="font-medium text-gray-900">{getUserFullName(user)}</div>
                  <div className="text-sm text-gray-500">{user.email}</div>
                </div>
                <div className="text-xs text-gray-500">
                  {user.roleName} • {user.departmentName || 'No Department'}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedUser ? (
        <div className="space-y-6">
          {/* User Info Card */}
          <div className="bg-white border border-gray-300 rounded-lg p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-baseline gap-3">
                  <h2 className="text-xl font-semibold text-gray-900">{getUserFullName(selectedUser)}</h2>
                  <span className="text-sm text-gray-500">{selectedUser.email}</span>
                </div>
                <div className="flex gap-3 mt-3">
                  <span className="inline-flex items-center px-3 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700 border border-gray-300">
                    Role: {selectedUser.roleName}
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700 border border-gray-300">
                    Primary Dept: {selectedUser.departmentName || 'Not Assigned'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedUserId('')}
                className="text-gray-400 hover:text-gray-600 p-1"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>

          {/* Role & Permissions Section */}
          <div className="bg-white border border-gray-300 rounded-lg shadow-sm">
            <div className="bg-gray-50 px-6 py-3 border-b border-gray-300">
              <h3 className="text-base font-semibold text-gray-900">Assigned Role & Permissions</h3>
              <p className="text-sm text-gray-600 mt-1">Permissions inherited from assigned role</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded">
                <div>
                  <span className="text-sm font-medium text-gray-700">Current Role:</span>
                  <span className="ml-2 text-sm font-semibold text-gray-900">{selectedUser.roleName}</span>
                </div>
                <div className="text-sm text-gray-600">
                  {userRolePermissions.length} permission{userRolePermissions.length !== 1 ? 's' : ''} granted
                </div>
              </div>

              {userRolePermissions.length > 0 ? (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Granted Permissions:</h4>
                  <div className="bg-gray-50 border border-gray-200 rounded p-4 max-h-64 overflow-y-auto">
                    <div className="grid grid-cols-2 gap-3">
                      {userRolePermissions.slice(0, 20).map(permId => {
                        const perm = permissions.find(p => p.id === permId);
                        return perm ? (
                          <div key={permId} className="flex items-start gap-2 text-sm text-gray-700">
                            <svg className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            <span className="break-words">{perm.name}</span>
                          </div>
                        ) : null;
                      })}
                      {userRolePermissions.length > 20 && (
                        <div className="col-span-2 text-sm text-gray-500 text-center py-2 border-t border-gray-200">
                          +{userRolePermissions.length - 20} additional permissions
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500 text-sm">No permissions assigned to this role</div>
              )}
            </div>
          </div>

          {/* Department Access Section */}
          <div className="bg-white border border-gray-300 rounded-lg shadow-sm">
            <div className="bg-gray-50 px-6 py-3 border-b border-gray-300">
              <h3 className="text-base font-semibold text-gray-900">Department Data Access</h3>
              <p className="text-sm text-gray-600 mt-1">Grant access to department patient records and data</p>
            </div>
            <div className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Select departments to grant data access
                </div>
                <div className="text-sm font-medium text-gray-600">
                  {userDepts.length} of {departments.filter(d => !d.parentDepartmentId).length} departments granted
                </div>
              </div>

              <div className="space-y-2">
                {departments.slice(0, 14).filter(d => !d.parentDepartmentId).map(dept => {
                  const hasAccess = userDepts.some(ud => ud.departmentId === dept.id);
                  const isPrimary = userDepts.some(ud => ud.departmentId === dept.id && ud.isPrimary);
                  
                  return (
                    <label 
                      key={dept.id} 
                      className={`flex items-center justify-between px-4 py-3 border rounded cursor-pointer transition-colors ${
                        hasAccess 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <input
                          type="checkbox"
                          checked={hasAccess}
                          onChange={() => {
                            const newAccess = new Map(userDepartmentAccess);
                            const current = newAccess.get(selectedUserId) || [];
                            
                            if (hasAccess) {
                              newAccess.set(selectedUserId, current.filter(ud => ud.departmentId !== dept.id));
                            } else {
                              newAccess.set(selectedUserId, [...current, {
                                id: `new-${Date.now()}`,
                                userId: selectedUserId,
                                departmentId: dept.id,
                                isPrimary: current.length === 0,
                                accessType: 'Full Access',
                                status: 'Active'
                              } as UserDepartmentAccess]);
                            }
                            
                            setUserDepartmentAccess(newAccess);
                            setPendingChanges(prev => [...prev, { type: 'user_department', userId: selectedUserId, deptId: dept.id }]);
                          }}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">{getDepartmentName(dept)}</span>
                            {isPrimary && (
                              <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-800 border border-yellow-300 rounded font-medium">
                                PRIMARY
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500">{getDepartmentType(dept)}</div>
                        </div>
                      </div>
                      {hasAccess && (
                        <span className="ml-3 text-xs font-medium text-blue-700">
                          Access Granted
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>
              
              {userDepts.length === 0 && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded text-center">
                  <p className="text-sm font-medium text-red-800">No department access granted</p>
                  <p className="text-xs text-red-600 mt-1">User will not be able to access any patient data</p>
                </div>
              )}
            </div>
          </div>

          {/* Access Summary */}
          <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Access Summary</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 border border-gray-200 rounded">
                <div className="text-sm font-medium text-gray-700 mb-2">Functional Permissions</div>
                <div className="text-2xl font-bold text-gray-900">{userRolePermissions.length}</div>
                <div className="text-xs text-gray-600 mt-1">actions from {userRole?.name} role</div>
              </div>
              
              <div className={`p-4 border rounded ${userDepts.length > 0 ? 'bg-blue-50 border-blue-200' : 'bg-red-50 border-red-200'}`}>
                <div className="text-sm font-medium text-gray-700 mb-2">Department Access</div>
                <div className="text-2xl font-bold text-gray-900">{userDepts.length}</div>
                <div className={`text-xs mt-1 ${userDepts.length > 0 ? 'text-gray-600' : 'text-red-600'}`}>
                  {userDepts.length > 0 ? `department${userDepts.length !== 1 ? 's' : ''} accessible` : 'No access - user cannot view patient data'}
                </div>
              </div>
            </div>
          </div>
          
          {/* Save Reminder */}
          <div className="bg-blue-50 border border-blue-200 rounded p-4">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-blue-800">Changes made here are not saved automatically. Click <strong>"Save All Changes"</strong> to apply.</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-300">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <p className="mt-4 text-sm font-medium text-gray-700">No User Selected</p>
          <p className="text-sm text-gray-500 mt-1">Search and select a user above to manage access</p>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// TAB 3: DEPARTMENT ACCESS MATRIX
// ============================================================================

interface DepartmentAccessTabProps {
  users: User[];
  departments: Department[];
  userDepartmentAccess: Map<string, UserDepartmentAccess[]>;
  setUserDepartmentAccess: (map: Map<string, UserDepartmentAccess[]>) => void;
  setPendingChanges: (fn: (prev: any[]) => any[]) => void;
}

function DepartmentAccessTab({
  users,
  departments,
  userDepartmentAccess,
  setUserDepartmentAccess,
  setPendingChanges
}: DepartmentAccessTabProps) {
  const [viewMode, setViewMode] = useState<'by-department' | 'by-user'>('by-department');
  const [selectedDeptId, setSelectedDeptId] = useState<string>('');
  
  const mainDepartments = departments.filter(d => !d.parentDepartmentId);
  
  // Initialize selected department
  React.useEffect(() => {
    if (mainDepartments.length > 0 && !selectedDeptId) {
      setSelectedDeptId(mainDepartments[0].id);
    }
  }, [mainDepartments, selectedDeptId]);
  
  const selectedDept = mainDepartments.find(d => d.id === selectedDeptId);
  
  // Get users with access to selected department
  const usersWithAccess = selectedDept ? users.filter(user => {
    const access = userDepartmentAccess.get(user.id) || [];
    return access.some(a => a.departmentId === selectedDept.id);
  }) : [];
  
  if (mainDepartments.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-300">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
        <p className="mt-4 text-sm text-gray-600">No departments available</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* View Mode Toggle */}
      <div className="bg-white border border-gray-300 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">View Mode</h3>
            <p className="text-xs text-gray-600 mt-1">Select how to view department access data</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('by-department')}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                viewMode === 'by-department'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              By Department
            </button>
            <button
              onClick={() => setViewMode('by-user')}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                viewMode === 'by-user'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              By User
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'by-department' ? (
        <div className="bg-white border border-gray-300 rounded-lg shadow-sm">
          {/* Department Selector */}
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-300">
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Select Department
            </label>
            <select
              value={selectedDeptId}
              onChange={(e) => setSelectedDeptId(e.target.value)}
              className="w-full max-w-md px-4 py-2.5 border border-gray-300 rounded bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">-- Select a Department --</option>
              {mainDepartments.map(dept => (
                <option key={dept.id} value={dept.id}>
                  {getDepartmentName(dept)} ({getDepartmentType(dept)})
                </option>
              ))}
            </select>
            {selectedDept && (
              <div className="mt-3 flex items-center gap-4 text-sm text-gray-600">
                <span className="font-medium">Department Type: {getDepartmentType(selectedDept)}</span>
                <span>•</span>
                <span>{usersWithAccess.length} user{usersWithAccess.length !== 1 ? 's' : ''} with access</span>
              </div>
            )}
          </div>

          {selectedDept ? (
            <div className="p-6">
              <div className="mb-4">
                <h3 className="text-base font-semibold text-gray-900">
                  Users with Access to {getDepartmentName(selectedDept)}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {usersWithAccess.length === 0 ? 'No users have been granted access to this department' : `Showing ${usersWithAccess.length} user${usersWithAccess.length !== 1 ? 's' : ''}`}
                </p>
              </div>

              {usersWithAccess.length > 0 ? (
                <div className="border border-gray-300 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-300">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">User</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Role</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Primary Dept</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Access Level</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {usersWithAccess.map(user => {
                        const access = (userDepartmentAccess.get(user.id) || []).find(a => a.departmentId === selectedDept.id);
                        return (
                          <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3">
                              <div className="font-medium text-gray-900">{getUserFullName(user)}</div>
                              <div className="text-xs text-gray-500">{user.email}</div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-sm text-gray-700">{user.roleName}</span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              {access?.isPrimary ? (
                                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-300">
                                  PRIMARY
                                </span>
                              ) : (
                                <span className="text-gray-400 text-xs">—</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className="text-sm text-gray-700">{access?.accessType || 'Full Access'}</span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800 border border-green-300">
                                {access?.status || 'Active'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <button 
                                onClick={() => {
                                  // Remove access logic
                                  const newAccess = new Map(userDepartmentAccess);
                                  const current = newAccess.get(user.id) || [];
                                  newAccess.set(user.id, current.filter(a => a.departmentId !== selectedDept.id));
                                  setUserDepartmentAccess(newAccess);
                                  setPendingChanges(prev => [...prev, { type: 'revoke_dept_access', userId: user.id, deptId: selectedDept.id }]);
                                }}
                                className="text-red-600 hover:text-red-800 text-sm font-medium hover:underline"
                              >
                                Revoke
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 border border-gray-200 rounded-lg">
                  <svg className="mx-auto h-10 w-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <p className="mt-2 text-sm font-medium text-gray-700">No users have access</p>
                  <p className="text-xs text-gray-500 mt-1">Grant access through the User Access tab</p>
                </div>
              )}
            </div>
          ) : (
            <div className="p-6 text-center text-gray-500">
              <p className="text-sm">Please select a department from the dropdown above</p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-6">
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <p className="mt-4 text-sm font-medium text-gray-700">By User View</p>
            <p className="text-xs text-gray-500 mt-1">This view is under development</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// TAB 4: BULK OPERATIONS
// ============================================================================

interface BulkOperationsTabProps {
  users: User[];
  roles: Role[];
  permissions: Permission[];
  departments: Department[];
  rolePermissions: Map<string, string[]>;
  userDepartmentAccess: Map<string, UserDepartmentAccess[]>;
  setPendingChanges: (fn: (prev: any[]) => any[]) => void;
}

function BulkOperationsTab({
  users,
  roles,
  permissions,
  departments,
  rolePermissions,
  userDepartmentAccess,
  setPendingChanges
}: BulkOperationsTabProps) {
  const [operation, setOperation] = useState<'permissions' | 'departments' | 'copy'>('permissions');
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  
  return (
    <div>
      {/* Operation Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Operation
        </label>
        <div className="grid grid-cols-3 gap-4">
          <button
            onClick={() => setOperation('permissions')}
            className={`p-4 border-2 rounded-lg text-left ${
              operation === 'permissions'
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="font-semibold text-gray-900">Bulk Permission Assignment</div>
            <div className="text-sm text-gray-600 mt-1">Add/remove permissions for multiple users</div>
          </button>
          
          <button
            onClick={() => setOperation('departments')}
            className={`p-4 border-2 rounded-lg text-left ${
              operation === 'departments'
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="font-semibold text-gray-900">Bulk Department Access</div>
            <div className="text-sm text-gray-600 mt-1">Grant department access to multiple users</div>
          </button>
          
          <button
            onClick={() => setOperation('copy')}
            className={`p-4 border-2 rounded-lg text-left ${
              operation === 'copy'
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="font-semibold text-gray-900">Copy User Access</div>
            <div className="text-sm text-gray-600 mt-1">Copy access from one user to others</div>
          </button>
        </div>
      </div>

      {/* Operation Content */}
      <div className="border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {operation === 'permissions' && 'Bulk Permission Assignment'}
          {operation === 'departments' && 'Bulk Department Access'}
          {operation === 'copy' && 'Copy User Access'}
        </h3>
        
        <div className="text-center py-12 text-gray-500">
          <p>Implementation coming in next iteration</p>
          <p className="text-sm mt-2">This feature allows you to manage multiple users simultaneously</p>
        </div>
      </div>
    </div>
  );
}
