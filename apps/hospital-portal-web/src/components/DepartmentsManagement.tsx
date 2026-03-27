'use client';

import { useState } from 'react';
import { Plus, Search, Edit, Trash2, Users, Building, MapPin, TrendingUp, Activity, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { AdvancedFilters, ActiveFilters, FilterGroup } from '@/components/ui/advanced-filters';
import { Pagination } from '@/components/ui/pagination';
import { cn } from '@/lib/utils';

interface Department {
  id: string;
  name: string;
  code: string;
  branchName: string;
  branchId: string;
  headOfDepartment: string | null;
  headOfDepartmentId: string | null;
  totalStaff: number;
  maxCapacity: number;
  currentOccupancy: number;
  status: 'active' | 'inactive' | 'maintenance';
  isClinical: boolean;
  createdAt: Date;
}

interface Branch {
  id: string;
  name: string;
  location: string;
}

interface Doctor {
  id: string;
  name: string;
  specialization: string;
}

const mockBranches: Branch[] = [
  { id: '1', name: 'Main Hospital', location: 'Downtown' },
  { id: '2', name: 'North Branch', location: 'North District' },
  { id: '3', name: 'Eye Care Center', location: 'Medical Plaza' },
];

const mockDoctors: Doctor[] = [
  { id: '1', name: 'Dr. Sarah Johnson', specialization: 'Ophthalmology' },
  { id: '2', name: 'Dr. Michael Chen', specialization: 'Retina Specialist' },
  { id: '3', name: 'Dr. James Lee', specialization: 'Optometry' },
  { id: '4', name: 'Dr. Emily Roberts', specialization: 'Glaucoma Specialist' },
];

const mockDepartments: Department[] = [
  {
    id: '1',
    name: 'Ophthalmology',
    code: 'OPHT',
    branchName: 'Main Hospital',
    branchId: '1',
    headOfDepartment: 'Dr. Sarah Johnson',
    headOfDepartmentId: '1',
    totalStaff: 25,
    maxCapacity: 50,
    currentOccupancy: 32,
    status: 'active',
    isClinical: true,
    createdAt: new Date(2025, 0, 15),
  },
  {
    id: '2',
    name: 'Retina Clinic',
    code: 'RET',
    branchName: 'Eye Care Center',
    branchId: '3',
    headOfDepartment: 'Dr. Michael Chen',
    headOfDepartmentId: '2',
    totalStaff: 15,
    maxCapacity: 30,
    currentOccupancy: 18,
    status: 'active',
    isClinical: true,
    createdAt: new Date(2025, 1, 1),
  },
  {
    id: '3',
    name: 'Optometry',
    code: 'OPT',
    branchName: 'North Branch',
    branchId: '2',
    headOfDepartment: 'Dr. James Lee',
    headOfDepartmentId: '3',
    totalStaff: 12,
    maxCapacity: 25,
    currentOccupancy: 15,
    status: 'active',
    isClinical: true,
    createdAt: new Date(2025, 2, 10),
  },
  {
    id: '4',
    name: 'Administration',
    code: 'ADM',
    branchName: 'Main Hospital',
    branchId: '1',
    headOfDepartment: null,
    headOfDepartmentId: null,
    totalStaff: 8,
    maxCapacity: 15,
    currentOccupancy: 8,
    status: 'active',
    isClinical: false,
    createdAt: new Date(2024, 11, 1),
  },
  {
    id: '5',
    name: 'Glaucoma Clinic',
    code: 'GLAU',
    branchName: 'Main Hospital',
    branchId: '1',
    headOfDepartment: 'Dr. Emily Roberts',
    headOfDepartmentId: '4',
    totalStaff: 10,
    maxCapacity: 20,
    currentOccupancy: 12,
    status: 'maintenance',
    isClinical: true,
    createdAt: new Date(2025, 3, 5),
  },
];

const statusColors = {
  active: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  inactive: 'bg-gray-100 text-gray-800 border-gray-300',
  maintenance: 'bg-amber-100 text-amber-800 border-amber-300',
};

export function DepartmentsManagement() {
  const [departments, setDepartments] = useState<Department[]>(mockDepartments);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
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
    branchId: '',
    headOfDepartmentId: '',
    maxCapacity: 20,
    isClinical: true,
    status: 'active' as 'active' | 'inactive' | 'maintenance',
  });

  // Filter groups configuration
  const filterGroups: FilterGroup[] = [
    {
      id: 'status',
      label: 'Status',
      options: [
        { label: 'Active', value: 'active', count: departments.filter(d => d.status === 'active').length },
        { label: 'Inactive', value: 'inactive', count: departments.filter(d => d.status === 'inactive').length },
        { label: 'Maintenance', value: 'maintenance', count: departments.filter(d => d.status === 'maintenance').length },
      ],
    },
    {
      id: 'type',
      label: 'Type',
      options: [
        { label: 'Clinical', value: 'clinical', count: departments.filter(d => d.isClinical).length },
        { label: 'Non-Clinical', value: 'non-clinical', count: departments.filter(d => !d.isClinical).length },
      ],
    },
    {
      id: 'branch',
      label: 'Branch',
      options: mockBranches.map(b => ({
        label: b.name,
        value: b.id,
        count: departments.filter(d => d.branchId === b.id).length,
      })),
    },
  ];

  const filteredDepartments = departments.filter(dept => {
    // Search filter
    const matchesSearch = dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dept.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dept.branchName.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Status filter
    const statusFilters = selectedFilters.status || [];
    const matchesStatus = statusFilters.length === 0 || statusFilters.includes(dept.status);
    
    // Type filter
    const typeFilters = selectedFilters.type || [];
    const matchesType = typeFilters.length === 0 || 
      (typeFilters.includes('clinical') && dept.isClinical) ||
      (typeFilters.includes('non-clinical') && !dept.isClinical);
    
    // Branch filter
    const branchFilters = selectedFilters.branch || [];
    const matchesBranch = branchFilters.length === 0 || branchFilters.includes(dept.branchId);
    
    // Date range filter
    const matchesDateRange = (!dateRange.from || dept.createdAt >= dateRange.from) &&
      (!dateRange.to || dept.createdAt <= dateRange.to);
    
    return matchesSearch && matchesStatus && matchesType && matchesBranch && matchesDateRange;
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

  // Sort departments
  const sortedDepartments = [...filteredDepartments].sort((a, b) => {
    let aValue: any = a[sortColumn as keyof Department];
    let bValue: any = b[sortColumn as keyof Department];

    // Handle null values
    if (aValue === null) return 1;
    if (bValue === null) return -1;

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
  const totalPages = Math.ceil(sortedDepartments.length / itemsPerPage);
  const paginatedDepartments = sortedDepartments.slice(
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

  const handleCreate = () => {
    const newDepartment: Department = {
      id: String(departments.length + 1),
      name: formData.name,
      code: formData.code,
      branchId: formData.branchId,
      branchName: mockBranches.find(b => b.id === formData.branchId)?.name || '',
      headOfDepartmentId: formData.headOfDepartmentId || null,
      headOfDepartment: mockDoctors.find(d => d.id === formData.headOfDepartmentId)?.name || null,
      maxCapacity: formData.maxCapacity,
      currentOccupancy: 0,
      totalStaff: 0,
      status: formData.status,
      isClinical: formData.isClinical,
      createdAt: new Date(),
    };
    
    setDepartments([...departments, newDepartment]);
    setShowCreateModal(false);
    resetForm();
  };

  const handleEdit = () => {
    if (!selectedDepartment) return;
    
    const updatedDepartments = departments.map(dept =>
      dept.id === selectedDepartment.id
        ? {
            ...dept,
            name: formData.name,
            code: formData.code,
            branchId: formData.branchId,
            branchName: mockBranches.find(b => b.id === formData.branchId)?.name || dept.branchName,
            headOfDepartmentId: formData.headOfDepartmentId || null,
            headOfDepartment: mockDoctors.find(d => d.id === formData.headOfDepartmentId)?.name || null,
            maxCapacity: formData.maxCapacity,
            status: formData.status,
            isClinical: formData.isClinical,
          }
        : dept
    );
    
    setDepartments(updatedDepartments);
    setShowEditModal(false);
    setSelectedDepartment(null);
    resetForm();
  };

  const handleDelete = () => {
    if (!selectedDepartment) return;
    
    setDepartments(departments.filter(dept => dept.id !== selectedDepartment.id));
    setShowDeleteModal(false);
    setSelectedDepartment(null);
  };

  const openEditModal = (dept: Department) => {
    setSelectedDepartment(dept);
    setFormData({
      name: dept.name,
      code: dept.code,
      branchId: dept.branchId,
      headOfDepartmentId: dept.headOfDepartmentId || '',
      maxCapacity: dept.maxCapacity,
      isClinical: dept.isClinical,
      status: dept.status,
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (dept: Department) => {
    setSelectedDepartment(dept);
    setShowDeleteModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      branchId: '',
      headOfDepartmentId: '',
      maxCapacity: 20,
      isClinical: true,
      status: 'active',
    });
  };

  const getOccupancyPercentage = (current: number, max: number) => {
    return Math.round((current / max) * 100);
  };

  const getOccupancyColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-amber-500';
    if (percentage >= 50) return 'bg-blue-500';
    return 'bg-emerald-500';
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Code', 'Branch', 'Head of Department', 'Staff', 'Capacity', 'Occupancy %', 'Type', 'Status', 'Created Date'];
    const rows = filteredDepartments.map(dept => [
      dept.name,
      dept.code,
      dept.branchName,
      dept.headOfDepartment || 'Not assigned',
      dept.totalStaff,
      dept.maxCapacity,
      getOccupancyPercentage(dept.currentOccupancy, dept.maxCapacity),
      dept.isClinical ? 'Clinical' : 'Non-Clinical',
      dept.status,
      dept.createdAt.toLocaleDateString(),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `departments-${new Date().toISOString().split('T')[0]}.csv`;
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
    total: departments.length,
    active: departments.filter(d => d.status === 'active').length,
    clinical: departments.filter(d => d.isClinical).length,
    totalStaff: departments.reduce((sum, d) => sum + d.totalStaff, 0),
    avgOccupancy: Math.round(
      departments.reduce((sum, d) => sum + getOccupancyPercentage(d.currentOccupancy, d.maxCapacity), 0) / departments.length
    ),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900">Departments Management</h1>
          <p className="text-sm text-gray-600 mt-1">Manage hospital departments, staff allocation, and capacity</p>
        </div>
        <Button
          variant="primary"
          size="md"
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={() => setShowCreateModal(true)}
        >
          New Department
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Departments</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
            </div>
            <Building className="h-8 w-8 text-blue-500" />
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.active}</p>
            </div>
            <Activity className="h-8 w-8 text-emerald-500" />
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Clinical Depts</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">{stats.clinical}</p>
            </div>
            <Users className="h-8 w-8 text-purple-500" />
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Staff</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalStaff}</p>
            </div>
            <Users className="h-8 w-8 text-gray-500" />
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Occupancy</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{stats.avgOccupancy}%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-blue-500" />
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search departments by name, code, or branch..."
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

      {/* Departments Table */}
      <Card>
        <Table caption="List of hospital departments">
          <TableHeader>
            <TableRow>
              <TableHead 
                sortable 
                sortDirection={sortColumn === 'name' ? sortDirection : 'none'}
                onSort={() => handleSort('name')}
              >
                Department
              </TableHead>
              <TableHead 
                sortable 
                sortDirection={sortColumn === 'branchName' ? sortDirection : 'none'}
                onSort={() => handleSort('branchName')}
              >
                Branch
              </TableHead>
              <TableHead>Head of Department</TableHead>
              <TableHead 
                sortable 
                sortDirection={sortColumn === 'totalStaff' ? sortDirection : 'none'}
                onSort={() => handleSort('totalStaff')}
              >
                Staff
              </TableHead>
              <TableHead>Capacity</TableHead>
              <TableHead 
                sortable 
                sortDirection={sortColumn === 'isClinical' ? sortDirection : 'none'}
                onSort={() => handleSort('isClinical')}
              >
                Type
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
            {paginatedDepartments.map((dept) => {
              const occupancyPercentage = getOccupancyPercentage(dept.currentOccupancy, dept.maxCapacity);
              
              return (
                <TableRow key={dept.id}>
                  <TableCell>
                    <div>
                      <p className="font-semibold text-gray-900">{dept.name}</p>
                      <p className="text-xs text-gray-500 mt-1">Code: {dept.code}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      {dept.branchName}
                    </div>
                  </TableCell>
                  <TableCell>
                    {dept.headOfDepartment ? (
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Users className="h-4 w-4 text-gray-400" />
                        {dept.headOfDepartment}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400 italic">Not assigned</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-medium text-gray-900">{dept.totalStaff}</span>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div
                            className={cn('h-full transition-all', getOccupancyColor(occupancyPercentage))}
                            style={{ width: `${occupancyPercentage}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-600 w-12 text-right">
                          {occupancyPercentage}%
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        {dept.currentOccupancy} / {dept.maxCapacity}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {dept.isClinical ? (
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
                    <span className={cn('inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border', statusColors[dept.status])}>
                      {dept.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditModal(dept)}
                        aria-label={`Edit ${dept.name}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDeleteModal(dept)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        aria-label={`Delete ${dept.name}`}
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
        
        {sortedDepartments.length > 0 && (
          <div className="border-t border-gray-200 p-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={sortedDepartments.length}
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
          setSelectedDepartment(null);
          resetForm();
        }
      }}>
        <DialogContent size="xl">
          <DialogHeader>
            <DialogTitle>
              {showCreateModal ? 'Create New Department' : 'Edit Department'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Department Name"
                placeholder="e.g., Ophthalmology"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <Input
                label="Department Code"
                placeholder="e.g., OPHT"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Branch <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full h-10 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={formData.branchId}
                  onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                  required
                >
                  <option value="">Select a branch</option>
                  {mockBranches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name} - {branch.location}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Head of Department
                </label>
                <select
                  className="w-full h-10 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={formData.headOfDepartmentId}
                  onChange={(e) => setFormData({ ...formData, headOfDepartmentId: e.target.value })}
                >
                  <option value="">Select a doctor (optional)</option>
                  {mockDoctors.map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      {doctor.name} - {doctor.specialization}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Maximum Capacity"
                type="number"
                min="1"
                value={formData.maxCapacity}
                onChange={(e) => setFormData({ ...formData, maxCapacity: parseInt(e.target.value) || 0 })}
                helperText="Maximum number of patients/staff"
                required
              />

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
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isClinical"
                checked={formData.isClinical}
                onChange={(e) => setFormData({ ...formData, isClinical: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <label htmlFor="isClinical" className="text-sm font-medium text-gray-700">
                This is a clinical department (handles patient care)
              </label>
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
              disabled={!formData.name || !formData.code || !formData.branchId}
            >
              {showCreateModal ? 'Create Department' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>Delete Department</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-gray-700">
              Are you sure you want to delete <span className="font-semibold">{selectedDepartment?.name}</span>?
            </p>
            <p className="text-sm text-gray-600 mt-2">
              This action cannot be undone. All associated data will be permanently removed.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Delete Department
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
