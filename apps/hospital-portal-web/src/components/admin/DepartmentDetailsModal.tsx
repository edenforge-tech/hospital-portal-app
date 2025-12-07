'use client';

import React, { useState, useEffect } from 'react';
import { departmentsApi, DepartmentDetails } from '@/lib/api/departments.api';
import { StatusBadge } from '@/components/ui/StatusBadge';

interface DepartmentDetailsModalProps {
  departmentId: string;
  onClose: () => void;
}

const DepartmentDetailsModal: React.FC<DepartmentDetailsModalProps> = ({
  departmentId,
  onClose,
}) => {
  const [details, setDetails] = useState<DepartmentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'info' | 'staff' | 'subdepts' | 'metrics'>('info');

  useEffect(() => {
    loadDetails();
  }, [departmentId]);

  const loadDetails = async () => {
    try {
      setLoading(true);
      const data = await departmentsApi.getDetails(departmentId);
      setDetails(data);
    } catch (err) {
      console.error('Error loading department details:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="rounded-lg bg-white p-8">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p>Loading details...</p>
        </div>
      </div>
    );
  }

  if (!details) {
    return null;
  }

  const { department, staff, subDepartments, metrics } = details;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-auto rounded-lg bg-white shadow-xl">
        {/* Header */}
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{department.departmentName}</h2>
              <p className="text-sm text-gray-600">{department.departmentCode}</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              ✕
            </button>
          </div>

          {/* Tabs */}
          <div className="mt-4 flex gap-4">
            <button
              onClick={() => setActiveTab('info')}
              className={`pb-2 text-sm font-medium ${
                activeTab === 'info'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Information
            </button>
            <button
              onClick={() => setActiveTab('staff')}
              className={`pb-2 text-sm font-medium ${
                activeTab === 'staff'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Staff ({staff.length})
            </button>
            <button
              onClick={() => setActiveTab('subdepts')}
              className={`pb-2 text-sm font-medium ${
                activeTab === 'subdepts'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Sub-Departments ({subDepartments.length})
            </button>
            <button
              onClick={() => setActiveTab('metrics')}
              className={`pb-2 text-sm font-medium ${
                activeTab === 'metrics'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Metrics
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Information Tab */}
          {activeTab === 'info' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Department Type</p>
                  <p className="mt-1 text-gray-900">{department.departmentType}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Status</p>
                  <div className="mt-1">
                    <StatusBadge status={department.status} />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Department Head</p>
                  <p className="mt-1 text-gray-900">{department.departmentHeadName || 'Not assigned'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Operating Hours</p>
                  <p className="mt-1 text-gray-900">{department.operatingHours || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Budget</p>
                  <p className="mt-1 text-gray-900">
                    {department.budget
                      ? `${department.currency} ${department.budget.toLocaleString()}`
                      : 'Not specified'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Max Concurrent Patients</p>
                  <p className="mt-1 text-gray-900">{department.maxConcurrentPatients || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Approval Workflow</p>
                  <p className="mt-1 text-gray-900">
                    {department.approvalWorkflowRequired ? 'Required' : 'Not required'}
                  </p>
                </div>
              </div>
              {department.description && (
                <div>
                  <p className="text-sm font-medium text-gray-600">Description</p>
                  <p className="mt-1 text-gray-900">{department.description}</p>
                </div>
              )}
            </div>
          )}

          {/* Staff Tab */}
          {activeTab === 'staff' && (
            <div>
              {staff.length === 0 ? (
                <p className="text-center text-gray-500">No staff assigned to this department</p>
              ) : (
                <div className="space-y-2">
                  {staff.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between rounded-lg border border-gray-200 p-3"
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          {member.firstName} {member.lastName}
                        </p>
                        <p className="text-sm text-gray-600">{member.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">{member.designation || 'Not specified'}</p>
                        <StatusBadge status={member.status} size="sm" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Sub-Departments Tab */}
          {activeTab === 'subdepts' && (
            <div>
              {subDepartments.length === 0 ? (
                <p className="text-center text-gray-500">No sub-departments</p>
              ) : (
                <div className="space-y-2">
                  {subDepartments.map((subdept) => (
                    <div
                      key={subdept.id}
                      className="flex items-center justify-between rounded-lg border border-gray-200 p-3"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{subdept.departmentName}</p>
                        <p className="text-sm text-gray-600">{subdept.departmentCode}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">{subdept.departmentType}</p>
                        <StatusBadge status={subdept.status} size="sm" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Metrics Tab */}
          {activeTab === 'metrics' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <p className="text-sm text-gray-600">Active Patients</p>
                <p className="mt-2 text-3xl font-semibold text-gray-900">{metrics.activePatients}</p>
              </div>
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <p className="text-sm text-gray-600">Appointments Today</p>
                <p className="mt-2 text-3xl font-semibold text-gray-900">{metrics.totalAppointmentsToday}</p>
              </div>
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <p className="text-sm text-gray-600">Average Wait Time</p>
                <p className="mt-2 text-3xl font-semibold text-gray-900">{metrics.averageWaitTime} min</p>
              </div>
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <p className="text-sm text-gray-600">Utilization Rate</p>
                <p className="mt-2 text-3xl font-semibold text-gray-900">{metrics.utilizationRate}%</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="rounded-lg bg-gray-600 px-4 py-2 font-medium text-white hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepartmentDetailsModal;
