'use client';

import { useState, useEffect } from 'react';
import { FileText, Upload, FolderOpen, Share2, Download, Trash2, Search } from 'lucide-react';

interface DocumentStats {
  totalDocuments: number;
  sharedWithMe: number;
  recentUploads: number;
  storageUsed: string;
}

interface Document {
  id: string;
  name: string;
  type: string;
  category: string;
  size: string;
  uploadedBy: string;
  uploadedAt: string;
  sharedWith: number;
  isShared: boolean;
}

export default function DocumentsPage() {
  const [stats, setStats] = useState<DocumentStats>({
    totalDocuments: 0,
    sharedWithMe: 0,
    recentUploads: 0,
    storageUsed: '0 MB'
  });
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setStats({
        totalDocuments: 24,
        sharedWithMe: 8,
        recentUploads: 5,
        storageUsed: '156 MB'
      });

      setDocuments([
        {
          id: '1',
          name: 'Patient Consent Form.pdf',
          type: 'PDF',
          category: 'Legal',
          size: '2.3 MB',
          uploadedBy: 'Dr. Sarah Johnson',
          uploadedAt: '2026-01-22',
          sharedWith: 3,
          isShared: true
        },
        {
          id: '2',
          name: 'Lab Results - Jan 2026.xlsx',
          type: 'Excel',
          category: 'Medical Records',
          size: '1.5 MB',
          uploadedBy: 'System',
          uploadedAt: '2026-01-20',
          sharedWith: 0,
          isShared: false
        }
      ]);
    } catch (error) {
      console.error('Failed to load documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: 'Total Documents', value: stats.totalDocuments, icon: FileText, color: 'bg-blue-500' },
    { title: 'Shared With Me', value: stats.sharedWithMe, icon: Share2, color: 'bg-purple-500' },
    { title: 'Recent Uploads', value: stats.recentUploads, icon: Upload, color: 'bg-green-500' },
    { title: 'Storage Used', value: stats.storageUsed, icon: FolderOpen, color: 'bg-orange-500' }
  ];

  if (loading) {
    return <div className="p-6"><div className="flex items-center justify-center h-64"><div className="text-gray-500">Loading documents...</div></div></div>;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Document Management</h1>
        <p className="text-gray-600 mt-1">Manage and share healthcare documents</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Documents List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">My Documents</h2>
            <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload Document
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="p-6">
          {documents.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <p>No documents found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {documents.map((doc) => (
                <div key={doc.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="bg-blue-50 p-2 rounded">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{doc.name}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>{doc.type}</span>
                          <span>•</span>
                          <span>{doc.size}</span>
                          <span>•</span>
                          <span>{doc.category}</span>
                          <span>•</span>
                          <span>Uploaded by {doc.uploadedBy}</span>
                          <span>•</span>
                          <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                        <Download className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-purple-600 hover:bg-purple-50 rounded">
                        <Share2 className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-red-600 hover:bg-red-50 rounded">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
