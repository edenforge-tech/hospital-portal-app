'use client';

import { useState } from 'react';
import { Plus, Search, Edit, Trash2, Shield, Users, CheckCircle2, Circle, ChevronDown, ChevronRight, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { AdvancedFilters, ActiveFilters, FilterGroup } from '@/components/ui/advanced-filters';
import { Pagination } from '@/components/ui/pagination';
import { cn } from '@/lib/utils';

interface Permission {
  id: string;
  name: string;
  code: string;
  module: string;
  description: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  isClinical: boolean;
  isSystemRole: boolean;
  permissionCount: number;
  userCount: number;
  permissions: string[]; // Permission IDs
  createdAt: Date;
  status: 'active' | 'inactive';
}

const mockPermissions: Permission[] = [
  // Patient Module
  { id: '1', name: 'View Patients', code: 'patients.view', module: 'Patients', description: 'View patient records' },
  { id: '2', name: 'Create Patients', code: 'patients.create', module: 'Patients', description: 'Register new patients' },
  { id: '3', name: 'Edit Patients', code: 'patients.edit', module: 'Patients', description: 'Update patient information' },
  { id: '4', name: 'Delete Patients', code: 'patients.delete', module: 'Patients', description: 'Remove patient records' },
  
  // Appointments Module
  { id: '5', name: 'View Appointments', code: 'appointments.view', module: 'Appointments', description: 'View appointment schedule' },
  { id: '6', name: 'Create Appointments', code: 'appointments.create', module: 'Appointments', description: 'Schedule new appointments' },
  { id: '7', name: 'Edit Appointments', code: 'appointments.edit', module: 'Appointments', description: 'Modify appointments' },
  { id: '8', name: 'Cancel Appointments', code: 'appointments.cancel', module: 'Appointments', description: 'Cancel appointments' },
  
  // Clinical Module
  { id: '9', name: 'View Clinical Records', code: 'clinical.view', module: 'Clinical', description: 'Access clinical examinations' },
  { id: '10', name: 'Create Clinical Records', code: 'clinical.create', module: 'Clinical', description: 'Create examination records' },
  { id: '11', name: 'Edit Clinical Records', code: 'clinical.edit', module: 'Clinical', description: 'Update clinical data' },
  { id: '12', name: 'View Prescriptions', code: 'prescriptions.view', module: 'Clinical', description: 'View prescriptions' },
  
  // Users Module
  { id: '13', name: 'View Users', code: 'users.view', module: 'Users', description: 'View user accounts' },
  { id: '14', name: 'Create Users', code: 'users.create', module: 'Users', description: 'Create new users' },
  { id: '15', name: 'Edit Users', code: 'users.edit', module: 'Users', description: 'Modify user accounts' },
  { id: '16', name: 'Delete Users', code: 'users.delete', module: 'Users', description: 'Remove user accounts' },
  
  // Departments Module
  { id: '17', name: 'View Departments', code: 'departments.view', module: 'Departments', description: 'View departments' },
  { id: '18', name: 'Manage Departments', code: 'departments.manage', module: 'Departments', description: 'Create/edit departments' },
  
  // System Module
  { id: '19', name: 'View Audit Logs', code: 'audit.view', module: 'System', description: 'Access audit logs' },
  { id: '20', name: 'System Settings', code: 'system.settings', module: 'System', description: 'Configure system settings' },
];

const mockRoles: Role[] = [
  {
    id: '1',
    name: 'Super Admin',
    description: 'Full system access with all permissions',
    isClinical: false,
    isSystemRole: true,
    permissionCount: 20,
    userCount: 2,
    permissions: mockPermissions.map(p => p.id),
    createdAt: new Date(2024, 0, 1),
    status: 'active',
  },
  {
    id: '2',
    name: 'Ophthalmologist',
    description: 'Clinical role for eye doctors with patient care permissions',
    isClinical: true,
    isSystemRole: false,
    permissionCount: 12,
    userCount: 15,
    permissions: ['1', '2', '3', '5', '6', '7', '8', '9', '10', '11', '12', '17'],
    createdAt: new Date(2024, 1, 15),
    status: 'active',
  },
  {
    id: '3',
    name: 'Receptionist',
    description: 'Front desk staff managing appointments and patient registration',
    isClinical: false,
    isSystemRole: false,
    permissionCount: 6,
    userCount: 8,
    permissions: ['1', '2', '3', '5', '6', '7'],
    createdAt: new Date(2024, 2, 1),
    status: 'active',
  },
  {
    id: '4',
    name: 'Nurse',
    description: 'Clinical support staff with limited clinical access',
    isClinical: true,
    isSystemRole: false,
    permissionCount: 8,
    userCount: 20,
    permissions: ['1', '5', '9', '10', '12', '17'],
    createdAt: new Date(2024, 2, 10),
    status: 'active',
  },
  {
    id: '5',
    name: 'Department Manager',
    description: 'Manages department operations and staff',
    isClinical: false,
    isSystemRole: false,
    permissionCount: 10,
    userCount: 5,
    permissions: ['1', '13', '14', '15', '17', '18', '19'],
    createdAt: new Date(2024, 3, 1),
    status: 'active',
  },
];

export function RolesManagement() {
  const [roles, setRoles] = useState<Role[]>(mockRoles);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set(['Patients']));
  const [dateRange, setDateRange] = useState<{ from: Date | null; to: Date | null }>({ from: null, to: null });
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Sorting state
  const [sortColumn, setSortColumn] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isClinical: false,
    status: 'active' as 'active' | 'inactive',
    permissions: [] as string[],
  });

  // Filter groups configuration
  const filterGroups: FilterGroup[] = [
    {
      id: 'status',
      label: 'Status',
      options: [
        { label: 'Active', value: 'active', count: roles.filter(r => r.status === 'active').length },
        { label: 'Inactive', value: 'inactive', count: roles.filter(r => r.status === 'inactive').length },
      ],
    },
    {
      id: 'type',
      label: 'Type',
      options: [
        { label: 'Clinical', value: 'clinical', count: roles.filter(r => r.isClinical).length },
        { label: 'Non-Clinical', value: 'non-clinical', count: roles.filter(r => !r.isClinical).length },
        { label: 'System Role', value: 'system', count: roles.filter(r => r.isSystemRole).length },
      ],
    },
  ];

  const filteredRoles = roles.filter(role => {
    // Search filter
    const matchesSearch = role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      role.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Status filter
    const statusFilters = selectedFilters.status || [];
    const matchesStatus = statusFilters.length === 0 || statusFilters.includes(role.status);
    
    // Type filter
    const typeFilters = selectedFilters.type || [];
    const matchesType = typeFilters.length === 0 ||
      (typeFilters.includes('clinical') && role.isClinical) ||
      (typeFilters.includes('non-clinical') && !role.isClinical) ||
      (typeFilters.includes('system') && role.isSystemRole);
    
    // Date range filter
    const matchesDateRange = (!dateRange.from || role.createdAt >= dateRange.from) &&
      (!dateRange.to || role.createdAt <= dateRange.to);
    
    return matchesSearch && matchesStatus && matchesType && matchesDateRange;
  });

  // Sorting function
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
    setCurrentPage(1); // Reset to first page on sort
  };

  // Sort roles
  const sortedRoles = [...filteredRoles].sort((a, b) => {
    let aValue: any = a[sortColumn as keyof Role];
    let bValue: any = b[sortColumn as keyof Role];

    // Handle boolean values
    if (typeof aValue === 'boolean') {
      aValue = aValue ? 1 : 0;
      bValue = bValue ? 1 : 0;
    }

    // Convert to comparable values
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Pagination
  const totalPages = Math.ceil(sortedRoles.length / itemsPerPage);
  const paginatedRoles = sortedRoles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1); // Reset to first page
  };

  // Group permissions by module
  const permissionsByModule = mockPermissions.reduce((acc, permission) => {
    if (!acc[permission.module]) {
      acc[permission.module] = [];
    }
    acc[permission.module].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  const handleCreate = () => {
    const newRole: Role = {
      id: String(roles.length + 1),
      name: formData.name,
      description: formData.description,
      isClinical: formData.isClinical,
      isSystemRole: false,
      permissionCount: formData.permissions.length,
      userCount: 0,
      permissions: formData.permissions,
      createdAt: new Date(),
      status: formData.status,
    };
    
    setRoles([...roles, newRole]);
    setShowCreateModal(false);
    resetForm();
  };

  const handleEdit = () => {
    if (!selectedRole) return;
    
    const updatedRoles = roles.map(role =>
      role.id === selectedRole.id
        ? {
            ...role,
            name: formData.name,
            description: formData.description,
            isClinical: formData.isClinical,
            status: formData.status,
            permissions: formData.permissions,
            permissionCount: formData.permissions.length,
          }
        : role
    );
    
    setRoles(updatedRoles);
    setShowEditModal(false);
    setSelectedRole(null);
    resetForm();
  };

  const handleDelete = () => {
    if (!selectedRole) return;
    
    setRoles(roles.filter(role => role.id !== selectedRole.id));
    setShowDeleteModal(false);
    setSelectedRole(null);
  };

  const openEditModal = (role: Role) => {
    setSelectedRole(role);
    setFormData({
      name: role.name,
      description: role.description,
      isClinical: role.isClinical,
      status: role.status,
      permissions: role.permissions,
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (role: Role) => {
    setSelectedRole(role);
    setShowDeleteModal(true);
  };

  const openPermissionsModal = (role: Role) => {
    setSelectedRole(role);
    setShowPermissionsModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      isClinical: false,
      status: 'active',
      permissions: [],
    });
  };

  const toggleModule = (module: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(module)) {
      newExpanded.delete(module);
    } else {
      newExpanded.add(module);
    }
    setExpandedModules(newExpanded);
  };

  const togglePermission = (permissionId: string) => {
    const newPermissions = formData.permissions.includes(permissionId)
      ? formData.permissions.filter(id => id !== permissionId)
      : [...formData.permissions, permissionId];
    
    setFormData({ ...formData, permissions: newPermissions });
  };

  const toggleAllInModule = (module: string) => {
    const modulePermissions = permissionsByModule[module].map(p => p.id);
    const allSelected = modulePermissions.every(id => formData.permissions.includes(id));
    
    if (allSelected) {
      setFormData({
        ...formData,
        permissions: formData.permissions.filter(id => !modulePermissions.includes(id))
      });
    } else {
      const newPermissions = [...new Set([...formData.permissions, ...modulePermissions])];
      setFormData({ ...formData, permissions: newPermissions });
    }
  };

  const exportToCSV = () => {
    const headers = ['Role Name', 'Description', 'Type', 'Permissions Count', 'Users Count', 'Status', 'Created Date'];
    const rows = filteredRoles.map(role => [
      role.name,
      role.description,
      role.isClinical ? 'Clinical' : 'Non-Clinical',
      role.permissionCount,
      role.userCount,
      role.status,
      role.createdAt.toLocaleDateString(),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `roles-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const removeFilter = (groupId: string, value: string) => {
    const newFilters = { ...selectedFilters };
    newFilters[groupId] = (newFilters[groupId] || []).filter(v => v !== value);
    if (newFilters[groupId].length === 0) {
      delete newFilters[groupId];
    }
    setSelectedFilters(newFilters);
  };

  const clearAllFilters = () => {
    setSelectedFilters({});
    setDateRange({ from: null, to: null });
  };

  // Statistics
  const stats = {
    total: roles.length,
    active: roles.filter(r => r.status === 'active').length,
    clinical: roles.filter(r => r.isClinical).length,
    system: roles.filter(r => r.isSystemRole).length,
    totalUsers: roles.reduce((sum, r) => sum + r.userCount, 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900">Roles Management</h1>
          <p className="text-sm text-gray-600 mt-1">Define roles and assign permissions for access control</p>
        </div>
        <Button
          variant="primary"
          size="md"
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={() => setShowCreateModal(true)}
        >
          New Role
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Roles</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
            </div>
            <Shield className="h-8 w-8 text-blue-500" />
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Roles</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.active}</p>
            </div>
            <CheckCircle2 className="h-8 w-8 text-emerald-500" />
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Clinical Roles</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">{stats.clinical}</p>
            </div>
            <Shield className="h-8 w-8 text-purple-500" />
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">System Roles</p>
              <p className="text-2xl font-bold text-amber-600 mt-1">{stats.system}</p>
            </div>
            <Shield className="h-8 w-8 text-amber-500" />
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalUsers}</p>
            </div>
            <Users className="h-8 w-8 text-gray-500" />
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search roles by name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="h-4 w-4 text-gray-400" />}
              />
            </div>
            <DateRangePicker
              value={dateRange}
              onChange={setDateRange}
              placeholder="Filter by created date"
            />
            <AdvancedFilters
              filterGroups={filterGroups}
              selectedFilters={selectedFilters}
              onFiltersChange={setSelectedFilters}
            />
            <Button 
              variant="outline" 
              size="md"
              leftIcon={<Download className="h-4 w-4" />}
              onClick={exportToCSV}
            >
              Export
            </Button>
          </div>
          
          <ActiveFilters
            filterGroups={filterGroups}
            selectedFilters={selectedFilters}
            onRemoveFilter={removeFilter}
            onClearAll={clearAllFilters}
          />
        </div>
      </Card>

      {/* Roles Table */}
      <Card>
        <div className="overflow-x-auto">
        <Table caption="List of system roles and permissions">
          <TableHeader>
            <TableRow>
              <TableHead 
                sortable 
                sortDirection={sortColumn === 'name' ? sortDirection : 'none'}
                onSort={() => handleSort('name')}
              >
                Role Name
              </TableHead>
              <TableHead>Description</TableHead>
              <TableHead 
                sortable 
                sortDirection={sortColumn === 'isClinical' ? sortDirection : 'none'}
                onSort={() => handleSort('isClinical')}
              >
                Type
              </TableHead>
              <TableHead 
                sortable 
                sortDirection={sortColumn === 'permissionCount' ? sortDirection : 'none'}
                onSort={() => handleSort('permissionCount')}
              >
                Permissions
              </TableHead>
              <TableHead 
                sortable 
                sortDirection={sortColumn === 'userCount' ? sortDirection : 'none'}
                onSort={() => handleSort('userCount')}
              >
                Users
              </TableHead>
              <TableHead 
                sortable 
                sortDirection={sortColumn === 'status' ? sortDirection : 'none'}
                onSort={() => handleSort('status')}
              >
                Status
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedRoles.map((role) => (
              <TableRow key={role.id}>
                <TableCell>
                  <div>
                    <p className="font-semibold text-gray-900">{role.name}</p>
                    {role.isSystemRole && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 mt-1">
                        System Role
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <p className="text-sm text-gray-700">{role.description}</p>
                </TableCell>
                <TableCell>
                  {role.isClinical ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      Clinical
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      Non-Clinical
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <button
                    onClick={() => openPermissionsModal(role)}
                    className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    {role.permissionCount} permissions
                  </button>
                </TableCell>
                <TableCell>
                  <span className="text-sm font-medium text-gray-900">{role.userCount}</span>
                </TableCell>
                <TableCell>
                  <span className={cn(
                    'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border',
                    role.status === 'active'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : 'bg-gray-100 text-gray-800 border-gray-300'
                  )}>
                    {role.status}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditModal(role)}
                      disabled={role.isSystemRole}
                      aria-label={`Edit ${role.name}`}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openDeleteModal(role)}
                      disabled={role.isSystemRole || role.userCount > 0}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 disabled:opacity-50"
                      aria-label={`Delete ${role.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </div>
        
        {sortedRoles.length > 0 && (
          <div className="border-t border-gray-200 p-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={sortedRoles.length}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          </div>
        )}
      </Card>

      {/* Create/Edit Modal */}
      <Dialog open={showCreateModal || showEditModal} onOpenChange={(open) => {
        if (!open) {
          setShowCreateModal(false);
          setShowEditModal(false);
          setSelectedRole(null);
          resetForm();
        }
      }}>
        <DialogContent size="xl" className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {showCreateModal ? 'Create New Role' : 'Edit Role'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Basic Info */}
            <div className="space-y-4">
              <Input
                label="Role Name"
                placeholder="e.g., Ophthalmologist"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  rows={3}
                  placeholder="Describe the role's purpose and responsibilities"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isClinical"
                    checked={formData.isClinical}
                    onChange={(e) => setFormData({ ...formData, isClinical: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <label htmlFor="isClinical" className="text-sm font-medium text-gray-700">
                    Clinical Role (handles patient care)
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    className="w-full h-10 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Permissions */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900">
                  Permissions ({formData.permissions.length} selected)
                </h3>
                <span className="text-xs text-gray-500">
                  Select permissions for this role
                </span>
              </div>

              <div className="border border-gray-200 rounded-lg divide-y divide-gray-200 max-h-80 overflow-y-auto">
                {Object.entries(permissionsByModule).map(([module, permissions]) => {
                  const isExpanded = expandedModules.has(module);
                  const modulePermissionIds = permissions.map(p => p.id);
                  const selectedCount = modulePermissionIds.filter(id => 
                    formData.permissions.includes(id)
                  ).length;
                  const allSelected = selectedCount === modulePermissionIds.length;
                  const someSelected = selectedCount > 0 && !allSelected;
                  
                  return (
                    <div key={module}>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 transition-colors">
                        <button
                          onClick={() => toggleModule(module)}
                          className="flex items-center gap-2 flex-1 text-left"
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4 text-gray-600" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-gray-600" />
                          )}
                          <span className="font-medium text-gray-900">{module}</span>
                          <span className="text-xs text-gray-500">
                            ({selectedCount}/{permissions.length})
                          </span>
                        </button>
                        <button
                          onClick={() => toggleAllInModule(module)}
                          className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700"
                        >
                          {allSelected ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : someSelected ? (
                            <Circle className="h-4 w-4 fill-primary-200" />
                          ) : (
                            <Circle className="h-4 w-4" />
                          )}
                          {allSelected ? 'Deselect All' : 'Select All'}
                        </button>
                      </div>
                      
                      {isExpanded && (
                        <div className="p-3 space-y-2">
                          {permissions.map((permission) => (
                            <label
                              key={permission.id}
                              className="flex items-start gap-3 p-2 rounded hover:bg-gray-50 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={formData.permissions.includes(permission.id)}
                                onChange={() => togglePermission(permission.id)}
                                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                              />
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">
                                  {permission.name}
                                </p>
                                <p className="text-xs text-gray-500 mt-0.5">
                                  {permission.description} ({permission.code})
                                </p>
                              </div>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateModal(false);
                setShowEditModal(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={showCreateModal ? handleCreate : handleEdit}
              disabled={!formData.name || !formData.description}
            >
              {showCreateModal ? 'Create Role' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Permissions Modal */}
      <Dialog open={showPermissionsModal} onOpenChange={setShowPermissionsModal}>
        <DialogContent size="lg">
          <DialogHeader>
            <DialogTitle>
              {selectedRole?.name} - Permissions
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <div className="border border-gray-200 rounded-lg divide-y divide-gray-200 max-h-96 overflow-y-auto">
              {Object.entries(permissionsByModule).map(([module, permissions]) => {
                const rolePermissions = permissions.filter(p => 
                  selectedRole?.permissions.includes(p.id)
                );
                
                if (rolePermissions.length === 0) return null;
                
                return (
                  <div key={module} className="p-4">
                    <h4 className="font-medium text-gray-900 mb-2">
                      {module} ({rolePermissions.length})
                    </h4>
                    <ul className="space-y-1">
                      {rolePermissions.map((permission) => (
                        <li key={permission.id} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="text-gray-900">{permission.name}</span>
                            <span className="text-gray-500 ml-2">({permission.code})</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPermissionsModal(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>Delete Role</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-gray-700">
              Are you sure you want to delete <span className="font-semibold">{selectedRole?.name}</span>?
            </p>
            <p className="text-sm text-gray-600 mt-2">
              This action cannot be undone. Users with this role will lose their assigned permissions.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Delete Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
