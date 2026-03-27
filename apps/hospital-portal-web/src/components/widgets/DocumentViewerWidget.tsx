/**
 * Document Viewer Widget
 * PDF/Image viewer with zoom, pan, and document list
 */

'use client';

import React, { useState, useEffect } from 'react';
import { FileText, FileText as ImageIcon, X as Plus, X as Minus, XCircle as Eye, Download, X as ChevronUp, X as ChevronDown, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { WidgetProps } from '@/lib/widgets/widget-types';
import { widgetsApi, type Document as DocumentAPI } from '@/lib/api/widgets.api';

// Use API type with additional widget-specific fields
type Document = DocumentAPI & {
  type: 'pdf' | 'image' | 'report';
  uploadedAt: Date;
  url: string;
  pageCount?: number;
};

export default function DocumentViewerWidget({
  widgetId,
  patientId,
  sessionId,
  size,
  isMinimized,
  data,
  onAction,
  onDataChange,
}: WidgetProps) {
  const [selectedDoc, setSelectedDoc] = useState<Document | null>((data as any)?.selectedDoc || null);
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load documents from API
  useEffect(() => {
    if (patientId) loadDocuments();
  }, [patientId]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      const docs = await widgetsApi.getPatientDocuments(patientId!);
      // Map API documents to widget format
      const mappedDocs = docs.map(doc => ({
        ...doc,
        type: (doc.type || 'pdf') as 'pdf' | 'image' | 'report',
        uploadedAt: doc.uploadedAt || new Date(doc.uploadedDate),
        url: doc.url || doc.fileUrl,
      })) as Document[];
      setDocuments(mappedDocs);
      if (mappedDocs.length > 0 && !selectedDoc) {
        setSelectedDoc(mappedDocs[0]);
      }
    } catch (err: any) {
      console.error('Failed to load documents:', err);
      setError(err.message || 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Activity className="h-6 w-6 text-blue-500 animate-spin" />
        <span className="ml-2 text-sm text-gray-500">Loading documents...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6">
        <FileText className="h-10 w-10 text-red-500 mb-3" />
        <p className="text-sm text-red-600">{error}</p>
        <button
          onClick={loadDocuments}
          className="mt-3 text-xs text-blue-600 hover:text-blue-700 underline"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!documents.length) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6">
        <FileText className="h-10 w-10 text-gray-300 mb-3" />
        <p className="text-sm text-gray-500">No documents available</p>
      </div>
    );
  }

  const categoryColors = {
    referral: 'blue',
    'lab-report': 'purple',
    imaging: 'green',
    consent: 'orange',
    other: 'gray',
  };

  const handleDocumentSelect = (doc: Document) => {
    setSelectedDoc(doc);
    setCurrentPage(1);
    setZoom(100);
    onDataChange?.({ selectedDoc: doc });
    onAction?.({ type: 'DOCUMENT_OPENED', payload: { docId: doc.id }, timestamp: new Date() });
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 25, 50));
  };

  const handleDownload = () => {
    if (selectedDoc) {
      onAction?.({ type: 'DOCUMENT_DOWNLOADED', payload: { docId: selectedDoc.id }, timestamp: new Date() });
    }
  };

  if (!patientId) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 py-8">
        <FileText className="h-12 w-12 mb-3 opacity-30" />
        <p className="text-sm">No patient selected</p>
        <p className="text-xs text-gray-400 mt-1">Select a patient to view documents</p>
      </div>
    );
  }

  const isCompact = size === 'small';

  if (isCompact) {
    return (
      <div className="space-y-2">
        <p className="text-xs text-gray-500 font-medium">Documents</p>
        <div className="bg-blue-50 rounded p-2 border border-blue-200">
          <div className="flex items-center gap-2 mb-1">
            <FileText className="h-4 w-4 text-blue-600" />
            <p className="text-sm font-semibold text-gray-900">{documents.length} files</p>
          </div>
          {selectedDoc && (
            <p className="text-xs text-gray-600 truncate">{selectedDoc.name}</p>
          )}
        </div>
        <button
          onClick={() => onAction?.({ type: 'OPEN_DOCUMENT_VIEWER', timestamp: new Date() })}
          className="w-full py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Open Viewer
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-3 h-full">
      {/* Document List Sidebar (30% width) */}
      <div className="w-1/3 border border-gray-200 rounded-lg overflow-hidden flex flex-col">
        <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-900">Documents</p>
            <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
              {documents.length}
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-2 space-y-1">
            {documents.map((doc) => {
              const isSelected = selectedDoc?.id === doc.id;
              const color = categoryColors[doc.category];
              return (
                <button
                  key={doc.id}
                  onClick={() => handleDocumentSelect(doc)}
                  className={cn(
                    'w-full text-left p-2 rounded-lg border transition-all',
                    isSelected
                      ? `bg-${color}-50 border-${color}-200 ring-2 ring-${color}-200`
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  )}
                >
                  <div className="flex items-start gap-2">
                    {doc.type === 'pdf' ? (
                      <FileText className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <ImageIcon className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-900 truncate">{doc.name}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <span className={cn('text-xs px-1.5 py-0.5 rounded', `bg-${color}-100 text-${color}-700`)}>
                          {doc.category}
                        </span>
                        {doc.pageCount && (
                          <span className="text-xs text-gray-500">{doc.pageCount} pg</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {doc.uploadedAt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Upload Button */}
        <div className="p-2 border-t border-gray-200">
          <button
            onClick={() => onAction?.({ type: 'UPLOAD_DOCUMENT', timestamp: new Date() })}
            className="w-full py-2 text-xs border-2 border-dashed border-blue-400 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
          >
            + Upload Document
          </button>
        </div>
      </div>

      {/* Document Viewer (70% width) */}
      <div className="flex-1 border border-gray-200 rounded-lg overflow-hidden flex flex-col">
        {selectedDoc ? (
          <>
            {/* Viewer Toolbar */}
            <div className="bg-gray-50 px-3 py-2 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {selectedDoc.type === 'pdf' ? (
                  <FileText className="h-4 w-4 text-red-600" />
                ) : (
                  <ImageIcon className="h-4 w-4 text-blue-600" />
                )}
                <div>
                  <p className="text-sm font-semibold text-gray-900 truncate max-w-xs">{selectedDoc.name}</p>
                  <p className="text-xs text-gray-500">
                    {selectedDoc.type.toUpperCase()}
                    {selectedDoc.pageCount && ` • ${selectedDoc.pageCount} pages`}
                  </p>
                </div>
              </div>

              {/* Zoom Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleZoomOut}
                  disabled={zoom <= 50}
                  className="p-1.5 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="text-sm font-medium text-gray-700 min-w-[3rem] text-center">{zoom}%</span>
                <button
                  onClick={handleZoomIn}
                  disabled={zoom >= 200}
                  className="p-1.5 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
                <div className="w-px h-6 bg-gray-300 mx-1" />
                <button
                  onClick={handleDownload}
                  className="p-1.5 border border-gray-300 rounded hover:bg-gray-100 transition-colors"
                  title="Download"
                >
                  <Download className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Viewer Content */}
            <div className="flex-1 bg-gray-100 overflow-auto p-4">
              <div
                className="bg-white shadow-lg mx-auto"
                style={{
                  transform: `scale(${zoom / 100})`,
                  transformOrigin: 'top center',
                  transition: 'transform 0.2s',
                  width: '210mm', // A4 width
                  minHeight: '297mm', // A4 height
                }}
              >
                {/* Mock Document Preview */}
                <div className="p-8 text-gray-700">
                  <div className="text-center mb-8">
                    {selectedDoc.type === 'pdf' ? (
                      <FileText className="h-16 w-16 text-red-600 mx-auto mb-4" />
                    ) : (
                      <ImageIcon className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                    )}
                    <p className="text-lg font-semibold">{selectedDoc.name}</p>
                    <p className="text-sm text-gray-500 mt-1">Document Preview</p>
                  </div>
                  <div className="space-y-4 text-sm">
                    <p>This is a mock document viewer displaying: <strong>{selectedDoc.name}</strong></p>
                    <p>Category: <span className="font-medium">{selectedDoc.category}</span></p>
                    <p>Type: <span className="font-medium">{selectedDoc.type.toUpperCase()}</span></p>
                    <p>Uploaded: <span className="font-medium">{selectedDoc.uploadedAt.toLocaleString('en-IN')}</span></p>
                    {selectedDoc.pageCount && (
                      <p>Pages: <span className="font-medium">{selectedDoc.pageCount}</span></p>
                    )}
                    <div className="mt-6 p-4 bg-blue-50 rounded border border-blue-200">
                      <p className="text-xs text-blue-700">
                        In production, this area would render the actual PDF using react-pdf or display the image.
                        The document would be fetched from: <code className="text-xs">{selectedDoc.url}</code>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Page Navigation (for PDFs) */}
            {selectedDoc.type === 'pdf' && selectedDoc.pageCount && selectedDoc.pageCount > 1 && (
              <div className="bg-gray-50 px-3 py-2 border-t border-gray-200 flex items-center justify-center gap-3">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  className="p-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronUp className="h-4 w-4" />
                </button>
                <span className="text-sm text-gray-700">
                  Page {currentPage} of {selectedDoc.pageCount}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(selectedDoc.pageCount!, p + 1))}
                  disabled={currentPage >= selectedDoc.pageCount}
                  className="p-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
            <Eye className="h-16 w-16 mb-4 opacity-30" />
            <p className="text-sm font-medium">No document selected</p>
            <p className="text-xs text-gray-400 mt-1">Select a document from the list to preview</p>
          </div>
        )}
      </div>
    </div>
  );
}
