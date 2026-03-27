// Advanced Document Viewer Component
// Comprehensive document viewing with annotations, signatures, and version control

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Eye, 
  Download, 
  Share, 
  Edit, 
  FileSignature, 
  MessageSquare, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Maximize, 
  Minimize, 
  Print, 
  History, 
  Shield, 
  Clock, 
  User, 
  Tag, 
  X, 
  Check, 
  AlertTriangle, 
  Lock, 
  Unlock,
  Plus,
  Minus,
  RefreshCw,
  ExternalLink,
  Copy,
  BookOpen,
  FileText,
  Image,
  Paperclip,
  Star,
  Flag
} from 'lucide-react';
import { 
  Document, 
  DocumentVersion, 
  DigitalSignature,
  DocumentShare,
  documentSharingApi 
} from '../../lib/api/document-sharing.api';

interface DocumentViewerProps {
  documentId: string;
  onClose: () => void;
  readOnly?: boolean;
  allowAnnotations?: boolean;
  allowSignature?: boolean;
  fullScreen?: boolean;
}

interface Annotation {
  id: string;
  type: 'comment' | 'highlight' | 'note' | 'drawing';
  x: number;
  y: number;
  width?: number;
  height?: number;
  content: string;
  author: string;
  createdAt: string;
  resolved?: boolean;
  color?: string;
  page: number;
}

interface ViewerState {
  zoom: number;
  rotation: number;
  currentPage: number;
  totalPages: number;
  annotations: Annotation[];
  isFullScreen: boolean;
  showAnnotations: boolean;
  showVersions: boolean;
  showSignatures: boolean;
  showSharing: boolean;
  selectedTool: 'select' | 'comment' | 'highlight' | 'draw' | 'sign';
}

