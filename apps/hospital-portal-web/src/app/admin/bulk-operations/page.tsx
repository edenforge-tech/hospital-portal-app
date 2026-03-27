'use client';

import React, { useState } from 'react';

// ============================================================================
// Types
// ============================================================================

interface BulkOperation {
  id: string;
  name: string;
  type: string;
  entityType: string;
  status: string;
  totalRecords: number;
  processedRecords: number;
  successCount: number;
  errorCount: number;
  progress: number;
  createdByName: string;
  createdAt: string;
  completedAt?: string;
}

interface ImportTemplate {
  id: string;
  name: string;
  entityType: string;
  fields: number;
  lastUsed?: string;
}

interface ScheduledOperation {
  id: string;
  name: string;
  operationType: string;
  entityType: string;
  schedule: string;
  nextRun: string;
  lastRunStatus: string;
  isActive: boolean;
}

// ============================================================================
// Components
// ============================================================================

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: 'bg-gray-100 text-gray-700',
    queued: 'bg-blue-100 text-blue-700',
    processing: 'bg-yellow-100 text-yellow-700',
    completed: 'bg-green-100 text-green-700',
    failed: 'bg-red-100 text-red-700',
    cancelled: 'bg-gray-100 text-gray-700',
    partially_completed: 'bg-orange-100 text-orange-700',
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || colors.pending}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}

