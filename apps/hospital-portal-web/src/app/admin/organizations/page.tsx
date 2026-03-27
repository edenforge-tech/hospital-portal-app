'use client';

import React, { useState } from 'react';

// ============================================================================
// Types
// ============================================================================

interface Organization {
  id: string;
  name: string;
  code: string;
  type: string;
  status: string;
  parentOrganizationName?: string;
  hierarchyLevel: number;
  totalBranches: number;
  totalUsers: number;
  phone?: string;
  email?: string;
  city?: string;
  stateProvince?: string;
}

// ============================================================================
// Components
// ============================================================================

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    inactive: 'bg-gray-100 text-gray-700',
    pending: 'bg-yellow-100 text-yellow-700',
    suspended: 'bg-red-100 text-red-700',
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || colors.pending}`}>
      {status}
    </span>
  );
}

function TypeBadge({ type }: { type: string }) {
  const colors: Record<string, string> = {
    hospital: 'bg-blue-100 text-blue-700',
    clinic: 'bg-green-100 text-green-700',
    lab: 'bg-purple-100 text-purple-700',
    pharmacy: 'bg-orange-100 text-orange-700',
    imaging_center: 'bg-cyan-100 text-cyan-700',
  };

  return (
    <span className={`px-2 py-0.5 rounded text-xs ${colors[type] || 'bg-gray-100 text-gray-700'}`}>
      {type.replace(/_/g, ' ')}
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

function TreeNode({ org, level, onSelect }: { org: any; level: number; onSelect: (org: Organization) => void }) {
  const [isExpanded, setIsExpanded] = useState(level === 0);

  return (
    <div>
      <div 
        className="flex items-center gap-2 p-3 hover:bg-gray-50 rounded-lg cursor-pointer group"
        style={{ paddingLeft: `${level * 24 + 12}px` }}
      >
        {org.children && org.children.length > 0 && (
          <button
            onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
            className="w-5 h-5 flex items-center justify-center hover:bg-gray-200 rounded"
          >
            <span className="text-gray-500">{isExpanded ? '▼' : '▶'}</span>
          </button>
        )}
        {(!org.children || org.children.length === 0) && <div className="w-5" />}
        
        <div 
          className="flex-1 flex items-center justify-between"
          onClick={() => onSelect(org)}
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">{level === 0 ? '🏢' : level === 1 ? '🏥' : '📍'}</span>
            <div>
              <p className="font-medium text-gray-900">{org.name}</p>
              <p className="text-xs text-gray-500">{org.type} • {org.totalBranches} branches • {org.totalUsers} users</p>
            </div>
          </div>
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <StatusBadge status={org.status} />
            <button className="text-blue-600 hover:text-blue-800 text-sm">View</button>
          </div>
        </div>
      </div>
      
      {isExpanded && org.children && org.children.map((child: any) => (
        <TreeNode key={child.id} org={child} level={level + 1} onSelect={onSelect} />
      ))}
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export default function OrganizationsPage() {
  const [activeTab, setActiveTab] = useState<'list' | 'hierarchy' | 'map'>('list');
  const [showNewOrgModal, setShowNewOrgModal] = useState(false);
  const [showOrgDetailModal, setShowOrgDetailModal] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Mock data
  const organizations: Organization[] = [
    {
      id: '1',
      name: 'MedCare Health System',
      code: 'MCHS',
      type: 'hospital',
      status: 'active',
      hierarchyLevel: 0,
      totalBranches: 25,
      totalUsers: 1250,
      phone: '(555) 000-0001',
      email: 'info@medcare.com',
      city: 'New York',
      stateProvince: 'NY',
    },
    {
      id: '2',
      name: 'MedCare Downtown Hospital',
      code: 'MCDT',
      type: 'hospital',
      status: 'active',
      parentOrganizationName: 'MedCare Health System',
      hierarchyLevel: 1,
      totalBranches: 8,
      totalUsers: 450,
      phone: '(555) 100-0001',
      email: 'downtown@medcare.com',
      city: 'New York',
      stateProvince: 'NY',
    },
    {
      id: '3',
      name: 'MedCare Uptown Clinic',
      code: 'MCUT',
      type: 'clinic',
      status: 'active',
      parentOrganizationName: 'MedCare Health System',
      hierarchyLevel: 1,
      totalBranches: 3,
      totalUsers: 85,
      phone: '(555) 100-0002',
      email: 'uptown@medcare.com',
      city: 'New York',
      stateProvince: 'NY',
    },
    {
      id: '4',
      name: 'MedCare Diagnostic Labs',
      code: 'MCDL',
      type: 'lab',
      status: 'active',
      parentOrganizationName: 'MedCare Health System',
      hierarchyLevel: 1,
      totalBranches: 5,
      totalUsers: 120,
      phone: '(555) 100-0003',
      email: 'labs@medcare.com',
      city: 'New York',
      stateProvince: 'NY',
    },
    {
      id: '5',
      name: 'MedCare Pharmacy Network',
      code: 'MCPN',
      type: 'pharmacy',
      status: 'active',
      parentOrganizationName: 'MedCare Health System',
      hierarchyLevel: 1,
      totalBranches: 9,
      totalUsers: 95,
      phone: '(555) 100-0004',
      email: 'pharmacy@medcare.com',
      city: 'New York',
      stateProvince: 'NY',
    },
    {
      id: '6',
      name: 'Regional Imaging Center',
      code: 'RIC',
      type: 'imaging_center',
      status: 'active',
      hierarchyLevel: 0,
      totalBranches: 4,
      totalUsers: 65,
      phone: '(555) 200-0001',
      email: 'info@regionalimaging.com',
      city: 'Boston',
      stateProvince: 'MA',
    },
    {
      id: '7',
      name: 'Community Health Partners',
      code: 'CHP',
      type: 'clinic',
      status: 'pending',
      hierarchyLevel: 0,
      totalBranches: 2,
      totalUsers: 35,
      phone: '(555) 300-0001',
      email: 'info@communityhp.com',
      city: 'Philadelphia',
      stateProvince: 'PA',
    },
  ];

  const hierarchy = [
    {
      id: '1',
      name: 'MedCare Health System',
      type: 'Hospital System',
      status: 'active',
      totalBranches: 25,
      totalUsers: 1250,
      children: [
        {
          id: '2',
          name: 'MedCare Downtown Hospital',
          type: 'Hospital',
          status: 'active',
          totalBranches: 8,
          totalUsers: 450,
          children: [],
        },
        {
          id: '3',
          name: 'MedCare Uptown Clinic',
          type: 'Clinic',
          status: 'active',
          totalBranches: 3,
          totalUsers: 85,
          children: [],
        },
        {
          id: '4',
          name: 'MedCare Diagnostic Labs',
          type: 'Laboratory',
          status: 'active',
          totalBranches: 5,
          totalUsers: 120,
          children: [],
        },
        {
          id: '5',
          name: 'MedCare Pharmacy Network',
          type: 'Pharmacy',
          status: 'active',
          totalBranches: 9,
          totalUsers: 95,
          children: [],
        },
      ],
    },
    {
      id: '6',
      name: 'Regional Imaging Center',
      type: 'Imaging Center',
      status: 'active',
      totalBranches: 4,
      totalUsers: 65,
      children: [],
    },
    {
      id: '7',
      name: 'Community Health Partners',
      type: 'Clinic',
      status: 'pending',
      totalBranches: 2,
      totalUsers: 35,
      children: [],
    },
  ];

  const filteredOrganizations = organizations.filter(org => {
    const matchesType = typeFilter === '' || org.type === typeFilter;
    const matchesStatus = statusFilter === '' || org.status === statusFilter;
    return matchesType && matchesStatus;
  });

  const handleViewOrg = (org: Organization) => {
    setSelectedOrg(org);
    setShowOrgDetailModal(true);
  };

  const totalOrgs = organizations.length;
  const totalBranches = organizations.reduce((sum, org) => sum + org.totalBranches, 0);
  const totalUsers = organizations.reduce((sum, org) => sum + org.totalUsers, 0);
  const activeOrgs = organizations.filter(org => org.status === 'active').length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Organization Management</h1>
          <p className="text-gray-500 mt-1">Manage organizational structure, settings, and relationships</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            <span>📊</span>
            Export Data
          </button>
          <button
            onClick={() => setShowNewOrgModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <span>➕</span>
            New Organization
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'list', label: 'Organization List', icon: '📋' },
            { id: 'hierarchy', label: 'Hierarchy View', icon: '🌳' },
            { id: 'map', label: 'Geographic Map', icon: '🗺️' },
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
            <MetricCard label="Total Organizations" value={totalOrgs} icon="🏢" color="bg-blue-100" />
            <MetricCard label="Active Organizations" value={activeOrgs} icon="✅" color="bg-green-100" />
            <MetricCard label="Total Branches" value={totalBranches} icon="📍" color="bg-purple-100" />
            <MetricCard label="Total Users" value={totalUsers.toLocaleString()} icon="👥" color="bg-orange-100" />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="hospital">Hospital</option>
              <option value="clinic">Clinic</option>
              <option value="lab">Laboratory</option>
              <option value="pharmacy">Pharmacy</option>
              <option value="imaging_center">Imaging Center</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
              <option value="suspended">Suspended</option>
            </select>
            <input
              type="text"
              placeholder="Search organizations..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Organizations Table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Organization</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Parent</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Branches</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Users</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredOrganizations.map((org) => (
                  <tr key={org.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{org.name}</p>
                        <p className="text-xs text-gray-500 font-mono">{org.code}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <TypeBadge type={org.type} />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{org.parentOrganizationName || '—'}</td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">{org.city}, {org.stateProvince}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{org.totalBranches}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{org.totalUsers}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={org.status} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleViewOrg(org)}
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
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Organizational Hierarchy</h3>
            <p className="text-sm text-gray-500">Explore the parent-child relationships between organizations</p>
          </div>
          <div className="space-y-1">
            {hierarchy.map((org) => (
              <TreeNode key={org.id} org={org} level={0} onSelect={handleViewOrg} />
            ))}
          </div>
        </div>
      )}

      {/* Map Tab */}
      {activeTab === 'map' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
            <div className="text-center">
              <span className="text-6xl">🗺️</span>
              <p className="mt-4 text-gray-600">Geographic distribution map would be displayed here</p>
              <p className="text-sm text-gray-500 mt-2">Integration with mapping service required</p>
            </div>
          </div>
        </div>
      )}

      {/* New Organization Modal */}
      {showNewOrgModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Create New Organization</h2>
                <button
                  onClick={() => setShowNewOrgModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <form className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Organization Name *</label>
                    <input type="text" placeholder="e.g., MedCare Hospital" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Organization Code *</label>
                    <input type="text" placeholder="e.g., MCH" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                      <option value="">Select type...</option>
                      <option value="hospital">Hospital</option>
                      <option value="clinic">Clinic</option>
                      <option value="lab">Laboratory</option>
                      <option value="pharmacy">Pharmacy</option>
                      <option value="imaging_center">Imaging Center</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Parent Organization</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                      <option value="">None (Top Level)</option>
                      {organizations.filter(o => o.hierarchyLevel === 0).map(org => (
                        <option key={org.id} value={org.id}>{org.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input type="tel" placeholder="(555) 000-0000" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input type="email" placeholder="info@organization.com" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input type="text" placeholder="Street Address" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 mb-2" />
                  <div className="grid grid-cols-3 gap-2">
                    <input type="text" placeholder="City" className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                    <input type="text" placeholder="State" className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                    <input type="text" placeholder="ZIP Code" className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Brief description of the organization..."
                  />
                </div>
              </form>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setShowNewOrgModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Create Organization
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Organization Detail Modal */}
      {showOrgDetailModal && selectedOrg && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-xl font-semibold text-gray-900">{selectedOrg.name}</h2>
                    <StatusBadge status={selectedOrg.status} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono text-gray-500">{selectedOrg.code}</span>
                    <TypeBadge type={selectedOrg.type} />
                  </div>
                </div>
                <button
                  onClick={() => setShowOrgDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">📞 Contact Information</h3>
                  <p className="text-sm"><span className="text-gray-500">Phone:</span> {selectedOrg.phone}</p>
                  <p className="text-sm"><span className="text-gray-500">Email:</span> {selectedOrg.email}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">📍 Location</h3>
                  <p className="text-sm text-gray-900">{selectedOrg.city}, {selectedOrg.stateProvince}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{selectedOrg.totalBranches}</p>
                  <p className="text-sm text-gray-600">Branches</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{selectedOrg.totalUsers}</p>
                  <p className="text-sm text-gray-600">Users</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">{selectedOrg.hierarchyLevel}</p>
                  <p className="text-sm text-gray-600">Hierarchy Level</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  🏢 View Branches
                </button>
                <button className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  👥 View Users
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
