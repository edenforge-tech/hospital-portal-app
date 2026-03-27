'use client';

import * as React from 'react';
import { useState } from 'react';
import { 
  Search, 
  Upload, 
  Download, 
  FileSpreadsheet, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Play, 
  Pause, 
  RotateCcw, 
  Users, 
  Calendar, 
  Building2, 
  FileText, 
  Database, 
  TrendingUp, 
  Clock, 
  Eye,
  X,
  ChevronRight,
  ArrowRight,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Pagination } from '@/components/Pagination';

// Types
interface ImportJob {
  id: string;
  type: ImportType;
  fileName: string;
  fileSize: number;
  totalRecords: number;
  successCount: number;
  errorCount: number;
  warningCount: number;
  status: 'Pending' | 'Processing' | 'Completed' | 'Failed' | 'Paused';
  progress: number;
  startedAt: string;
  completedAt: string | null;
  startedBy: string;
  errors: ImportError[];
}

interface ImportError {
  row: number;
  field: string;
  value: string;
  error: string;
  severity: 'error' | 'warning';
}

interface ImportPreview {
  headers: string[];
  rows: string[][];
  validationResults: {
    valid: number;
    errors: number;
    warnings: number;
    issues: ImportError[];
  };
}

type ImportType = 'Patients' | 'Users' | 'Appointments' | 'Departments' | 'Organizations' | 'Documents';
type ExportType = 'Patients' | 'Users' | 'Appointments' | 'Departments' | 'Organizations' | 'Documents' | 'Audit Logs';

interface FieldMapping {
  csvField: string;
  systemField: string;
  required: boolean;
  type: 'text' | 'date' | 'number' | 'email' | 'phone';
}

// Mock data
const initialImportJobs: ImportJob[] = [
  {
    id: '1',
    type: 'Patients',
    fileName: 'patients_batch_20250120.csv',
    fileSize: 2457600, // 2.4 MB
    totalRecords: 150,
    successCount: 145,
    errorCount: 3,
    warningCount: 2,
    status: 'Completed',
    progress: 100,
    startedAt: '2025-01-20T09:30:00',
    completedAt: '2025-01-20T09:35:00',
    startedBy: 'Admin Christopher Davis',
    errors: [
      { row: 23, field: 'email', value: 'invalid-email', error: 'Invalid email format', severity: 'error' },
      { row: 45, field: 'dateOfBirth', value: '2030-01-01', error: 'Future date not allowed', severity: 'error' },
      { row: 78, field: 'phone', value: '123', error: 'Invalid phone format', severity: 'error' },
      { row: 92, field: 'bloodType', value: 'AB', error: 'Missing +/- indicator', severity: 'warning' },
      { row: 112, field: 'address', value: '', error: 'Address is empty', severity: 'warning' }
    ]
  },
  {
    id: '2',
    type: 'Users',
    fileName: 'new_staff_members_jan2025.csv',
    fileSize: 819200, // 800 KB
    totalRecords: 45,
    successCount: 45,
    errorCount: 0,
    warningCount: 0,
    status: 'Completed',
    progress: 100,
    startedAt: '2025-01-18T14:15:00',
    completedAt: '2025-01-18T14:17:00',
    startedBy: 'HR Manager Maria Garcia',
    errors: []
  },
  {
    id: '3',
    type: 'Appointments',
    fileName: 'appointments_february_2025.csv',
    fileSize: 1572864, // 1.5 MB
    totalRecords: 320,
    successCount: 256,
    errorCount: 0,
    warningCount: 0,
    status: 'Processing',
    progress: 80,
    startedAt: '2025-01-25T10:00:00',
    completedAt: null,
    startedBy: 'Receptionist James Anderson',
    errors: []
  },
  {
    id: '4',
    type: 'Departments',
    fileName: 'departments_update.csv',
    fileSize: 204800, // 200 KB
    totalRecords: 15,
    successCount: 0,
    errorCount: 0,
    warningCount: 0,
    status: 'Pending',
    progress: 0,
    startedAt: '2025-01-25T11:30:00',
    completedAt: null,
    startedBy: 'Admin Christopher Davis',
    errors: []
  },
  {
    id: '5',
    type: 'Patients',
    fileName: 'patient_migration_old_system.csv',
    fileSize: 5242880, // 5 MB
    totalRecords: 500,
    successCount: 150,
    errorCount: 25,
    warningCount: 10,
    status: 'Paused',
    progress: 35,
    startedAt: '2025-01-24T16:00:00',
    completedAt: null,
    startedBy: 'Data Migration Team',
    errors: [
      { row: 12, field: 'medicalRecordNumber', value: 'MRN-001', error: 'Duplicate record number', severity: 'error' },
      { row: 34, field: 'insurance', value: '', error: 'Missing insurance information', severity: 'warning' },
      { row: 56, field: 'email', value: 'patient@domain', error: 'Invalid email domain', severity: 'error' }
    ]
  },
  {
    id: '6',
    type: 'Organizations',
    fileName: 'partner_organizations.csv',
    fileSize: 524288, // 512 KB
    totalRecords: 25,
    successCount: 0,
    errorCount: 15,
    warningCount: 5,
    status: 'Failed',
    progress: 30,
    startedAt: '2025-01-22T13:45:00',
    completedAt: '2025-01-22T13:50:00',
    startedBy: 'Admin Christopher Davis',
    errors: [
      { row: 5, field: 'licenseNumber', value: '', error: 'License number is required', severity: 'error' },
      { row: 8, field: 'licenseExpiry', value: '2024-12-31', error: 'License expired', severity: 'error' },
      { row: 12, field: 'contactEmail', value: 'invalid', error: 'Invalid email format', severity: 'error' }
    ]
  }
];

