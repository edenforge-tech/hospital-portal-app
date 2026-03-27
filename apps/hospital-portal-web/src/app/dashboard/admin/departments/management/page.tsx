'use client';

import { useAuthStore } from '@/lib/auth-store';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { getApi } from '@/lib/api';
import DepartmentHierarchyTree from '@/components/admin/DepartmentHierarchyTree';

interface DepartmentNode {
  id: string;
  departmentName: string;
  departmentCode?: string;
  departmentType?: string;
  branchId?: string;
  branchName?: string;
  staffCount?: number;
  is24x7?: boolean;
  requiresApproval?: boolean;
  status?: string;
  parentDepartmentId?: string | null;
  level: number;
  children: DepartmentNode[];
}

export default function DepartmentHierarchyManagementPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [selectedDepartment, setSelectedDepartment] = useState<DepartmentNode | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const handleDepartmentMove = async (departmentId: string, newParentId: string | null) => {
    try {
      setError('');
      // Update department's parent via API
      await getApi().put(`/departments/${departmentId}`, {
        parentDepartmentId: newParentId
      });
      setSuccess('Department hierarchy updated successfully');
      setRefreshTrigger(prev => prev + 1);
      setTimeout(() => setSuccess(''), 5000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update department hierarchy');
      throw err; // Re-throw to let the tree component handle it
    }
  };

  const getDepartmentTypeIcon = (type: string | undefined) => {
    if (!type) return '🏢';
    
    const icons: Record<string, string> = {
      'Clinical': '🏥',
      'Administrative': '📋',
      'Support': '🔧',
      'Diagnostics': '🔬',
      'Therapeutic': '💊',
      'Emergency': '🚑',
      'Surgical': '⚕️',
      'Medical': '🩺'
    };
    
    return icons[type] || '🏢';
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <button
              onClick={() => router.back()}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-2"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Departments
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Department Hierarchy Management</h1>
            <p className="text-gray-600 mt-2">Organize departments in a hierarchical structure with drag-and-drop</p>
          </div>
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg px-4 py-2">
            <div className="flex items-center gap-2 text-sm text-indigo-800">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Drag & Drop Enabled</span>
            </div>
          </div>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="mb-4 bg-green-50 border-l-4 border-green-500 text-green-800 px-4 py-3 rounded-lg flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>{success}</span>
          </div>
          <button
            onClick={() => setSuccess('')}
            className="text-green-600 hover:text-green-800"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}

      {error && (
        <div className="mb-4 bg-red-50 border-l-4 border-red-500 text-red-800 px-4 py-3 rounded-lg flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
          <button
            onClick={() => setError('')}
            className="text-red-600 hover:text-red-800"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Hierarchy Tree */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Department Hierarchy Tree</h2>
            <DepartmentHierarchyTree
              onDepartmentSelect={setSelectedDepartment}
              onDepartmentMove={handleDepartmentMove}
              selectedDepartmentId={selectedDepartment?.id}
              refreshTrigger={refreshTrigger}
            />
          </div>
        </div>

        {/* Right Panel - Department Details */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Department Details</h2>
            
            {selectedDepartment ? (
              <div className="space-y-4">
                {/* Department Name */}
                <div>
                  <label className="text-sm font-medium text-gray-500">Department Name</label>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-2xl">
                      {getDepartmentTypeIcon(selectedDepartment.departmentType)}
                    </div>
                    <div className="flex-1">
                      <p className="text-lg font-semibold text-gray-900">{selectedDepartment.departmentName}</p>
                      {selectedDepartment.departmentCode && (
                        <p className="text-xs text-gray-500">{selectedDepartment.departmentCode}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Statistics Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-indigo-50 rounded-lg p-3">
                    <p className="text-xs text-indigo-600 font-medium">Hierarchy Level</p>
                    <p className="text-2xl font-bold text-indigo-900">{selectedDepartment.level}</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-xs text-blue-600 font-medium">Sub-Departments</p>
                    <p className="text-2xl font-bold text-blue-900">{selectedDepartment.children?.length || 0}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3">
                    <p className="text-xs text-green-600 font-medium">Staff Count</p>
                    <p className="text-2xl font-bold text-green-900">{selectedDepartment.staffCount || 0}</p>
                  </div>
                  <div className="bg-amber-50 rounded-lg p-3">
                    <p className="text-xs text-amber-600 font-medium">Status</p>
                    <p className="text-sm font-bold text-amber-900 mt-1">{selectedDepartment.status || 'Active'}</p>
                  </div>
                </div>

                {/* Department Type */}
                {selectedDepartment.departmentType && (
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <p className="text-xs text-gray-600 mb-1">Type</p>
                    <p className="font-medium text-gray-900">{selectedDepartment.departmentType}</p>
                  </div>
                )}

                {/* Branch */}
                {selectedDepartment.branchName && (
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <p className="text-xs text-gray-600 mb-1">Branch</p>
                    <p className="font-medium text-gray-900">{selectedDepartment.branchName}</p>
                  </div>
                )}

                {/* Badges */}
                <div className="flex flex-wrap gap-2">
                  {selectedDepartment.is24x7 && (
                    <span className="px-3 py-1 bg-blue-500 text-white text-xs rounded-full font-medium">
                      24/7 Operations
                    </span>
                  )}
                  {selectedDepartment.requiresApproval && (
                    <span className="px-3 py-1 bg-orange-500 text-white text-xs rounded-full font-medium">
                      Requires Approval
                    </span>
                  )}
                </div>

                {/* Hierarchy Info */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Hierarchy Position</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Level:</span>
                      <span className="font-medium text-gray-900">
                        {selectedDepartment.level === 0 ? 'Root Level' : `Level ${selectedDepartment.level}`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Parent:</span>
                      <span className="font-medium text-gray-900">
                        {selectedDepartment.parentDepartmentId ? 'Has Parent' : 'None (Root)'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sub-Depts:</span>
                      <span className="font-medium text-gray-900">
                        {selectedDepartment.children?.length || 0} department{selectedDepartment.children?.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-4 border-t border-gray-200 space-y-2">
                  <button
                    onClick={() => router.push('/dashboard/admin/departments')}
                    className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Edit Department Details
                  </button>
                  <button
                    onClick={() => router.push(`/dashboard/admin/departments?deptId=${selectedDepartment.id}`)}
                    className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Manage Staff
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <p className="mt-2 text-sm text-gray-500">Select a department to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
