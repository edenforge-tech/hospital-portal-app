'use client';

import * as React from 'react';
import { useState } from 'react';
import { 
  Activity,
  User,
  Calendar,
  Shield,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Eye,
  Trash2,
  Edit,
  Plus,
  LogIn,
  LogOut,
  Lock,
  Unlock,
  FileText,
  Download,
  Search,
  Filter,
  Clock,
  MapPin,
  Monitor,
  Info,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { Pagination } from '@/components/Pagination';

// Types
interface AuditLog {
  id: string;
  timestamp: Date;
  userId: string;
  userName: string;
  userEmail: string;
  action: AuditAction;
  entityType: EntityType;
  entityId: string;
  entityName: string;
  description: string;
  ipAddress: string;
  userAgent: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  changes?: AuditChange[];
  metadata?: Record<string, any>;
}

interface AuditChange {
  field: string;
  oldValue: string;
  newValue: string;
}

type AuditAction = 
  | 'create' 
  | 'update' 
  | 'delete' 
  | 'view' 
  | 'login' 
  | 'logout' 
  | 'login_failed' 
  | 'password_change' 
  | 'password_reset' 
  | 'permission_change' 
  | 'export'
  | 'import';

type EntityType = 
  | 'patient' 
  | 'appointment' 
  | 'user' 
  | 'department' 
  | 'organization' 
  | 'role' 
  | 'document' 
  | 'setting'
  | 'system';

const actionConfig: Record<AuditAction, { label: string; icon: any; color: string }> = {
  create: { label: 'Created', icon: Plus, color: 'text-green-600 bg-green-100' },
  update: { label: 'Updated', icon: Edit, color: 'text-blue-600 bg-blue-100' },
  delete: { label: 'Deleted', icon: Trash2, color: 'text-red-600 bg-red-100' },
  view: { label: 'Viewed', icon: Eye, color: 'text-gray-600 bg-gray-100' },
  login: { label: 'Login', icon: LogIn, color: 'text-emerald-600 bg-emerald-100' },
  logout: { label: 'Logout', icon: LogOut, color: 'text-gray-600 bg-gray-100' },
  login_failed: { label: 'Login Failed', icon: XCircle, color: 'text-red-600 bg-red-100' },
  password_change: { label: 'Password Changed', icon: Lock, color: 'text-amber-600 bg-amber-100' },
  password_reset: { label: 'Password Reset', icon: Unlock, color: 'text-amber-600 bg-amber-100' },
  permission_change: { label: 'Permissions Changed', icon: Shield, color: 'text-purple-600 bg-purple-100' },
  export: { label: 'Exported', icon: Download, color: 'text-indigo-600 bg-indigo-100' },
  import: { label: 'Imported', icon: FileText, color: 'text-indigo-600 bg-indigo-100' }
};

const severityConfig = {
  info: { label: 'Info', color: 'text-blue-600 bg-blue-100', icon: Info },
  warning: { label: 'Warning', color: 'text-amber-600 bg-amber-100', icon: AlertTriangle },
  error: { label: 'Error', color: 'text-red-600 bg-red-100', icon: XCircle },
  critical: { label: 'Critical', color: 'text-red-700 bg-red-200', icon: AlertCircle }
};

// Mock data
const mockAuditLogs: AuditLog[] = [
  {
    id: '1',
    timestamp: new Date('2026-01-25T14:30:00'),
    userId: 'usr_001',
    userName: 'Dr. Sarah Johnson',
    userEmail: 'sarah.johnson@visioncare.com',
    action: 'create',
    entityType: 'appointment',
    entityId: 'apt_123',
    entityName: 'Follow-up: John Doe',
    description: 'Created new appointment for patient John Doe',
    ipAddress: '192.168.1.45',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
    severity: 'info',
    metadata: { appointmentType: 'Follow-up', duration: '30 minutes' }
  },
  {
    id: '2',
    timestamp: new Date('2026-01-25T14:15:00'),
    userId: 'usr_002',
    userName: 'Emily Davis',
    userEmail: 'emily.davis@visioncare.com',
    action: 'update',
    entityType: 'patient',
    entityId: 'pat_456',
    entityName: 'Jane Smith',
    description: 'Updated patient medical history',
    ipAddress: '192.168.1.67',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15',
    severity: 'info',
    changes: [
      { field: 'allergies', oldValue: 'None', newValue: 'Penicillin' },
      { field: 'bloodType', oldValue: 'Unknown', newValue: 'O+' }
    ]
  },
  {
    id: '3',
    timestamp: new Date('2026-01-25T13:45:00'),
    userId: 'usr_003',
    userName: 'Michael Chen',
    userEmail: 'michael.chen@visioncare.com',
    action: 'login_failed',
    entityType: 'system',
    entityId: 'sys_001',
    entityName: 'System',
    description: 'Failed login attempt - incorrect password',
    ipAddress: '203.45.67.89',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Firefox/121.0',
    severity: 'warning',
    metadata: { attempts: 3, locked: false }
  },
  {
    id: '4',
    timestamp: new Date('2026-01-25T13:30:00'),
    userId: 'usr_001',
    userName: 'Dr. Sarah Johnson',
    userEmail: 'sarah.johnson@visioncare.com',
    action: 'export',
    entityType: 'patient',
    entityId: 'export_001',
    entityName: 'Patient Records',
    description: 'Exported 150 patient records to CSV',
    ipAddress: '192.168.1.45',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
    severity: 'info',
    metadata: { recordCount: 150, format: 'CSV' }
  },
  {
    id: '5',
    timestamp: new Date('2026-01-25T12:00:00'),
    userId: 'usr_004',
    userName: 'Admin User',
    userEmail: 'admin@visioncare.com',
    action: 'permission_change',
    entityType: 'user',
    entityId: 'usr_002',
    entityName: 'Emily Davis',
    description: 'Changed user role from Nurse to Senior Nurse',
    ipAddress: '192.168.1.10',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Edge/120.0.0.0',
    severity: 'warning',
    changes: [
      { field: 'role', oldValue: 'Nurse', newValue: 'Senior Nurse' }
    ]
  },
  {
    id: '6',
    timestamp: new Date('2026-01-25T11:30:00'),
    userId: 'usr_005',
    userName: 'Robert Wilson',
    userEmail: 'robert.wilson@visioncare.com',
    action: 'delete',
    entityType: 'document',
    entityId: 'doc_789',
    entityName: 'Outdated Policy.pdf',
    description: 'Deleted outdated policy document',
    ipAddress: '192.168.1.88',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15',
    severity: 'warning',
    metadata: { fileSize: '2.4 MB', category: 'Administrative' }
  },
  {
    id: '7',
    timestamp: new Date('2026-01-25T10:45:00'),
    userId: 'usr_006',
    userName: 'Lisa Anderson',
    userEmail: 'lisa.anderson@visioncare.com',
    action: 'login',
    entityType: 'system',
    entityId: 'sys_001',
    entityName: 'System',
    description: 'User logged in successfully',
    ipAddress: '192.168.1.92',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
    severity: 'info'
  },
  {
    id: '8',
    timestamp: new Date('2026-01-25T10:15:00'),
    userId: 'usr_001',
    userName: 'Dr. Sarah Johnson',
    userEmail: 'sarah.johnson@visioncare.com',
    action: 'view',
    entityType: 'patient',
    entityId: 'pat_789',
    entityName: 'Michael Brown',
    description: 'Viewed patient medical records',
    ipAddress: '192.168.1.45',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
    severity: 'info',
    metadata: { accessReason: 'Treatment review' }
  },
  {
    id: '9',
    timestamp: new Date('2026-01-25T09:30:00'),
    userId: 'usr_004',
    userName: 'Admin User',
    userEmail: 'admin@visioncare.com',
    action: 'update',
    entityType: 'setting',
    entityId: 'set_001',
    entityName: 'Security Settings',
    description: 'Updated password policy requirements',
    ipAddress: '192.168.1.10',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Edge/120.0.0.0',
    severity: 'warning',
    changes: [
      { field: 'passwordMinLength', oldValue: '8', newValue: '12' },
      { field: 'requireSpecialChars', oldValue: 'false', newValue: 'true' }
    ]
  },
  {
    id: '10',
    timestamp: new Date('2026-01-25T09:00:00'),
    userId: 'usr_007',
    userName: 'Tom Harris',
    userEmail: 'tom.harris@visioncare.com',
    action: 'create',
    entityType: 'patient',
    entityId: 'pat_890',
    entityName: 'Alice Williams',
    description: 'Registered new patient',
    ipAddress: '192.168.1.55',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Firefox/121.0',
    severity: 'info',
    metadata: { registrationType: 'Walk-in' }
  },
  {
    id: '11',
    timestamp: new Date('2026-01-24T16:45:00'),
    userId: 'usr_008',
    userName: 'Nancy Martinez',
    userEmail: 'nancy.martinez@visioncare.com',
    action: 'import',
    entityType: 'appointment',
    entityId: 'import_002',
    entityName: 'Appointment Bulk Import',
    description: 'Imported 320 appointments from CSV',
    ipAddress: '192.168.1.72',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15',
    severity: 'info',
    metadata: { recordCount: 320, errors: 0 }
  },
  {
    id: '12',
    timestamp: new Date('2026-01-24T15:30:00'),
    userId: 'usr_003',
    userName: 'Michael Chen',
    userEmail: 'michael.chen@visioncare.com',
    action: 'password_change',
    entityType: 'user',
    entityId: 'usr_003',
    entityName: 'Michael Chen',
    description: 'User changed their password',
    ipAddress: '192.168.1.78',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
    severity: 'info'
  },
  {
    id: '13',
    timestamp: new Date('2026-01-24T14:00:00'),
    userId: 'usr_009',
    userName: 'Kevin Lee',
    userEmail: 'kevin.lee@visioncare.com',
    action: 'update',
    entityType: 'department',
    entityId: 'dept_003',
    entityName: 'Ophthalmology',
    description: 'Updated department capacity',
    ipAddress: '192.168.1.64',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Edge/120.0.0.0',
    severity: 'info',
    changes: [
      { field: 'maxCapacity', oldValue: '50', newValue: '60' }
    ]
  },
  {
    id: '14',
    timestamp: new Date('2026-01-24T13:15:00'),
    userId: 'usr_010',
    userName: 'Sophia Garcia',
    userEmail: 'sophia.garcia@visioncare.com',
    action: 'create',
    entityType: 'organization',
    entityId: 'org_004',
    entityName: 'Downtown Eye Clinic',
    description: 'Created new organization',
    ipAddress: '192.168.1.82',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15',
    severity: 'info',
    metadata: { organizationType: 'Clinic' }
  },
  {
    id: '15',
    timestamp: new Date('2026-01-24T12:00:00'),
    userId: 'usr_004',
    userName: 'Admin User',
    userEmail: 'admin@visioncare.com',
    action: 'login_failed',
    entityType: 'system',
    entityId: 'sys_001',
    entityName: 'System',
    description: 'Account locked due to multiple failed login attempts',
    ipAddress: '203.45.67.89',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Firefox/121.0',
    severity: 'critical',
    metadata: { attempts: 5, locked: true, lockedUntil: '2026-01-24T13:00:00' }
  },
  {
    id: '16',
    timestamp: new Date('2026-01-24T11:30:00'),
    userId: 'usr_001',
    userName: 'Dr. Sarah Johnson',
    userEmail: 'sarah.johnson@visioncare.com',
    action: 'update',
    entityType: 'appointment',
    entityId: 'apt_234',
    entityName: 'Checkup: Mary Taylor',
    description: 'Rescheduled appointment',
    ipAddress: '192.168.1.45',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
    severity: 'info',
    changes: [
      { field: 'appointmentDate', oldValue: '2026-01-26', newValue: '2026-01-28' },
      { field: 'appointmentTime', oldValue: '10:00 AM', newValue: '2:00 PM' }
    ]
  },
  {
    id: '17',
    timestamp: new Date('2026-01-24T10:45:00'),
    userId: 'usr_011',
    userName: 'David Thompson',
    userEmail: 'david.thompson@visioncare.com',
    action: 'delete',
    entityType: 'user',
    entityId: 'usr_012',
    entityName: 'Former Employee',
    description: 'Deactivated user account',
    ipAddress: '192.168.1.10',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Edge/120.0.0.0',
    severity: 'warning',
    metadata: { reason: 'Employment terminated' }
  },
  {
    id: '18',
    timestamp: new Date('2026-01-24T10:00:00'),
    userId: 'usr_013',
    userName: 'Jennifer White',
    userEmail: 'jennifer.white@visioncare.com',
    action: 'view',
    entityType: 'document',
    entityId: 'doc_345',
    entityName: 'HIPAA Compliance Report.pdf',
    description: 'Accessed compliance document',
    ipAddress: '192.168.1.95',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15',
    severity: 'info',
    metadata: { fileSize: '5.2 MB', category: 'Compliance' }
  },
  {
    id: '19',
    timestamp: new Date('2026-01-24T09:30:00'),
    userId: 'usr_014',
    userName: 'Christopher Moore',
    userEmail: 'christopher.moore@visioncare.com',
    action: 'password_reset',
    entityType: 'user',
    entityId: 'usr_014',
    entityName: 'Christopher Moore',
    description: 'Password reset requested and completed',
    ipAddress: '192.168.1.101',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
    severity: 'warning',
    metadata: { resetMethod: 'Email link' }
  },
  {
    id: '20',
    timestamp: new Date('2026-01-24T09:00:00'),
    userId: 'usr_015',
    userName: 'Patricia Taylor',
    userEmail: 'patricia.taylor@visioncare.com',
    action: 'create',
    entityType: 'role',
    entityId: 'role_005',
    entityName: 'Lab Technician',
    description: 'Created new role with permissions',
    ipAddress: '192.168.1.10',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Edge/120.0.0.0',
    severity: 'warning',
    metadata: { permissionCount: 12 }
  }
];

export function AuditLogsManagement() {
  const [logs] = useState<AuditLog[]>(mockAuditLogs);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [dateRange, setDateRange] = useState<{ from: Date | null; to: Date | null }>({
    from: null,
    to: null
  });
  const [selectedAction, setSelectedAction] = useState<AuditAction | 'all'>('all');
  const [selectedEntityType, setSelectedEntityType] = useState<EntityType | 'all'>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<'info' | 'warning' | 'error' | 'critical' | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Filter logs
  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.entityName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesAction = selectedAction === 'all' || log.action === selectedAction;
    const matchesEntityType = selectedEntityType === 'all' || log.entityType === selectedEntityType;
    const matchesSeverity = selectedSeverity === 'all' || log.severity === selectedSeverity;

    const matchesDateRange = 
      (!dateRange.from || log.timestamp >= dateRange.from) &&
      (!dateRange.to || log.timestamp <= dateRange.to);

    return matchesSearch && matchesAction && matchesEntityType && matchesSeverity && matchesDateRange;
  });

  // Pagination
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Statistics
  const stats = {
    totalEvents: logs.length,
    eventsToday: logs.filter(log => {
      const today = new Date();
      return log.timestamp.toDateString() === today.toDateString();
    }).length,
    uniqueUsers: new Set(logs.map(log => log.userId)).size,
    criticalEvents: logs.filter(log => log.severity === 'critical').length,
    failedLogins: logs.filter(log => log.action === 'login_failed').length
  };

  const handleExportLogs = () => {
    const csvData = [
      ['Timestamp', 'User', 'Email', 'Action', 'Entity Type', 'Entity Name', 'Description', 'IP Address', 'Severity'],
      ...filteredLogs.map(log => [
        log.timestamp.toISOString(),
        log.userName,
        log.userEmail,
        actionConfig[log.action].label,
        log.entityType,
        log.entityName,
        log.description,
        log.ipAddress,
        log.severity
      ])
    ];

    const csv = csvData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const handleViewDetails = (log: AuditLog) => {
    setSelectedLog(log);
    setShowDetailsModal(true);
  };

  const formatTimestamp = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  };

  const getRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>
          <p className="text-gray-500">Track and monitor all system activities</p>
        </div>
        <Button onClick={handleExportLogs} className="bg-emerald-600 hover:bg-emerald-700">
          <Download className="mr-2 h-4 w-4" />
          Export Logs
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Events</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalEvents.toLocaleString()}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Events Today</p>
                <p className="text-2xl font-bold text-gray-900">{stats.eventsToday}</p>
              </div>
              <Calendar className="h-8 w-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.uniqueUsers}</p>
              </div>
              <User className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Critical Events</p>
                <p className="text-2xl font-bold text-gray-900">{stats.criticalEvents}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Failed Logins</p>
                <p className="text-2xl font-bold text-gray-900">{stats.failedLogins}</p>
              </div>
              <Shield className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Search by user, email, description, or entity..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filter Controls */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="actionFilter">Action</Label>
                <select
                  id="actionFilter"
                  value={selectedAction}
                  onChange={(e) => setSelectedAction(e.target.value as AuditAction | 'all')}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="all">All Actions</option>
                  <option value="create">Create</option>
                  <option value="update">Update</option>
                  <option value="delete">Delete</option>
                  <option value="view">View</option>
                  <option value="login">Login</option>
                  <option value="logout">Logout</option>
                  <option value="login_failed">Login Failed</option>
                  <option value="password_change">Password Change</option>
                  <option value="password_reset">Password Reset</option>
                  <option value="permission_change">Permission Change</option>
                  <option value="export">Export</option>
                  <option value="import">Import</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="entityTypeFilter">Entity Type</Label>
                <select
                  id="entityTypeFilter"
                  value={selectedEntityType}
                  onChange={(e) => setSelectedEntityType(e.target.value as EntityType | 'all')}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="all">All Entity Types</option>
                  <option value="patient">Patient</option>
                  <option value="appointment">Appointment</option>
                  <option value="user">User</option>
                  <option value="department">Department</option>
                  <option value="organization">Organization</option>
                  <option value="role">Role</option>
                  <option value="document">Document</option>
                  <option value="setting">Setting</option>
                  <option value="system">System</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="severityFilter">Severity</Label>
                <select
                  id="severityFilter"
                  value={selectedSeverity}
                  onChange={(e) => setSelectedSeverity(e.target.value as 'info' | 'warning' | 'error' | 'critical' | 'all')}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="all">All Severities</option>
                  <option value="info">Info</option>
                  <option value="warning">Warning</option>
                  <option value="error">Error</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <DateRangePicker
                dateRange={dateRange}
                onChange={setDateRange}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Log Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Timeline</CardTitle>
          <CardDescription>
            Showing {paginatedLogs.length} of {filteredLogs.length} events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {paginatedLogs.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No audit logs found</p>
              </div>
            ) : (
              paginatedLogs.map((log) => {
                const ActionIcon = actionConfig[log.action].icon;
                const SeverityIcon = severityConfig[log.severity].icon;

                return (
                  <div
                    key={log.id}
                    className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => handleViewDetails(log)}
                  >
                    {/* Icon */}
                    <div className={`p-2 rounded-lg ${actionConfig[log.action].color}`}>
                      <ActionIcon className="h-5 w-5" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-gray-900">{log.userName}</p>
                        <span className="text-gray-400">·</span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${actionConfig[log.action].color}`}>
                          {actionConfig[log.action].label}
                        </span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${severityConfig[log.severity].color}`}>
                          {severityConfig[log.severity].label}
                        </span>
                      </div>

                      <p className="text-sm text-gray-600 mb-2">{log.description}</p>

                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatTimestamp(log.timestamp)} ({getRelativeTime(log.timestamp)})
                        </span>
                        <span className="flex items-center">
                          <FileText className="h-3 w-3 mr-1" />
                          {log.entityType}: {log.entityName}
                        </span>
                        <span className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {log.ipAddress}
                        </span>
                      </div>

                      {/* Changes Preview */}
                      {log.changes && log.changes.length > 0 && (
                        <div className="mt-2 text-xs bg-gray-100 rounded p-2">
                          <span className="font-medium">Changes: </span>
                          {log.changes.slice(0, 2).map((change, idx) => (
                            <span key={idx}>
                              {change.field}: <span className="line-through text-red-600">{change.oldValue}</span>
                              {' → '}
                              <span className="text-green-600">{change.newValue}</span>
                              {idx < Math.min(log.changes!.length, 2) - 1 && ', '}
                            </span>
                          ))}
                          {log.changes.length > 2 && ` +${log.changes.length - 2} more`}
                        </div>
                      )}
                    </div>

                    {/* Severity Indicator */}
                    <div className={`p-2 rounded-lg ${severityConfig[log.severity].color}`}>
                      <SeverityIcon className="h-4 w-4" />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {filteredLogs.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          totalItems={filteredLogs.length}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
        />
      )}

      {/* Event Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Event Details</DialogTitle>
            <DialogDescription>Complete information about this audit event</DialogDescription>
          </DialogHeader>

          {selectedLog && (
            <div className="space-y-6">
              {/* Event Header */}
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg ${actionConfig[selectedLog.action].color}`}>
                  {React.createElement(actionConfig[selectedLog.action].icon, { className: 'h-6 w-6' })}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold">{actionConfig[selectedLog.action].label}</h3>
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${severityConfig[selectedLog.severity].color}`}>
                      {severityConfig[selectedLog.severity].label}
                    </span>
                  </div>
                  <p className="text-gray-600">{selectedLog.description}</p>
                </div>
              </div>

              {/* Event Information */}
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      User Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <p className="text-xs text-gray-500">Name</p>
                      <p className="font-medium">{selectedLog.userName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="font-medium">{selectedLog.userEmail}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">User ID</p>
                      <p className="font-mono text-sm">{selectedLog.userId}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center">
                      <FileText className="h-4 w-4 mr-2" />
                      Entity Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <p className="text-xs text-gray-500">Type</p>
                      <p className="font-medium capitalize">{selectedLog.entityType}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Name</p>
                      <p className="font-medium">{selectedLog.entityName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Entity ID</p>
                      <p className="font-mono text-sm">{selectedLog.entityId}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      Timestamp
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <p className="text-xs text-gray-500">Date & Time</p>
                      <p className="font-medium">{formatTimestamp(selectedLog.timestamp)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Relative Time</p>
                      <p className="font-medium">{getRelativeTime(selectedLog.timestamp)}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center">
                      <Monitor className="h-4 w-4 mr-2" />
                      Connection Info
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <p className="text-xs text-gray-500">IP Address</p>
                      <p className="font-mono text-sm">{selectedLog.ipAddress}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">User Agent</p>
                      <p className="text-sm truncate" title={selectedLog.userAgent}>
                        {selectedLog.userAgent}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Changes */}
              {selectedLog.changes && selectedLog.changes.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center">
                      <Edit className="h-4 w-4 mr-2" />
                      Changes Made
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedLog.changes.map((change, idx) => (
                        <div key={idx} className="bg-gray-50 rounded-lg p-3">
                          <p className="text-sm font-medium mb-2">{change.field}</p>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="px-2 py-1 bg-red-100 text-red-700 rounded line-through">
                              {change.oldValue}
                            </span>
                            <span className="text-gray-400">→</span>
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded">
                              {change.newValue}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Metadata */}
              {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center">
                      <Info className="h-4 w-4 mr-2" />
                      Additional Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      {Object.entries(selectedLog.metadata).map(([key, value]) => (
                        <div key={key}>
                          <p className="text-xs text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                          <p className="font-medium">{String(value)}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
