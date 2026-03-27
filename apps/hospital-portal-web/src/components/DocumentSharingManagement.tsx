'use client';

import * as React from 'react';
import { useState } from 'react';
import { 
  Search, 
  Plus, 
  Pencil, 
  Trash2, 
  Download, 
  Upload, 
  File, 
  FileText, 
  Image, 
  Video, 
  Music, 
  Archive, 
  Share2, 
  Eye, 
  Users, 
  Lock, 
  Globe, 
  Calendar, 
  HardDrive, 
  Folder, 
  X, 
  Check,
  AlertCircle,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Clock,
  User
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
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { AdvancedFilters, ActiveFilters } from '@/components/AdvancedFilters';
import { Pagination } from '@/components/Pagination';

// Types
interface Document {
  id: string;
  name: string;
  description: string;
  category: DocumentCategory;
  fileType: string;
  fileSize: number;
  filePath: string;
  uploadedBy: string;
  uploadedAt: string;
  lastModified: string;
  version: number;
  accessLevel: 'Private' | 'Shared' | 'Public';
  sharedWith: {
    users: string[];
    roles: string[];
  };
  tags: string[];
  downloadCount: number;
  status: 'Active' | 'Archived' | 'Deleted';
}

interface DocumentVersion {
  version: number;
  uploadedBy: string;
  uploadedAt: string;
  fileSize: number;
  changes: string;
}

type DocumentCategory = 'Medical Records' | 'Lab Reports' | 'Prescriptions' | 'Images' | 'Insurance' | 'Consent Forms' | 'Administrative' | 'Other';
type SortColumn = 'name' | 'category' | 'fileSize' | 'uploadedAt' | 'accessLevel';
type SortDirection = 'asc' | 'desc';

interface UploadFormData {
  name: string;
  description: string;
  category: DocumentCategory;
  accessLevel: 'Private' | 'Shared' | 'Public';
  sharedWithUsers: string[];
  sharedWithRoles: string[];
  tags: string;
  file: File | null;
}

// File type icons
const getFileIcon = (fileType: string) => {
  if (fileType.startsWith('image/')) return <Image className="h-5 w-5 text-blue-500" />;
  if (fileType.startsWith('video/')) return <Video className="h-5 w-5 text-purple-500" />;
  if (fileType.startsWith('audio/')) return <Music className="h-5 w-5 text-pink-500" />;
  if (fileType.includes('pdf')) return <FileText className="h-5 w-5 text-red-500" />;
  if (fileType.includes('zip') || fileType.includes('rar')) return <Archive className="h-5 w-5 text-orange-500" />;
  return <File className="h-5 w-5 text-gray-500" />;
};

// Format file size
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

// Mock data
const initialDocuments: Document[] = [
  {
    id: '1',
    name: 'Patient_Medical_History_Johnson_2025.pdf',
    description: 'Complete medical history for Sarah Johnson',
    category: 'Medical Records',
    fileType: 'application/pdf',
    fileSize: 2457600, // 2.4 MB
    filePath: '/documents/medical/patient_001.pdf',
    uploadedBy: 'Dr. Michael Chen',
    uploadedAt: '2025-01-20T10:30:00',
    lastModified: '2025-01-20T10:30:00',
    version: 1,
    accessLevel: 'Shared',
    sharedWith: {
      users: ['Dr. Emily Rodriguez', 'Nurse Amanda Lee'],
      roles: ['Doctor', 'Nurse']
    },
    tags: ['patient-records', 'sarah-johnson', 'medical-history'],
    downloadCount: 12,
    status: 'Active'
  },
  {
    id: '2',
    name: 'Lab_Report_Blood_Test_Chen_20250118.pdf',
    description: 'Blood test results for Michael Chen',
    category: 'Lab Reports',
    fileType: 'application/pdf',
    fileSize: 1048576, // 1 MB
    filePath: '/documents/labs/lab_002.pdf',
    uploadedBy: 'Lab Technician Maria Garcia',
    uploadedAt: '2025-01-18T14:15:00',
    lastModified: '2025-01-18T14:15:00',
    version: 1,
    accessLevel: 'Shared',
    sharedWith: {
      users: ['Dr. Michael Chen'],
      roles: ['Doctor']
    },
    tags: ['lab-results', 'blood-test', 'michael-chen'],
    downloadCount: 5,
    status: 'Active'
  },
  {
    id: '3',
    name: 'Prescription_Rodriguez_Migraine_2025.pdf',
    description: 'Migraine medication prescription for Emily Rodriguez',
    category: 'Prescriptions',
    fileType: 'application/pdf',
    fileSize: 524288, // 512 KB
    filePath: '/documents/prescriptions/rx_003.pdf',
    uploadedBy: 'Dr. David Williams',
    uploadedAt: '2025-01-15T09:45:00',
    lastModified: '2025-01-16T11:20:00',
    version: 2,
    accessLevel: 'Shared',
    sharedWith: {
      users: ['Emily Rodriguez'],
      roles: []
    },
    tags: ['prescription', 'migraine', 'sumatriptan'],
    downloadCount: 3,
    status: 'Active'
  },
  {
    id: '4',
    name: 'X-Ray_Chest_Williams_20250110.jpg',
    description: 'Chest X-ray for David Williams',
    category: 'Images',
    fileType: 'image/jpeg',
    fileSize: 3145728, // 3 MB
    filePath: '/documents/images/xray_004.jpg',
    uploadedBy: 'Radiologist Dr. Jennifer Taylor',
    uploadedAt: '2025-01-10T16:00:00',
    lastModified: '2025-01-10T16:00:00',
    version: 1,
    accessLevel: 'Shared',
    sharedWith: {
      users: ['Dr. Michael Chen', 'David Williams'],
      roles: ['Doctor', 'Radiologist']
    },
    tags: ['xray', 'chest', 'radiology'],
    downloadCount: 8,
    status: 'Active'
  },
  {
    id: '5',
    name: 'Insurance_Card_Taylor_BCBS.pdf',
    description: 'Blue Cross Blue Shield insurance card for Jennifer Taylor',
    category: 'Insurance',
    fileType: 'application/pdf',
    fileSize: 204800, // 200 KB
    filePath: '/documents/insurance/ins_005.pdf',
    uploadedBy: 'Receptionist James Anderson',
    uploadedAt: '2025-01-05T08:30:00',
    lastModified: '2025-01-05T08:30:00',
    version: 1,
    accessLevel: 'Private',
    sharedWith: {
      users: [],
      roles: []
    },
    tags: ['insurance', 'bcbs', 'jennifer-taylor'],
    downloadCount: 2,
    status: 'Active'
  },
  {
    id: '6',
    name: 'Consent_Form_Surgery_Anderson_2025.pdf',
    description: 'Surgical consent form for James Anderson',
    category: 'Consent Forms',
    fileType: 'application/pdf',
    fileSize: 819200, // 800 KB
    filePath: '/documents/consent/consent_006.pdf',
    uploadedBy: 'Dr. Robert Martinez',
    uploadedAt: '2025-01-12T13:20:00',
    lastModified: '2025-01-12T13:20:00',
    version: 1,
    accessLevel: 'Shared',
    sharedWith: {
      users: ['James Anderson', 'Dr. Robert Martinez'],
      roles: ['Doctor', 'Nurse']
    },
    tags: ['consent', 'surgery', 'legal'],
    downloadCount: 4,
    status: 'Active'
  },
  {
    id: '7',
    name: 'MRI_Scan_Brain_Garcia_20250108.dcm',
    description: 'Brain MRI scan for Maria Garcia',
    category: 'Images',
    fileType: 'application/dicom',
    fileSize: 15728640, // 15 MB
    filePath: '/documents/images/mri_007.dcm',
    uploadedBy: 'Radiologist Dr. Jennifer Taylor',
    uploadedAt: '2025-01-08T11:00:00',
    lastModified: '2025-01-08T11:00:00',
    version: 1,
    accessLevel: 'Shared',
    sharedWith: {
      users: ['Dr. Michael Chen', 'Maria Garcia'],
      roles: ['Doctor', 'Radiologist', 'Neurologist']
    },
    tags: ['mri', 'brain', 'neurology'],
    downloadCount: 15,
    status: 'Active'
  },
  {
    id: '8',
    name: 'Policy_HIPAA_Compliance_2025.pdf',
    description: 'Updated HIPAA compliance policy document',
    category: 'Administrative',
    fileType: 'application/pdf',
    fileSize: 1572864, // 1.5 MB
    filePath: '/documents/admin/policy_008.pdf',
    uploadedBy: 'Admin Christopher Davis',
    uploadedAt: '2025-01-01T09:00:00',
    lastModified: '2025-01-15T14:30:00',
    version: 3,
    accessLevel: 'Public',
    sharedWith: {
      users: [],
      roles: []
    },
    tags: ['hipaa', 'compliance', 'policy', 'administrative'],
    downloadCount: 45,
    status: 'Active'
  },
  {
    id: '9',
    name: 'Lab_Report_Urine_Test_Martinez_20241130.pdf',
    description: 'Urine test results for Robert Martinez',
    category: 'Lab Reports',
    fileType: 'application/pdf',
    fileSize: 716800, // 700 KB
    filePath: '/documents/labs/lab_009.pdf',
    uploadedBy: 'Lab Technician Maria Garcia',
    uploadedAt: '2024-11-30T10:15:00',
    lastModified: '2024-11-30T10:15:00',
    version: 1,
    accessLevel: 'Shared',
    sharedWith: {
      users: ['Dr. Michael Chen', 'Robert Martinez'],
      roles: ['Doctor']
    },
    tags: ['lab-results', 'urine-test', 'archived'],
    downloadCount: 6,
    status: 'Archived'
  },
  {
    id: '10',
    name: 'Prescription_Lee_ADHD_Medication_2024.pdf',
    description: 'ADHD medication prescription for Amanda Lee',
    category: 'Prescriptions',
    fileType: 'application/pdf',
    fileSize: 409600, // 400 KB
    filePath: '/documents/prescriptions/rx_010.pdf',
    uploadedBy: 'Dr. Thomas Brown',
    uploadedAt: '2024-12-20T15:30:00',
    lastModified: '2025-01-08T10:00:00',
    version: 2,
    accessLevel: 'Shared',
    sharedWith: {
      users: ['Amanda Lee', 'Susan Lee'],
      roles: []
    },
    tags: ['prescription', 'adhd', 'pediatric'],
    downloadCount: 7,
    status: 'Active'
  }
];

const mockUsers = ['Dr. Michael Chen', 'Dr. Emily Rodriguez', 'Nurse Amanda Lee', 'Lab Technician Maria Garcia', 'Dr. David Williams', 'Dr. Jennifer Taylor', 'James Anderson', 'Dr. Robert Martinez', 'Admin Christopher Davis'];
const mockRoles = ['Doctor', 'Nurse', 'Radiologist', 'Lab Technician', 'Administrator', 'Receptionist'];

const categoryColors = {
  'Medical Records': 'bg-blue-100 text-blue-800',
  'Lab Reports': 'bg-purple-100 text-purple-800',
  'Prescriptions': 'bg-green-100 text-green-800',
  'Images': 'bg-pink-100 text-pink-800',
  'Insurance': 'bg-yellow-100 text-yellow-800',
  'Consent Forms': 'bg-orange-100 text-orange-800',
  'Administrative': 'bg-gray-100 text-gray-800',
  'Other': 'bg-slate-100 text-slate-800'
};

const accessLevelColors = {
  'Private': 'bg-red-100 text-red-800',
  'Shared': 'bg-blue-100 text-blue-800',
  'Public': 'bg-emerald-100 text-emerald-800'
};

const accessLevelIcons = {
  'Private': Lock,
  'Shared': Share2,
  'Public': Globe
};

export function DocumentSharingManagement() {
  const [documents, setDocuments] = useState<Document[]>(initialDocuments);
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isVersionHistoryModalOpen, setIsVersionHistoryModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [dateRange, setDateRange] = useState<{ from: string; to: string }>({ from: '', to: '' });
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortColumn, setSortColumn] = useState<SortColumn>('uploadedAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [isDragging, setIsDragging] = useState(false);

  const [uploadFormData, setUploadFormData] = useState<UploadFormData>({
    name: '',
    description: '',
    category: 'Other',
    accessLevel: 'Private',
    sharedWithUsers: [],
    sharedWithRoles: [],
    tags: '',
    file: null
  });

  // Calculate statistics
  const stats = {
    total: documents.length,
    totalSize: documents.reduce((acc, doc) => acc + doc.fileSize, 0),
    shared: documents.filter(d => d.accessLevel === 'Shared').length,
    byCategory: documents.reduce((acc, doc) => {
      acc[doc.category] = (acc[doc.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    recentUploads: documents.filter(d => {
      const uploadDate = new Date(d.uploadedAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return uploadDate >= weekAgo;
    }).length
  };

  // Filter configuration
  const filterGroups = [
    {
      label: 'Category',
      key: 'category',
      options: [
        { value: 'Medical Records', label: 'Medical Records', count: stats.byCategory['Medical Records'] || 0 },
        { value: 'Lab Reports', label: 'Lab Reports', count: stats.byCategory['Lab Reports'] || 0 },
        { value: 'Prescriptions', label: 'Prescriptions', count: stats.byCategory['Prescriptions'] || 0 },
        { value: 'Images', label: 'Images', count: stats.byCategory['Images'] || 0 },
        { value: 'Insurance', label: 'Insurance', count: stats.byCategory['Insurance'] || 0 },
        { value: 'Consent Forms', label: 'Consent Forms', count: stats.byCategory['Consent Forms'] || 0 },
        { value: 'Administrative', label: 'Administrative', count: stats.byCategory['Administrative'] || 0 },
        { value: 'Other', label: 'Other', count: stats.byCategory['Other'] || 0 }
      ]
    },
    {
      label: 'Access Level',
      key: 'accessLevel',
      options: [
        { value: 'Private', label: 'Private', count: documents.filter(d => d.accessLevel === 'Private').length },
        { value: 'Shared', label: 'Shared', count: documents.filter(d => d.accessLevel === 'Shared').length },
        { value: 'Public', label: 'Public', count: documents.filter(d => d.accessLevel === 'Public').length }
      ]
    },
    {
      label: 'File Type',
      key: 'fileType',
      options: [
        { value: 'pdf', label: 'PDF', count: documents.filter(d => d.fileType.includes('pdf')).length },
        { value: 'image', label: 'Images', count: documents.filter(d => d.fileType.startsWith('image/')).length },
        { value: 'video', label: 'Videos', count: documents.filter(d => d.fileType.startsWith('video/')).length },
        { value: 'other', label: 'Other', count: documents.filter(d => !d.fileType.includes('pdf') && !d.fileType.startsWith('image/') && !d.fileType.startsWith('video/')).length }
      ]
    },
    {
      label: 'Status',
      key: 'status',
      options: [
        { value: 'Active', label: 'Active', count: documents.filter(d => d.status === 'Active').length },
        { value: 'Archived', label: 'Archived', count: documents.filter(d => d.status === 'Archived').length }
      ]
    }
  ];

  // Filtering logic
  const filteredDocuments = documents.filter(doc => {
    // Search filter
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      doc.name.toLowerCase().includes(searchLower) ||
      doc.description.toLowerCase().includes(searchLower) ||
      doc.uploadedBy.toLowerCase().includes(searchLower) ||
      doc.tags.some(tag => tag.toLowerCase().includes(searchLower));

    // Category filter
    const categoryFilter = activeFilters.category || [];
    const matchesCategory = categoryFilter.length === 0 || categoryFilter.includes(doc.category);

    // Access level filter
    const accessLevelFilter = activeFilters.accessLevel || [];
    const matchesAccessLevel = accessLevelFilter.length === 0 || accessLevelFilter.includes(doc.accessLevel);

    // File type filter
    const fileTypeFilter = activeFilters.fileType || [];
    let matchesFileType = true;
    if (fileTypeFilter.length > 0) {
      matchesFileType = fileTypeFilter.some(type => {
        if (type === 'pdf') return doc.fileType.includes('pdf');
        if (type === 'image') return doc.fileType.startsWith('image/');
        if (type === 'video') return doc.fileType.startsWith('video/');
        if (type === 'other') return !doc.fileType.includes('pdf') && !doc.fileType.startsWith('image/') && !doc.fileType.startsWith('video/');
        return false;
      });
    }

    // Status filter
    const statusFilter = activeFilters.status || [];
    const matchesStatus = statusFilter.length === 0 || statusFilter.includes(doc.status);

    // Date range filter
    let matchesDateRange = true;
    if (dateRange.from || dateRange.to) {
      const uploadDate = new Date(doc.uploadedAt);
      if (dateRange.from) matchesDateRange = matchesDateRange && uploadDate >= new Date(dateRange.from);
      if (dateRange.to) matchesDateRange = matchesDateRange && uploadDate <= new Date(dateRange.to);
    }

    return matchesSearch && matchesCategory && matchesAccessLevel && matchesFileType && matchesStatus && matchesDateRange;
  });

  // Sorting logic
  const sortedDocuments = [...filteredDocuments].sort((a, b) => {
    let comparison = 0;

    switch (sortColumn) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'category':
        comparison = a.category.localeCompare(b.category);
        break;
      case 'fileSize':
        comparison = a.fileSize - b.fileSize;
        break;
      case 'uploadedAt':
        comparison = new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime();
        break;
      case 'accessLevel':
        comparison = a.accessLevel.localeCompare(b.accessLevel);
        break;
    }

    return sortDirection === 'asc' ? comparison : -comparison;
  });

  // Pagination
  const totalPages = Math.ceil(sortedDocuments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedDocuments = sortedDocuments.slice(startIndex, startIndex + itemsPerPage);

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (column: SortColumn) => {
    if (sortColumn !== column) return <ArrowUpDown className="ml-2 h-4 w-4" />;
    return sortDirection === 'asc' ? 
      <ArrowUp className="ml-2 h-4 w-4" /> : 
      <ArrowDown className="ml-2 h-4 w-4" />;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadFormData({ ...uploadFormData, file, name: file.name });
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
    if (file) {
      setUploadFormData({ ...uploadFormData, file, name: file.name });
    }
  };

  const handleUpload = () => {
    if (!uploadFormData.file) return;

    const newDocument: Document = {
      id: (documents.length + 1).toString(),
      name: uploadFormData.name,
      description: uploadFormData.description,
      category: uploadFormData.category,
      fileType: uploadFormData.file.type,
      fileSize: uploadFormData.file.size,
      filePath: `/documents/${uploadFormData.category.toLowerCase().replace(/\s+/g, '-')}/${uploadFormData.file.name}`,
      uploadedBy: 'Current User', // Would come from auth context
      uploadedAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      version: 1,
      accessLevel: uploadFormData.accessLevel,
      sharedWith: {
        users: uploadFormData.sharedWithUsers,
        roles: uploadFormData.sharedWithRoles
      },
      tags: uploadFormData.tags ? uploadFormData.tags.split(',').map(t => t.trim()) : [],
      downloadCount: 0,
      status: 'Active'
    };

    setDocuments([newDocument, ...documents]);
    setIsUploadModalOpen(false);
    resetUploadForm();
  };

  const handleShare = () => {
    if (!selectedDocument) return;

    const updatedDocuments = documents.map(doc =>
      doc.id === selectedDocument.id
        ? {
            ...doc,
            accessLevel: uploadFormData.accessLevel,
            sharedWith: {
              users: uploadFormData.sharedWithUsers,
              roles: uploadFormData.sharedWithRoles
            }
          }
        : doc
    );

    setDocuments(updatedDocuments);
    setIsShareModalOpen(false);
    setSelectedDocument(null);
    resetUploadForm();
  };

  const handleDelete = () => {
    if (!selectedDocument) return;
    setDocuments(documents.filter(doc => doc.id !== selectedDocument.id));
    setIsDeleteModalOpen(false);
    setSelectedDocument(null);
  };

  const handleDownload = (document: Document) => {
    // Simulate download
    const updatedDocuments = documents.map(doc =>
      doc.id === document.id ? { ...doc, downloadCount: doc.downloadCount + 1 } : doc
    );
    setDocuments(updatedDocuments);
    console.log('Downloading:', document.name);
  };

  const openShareModal = (document: Document) => {
    setSelectedDocument(document);
    setUploadFormData({
      ...uploadFormData,
      accessLevel: document.accessLevel,
      sharedWithUsers: document.sharedWith.users,
      sharedWithRoles: document.sharedWith.roles
    });
    setIsShareModalOpen(true);
  };

  const resetUploadForm = () => {
    setUploadFormData({
      name: '',
      description: '',
      category: 'Other',
      accessLevel: 'Private',
      sharedWithUsers: [],
      sharedWithRoles: [],
      tags: '',
      file: null
    });
  };

  const exportToCSV = () => {
    const headers = [
      'Document Name', 'Category', 'File Type', 'File Size', 'Uploaded By', 
      'Upload Date', 'Version', 'Access Level', 'Shared With Users', 'Shared With Roles',
      'Tags', 'Download Count', 'Status'
    ];

    const rows = sortedDocuments.map(doc => [
      doc.name,
      doc.category,
      doc.fileType,
      formatFileSize(doc.fileSize),
      doc.uploadedBy,
      new Date(doc.uploadedAt).toLocaleDateString(),
      doc.version,
      doc.accessLevel,
      doc.sharedWith.users.join('; '),
      doc.sharedWith.roles.join('; '),
      doc.tags.join('; '),
      doc.downloadCount,
      doc.status
    ]);

    const csvContent = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `documents_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Mock version history
  const mockVersionHistory: DocumentVersion[] = [
    {
      version: 3,
      uploadedBy: 'Admin Christopher Davis',
      uploadedAt: '2025-01-15T14:30:00',
      fileSize: 1572864,
      changes: 'Updated compliance guidelines for 2025'
    },
    {
      version: 2,
      uploadedBy: 'Admin Christopher Davis',
      uploadedAt: '2025-01-08T10:00:00',
      fileSize: 1548288,
      changes: 'Added new security protocols'
    },
    {
      version: 1,
      uploadedBy: 'Admin Christopher Davis',
      uploadedAt: '2025-01-01T09:00:00',
      fileSize: 1524000,
      changes: 'Initial version'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Document Sharing</h1>
          <p className="text-gray-500">Securely upload, share, and manage documents</p>
        </div>
        <Button onClick={() => setIsUploadModalOpen(true)} className="bg-emerald-600 hover:bg-emerald-700">
          <Upload className="mr-2 h-4 w-4" />
          Upload Document
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
            <Folder className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-gray-500">{stats.recentUploads} uploaded this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Storage</CardTitle>
            <HardDrive className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatFileSize(stats.totalSize)}</div>
            <p className="text-xs text-gray-500">Across all documents</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shared Documents</CardTitle>
            <Share2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.shared}</div>
            <p className="text-xs text-gray-500">{((stats.shared / stats.total) * 100).toFixed(0)}% of total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Medical Records</CardTitle>
            <FileText className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.byCategory['Medical Records'] || 0}</div>
            <p className="text-xs text-gray-500">Patient records</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lab Reports</CardTitle>
            <FileText className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.byCategory['Lab Reports'] || 0}</div>
            <p className="text-xs text-gray-500">Test results</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by name, description, uploader, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <DateRangePicker
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
        />
        <AdvancedFilters
          filterGroups={filterGroups}
          activeFilters={activeFilters}
          onFiltersChange={setActiveFilters}
        />
        <Button onClick={exportToCSV} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Active Filters */}
      <ActiveFilters
        filterGroups={filterGroups}
        activeFilters={activeFilters}
        onFiltersChange={setActiveFilters}
      />

      {/* Documents Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('name')}>
                  <div className="flex items-center">
                    Document Name
                    {getSortIcon('name')}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('category')}>
                  <div className="flex items-center">
                    Category
                    {getSortIcon('category')}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('fileSize')}>
                  <div className="flex items-center">
                    Size
                    {getSortIcon('fileSize')}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('uploadedAt')}>
                  <div className="flex items-center">
                    Uploaded
                    {getSortIcon('uploadedAt')}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('accessLevel')}>
                  <div className="flex items-center">
                    Access
                    {getSortIcon('accessLevel')}
                  </div>
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedDocuments.map((document) => {
                const AccessIcon = accessLevelIcons[document.accessLevel];
                return (
                  <TableRow key={document.id}>
                    <TableCell>
                      {getFileIcon(document.fileType)}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{document.name}</div>
                        <div className="text-sm text-gray-500">{document.description}</div>
                        {document.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {document.tags.slice(0, 3).map((tag, index) => (
                              <span key={index} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${categoryColors[document.category]}`}>
                        {document.category}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{formatFileSize(document.fileSize)}</div>
                        {document.version > 1 && (
                          <div className="text-gray-500">v{document.version}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{new Date(document.uploadedAt).toLocaleDateString()}</div>
                        <div className="text-gray-500 flex items-center">
                          <User className="mr-1 h-3 w-3" />
                          {document.uploadedBy}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${accessLevelColors[document.accessLevel]}`}>
                          <AccessIcon className="mr-1 h-3 w-3" />
                          {document.accessLevel}
                        </span>
                        {document.accessLevel === 'Shared' && (
                          <span className="text-xs text-gray-500">
                            ({document.sharedWith.users.length + document.sharedWith.roles.length})
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedDocument(document);
                            setIsDetailsModalOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownload(document)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openShareModal(document)}
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedDocument(document);
                            setIsDeleteModalOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
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
        totalItems={sortedDocuments.length}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={(items) => {
          setItemsPerPage(items);
          setCurrentPage(1);
        }}
      />

      {/* Upload Modal */}
      <Dialog open={isUploadModalOpen} onOpenChange={(open) => {
        if (!open) {
          setIsUploadModalOpen(false);
          resetUploadForm();
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>
              Upload and configure document sharing settings
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* File Upload Area */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragging ? 'border-emerald-500 bg-emerald-50' : 'border-gray-300'
              }`}
            >
              {uploadFormData.file ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-center">
                    {getFileIcon(uploadFormData.file.type)}
                  </div>
                  <p className="font-medium">{uploadFormData.file.name}</p>
                  <p className="text-sm text-gray-500">{formatFileSize(uploadFormData.file.size)}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setUploadFormData({ ...uploadFormData, file: null })}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Remove
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="text-lg font-medium">Drag and drop your file here</p>
                  <p className="text-sm text-gray-500">or</p>
                  <label className="cursor-pointer">
                    <span className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 inline-block">
                      Browse Files
                    </span>
                    <input
                      type="file"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-gray-400 mt-2">Max file size: 50MB</p>
                </div>
              )}
            </div>

            {/* Document Details */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Document Name *</Label>
                <Input
                  id="name"
                  value={uploadFormData.name}
                  onChange={(e) => setUploadFormData({ ...uploadFormData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  value={uploadFormData.description}
                  onChange={(e) => setUploadFormData({ ...uploadFormData, description: e.target.value })}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="Brief description of the document..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <select
                    id="category"
                    value={uploadFormData.category}
                    onChange={(e) => setUploadFormData({ ...uploadFormData, category: e.target.value as DocumentCategory })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="Medical Records">Medical Records</option>
                    <option value="Lab Reports">Lab Reports</option>
                    <option value="Prescriptions">Prescriptions</option>
                    <option value="Images">Images</option>
                    <option value="Insurance">Insurance</option>
                    <option value="Consent Forms">Consent Forms</option>
                    <option value="Administrative">Administrative</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accessLevel">Access Level *</Label>
                  <select
                    id="accessLevel"
                    value={uploadFormData.accessLevel}
                    onChange={(e) => setUploadFormData({ ...uploadFormData, accessLevel: e.target.value as any })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="Private">Private (Only me)</option>
                    <option value="Shared">Shared (Specific users/roles)</option>
                    <option value="Public">Public (Everyone)</option>
                  </select>
                </div>
              </div>

              {uploadFormData.accessLevel === 'Shared' && (
                <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
                  <div className="space-y-2">
                    <Label>Share with Users</Label>
                    <div className="space-y-2">
                      {mockUsers.slice(0, 5).map(user => (
                        <label key={user} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={uploadFormData.sharedWithUsers.includes(user)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setUploadFormData({
                                  ...uploadFormData,
                                  sharedWithUsers: [...uploadFormData.sharedWithUsers, user]
                                });
                              } else {
                                setUploadFormData({
                                  ...uploadFormData,
                                  sharedWithUsers: uploadFormData.sharedWithUsers.filter(u => u !== user)
                                });
                              }
                            }}
                            className="rounded border-gray-300"
                          />
                          <span className="text-sm">{user}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Share with Roles</Label>
                    <div className="space-y-2">
                      {mockRoles.slice(0, 4).map(role => (
                        <label key={role} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={uploadFormData.sharedWithRoles.includes(role)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setUploadFormData({
                                  ...uploadFormData,
                                  sharedWithRoles: [...uploadFormData.sharedWithRoles, role]
                                });
                              } else {
                                setUploadFormData({
                                  ...uploadFormData,
                                  sharedWithRoles: uploadFormData.sharedWithRoles.filter(r => r !== role)
                                });
                              }
                            }}
                            className="rounded border-gray-300"
                          />
                          <span className="text-sm">{role}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  value={uploadFormData.tags}
                  onChange={(e) => setUploadFormData({ ...uploadFormData, tags: e.target.value })}
                  placeholder="Comma-separated tags (e.g., urgent, radiology, patient-123)"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsUploadModalOpen(false);
              resetUploadForm();
            }}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpload} 
              className="bg-emerald-600 hover:bg-emerald-700"
              disabled={!uploadFormData.file || !uploadFormData.name}
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload Document
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Document Details Modal */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Document Details</DialogTitle>
          </DialogHeader>

          {selectedDocument && (
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gray-100 rounded-lg">
                  {getFileIcon(selectedDocument.fileType)}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{selectedDocument.name}</h3>
                  <p className="text-sm text-gray-500">{selectedDocument.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">File Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <p className="text-xs text-gray-500">File Type</p>
                      <p className="text-sm font-medium">{selectedDocument.fileType}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">File Size</p>
                      <p className="text-sm font-medium">{formatFileSize(selectedDocument.fileSize)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Version</p>
                      <p className="text-sm font-medium">v{selectedDocument.version}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Downloads</p>
                      <p className="text-sm font-medium">{selectedDocument.downloadCount}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Upload Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <p className="text-xs text-gray-500">Uploaded By</p>
                      <p className="text-sm font-medium">{selectedDocument.uploadedBy}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Upload Date</p>
                      <p className="text-sm font-medium">{new Date(selectedDocument.uploadedAt).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Last Modified</p>
                      <p className="text-sm font-medium">{new Date(selectedDocument.lastModified).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Category</p>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${categoryColors[selectedDocument.category]}`}>
                        {selectedDocument.category}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Access Control</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Access Level</p>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center w-fit ${accessLevelColors[selectedDocument.accessLevel]}`}>
                        {React.createElement(accessLevelIcons[selectedDocument.accessLevel], { className: "mr-2 h-4 w-4" })}
                        {selectedDocument.accessLevel}
                      </span>
                    </div>
                    {selectedDocument.accessLevel === 'Shared' && (
                      <>
                        {selectedDocument.sharedWith.users.length > 0 && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Shared with Users</p>
                            <div className="flex flex-wrap gap-2">
                              {selectedDocument.sharedWith.users.map((user, index) => (
                                <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                                  {user}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {selectedDocument.sharedWith.roles.length > 0 && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Shared with Roles</p>
                            <div className="flex flex-wrap gap-2">
                              {selectedDocument.sharedWith.roles.map((role, index) => (
                                <span key={index} className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                                  {role}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              {selectedDocument.tags.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Tags</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {selectedDocument.tags.map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex gap-2">
                <Button 
                  onClick={() => handleDownload(selectedDocument)}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsDetailsModalOpen(false);
                    setIsVersionHistoryModalOpen(true);
                  }}
                >
                  <Clock className="mr-2 h-4 w-4" />
                  Version History
                </Button>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setIsDetailsModalOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Share Modal */}
      <Dialog open={isShareModalOpen} onOpenChange={(open) => {
        if (!open) {
          setIsShareModalOpen(false);
          setSelectedDocument(null);
          resetUploadForm();
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Share Document</DialogTitle>
            <DialogDescription>
              Configure who can access this document
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="shareAccessLevel">Access Level *</Label>
              <select
                id="shareAccessLevel"
                value={uploadFormData.accessLevel}
                onChange={(e) => setUploadFormData({ ...uploadFormData, accessLevel: e.target.value as any })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="Private">Private (Only me)</option>
                <option value="Shared">Shared (Specific users/roles)</option>
                <option value="Public">Public (Everyone)</option>
              </select>
            </div>

            {uploadFormData.accessLevel === 'Shared' && (
              <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
                <div className="space-y-2">
                  <Label>Share with Users</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {mockUsers.map(user => (
                      <label key={user} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={uploadFormData.sharedWithUsers.includes(user)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setUploadFormData({
                                ...uploadFormData,
                                sharedWithUsers: [...uploadFormData.sharedWithUsers, user]
                              });
                            } else {
                              setUploadFormData({
                                ...uploadFormData,
                                sharedWithUsers: uploadFormData.sharedWithUsers.filter(u => u !== user)
                              });
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm">{user}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Share with Roles</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {mockRoles.map(role => (
                      <label key={role} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={uploadFormData.sharedWithRoles.includes(role)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setUploadFormData({
                                ...uploadFormData,
                                sharedWithRoles: [...uploadFormData.sharedWithRoles, role]
                              });
                            } else {
                              setUploadFormData({
                                ...uploadFormData,
                                sharedWithRoles: uploadFormData.sharedWithRoles.filter(r => r !== role)
                              });
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm">{role}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsShareModalOpen(false);
              setSelectedDocument(null);
              resetUploadForm();
            }}>
              Cancel
            </Button>
            <Button onClick={handleShare} className="bg-emerald-600 hover:bg-emerald-700">
              <Share2 className="mr-2 h-4 w-4" />
              Update Sharing
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Version History Modal */}
      <Dialog open={isVersionHistoryModalOpen} onOpenChange={setIsVersionHistoryModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Version History</DialogTitle>
            <DialogDescription>
              Track changes and previous versions
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            {mockVersionHistory.map((version) => (
              <Card key={version.version}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">Version {version.version}</span>
                        {version.version === (selectedDocument?.version || 1) && (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-xs">
                            Current
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{version.changes}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center">
                          <User className="mr-1 h-3 w-3" />
                          {version.uploadedBy}
                        </span>
                        <span className="flex items-center">
                          <Calendar className="mr-1 h-3 w-3" />
                          {new Date(version.uploadedAt).toLocaleString()}
                        </span>
                        <span>{formatFileSize(version.fileSize)}</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <DialogFooter>
            <Button onClick={() => setIsVersionHistoryModalOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Document</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedDocument?.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedDocument && selectedDocument.downloadCount > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start">
              <AlertCircle className="h-5 w-5 text-amber-600 mr-2 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800">Warning</p>
                <p className="text-sm text-amber-700">
                  This document has been downloaded {selectedDocument.downloadCount} time(s). Deleting it may affect users who have access.
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
