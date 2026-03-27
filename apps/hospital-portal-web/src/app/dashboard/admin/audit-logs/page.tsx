'use client';

import { useAuthStore } from '@/lib/auth-store';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { auditLogsApi, activationAuditLogsApi } from '@/lib/api';
import { Search, Download, Filter, Calendar, Shield, Activity, X, BarChart3, FileSpreadsheet, FileText } from 'lucide-react';
import AuditLogDetailsModal from '@/components/AuditLogDetailsModal';
import PhiAccessTracking from '@/components/PhiAccessTracking';
import BreachDetectionAlerts from '@/components/BreachDetectionAlerts';

interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  entityType: string;
  entityId: string;
  description: string;
  oldValues?: string;
  newValues?: string;
  ipAddress: string;
  severity: string;
  success: boolean;
  details?: string;
}

interface ActivationAuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  activationStep: string;
  status: string;
  errorMessage?: string;
  ipAddress: string;
  userAgent?: string;
  deviceInfo?: string;
  suspiciousActivity: boolean;
  responseTimeMs?: number;
}

interface AuditLogResponse {
  logs: AuditLog[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

interface ActivationAuditLogResponse {
  logs: ActivationAuditLog[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

type LogType = 'system' | 'activation' | 'phi-access' | 'breach-detection';

export default function AuditLogsPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  
  const [logType, setLogType] = useState<LogType>('system');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [activationLogs, setActivationLogs] = useState<ActivationAuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  // System Audit Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [entityTypeFilter, setEntityTypeFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  
  // Activation Audit Filters
  const [activationStepFilter, setActivationStepFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [suspiciousOnly, setSuspiciousOnly] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [exportFormat, setExportFormat] = useState<'csv' | 'excel' | 'pdf'>('csv');
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Quick filter presets
  const applyQuickFilter = (preset: 'today' | 'week' | 'month' | 'last30') => {
    const now = new Date();
    const end = now.toISOString().split('T')[0];
    let start = '';

    switch (preset) {
      case 'today':
        start = end;
        break;
      case 'week':
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        start = weekAgo.toISOString().split('T')[0];
        break;
      case 'month':
        const monthAgo = new Date(now);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        start = monthAgo.toISOString().split('T')[0];
        break;
      case 'last30':
        const thirtyDaysAgo = new Date(now);
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        start = thirtyDaysAgo.toISOString().split('T')[0];
        break;
    }

    setStartDate(start);
    setEndDate(end);
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
    setActionFilter('');
    setEntityTypeFilter('');
    setSeverityFilter('');
    setActivationStepFilter('');
    setStatusFilter('');
    setSuspiciousOnly(false);
    setCurrentPage(1);
  };

  const hasActiveFilters = searchTerm || startDate || endDate || actionFilter || 
    entityTypeFilter || severityFilter || activationStepFilter || statusFilter || suspiciousOnly;

  // Debounce search
  useEffect(() => {
    if (!user) return;
    
    const timer = setTimeout(() => {
      if (logType === 'system') {
        loadAuditLogs();
      } else {
        loadActivationAuditLogs();
      }
    }, searchTerm ? 500 : 0);

    return () => clearTimeout(timer);
  }, [user, logType, currentPage, pageSize, searchTerm, startDate, endDate, actionFilter, entityTypeFilter, severityFilter, activationStepFilter, statusFilter, suspiciousOnly]);

  const loadAuditLogs = async () => {
    try {
      setLoading(true);
      setError('');
      
      const filters = {
        page: currentPage,
        pageSize,
        search: searchTerm || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        action: actionFilter || undefined,
        entityType: entityTypeFilter || undefined,
        severity: severityFilter || undefined,
      };

      const response = await auditLogsApi.getAll(filters);
      const data: AuditLogResponse = response.data;
      
      setLogs(data.logs || []);
      setTotalCount(data.totalCount || 0);
      setTotalPages(data.totalPages || 0);
    } catch (err: any) {
      console.error('Error loading audit logs:', err);
      setError(err.response?.data?.message || 'Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  const loadActivationAuditLogs = async () => {
    try {
      setLoading(true);
      setError('');
      
      const filters = {
        page: currentPage,
        pageSize,
        search: searchTerm || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        activationStep: activationStepFilter || undefined,
        status: statusFilter || undefined,
        suspiciousOnly: suspiciousOnly || undefined,
      };

      const response = await activationAuditLogsApi.getAll(filters);
      const data: ActivationAuditLogResponse = response.data;
      
      setActivationLogs(data.logs || []);
      setTotalCount(data.totalCount || 0);
      setTotalPages(data.totalPages || 0);
    } catch (err: any) {
      console.error('Error loading activation audit logs:', err);
      setError(err.response?.data?.message || 'Failed to load activation audit logs');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: 'csv' | 'excel' | 'pdf' = exportFormat) => {
    try {
      setShowExportMenu(false);
      const response = await auditLogsApi.export(format, {
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        action: actionFilter || undefined,
        entityType: entityTypeFilter || undefined,
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const dateStr = new Date().toISOString().split('T')[0];
      const extension = format === 'excel' ? 'xlsx' : format;
      link.setAttribute('download', `audit-logs-${dateStr}.${extension}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err: any) {
      console.error('Error exporting audit logs:', err);
      alert(`Failed to export audit logs as ${format.toUpperCase()}`);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      case 'info': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

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

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>
          <p className="text-gray-600 mt-2">Track all system activities and user activation processes</p>
        </div>
        <div className="flex gap-2">
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
            >
              <X size={20} className="mr-2" />
              Clear Filters
            </button>
          )}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              <Download size={20} className="mr-2" />
              Export
            </button>
            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                <button
                  onClick={() => handleExport('csv')}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 rounded-t-lg"
                >
                  <Download size={16} />
                  Export as CSV
                </button>
                <button
                  onClick={() => handleExport('excel')}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                >
                  <FileSpreadsheet size={16} />
                  Export as Excel
                </button>
                <button
                  onClick={() => handleExport('pdf')}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 rounded-b-lg"
                >
                  <FileText size={16} />
                  Export as PDF
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => { setLogType('system'); setCurrentPage(1); }}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
              logType === 'system'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center">
              <Activity size={18} className="mr-2" />
              System Audit Logs
            </div>
          </button>
          <button
            onClick={() => { setLogType('activation'); setCurrentPage(1); }}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
              logType === 'activation'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center">
              <Shield size={18} className="mr-2" />
              Activation Audit Logs
            </div>
          </button>
          <button
            onClick={() => { setLogType('phi-access'); setCurrentPage(1); }}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
              logType === 'phi-access'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center">
              <Shield size={18} className="mr-2" />
              PHI Access Tracking
            </div>
          </button>
          <button
            onClick={() => { setLogType('breach-detection'); setCurrentPage(1); }}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
              logType === 'breach-detection'
                ? 'border-red-500 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center">
              <Shield size={18} className="mr-2" />
              Breach Detection
            </div>
          </button>
        </nav>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Logs</p>
              <p className="text-2xl font-bold text-gray-900">{totalCount.toLocaleString()}</p>
            </div>
            <BarChart3 className="text-indigo-600" size={32} />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">High Severity</p>
              <p className="text-2xl font-bold text-red-600">
                {logType === 'system' 
                  ? logs.filter((l: AuditLog) => l.severity === 'high').length
                  : activationLogs.filter((l: ActivationAuditLog) => l.status === 'failed').length}
              </p>
            </div>
            <Activity className="text-red-600" size={32} />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Recent Activity</p>
              <p className="text-2xl font-bold text-green-600">
                {logType === 'system' ? logs.length : activationLogs.length}
              </p>
            </div>
            <Shield className="text-green-600" size={32} />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Filtered</p>
              <p className="text-2xl font-bold text-blue-600">
                {hasActiveFilters ? 'Yes' : 'No'}
              </p>
            </div>
            <Filter className="text-blue-600" size={32} />
          </div>
        </div>
      </div>

      {/* Quick Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex items-center gap-2">
          <Calendar size={20} className="text-gray-600" />
          <span className="text-sm font-medium text-gray-700 mr-2">Quick Filters:</span>
          <button
            onClick={() => applyQuickFilter('today')}
            className="px-3 py-1 text-sm bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition"
          >
            Today
          </button>
          <button
            onClick={() => applyQuickFilter('week')}
            className="px-3 py-1 text-sm bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition"
          >
            This Week
          </button>
          <button
            onClick={() => applyQuickFilter('month')}
            className="px-3 py-1 text-sm bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition"
          >
            This Month
          </button>
          <button
            onClick={() => applyQuickFilter('last30')}
            className="px-3 py-1 text-sm bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition"
          >
            Last 30 Days
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search logs..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {logType === 'system' ? (
            <>
              {/* Action Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
                <select
                  value={actionFilter}
                  onChange={(e) => setActionFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">All Actions</option>
                  <option value="Create">Create</option>
                  <option value="Update">Update</option>
                  <option value="Delete">Delete</option>
                  <option value="Login">Login</option>
                  <option value="Logout">Logout</option>
                  <option value="Access">Access</option>
                </select>
              </div>

              {/* Entity Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Entity Type</label>
                <select
                  value={entityTypeFilter}
                  onChange={(e) => setEntityTypeFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">All Types</option>
                  <option value="User">User</option>
                  <option value="Role">Role</option>
                  <option value="Permission">Permission</option>
                  <option value="Department">Department</option>
                  <option value="Patient">Patient</option>
                  <option value="Appointment">Appointment</option>
                </select>
              </div>

              {/* Severity Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
                <select
                  value={severityFilter}
                  onChange={(e) => setSeverityFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">All Severities</option>
                  <option value="info">Info</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </>
          ) : (
            <>
              {/* Activation Step Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Activation Step</label>
                <select
                  value={activationStepFilter}
                  onChange={(e) => setActivationStepFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">All Steps</option>
                  <option value="token_validated">Token Validated</option>
                  <option value="email_verified">Email Verified</option>
                  <option value="otp_entered">OTP Entered</option>
                  <option value="password_set">Password Set</option>
                  <option value="professional_info_saved">Professional Info Saved</option>
                  <option value="terms_accepted">Terms Accepted</option>
                  <option value="hipaa_accepted">HIPAA Accepted</option>
                  <option value="mfa_setup_started">MFA Setup Started</option>
                  <option value="mfa_completed">MFA Completed</option>
                  <option value="activation_completed">Activation Completed</option>
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">All Statuses</option>
                  <option value="success">Success</option>
                  <option value="failed">Failed</option>
                  <option value="pending">Pending</option>
                </select>
              </div>

              {/* Suspicious Only */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Filter</label>
                <label className="flex items-center px-3 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={suspiciousOnly}
                    onChange={(e) => setSuspiciousOnly(e.target.checked)}
                    className="mr-2 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">Suspicious Only</span>
                </label>
              </div>
            </>
          )}

          {/* Page Size */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Items Per Page</label>
            <select
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      {logType !== 'phi-access' && logType !== 'breach-detection' && (
        <div className="mb-4 text-sm text-gray-600">
          Showing {(logType === 'system' ? logs.length : activationLogs.length) > 0 ? ((currentPage - 1) * pageSize + 1) : 0} - {Math.min(currentPage * pageSize, totalCount)} of {totalCount} logs
        </div>
      )}

      {/* Conditional Tab Content */}
      {logType === 'phi-access' ? (
        <PhiAccessTracking tenantId={user?.tenantId || ''} />
      ) : logType === 'breach-detection' ? (
        <BreachDetectionAlerts tenantId={user?.tenantId || ''} />
      ) : logType === 'system' ? (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP Address</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Severity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                        <span className="ml-3 text-gray-600">Loading audit logs...</span>
                      </div>
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                      No audit logs found
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr 
                      key={log.id} 
                      onClick={() => { setSelectedLog(log); setModalOpen(true); }}
                      className="hover:bg-gray-50 cursor-pointer"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.userName || 'System'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.action}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.entityType}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                        {log.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.ipAddress}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(log.severity)}`}>
                          {log.severity || 'Info'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {log.success ? (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                            Success
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                            Failed
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Activation Step</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP Address</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Device</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Response Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Flags</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                        <span className="ml-3 text-gray-600">Loading activation audit logs...</span>
                      </div>
                    </td>
                  </tr>
                ) : activationLogs.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                      No activation audit logs found
                    </td>
                  </tr>
                ) : (
                  activationLogs.map((log) => {
                    const deviceData = log.deviceInfo ? JSON.parse(log.deviceInfo) : null;
                    return (
                      <tr key={log.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {log.userName || 'Unknown'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {log.activationStep.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {log.status === 'success' ? (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                              Success
                            </span>
                          ) : log.status === 'failed' ? (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                              Failed
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {log.ipAddress}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {deviceData ? `${deviceData.OS || 'Unknown'} - ${deviceData.Browser || 'Unknown'}` : 'Unknown'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {log.responseTimeMs ? `${log.responseTimeMs}ms` : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {log.suspiciousActivity && (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                              ⚠️ Suspicious
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1 || loading}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || loading}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Next
            </button>
          </div>
        )}
      
      {/* Audit Log Details Modal */}
      <AuditLogDetailsModal 
        log={selectedLog} 
        isOpen={modalOpen} 
        onClose={() => { setModalOpen(false); setSelectedLog(null); }} 
      />
    </div>
  );
}