export default function DocumentViewer({ 
  documentId, 
  onClose, 
  readOnly = false, 
  allowAnnotations = true, 
  allowSignature = true,
  fullScreen = false
}: DocumentViewerProps) {
  const [document, setDocument] = useState<Document | null>(null);
  const [versions, setVersions] = useState<DocumentVersion[]>([]);
  const [signatures, setSignatures] = useState<DigitalSignature[]>([]);
  const [shares, setShares] = useState<DocumentShare[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const viewerRef = useRef<HTMLDivElement>(null);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showAnnotationPanel, setShowAnnotationPanel] = useState(false);

  const [viewerState, setViewerState] = useState<ViewerState>({
    zoom: 100,
    rotation: 0,
    currentPage: 1,
    totalPages: 1,
    annotations: [],
    isFullScreen: fullScreen,
    showAnnotations: true,
    showVersions: false,
    showSignatures: false,
    showSharing: false,
    selectedTool: 'select'
  });

  useEffect(() => {
    loadDocument();
  }, [documentId]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && viewerState.isFullScreen) {
        toggleFullScreen();
      } else if (e.key === 'F11') {
        e.preventDefault();
        toggleFullScreen();
      }
    };

    document?.addEventListener('keydown', handleKeyPress);
    return () => document?.removeEventListener('keydown', handleKeyPress);
  }, [viewerState.isFullScreen]);

  const loadDocument = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [docResponse, versionsResponse, signaturesResponse, sharesResponse] = await Promise.all([
        documentSharingApi.getDocument(documentId),
        documentSharingApi.getDocumentVersions(documentId),
        documentSharingApi.getDocumentSignatures(documentId),
        documentSharingApi.getSharedDocuments(documentId)
      ]);
      
      setDocument(docResponse);
      setVersions(versionsResponse);
      setSignatures(signaturesResponse);
      setShares(sharesResponse);
      
      // Log document access for audit trail
      await logDocumentAccess();
      
    } catch (error) {
      console.error('Error loading document:', error);
      setError('Failed to load document. You may not have permission to view this document.');
    } finally {
      setLoading(false);
    }
  };

  const logDocumentAccess = async () => {
    // This would typically call an audit logging endpoint
    console.log(`Document ${documentId} accessed at ${new Date().toISOString()}`);
  };

  const toggleFullScreen = () => {
    if (!document?.fullscreenElement) {
      viewerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
    
    setViewerState(prev => ({
      ...prev,
      isFullScreen: !prev.isFullScreen
    }));
  };

  const updateZoom = (delta: number) => {
    setViewerState(prev => ({
      ...prev,
      zoom: Math.max(10, Math.min(500, prev.zoom + delta))
    }));
  };

  const rotate = () => {
    setViewerState(prev => ({
      ...prev,
      rotation: (prev.rotation + 90) % 360
    }));
  };

  const changePage = (page: number) => {
    setViewerState(prev => ({
      ...prev,
      currentPage: Math.max(1, Math.min(prev.totalPages, page))
    }));
  };

  const downloadDocument = async () => {
    try {
      const response = await fetch(document?.storageUrl || '');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document?.createElement('a');
      if (a && document) {
        a.href = url;
        a.download = document.fileName;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error downloading document:', error);
    }
  };

  const printDocument = () => {
    const printWindow = window.open(document?.storageUrl || '', '_blank');
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  };

  const addAnnotation = (type: Annotation['type'], x: number, y: number) => {
    if (readOnly || !allowAnnotations) return;

    const newAnnotation: Annotation = {
      id: Date.now().toString(),
      type,
      x,
      y,
      content: '',
      author: 'Current User', // This would come from auth context
      createdAt: new Date().toISOString(),
      page: viewerState.currentPage,
      color: type === 'highlight' ? '#ffff00' : '#ff0000'
    };

    setViewerState(prev => ({
      ...prev,
      annotations: [...prev.annotations, newAnnotation]
    }));
  };

  const getFileTypeComponent = () => {
    if (!document) return null;

    if (document.mimeType.includes('pdf')) {
      return <PDFViewer document={document} viewerState={viewerState} />;
    } else if (document.mimeType.startsWith('image/')) {
      return <ImageViewer document={document} viewerState={viewerState} />;
    } else if (document.mimeType.includes('text/') || document.mimeType.includes('json')) {
      return <TextViewer document={document} />;
    } else {
      return <UnsupportedViewer document={document} />;
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
          <RefreshCw className="h-5 w-5 animate-spin text-blue-500" />
          <span>Loading document...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md">
          <div className="flex items-center space-x-3 text-red-600 mb-4">
            <AlertTriangle className="h-6 w-6" />
            <h2 className="text-lg font-semibold">Error Loading Document</h2>
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

  return (
    <div 
      ref={viewerRef}
      className={`fixed inset-0 bg-gray-900 z-50 flex flex-col ${
        viewerState.isFullScreen ? 'bg-black' : 'bg-gray-900 bg-opacity-95'
      }`}
    >
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded"
          >
            <X className="h-5 w-5" />
          </button>
          
          <div>
            <h1 className="text-lg font-semibold text-gray-900">{document?.title}</h1>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>{document?.fileName}</span>
              <span>{formatFileSize(document?.fileSize || 0)}</span>
              <div className="flex items-center space-x-1">
                {getAccessLevelIcon(document?.accessLevel || 'Internal')}
                <span>{document?.accessLevel}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Tool Selection */}
          {!readOnly && allowAnnotations && (
            <div className="flex items-center border border-gray-300 rounded">
              {[
                { tool: 'select', icon: Eye, label: 'Select' },
                { tool: 'comment', icon: MessageSquare, label: 'Comment' },
                { tool: 'highlight', icon: Edit, label: 'Highlight' }
              ].map(({ tool, icon: Icon, label }) => (
                <button
                  key={tool}
                  onClick={() => setViewerState(prev => ({ ...prev, selectedTool: tool as any }))}
                  className={`p-2 ${
                    viewerState.selectedTool === tool 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                  title={label}
                >
                  <Icon className="h-4 w-4" />
                </button>
              ))}
            </div>
          )}

          {/* Zoom Controls */}
          <div className="flex items-center border border-gray-300 rounded">
            <button
              onClick={() => updateZoom(-25)}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50"
              title="Zoom Out"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <span className="px-3 py-2 text-sm font-mono min-w-[60px] text-center border-x">
              {viewerState.zoom}%
            </span>
            <button
              onClick={() => updateZoom(25)}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50"
              title="Zoom In"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
          </div>

          {/* Document Actions */}
          <div className="flex items-center space-x-1">
            <button
              onClick={rotate}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded"
              title="Rotate"
            >
              <RotateCw className="h-4 w-4" />
            </button>
            
            <button
              onClick={downloadDocument}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded"
              title="Download"
            >
              <Download className="h-4 w-4" />
            </button>
            
            <button
              onClick={printDocument}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded"
              title="Print"
            >
              <Print className="h-4 w-4" />
            </button>
            
            <button
              onClick={() => setShowShareModal(true)}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded"
              title="Share"
            >
              <Share className="h-4 w-4" />
            </button>
            
            {allowSignature && (
              <button
                onClick={() => setShowSignatureModal(true)}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded"
                title="Sign Document"
              >
                <FileSignature className="h-4 w-4" />
              </button>
            )}
            
            <button
              onClick={toggleFullScreen}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded"
              title={viewerState.isFullScreen ? "Exit Full Screen" : "Full Screen"}
            >
              {viewerState.isFullScreen ? (
                <Minimize className="h-4 w-4" />
              ) : (
                <Maximize className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="flex space-x-1">
              {[
                { key: 'info', label: 'Info', icon: FileText },
                { key: 'versions', label: 'Versions', icon: History },
                { key: 'signatures', label: 'Signatures', icon: FileSignature },
                { key: 'sharing', label: 'Sharing', icon: Share }
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setViewerState(prev => ({ 
                    ...prev, 
                    [`show${key.charAt(0).toUpperCase() + key.slice(1)}`]: !prev[`show${key.charAt(0).toUpperCase() + key.slice(1)}` as keyof ViewerState]
                  }))}
                  className={`flex-1 p-2 text-xs font-medium rounded ${
                    viewerState[`show${key.charAt(0).toUpperCase() + key.slice(1)}` as keyof ViewerState]
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-4 w-4 mx-auto mb-1" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <DocumentSidebar 
              document={document}
              versions={versions}
              signatures={signatures}
              shares={shares}
              viewerState={viewerState}
              onVersionSelect={(version) => console.log('Switch to version:', version)}
            />
          </div>
        </div>

        {/* Main Viewer */}
        <div className="flex-1 flex flex-col bg-gray-100">
          {/* Page Navigation */}
          {viewerState.totalPages > 1 && (
            <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-center space-x-4">
              <button
                onClick={() => changePage(viewerState.currentPage - 1)}
                disabled={viewerState.currentPage === 1}
                className="p-1 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Page</span>
                <input
                  type="number"
                  min="1"
                  max={viewerState.totalPages}
                  value={viewerState.currentPage}
                  onChange={(e) => changePage(parseInt(e.target.value) || 1)}
                  className="w-16 px-2 py-1 text-sm border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600">of {viewerState.totalPages}</span>
              </div>
              
              <button
                onClick={() => changePage(viewerState.currentPage + 1)}
                disabled={viewerState.currentPage === viewerState.totalPages}
                className="p-1 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Document Content */}
          <div className="flex-1 overflow-auto p-4">
            <div className="flex justify-center">
              <div 
                className="bg-white shadow-lg"
                style={{
                  transform: `scale(${viewerState.zoom / 100}) rotate(${viewerState.rotation}deg)`
                }}
              >
                {getFileTypeComponent()}
              </div>
            </div>
          </div>
        </div>

        {/* Annotations Panel */}
        {showAnnotationPanel && allowAnnotations && (
          <div className="w-80 bg-white border-l border-gray-200">
            <AnnotationsPanel 
              annotations={viewerState.annotations}
              onClose={() => setShowAnnotationPanel(false)}
              onAddAnnotation={addAnnotation}
              readOnly={readOnly}
            />
          </div>
        )}
      </div>

      {/* Modals */}
      {showSignatureModal && (
        <SignatureModal
          documentId={documentId}
          onClose={() => setShowSignatureModal(false)}
          onSigned={() => {
            setShowSignatureModal(false);
            loadDocument(); // Reload to show new signature
          }}
        />
      )}

      {showShareModal && (
        <ShareModal
          documentId={documentId}
          onClose={() => setShowShareModal(false)}
          onShared={() => {
            setShowShareModal(false);
            loadDocument(); // Reload to show new shares
          }}
        />
      )}
    </div>
  );
}

// Component placeholders - these will be separate files
function DocumentSidebar({ document, versions, signatures, shares, viewerState }: any) {
  if (!document) return null;

  return (
    <div className="p-4 space-y-6">
      {/* Document Info */}
      <div>
        <h3 className="font-medium text-gray-900 mb-3">Document Information</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Created:</span>
            <span className="text-gray-900">{new Date(document.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Modified:</span>
            <span className="text-gray-900">{new Date(document.updatedAt).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Version:</span>
            <span className="text-gray-900">{document.version}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Status:</span>
            <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(document.status)}`}>
              {document.status}
            </span>
          </div>
        </div>
      </div>

      {/* Versions */}
      {viewerState.showVersions && versions.length > 0 && (
        <div>
          <h3 className="font-medium text-gray-900 mb-3">Version History</h3>
          <div className="space-y-2">
            {versions.map((version: DocumentVersion) => (
              <div key={version.id} className="p-2 border border-gray-200 rounded text-sm">
                <div className="font-medium">v{version.version}</div>
                <div className="text-gray-500">{new Date(version.createdBy).toLocaleDateString()}</div>
                <div className="text-gray-600 mt-1">{version.changes}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Signatures */}
      {viewerState.showSignatures && signatures.length > 0 && (
        <div>
          <h3 className="font-medium text-gray-900 mb-3">Digital Signatures</h3>
          <div className="space-y-2">
            {signatures.map((signature: DigitalSignature) => (
              <div key={signature.id} className="p-2 border border-gray-200 rounded text-sm">
                <div className="font-medium">{signature.signerName}</div>
                <div className="text-gray-500">{new Date(signature.timestamp).toLocaleDateString()}</div>
                <div className={`mt-1 ${signature.isValid ? 'text-green-600' : 'text-red-600'}`}>
                  {signature.isValid ? '✓ Valid' : '✗ Invalid'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Shares */}
      {viewerState.showSharing && shares.length > 0 && (
        <div>
          <h3 className="font-medium text-gray-900 mb-3">Shared With</h3>
          <div className="space-y-2">
            {shares.map((share: DocumentShare) => (
              <div key={share.id} className="p-2 border border-gray-200 rounded text-sm">
                <div className="font-medium">{share.sharedWithEmail || 'Anonymous'}</div>
                <div className="text-gray-500">{share.accessLevel} access</div>
                <div className="text-gray-500">{new Date(share.sharedAt).toLocaleDateString()}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PDFViewer({ document, viewerState }: any) {
  return (
    <div className="min-h-[600px] w-full max-w-4xl bg-white">
      <embed
        src={document.storageUrl}
        type="application/pdf"
        width="100%"
        height="100%"
        className="border-0"
      />
    </div>
  );
}

function ImageViewer({ document, viewerState }: any) {
  return (
    <div className="flex justify-center items-center min-h-[600px] bg-gray-100">
      <img
        src={document.storageUrl}
        alt={document.title}
        className="max-w-full max-h-full object-contain"
        style={{
          transform: `scale(${viewerState.zoom / 100}) rotate(${viewerState.rotation}deg)`
        }}
      />
    </div>
  );
}

function TextViewer({ document }: any) {
  const [content, setContent] = useState('');

  useEffect(() => {
    fetch(document.storageUrl)
      .then(response => response.text())
      .then(text => setContent(text))
      .catch(error => console.error('Error loading text content:', error));
  }, [document.storageUrl]);

  return (
    <div className="min-h-[600px] w-full max-w-4xl bg-white p-6">
      <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
        {content}
      </pre>
    </div>
  );
}

function UnsupportedViewer({ document }: any) {
  return (
    <div className="min-h-[600px] w-full max-w-4xl bg-white flex items-center justify-center">
      <div className="text-center">
        <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Preview Not Available</h3>
        <p className="text-gray-600 mb-4">
          This file type cannot be previewed in the browser.
        </p>
        <button
          onClick={() => window.open(document.storageUrl, '_blank')}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Open in New Tab
        </button>
      </div>
    </div>
  );
}

function AnnotationsPanel({ annotations, onClose, onAddAnnotation, readOnly }: any) {
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="font-medium text-gray-900">Annotations</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X className="h-4 w-4" />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        <div className="text-center text-gray-500 py-8">
          Annotations panel will be implemented here
        </div>
      </div>
    </div>
  );
}

function SignatureModal({ documentId, onClose, onSigned }: any) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">Sign Document</h2>
        <div className="text-center text-gray-500 py-8">
          Digital signature component will be implemented here
        </div>
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onSigned}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Sign
          </button>
        </div>
      </div>
    </div>
  );
}

function ShareModal({ documentId, onClose, onShared }: any) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">Share Document</h2>
        <div className="text-center text-gray-500 py-8">
          Document sharing component will be implemented here
        </div>
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onShared}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Share
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper functions
function getAccessLevelIcon(level: string) {
  switch (level) {
    case 'Public': return <Eye className="h-4 w-4 text-green-500" />;
    case 'Internal': return <User className="h-4 w-4 text-blue-500" />;
    case 'Confidential': return <Lock className="h-4 w-4 text-orange-500" />;
    case 'Restricted': return <Shield className="h-4 w-4 text-red-500" />;
    default: return <Eye className="h-4 w-4 text-gray-500" />;
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'Published': return 'text-green-600 bg-green-50';
    case 'Draft': return 'text-yellow-600 bg-yellow-50';
    case 'Review': return 'text-blue-600 bg-blue-50';
    case 'Approved': return 'text-green-600 bg-green-50';
    case 'Archived': return 'text-gray-600 bg-gray-50';
    case 'Expired': return 'text-red-600 bg-red-50';
    default: return 'text-gray-600 bg-gray-50';
  }
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}