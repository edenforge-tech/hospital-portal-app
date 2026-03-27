'use client';

import { useState } from 'react';
import { Plus, Search, Edit, Trash2, Building2, Users, MapPin, Calendar, Download, ChevronRight, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { AdvancedFilters, ActiveFilters, FilterGroup } from '@/components/ui/advanced-filters';
import { Pagination } from '@/components/ui/pagination';
import { cn } from '@/lib/utils';

interface Organization {
  id: string;
  name: string;
  code: string;
  type: 'hospital' | 'clinic' | 'diagnostic-center' | 'pharmacy';
  parentId: string | null;
  parentName: string | null;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  branchCount: number;
  employeeCount: number;
  licenseNumber: string;
  licenseExpiryDate: Date;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: Date;
}

const mockOrganizations: Organization[] = [
  {
    id: '1',
    name: 'Vision Care Hospital Network',
    code: 'VCHN',
    type: 'hospital',
    parentId: null,
    parentName: null,
    contactPerson: 'Dr. Robert Williams',
    email: 'contact@visioncare.com',
    phone: '+1 (555) 123-4567',
    address: '123 Main Street',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    branchCount: 5,
    employeeCount: 250,
    licenseNumber: 'HOSP-2024-001',
    licenseExpiryDate: new Date(2026, 11, 31),
    status: 'active',
    createdAt: new Date(2024, 0, 15),
  },
  {
    id: '2',
    name: 'Metro Eye Clinic',
    code: 'MEC',
    type: 'clinic',
    parentId: '1',
    parentName: 'Vision Care Hospital Network',
    contactPerson: 'Dr. Sarah Johnson',
    email: 'metro@visioncare.com',
    phone: '+1 (555) 234-5678',
    address: '456 Park Avenue',
    city: 'New York',
    state: 'NY',
    zipCode: '10002',
    branchCount: 2,
    employeeCount: 45,
    licenseNumber: 'CLIN-2024-015',
    licenseExpiryDate: new Date(2026, 5, 30),
    status: 'active',
    createdAt: new Date(2024, 2, 10),
  },
  {
    id: '3',
    name: 'EyeCare Diagnostics',
    code: 'ECD',
    type: 'diagnostic-center',
    parentId: '1',
    parentName: 'Vision Care Hospital Network',
    contactPerson: 'Dr. Michael Chen',
    email: 'diagnostics@visioncare.com',
    phone: '+1 (555) 345-6789',
    address: '789 Broadway',
    city: 'New York',
    state: 'NY',
    zipCode: '10003',
    branchCount: 1,
    employeeCount: 20,
    licenseNumber: 'DIAG-2024-008',
    licenseExpiryDate: new Date(2026, 8, 15),
    status: 'active',
    createdAt: new Date(2024, 4, 20),
  },
  {
    id: '4',
    name: 'OptiPharm Solutions',
    code: 'OPS',
    type: 'pharmacy',
    parentId: null,
    parentName: null,
    contactPerson: 'James Miller',
    email: 'contact@optipharm.com',
    phone: '+1 (555) 456-7890',
    address: '321 5th Avenue',
    city: 'Brooklyn',
    state: 'NY',
    zipCode: '11201',
    branchCount: 3,
    employeeCount: 35,
    licenseNumber: 'PHAR-2024-022',
    licenseExpiryDate: new Date(2027, 2, 31),
    status: 'active',
    createdAt: new Date(2024, 6, 5),
  },
  {
    id: '5',
    name: 'Riverside Eye Center',
    code: 'REC',
    type: 'clinic',
    parentId: null,
    parentName: null,
    contactPerson: 'Dr. Emily Roberts',
    email: 'contact@riverside-eye.com',
    phone: '+1 (555) 567-8901',
    address: '654 River Road',
    city: 'Jersey City',
    state: 'NJ',
    zipCode: '07302',
    branchCount: 1,
    employeeCount: 18,
    licenseNumber: 'CLIN-2024-031',
    licenseExpiryDate: new Date(2025, 11, 31),
    status: 'suspended',
    createdAt: new Date(2024, 8, 12),
  },
];

const organizationTypes = [
  { value: 'hospital', label: 'Hospital', icon: Building2 },
  { value: 'clinic', label: 'Clinic', icon: Building },
  { value: 'diagnostic-center', label: 'Diagnostic Center', icon: Building },
  { value: 'pharmacy', label: 'Pharmacy', icon: Building },
];

const statusColors = {
  active: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  inactive: 'bg-gray-100 text-gray-800 border-gray-300',
  suspended: 'bg-red-100 text-red-800 border-red-300',
};

export function OrganizationsManagement() {
  const [organizations, setOrganizations] = useState<Organization[]>(mockOrganizations);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null);
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
    code: '',
    type: 'clinic' as 'hospital' | 'clinic' | 'diagnostic-center' | 'pharmacy',
    parentId: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    licenseNumber: '',
    licenseExpiryDate: '',
    status: 'active' as 'active' | 'inactive' | 'suspended',
  });

  // Filter groups configuration
  const filterGroups: FilterGroup[] = [
    {
      id: 'status',
      label: 'Status',
      options: [
        { label: 'Active', value: 'active', count: organizations.filter(o => o.status === 'active').length },
        { label: 'Inactive', value: 'inactive', count: organizations.filter(o => o.status === 'inactive').length },
        { label: 'Suspended', value: 'suspended', count: organizations.filter(o => o.status === 'suspended').length },
      ],
    },
    {
      id: 'type',
      label: 'Type',
      options: [
        { label: 'Hospital', value: 'hospital', count: organizations.filter(o => o.type === 'hospital').length },
        { label: 'Clinic', value: 'clinic', count: organizations.filter(o => o.type === 'clinic').length },
        { label: 'Diagnostic Center', value: 'diagnostic-center', count: organizations.filter(o => o.type === 'diagnostic-center').length },
        { label: 'Pharmacy', value: 'pharmacy', count: organizations.filter(o => o.type === 'pharmacy').length },
      ],
    },
    {
      id: 'hasParent',
      label: 'Hierarchy',
      options: [
        { label: 'Parent Organizations', value: 'parent', count: organizations.filter(o => o.parentId === null).length },
        { label: 'Child Organizations', value: 'child', count: organizations.filter(o => o.parentId !== null).length },
      ],
    },
  ];

  const filteredOrganizations = organizations.filter(org => {
    // Search filter
    const matchesSearch = org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.contactPerson.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Status filter
    const statusFilters = selectedFilters.status || [];
    const matchesStatus = statusFilters.length === 0 || statusFilters.includes(org.status);
    
    // Type filter
    const typeFilters = selectedFilters.type || [];
    const matchesType = typeFilters.length === 0 || typeFilters.includes(org.type);
    
    // Hierarchy filter
    const hierarchyFilters = selectedFilters.hasParent || [];
    const matchesHierarchy = hierarchyFilters.length === 0 ||
      (hierarchyFilters.includes('parent') && org.parentId === null) ||
      (hierarchyFilters.includes('child') && org.parentId !== null);
    
    // Date range filter
    const matchesDateRange = (!dateRange.from || org.createdAt >= dateRange.from) &&
      (!dateRange.to || org.createdAt <= dateRange.to);
    
    return matchesSearch && matchesStatus && matchesType && matchesHierarchy && matchesDateRange;
  });

  // Sorting function
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  // Sort organizations
  const sortedOrganizations = [...filteredOrganizations].sort((a, b) => {
    let aValue: any = a[sortColumn as keyof Organization];
    let bValue: any = b[sortColumn as keyof Organization];

    if (aValue === null) return 1;
    if (bValue === null) return -1;

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
  const totalPages = Math.ceil(sortedOrganizations.length / itemsPerPage);
  const paginatedOrganizations = sortedOrganizations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1);
  };

  const handleCreate = () => {
    const newOrganization: Organization = {
      id: String(organizations.length + 1),
      name: formData.name,
      code: formData.code,
      type: formData.type,
      parentId: formData.parentId || null,
      parentName: organizations.find(o => o.id === formData.parentId)?.name || null,
      contactPerson: formData.contactPerson,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      zipCode: formData.zipCode,
      branchCount: 0,
      employeeCount: 0,
      licenseNumber: formData.licenseNumber,
      licenseExpiryDate: new Date(formData.licenseExpiryDate),
      status: formData.status,
      createdAt: new Date(),
    };
    
    setOrganizations([...organizations, newOrganization]);
    setShowCreateModal(false);
    resetForm();
  };

  const handleEdit = () => {
    if (!selectedOrganization) return;
    
    const updatedOrganizations = organizations.map(org =>
      org.id === selectedOrganization.id
        ? {
            ...org,
            name: formData.name,
            code: formData.code,
            type: formData.type,
            parentId: formData.parentId || null,
            parentName: organizations.find(o => o.id === formData.parentId)?.name || null,
            contactPerson: formData.contactPerson,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            zipCode: formData.zipCode,
            licenseNumber: formData.licenseNumber,
            licenseExpiryDate: new Date(formData.licenseExpiryDate),
            status: formData.status,
          }
        : org
    );
    
    setOrganizations(updatedOrganizations);
    setShowEditModal(false);
    setSelectedOrganization(null);
    resetForm();
  };

  const handleDelete = () => {
    if (!selectedOrganization) return;
    
    setOrganizations(organizations.filter(org => org.id !== selectedOrganization.id));
    setShowDeleteModal(false);
    setSelectedOrganization(null);
  };

  const openEditModal = (org: Organization) => {
    setSelectedOrganization(org);
    setFormData({
      name: org.name,
      code: org.code,
      type: org.type,
      parentId: org.parentId || '',
      contactPerson: org.contactPerson,
      email: org.email,
      phone: org.phone,
      address: org.address,
      city: org.city,
      state: org.state,
      zipCode: org.zipCode,
      licenseNumber: org.licenseNumber,
      licenseExpiryDate: org.licenseExpiryDate.toISOString().split('T')[0],
      status: org.status,
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (org: Organization) => {
    setSelectedOrganization(org);
    setShowDeleteModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      type: 'clinic',
      parentId: '',
      contactPerson: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      licenseNumber: '',
      licenseExpiryDate: '',
      status: 'active',
    });
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Code', 'Type', 'Parent Organization', 'Contact Person', 'Email', 'Phone', 'City', 'State', 'Branches', 'Employees', 'License Number', 'License Expiry', 'Status', 'Created Date'];
    const rows = sortedOrganizations.map(org => [
      org.name,
      org.code,
      org.type,
      org.parentName || 'N/A',
      org.contactPerson,
      org.email,
      org.phone,
      org.city,
      org.state,
      org.branchCount,
      org.employeeCount,
      org.licenseNumber,
      org.licenseExpiryDate.toLocaleDateString(),
      org.status,
      org.createdAt.toLocaleDateString(),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `organizations-${new Date().toISOString().split('T')[0]}.csv`;
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

  const getLicenseStatus = (expiryDate: Date) => {
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) return { label: 'Expired', color: 'text-red-600' };
    if (daysUntilExpiry <= 30) return { label: `Expires in ${daysUntilExpiry} days`, color: 'text-amber-600' };
    if (daysUntilExpiry <= 90) return { label: `Expires in ${Math.ceil(daysUntilExpiry / 30)} months`, color: 'text-blue-600' };
    return { label: 'Valid', color: 'text-emerald-600' };
  };

  // Statistics
  const stats = {
    total: organizations.length,
    active: organizations.filter(o => o.status === 'active').length,
    totalBranches: organizations.reduce((sum, o) => sum + o.branchCount, 0),
    totalEmployees: organizations.reduce((sum, o) => sum + o.employeeCount, 0),
    expiringSoon: organizations.filter(o => {
      const days = Math.ceil((o.licenseExpiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      return days > 0 && days <= 90;
    }).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900">Organizations Management</h1>
          <p className="text-sm text-gray-600 mt-1">Manage healthcare organizations, licenses, and hierarchy</p>
        </div>
        <Button
          variant="primary"
          size="md"
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={() => setShowCreateModal(true)}
        >
          New Organization
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Organizations</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
            </div>
            <Building2 className="h-8 w-8 text-blue-500" />
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.active}</p>
            </div>
            <Building2 className="h-8 w-8 text-emerald-500" />
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Branches</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">{stats.totalBranches}</p>
            </div>
            <MapPin className="h-8 w-8 text-purple-500" />
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Employees</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalEmployees}</p>
            </div>
            <Users className="h-8 w-8 text-gray-500" />
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Licenses Expiring</p>
              <p className="text-2xl font-bold text-amber-600 mt-1">{stats.expiringSoon}</p>
            </div>
            <Calendar className="h-8 w-8 text-amber-500" />
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search organizations by name, code, city, or contact person..."
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

      {/* Organizations Table */}
      <Card>
        <Table caption="List of healthcare organizations">
          <TableHeader>
            <TableRow>
              <TableHead 
                sortable 
                sortDirection={sortColumn === 'name' ? sortDirection : 'none'}
                onSort={() => handleSort('name')}
              >
                Organization
              </TableHead>
              <TableHead 
                sortable 
                sortDirection={sortColumn === 'type' ? sortDirection : 'none'}
                onSort={() => handleSort('type')}
              >
                Type
              </TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Location</TableHead>
              <TableHead 
                sortable 
                sortDirection={sortColumn === 'branchCount' ? sortDirection : 'none'}
                onSort={() => handleSort('branchCount')}
              >
                Branches
              </TableHead>
              <TableHead>License</TableHead>
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
            {paginatedOrganizations.map((org) => {
              const licenseStatus = getLicenseStatus(org.licenseExpiryDate);
              
              return (
                <TableRow key={org.id}>
                  <TableCell>
                    <div>
                      <p className="font-semibold text-gray-900">{org.name}</p>
                      <p className="text-xs text-gray-500 mt-1">Code: {org.code}</p>
                      {org.parentName && (
                        <div className="flex items-center gap-1 mt-1 text-xs text-gray-600">
                          <ChevronRight className="h-3 w-3" />
                          <span>Child of {org.parentName}</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {organizationTypes.find(t => t.value === org.type)?.label}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p className="font-medium text-gray-900">{org.contactPerson}</p>
                      <p className="text-gray-600">{org.email}</p>
                      <p className="text-gray-500">{org.phone}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-700">
                      <p>{org.city}, {org.state}</p>
                      <p className="text-gray-500">{org.zipCode}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p className="font-medium text-gray-900">{org.branchCount}</p>
                      <p className="text-xs text-gray-500">{org.employeeCount} employees</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p className="font-medium text-gray-900">{org.licenseNumber}</p>
                      <p className={cn('text-xs font-medium mt-1', licenseStatus.color)}>
                        {licenseStatus.label}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={cn('inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border', statusColors[org.status])}>
                      {org.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditModal(org)}
                        aria-label={`Edit ${org.name}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDeleteModal(org)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        aria-label={`Delete ${org.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        
        {sortedOrganizations.length > 0 && (
          <div className="border-t border-gray-200 p-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={sortedOrganizations.length}
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
          setSelectedOrganization(null);
          resetForm();
        }
      }}>
        <DialogContent size="xl" className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {showCreateModal ? 'Create New Organization' : 'Edit Organization'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900">Basic Information</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Organization Name"
                  placeholder="e.g., Vision Care Hospital"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
                <Input
                  label="Organization Code"
                  placeholder="e.g., VCH"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Organization Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full h-10 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    required
                  >
                    {organizationTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Parent Organization
                  </label>
                  <select
                    className="w-full h-10 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={formData.parentId}
                    onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                  >
                    <option value="">None (Top-level organization)</option>
                    {organizations
                      .filter(o => o.id !== selectedOrganization?.id)
                      .map((org) => (
                        <option key={org.id} value={org.id}>
                          {org.name} ({org.code})
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4 pt-4 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900">Contact Information</h3>
              
              <Input
                label="Contact Person"
                placeholder="e.g., Dr. John Smith"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Email"
                  type="email"
                  placeholder="contact@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
                <Input
                  label="Phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Address Information */}
            <div className="space-y-4 pt-4 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900">Address</h3>
              
              <Input
                label="Street Address"
                placeholder="123 Main Street"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required
              />

              <div className="grid grid-cols-3 gap-4">
                <Input
                  label="City"
                  placeholder="New York"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  required
                />
                <Input
                  label="State"
                  placeholder="NY"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value.toUpperCase() })}
                  required
                />
                <Input
                  label="ZIP Code"
                  placeholder="10001"
                  value={formData.zipCode}
                  onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* License Information */}
            <div className="space-y-4 pt-4 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900">License Information</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="License Number"
                  placeholder="HOSP-2024-001"
                  value={formData.licenseNumber}
                  onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value.toUpperCase() })}
                  required
                />
                <Input
                  label="License Expiry Date"
                  type="date"
                  value={formData.licenseExpiryDate}
                  onChange={(e) => setFormData({ ...formData, licenseExpiryDate: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Status */}
            <div className="pt-4 border-t border-gray-200">
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
                <option value="suspended">Suspended</option>
              </select>
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
              disabled={!formData.name || !formData.code || !formData.contactPerson || !formData.email || !formData.licenseNumber}
            >
              {showCreateModal ? 'Create Organization' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>Delete Organization</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-gray-700">
              Are you sure you want to delete <span className="font-semibold">{selectedOrganization?.name}</span>?
            </p>
            {selectedOrganization && selectedOrganization.branchCount > 0 && (
              <p className="text-sm text-amber-600 mt-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
                ⚠️ This organization has {selectedOrganization.branchCount} branch(es). Deleting it may affect related data.
              </p>
            )}
            <p className="text-sm text-gray-600 mt-2">
              This action cannot be undone.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Delete Organization
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
