'use client';

import React, { useState } from 'react';

// ============================================================================
// Types
// ============================================================================

interface Department {
  id: string;
  code: string;
  name: string;
  type: string;
  status: string;
  headName?: string;
  phone?: string;
  location: string;
  staffCount: number;
  totalBeds?: number;
  availableBeds?: number;
  parentDepartment?: string;
}

interface StaffMember {
  id: string;
  name: string;
  position: string;
  role: string;
  email: string;
  phone: string;
  isPrimary: boolean;
}

// ============================================================================
// Components
// ============================================================================

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    inactive: 'bg-gray-100 text-gray-700',
    under_construction: 'bg-yellow-100 text-yellow-700',
    temporarily_closed: 'bg-red-100 text-red-700',
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || colors.active}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}

function TypeBadge({ type }: { type: string }) {
  const colors: Record<string, string> = {
    clinical: 'bg-blue-100 text-blue-700',
    administrative: 'bg-purple-100 text-purple-700',
    support: 'bg-orange-100 text-orange-700',
    ancillary: 'bg-cyan-100 text-cyan-700',
  };

  return (
    <span className={`px-2 py-0.5 rounded text-xs ${colors[type] || 'bg-gray-100 text-gray-700'}`}>
      {type}
    </span>
  );
}

function MetricCard({ label, value, icon, color }: { 
  label: string; 
  value: string | number; 
  icon: string; 
  color: string;
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
          <span className="text-lg">{icon}</span>
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-sm text-gray-500">{label}</p>
        </div>
      </div>
    </div>
  );
}

