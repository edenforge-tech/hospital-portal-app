// Todo #5: Bulk Operations Infrastructure - CSV Import/Export
'use client';

import { useState, useRef } from 'react';
import { Upload, Download, FileText, CheckCircle, XCircle, AlertTriangle, Users } from 'lucide-react';

interface ImportResult {
  success: number;
  failed: number;
  total: number;
  errors: Array<{ row: number; field: string; message: string }>;
}

interface BulkActionResult {
  successCount: number;
  failedCount: number;
  errors: string[];
}

export default function BulkOperationsPanel() {
  const [activeTab, setActiveTab] = useState<'import' | 'export' | 'batch'>('import');
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [importLoading, setImportLoading] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [batchAction, setBatchAction] = useState<'assign-role' | 'change-status' | 'delete'>('assign-role');
  const [batchLoading, setBatchLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Export filters
  const [exportUserType, setExportUserType] = useState('');
  const [exportUserStatus, setExportUserStatus] = useState('');
  const [exportCreatedAfter, setExportCreatedAfter] = useState('');
  const [exportCreatedBefore, setExportCreatedBefore] = useState('');

  const downloadTemplate = () => {
    const template = `Email,FirstName,LastName,PhoneNumber,UserType,LicenseNumber,JobTitle,HireDate
john.doe@hospital.com,John,Doe,+1-555-1234,Staff,MD12345,Ophthalmologist,2024-01-15
jane.smith@hospital.com,Jane,Smith,+1-555-5678,Staff,RN67890,Registered Nurse,2024-02-01
patient@example.com,Test,Patient,+1-555-9999,Patient,,,`;

    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'user-import-template.csv';
    a.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImportFile(e.target.files[0]);
      setImportResult(null);
    }
  };

  const handleImport = async () => {
    if (!importFile) return;

    setImportLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', importFile);

      // In production: const response = await bulkOperationsApi.importUsers(formData);
      // Mock response for demonstration
      setTimeout(() => {
        setImportResult({
          success: 45,
          failed: 5,
          total: 50,
          errors: [
            { row: 12, field: 'Email', message: 'Duplicate email address' },
            { row: 23, field: 'PhoneNumber', message: 'Invalid phone number format' },
            { row: 34, field: 'LicenseNumber', message: 'License number already exists' },
            { row: 41, field: 'HireDate', message: 'Invalid date format (use YYYY-MM-DD)' },
            { row: 48, field: 'UserType', message: 'Invalid user type (must be Staff or Patient)' },
          ],
        });
        setImportLoading(false);
      }, 2000);
    } catch (error) {
      console.error('Import error:', error);
      setImportLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const filters = {
        userType: exportUserType || undefined,
        userStatus: exportUserStatus || undefined,
        createdAfter: exportCreatedAfter || undefined,
        createdBefore: exportCreatedBefore || undefined,
      };

      // In production: const response = await bulkOperationsApi.exportUsers(filters);
      // Mock CSV data
      const csv = `Id,Email,FirstName,LastName,PhoneNumber,UserType,UserStatus,LicenseNumber,CreatedAt
1,john.doe@hospital.com,John,Doe,+1-555-1234,Staff,active,MD12345,2024-01-15
2,jane.smith@hospital.com,Jane,Smith,+1-555-5678,Staff,active,RN67890,2024-02-01`;

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  const handleBatchAction = async () => {
    if (selectedUsers.length === 0) {
      alert('Please select users first');
      return;
    }

    setBatchLoading(true);
    try {
      // In production: await bulkOperationsApi.batchAction({ action: batchAction, userIds: selectedUsers });
      setTimeout(() => {
        alert(`${batchAction} completed for ${selectedUsers.length} users`);
        setBatchLoading(false);
        setSelectedUsers([]);
      }, 1500);
    } catch (error) {
      console.error('Batch action error:', error);
      setBatchLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-3 mb-6">
        <Users className="w-8 h-8 text-blue-600" />
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Bulk Operations</h2>
          <p className="text-sm text-gray-600">Import, export, and manage users in bulk</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex gap-1">
          <button
            onClick={() => setActiveTab('import')}
            className={`px-4 py-3 font-medium text-sm transition-all ${
              activeTab === 'import'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Import Users
            </div>
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`px-4 py-3 font-medium text-sm transition-all ${
              activeTab === 'export'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export Users
            </div>
          </button>
          <button
            onClick={() => setActiveTab('batch')}
            className={`px-4 py-3 font-medium text-sm transition-all ${
              activeTab === 'batch'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Batch Actions
            </div>
          </button>
        </div>
      </div>

      {/* Import Tab */}
      {activeTab === 'import' && (
        <div className="space-y-6">
          <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Before You Start</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Download the CSV template to ensure correct format</li>
              <li>• Required fields: Email, FirstName, LastName</li>
              <li>• Optional fields: PhoneNumber, UserType, LicenseNumber, JobTitle, HireDate</li>
              <li>• Maximum 1000 users per import</li>
              <li>• Duplicate emails will be rejected</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <button
              onClick={downloadTemplate}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium flex items-center gap-2 transition-all"
            >
              <FileText className="w-4 h-4" />
              Download Template
            </button>
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 mb-3">
              {importFile ? `Selected: ${importFile.name}` : 'Drag and drop CSV file here or click to browse'}
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all"
            >
              Select File
            </button>
          </div>

          {importFile && (
            <button
              onClick={handleImport}
              disabled={importLoading}
              className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-all"
            >
              {importLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Start Import
                </>
              )}
            </button>
          )}

          {importResult && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
                  <CheckCircle className="w-8 h-8 text-green-600 mb-2" />
                  <p className="text-2xl font-bold text-green-900">{importResult.success}</p>
                  <p className="text-sm text-green-700">Successful</p>
                </div>
                <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
                  <XCircle className="w-8 h-8 text-red-600 mb-2" />
                  <p className="text-2xl font-bold text-red-900">{importResult.failed}</p>
                  <p className="text-sm text-red-700">Failed</p>
                </div>
                <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
                  <FileText className="w-8 h-8 text-blue-600 mb-2" />
                  <p className="text-2xl font-bold text-blue-900">{importResult.total}</p>
                  <p className="text-sm text-blue-700">Total Rows</p>
                </div>
              </div>

              {importResult.errors.length > 0 && (
                <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <h3 className="font-semibold text-red-900">Import Errors</h3>
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {importResult.errors.map((error, index) => (
                      <div key={index} className="bg-white rounded p-3 text-sm">
                        <p className="font-semibold text-red-800">Row {error.row}: {error.field}</p>
                        <p className="text-red-600">{error.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Export Tab */}
      {activeTab === 'export' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">User Type</label>
              <select
                value={exportUserType}
                onChange={(e) => setExportUserType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Types</option>
                <option value="Staff">Staff</option>
                <option value="Patient">Patient</option>
                <option value="Admin">Admin</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">User Status</label>
              <select
                value={exportUserStatus}
                onChange={(e) => setExportUserStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Created After</label>
              <input
                type="date"
                value={exportCreatedAfter}
                onChange={(e) => setExportCreatedAfter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Created Before</label>
              <input
                type="date"
                value={exportCreatedBefore}
                onChange={(e) => setExportCreatedBefore(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <button
            onClick={handleExport}
            className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-all"
          >
            <Download className="w-5 h-5" />
            Export to CSV
          </button>

          <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
            <h3 className="font-semibold text-green-900 mb-2">Export Information</h3>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• Exported file will include all user details</li>
              <li>• File format: CSV (compatible with Excel)</li>
              <li>• Sensitive data (passwords) will not be included</li>
              <li>• File will be downloaded to your computer</li>
            </ul>
          </div>
        </div>
      )}

      {/* Batch Actions Tab */}
      {activeTab === 'batch' && (
        <div className="space-y-6">
          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-900 mb-2">⚠️ Important</h3>
            <p className="text-sm text-yellow-800">
              Batch actions will be applied to all selected users. This action cannot be undone. Please verify your selection before proceeding.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Action</label>
            <select
              value={batchAction}
              onChange={(e) => setBatchAction(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="assign-role">Assign Role</option>
              <option value="change-status">Change Status</option>
              <option value="delete">Delete Users</option>
            </select>
          </div>

          <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-4">
            <p className="text-sm text-gray-700 mb-2">
              <span className="font-semibold">{selectedUsers.length}</span> users selected
            </p>
            <p className="text-xs text-gray-500">
              Select users from the main users table, then return here to apply batch actions
            </p>
          </div>

          <button
            onClick={handleBatchAction}
            disabled={batchLoading || selectedUsers.length === 0}
            className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-all"
          >
            {batchLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Processing...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                Apply to {selectedUsers.length} Users
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
