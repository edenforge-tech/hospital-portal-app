'use client';

import { useAuthStore } from '@/lib/auth-store';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { bulkOperationsApi, rolesApi } from '@/lib/api';
import { Upload, Download, FileSpreadsheet, Users, Briefcase, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';

interface BulkJob {
  id: string;
  jobType: string;
  fileName: string;
  totalRecords: number;
  processedRecords: number;
  successCount: number;
  failureCount: number;
  status: 'Pending' | 'Processing' | 'Completed' | 'Failed';
  createdAt: string;
  completedAt?: string;
  errorDetails?: string;
}

type OperationType = 'import-users' | 'export-users' | 'import-employees' | 'export-employees' | 'bulk-assign-role' | 'bulk-change-status' | 'bulk-delete';

export default function BulkOperationsPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [jobs, setJobs] = useState<BulkJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedOperation, setSelectedOperation] = useState<OperationType | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState('');

  useEffect(() => {
    if (user) {
      loadJobs();
    }
  }, [user]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const api = getApi();
      const response = await api.get('/bulkoperations/jobs');
      setJobs(response.data || []);
    } catch (err: any) {
      console.error('Error loading jobs:', err);
      setError('Failed to load bulk operations jobs');
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = async (type: 'users' | 'employees') => {
    try {
      const response = type === 'users' 
        ? await bulkOperationsApi.getUserTemplate()
        : await bulkOperationsApi.getEmployeeTemplate();
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}_import_template.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      setSuccess(`${type} template downloaded successfully`);
    } catch (err: any) {
      console.error('Error downloading template:', err);
      setError(`Failed to download ${type} template`);
    }
  };

  const handleFileUpload = async () => {
    if (!uploadFile || !selectedOperation) {
      setError('Please select a file and operation type');
      return;
    }

    try {
      setUploading(true);
      setError('');
      setSuccess('');

      if (selectedOperation === 'import-users') {
        await bulkOperationsApi.importUsers(uploadFile);
      } else if (selectedOperation === 'import-employees') {
        await bulkOperationsApi.importEmployees(uploadFile);
      }

      setSuccess('File uploaded successfully. Processing completed.');
      setUploadFile(null);
      setSelectedOperation(null);
      
      // Reload jobs after a short delay
      setTimeout(() => loadJobs(), 2000);
    } catch (err: any) {
      console.error('Error uploading file:', err);
      setError(err.response?.data?.message || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleExport = async (type: 'users' | 'employees') => {
    try {
      setError('');
      setSuccess('');

      const response = type === 'users'
        ? await bulkOperationsApi.exportUsers()
        : await bulkOperationsApi.exportEmployees();

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      setSuccess(`${type} exported successfully`);
    } catch (err: any) {
      console.error('Error exporting:', err);
      setError(`Failed to export ${type}`);
    }
  };

  const handleBulkAssignRole = async () => {
    if (!selectedRole || !selectedUserIds) {
      setError('Please enter role and user IDs');
      return;
    }

    try {
      setError('');
      setSuccess('');

      const userIds = selectedUserIds.split(',').map(id => id.trim());
      await bulkOperationsApi.assignRoles(userIds, [selectedRole]);

      setSuccess('Role assigned successfully to selected users');
      setSelectedRole('');
      setSelectedUserIds('');
      setTimeout(() => loadJobs(), 2000);
    } catch (err: any) {
      console.error('Error assigning role:', err);
      setError(err.response?.data?.message || 'Failed to assign role');
    }
  };

  const handleBulkChangeStatus = async () => {
    if (!selectedStatus || !selectedUserIds) {
      setError('Please enter status and user IDs');
      return;
    }

    try {
      setError('');
      setSuccess('');

      const targetIds = selectedUserIds.split(',').map(id => id.trim());
      await bulkOperationsApi.updateStatus(targetIds, selectedStatus);

      setSuccess('Status changed successfully for selected users');
      setSelectedStatus('');
      setSelectedUserIds('');
      setTimeout(() => loadJobs(), 2000);
    } catch (err: any) {
      console.error('Error changing status:', err);
      setError(err.response?.data?.message || 'Failed to change status');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'Failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'Processing':
        return <Clock className="w-5 h-5 text-blue-500 animate-spin" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      'Completed': 'bg-green-100 text-green-800',
      'Failed': 'bg-red-100 text-red-800',
      'Processing': 'bg-blue-100 text-blue-800',
      'Pending': 'bg-yellow-100 text-yellow-800'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">Please log in to access bulk operations</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Bulk Operations</h1>
        <p className="text-gray-600">Import, export, and manage data in bulk</p>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-start">
          <XCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-start">
          <CheckCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Operations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Import/Export Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <FileSpreadsheet className="w-6 h-6 text-indigo-600 mr-2" />
            <h2 className="text-xl font-bold text-gray-900">CSV Import/Export</h2>
          </div>

          {/* Templates */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Download Templates</h3>
            <div className="flex gap-2">
              <button
                onClick={() => downloadTemplate('users')}
                className="flex-1 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
              >
                <Download className="w-4 h-4 inline mr-1" />
                Users Template
              </button>
              <button
                onClick={() => downloadTemplate('employees')}
                className="flex-1 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
              >
                <Download className="w-4 h-4 inline mr-1" />
                Employees Template
              </button>
            </div>
          </div>

          {/* Import */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Import Data</h3>
            <select
              value={selectedOperation || ''}
              onChange={(e) => setSelectedOperation(e.target.value as OperationType)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">Select operation...</option>
              <option value="import-users">Import Users</option>
              <option value="import-employees">Import Employees</option>
            </select>

            <div className="flex items-center gap-2">
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                className="flex-1 text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
              <button
                onClick={handleFileUpload}
                disabled={!uploadFile || !selectedOperation || uploading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {uploading ? (
                  <Clock className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Export */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Export Data</h3>
            <div className="flex gap-2">
              <button
                onClick={() => handleExport('users')}
                className="flex-1 px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium"
              >
                <Users className="w-4 h-4 inline mr-1" />
                Export Users
              </button>
              <button
                onClick={() => handleExport('employees')}
                className="flex-1 px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium"
              >
                <Briefcase className="w-4 h-4 inline mr-1" />
                Export Employees
              </button>
            </div>
          </div>
        </div>

        {/* Bulk Actions Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <Users className="w-6 h-6 text-indigo-600 mr-2" />
            <h2 className="text-xl font-bold text-gray-900">Bulk Actions</h2>
          </div>

          {/* Bulk Assign Role */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Assign Role to Users</h3>
            <input
              type="text"
              placeholder="Role ID"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <input
              type="text"
              placeholder="User IDs (comma-separated)"
              value={selectedUserIds}
              onChange={(e) => setSelectedUserIds(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <button
              onClick={handleBulkAssignRole}
              disabled={!selectedRole || !selectedUserIds}
              className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Assign Role
            </button>
          </div>

          {/* Bulk Change Status */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Change User Status</h3>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">Select status...</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Suspended">Suspended</option>
            </select>
            <input
              type="text"
              placeholder="User IDs (comma-separated)"
              value={selectedUserIds}
              onChange={(e) => setSelectedUserIds(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <button
              onClick={handleBulkChangeStatus}
              disabled={!selectedStatus || !selectedUserIds}
              className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Change Status
            </button>
          </div>
        </div>
      </div>

      {/* Jobs History */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Recent Jobs</h2>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-600">
            <Clock className="w-8 h-8 animate-spin mx-auto mb-2" />
            Loading jobs...
          </div>
        ) : jobs.length === 0 ? (
          <div className="p-8 text-center text-gray-600">
            No bulk operation jobs found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(job.status)}
                        <span className="ml-2 text-sm font-medium text-gray-900">{job.jobType}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{job.fileName}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(job.processedRecords / job.totalRecords) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-600">
                          {job.processedRecords}/{job.totalRecords}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Success: {job.successCount} | Failed: {job.failureCount}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(job.status)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(job.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
