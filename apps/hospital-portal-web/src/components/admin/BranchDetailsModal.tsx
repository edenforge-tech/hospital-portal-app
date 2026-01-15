'use client';

import React from 'react';

interface BranchDetailsModalProps {
  branch: any;
  onClose: () => void;
  onEdit: (branch: any) => void;
}

export default function BranchDetailsModal({ branch, onClose, onEdit }: BranchDetailsModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Teal Header */}
        <div className="bg-teal-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-white bg-opacity-20 rounded p-2">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{branch.name || branch.branchName}</h2>
              <p className="text-sm text-teal-100">{branch.code || branch.branchCode}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {branch.status && (
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                branch.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {branch.status}
              </span>
            )}
            <button
              onClick={() => onEdit(branch)}
              className="px-4 py-2 bg-white text-teal-600 rounded hover:bg-teal-50 transition text-sm font-medium flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </button>
            <button
              onClick={onClose}
              className="text-white hover:bg-teal-700 rounded p-1"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 p-6 bg-gray-50">
          <div className="bg-teal-500 text-white rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Total Departments</p>
                <p className="text-3xl font-bold mt-1">{branch.departmentCount || 0}</p>
              </div>
              <svg className="w-10 h-10 opacity-80" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
            </div>
          </div>
          <div className="bg-blue-500 text-white rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Total Staff</p>
                <p className="text-3xl font-bold mt-1">{branch.staffCount || 0}</p>
              </div>
              <svg className="w-10 h-10 opacity-80" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
            </div>
          </div>
          <div className="bg-purple-500 text-white rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Total Beds</p>
                <p className="text-3xl font-bold mt-1">{branch.totalBeds || 0}</p>
              </div>
              <svg className="w-10 h-10 opacity-80" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 6a1 1 0 011-1h12a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Basic Information */}
          <div className="bg-blue-50 rounded-lg p-5">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-600 uppercase">Organization</p>
                <p className="text-sm font-medium text-gray-900 mt-1">{branch.organizationName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 uppercase">Branch Type</p>
                <p className="text-sm font-medium text-gray-900 mt-1">
                  <span className="inline-flex px-2 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-800">
                    {branch.branchType || 'Hospital'}
                  </span>
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 uppercase">Region</p>
                <p className="text-sm font-medium text-gray-900 mt-1">{branch.region || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 uppercase">Hierarchy Level</p>
                <p className="text-sm font-medium text-gray-900 mt-1">
                  <span className="inline-flex px-2 py-1 rounded text-xs font-semibold bg-teal-100 text-teal-800">Branch</span>
                </p>
              </div>
            </div>
            {branch.description && (
              <div className="mt-4 pt-4 border-t border-blue-100">
                <p className="text-xs text-gray-600 uppercase mb-2">Description</p>
                <p className="text-sm text-gray-700">{branch.description}</p>
              </div>
            )}
          </div>

          {/* Contact Information */}
          <div className="bg-teal-50 rounded-lg p-5">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-teal-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-teal-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                <div>
                  <p className="text-xs text-gray-600">Phone</p>
                  <p className="text-sm font-medium text-teal-700">{branch.phoneNumber || branch.phone || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-teal-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                <div>
                  <p className="text-xs text-gray-600">Fax</p>
                  <p className="text-sm font-medium text-teal-700">{branch.faxNumber || branch.fax || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-teal-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                <div>
                  <p className="text-xs text-gray-600">Email</p>
                  <p className="text-sm font-medium text-teal-700">{branch.email || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-teal-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.56-.5-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.56.5.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.498-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.147.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.03 11H4.083a6.004 6.004 0 002.783 4.118z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-xs text-gray-600">Website</p>
                  {branch.website ? (
                    <a href={branch.website} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-teal-600 hover:text-teal-700">
                      {branch.website}
                    </a>
                  ) : (
                    <p className="text-sm text-gray-500">N/A</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="bg-green-50 rounded-lg p-5">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900">Address</h3>
            </div>
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-green-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <p className="text-sm text-gray-900">
                  {branch.address || branch.addressLine1 || 'Address not specified'}<br />
                  {branch.city && <>{branch.city}, </>}
                  {branch.state || branch.stateProvince || 'N/A'} {branch.postalCode || ''}<br />
                  {branch.country || 'IN'}
                </p>
              </div>
            </div>
          </div>

          {/* Operations */}
          <div className="bg-orange-50 rounded-lg p-5">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900">Operations</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                <div className="flex-1">
                  <p className="text-xs text-gray-600">Operating Hours</p>
                  <p className="text-sm font-medium text-gray-900">
                    {branch.operatingHoursStart && branch.operatingHoursEnd
                      ? `${branch.operatingHoursStart} - ${branch.operatingHoursEnd}`
                      : '24/7'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                </svg>
                <div className="flex-1">
                  <p className="text-xs text-gray-600">Operational Status</p>
                  <p className="text-sm font-medium text-gray-900">
                    <span className={`inline-flex px-2 py-1 rounded text-xs font-semibold ${
                      branch.operationalStatus === 'Operational' ? 'bg-green-100 text-green-800' :
                      branch.operationalStatus === 'Limited' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {branch.operationalStatus || 'Operational'}
                    </span>
                    {branch.emergencySupport24x7 && (
                      <span className="ml-2 inline-flex px-2 py-1 rounded text-xs font-semibold bg-red-100 text-red-800">
                        24/7 Emergency
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-3 pt-3 border-t border-orange-100">
                <div>
                  <p className="text-xs text-gray-600 uppercase">Total Beds</p>
                  <p className="text-sm font-medium text-gray-900 mt-1">{branch.totalBeds || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 uppercase">ICU Beds</p>
                  <p className="text-sm font-medium text-gray-900 mt-1">{branch.icuBeds || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 uppercase">Emergency Beds</p>
                  <p className="text-sm font-medium text-gray-900 mt-1">{branch.emergencyBeds || 0}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Regional Settings */}
          <div className="bg-indigo-50 rounded-lg p-5">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clipRule="evenodd" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900">Regional Settings</h3>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-gray-600 uppercase">Timezone</p>
                <p className="text-sm font-medium text-gray-900 mt-1">{branch.timezone || 'UTC'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 uppercase">Language</p>
                <p className="text-sm font-medium text-gray-900 mt-1">{branch.primaryLanguage || branch.languagePrimary || 'EN'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 uppercase">Currency</p>
                <p className="text-sm font-medium text-gray-900 mt-1">{branch.currency || branch.currencyCode || 'INR'}</p>
              </div>
            </div>
          </div>

          {/* Compliance & Certifications */}
          {(branch.hipaaCompliant || branch.nabhAccredited || branch.jciAccredited || branch.iso9001Certified) && (
            <div className="bg-purple-50 rounded-lg p-5">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900">Compliance & Certifications</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {branch.hipaaCompliant && (
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-gray-900">HIPAA Compliant</span>
                  </div>
                )}
                {branch.nabhAccredited && (
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-gray-900">NABH Accredited</span>
                  </div>
                )}
                {branch.jciAccredited && (
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-gray-900">JCI Accredited</span>
                  </div>
                )}
                {branch.iso9001Certified && (
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-gray-900">ISO 9001 Certified</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Audit Trail */}
          <div className="bg-gray-50 rounded-lg p-5">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900">Audit Trail</h3>
            </div>
            <div className="space-y-2 text-sm">
              {branch.createdAt && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Created</span>
                  <span className="font-medium text-gray-900">{new Date(branch.createdAt).toLocaleString()}</span>
                </div>
              )}
              {branch.updatedAt && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Last Updated</span>
                  <span className="font-medium text-gray-900">{new Date(branch.updatedAt).toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer with Close Button */}
        <div className="border-t border-gray-200 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