const importTypeIcons = {
  'Patients': Users,
  'Users': Users,
  'Appointments': Calendar,
  'Departments': Building2,
  'Organizations': Building2,
  'Documents': FileText
};

const statusColors = {
  'Pending': 'bg-gray-100 text-gray-800',
  'Processing': 'bg-blue-100 text-blue-800',
  'Completed': 'bg-emerald-100 text-emerald-800',
  'Failed': 'bg-red-100 text-red-800',
  'Paused': 'bg-amber-100 text-amber-800'
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

const formatDuration = (start: string, end: string | null): string => {
  const startDate = new Date(start);
  const endDate = end ? new Date(end) : new Date();
  const seconds = Math.floor((endDate.getTime() - startDate.getTime()) / 1000);
  
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ${seconds % 60}s`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m`;
};

// Sample field mappings for different import types
const fieldMappings: Record<ImportType, FieldMapping[]> = {
  'Patients': [
    { csvField: 'First Name', systemField: 'firstName', required: true, type: 'text' },
    { csvField: 'Last Name', systemField: 'lastName', required: true, type: 'text' },
    { csvField: 'Date of Birth', systemField: 'dateOfBirth', required: true, type: 'date' },
    { csvField: 'Email', systemField: 'email', required: true, type: 'email' },
    { csvField: 'Phone', systemField: 'phone', required: true, type: 'phone' },
    { csvField: 'Blood Type', systemField: 'bloodType', required: false, type: 'text' },
    { csvField: 'Gender', systemField: 'gender', required: true, type: 'text' }
  ],
  'Users': [
    { csvField: 'Username', systemField: 'username', required: true, type: 'text' },
    { csvField: 'Email', systemField: 'email', required: true, type: 'email' },
    { csvField: 'First Name', systemField: 'firstName', required: true, type: 'text' },
    { csvField: 'Last Name', systemField: 'lastName', required: true, type: 'text' },
    { csvField: 'Role', systemField: 'role', required: true, type: 'text' }
  ],
  'Appointments': [
    { csvField: 'Patient ID', systemField: 'patientId', required: true, type: 'text' },
    { csvField: 'Doctor ID', systemField: 'doctorId', required: true, type: 'text' },
    { csvField: 'Date', systemField: 'date', required: true, type: 'date' },
    { csvField: 'Time', systemField: 'time', required: true, type: 'text' },
    { csvField: 'Type', systemField: 'type', required: true, type: 'text' }
  ],
  'Departments': [
    { csvField: 'Name', systemField: 'name', required: true, type: 'text' },
    { csvField: 'Branch', systemField: 'branch', required: true, type: 'text' },
    { csvField: 'Head', systemField: 'head', required: false, type: 'text' }
  ],
  'Organizations': [
    { csvField: 'Name', systemField: 'name', required: true, type: 'text' },
    { csvField: 'Type', systemField: 'type', required: true, type: 'text' },
    { csvField: 'License Number', systemField: 'licenseNumber', required: true, type: 'text' }
  ],
  'Documents': [
    { csvField: 'Document Name', systemField: 'name', required: true, type: 'text' },
    { csvField: 'Category', systemField: 'category', required: true, type: 'text' }
  ]
};

export function BulkOperationsManagement() {
  const [importJobs, setImportJobs] = useState<ImportJob[]>(initialImportJobs);
  const [searchQuery, setSearchQuery] = useState('');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isMappingModalOpen, setIsMappingModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<ImportJob | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedImportType, setSelectedImportType] = useState<ImportType>('Patients');
  const [selectedExportType, setSelectedExportType] = useState<ExportType>('Patients');
  const [isDragging, setIsDragging] = useState(false);
  const [importPreview, setImportPreview] = useState<ImportPreview | null>(null);

  // Calculate statistics
  const stats = {
    total: importJobs.length,
    completed: importJobs.filter(j => j.status === 'Completed').length,
    processing: importJobs.filter(j => j.status === 'Processing').length,
    failed: importJobs.filter(j => j.status === 'Failed').length,
    totalRecordsImported: importJobs.reduce((acc, job) => acc + job.successCount, 0),
    totalErrors: importJobs.reduce((acc, job) => acc + job.errorCount, 0)
  };

  // Filtering
  const filteredJobs = importJobs.filter(job => {
    const searchLower = searchQuery.toLowerCase();
    return (
      job.fileName.toLowerCase().includes(searchLower) ||
      job.type.toLowerCase().includes(searchLower) ||
      job.startedBy.toLowerCase().includes(searchLower)
    );
  });

  // Pagination
  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedJobs = filteredJobs.slice(startIndex, startIndex + itemsPerPage);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'text/csv') {
      setSelectedFile(file);
      parseCSVPreview(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'text/csv') {
      setSelectedFile(file);
      parseCSVPreview(file);
    }
  };

  const parseCSVPreview = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim());
      const rows = lines.slice(1, 11).map(line => line.split(',').map(cell => cell.trim())); // First 10 rows

      // Mock validation
      const validationResults = {
        valid: Math.floor(lines.length * 0.9),
        errors: Math.floor(lines.length * 0.05),
        warnings: Math.floor(lines.length * 0.05),
        issues: [
          { row: 3, field: headers[1], value: rows[2]?.[1] || '', error: 'Invalid format', severity: 'error' as const },
          { row: 7, field: headers[0], value: rows[6]?.[0] || '', error: 'Missing required field', severity: 'warning' as const }
        ]
      };

      setImportPreview({ headers, rows, validationResults });
    };
    reader.readAsText(file);
  };

  const handleStartImport = () => {
    if (!selectedFile) return;

    const newJob: ImportJob = {
      id: (importJobs.length + 1).toString(),
      type: selectedImportType,
      fileName: selectedFile.name,
      fileSize: selectedFile.size,
      totalRecords: importPreview?.rows.length || 0,
      successCount: 0,
      errorCount: 0,
      warningCount: 0,
      status: 'Processing',
      progress: 0,
      startedAt: new Date().toISOString(),
      completedAt: null,
      startedBy: 'Current User',
      errors: []
    };

    setImportJobs([newJob, ...importJobs]);
    setIsImportModalOpen(false);
    setIsPreviewModalOpen(false);
    setSelectedFile(null);
    setImportPreview(null);

    // Simulate progress
    simulateImportProgress(newJob.id);
  };

  const simulateImportProgress = (jobId: string) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setImportJobs(jobs => jobs.map(job => 
        job.id === jobId 
          ? { 
              ...job, 
              progress, 
              successCount: Math.floor((job.totalRecords * progress) / 100),
              status: progress >= 100 ? 'Completed' : 'Processing',
              completedAt: progress >= 100 ? new Date().toISOString() : null
            }
          : job
      ));
      if (progress >= 100) clearInterval(interval);
    }, 500);
  };

  const handlePauseJob = (jobId: string) => {
    setImportJobs(jobs => jobs.map(job =>
      job.id === jobId && job.status === 'Processing'
        ? { ...job, status: 'Paused' }
        : job
    ));
  };

  const handleResumeJob = (jobId: string) => {
    setImportJobs(jobs => jobs.map(job =>
      job.id === jobId && job.status === 'Paused'
        ? { ...job, status: 'Processing' }
        : job
    ));
    simulateImportProgress(jobId);
  };

  const handleRetryJob = (jobId: string) => {
    setImportJobs(jobs => jobs.map(job =>
      job.id === jobId && job.status === 'Failed'
        ? { ...job, status: 'Processing', progress: 0, errorCount: 0, errors: [] }
        : job
    ));
    simulateImportProgress(jobId);
  };

  const downloadTemplate = (type: ImportType) => {
    const mappings = fieldMappings[type];
    const headers = mappings.map(m => m.csvField);
    const sampleRow = mappings.map(m => {
      switch (m.type) {
        case 'email': return 'example@email.com';
        case 'phone': return '555-0123';
        case 'date': return '2025-01-01';
        case 'number': return '123';
        default: return 'Sample Data';
      }
    });

    const csvContent = [headers, sampleRow].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type.toLowerCase()}_import_template.csv`;
    a.click();
  };

  const handleExport = () => {
    // Mock export data
    const headers = ['ID', 'Name', 'Email', 'Status', 'Created At'];
    const rows = [
      ['1', 'Sample 1', 'sample1@example.com', 'Active', '2025-01-01'],
      ['2', 'Sample 2', 'sample2@example.com', 'Active', '2025-01-02'],
      ['3', 'Sample 3', 'sample3@example.com', 'Inactive', '2025-01-03']
    ];

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedExportType.toLowerCase()}_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    setIsExportModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bulk Operations</h1>
          <p className="text-gray-500">Import and export data in bulk via CSV files</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsExportModalOpen(true)} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
          <Button onClick={() => setIsImportModalOpen(true)} className="bg-emerald-600 hover:bg-emerald-700">
            <Upload className="mr-2 h-4 w-4" />
            Import Data
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
            <Database className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-gray-500">Import operations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
            <p className="text-xs text-gray-500">{((stats.completed / stats.total) * 100).toFixed(0)}% success rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.processing}</div>
            <p className="text-xs text-gray-500">Currently running</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.failed}</div>
            <p className="text-xs text-gray-500">Need attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Records Imported</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRecordsImported.toLocaleString()}</div>
            <p className="text-xs text-gray-500">Successfully processed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Errors</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalErrors}</div>
            <p className="text-xs text-gray-500">Validation failures</p>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <div className="flex gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by filename, type, or user..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Import Jobs Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>File Name</TableHead>
                <TableHead>Records</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Started</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedJobs.map((job) => {
                const Icon = importTypeIcons[job.type];
                return (
                  <TableRow key={job.id}>
                    <TableCell>
                      <div className="flex items-center">
                        <Icon className="mr-2 h-4 w-4 text-gray-500" />
                        <span className="font-medium">{job.type}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{job.fileName}</div>
                        <div className="text-sm text-gray-500">{formatFileSize(job.fileSize)}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                          <span>{job.successCount} success</span>
                        </div>
                        {job.errorCount > 0 && (
                          <div className="flex items-center gap-1 text-red-600">
                            <XCircle className="h-3 w-3" />
                            <span>{job.errorCount} errors</span>
                          </div>
                        )}
                        {job.warningCount > 0 && (
                          <div className="flex items-center gap-1 text-amber-600">
                            <AlertTriangle className="h-3 w-3" />
                            <span>{job.warningCount} warnings</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="w-full">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span>{job.progress}%</span>
                          <span className="text-gray-500">{job.successCount}/{job.totalRecords}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all ${
                              job.status === 'Failed' ? 'bg-red-500' :
                              job.status === 'Completed' ? 'bg-emerald-500' :
                              job.status === 'Paused' ? 'bg-amber-500' :
                              'bg-blue-500'
                            }`}
                            style={{ width: `${job.progress}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[job.status]}`}>
                        {job.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{new Date(job.startedAt).toLocaleDateString()}</div>
                        <div className="text-gray-500">{new Date(job.startedAt).toLocaleTimeString()}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{formatDuration(job.startedAt, job.completedAt)}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {job.status === 'Processing' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handlePauseJob(job.id)}
                          >
                            <Pause className="h-4 w-4" />
                          </Button>
                        )}
                        {job.status === 'Paused' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleResumeJob(job.id)}
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                        )}
                        {job.status === 'Failed' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRetryJob(job.id)}
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedJob(job);
                            setIsDetailsModalOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        totalItems={filteredJobs.length}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={(items) => {
          setItemsPerPage(items);
          setCurrentPage(1);
        }}
      />

      {/* Import Modal */}
      <Dialog open={isImportModalOpen} onOpenChange={(open) => {
        if (!open) {
          setIsImportModalOpen(false);
          setSelectedFile(null);
          setImportPreview(null);
        }
      }}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Import Data</DialogTitle>
            <DialogDescription>
              Upload a CSV file to import data in bulk
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Import Type Selection */}
            <div className="space-y-2">
              <Label htmlFor="importType">Data Type *</Label>
              <select
                id="importType"
                value={selectedImportType}
                onChange={(e) => setSelectedImportType(e.target.value as ImportType)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="Patients">Patients</option>
                <option value="Users">Users</option>
                <option value="Appointments">Appointments</option>
                <option value="Departments">Departments</option>
                <option value="Organizations">Organizations</option>
                <option value="Documents">Documents</option>
              </select>
            </div>

            {/* Template Download */}
            <div className="p-4 bg-blue-50 rounded-lg flex items-start justify-between">
              <div className="flex items-start">
                <FileSpreadsheet className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-900">Need a template?</p>
                  <p className="text-sm text-blue-700">Download the CSV template with correct headers and sample data</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadTemplate(selectedImportType)}
              >
                <Download className="mr-2 h-4 w-4" />
                Download Template
              </Button>
            </div>

            {/* File Upload Area */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragging ? 'border-emerald-500 bg-emerald-50' : 'border-gray-300'
              }`}
            >
              {selectedFile ? (
                <div className="space-y-2">
                  <FileSpreadsheet className="mx-auto h-12 w-12 text-emerald-600" />
                  <p className="font-medium">{selectedFile.name}</p>
                  <p className="text-sm text-gray-500">{formatFileSize(selectedFile.size)}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedFile(null);
                      setImportPreview(null);
                    }}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Remove
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="text-lg font-medium">Drag and drop your CSV file here</p>
                  <p className="text-sm text-gray-500">or</p>
                  <label className="cursor-pointer">
                    <span className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 inline-block">
                      Browse Files
                    </span>
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-gray-400 mt-2">Only CSV files are supported</p>
                </div>
              )}
            </div>

            {/* Preview Section */}
            {importPreview && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Preview</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsMappingModalOpen(true)}
                  >
                    Configure Field Mapping
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>

                {/* Validation Summary */}
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4 flex items-center">
                      <CheckCircle2 className="h-8 w-8 text-emerald-500 mr-3" />
                      <div>
                        <p className="text-2xl font-bold">{importPreview.validationResults.valid}</p>
                        <p className="text-sm text-gray-500">Valid records</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 flex items-center">
                      <XCircle className="h-8 w-8 text-red-500 mr-3" />
                      <div>
                        <p className="text-2xl font-bold">{importPreview.validationResults.errors}</p>
                        <p className="text-sm text-gray-500">Errors</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 flex items-center">
                      <AlertTriangle className="h-8 w-8 text-amber-500 mr-3" />
                      <div>
                        <p className="text-2xl font-bold">{importPreview.validationResults.warnings}</p>
                        <p className="text-sm text-gray-500">Warnings</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Data Preview Table */}
                <div className="border rounded-lg overflow-hidden">
                  <div className="overflow-x-auto max-h-64">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          {importPreview.headers.map((header, index) => (
                            <th key={index} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {importPreview.rows.map((row, rowIndex) => (
                          <tr key={rowIndex}>
                            {row.map((cell, cellIndex) => (
                              <td key={cellIndex} className="px-4 py-2 text-sm text-gray-900 whitespace-nowrap">
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsImportModalOpen(false);
              setSelectedFile(null);
              setImportPreview(null);
            }}>
              Cancel
            </Button>
            {selectedFile && (
              <Button 
                onClick={handleStartImport}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <Upload className="mr-2 h-4 w-4" />
                Start Import
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Modal */}
      <Dialog open={isExportModalOpen} onOpenChange={setIsExportModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export Data</DialogTitle>
            <DialogDescription>
              Export data to CSV format for external use
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="exportType">Data Type *</Label>
              <select
                id="exportType"
                value={selectedExportType}
                onChange={(e) => setSelectedExportType(e.target.value as ExportType)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="Patients">Patients</option>
                <option value="Users">Users</option>
                <option value="Appointments">Appointments</option>
                <option value="Departments">Departments</option>
                <option value="Organizations">Organizations</option>
                <option value="Documents">Documents</option>
                <option value="Audit Logs">Audit Logs</option>
              </select>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">Export Options</h4>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input type="checkbox" defaultChecked className="rounded border-gray-300 mr-2" />
                  <span className="text-sm">Include all fields</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" defaultChecked className="rounded border-gray-300 mr-2" />
                  <span className="text-sm">Include headers</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 mr-2" />
                  <span className="text-sm">Export only active records</span>
                </label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsExportModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleExport} className="bg-emerald-600 hover:bg-emerald-700">
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Job Details Modal */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Import Job Details</DialogTitle>
          </DialogHeader>

          {selectedJob && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Job Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <p className="text-xs text-gray-500">Type</p>
                      <p className="text-sm font-medium">{selectedJob.type}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">File Name</p>
                      <p className="text-sm font-medium">{selectedJob.fileName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">File Size</p>
                      <p className="text-sm font-medium">{formatFileSize(selectedJob.fileSize)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Started By</p>
                      <p className="text-sm font-medium">{selectedJob.startedBy}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Processing Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <p className="text-xs text-gray-500">Total Records</p>
                      <p className="text-sm font-medium">{selectedJob.totalRecords}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Success</p>
                      <p className="text-sm font-medium text-emerald-600">{selectedJob.successCount}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Errors</p>
                      <p className="text-sm font-medium text-red-600">{selectedJob.errorCount}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Warnings</p>
                      <p className="text-sm font-medium text-amber-600">{selectedJob.warningCount}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {selectedJob.errors.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Errors & Warnings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {selectedJob.errors.map((error, index) => (
                        <div 
                          key={index}
                          className={`p-3 rounded-lg border ${
                            error.severity === 'error' 
                              ? 'bg-red-50 border-red-200' 
                              : 'bg-amber-50 border-amber-200'
                          }`}
                        >
                          <div className="flex items-start">
                            {error.severity === 'error' ? (
                              <XCircle className="h-5 w-5 text-red-600 mr-2 mt-0.5" />
                            ) : (
                              <AlertTriangle className="h-5 w-5 text-amber-600 mr-2 mt-0.5" />
                            )}
                            <div className="flex-1">
                              <p className={`font-medium text-sm ${
                                error.severity === 'error' ? 'text-red-800' : 'text-amber-800'
                              }`}>
                                Row {error.row}: {error.error}
                              </p>
                              <p className="text-xs text-gray-600 mt-1">
                                Field: <span className="font-medium">{error.field}</span> | 
                                Value: <span className="font-medium">{error.value || '(empty)'}</span>
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setIsDetailsModalOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Field Mapping Modal */}
      <Dialog open={isMappingModalOpen} onOpenChange={setIsMappingModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Configure Field Mapping</DialogTitle>
            <DialogDescription>
              Map CSV columns to system fields for {selectedImportType}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>CSV Column</TableHead>
                    <TableHead>
                      <ArrowRight className="h-4 w-4" />
                    </TableHead>
                    <TableHead>System Field</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Required</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fieldMappings[selectedImportType].map((mapping, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{mapping.csvField}</TableCell>
                      <TableCell>
                        <ArrowRight className="h-4 w-4 text-gray-400" />
                      </TableCell>
                      <TableCell>{mapping.systemField}</TableCell>
                      <TableCell>
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                          {mapping.type}
                        </span>
                      </TableCell>
                      <TableCell>
                        {mapping.required ? (
                          <Check className="h-4 w-4 text-emerald-600" />
                        ) : (
                          <X className="h-4 w-4 text-gray-300" />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMappingModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsMappingModalOpen(false)} className="bg-emerald-600 hover:bg-emerald-700">
              Save Mapping
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
