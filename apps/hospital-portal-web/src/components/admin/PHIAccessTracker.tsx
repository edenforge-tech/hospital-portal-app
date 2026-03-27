// Todo #4: PHI Access Tracking - "Who accessed patient X?"
'use client';

import { useState, useEffect } from 'react';
import { Search, User, Clock, Shield, FileText, Download, Filter } from 'lucide-react';

interface PHIAccessLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  patientId: string;
  patientName: string;
  dataAccessed: string[];
  purpose: string;
  ipAddress: string;
  deviceInfo?: string;
  sessionDuration?: number;
  authorized: boolean;
}

export default function PHIAccessTracker() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'patient' | 'user'>('patient');
  const [logs, setLogs] = useState<PHIAccessLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const searchPHIAccess = async () => {
    setLoading(true);
    try {
      // In production: const response = await auditLogsApi.searchPHIAccess({ searchType, query: searchQuery, dateFrom, dateTo, roleFilter });
      // Mock data for demonstration
      const mockLogs: PHIAccessLog[] = [
        {
          id: '1',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          userId: 'user-001',
          userName: 'Dr. Sarah Johnson',
          userRole: 'Ophthalmologist',
          action: 'Viewed Patient Record',
          patientId: 'patient-123',
          patientName: 'John Doe',
          dataAccessed: ['Demographics', 'Medical History', 'Prescriptions'],
          purpose: 'Routine Examination',
          ipAddress: '192.168.1.100',
          deviceInfo: 'Windows 11, Chrome 120',
          sessionDuration: 15,
          authorized: true,
        },
        {
          id: '2',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          userId: 'user-002',
          userName: 'Nurse Emily Davis',
          userRole: 'Registered Nurse',
          action: 'Updated Vital Signs',
          patientId: 'patient-123',
          patientName: 'John Doe',
          dataAccessed: ['Vital Signs', 'Clinical Notes'],
          purpose: 'Patient Care',
          ipAddress: '192.168.1.105',
          sessionDuration: 8,
          authorized: true,
        },
      ];
      
      setLogs(mockLogs);
    } catch (error) {
      console.error('Error searching PHI access:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    // In production: Generate Excel file with PHI access logs
    const csv = [
      ['Timestamp', 'User', 'Role', 'Action', 'Patient', 'Data Accessed', 'Purpose', 'IP Address', 'Authorized'].join(','),
      ...logs.map(log => [
        new Date(log.timestamp).toLocaleString(),
        log.userName,
        log.userRole,
        log.action,
        log.patientName,
        log.dataAccessed.join('; '),
        log.purpose,
        log.ipAddress,
        log.authorized ? 'Yes' : 'No'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `phi-access-log-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="w-8 h-8 text-purple-600" />
        <div>
          <h2 className="text-2xl font-bold text-gray-900">PHI Access Tracker</h2>
          <p className="text-sm text-gray-600">Search who accessed Protected Health Information</p>
        </div>
      </div>

      {/* Search Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Search By</label>
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value as 'patient' | 'user')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="patient">Patient</option>
            <option value="user">User/Staff</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {searchType === 'patient' ? 'Patient Name/ID' : 'User Name/ID'}
          </label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={searchType === 'patient' ? 'Enter patient name or ID' : 'Enter user name or ID'}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Date From</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Date To</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="flex gap-3 mb-6">
        <button
          onClick={searchPHIAccess}
          disabled={loading || !searchQuery}
          className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white rounded-lg font-medium flex items-center gap-2 transition-all"
        >
          <Search className="w-4 h-4" />
          Search Access Logs
        </button>
        <button
          onClick={exportToExcel}
          disabled={logs.length === 0}
          className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white rounded-lg font-medium flex items-center gap-2 transition-all"
        >
          <Download className="w-4 h-4" />
          Export to Excel
        </button>
      </div>

      {/* Results */}
      {logs.length > 0 && (
        <div className="space-y-4">
          <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-4">
            <p className="text-sm font-semibold text-purple-900">
              Found {logs.length} PHI access {logs.length === 1 ? 'record' : 'records'}
            </p>
          </div>

          <div className="space-y-3">
            {logs.map((log) => (
              <div key={log.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${log.authorized ? 'bg-green-100' : 'bg-red-100'}`}>
                      <User className={`w-5 h-5 ${log.authorized ? 'text-green-600' : 'text-red-600'}`} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{log.userName}</p>
                      <p className="text-sm text-gray-600">{log.userRole}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {new Date(log.timestamp).toLocaleString()}
                    </p>
                    {log.sessionDuration && (
                      <p className="text-xs text-gray-500 mt-1">Duration: {log.sessionDuration} mins</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Action</p>
                    <p className="text-sm font-medium">{log.action}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Patient</p>
                    <p className="text-sm font-medium">{log.patientName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Purpose</p>
                    <p className="text-sm font-medium">{log.purpose}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">IP Address</p>
                    <p className="text-sm font-medium font-mono">{log.ipAddress}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-1">Data Accessed</p>
                  <div className="flex flex-wrap gap-2">
                    {log.dataAccessed.map((data, index) => (
                      <span key={index} className="px-3 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                        {data}
                      </span>
                    ))}
                  </div>
                </div>

                {!log.authorized && (
                  <div className="mt-3 bg-red-50 border border-red-300 rounded-lg p-3">
                    <p className="text-sm text-red-800 font-semibold">⚠️ Unauthorized Access Detected</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {logs.length === 0 && !loading && searchQuery && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No PHI access records found</p>
        </div>
      )}
    </div>
  );
}
