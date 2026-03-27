import { getApi } from '../api';

// ============================================================================
// Types
// ============================================================================

export interface Document {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  type: DocumentType;
  category: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  folderId?: string;
  folder?: DocumentFolder;
  entityType?: 'patient' | 'appointment' | 'organization' | 'employee' | 'department';
  entityId?: string;
  tags: string[];
  metadata: Record<string, any>;
  version: number;
  isLatestVersion: boolean;
  previousVersionId?: string;
  accessLevel: 'private' | 'internal' | 'public';
  permissions: DocumentPermission[];
  uploadedById: string;
  uploadedBy: { id: string; name: string };
  status: 'active' | 'archived' | 'deleted';
  expirationDate?: string;
  retentionPolicy?: string;
  createdAt: string;
  updatedAt: string;
}

export type DocumentType = 
  | 'medical_record'
  | 'lab_report'
  | 'imaging'
  | 'prescription'
  | 'consent_form'
  | 'insurance'
  | 'identification'
  | 'contract'
  | 'policy'
  | 'certificate'
  | 'correspondence'
  | 'report'
  | 'other';

export interface DocumentFolder {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  parentFolderId?: string;
  parentFolder?: DocumentFolder;
  path: string;
  color?: string;
  icon?: string;
  documentCount: number;
  subfolderCount: number;
  accessLevel: 'private' | 'internal' | 'public';
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentPermission {
  id: string;
  documentId: string;
  principalType: 'user' | 'role' | 'department';
  principalId: string;
  principalName: string;
  permission: 'view' | 'edit' | 'delete' | 'share' | 'admin';
  grantedById: string;
  grantedAt: string;
  expiresAt?: string;
}

export interface DocumentVersion {
  id: string;
  documentId: string;
  version: number;
  name: string;
  size: number;
  url: string;
  changes?: string;
  uploadedById: string;
  uploadedBy: { id: string; name: string };
  createdAt: string;
}

export interface DocumentShareLink {
  id: string;
  documentId: string;
  token: string;
  url: string;
  accessType: 'view' | 'download';
  password?: string;
  expiresAt?: string;
  maxAccesses?: number;
  accessCount: number;
  createdById: string;
  createdAt: string;
}

export interface UploadDocumentRequest {
  file: File;
  name?: string;
  description?: string;
  type: DocumentType;
  category?: string;
  folderId?: string;
  entityType?: Document['entityType'];
  entityId?: string;
  tags?: string[];
  accessLevel?: Document['accessLevel'];
  metadata?: Record<string, any>;
}

export interface DocumentListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  type?: string;
  category?: string;
  folderId?: string;
  entityType?: string;
  entityId?: string;
  tags?: string[];
  accessLevel?: string;
  status?: string;
  uploadedById?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ============================================================================
// Documents API
// ============================================================================

export const documentsApi = {
  list: async (params?: DocumentListParams): Promise<PaginatedResponse<Document>> => {
    const api = getApi();
    const response = await api.get('/documents', { params });
    return response.data;
  },

  get: async (id: string): Promise<Document> => {
    const api = getApi();
    const response = await api.get(`/documents/${id}`);
    return response.data;
  },

  upload: async (data: UploadDocumentRequest, onProgress?: (percent: number) => void): Promise<Document> => {
    const api = getApi();
    const formData = new FormData();
    formData.append('file', data.file);
    if (data.name) formData.append('name', data.name);
    if (data.description) formData.append('description', data.description);
    formData.append('type', data.type);
    if (data.category) formData.append('category', data.category);
    if (data.folderId) formData.append('folderId', data.folderId);
    if (data.entityType) formData.append('entityType', data.entityType);
    if (data.entityId) formData.append('entityId', data.entityId);
    if (data.tags) formData.append('tags', JSON.stringify(data.tags));
    if (data.accessLevel) formData.append('accessLevel', data.accessLevel);
    if (data.metadata) formData.append('metadata', JSON.stringify(data.metadata));

    const response = await api.post('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      },
    });
    return response.data;
  },

