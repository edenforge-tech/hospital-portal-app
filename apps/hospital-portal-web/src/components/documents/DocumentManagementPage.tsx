// Advanced Document Management Page
// Comprehensive secure document sharing with HIPAA compliance

'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Upload, 
  Search, 
  Filter, 
  Grid, 
  List, 
  FolderPlus, 
  Share, 
  Download, 
  Eye, 
  Edit, 
  Trash2, 
  Clock, 
  Shield, 
  FileSignature, 
  Tags, 
  Star, 
  MoreVertical,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  Lock,
  Users,
  Calendar,
  FileImage,
  FileArchive,
  FileMinus,
  Activity,
  BarChart3,
  Settings,
  RefreshCw,
  Plus,
  X,
  ArrowUp,
  ArrowDown,
  ExternalLink
} from 'lucide-react';
import { 
  documentSharingApi, 
  Document, 
  DocumentCategory, 
  DocumentFolder,
  SearchDocumentsRequest,
  SearchDocumentsResponse,
  DocumentAnalytics
} from '../../lib/api/document-sharing.api';

export default function DocumentManagementPage() {
  const [activeView, setActiveView] = useState<'grid' | 'list'>('grid');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [categories, setCategories] = useState<DocumentCategory[]>([]);
  const [folders, setFolders] = useState<DocumentFolder[]>([]);
  const [analytics, setAnalytics] = useState<DocumentAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedFolder, setSelectedFolder] = useState<string>('');
  const [selectedDocuments, setSelectedDocuments] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortField, setSortField] = useState<'createdAt' | 'fileName' | 'fileSize'>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const [filters, setFilters] = useState({
    accessLevel: [] as string[],
    status: [] as string[],
    hasSignature: null as boolean | null,
    dateRange: null as { startDate: string; endDate: string; field: string } | null,
    fileTypes: [] as string[],
    tags: [] as string[]
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    searchDocuments();
  }, [searchQuery, selectedCategory, selectedFolder, currentPage, sortField, sortDirection, filters]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [categoriesResponse, foldersResponse, analyticsResponse] = await Promise.all([
        documentSharingApi.getCategories(),
        documentSharingApi.getFolders(),
        documentSharingApi.getDocumentAnalytics('month')
      ]);
      
      setCategories(categoriesResponse);
      setFolders(foldersResponse);
      setAnalytics(analyticsResponse);
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchDocuments = async () => {
    try {
      const searchRequest: SearchDocumentsRequest = {
        query: searchQuery || undefined,
        filters: {
          categoryId: selectedCategory || undefined,
          folderId: selectedFolder || undefined,
          accessLevel: filters.accessLevel.length > 0 ? filters.accessLevel : undefined,
          status: filters.status.length > 0 ? filters.status : undefined,
          hasSignature: filters.hasSignature || undefined,
          dateRange: filters.dateRange || undefined,
          fileTypes: filters.fileTypes.length > 0 ? filters.fileTypes : undefined,
          tags: filters.tags.length > 0 ? filters.tags : undefined
        },
        sort: {
          field: sortField,
          direction: sortDirection
        },
        pagination: {
          page: currentPage,
          size: 20
        }
      };

      const response: SearchDocumentsResponse = await documentSharingApi.getDocuments(searchRequest);
      setDocuments(response.documents);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Error searching documents:', error);
    }
  };

  const handleFileUpload = async (files: File[]) => {
    if (files.length === 0) return;
    
    setUploading(true);
    try {
      if (files.length === 1) {
        // Single file upload
        const file = files[0];
        await documentSharingApi.uploadDocument({
          file,
          title: file.name.replace(/\.[^/.]+$/, ''),
          categoryId: selectedCategory || categories[0]?.id || 'general',
          accessLevel: 'Internal',
          folderId: selectedFolder || undefined
        });
      } else {
        // Bulk upload
        await documentSharingApi.bulkUpload({
          files,
          defaultCategoryId: selectedCategory || categories[0]?.id || 'general',
          defaultFolderId: selectedFolder || undefined,
          defaultAccessLevel: 'Internal',
          applyToAll: {}
        });
      }
      
      await searchDocuments();
      setShowUploadModal(false);
    } catch (error) {
      console.error('Error uploading files:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const toggleDocumentSelection = (documentId: string) => {
    const newSelection = new Set(selectedDocuments);
    if (newSelection.has(documentId)) {
      newSelection.delete(documentId);
    } else {
      newSelection.add(documentId);
    }
    setSelectedDocuments(newSelection);
  };

  const selectAllDocuments = () => {
    if (selectedDocuments.size === documents.length) {
      setSelectedDocuments(new Set());
    } else {
      setSelectedDocuments(new Set(documents.map(d => d.id)));
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return FileImage;
    if (mimeType.includes('pdf')) return FileText;
    if (mimeType.includes('zip') || mimeType.includes('archive')) return FileArchive;
    return FileMinus;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Published': return 'text-green-600 bg-green-50 border-green-200';
      case 'Draft': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'Review': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'Approved': return 'text-green-600 bg-green-50 border-green-200';
      case 'Archived': return 'text-gray-600 bg-gray-50 border-gray-200';
      case 'Expired': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getAccessLevelIcon = (level: string) => {
    switch (level) {
      case 'Public': return <Eye className="h-4 w-4 text-green-500" />;
      case 'Internal': return <Users className="h-4 w-4 text-blue-500" />;
      case 'Confidential': return <Lock className="h-4 w-4 text-orange-500" />;
      case 'Restricted': return <Shield className="h-4 w-4 text-red-500" />;
      default: return <Eye className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSort = (field: 'createdAt' | 'fileName' | 'fileSize') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-6 w-6 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600">Loading documents...</span>
      </div>
    );
  }

  return (
    <div 
      className={`space-y-6 ${dragActive ? 'bg-blue-50' : ''}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <FileText className="h-6 w-6 mr-2 text-blue-500" />
              Document Management
            </h1>
            <p className="text-gray-600 mt-1">
              Secure document sharing with HIPAA compliance
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Documents
            </button>
            
            <button className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
              <FolderPlus className="h-4 w-4 mr-2" />
              New Folder
            </button>
            
            <button className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-blue-600" />
                <div className="ml-3">
                  <p className="text-2xl font-bold text-gray-900">{analytics.usage.totalDocuments}</p>
                  <p className="text-sm text-gray-600">Total Documents</p>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center">
                <Share className="h-8 w-8 text-green-600" />
                <div className="ml-3">
                  <p className="text-2xl font-bold text-gray-900">{analytics.usage.sharesThisMonth}</p>
                  <p className="text-sm text-gray-600">Shares This Month</p>
                </div>
              </div>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center">
                <FileSignature className="h-8 w-8 text-purple-600" />
                <div className="ml-3">
                  <p className="text-2xl font-bold text-gray-900">{analytics.usage.signaturesThisMonth}</p>
                  <p className="text-sm text-gray-600">Signatures This Month</p>
                </div>
              </div>
            </div>
            
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="flex items-center">
                <Activity className="h-8 w-8 text-orange-600" />
                <div className="ml-3">
                  <p className="text-2xl font-bold text-gray-900">{formatFileSize(analytics.usage.totalSize)}</p>
                  <p className="text-sm text-gray-600">Storage Used</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            
            <select
              value={selectedFolder}
              onChange={(e) => setSelectedFolder(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Folders</option>
              {folders.map((folder) => (
                <option key={folder.id} value={folder.id}>
                  {folder.name}
                </option>
              ))}
            </select>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center px-3 py-2 border rounded-md ${
                showFilters ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </button>
            
            <div className="flex border border-gray-300 rounded-md">
              <button
                onClick={() => setActiveView('grid')}
                className={`p-2 ${activeView === 'grid' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:text-gray-800'}`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setActiveView('list')}
                className={`p-2 ${activeView === 'list' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:text-gray-800'}`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Advanced Filters Panel */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <AdvancedFilters filters={filters} setFilters={setFilters} categories={categories} />
          </div>
        )}
      </div>

      {/* Documents List/Grid */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {selectedDocuments.size > 0 && (
          <div className="p-4 bg-blue-50 border-b border-blue-200">
            <BulkActions selectedDocuments={selectedDocuments} onAction={() => {
              setSelectedDocuments(new Set());
              searchDocuments();
            }} />
          </div>
        )}

        {activeView === 'list' ? (
          <DocumentListView
            documents={documents}
            selectedDocuments={selectedDocuments}
            onToggleSelection={toggleDocumentSelection}
            onSelectAll={selectAllDocuments}
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={handleSort}
          />
        ) : (
          <DocumentGridView
            documents={documents}
            selectedDocuments={selectedDocuments}
            onToggleSelection={toggleDocumentSelection}
          />
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-200">
            <DocumentPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <UploadModal
          onClose={() => setShowUploadModal(false)}
          onUpload={handleFileUpload}
          uploading={uploading}
          categories={categories}
          folders={folders}
        />
      )}

      {/* Drag and Drop Overlay */}
      {dragActive && (
        <div className="fixed inset-0 bg-blue-500 bg-opacity-20 border-4 border-dashed border-blue-500 rounded-lg z-50 flex items-center justify-center">
          <div className="text-center">
            <Upload className="h-16 w-16 text-blue-500 mx-auto mb-4" />
            <p className="text-2xl font-semibold text-blue-700">Drop files here to upload</p>
            <p className="text-blue-600">Release to upload documents</p>
          </div>
        </div>
      )}
    </div>
  );
}

// Component placeholders - these will be separate files
function AdvancedFilters({ filters, setFilters, categories }: any) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
      <div className="text-center text-gray-500 py-4 col-span-full">
        Advanced filters component will be implemented here
      </div>
    </div>
  );
}

function BulkActions({ selectedDocuments, onAction }: any) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <span className="text-sm font-medium text-blue-700">
          {selectedDocuments.size} document(s) selected
        </span>
      </div>
      <div className="flex items-center space-x-2">
        <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
          Share
        </button>
        <button className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700">
          Download
        </button>
        <button className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700">
          Delete
        </button>
      </div>
    </div>
  );
}

function DocumentListView({ documents, selectedDocuments, onToggleSelection, onSelectAll, sortField, sortDirection, onSort }: any) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left">
              <input
                type="checkbox"
                checked={selectedDocuments.size === documents.length && documents.length > 0}
                onChange={onSelectAll}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
              onClick={() => onSort('fileName')}
            >
              <div className="flex items-center">
                Name
                {sortField === 'fileName' && (sortDirection === 'asc' ? <ArrowUp className="h-4 w-4 ml-1" /> : <ArrowDown className="h-4 w-4 ml-1" />)}
              </div>
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Type
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
              onClick={() => onSort('fileSize')}
            >
              <div className="flex items-center">
                Size
                {sortField === 'fileSize' && (sortDirection === 'asc' ? <ArrowUp className="h-4 w-4 ml-1" /> : <ArrowDown className="h-4 w-4 ml-1" />)}
              </div>
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
              onClick={() => onSort('createdAt')}
            >
              <div className="flex items-center">
                Created
                {sortField === 'createdAt' && (sortDirection === 'asc' ? <ArrowUp className="h-4 w-4 ml-1" /> : <ArrowDown className="h-4 w-4 ml-1" />)}
              </div>
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {documents.map((doc: Document) => (
            <DocumentListRow 
              key={doc.id} 
              document={doc} 
              selected={selectedDocuments.has(doc.id)}
              onToggleSelection={() => onToggleSelection(doc.id)}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DocumentListRow({ document, selected, onToggleSelection }: any) {
  const FileIcon = getFileIcon(document.mimeType);
  
  return (
    <tr className={`hover:bg-gray-50 ${selected ? 'bg-blue-50' : ''}`}>
      <td className="px-6 py-4 whitespace-nowrap">
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggleSelection}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <FileIcon className="h-8 w-8 text-gray-400 mr-3" />
          <div>
            <div className="text-sm font-medium text-gray-900">{document.title}</div>
            <div className="text-sm text-gray-500">{document.fileName}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="text-sm text-gray-900">{document.fileExtension.toUpperCase()}</span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="text-sm text-gray-900">{formatFileSize(document.fileSize)}</span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(document.status)}`}>
          {document.status}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {new Date(document.createdAt).toLocaleDateString()}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <DocumentActions document={document} />
      </td>
    </tr>
  );
}

function DocumentGridView({ documents, selectedDocuments, onToggleSelection }: any) {
  return (
    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {documents.map((doc: Document) => (
        <DocumentCard 
          key={doc.id}
          document={doc}
          selected={selectedDocuments.has(doc.id)}
          onToggleSelection={() => onToggleSelection(doc.id)}
        />
      ))}
    </div>
  );
}

function DocumentCard({ document, selected, onToggleSelection }: any) {
  const FileIcon = getFileIcon(document.mimeType);
  
  return (
    <div className={`relative border rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow ${
      selected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
    }`}>
      <div className="absolute top-2 left-2">
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggleSelection}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          onClick={(e) => e.stopPropagation()}
        />
      </div>
      
      <div className="absolute top-2 right-2">
        {getAccessLevelIcon(document.accessLevel)}
      </div>
      
      <div className="mt-8 text-center">
        <FileIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
        <h3 className="text-sm font-medium text-gray-900 truncate" title={document.title}>
          {document.title}
        </h3>
        <p className="text-xs text-gray-500 truncate" title={document.fileName}>
          {document.fileName}
        </p>
      </div>
      
      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs text-gray-500">{formatFileSize(document.fileSize)}</span>
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(document.status)}`}>
          {document.status}
        </span>
      </div>
      
      {document.tags && document.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {document.tags.slice(0, 2).map((tag, index) => (
            <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
              {tag}
            </span>
          ))}
          {document.tags.length > 2 && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
              +{document.tags.length - 2}
            </span>
          )}
        </div>
      )}
      
      <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
        <span>{new Date(document.createdAt).toLocaleDateString()}</span>
        <DocumentActions document={document} compact />
      </div>
    </div>
  );
}