function ProgressBar({ progress, status }: { progress: number; status: string }) {
  const barColor = status === 'failed' ? 'bg-red-500' : status === 'completed' ? 'bg-green-500' : 'bg-blue-500';
  
  return (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div
        className={`h-2 rounded-full transition-all duration-300 ${barColor}`}
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

function MetricCard({ label, value, icon, color }: { label: string; value: string | number; icon: string; color: string }) {
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

function OperationTypeIcon({ type }: { type: string }) {
  const icons: Record<string, string> = {
    import: '📥',
    export: '📤',
    update: '✏️',
    delete: '🗑️',
    archive: '📦',
    sync: '🔄',
    validate: '✅',
    merge: '🔀',
  };
  return <span className="text-lg">{icons[type] || '📋'}</span>;
}

function EntityTypeBadge({ entityType }: { entityType: string }) {
  const labels: Record<string, { label: string; color: string }> = {
    patients: { label: 'Patients', color: 'bg-purple-100 text-purple-700' },
    appointments: { label: 'Appointments', color: 'bg-blue-100 text-blue-700' },
    users: { label: 'Users', color: 'bg-green-100 text-green-700' },
    inventory: { label: 'Inventory', color: 'bg-yellow-100 text-yellow-700' },
    invoices: { label: 'Invoices', color: 'bg-orange-100 text-orange-700' },
    medical_records: { label: 'Medical Records', color: 'bg-red-100 text-red-700' },
  };

  const item = labels[entityType] || { label: entityType, color: 'bg-gray-100 text-gray-700' };

  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${item.color}`}>
      {item.label}
    </span>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export default function BulkOperationsPage() {
  const [activeTab, setActiveTab] = useState<'operations' | 'import' | 'export' | 'templates' | 'scheduled'>('operations');
  const [showNewOperationModal, setShowNewOperationModal] = useState(false);
  const [selectedEntityType, setSelectedEntityType] = useState('');
  const [selectedOperationType, setSelectedOperationType] = useState('');

  // Mock data
  const operations: BulkOperation[] = [
    {
      id: '1',
      name: 'Patient Data Import - January 2026',
      type: 'import',
      entityType: 'patients',
      status: 'completed',
      totalRecords: 1500,
      processedRecords: 1500,
      successCount: 1485,
      errorCount: 15,
      progress: 100,
      createdByName: 'Admin User',
      createdAt: '2026-01-24T08:00:00Z',
      completedAt: '2026-01-24T08:15:00Z',
    },
    {
      id: '2',
      name: 'Appointment Export Q4 2025',
      type: 'export',
      entityType: 'appointments',
      status: 'processing',
      totalRecords: 8500,
      processedRecords: 4250,
      successCount: 4250,
      errorCount: 0,
      progress: 50,
      createdByName: 'Dr. Smith',
      createdAt: '2026-01-24T10:30:00Z',
    },
    {
      id: '3',
      name: 'Bulk Update - Patient Status',
      type: 'update',
      entityType: 'patients',
      status: 'queued',
      totalRecords: 2500,
      processedRecords: 0,
      successCount: 0,
      errorCount: 0,
      progress: 0,
      createdByName: 'System Admin',
      createdAt: '2026-01-24T11:00:00Z',
    },
    {
      id: '4',
      name: 'Archive Old Records',
      type: 'archive',
      entityType: 'medical_records',
      status: 'failed',
      totalRecords: 5000,
      processedRecords: 2340,
      successCount: 2300,
      errorCount: 40,
      progress: 47,
      createdByName: 'Data Manager',
      createdAt: '2026-01-23T14:00:00Z',
    },
  ];

  const importTemplates: ImportTemplate[] = [
    { id: '1', name: 'Patient Import Template', entityType: 'patients', fields: 25, lastUsed: '2026-01-20' },
    { id: '2', name: 'Appointment Import Template', entityType: 'appointments', fields: 15, lastUsed: '2026-01-18' },
    { id: '3', name: 'User Import Template', entityType: 'users', fields: 18, lastUsed: '2026-01-15' },
    { id: '4', name: 'Inventory Import Template', entityType: 'inventory', fields: 22, lastUsed: '2026-01-10' },
  ];

  const scheduledOperations: ScheduledOperation[] = [
    {
      id: '1',
      name: 'Daily Patient Sync',
      operationType: 'sync',
      entityType: 'patients',
      schedule: 'Daily at 2:00 AM',
      nextRun: '2026-01-25T02:00:00Z',
      lastRunStatus: 'completed',
      isActive: true,
    },
    {
      id: '2',
      name: 'Weekly Appointment Export',
      operationType: 'export',
      entityType: 'appointments',
      schedule: 'Every Monday at 6:00 AM',
      nextRun: '2026-01-27T06:00:00Z',
      lastRunStatus: 'completed',
      isActive: true,
    },
    {
      id: '3',
      name: 'Monthly Archive',
      operationType: 'archive',
      entityType: 'medical_records',
      schedule: '1st of every month at 3:00 AM',
      nextRun: '2026-02-01T03:00:00Z',
      lastRunStatus: 'failed',
      isActive: false,
    },
  ];

  const entityTypes = ['patients', 'appointments', 'users', 'departments', 'inventory', 'invoices', 'medical_records'];
  const operationTypes = ['import', 'export', 'update', 'delete', 'archive', 'validate', 'sync'];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bulk Operations</h1>
          <p className="text-gray-500 mt-1">Mass data processing, import/export, and batch updates</p>
        </div>
        <button
          onClick={() => setShowNewOperationModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <span>➕</span>
          New Operation
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Active Operations" value={2} icon="⚡" color="bg-blue-100" />
        <MetricCard label="Completed Today" value={5} icon="✅" color="bg-green-100" />
        <MetricCard label="Records Processed" value="12.5K" icon="📊" color="bg-purple-100" />
        <MetricCard label="Scheduled Jobs" value={3} icon="📅" color="bg-yellow-100" />
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'operations', label: 'Operations', icon: '📋' },
            { id: 'import', label: 'Import Data', icon: '📥' },
            { id: 'export', label: 'Export Data', icon: '📤' },
            { id: 'templates', label: 'Templates', icon: '📄' },
            { id: 'scheduled', label: 'Scheduled', icon: '📅' },
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

      {/* Operations Tab */}
      {activeTab === 'operations' && (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <select
              value={selectedEntityType}
              onChange={(e) => setSelectedEntityType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Entity Types</option>
              {entityTypes.map((type) => (
                <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>
              ))}
            </select>
            <select
              value={selectedOperationType}
              onChange={(e) => setSelectedOperationType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Operation Types</option>
              {operationTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Search operations..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Operation</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {operations.map((op) => (
                  <tr key={op.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <OperationTypeIcon type={op.type} />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{op.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <EntityTypeBadge entityType={op.entityType} />
                            <span className="text-xs text-gray-500">by {op.createdByName}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-700 capitalize">{op.type}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-32">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-500">{op.processedRecords.toLocaleString()} / {op.totalRecords.toLocaleString()}</span>
                          <span className="text-xs font-medium text-gray-700">{op.progress}%</span>
                        </div>
                        <ProgressBar progress={op.progress} status={op.status} />
                        {op.errorCount > 0 && (
                          <p className="text-xs text-red-500 mt-1">{op.errorCount} errors</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={op.status} />
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-700">{new Date(op.createdAt).toLocaleDateString()}</p>
                      <p className="text-xs text-gray-500">{new Date(op.createdAt).toLocaleTimeString()}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button className="p-1 text-gray-400 hover:text-blue-600" title="View Details">
                          👁️
                        </button>
                        {op.status === 'processing' && (
                          <button className="p-1 text-gray-400 hover:text-yellow-600" title="Pause">
                            ⏸️
                          </button>
                        )}
                        {op.status === 'failed' && (
                          <button className="p-1 text-gray-400 hover:text-green-600" title="Retry">
                            🔄
                          </button>
                        )}
                        {op.status === 'completed' && (
                          <button className="p-1 text-gray-400 hover:text-green-600" title="Download Results">
                            📥
                          </button>
                        )}
                        {['pending', 'queued'].includes(op.status) && (
                          <button className="p-1 text-gray-400 hover:text-red-600" title="Cancel">
                            ❌
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Import Tab */}
      {activeTab === 'import' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Import Data</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Entity Type</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="">Select entity type...</option>
                  {entityTypes.map((type) => (
                    <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Import Template (Optional)</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="">Select template...</option>
                  {importTemplates.map((template) => (
                    <option key={template.id} value={template.id}>{template.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Upload File</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer">
                <div className="flex flex-col items-center">
                  <span className="text-4xl mb-3">📁</span>
                  <p className="text-gray-700 font-medium">Drag and drop your file here</p>
                  <p className="text-sm text-gray-500 mt-1">or click to browse</p>
                  <p className="text-xs text-gray-400 mt-2">Supported formats: CSV, XLSX, JSON, XML (Max 50MB)</p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-4">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Upload & Preview
              </button>
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                Download Template
              </button>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <span className="text-blue-600 text-xl">💡</span>
              <div>
                <h4 className="font-medium text-blue-900">Import Tips</h4>
                <ul className="text-sm text-blue-700 mt-1 list-disc list-inside space-y-1">
                  <li>Download the template first to see required fields and format</li>
                  <li>Make sure all required fields are filled in</li>
                  <li>Date fields should be in YYYY-MM-DD format</li>
                  <li>Large files will be processed in batches</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Export Tab */}
      {activeTab === 'export' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Data</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Entity Type</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="">Select entity type...</option>
                  {entityTypes.map((type) => (
                    <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Export Format</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="csv">CSV</option>
                  <option value="xlsx">Excel (XLSX)</option>
                  <option value="json">JSON</option>
                  <option value="xml">XML</option>
                  <option value="pdf">PDF Report</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="all">All Records</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="quarter">This Quarter</option>
                  <option value="year">This Year</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Fields to Export</label>
              <div className="border border-gray-300 rounded-lg p-4 max-h-48 overflow-y-auto">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {['ID', 'Name', 'Email', 'Phone', 'Address', 'Status', 'Created Date', 'Updated Date', 'Department', 'Notes'].map((field) => (
                    <label key={field} className="flex items-center gap-2 text-sm">
                      <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" defaultChecked />
                      {field}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-4">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Start Export
              </button>
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                Quick Export (Small datasets)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Saved Templates</h3>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
              ➕ Create Template
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {importTemplates.map((template) => (
              <div key={template.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:border-blue-300 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📄</span>
                    <div>
                      <h4 className="font-medium text-gray-900">{template.name}</h4>
                      <EntityTypeBadge entityType={template.entityType} />
                    </div>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600">⋮</button>
                </div>
                <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                  <span>{template.fields} fields</span>
                  {template.lastUsed && <span>Last used: {template.lastUsed}</span>}
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <button className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors">
                    Download
                  </button>
                  <button className="flex-1 px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors">
                    Use Template
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Scheduled Tab */}
      {activeTab === 'scheduled' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Scheduled Operations</h3>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
              ➕ Schedule Operation
            </button>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Schedule</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Next Run</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Active</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {scheduledOperations.map((op) => (
                  <tr key={op.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <OperationTypeIcon type={op.operationType} />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{op.name}</p>
                          <EntityTypeBadge entityType={op.entityType} />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-700 capitalize">{op.operationType}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-700">{op.schedule}</span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-700">{new Date(op.nextRun).toLocaleDateString()}</p>
                      <p className="text-xs text-gray-500">{new Date(op.nextRun).toLocaleTimeString()}</p>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={op.lastRunStatus} />
                    </td>
                    <td className="px-6 py-4">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={op.isActive} className="sr-only peer" readOnly />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button className="p-1 text-gray-400 hover:text-green-600" title="Run Now">
                          ▶️
                        </button>
                        <button className="p-1 text-gray-400 hover:text-blue-600" title="Edit">
                          ✏️
                        </button>
                        <button className="p-1 text-gray-400 hover:text-red-600" title="Delete">
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* New Operation Modal */}
      {showNewOperationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">New Bulk Operation</h2>
                <button
                  onClick={() => setShowNewOperationModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Operation Type</label>
                  <div className="grid grid-cols-3 gap-3">
                    {operationTypes.map((type) => (
                      <button
                        key={type}
                        className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center"
                      >
                        <OperationTypeIcon type={type} />
                        <p className="text-sm font-medium text-gray-700 mt-2 capitalize">{type}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Entity Type</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="">Select entity type...</option>
                    {entityTypes.map((type) => (
                      <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Operation Name</label>
                  <input
                    type="text"
                    placeholder="Enter a name for this operation..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="mt-8 flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowNewOperationModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
