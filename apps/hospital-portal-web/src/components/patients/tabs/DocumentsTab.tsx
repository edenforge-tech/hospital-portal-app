'use client';

import React, { useState, useEffect } from 'react';
import { FileText, Upload, Download, Folder, Image, File } from 'lucide-react';

interface DocumentsTabProps {
  patientId: string;
}

// Documents tab uses real API when DocumentSharingController is enabled
// For now, attempts to load from API and shows empty state gracefully
export function DocumentsTab({ patientId }: DocumentsTabProps) {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDocuments();
  }, [patientId]);

  const loadDocuments = async () => {
    setLoading(true);
    setError(null);
    try {
      // DocumentSharingController is Phase4 disabled - gracefully handle
      const { getApi } = await import('@/lib/api');
      const api = getApi();
      const response = await api.get(`/patient-document-uploads/patient/${patientId}`);
      setDocuments(response.data || []);
    } catch (err: any) {
      // Expected to fail until DocumentSharingController is re-enabled
      console.log('Documents endpoint not available:', err.message);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <span className="ml-2 text-gray-600">Loading documents...</span>
      </div>
    );
  }

  const getFileIcon = (type?: string) => {
    if (type?.includes('image')) return <Image className="w-5 h-5 text-pink-500" />;
    if (type?.includes('pdf')) return <FileText className="w-5 h-5 text-red-500" />;
    return <File className="w-5 h-5 text-gray-500" />;
  };

  const categories = [
    { label: 'Consent Forms', icon: '📋' },
    { label: 'ID Documents', icon: '🪪' },
    { label: 'Lab Reports', icon: '🔬' },
    { label: 'Imaging', icon: '📷' },
    { label: 'Referrals', icon: '📨' },
    { label: 'Insurance', icon: '💳' },
    { label: 'Other', icon: '📎' },
  ];

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-400 transition-colors cursor-pointer">
        <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
        <p className="text-sm text-gray-600">Drag & drop files here or click to upload</p>
        <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG up to 10MB</p>
      </div>

      {/* Category Folders */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Document Categories</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {categories.map(cat => {
            const count = documents.filter(d => d.category === cat.label).length;
            return (
              <div key={cat.label} className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer transition-colors">
                <div className="flex items-center gap-2">
                  <Folder className="w-5 h-5 text-yellow-500" />
                  <span className="text-sm font-medium text-gray-700">{cat.label}</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">{count} document{count !== 1 ? 's' : ''}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Document List */}
      {documents.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">All Documents</h3>
          <div className="space-y-2">
            {documents.map((doc: any) => (
              <div key={doc.id} className="flex items-center justify-between border rounded-lg p-3 bg-white hover:shadow-sm">
                <div className="flex items-center gap-3">
                  {getFileIcon(doc.fileType || doc.mimeType)}
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{doc.fileName || doc.title || 'Untitled'}</p>
                    <p className="text-xs text-gray-400">
                      {doc.category && `${doc.category} | `}
                      {doc.createdAt && new Date(doc.createdAt).toLocaleDateString()}
                      {doc.fileSize && ` | ${(doc.fileSize / 1024).toFixed(0)} KB`}
                    </p>
                  </div>
                </div>
                <button className="p-2 text-gray-400 hover:text-indigo-600">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {documents.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No documents uploaded for this patient.</p>
          <p className="text-sm mt-1">Upload patient documents using the area above.</p>
        </div>
      )}
    </div>
  );
}
