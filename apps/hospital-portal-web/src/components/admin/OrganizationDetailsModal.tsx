'use client';

import { X, Building2, MapPin, Phone, Mail, Globe, Calendar, FileText, Edit, Users, GitBranch } from 'lucide-react';
import { OrganizationDetails } from '@/lib/api/organizations.api';

interface OrganizationDetailsModalProps {
  organization: OrganizationDetails;
  onClose: () => void;
  onEdit: () => void;
}

export default function OrganizationDetailsModal({ organization, onClose, onEdit }: OrganizationDetailsModalProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getTypeColor = (type?: string) => {
    switch (type) {
      case 'Hospital': return 'bg-blue-100 text-blue-800';
      case 'Clinic': return 'bg-green-100 text-green-800';
      case 'Diagnostic': return 'bg-purple-100 text-purple-800';
      case 'Pharmacy': return 'bg-orange-100 text-orange-800';
      case 'Laboratory': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Building2 className="h-6 w-6 text-indigo-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{organization.name}</h2>
              {organization.code && (
                <p className="text-sm text-gray-500 font-mono">{organization.code}</p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onEdit}
              className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium flex items-center"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Building2 className="h-5 w-5 mr-2 text-indigo-600" />
                Basic Information
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Organization Type</p>
                    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getTypeColor(organization.type)}`}>
                      {organization.type || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold capitalize ${getStatusColor(organization.status)}`}>
                      {organization.status || 'N/A'}
                    </span>
                  </div>
                  {organization.hierarchyLevel !== undefined && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Hierarchy Level</p>
                      <p className="text-sm text-gray-900">Level {organization.hierarchyLevel}</p>
                    </div>
                  )}
                  {organization.parentOrganizationName && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Parent Organization</p>
                      <p className="text-sm text-gray-900">{organization.parentOrganizationName}</p>
                    </div>
                  )}
                </div>
                {organization.description && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Description</p>
                    <p className="text-sm text-gray-700 mt-1">{organization.description}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Statistics */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Statistics</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600">Total Branches</p>
                      <p className="text-2xl font-bold text-blue-700">{organization.totalBranches || 0}</p>
                    </div>
                    <GitBranch className="h-8 w-8 text-blue-400" />
                  </div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600">Total Users</p>
                      <p className="text-2xl font-bold text-green-700">{organization.totalUsers || 0}</p>
                    </div>
                    <Users className="h-8 w-8 text-green-400" />
                  </div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-600">Child Orgs</p>
                      <p className="text-2xl font-bold text-purple-700">{organization.totalChildOrganizations || 0}</p>
                    </div>
                    <Building2 className="h-8 w-8 text-purple-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Address Information */}
            {(organization.addressLine1 || organization.city) && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-indigo-600" />
                  Address
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-700 space-y-1">
                    {organization.addressLine1 && <p>{organization.addressLine1}</p>}
                    {organization.addressLine2 && <p>{organization.addressLine2}</p>}
                    <p>
                      {[organization.city, organization.stateProvince, organization.postalCode]
                        .filter(Boolean)
                        .join(', ')}
                    </p>
                    {organization.countryCode && <p>{organization.countryCode}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Contact Information */}
            {(organization.phone || organization.email || organization.website) && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Phone className="h-5 w-5 mr-2 text-indigo-600" />
                  Contact Information
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  {organization.phone && (
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 text-gray-400 mr-3" />
                      <div>
                        <p className="text-xs font-medium text-gray-500">Phone</p>
                        <p className="text-sm text-gray-900">{organization.phone}</p>
                      </div>
                    </div>
                  )}
                  {organization.email && (
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 text-gray-400 mr-3" />
                      <div>
                        <p className="text-xs font-medium text-gray-500">Email</p>
                        <a href={`mailto:${organization.email}`} className="text-sm text-indigo-600 hover:text-indigo-700">
                          {organization.email}
                        </a>
                      </div>
                    </div>
                  )}
                  {organization.website && (
                    <div className="flex items-center">
                      <Globe className="h-4 w-4 text-gray-400 mr-3" />
                      <div>
                        <p className="text-xs font-medium text-gray-500">Website</p>
                        <a
                          href={organization.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-indigo-600 hover:text-indigo-700"
                        >
                          {organization.website}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Primary Contact */}
            {(organization.primaryContactName || organization.primaryContactEmail || organization.primaryContactPhone) && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Primary Contact</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  {organization.primaryContactName && (
                    <div>
                      <p className="text-xs font-medium text-gray-500">Name</p>
                      <p className="text-sm text-gray-900">{organization.primaryContactName}</p>
                    </div>
                  )}
                  {organization.primaryContactEmail && (
                    <div>
                      <p className="text-xs font-medium text-gray-500">Email</p>
                      <a href={`mailto:${organization.primaryContactEmail}`} className="text-sm text-indigo-600 hover:text-indigo-700">
                        {organization.primaryContactEmail}
                      </a>
                    </div>
                  )}
                  {organization.primaryContactPhone && (
                    <div>
                      <p className="text-xs font-medium text-gray-500">Phone</p>
                      <p className="text-sm text-gray-900">{organization.primaryContactPhone}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Configuration */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Configuration</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs font-medium text-gray-500">Timezone</p>
                    <p className="text-sm text-gray-900">{organization.timezone || 'UTC'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500">Language</p>
                    <p className="text-sm text-gray-900">{organization.languageCode?.toUpperCase() || 'EN'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500">Currency</p>
                    <p className="text-sm text-gray-900">{organization.currencyCode || 'USD'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Operations */}
            {(organization.operationalSince || organization.registrationNumber) && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Operations</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4">
                    {organization.operationalSince && (
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-400 mr-3" />
                        <div>
                          <p className="text-xs font-medium text-gray-500">Operational Since</p>
                          <p className="text-sm text-gray-900">{formatDate(organization.operationalSince)}</p>
                        </div>
                      </div>
                    )}
                    {organization.registrationNumber && (
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 text-gray-400 mr-3" />
                        <div>
                          <p className="text-xs font-medium text-gray-500">Registration Number</p>
                          <p className="text-sm text-gray-900 font-mono">{organization.registrationNumber}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Audit Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Audit Information</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-xs font-medium text-gray-500">Created</p>
                    <p className="text-gray-900">{formatDate(organization.createdAt)}</p>
                    {organization.createdBy && (
                      <p className="text-xs text-gray-600">by {organization.createdBy}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500">Last Updated</p>
                    <p className="text-gray-900">{formatDate(organization.updatedAt)}</p>
                    {organization.updatedBy && (
                      <p className="text-xs text-gray-600">by {organization.updatedBy}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