function DocumentActions({ document, compact = false }: any) {
  return (
    <div className={`flex items-center ${compact ? 'space-x-1' : 'space-x-2'}`}>
      <button className="p-1 text-gray-400 hover:text-gray-600" title="View">
        <Eye className="h-4 w-4" />
      </button>
      <button className="p-1 text-gray-400 hover:text-gray-600" title="Download">
        <Download className="h-4 w-4" />
      </button>
      <button className="p-1 text-gray-400 hover:text-gray-600" title="Share">
        <Share className="h-4 w-4" />
      </button>
      {!compact && (
        <button className="p-1 text-gray-400 hover:text-gray-600" title="More">
          <MoreVertical className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

function DocumentPagination({ currentPage, totalPages, onPageChange }: any) {
  return (
    <div className="flex items-center justify-between">
      <div className="text-sm text-gray-700">
        Page {currentPage} of {totalPages}
      </div>
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
}

function UploadModal({ onClose, onUpload, uploading, categories, folders }: any) {
  const [files, setFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles(droppedFiles);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleUpload = () => {
    if (files.length > 0) {
      onUpload(files);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Upload Documents</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center ${
            dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
          }`}
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
        >
          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">
            Drag and drop files here or{' '}
            <label className="text-blue-600 cursor-pointer hover:text-blue-700">
              browse
              <input
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.txt,.csv,.xls,.xlsx"
              />
            </label>
          </p>
          <p className="text-xs text-gray-500">
            PDF, DOC, JPG, PNG, TXT, CSV, XLS (max 10MB each)
          </p>
        </div>

        {files.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Selected Files ({files.length})
            </h3>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="text-gray-900 truncate">{file.name}</span>
                  <span className="text-gray-500">{formatFileSize(file.size)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 flex items-center justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={files.length === 0 || uploading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? 'Uploading...' : `Upload ${files.length} file(s)`}
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper functions
function getFileIcon(mimeType: string) {
  if (mimeType.startsWith('image/')) return FileImage;
  if (mimeType.includes('pdf')) return FileText;
  if (mimeType.includes('zip') || mimeType.includes('archive')) return FileArchive;
  return FileMinus;
}

function getStatusColor(status: string) {
  switch (status) {
    case 'Published': return 'text-green-600 bg-green-50 border-green-200';
    case 'Draft': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'Review': return 'text-blue-600 bg-blue-50 border-blue-200';
    case 'Approved': return 'text-green-600 bg-green-50 border-green-200';
    case 'Archived': return 'text-gray-600 bg-gray-50 border-gray-200';
    case 'Expired': return 'text-red-600 bg-red-50 border-red-200';
    default: return 'text-gray-600 bg-gray-50 border-gray-200';
  }
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}