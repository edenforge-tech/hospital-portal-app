'use client';

import { 
  X, Building2, MapPin, Phone, Mail, Globe, Calendar, FileText, Edit, 
  Users, GitBranch, Clock, Shield, CheckCircle2, XCircle, AlertCircle,
  Briefcase, Info
} from 'lucide-react';
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

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'active': return <CheckCircle2 className="h-4 w-4" />;
      case 'inactive': return <XCircle className="h-4 w-4" />;
      case 'suspended': return <AlertCircle className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modern Header with Gradient */}
        <div className="bg-gradient-to-r from-teal-600 to-cyan-600 px-6 py-5 text-white">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3 flex-1">
              <div className="p-2.5 bg-white/20 backdrop-blur-sm rounded-xl">
                <Building2 className="h-7 w-7 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold tracking-tight">{organization.name}</h2>
                {organization.code && (
                  <div className="flex items-center mt-2 space-x-2">
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-lg text-sm font-mono font-medium">
                      {organization.code}
                    </span>
                    <span className={`px-3 py-1 rounded-lg text-sm font-medium flex items-center space-x-1.5 ${
                      organization.status === 'active' 
                        ? 'bg-green-500/90 text-white' 
                        : organization.status === 'inactive'
                        ? 'bg-gray-500/90 text-white'
                        : 'bg-red-500/90 text-white'
                    }`}>
                      {getStatusIcon(organization.status)}
                      <span className="capitalize">{organization.status || 'N/A'}</span>
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2 ml-4">
              <button
                onClick={onEdit}
                className="px-5 py-2.5 bg-white text-teal-600 rounded-xl hover:bg-teal-50 font-semibold flex items-center space-x-2 shadow-lg transition-all hover:scale-105"
              >
                <Edit className="h-4 w-4" />
                <span>Edit</span>
              </button>
              <button
                onClick={onClose}
                className="p-2.5 text-white hover:bg-white/20 rounded-xl transition-all"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Content with Modern Cards */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          <div className="p-6">
            {/* Quick Stats - Full Width Cards */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg p-3 text-white shadow">
                <div className="flex items-center justify-between mb-1">
                  <GitBranch className="h-5 w-5 opacity-80" />
                  <div className="text-right">
                    <p className="text-xl font-bold">{organization.totalBranches || 0}</p>
                  </div>
                </div>
                <p className="text-teal-100 text-xs">Total Branches</p>
              </div>
              
              <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg p-3 text-white shadow">
                <div className="flex items-center justify-between mb-1">
                  <Users className="h-5 w-5 opacity-80" />
                  <div className="text-right">
                    <p className="text-xl font-bold">{organization.totalUsers || 0}</p>
                  </div>
                </div>
                <p className="text-cyan-100 text-xs">Total Users</p>
              </div>
              
              <div className="bg-gradient-to-br from-teal-600 to-cyan-600 rounded-lg p-3 text-white shadow">
                <div className="flex items-center justify-between mb-1">
                  <Building2 className="h-5 w-5 opacity-80" />
                  <div className="text-right">
                    <p className="text-xl font-bold">{organization.childOrganizationsCount || 0}</p>
                  </div>
                </div>
                <p className="text-teal-100 text-xs">Child Organizations</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-5">
              {/* Left Column */}
              <div className="space-y-5">
                {/* Basic Information Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-5 py-3 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <Info className="h-5 w-5 mr-2 text-teal-600" />
                      Basic Information
                    </h3>
                  </div>
                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                      <span className="text-sm font-medium text-gray-600">Organization Type</span>
                      <span className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${getTypeColor(organization.type)}`}>
                        {organization.type || 'N/A'}
                      </span>
                    </div>
                    {organization.hierarchyLevel !== undefined && (
                      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-600">Hierarchy Level</span>
                        <span className="px-3 py-1.5 bg-teal-50 text-teal-700 rounded-lg text-sm font-semibold">
                          Level {organization.hierarchyLevel}
                        </span>
                      </div>
                    )}
                    {organization.description && (
                      <div className="pt-2">
                        <p className="text-sm font-medium text-gray-600 mb-2">Description</p>
                        <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-lg">
                          {organization.description}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Address Card */}
                {(organization.addressLine1 || organization.city) && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-5 py-3 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <MapPin className="h-5 w-5 mr-2 text-teal-600" />
                        Address
                      </h3>
                    </div>
                    <div className="p-5">
                      <div className="flex items-start space-x-3">
                        <div className="p-2 bg-teal-50 rounded-lg">
                          <MapPin className="h-5 w-5 text-teal-600" />
                        </div>
                        <div className="flex-1 text-sm text-gray-700 leading-relaxed">
                          {organization.addressLine1 && <p className="font-medium">{organization.addressLine1}</p>}
                          {organization.addressLine2 && <p>{organization.addressLine2}</p>}
                          <p className="mt-1">
                            {[organization.city, organization.stateProvince, organization.postalCode]
                              .filter(Boolean)
                              .join(', ')}
                          </p>
                          {organization.countryCode && (
                            <p className="mt-1 font-medium text-gray-900">{organization.countryCode}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Operations Card */}
                {(organization.operationalSince || organization.registrationNumber) && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-5 py-3 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <Briefcase className="h-5 w-5 mr-2 text-teal-600" />
                        Operations
                      </h3>
                    </div>
                    <div className="p-5 space-y-3">
                      {organization.operationalSince && (
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-teal-50 rounded-lg">
                            <Calendar className="h-5 w-5 text-teal-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Operational Since</p>
                            <p className="text-sm font-semibold text-gray-900 mt-0.5">{formatDate(organization.operationalSince)}</p>
                          </div>
                        </div>
                      )}
                      {organization.registrationNumber && (
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-cyan-50 rounded-lg">
                            <Shield className="h-5 w-5 text-cyan-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Registration Number</p>
                            <p className="text-sm font-semibold text-gray-900 font-mono mt-0.5">{organization.registrationNumber}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column */}
              <div className="space-y-5">
                {/* Contact Information Card */}
                {(organization.phone || organization.email || organization.website || 
                  organization.primaryContactName || organization.primaryContactEmail || organization.primaryContactPhone) && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-5 py-3 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <Phone className="h-5 w-5 mr-2 text-teal-600" />
                        Contact Information
                      </h3>
                    </div>
                    <div className="p-5 space-y-4">
                      {/* Primary Contact Section */}
                      {(organization.primaryContactName || organization.primaryContactEmail || organization.primaryContactPhone) && (
                        <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl p-4 space-y-3">
                          <p className="text-xs font-bold text-teal-600 uppercase tracking-wider mb-2">Primary Contact</p>
                          {organization.primaryContactName && (
                            <div className="flex items-center space-x-3">
                              <div className="p-1.5 bg-white rounded-lg shadow-sm">
                                <Users className="h-4 w-4 text-teal-600" />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-semibold text-gray-900">{organization.primaryContactName}</p>
                              </div>
                            </div>
                          )}
                          {organization.primaryContactEmail && (
                            <div className="flex items-center space-x-3">
                              <div className="p-1.5 bg-white rounded-lg shadow-sm">
                                <Mail className="h-4 w-4 text-teal-600" />
                              </div>
                              <div className="flex-1">
                                <a href={`mailto:${organization.primaryContactEmail}`} className="text-sm text-teal-600 hover:text-teal-700 font-medium hover:underline">
                                  {organization.primaryContactEmail}
                                </a>
                              </div>
                            </div>
                          )}
                          {organization.primaryContactPhone && (
                            <div className="flex items-center space-x-3">
                              <div className="p-1.5 bg-white rounded-lg shadow-sm">
                                <Phone className="h-4 w-4 text-teal-600" />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">{organization.primaryContactPhone}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* General Contact */}
                      {(organization.phone || organization.email || organization.website) && (
                        <div className="space-y-3 pt-2">
                          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">General Contact</p>
                          {organization.phone && (
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-teal-50 rounded-lg">
                                <Phone className="h-4 w-4 text-teal-600" />
                              </div>
                              <div className="flex-1">
                                <p className="text-xs text-gray-500">Phone</p>
                                <p className="text-sm font-medium text-gray-900">{organization.phone}</p>
                              </div>
                            </div>
                          )}
                          {organization.email && (
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-cyan-50 rounded-lg">
                                <Mail className="h-4 w-4 text-cyan-600" />
                              </div>
                              <div className="flex-1">
                                <p className="text-xs text-gray-500">Email</p>
                                <a href={`mailto:${organization.email}`} className="text-sm text-teal-600 hover:text-teal-700 font-medium hover:underline">
                                  {organization.email}
                                </a>
                              </div>
                            </div>
                          )}
                          {organization.website && (
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-teal-50 rounded-lg">
                                <Globe className="h-4 w-4 text-teal-600" />
                              </div>
                              <div className="flex-1">
                                <p className="text-xs text-gray-500">Website</p>
                                <a
                                  href={organization.website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-teal-600 hover:text-teal-700 font-medium hover:underline break-all"
                                >
                                  {organization.website}
                                </a>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Configuration Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-5 py-3 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <Clock className="h-5 w-5 mr-2 text-teal-600" />
                      Regional Settings
                    </h3>
                  </div>
                  <div className="p-5">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-gray-50 rounded-xl">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Timezone</p>
                        <p className="text-sm font-bold text-gray-900">{organization.timezone || 'UTC'}</p>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-xl">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Language</p>
                        <p className="text-sm font-bold text-gray-900">{organization.languageCode?.toUpperCase() || 'EN'}</p>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-xl">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Currency</p>
                        <p className="text-sm font-bold text-gray-900">{organization.currencyCode || 'USD'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Audit Information Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-5 py-3 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <FileText className="h-5 w-5 mr-2 text-teal-600" />
                      Audit Trail
                    </h3>
                  </div>
                  <div className="p-5">
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3 pb-4 border-b border-gray-100">
                        <div className="p-2 bg-teal-50 rounded-lg mt-0.5">
                          <Calendar className="h-4 w-4 text-teal-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Created</p>
                          <p className="text-sm font-semibold text-gray-900 mt-1">{formatDate(organization.createdAt)}</p>
                          {organization.createdBy && (
                            <p className="text-xs text-gray-600 mt-1">by {organization.createdBy}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="p-2 bg-cyan-50 rounded-lg mt-0.5">
                          <Clock className="h-4 w-4 text-cyan-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Last Updated</p>
                          <p className="text-sm font-semibold text-gray-900 mt-1">{formatDate(organization.updatedAt)}</p>
                          {organization.updatedBy && (
                            <p className="text-xs text-gray-600 mt-1">by {organization.updatedBy}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modern Footer */}
        <div className="bg-white border-t border-gray-200 px-6 py-3.5">
          <div className="flex items-center justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2.5 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 font-semibold transition-all hover:border-gray-400"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
