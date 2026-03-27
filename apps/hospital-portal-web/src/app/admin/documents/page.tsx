'use client';

import React, { useState, useEffect } from 'react';
import {
  documentsApi,
  foldersApi,
  documentPermissionsApi,
  shareLinksApi,
  type Document,
  type DocumentFolder,
  type DocumentShareLink,
} from '@/lib/api/documents.api';

const DocumentsPage = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'recent' | 'shared' | 'folders'>('all');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [folders, setFolders] = useState<DocumentFolder[]>([]);
  const [shareLinks, setShareLinks] = useState<DocumentShareLink[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    loadData();
  }, [activeTab, selectedFolder, filterType]);

  const loadData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'folders') {
        const folderData = await foldersApi.list();
        setFolders(folderData);
      } else {
        const params: any = {
          search: searchTerm || undefined,
          type: filterType || undefined,
        };
        if (selectedFolder) params.folderId = selectedFolder;

        const docData = await documentsApi.list(params);
        setDocuments(docData.data);
      }
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (file: File, metadata: any) => {
    try {
      await documentsApi.upload(
        file,
        {
          name: metadata.name || file.name,
          folderId: selectedFolder || undefined,
          type: metadata.type,
          tags: metadata.tags,
          description: metadata.description,
        },
        (progress) => setUploadProgress(progress)
      );
      setShowUploadModal(false);
      setUploadProgress(0);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to upload document');
    }
  };

  const handleCreateFolder = async (data: { name: string; parentId?: string; color?: string }) => {
    try {
      await foldersApi.create(data);
      setShowFolderModal(false);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create folder');
    }
  };

  const handleCreateShareLink = async (documentId: string, data: any) => {
    try {
      const link = await shareLinksApi.create(documentId, data);
      alert(`Share link created: ${link.url}`);
      setShowShareModal(false);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create share link');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    try {
      await documentsApi.delete(id);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete document');
    }
  };

  const TypeBadge = ({ type }: { type: string }) => {
    const colors: Record<string, string> = {
      'application/pdf': 'bg-red-100 text-red-800',
      'image/jpeg': 'bg-blue-100 text-blue-800',
      'image/png': 'bg-blue-100 text-blue-800',
      'application/msword': 'bg-blue-100 text-blue-800',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'bg-blue-100 text-blue-800',
      'application/vnd.ms-excel': 'bg-green-100 text-green-800',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'bg-green-100 text-green-800',
    };
    const label = type.split('/')[1]?.toUpperCase() || 'FILE';
    return (
      <span className={`px-2 py-1 rounded text-xs font-semibold ${colors[type] || 'bg-gray-100 text-gray-800'}`}>
        {label}
      </span>
    );
  };

  const FileIcon = ({ mimeType }: { mimeType: string }) => {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType === 'application/pdf') return '📄';
    if (mimeType.includes('word')) return '📝';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊';
    if (mimeType.includes('video')) return '🎥';
    return '📎';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const UploadModal = () => {
    const [file, setFile] = useState<File | null>(null);
    const [metadata, setMetadata] = useState({
      name: '',
      type: 'general',
      description: '',
      tags: [] as string[],
    });
    const [tagInput, setTagInput] = useState('');

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Upload Document</h3>
            <button onClick={() => setShowUploadModal(false)} className="text-gray-500 hover:text-gray-700">
              ✕
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Select File</label>
              <input
                type="file"
                onChange={(e) => {
                  const selectedFile = e.target.files?.[0];
                  if (selectedFile) {
                    setFile(selectedFile);
                    setMetadata({ ...metadata, name: selectedFile.name });
                  }
                }}
                className="w-full border rounded-md px-3 py-2"
              />
              {file && (
                <div className="mt-2 text-sm text-gray-600">
                  Selected: {file.name} ({formatFileSize(file.size)})
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Document Name</label>
              <input
                type="text"
                className="w-full border rounded-md px-3 py-2"
                value={metadata.name}
                onChange={(e) => setMetadata({ ...metadata, name: e.target.value })}
                placeholder="Document name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select
                className="w-full border rounded-md px-3 py-2"
                value={metadata.type}
                onChange={(e) => setMetadata({ ...metadata, type: e.target.value })}
              >
                <option value="general">General</option>
                <option value="medical_record">Medical Record</option>
                <option value="lab_result">Lab Result</option>
                <option value="imaging">Imaging</option>
                <option value="consent_form">Consent Form</option>
                <option value="insurance">Insurance</option>
                <option value="administrative">Administrative</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                className="w-full border rounded-md px-3 py-2"
                rows={3}
                value={metadata.description}
                onChange={(e) => setMetadata({ ...metadata, description: e.target.value })}
                placeholder="Optional description..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Tags</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  className="flex-1 border rounded-md px-3 py-2"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && tagInput.trim()) {
                      setMetadata({ ...metadata, tags: [...metadata.tags, tagInput.trim()] });
                      setTagInput('');
                    }
                  }}
                  placeholder="Add tags (press Enter)"
                />
              </div>
              {metadata.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {metadata.tags.map((tag, idx) => (
                    <span key={idx} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                      {tag}
                      <button
                        onClick={() => setMetadata({ ...metadata, tags: metadata.tags.filter((_, i) => i !== idx) })}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {uploadProgress > 0 && uploadProgress < 100 && (
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${uploadProgress}%` }}></div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button
              onClick={() => setShowUploadModal(false)}
              className="px-4 py-2 border rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={() => file && handleUpload(file, metadata)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              disabled={!file || uploadProgress > 0}
            >
              Upload
            </button>
          </div>
        </div>
      </div>
    );
  };

  const FolderTree = ({ folder, level = 0 }: { folder: DocumentFolder; level?: number }) => (
    <div style={{ marginLeft: `${level * 20}px` }}>
      <div
        className="flex items-center gap-2 p-2 hover:bg-gray-50 cursor-pointer rounded"
        onClick={() => setSelectedFolder(folder.id)}
      >
        <span className="text-xl">📁</span>
        <span className="font-medium">{folder.name}</span>
        <span className="text-xs text-gray-500">({folder.documentCount || 0})</span>
      </div>
      {folder.children?.map((child) => (
        <FolderTree key={child.id} folder={child} level={level + 1} />
      ))}
    </div>
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Document Management</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFolderModal(true)}
            className="px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50"
          >
            + New Folder
          </button>
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            📤 Upload Document
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-800">
          {error}
        </div>
      )}

      <div className="grid grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="col-span-1">
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-semibold mb-3">Folders</h3>
            <div
              className={`flex items-center gap-2 p-2 hover:bg-gray-50 cursor-pointer rounded mb-2 ${
                !selectedFolder ? 'bg-blue-50' : ''
              }`}
              onClick={() => setSelectedFolder(null)}
            >
              <span className="text-xl">📂</span>
              <span>All Documents</span>
            </div>
            {folders.map((folder) => !folder.parentId && <FolderTree key={folder.id} folder={folder} />)}
          </div>
        </div>

        {/* Main Content */}
        <div className="col-span-3">
          <div className="bg-white rounded-lg shadow">
            <div className="border-b">
              <div className="flex">
                {['all', 'recent', 'shared'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`px-6 py-3 font-medium ${
                      activeTab === tab
                        ? 'border-b-2 border-blue-600 text-blue-600'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 border-b">
              <div className="flex gap-4">
                <input
                  type="text"
                  placeholder="Search documents..."
                  className="flex-1 border rounded-md px-3 py-2"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <select
                  className="border rounded-md px-3 py-2"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="">All Types</option>
                  <option value="medical_record">Medical Records</option>
                  <option value="lab_result">Lab Results</option>
                  <option value="imaging">Imaging</option>
                  <option value="consent_form">Consent Forms</option>
                  <option value="insurance">Insurance</option>
                </select>
              </div>
            </div>

            <div className="p-4">
              {loading ? (
                <div className="text-center py-8 text-gray-500">Loading documents...</div>
              ) : documents.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No documents found</div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="border rounded-lg p-4 hover:bg-gray-50 flex items-start justify-between"
                    >
                      <div className="flex items-start gap-3 flex-1">
                        <span className="text-3xl">{FileIcon({ mimeType: doc.mimeType })}</span>
                        <div className="flex-1">
                          <div className="font-medium">{doc.name}</div>
                          <div className="text-sm text-gray-600 mt-1">
                            {doc.description}
                          </div>
                          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                            <span>{formatFileSize(doc.size)}</span>
                            <span>•</span>
                            <TypeBadge type={doc.mimeType} />
                            <span>•</span>
                            <span>v{doc.version}</span>
                            <span>•</span>
                            <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                          </div>
                          {doc.tags && doc.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {doc.tags.map((tag, idx) => (
                                <span key={idx} className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => documentsApi.download(doc.id)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Download
                        </button>
                        <button
                          onClick={() => {
                            setSelectedDocument(doc);
                            setShowShareModal(true);
                          }}
                          className="text-green-600 hover:text-green-800 text-sm"
                        >
                          Share
                        </button>
                        <button
                          onClick={() => {
                            setSelectedDocument(doc);
                            setShowPermissionsModal(true);
                          }}
                          className="text-purple-600 hover:text-purple-800 text-sm"
                        >
                          Permissions
                        </button>
                        <button
                          onClick={() => handleDelete(doc.id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showUploadModal && <UploadModal />}

      {showFolderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Create Folder</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Folder Name</label>
                <input
                  type="text"
                  className="w-full border rounded-md px-3 py-2"
                  placeholder="Enter folder name"
                  id="folderName"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Parent Folder (Optional)</label>
                <select className="w-full border rounded-md px-3 py-2" id="parentFolder">
                  <option value="">Root</option>
                  {folders.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowFolderModal(false)}
                className="px-4 py-2 border rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const name = (document.getElementById('folderName') as HTMLInputElement).value;
                  const parentId = (document.getElementById('parentFolder') as HTMLSelectElement).value;
                  if (name) handleCreateFolder({ name, parentId: parentId || undefined });
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {showShareModal && selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Share: {selectedDocument.name}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Expiration (hours)</label>
                <input
                  type="number"
                  className="w-full border rounded-md px-3 py-2"
                  placeholder="24"
                  defaultValue="24"
                  id="shareExpiration"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Password (Optional)</label>
                <input
                  type="password"
                  className="w-full border rounded-md px-3 py-2"
                  placeholder="Leave blank for no password"
                  id="sharePassword"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowShareModal(false)}
                className="px-4 py-2 border rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const expiration = parseInt((document.getElementById('shareExpiration') as HTMLInputElement).value);
                  const password = (document.getElementById('sharePassword') as HTMLInputElement).value;
                  handleCreateShareLink(selectedDocument.id, {
                    expiresInHours: expiration,
                    password: password || undefined,
                  });
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Create Share Link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentsPage;