  uploadMultiple: async (files: File[], folderId?: string): Promise<Document[]> => {
    const api = getApi();
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    if (folderId) formData.append('folderId', folderId);

    const response = await api.post('/documents/upload-multiple', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  update: async (id: string, data: Partial<Document>): Promise<Document> => {
    const api = getApi();
    const response = await api.put(`/documents/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    const api = getApi();
    await api.delete(`/documents/${id}`);
  },

  archive: async (id: string): Promise<Document> => {
    const api = getApi();
    const response = await api.post(`/documents/${id}/archive`);
    return response.data;
  },

  restore: async (id: string): Promise<Document> => {
    const api = getApi();
    const response = await api.post(`/documents/${id}/restore`);
    return response.data;
  },

  download: async (id: string): Promise<Blob> => {
    const api = getApi();
    const response = await api.get(`/documents/${id}/download`, { responseType: 'blob' });
    return response.data;
  },

  getPreviewUrl: async (id: string): Promise<string> => {
    const api = getApi();
    const response = await api.get(`/documents/${id}/preview-url`);
    return response.data.url;
  },

  move: async (id: string, targetFolderId: string | null): Promise<Document> => {
    const api = getApi();
    const response = await api.post(`/documents/${id}/move`, { targetFolderId });
    return response.data;
  },

  copy: async (id: string, targetFolderId: string | null): Promise<Document> => {
    const api = getApi();
    const response = await api.post(`/documents/${id}/copy`, { targetFolderId });
    return response.data;
  },

  getVersions: async (id: string): Promise<DocumentVersion[]> => {
    const api = getApi();
    const response = await api.get(`/documents/${id}/versions`);
    return response.data;
  },

  uploadNewVersion: async (id: string, file: File, changes?: string): Promise<Document> => {
    const api = getApi();
    const formData = new FormData();
    formData.append('file', file);
    if (changes) formData.append('changes', changes);

    const response = await api.post(`/documents/${id}/versions`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  revertToVersion: async (id: string, versionId: string): Promise<Document> => {
    const api = getApi();
    const response = await api.post(`/documents/${id}/versions/${versionId}/revert`);
    return response.data;
  },

  search: async (query: string, params?: DocumentListParams): Promise<PaginatedResponse<Document>> => {
    const api = getApi();
    const response = await api.get('/documents/search', { params: { query, ...params } });
    return response.data;
  },

  getByEntity: async (entityType: string, entityId: string): Promise<Document[]> => {
    const api = getApi();
    const response = await api.get(`/documents/entity/${entityType}/${entityId}`);
    return response.data;
  },

  bulkDelete: async (ids: string[]): Promise<void> => {
    const api = getApi();
    await api.post('/documents/bulk-delete', { ids });
  },

  bulkMove: async (ids: string[], targetFolderId: string | null): Promise<void> => {
    const api = getApi();
    await api.post('/documents/bulk-move', { ids, targetFolderId });
  },

  bulkArchive: async (ids: string[]): Promise<void> => {
    const api = getApi();
    await api.post('/documents/bulk-archive', { ids });
  },
};

// ============================================================================
// Folders API
// ============================================================================

export const foldersApi = {
  list: async (parentFolderId?: string): Promise<DocumentFolder[]> => {
    const api = getApi();
    const response = await api.get('/documents/folders', { params: { parentFolderId } });
    return response.data;
  },

  get: async (id: string): Promise<DocumentFolder> => {
    const api = getApi();
    const response = await api.get(`/documents/folders/${id}`);
    return response.data;
  },

  create: async (data: { name: string; description?: string; parentFolderId?: string; color?: string }): Promise<DocumentFolder> => {
    const api = getApi();
    const response = await api.post('/documents/folders', data);
    return response.data;
  },

  update: async (id: string, data: Partial<DocumentFolder>): Promise<DocumentFolder> => {
    const api = getApi();
    const response = await api.put(`/documents/folders/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    const api = getApi();
    await api.delete(`/documents/folders/${id}`);
  },

  move: async (id: string, targetParentId: string | null): Promise<DocumentFolder> => {
    const api = getApi();
    const response = await api.post(`/documents/folders/${id}/move`, { targetParentId });
    return response.data;
  },

  getTree: async (): Promise<DocumentFolder[]> => {
    const api = getApi();
    const response = await api.get('/documents/folders/tree');
    return response.data;
  },

  getContents: async (id: string): Promise<{ folders: DocumentFolder[]; documents: Document[] }> => {
    const api = getApi();
    const response = await api.get(`/documents/folders/${id}/contents`);
    return response.data;
  },
};

// ============================================================================
// Permissions API
// ============================================================================

export const documentPermissionsApi = {
  list: async (documentId: string): Promise<DocumentPermission[]> => {
    const api = getApi();
    const response = await api.get(`/documents/${documentId}/permissions`);
    return response.data;
  },

  grant: async (documentId: string, data: Omit<DocumentPermission, 'id' | 'documentId' | 'principalName' | 'grantedById' | 'grantedAt'>): Promise<DocumentPermission> => {
    const api = getApi();
    const response = await api.post(`/documents/${documentId}/permissions`, data);
    return response.data;
  },

  revoke: async (documentId: string, permissionId: string): Promise<void> => {
    const api = getApi();
    await api.delete(`/documents/${documentId}/permissions/${permissionId}`);
  },

  update: async (documentId: string, permissionId: string, permission: DocumentPermission['permission']): Promise<DocumentPermission> => {
    const api = getApi();
    const response = await api.patch(`/documents/${documentId}/permissions/${permissionId}`, { permission });
    return response.data;
  },
};

// ============================================================================
// Share Links API
// ============================================================================

export const shareLinksApi = {
  list: async (documentId: string): Promise<DocumentShareLink[]> => {
    const api = getApi();
    const response = await api.get(`/documents/${documentId}/share-links`);
    return response.data;
  },

  create: async (documentId: string, data: { accessType: 'view' | 'download'; password?: string; expiresAt?: string; maxAccesses?: number }): Promise<DocumentShareLink> => {
    const api = getApi();
    const response = await api.post(`/documents/${documentId}/share-links`, data);
    return response.data;
  },

  revoke: async (documentId: string, linkId: string): Promise<void> => {
    const api = getApi();
    await api.delete(`/documents/${documentId}/share-links/${linkId}`);
  },

  access: async (token: string, password?: string): Promise<{ document: Document; downloadUrl: string }> => {
    const api = getApi();
    const response = await api.post(`/documents/share/${token}`, { password });
    return response.data;
  },
};
