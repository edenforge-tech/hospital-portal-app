// PHI Access Tracking Component
// Patient-centric view showing who accessed specific patient records

'use client';

import { useState, useEffect } from 'react';
import { Search, FileText, AlertTriangle, Download, User } from 'lucide-react';
import { getApi } from '@/lib/api';

interface PhiAccessLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  dataViewed: string;
  justification?: string;
  ipAddress: string;
  sessionDuration?: number;
  deviceType: string;
  suspicious: boolean;
}

interface PhiAccessTrackingProps {
  tenantId: string;
}

export default function PhiAccessTracking({ tenantId }: PhiAccessTrackingProps) {
  const [patientId, setPatientId] = useState('');
  const [patientName, setPatientName] = useState('');
  const [accessLogs, setAccessLogs] = useState<PhiAccessLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 25;

  const loadPhiAccessLogs = async () => {
    if (!patientId.trim()) {
      setError('Please enter a Patient ID');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const api = getApi();
      const params: any = {
        page: currentPage,
        pageSize,
      };
      
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await api.get(`/audit-logs/phi-access/${patientId}`, { params });
      
      setAccessLogs(response.data.logs || []);
      setTotalCount(response.data.totalCount || 0);
      setPatientName(response.data.patientName || `Patient ${patientId}`);
    } catch (err: any) {
      console.error('Error loading PHI access logs:', err);
      setError(err.response?.data?.message || 'Failed to load PHI access logs');
      setAccessLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    alert('Export PHI access report for Patient ID: ' + patientId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-6 border border-purple-200">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <FileText className="mr-3 text-purple-600" size={28} />
              PHI Access Tracking
            </h2>
            <p className="text-gray-600 mt-2">
              Track who accessed protected health information for specific patients
            </p>
          </div>
          <div className="flex items-center space-x-2 text-sm text-purple-700">
            <AlertTriangle size={16} />
            <span className="font-medium">HIPAA Protected</span>
          </div>
        </div>
      </div>

      {/* Search Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Patient ID Search */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Patient ID <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
              <input
                type="text"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                placeholder="Enter Patient ID or Medical Record Number..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                onKeyPress={(e) => e.key === 'Enter' && loadPhiAccessLogs()}
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        <div className="mt-4 flex justify-between items-center">
          <button
            onClick={loadPhiAccessLogs}
            disabled={loading || !patientId.trim()}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? 'Searching...' : 'Search Access Logs'}
          </button>

          {accessLogs.length > 0 && (
            <button
              onClick={handleExport}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              <Download size={18} className="mr-2" />
              Export Report
            </button>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          {error}
        </div>
      )}

      {/* Results */}
      {patientName && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Access History for: <span className="text-purple-600">{patientName}</span>
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Patient ID: {patientId} • {totalCount} access record{totalCount !== 1 ? 's' : ''} found
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <span className="ml-3 text-gray-600">Loading access logs...</span>
            </div>
          ) : accessLogs.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No access records found for this patient
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data Viewed</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Justification</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP Address</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Flags</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {accessLogs.map((log) => (
                    <tr key={log.id} className={`hover:bg-gray-50 ${log.suspicious ? 'bg-red-50' : ''}`}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <User size={16} className="mr-2 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">{log.userName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {log.userRole}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.action}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 max-w-xs">
                        <div className="truncate" title={log.dataViewed}>
                          {log.dataViewed}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 max-w-xs">
                        {log.justification ? (
                          <div className="truncate" title={log.justification}>
                            {log.justification}
                          </div>
                        ) : (
                          <span className="text-yellow-600 font-medium">⚠️ No justification</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600">
                        {log.ipAddress}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {log.sessionDuration ? `${Math.floor(log.sessionDuration / 60)}m ${log.sessionDuration % 60}s` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {log.suspicious && (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                            🚨 Suspicious
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Compliance Notice */}
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start">
              <AlertTriangle className="text-yellow-600 mt-0.5 mr-3" size={20} />
              <div className="text-sm text-yellow-800">
                <p className="font-semibold">HIPAA Compliance Notice</p>
                <p className="mt-1">
                  This access log is maintained for regulatory compliance. All access to Protected Health Information (PHI)
                  is audited and monitored. Unauthorized access may result in disciplinary action and legal consequences.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
