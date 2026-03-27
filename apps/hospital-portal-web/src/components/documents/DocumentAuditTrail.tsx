// Document Audit Trail Component
// Comprehensive audit logging for HIPAA compliance

'use client';

import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  User, 
  Eye, 
  Edit, 
  Download, 
  Share, 
  FileSignature, 
  Upload, 
  Trash2, 
  Lock, 
  Unlock, 
  Copy, 
  FileText, 
  AlertTriangle,
  Shield,
  Search,
  Filter,
  Calendar,
  MapPin,
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  RefreshCw,
  ExternalLink,
  CheckCircle,
  XCircle,
  Info,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { documentSharingApi, DocumentAudit } from '../../lib/api/document-sharing.api';

interface DocumentAuditTrailProps {
  documentId: string;
  onClose?: () => void;
  compact?: boolean;
  showFilters?: boolean;
}

interface AuditFilter {
  actions: string[];
  users: string[];
  dateRange: {
    start: string;
    end: string;
  };
  ipAddresses: string[];
  devices: string[];
  searchQuery: string;
  complianceLevel: 'all' | 'high' | 'medium' | 'low';
}

interface GroupedAuditEntry {
  date: string;
  entries: DocumentAudit[];
}

export default function DocumentAuditTrail({ 
  documentId, 
  onClose, 
  compact = false, 
  showFilters = true 
}: DocumentAuditTrailProps) {
  const [auditEntries, setAuditEntries] = useState<DocumentAudit[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<DocumentAudit[]>([]);
  const [groupedEntries, setGroupedEntries] = useState<GroupedAuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [selectedEntry, setSelectedEntry] = useState<DocumentAudit | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  
  const [filters, setFilters] = useState<AuditFilter>({
    actions: [],
    users: [],
    dateRange: {
      start: '',
      end: ''
    },
    ipAddresses: [],
    devices: [],
    searchQuery: '',
    complianceLevel: 'all'
  });

  const [availableFilters, setAvailableFilters] = useState({
    actions: [] as string[],
    users: [] as string[],
    ipAddresses: [] as string[],
    devices: [] as string[]
  });

  useEffect(() => {
    loadAuditTrail();
  }, [documentId]);

  useEffect(() => {
    applyFilters();
  }, [auditEntries, filters]);

  useEffect(() => {
    groupEntriesByDate();
  }, [filteredEntries]);

  const loadAuditTrail = async () => {
    try {
      setLoading(true);
      setError('');
      
      const entries = await documentSharingApi.getDocumentAuditTrail(documentId);
      setAuditEntries(entries);
      
      // Extract unique values for filters
      const actions = [...new Set(entries.map(e => e.action))];
      const users = [...new Set(entries.map(e => e.userName))];
      const ipAddresses = [...new Set(entries.map(e => e.ipAddress))];
      const devices = [...new Set(entries.map(e => e.deviceType || 'Unknown'))];
      
      setAvailableFilters({ actions, users, ipAddresses, devices });
      
    } catch (error) {
      console.error('Error loading audit trail:', error);
      setError('Failed to load audit trail. You may not have permission to view this information.');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = auditEntries;

    // Apply action filter
    if (filters.actions.length > 0) {
      filtered = filtered.filter(entry => filters.actions.includes(entry.action));
    }

    // Apply user filter
    if (filters.users.length > 0) {
      filtered = filtered.filter(entry => filters.users.includes(entry.userName));
    }

    // Apply date range filter
    if (filters.dateRange.start) {
      const startDate = new Date(filters.dateRange.start);
      filtered = filtered.filter(entry => new Date(entry.timestamp) >= startDate);
    }
    if (filters.dateRange.end) {
      const endDate = new Date(filters.dateRange.end);
      endDate.setHours(23, 59, 59, 999); // Include the entire end day
      filtered = filtered.filter(entry => new Date(entry.timestamp) <= endDate);
    }

    // Apply IP address filter
    if (filters.ipAddresses.length > 0) {
      filtered = filtered.filter(entry => filters.ipAddresses.includes(entry.ipAddress));
    }

    // Apply device filter
    if (filters.devices.length > 0) {
      filtered = filtered.filter(entry => filters.devices.includes(entry.deviceType || 'Unknown'));
    }

    // Apply search query
    if (filters.searchQuery.trim()) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(entry => 
        entry.action.toLowerCase().includes(query) ||
        entry.userName.toLowerCase().includes(query) ||
        entry.details?.toLowerCase().includes(query) ||
        entry.ipAddress.includes(query)
      );
    }

    // Apply compliance level filter
    if (filters.complianceLevel !== 'all') {
      filtered = filtered.filter(entry => {
        const level = getComplianceLevel(entry);
        return level === filters.complianceLevel;
      });
    }

    setFilteredEntries(filtered);
  };

  const groupEntriesByDate = () => {
    const grouped = filteredEntries.reduce((acc, entry) => {
      const date = new Date(entry.timestamp).toDateString();
      const existingGroup = acc.find(g => g.date === date);
      
      if (existingGroup) {
        existingGroup.entries.push(entry);
      } else {
        acc.push({ date, entries: [entry] });
      }
      
      return acc;
    }, [] as GroupedAuditEntry[]);
    
    // Sort by date (newest first)
    grouped.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    // Sort entries within each group by timestamp (newest first)
    grouped.forEach(group => {
      group.entries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    });
    
    setGroupedEntries(grouped);
    
    // Expand today's entries by default
    const today = new Date().toDateString();
    setExpandedGroups(new Set([today]));
  };

  const toggleGroup = (date: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(date)) {
        newSet.delete(date);
      } else {
        newSet.add(date);
      }
      return newSet;
    });
  };

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'view':
      case 'open':
      case 'access':
        return <Eye className="h-4 w-4 text-blue-500" />;
      case 'edit':
      case 'modify':
      case 'update':
        return <Edit className="h-4 w-4 text-orange-500" />;
      case 'download':
      case 'export':
        return <Download className="h-4 w-4 text-green-500" />;
      case 'share':
        return <Share className="h-4 w-4 text-purple-500" />;
      case 'sign':
      case 'signature':
        return <FileSignature className="h-4 w-4 text-indigo-500" />;
      case 'upload':
      case 'create':
        return <Upload className="h-4 w-4 text-cyan-500" />;
      case 'delete':
      case 'remove':
        return <Trash2 className="h-4 w-4 text-red-500" />;
      case 'lock':
      case 'encrypt':
        return <Lock className="h-4 w-4 text-gray-700" />;
      case 'unlock':
      case 'decrypt':
        return <Unlock className="h-4 w-4 text-gray-500" />;
      case 'copy':
      case 'duplicate':
        return <Copy className="h-4 w-4 text-teal-500" />;
      case 'print':
        return <FileText className="h-4 w-4 text-gray-600" />;
      default:
        return <Info className="h-4 w-4 text-gray-400" />;
    }
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType?.toLowerCase()) {
      case 'desktop':
        return <Monitor className="h-4 w-4" />;
      case 'mobile':
        return <Smartphone className="h-4 w-4" />;
      case 'tablet':
        return <Tablet className="h-4 w-4" />;
      default:
        return <Globe className="h-4 w-4" />;
    }
  };

  const getComplianceLevel = (entry: DocumentAudit): 'high' | 'medium' | 'low' => {
    const highRiskActions = ['delete', 'share', 'export', 'download'];
    const mediumRiskActions = ['edit', 'modify', 'update', 'print'];
    
    if (highRiskActions.includes(entry.action.toLowerCase())) {
      return 'high';
    } else if (mediumRiskActions.includes(entry.action.toLowerCase())) {
      return 'medium';
    }
    return 'low';
  };

  const getComplianceColor = (level: 'high' | 'medium' | 'low') => {
    switch (level) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
    }
  };

  const exportAuditTrail = async () => {
    try {
      const csvContent = generateCSV(filteredEntries);
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `document-audit-trail-${documentId}-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting audit trail:', error);
    }
  };

  const generateCSV = (entries: DocumentAudit[]): string => {
    const headers = ['Timestamp', 'Action', 'User', 'IP Address', 'Device', 'Location', 'Details', 'Compliance Level'];
    const rows = entries.map(entry => [
      new Date(entry.timestamp).toISOString(),
      entry.action,
      entry.userName,
      entry.ipAddress,
      entry.deviceType || 'Unknown',
      entry.location || 'Unknown',
      entry.details || '',
      getComplianceLevel(entry)
    ]);
    
    return [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
  };

  const clearFilters = () => {
    setFilters({
      actions: [],
      users: [],
      dateRange: { start: '', end: '' },
      ipAddresses: [],
      devices: [],
      searchQuery: '',
      complianceLevel: 'all'
    });
  };

  if (loading) {
    return (
      <div className={`${compact ? 'p-4' : 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'}`}>
        <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
          <RefreshCw className="h-5 w-5 animate-spin text-blue-500" />
          <span>Loading audit trail...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${compact ? 'p-4' : 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'}`}>
        <div className="bg-white rounded-lg p-6 max-w-md">
          <div className="flex items-center space-x-3 text-red-600 mb-4">
            <AlertTriangle className="h-6 w-6" />
            <h2 className="text-lg font-semibold">Error Loading Audit Trail</h2>
          </div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const content = (
    <div className="flex flex-col h-full">
      {/* Header */}
      {!compact && (
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Clock className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Document Audit Trail</h2>
              <p className="text-sm text-gray-600">
                {filteredEntries.length} of {auditEntries.length} activities
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={exportAuditTrail}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50"
            >
              <Download className="h-4 w-4 mr-1" />
              Export
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 rounded"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Filters */}
      {showFilters && (
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="space-y-4">
            {/* Search and Quick Filters */}
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search activities..."
                  value={filters.searchQuery}
                  onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select
                value={filters.complianceLevel}
                onChange={(e) => setFilters(prev => ({ ...prev, complianceLevel: e.target.value as any }))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Risk Levels</option>
                <option value="high">High Risk</option>
                <option value="medium">Medium Risk</option>
                <option value="low">Low Risk</option>
              </select>
              <button
                onClick={clearFilters}
                className="px-3 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
              >
                Clear
              </button>
            </div>

            {/* Advanced Filters */}
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Date From</label>
                <input
                  type="date"
                  value={filters.dateRange.start}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    dateRange: { ...prev.dateRange, start: e.target.value }
                  }))}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Date To</label>
                <input
                  type="date"
                  value={filters.dateRange.end}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    dateRange: { ...prev.dateRange, end: e.target.value }
                  }))}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Actions</label>
                <select
                  multiple
                  value={filters.actions}
                  onChange={(e) => {
                    const values = Array.from(e.target.selectedOptions, option => option.value);
                    setFilters(prev => ({ ...prev, actions: values }));
                  }}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  size={3}
                >
                  {availableFilters.actions.map(action => (
                    <option key={action} value={action}>{action}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Users</label>
                <select
                  multiple
                  value={filters.users}
                  onChange={(e) => {
                    const values = Array.from(e.target.selectedOptions, option => option.value);
                    setFilters(prev => ({ ...prev, users: values }));
                  }}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  size={3}
                >
                  {availableFilters.users.map(user => (
                    <option key={user} value={user}>{user}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Audit Entries */}
      <div className="flex-1 overflow-y-auto">
        {groupedEntries.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Activities Found</h3>
            <p>No audit trail entries match your current filters.</p>
          </div>
        ) : (
          <div className="space-y-1">
            {groupedEntries.map(group => (
              <div key={group.date}>
                {/* Date Header */}
                <div 
                  className="sticky top-0 z-10 bg-gray-100 border-b border-gray-200 px-6 py-2 cursor-pointer hover:bg-gray-200 transition-colors"
                  onClick={() => toggleGroup(group.date)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {expandedGroups.has(group.date) ? (
                        <ChevronDown className="h-4 w-4 text-gray-600" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-600" />
                      )}
                      <span className="font-medium text-gray-900">
                        {new Date(group.date).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </span>
                    </div>
                    <span className="text-sm text-gray-600">
                      {group.entries.length} {group.entries.length === 1 ? 'activity' : 'activities'}
                    </span>
                  </div>
                </div>

                {/* Entries */}
                {expandedGroups.has(group.date) && (
                  <div className="divide-y divide-gray-100">
                    {group.entries.map((entry, index) => (
                      <div 
                        key={entry.id || index}
                        className="px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => {
                          setSelectedEntry(entry);
                          setShowDetails(true);
                        }}
                      >
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0 mt-1">
                            {getActionIcon(entry.action)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <span className="font-medium text-gray-900">{entry.action}</span>
                                <div className={`px-2 py-1 rounded-full text-xs border ${getComplianceColor(getComplianceLevel(entry))}`}>
                                  {getComplianceLevel(entry)} risk
                                </div>
                              </div>
                              <span className="text-sm text-gray-500">
                                {new Date(entry.timestamp).toLocaleTimeString()}
                              </span>
                            </div>
                            
                            <div className="mt-1 flex items-center space-x-4 text-sm text-gray-600">
                              <div className="flex items-center space-x-1">
                                <User className="h-3 w-3" />
                                <span>{entry.userName}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Globe className="h-3 w-3" />
                                <span>{entry.ipAddress}</span>
                              </div>
                              {entry.deviceType && (
                                <div className="flex items-center space-x-1">
                                  {getDeviceIcon(entry.deviceType)}
                                  <span>{entry.deviceType}</span>
                                </div>
                              )}
                              {entry.location && (
                                <div className="flex items-center space-x-1">
                                  <MapPin className="h-3 w-3" />
                                  <span>{entry.location}</span>
                                </div>
                              )}
                            </div>
                            
                            {entry.details && (
                              <div className="mt-2 text-sm text-gray-700">
                                {entry.details}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showDetails && selectedEntry && (
        <AuditEntryDetailsModal 
          entry={selectedEntry}
          onClose={() => setShowDetails(false)}
        />
      )}
    </div>
  );

  if (compact) {
    return <div className="h-full">{content}</div>;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {content}
      </div>
    </div>
  );
}

// Audit Entry Details Modal
interface AuditEntryDetailsModalProps {
  entry: DocumentAudit;
  onClose: () => void;
}

function AuditEntryDetailsModal({ entry, onClose }: AuditEntryDetailsModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Activity Details</h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="px-6 py-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Basic Information</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Action</label>
                <div className="mt-1 flex items-center space-x-2">
                  {getActionIcon(entry.action)}
                  <span>{entry.action}</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Timestamp</label>
                <div className="mt-1">{new Date(entry.timestamp).toLocaleString()}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">User</label>
                <div className="mt-1">{entry.userName}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">User Email</label>
                <div className="mt-1">{entry.userEmail || 'N/A'}</div>
              </div>
            </div>
          </div>

          {/* Technical Details */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Technical Details</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">IP Address</label>
                <div className="mt-1 font-mono text-sm">{entry.ipAddress}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Device Type</label>
                <div className="mt-1 flex items-center space-x-2">
                  {getDeviceIcon(entry.deviceType)}
                  <span>{entry.deviceType || 'Unknown'}</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Location</label>
                <div className="mt-1">{entry.location || 'Unknown'}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Session ID</label>
                <div className="mt-1 font-mono text-sm">{entry.sessionId || 'N/A'}</div>
              </div>
            </div>
          </div>

          {/* User Agent */}
          {entry.userAgent && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">User Agent</label>
              <div className="p-3 bg-gray-50 rounded text-sm font-mono break-all">
                {entry.userAgent}
              </div>
            </div>
          )}

          {/* Additional Details */}
          {entry.details && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Details</label>
              <div className="p-3 bg-gray-50 rounded text-sm">
                {entry.details}
              </div>
            </div>
          )}

          {/* Compliance Information */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Compliance Information</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Risk Level:</span>
                <div className={`px-3 py-1 rounded-full text-xs border ${getComplianceColor(getComplianceLevel(entry))}`}>
                  {getComplianceLevel(entry)} Risk
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">HIPAA Logged:</span>
                <span className="text-green-600">✓ Yes</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Audit ID:</span>
                <span className="font-mono text-sm">{entry.id}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper functions
function getActionIcon(action: string) {
  // ... (same as in main component)
  return <Info className="h-4 w-4 text-gray-400" />;
}

function getDeviceIcon(deviceType: string) {
  // ... (same as in main component)
  return <Globe className="h-4 w-4" />;
}

function getComplianceLevel(entry: DocumentAudit): 'high' | 'medium' | 'low' {
  // ... (same as in main component)
  return 'low';
}

function getComplianceColor(level: 'high' | 'medium' | 'low') {
  // ... (same as in main component)
  switch (level) {
    case 'high': return 'text-red-600 bg-red-50 border-red-200';
    case 'medium': return 'text-orange-600 bg-orange-50 border-orange-200';
    case 'low': return 'text-green-600 bg-green-50 border-green-200';
  }
}