function OccupancyBar({ available, total }: { available: number; total: number }) {
  const occupied = total - available;
  const percentage = Math.round((occupied / total) * 100);
  
  let color = 'bg-green-500';
  if (percentage > 80) color = 'bg-red-500';
  else if (percentage > 60) color = 'bg-yellow-500';

  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-gray-600">{occupied}/{total} beds</span>
        <span className="font-medium">{percentage}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div className={`h-2 rounded-full ${color}`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export default function DepartmentsPage() {
  const [activeTab, setActiveTab] = useState<'list' | 'hierarchy' | 'staff'>('list');
  const [showNewDepartmentModal, setShowNewDepartmentModal] = useState(false);
  const [showDepartmentDetailModal, setShowDepartmentDetailModal] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Mock data
  const departments: Department[] = [
    {
      id: '1',
      code: 'ER',
      name: 'Emergency Department',
      type: 'clinical',
      status: 'active',
      headName: 'Dr. Michael Chen',
      phone: '(555) 100-1001',
      location: 'Building A, Floor 1',
      staffCount: 45,
      totalBeds: 30,
      availableBeds: 8,
    },
    {
      id: '2',
      code: 'ICU',
      name: 'Intensive Care Unit',
      type: 'clinical',
      status: 'active',
      headName: 'Dr. Sarah Wilson',
      phone: '(555) 100-1002',
      location: 'Building A, Floor 3',
      staffCount: 38,
      totalBeds: 20,
      availableBeds: 3,
    },
    {
      id: '3',
      code: 'CARD',
      name: 'Cardiology',
      type: 'clinical',
      status: 'active',
      headName: 'Dr. Lisa Anderson',
      phone: '(555) 100-1003',
      location: 'Building B, Floor 2',
      staffCount: 25,
      totalBeds: 15,
      availableBeds: 5,
    },
    {
      id: '4',
      code: 'RAD',
      name: 'Radiology',
      type: 'ancillary',
      status: 'active',
      headName: 'Dr. James Kim',
      phone: '(555) 100-1004',
      location: 'Building A, Floor B1',
      staffCount: 18,
    },
    {
      id: '5',
      code: 'LAB',
      name: 'Laboratory',
      type: 'ancillary',
      status: 'active',
      headName: 'Dr. Emily Brown',
      phone: '(555) 100-1005',
      location: 'Building A, Floor B2',
      staffCount: 22,
    },
    {
      id: '6',
      code: 'PHARM',
      name: 'Pharmacy',
      type: 'ancillary',
      status: 'active',
      headName: 'Dr. Robert Taylor',
      phone: '(555) 100-1006',
      location: 'Building A, Floor 1',
      staffCount: 15,
    },
    {
      id: '7',
      code: 'HR',
      name: 'Human Resources',
      type: 'administrative',
      status: 'active',
      headName: 'Jennifer Martinez',
      phone: '(555) 100-2001',
      location: 'Building C, Floor 3',
      staffCount: 8,
    },
    {
      id: '8',
      code: 'FIN',
      name: 'Finance & Billing',
      type: 'administrative',
      status: 'active',
      headName: 'David Lee',
      phone: '(555) 100-2002',
      location: 'Building C, Floor 2',
      staffCount: 12,
    },
    {
      id: '9',
      code: 'MAINT',
      name: 'Facilities & Maintenance',
      type: 'support',
      status: 'active',
      headName: 'Tom Johnson',
      phone: '(555) 100-3001',
      location: 'Building D, Floor 1',
      staffCount: 20,
    },
    {
      id: '10',
      code: 'PEDS',
      name: 'Pediatrics',
      type: 'clinical',
      status: 'under_construction',
      headName: 'Dr. Amanda White',
      phone: '(555) 100-1007',
      location: 'Building B, Floor 4',
      staffCount: 15,
      totalBeds: 25,
      availableBeds: 25,
    },
  ];

  const staffMembers: StaffMember[] = [
    { id: '1', name: 'Dr. Michael Chen', position: 'Department Head', role: 'head', email: 'michael.chen@hospital.com', phone: '(555) 100-0001', isPrimary: true },
    { id: '2', name: 'Dr. Sarah Wilson', position: 'Attending Physician', role: 'staff', email: 'sarah.wilson@hospital.com', phone: '(555) 100-0002', isPrimary: true },
    { id: '3', name: 'Jane Smith, RN', position: 'Nurse Manager', role: 'manager', email: 'jane.smith@hospital.com', phone: '(555) 100-0003', isPrimary: true },
    { id: '4', name: 'John Davis, RN', position: 'Staff Nurse', role: 'staff', email: 'john.davis@hospital.com', phone: '(555) 100-0004', isPrimary: true },
    { id: '5', name: 'Emily Brown', position: 'Medical Assistant', role: 'staff', email: 'emily.brown@hospital.com', phone: '(555) 100-0005', isPrimary: false },
  ];

  const hierarchy = [
    {
      name: 'Medical Services',
      children: [
        { name: 'Emergency Department', staffCount: 45, status: 'active' },
        { name: 'Intensive Care Unit', staffCount: 38, status: 'active' },
        { name: 'Cardiology', staffCount: 25, status: 'active' },
        { name: 'Pediatrics', staffCount: 15, status: 'under_construction' },
      ],
    },
    {
      name: 'Ancillary Services',
      children: [
        { name: 'Laboratory', staffCount: 22, status: 'active' },
        { name: 'Radiology', staffCount: 18, status: 'active' },
        { name: 'Pharmacy', staffCount: 15, status: 'active' },
      ],
    },
    {
      name: 'Administrative',
      children: [
        { name: 'Human Resources', staffCount: 8, status: 'active' },
        { name: 'Finance & Billing', staffCount: 12, status: 'active' },
      ],
    },
    {
      name: 'Support Services',
      children: [
        { name: 'Facilities & Maintenance', staffCount: 20, status: 'active' },
      ],
    },
  ];

  const filteredDepartments = departments.filter(dept => {
    const matchesType = typeFilter === '' || dept.type === typeFilter;
    const matchesStatus = statusFilter === '' || dept.status === statusFilter;
    return matchesType && matchesStatus;
  });

  const handleViewDepartment = (department: Department) => {
    setSelectedDepartment(department);
    setShowDepartmentDetailModal(true);
  };

  const totalStaff = departments.reduce((sum, d) => sum + d.staffCount, 0);
  const clinicalDepts = departments.filter(d => d.type === 'clinical').length;
  const totalBeds = departments.reduce((sum, d) => sum + (d.totalBeds || 0), 0);
  const availableBeds = departments.reduce((sum, d) => sum + (d.availableBeds || 0), 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Department Management</h1>
          <p className="text-gray-500 mt-1">Manage departments, staff assignments, and organizational structure</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            <span>📊</span>
            Reports
          </button>
          <button
            onClick={() => setShowNewDepartmentModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <span>➕</span>
            New Department
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'list', label: 'Department List', icon: '📋' },
            { id: 'hierarchy', label: 'Hierarchy', icon: '🏢' },
            { id: 'staff', label: 'Staff Overview', icon: '👥' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* List Tab */}
      {activeTab === 'list' && (
        <div className="space-y-4">
          {/* Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard label="Total Departments" value={departments.length} icon="🏢" color="bg-blue-100" />
            <MetricCard label="Clinical Departments" value={clinicalDepts} icon="🏥" color="bg-green-100" />
            <MetricCard label="Total Staff" value={totalStaff} icon="👥" color="bg-purple-100" />
            <MetricCard label="Bed Capacity" value={`${totalBeds - availableBeds}/${totalBeds}`} icon="🛏️" color="bg-orange-100" />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="clinical">Clinical</option>
              <option value="administrative">Administrative</option>
              <option value="ancillary">Ancillary</option>
              <option value="support">Support</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="under_construction">Under Construction</option>
              <option value="temporarily_closed">Temporarily Closed</option>
            </select>
            <input
              type="text"
              placeholder="Search departments..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Departments Table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Head</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Staff</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Beds</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredDepartments.map((dept) => (
                  <tr key={dept.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{dept.name}</p>
                        <p className="text-xs text-gray-500 font-mono">{dept.code}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <TypeBadge type={dept.type} />
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">{dept.headName || '-'}</p>
                      <p className="text-xs text-gray-500">{dept.phone}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{dept.location}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{dept.staffCount}</td>
                    <td className="px-6 py-4" style={{ minWidth: '120px' }}>
                      {dept.totalBeds ? (
                        <OccupancyBar available={dept.availableBeds || 0} total={dept.totalBeds} />
                      ) : (
                        <span className="text-sm text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={dept.status} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleViewDepartment(dept)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          View
                        </button>
                        <button className="text-gray-600 hover:text-gray-800 text-sm">Edit</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Hierarchy Tab */}
      {activeTab === 'hierarchy' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="space-y-6">
            {hierarchy.map((parent, idx) => (
              <div key={idx} className="border-l-4 border-blue-500 pl-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{parent.name}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {parent.children.map((child, childIdx) => (
                    <div 
                      key={childIdx}
                      className={`p-4 rounded-lg border ${
                        child.status === 'active' ? 'border-gray-200 bg-white' : 'border-yellow-200 bg-yellow-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-gray-900">{child.name}</p>
                        <StatusBadge status={child.status} />
                      </div>
                      <p className="text-sm text-gray-500">{child.staffCount} staff members</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Staff Tab */}
      {activeTab === 'staff' && (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
              <option value="">All Departments</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
            <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
              <option value="">All Roles</option>
              <option value="head">Department Head</option>
              <option value="manager">Manager</option>
              <option value="supervisor">Supervisor</option>
              <option value="staff">Staff</option>
            </select>
            <input
              type="text"
              placeholder="Search staff..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Position</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Primary</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {staffMembers.map((staff) => (
                  <tr key={staff.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">{staff.name}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{staff.position}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        staff.role === 'head' ? 'bg-purple-100 text-purple-700' :
                        staff.role === 'manager' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {staff.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">{staff.email}</p>
                      <p className="text-xs text-gray-500">{staff.phone}</p>
                    </td>
                    <td className="px-6 py-4">
                      {staff.isPrimary ? (
                        <span className="text-green-600">✓ Primary</span>
                      ) : (
                        <span className="text-gray-400">Secondary</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button className="text-blue-600 hover:text-blue-800 text-sm">View</button>
                        <button className="text-gray-600 hover:text-gray-800 text-sm">Transfer</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* New Department Modal */}
      {showNewDepartmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Create New Department</h2>
                <button
                  onClick={() => setShowNewDepartmentModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <form className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department Code *</label>
                    <input type="text" placeholder="e.g., CARD" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department Name *</label>
                    <input type="text" placeholder="e.g., Cardiology" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                      <option value="">Select type...</option>
                      <option value="clinical">Clinical</option>
                      <option value="administrative">Administrative</option>
                      <option value="ancillary">Ancillary</option>
                      <option value="support">Support</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Parent Department</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                      <option value="">None (Top Level)</option>
                      <option value="medical">Medical Services</option>
                      <option value="ancillary">Ancillary Services</option>
                      <option value="admin">Administrative</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department Head</label>
                    <input type="text" placeholder="Search staff..." className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Extension</label>
                    <input type="text" placeholder="e.g., 1001" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input type="text" placeholder="e.g., Building A, Floor 2" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Beds (if applicable)</label>
                    <input type="number" placeholder="0" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cost Center Code</label>
                    <input type="text" placeholder="e.g., CC-001" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Brief description of the department..."
                  />
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded border-gray-300 text-blue-600" />
                    <span className="text-sm text-gray-700">24/7 Operations</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded border-gray-300 text-blue-600" />
                    <span className="text-sm text-gray-700">Accepts Walk-ins</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded border-gray-300 text-blue-600" />
                    <span className="text-sm text-gray-700">Emergency Department</span>
                  </label>
                </div>
              </form>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setShowNewDepartmentModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Create Department
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Department Detail Modal */}
      {showDepartmentDetailModal && selectedDepartment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-xl font-semibold text-gray-900">{selectedDepartment.name}</h2>
                    <StatusBadge status={selectedDepartment.status} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono text-gray-500">{selectedDepartment.code}</span>
                    <TypeBadge type={selectedDepartment.type} />
                  </div>
                </div>
                <button
                  onClick={() => setShowDepartmentDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">👤 Leadership</h3>
                  <p className="text-sm"><span className="text-gray-500">Head:</span> {selectedDepartment.headName}</p>
                  <p className="text-sm"><span className="text-gray-500">Phone:</span> {selectedDepartment.phone}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">📍 Location</h3>
                  <p className="text-sm text-gray-900">{selectedDepartment.location}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{selectedDepartment.staffCount}</p>
                  <p className="text-sm text-gray-600">Staff Members</p>
                </div>
                {selectedDepartment.totalBeds && (
                  <>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">{selectedDepartment.availableBeds}</p>
                      <p className="text-sm text-gray-600">Available Beds</p>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <p className="text-2xl font-bold text-orange-600">{selectedDepartment.totalBeds}</p>
                      <p className="text-sm text-gray-600">Total Beds</p>
                    </div>
                  </>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  👥 Manage Staff
                </button>
                <button className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  📊 View Metrics
                </button>
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  ✏️ Edit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
