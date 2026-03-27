'use client';

import React, { useState, useEffect } from 'react';
import { getApi } from '@/lib/api';

interface Organization {
  id: string;
  organizationName: string;
  organizationType: string;
  parentOrganizationId: string | null;
  parentOrganizationName?: string;
  headUserId: string | null;
  headUserName?: string;
  establishedDate: string;
  status: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
  email?: string;
  website?: string;
  description?: string;
}

interface OrganizationNode extends Organization {
  children: OrganizationNode[];
  isExpanded: boolean;
}

export default function OrganizationManager() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [organizationTree, setOrganizationTree] = useState<OrganizationNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    organizationName: '',
    organizationType: 'Hospital',
    parentOrganizationId: '',
    headUserId: '',
    establishedDate: '',
    status: 'active',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    phone: '',
    email: '',
    website: '',
    description: ''
  });

  useEffect(() => {
    fetchOrganizations();
  }, []);

  useEffect(() => {
    buildOrganizationTree();
  }, [organizations]);

  const fetchOrganizations = async () => {
    try {
      const api = getApi();
      const response = await api.get('/Organizations');
      setOrganizations(response.data);
    } catch (error) {
      console.error('Error fetching organizations:', error);
    } finally {
      setLoading(false);
    }
  };

  const buildOrganizationTree = () => {
    // Create a map of organizations by ID
    const orgMap = new Map<string, OrganizationNode>();
    
    organizations.forEach(org => {
      orgMap.set(org.id, {
        ...org,
        children: [],
        isExpanded: true
      });
    });

    // Build the tree structure
    const rootOrgs: OrganizationNode[] = [];
    
    orgMap.forEach(org => {
      if (org.parentOrganizationId && orgMap.has(org.parentOrganizationId)) {
        const parent = orgMap.get(org.parentOrganizationId)!;
        parent.children.push(org);
      } else {
        rootOrgs.push(org);
      }
    });

    // Sort by name at each level
    const sortChildren = (node: OrganizationNode) => {
      node.children.sort((a, b) => a.organizationName.localeCompare(b.organizationName));
      node.children.forEach(sortChildren);
    };

    rootOrgs.sort((a, b) => a.organizationName.localeCompare(b.organizationName));
    rootOrgs.forEach(sortChildren);

    setOrganizationTree(rootOrgs);
  };

  const handleCreateNew = () => {
    setEditMode(false);
    setSelectedOrg(null);
    setFormData({
      organizationName: '',
      organizationType: 'Hospital',
      parentOrganizationId: '',
      headUserId: '',
      establishedDate: '',
      status: 'active',
      address: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
      phone: '',
      email: '',
      website: '',
      description: ''
    });
    setShowModal(true);
  };

  const handleEdit = (org: Organization) => {
    setEditMode(true);
    setSelectedOrg(org);
    setFormData({
      organizationName: org.organizationName,
      organizationType: org.organizationType,
      parentOrganizationId: org.parentOrganizationId || '',
      headUserId: org.headUserId || '',
      establishedDate: org.establishedDate,
      status: org.status,
      address: org.address || '',
      city: org.city || '',
      state: org.state || '',
      postalCode: org.postalCode || '',
      country: org.country || '',
      phone: org.phone || '',
      email: org.email || '',
      website: org.website || '',
      description: org.description || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const api = getApi();
      
      if (editMode && selectedOrg) {
        await api.put(`/Organizations/${selectedOrg.id}`, formData);
      } else {
        await api.post('/Organizations', formData);
      }
      
      setShowModal(false);
      await fetchOrganizations();
    } catch (error) {
      console.error('Error saving organization:', error);
      alert('Failed to save organization');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this organization? This action cannot be undone.')) {
      return;
    }

    try {
      const api = getApi();
      await api.delete(`/Organizations/${id}`);
      await fetchOrganizations();
    } catch (error) {
      console.error('Error deleting organization:', error);
      alert('Failed to delete organization');
    }
  };

  const toggleExpand = (node: OrganizationNode) => {
    node.isExpanded = !node.isExpanded;
    setOrganizationTree([...organizationTree]);
  };

  const renderTreeNode = (node: OrganizationNode, level: number = 0) => {
    const hasChildren = node.children.length > 0;
    const matchesSearch = searchTerm === '' || 
      node.organizationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      node.organizationType.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return null;

    return (
      <div key={node.id}>
        <div
          className={`flex items-center p-3 border-b hover:bg-gray-50 transition ${
            level > 0 ? 'ml-' + (level * 8) : ''
          }`}
          style={{ marginLeft: `${level * 32}px` }}
        >
          {/* Expand/Collapse Button */}
          <button
            onClick={() => toggleExpand(node)}
            className={`mr-2 w-6 h-6 flex items-center justify-center ${
              hasChildren ? 'visible' : 'invisible'
            }`}
          >
            {hasChildren && (
              <span className="text-gray-600">
                {node.isExpanded ? '▼' : '▶'}
              </span>
            )}
          </button>

          {/* Organization Icon */}
          <div className={`mr-3 w-10 h-10 rounded-full flex items-center justify-center ${
            node.organizationType === 'Hospital' ? 'bg-blue-100 text-blue-600' :
            node.organizationType === 'Clinic' ? 'bg-green-100 text-green-600' :
            node.organizationType === 'Department' ? 'bg-purple-100 text-purple-600' :
            'bg-gray-100 text-gray-600'
          }`}>
            {node.organizationType === 'Hospital' ? '🏥' :
             node.organizationType === 'Clinic' ? '🏪' :
             node.organizationType === 'Department' ? '📋' : '🏢'}
          </div>

          {/* Organization Details */}
          <div className="flex-1">
            <div className="flex items-center">
              <h3 className="text-lg font-semibold text-gray-800">
                {node.organizationName}
              </h3>
              <span className={`ml-3 px-2 py-1 text-xs rounded-full ${
                node.status === 'active' ? 'bg-green-100 text-green-700' :
                node.status === 'inactive' ? 'bg-gray-100 text-gray-700' :
                'bg-red-100 text-red-700'
              }`}>
                {node.status}
              </span>
            </div>
            <div className="text-sm text-gray-600 mt-1">
              <span className="mr-4">Type: {node.organizationType}</span>
              {node.headUserName && <span className="mr-4">Head: {node.headUserName}</span>}
              {node.city && <span>{node.city}, {node.state}</span>}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <button
              onClick={() => handleEdit(node)}
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            >
              Edit
            </button>
            <button
              onClick={() => handleDelete(node.id)}
              className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition"
            >
              Delete
            </button>
          </div>
        </div>

        {/* Render Children */}
        {hasChildren && node.isExpanded && (
          <div>
            {node.children.map(child => renderTreeNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Organization Management</h2>
          <button
            onClick={handleCreateNew}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            + New Organization
          </button>
        </div>

        {/* Search Bar */}
        <div className="flex items-center space-x-4">
          <input
            type="text"
            placeholder="Search organizations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="text-sm text-gray-600">
            Total: {organizations.length} organizations
          </div>
        </div>
      </div>

      {/* Organization Tree */}
      <div className="border rounded-lg overflow-hidden">
        {organizationTree.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No organizations found. Create one to get started.
          </div>
        ) : (
          organizationTree.map(node => renderTreeNode(node))
        )}
      </div>

      {/* Organization Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                {editMode ? 'Edit Organization' : 'New Organization'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Organization Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.organizationName}
                    onChange={(e) => setFormData(prev => ({ ...prev, organizationName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter organization name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Organization Type *
                  </label>
                  <select
                    required
                    value={formData.organizationType}
                    onChange={(e) => setFormData(prev => ({ ...prev, organizationType: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Hospital">Hospital</option>
                    <option value="Clinic">Clinic</option>
                    <option value="Laboratory">Laboratory</option>
                    <option value="Pharmacy">Pharmacy</option>
                    <option value="Department">Department</option>
                    <option value="Research Center">Research Center</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Parent Organization
                  </label>
                  <select
                    value={formData.parentOrganizationId}
                    onChange={(e) => setFormData(prev => ({ ...prev, parentOrganizationId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">None (Root Organization)</option>
                    {organizations
                      .filter(org => !editMode || org.id !== selectedOrg?.id)
                      .map(org => (
                        <option key={org.id} value={org.id}>
                          {org.organizationName}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Head User ID
                  </label>
                  <input
                    type="text"
                    value={formData.headUserId}
                    onChange={(e) => setFormData(prev => ({ ...prev, headUserId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="User ID of organization head"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Established Date
                  </label>
                  <input
                    type="date"
                    value={formData.establishedDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, establishedDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status *
                  </label>
                  <select
                    required
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Street address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State/Province
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    value={formData.postalCode}
                    onChange={(e) => setFormData(prev => ({ ...prev, postalCode: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Website
                  </label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Additional details about the organization..."
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                >
                  {editMode ? 'Update Organization' : 'Create Organization'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
