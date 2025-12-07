'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import {
  organizationsApi,
  Organization,
  OrganizationFilters,
  OrganizationDetails,
} from '@/lib/api/organizations.api';
import { Building2, Plus, Search, Filter, Eye, Edit, Trash2, Loader2, AlertCircle, Network } from 'lucide-react';
import OrganizationFormModal from '@/components/admin/OrganizationFormModal';
import OrganizationDetailsModal from '@/components/admin/OrganizationDetailsModal';
import OrganizationHierarchyModal from '@/components/admin/OrganizationHierarchyModal';
import DeleteConfirmationModal from '@/components/admin/DeleteConfirmationModal';

export default function OrganizationsPage() {
  const { user } = useAuthStore();
  
  // State
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  // Filters & Pagination
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  
  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showHierarchyModal, setShowHierarchyModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null);
  const [selectedOrganizationDetails, setSelectedOrganizationDetails] = useState<OrganizationDetails | null>(null);

  // Load organizations
  useEffect(() => {
    loadOrganizations();
  }, [search, typeFilter, statusFilter, currentPage]);

  const loadOrganizations = async () => {
    try {
      setLoading(true);
      setError(null);

      const filters: OrganizationFilters = {
        tenantId: user?.tenantId,
        search: search || undefined,
        type: typeFilter || undefined,
        status: statusFilter || undefined,
        pageNumber: currentPage,
        pageSize,
        sortBy: 'name',
        sortOrder: 'asc',
      };

      const response = await organizationsApi.getAllOrganizations(filters);
      setOrganizations(response.organizations);
      setTotalCount(response.totalCount);
      setTotalPages(response.totalPages);
    } catch (err: any) {
      console.error('Error loading organizations:', err);
      setError(err.response?.data?.message || 'Failed to load organizations');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (organization: Organization) => {
    try {
      const details = await organizationsApi.getOrganizationById(organization.id);
      setSelectedOrganizationDetails(details);
      setShowDetailsModal(true);
    } catch (err: any) {
      console.error('Error loading organization details:', err);
      alert('Failed to load organization details');
    }
  };

  const handleEdit = async (organization: Organization) => {
    try {
      const details = await organizationsApi.getOrganizationById(organization.id);
      setSelectedOrganizationDetails(details);
      setShowEditModal(true);
    } catch (err: any) {
      console.error('Error loading organization details:', err);
      alert('Failed to load organization details');
    }
  };

  const handleDelete = (organization: Organization) => {
    setSelectedOrganization(organization);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedOrganization) return;

    // Check if organization has branches
    if (selectedOrganization.totalBranches && selectedOrganization.totalBranches > 0) {
      alert(`Cannot delete organization with ${selectedOrganization.totalBranches} branches. Please move branches to another organization first.`);
      return;
    }

    try {
      await organizationsApi.deleteOrganization(selectedOrganization.id);
      setShowDeleteModal(false);
      setSelectedOrganization(null);
      loadOrganizations();
    } catch (err: any) {
      console.error('Error deleting organization:', err);
      alert(err.response?.data?.message || 'Failed to delete organization');
    }
  };

  const handleOrganizationSaved = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setSelectedOrganizationDetails(null);
    loadOrganizations();
  };

  const getTypeColor = (type?: string) => {
    switch (type?.toLowerCase()) {
      case 'hospital': return 'bg-blue-100 text-blue-800';
      case 'clinic': return 'bg-green-100 text-green-800';
      case 'diagnostic': return 'bg-purple-100 text-purple-800';
      case 'pharmacy': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'suspended': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Building2 className="h-8 w-8 text-indigo-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Organization Management</h1>
            <p className="text-sm text-gray-600">Manage hospital organizations and their structure</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowHierarchyModal(true)}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
          >
            <Network className="h-4 w-4 mr-2" />
            View Hierarchy
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium"
          >
            
            Create Organization
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 space-y-4">
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              
              <input
                type="text"
                placeholder="Search by name or code..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">All Types</option>
            <option value="Hospital">Hospital</option>
            <option value="Clinic">Clinic</option>
            <option value="Diagnostic">Diagnostic</option>
            <option value="Pharmacy">Pharmacy</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            Showing {organizations.length} of {totalCount} organizations
          </span>
          {(search || typeFilter || statusFilter) && (
            <button
              onClick={() => {
                setSearch('');
                setTypeFilter('');
                setStatusFilter('');
                setCurrentPage(1);
              }}
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
          
          <div>
            <h3 className="text-sm font-medium text-red-800">Error loading organizations</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          
        </div>
      )}

      {/* Organizations Table */}
      {!loading && organizations.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Organization
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Parent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Branches
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Staff
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {organizations.map((org) => (
                  <tr key={org.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Building2 className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{org.name}</div>
                          {org.hierarchyLevel > 0 && (
                            <div className="text-xs text-gray-500">Level {org.hierarchyLevel}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900 font-mono">{org.code || '—'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {org.type ? (
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(org.type)}`}>
                          {org.type}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {org.parentOrganizationName || '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">{org.totalBranches}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">{org.totalUsers}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(org.status)}`}>
                        {org.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleViewDetails(org)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="View Details"
                        >
                          
                        </button>
                        <button
                          onClick={() => handleEdit(org)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit"
                        >
                          
                        </button>
                        <button
                          onClick={() => handleDelete(org)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
              <div className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!loading && organizations.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No organizations found</h3>
          <p className="text-gray-600 mb-6">
            {search || typeFilter || statusFilter
              ? 'Try adjusting your filters'
              : 'Get started by creating your first organization'}
          </p>
          {!search && !typeFilter && !statusFilter && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium"
            >
              
              Create Organization
            </button>
          )}
        </div>
      )}

      {/* Modals */}
      {showCreateModal && (
        <OrganizationFormModal
          onClose={() => setShowCreateModal(false)}
          onSaved={handleOrganizationSaved}
        />
      )}

      {showEditModal && selectedOrganizationDetails && (
        <OrganizationFormModal
          organization={selectedOrganizationDetails}
          onClose={() => {
            setShowEditModal(false);
            setSelectedOrganizationDetails(null);
          }}
          onSaved={handleOrganizationSaved}
        />
      )}

      {showDetailsModal && selectedOrganizationDetails && (
        <OrganizationDetailsModal
          organization={selectedOrganizationDetails}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedOrganizationDetails(null);
          }}
          onEdit={() => {
            setShowDetailsModal(false);
            setShowEditModal(true);
          }}
        />
      )}

      {showHierarchyModal && (
        <OrganizationHierarchyModal
          tenantId={user?.tenantId || ''}
          onClose={() => setShowHierarchyModal(false)}
        />
      )}

      {showDeleteModal && selectedOrganization && (
        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          title="Delete Organization"
          message={
            selectedOrganization.totalBranches && selectedOrganization.totalBranches > 0
              ? `This organization has ${selectedOrganization.totalBranches} branch${selectedOrganization.totalBranches > 1 ? 'es' : ''}. You must move all branches to another organization before deleting.`
              : `Are you sure you want to delete this organization? This action cannot be undone.`
          }
          itemName={selectedOrganization.name}
          onConfirm={confirmDelete}
          onCancel={() => {
            setShowDeleteModal(false);
            setSelectedOrganization(null);
          }}
        />
      )}
    </div>
  );
}
