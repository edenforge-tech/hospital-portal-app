// Advanced Document Sharing API
// Secure document management with HIPAA compliance, version control, and digital signatures

import axios, { AxiosResponse } from 'axios';
import { getApi } from '../api';

// ===== CORE DOCUMENT INTERFACES =====

export interface Document {
  id: string;
  tenantId: string;
  
  // Basic Information
  fileName: string;
  originalFileName: string;
  fileSize: number;
  mimeType: string;
  fileExtension: string;
  storageUrl: string;
  thumbnailUrl?: string;
  previewUrl?: string;
  
  // Document Metadata
  title: string;
  description?: string;
  category: DocumentCategory;
  tags: string[];
  documentType: DocumentType;
  version: string;
  parentDocumentId?: string; // For version tracking
  isLatestVersion: boolean;
  
  // Content & Security
  isEncrypted: boolean;
  encryptionMethod?: string;
  checksum: string;
  digitalSignature?: DigitalSignature;
  watermark?: string;
  
  // Access Control
  accessLevel: 'Public' | 'Internal' | 'Confidential' | 'Restricted';
  ownerId: string;
  ownerType: 'User' | 'Department' | 'Organization';
  permissions: DocumentPermission[];
  sharedWith: DocumentShare[];
  
  // Patient Integration
  patientId?: string;
  appointmentId?: string;
  relatedDocuments: string[];
  medicalRecordCategory?: MedicalRecordCategory;
  
  // Compliance & Auditing
  retentionPolicy: {
    retentionPeriod: number; // years
    autoDelete: boolean;
    legalHold: boolean;
    complianceStandards: ('HIPAA' | 'SOC2' | 'GDPR')[];
  };
  auditTrail: DocumentAudit[];
  
  // Status & Lifecycle
  status: 'Draft' | 'Review' | 'Approved' | 'Published' | 'Archived' | 'Expired' | 'Deleted';
  expirationDate?: string;
  publishedDate?: string;
  approvedBy?: string;
  approvedAt?: string;
  
  // System Fields
  createdAt: string;
  updatedAt: string;
  createdByUserId: string;
  updatedByUserId: string;
  deletedAt?: string;
}

export interface DocumentCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  parentCategoryId?: string;
  allowedFileTypes: string[];
  maxFileSize: number;
  retentionYears: number;
  requiresApproval: boolean;
  requiresSignature: boolean;
}

export interface DocumentType {
  id: string;
  name: string;
  description: string;
  category: string;
  template?: string;
  requiredFields: DocumentField[];
  workflow?: WorkflowStep[];
  isSystemType: boolean;
}

export interface DocumentField {
  name: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'select' | 'file';
  label: string;
  required: boolean;
  options?: string[];
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    min?: number;
    max?: number;
  };
}

export interface DocumentPermission {
  id: string;
  subjectId: string;
  subjectType: 'User' | 'Role' | 'Department' | 'Group';
  permissionType: 'View' | 'Edit' | 'Delete' | 'Share' | 'Download' | 'Print' | 'Annotate' | 'Sign';
  granted: boolean;
  grantedBy: string;
  grantedAt: string;
  expiresAt?: string;
  conditions?: Record<string, any>;
}

export interface DocumentShare {
  id: string;
  sharedWithId: string;
  sharedWithType: 'User' | 'External' | 'Patient' | 'Provider';
  sharedWithEmail?: string;
  shareLink?: string;
  accessLevel: 'View' | 'Comment' | 'Edit';
  expiresAt?: string;
  requiresAuthentication: boolean;
  passwordProtected: boolean;
  downloadAllowed: boolean;
  printAllowed: boolean;
  watermarkRequired: boolean;
  trackAccess: boolean;
  accessCount: number;
  lastAccessedAt?: string;
  sharedBy: string;
  sharedAt: string;
}

export interface DigitalSignature {
  id: string;
  signerId: string;
  signerName: string;
  signerEmail: string;
  signatureMethod: 'Electronic' | 'Digital' | 'Biometric';
  signatureData: string; // Base64 encoded signature
  certificateInfo?: {
    issuer: string;
    subject: string;
    serialNumber: string;
    validFrom: string;
    validTo: string;
  };
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  isValid: boolean;
  verificationCode?: string;
}

export interface DocumentAudit {
  id: string;
  action: 'Created' | 'Viewed' | 'Downloaded' | 'Edited' | 'Shared' | 'Signed' | 'Deleted' | 'Restored' | 'Expired';
  userId: string;
  userName: string;
  userRole: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  details: Record<string, any>;
  complianceNote?: string;
}

export interface DocumentVersion {
  id: string;
  documentId: string;
  version: string;
  fileName: string;
  fileSize: number;
  storageUrl: string;
  checksum: string;
  changes: string;
  createdBy: string;
  createdAt: string;
  isActive: boolean;
}

export interface DocumentTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  templateData: string; // JSON or HTML template
  variables: TemplateVariable[];
  previewUrl?: string;
  isSystem: boolean;
  usage: 'Form' | 'Letter' | 'Report' | 'Certificate' | 'Consent';
}

export interface TemplateVariable {
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'select';
  defaultValue?: any;
  required: boolean;
  options?: string[];
}

export interface DocumentFolder {
  id: string;
  name: string;
  description?: string;
  parentFolderId?: string;
  path: string;
  permissions: DocumentPermission[];
  documentCount: number;
  totalSize: number;
  color?: string;
  icon?: string;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentWorkflow {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  currentStepId?: string;
  status: 'Pending' | 'InProgress' | 'Completed' | 'Rejected' | 'Cancelled';
  initiatedBy: string;
  initiatedAt: string;
  completedAt?: string;
}

export interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  type: 'Approval' | 'Review' | 'Signature' | 'Notification' | 'Assignment';
  assignedTo: string;
  assignedToType: 'User' | 'Role' | 'Department';
  dueDate?: string;
  status: 'Pending' | 'InProgress' | 'Completed' | 'Skipped';
  completedBy?: string;
  completedAt?: string;
  comments?: string;
  requiredActions: string[];
}

export type MedicalRecordCategory = 
  | 'LabResults' 
  | 'ImagingStudy' 
  | 'Prescription' 
  | 'ProgressNote' 
  | 'ConsentForm' 
  | 'InsuranceDocument' 
  | 'ReferralLetter' 
  | 'DischargeInstructions'
  | 'VaccineRecord'
  | 'AllergyRecord'
  | 'SurgicalReport'
  | 'PathologyReport';

// ===== API REQUEST/RESPONSE TYPES =====

export interface UploadDocumentRequest {
  file: File;
  title: string;
  description?: string;
  categoryId: string;
  documentTypeId?: string;
  tags?: string[];
  patientId?: string;
  appointmentId?: string;
  accessLevel: 'Public' | 'Internal' | 'Confidential' | 'Restricted';
  permissions?: Omit<DocumentPermission, 'id' | 'grantedBy' | 'grantedAt'>[];
  metadata?: Record<string, any>;
  folderId?: string;
  templateId?: string;
  templateData?: Record<string, any>;
  workflowId?: string;
}

export interface BulkUploadRequest {
  files: File[];
  defaultCategoryId: string;
  defaultFolderId?: string;
  defaultAccessLevel: string;
  applyToAll: {
    tags?: string[];
    permissions?: Omit<DocumentPermission, 'id' | 'grantedBy' | 'grantedAt'>[];
    workflowId?: string;
  };
}

export interface ShareDocumentRequest {
  documentId: string;
  sharedWithId?: string;
  sharedWithEmail?: string;
  sharedWithType: 'User' | 'External' | 'Patient' | 'Provider';
  accessLevel: 'View' | 'Comment' | 'Edit';
  expiresAt?: string;
  requiresAuthentication: boolean;
  passwordProtected: boolean;
  password?: string;
  message?: string;
  allowDownload: boolean;
  allowPrint: boolean;
  trackAccess: boolean;
}

export interface SignDocumentRequest {
  documentId: string;
  signatureMethod: 'Electronic' | 'Digital' | 'Biometric';
  signatureData: string;
  certificateData?: string;
  reason?: string;
  location?: string;
}

export interface SearchDocumentsRequest {
  query?: string;
  filters?: {
    categoryId?: string;
    documentType?: string;
    patientId?: string;
    ownerId?: string;
    tags?: string[];
    accessLevel?: string[];
    status?: string[];
    dateRange?: {
      startDate: string;
      endDate: string;
      field: 'createdAt' | 'updatedAt' | 'publishedDate' | 'expirationDate';
    };
    fileTypes?: string[];
    hasSignature?: boolean;
    requiresApproval?: boolean;
    folderId?: string;
  };
  sort?: {
    field: 'createdAt' | 'updatedAt' | 'fileName' | 'fileSize' | 'accessLevel';
    direction: 'asc' | 'desc';
  };
  pagination?: {
    page: number;
    size: number;
  };
}

export interface SearchDocumentsResponse {
  documents: Document[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  filters: SearchDocumentsRequest['filters'];
  facets: {
    categories: { id: string; name: string; count: number; }[];
    documentTypes: { type: string; count: number; }[];
    owners: { id: string; name: string; count: number; }[];
    tags: { tag: string; count: number; }[];
    accessLevels: { level: string; count: number; }[];
  };
}

export interface DocumentAnalytics {
  usage: {
    totalDocuments: number;
    totalSize: number;
    documentsThisMonth: number;
    downloadsThisMonth: number;
    sharesThisMonth: number;
    signaturesThisMonth: number;
  };
  byCategory: {
    categoryId: string;
    categoryName: string;
    count: number;
    size: number;
  }[];
  byUser: {
    userId: string;
    userName: string;
    documentsCreated: number;
    documentsAccessed: number;
    lastActivity: string;
  }[];
  compliance: {
    documentsNearExpiry: number;
    documentsRequiringApproval: number;
    documentsWithoutSignature: number;
    complianceScore: number;
    issues: string[];
  };
  storage: {
    totalUsed: number;
    totalCapacity: number;
    utilizationPercentage: number;
    projectedUsage: number;
    storageByType: { type: string; size: number; }[];
  };
}

// ===== DOCUMENT MANAGEMENT API CLASS =====

export class DocumentSharingApi {
  private api = getApi();

  // ===== DOCUMENT CRUD OPERATIONS =====

  async getDocuments(request?: SearchDocumentsRequest): Promise<SearchDocumentsResponse> {
    const response: AxiosResponse<SearchDocumentsResponse> = 
      await this.api.post('/documents/search', request || {});
    return response.data;
  }

  async getDocument(id: string): Promise<Document> {
    const response: AxiosResponse<Document> = 
      await this.api.get(`/documents/${id}`);
    return response.data;
  }

  async uploadDocument(request: UploadDocumentRequest): Promise<Document> {
    const formData = new FormData();
    formData.append('file', request.file);
    formData.append('title', request.title);
    if (request.description) formData.append('description', request.description);
    formData.append('categoryId', request.categoryId);
    if (request.documentTypeId) formData.append('documentTypeId', request.documentTypeId);
    if (request.tags) formData.append('tags', JSON.stringify(request.tags));
    if (request.patientId) formData.append('patientId', request.patientId);
    if (request.appointmentId) formData.append('appointmentId', request.appointmentId);
    formData.append('accessLevel', request.accessLevel);
    if (request.permissions) formData.append('permissions', JSON.stringify(request.permissions));
    if (request.metadata) formData.append('metadata', JSON.stringify(request.metadata));
    if (request.folderId) formData.append('folderId', request.folderId);
    if (request.templateId) formData.append('templateId', request.templateId);
    if (request.templateData) formData.append('templateData', JSON.stringify(request.templateData));
    if (request.workflowId) formData.append('workflowId', request.workflowId);

    const response: AxiosResponse<Document> = await this.api.post('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }

  async bulkUpload(request: BulkUploadRequest): Promise<{ documents: Document[], errors: any[] }> {
    const formData = new FormData();
    request.files.forEach(file => formData.append('files', file));
    formData.append('defaultCategoryId', request.defaultCategoryId);
    if (request.defaultFolderId) formData.append('defaultFolderId', request.defaultFolderId);
    formData.append('defaultAccessLevel', request.defaultAccessLevel);
    formData.append('applyToAll', JSON.stringify(request.applyToAll));

    const response: AxiosResponse<{ documents: Document[], errors: any[] }> = 
      await this.api.post('/documents/bulk-upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    return response.data;
  }

  async updateDocument(id: string, updates: Partial<Document>): Promise<Document> {
    const response: AxiosResponse<Document> = 
      await this.api.put(`/documents/${id}`, updates);
    return response.data;
  }

  async deleteDocument(id: string, permanent: boolean = false): Promise<void> {
    await this.api.delete(`/documents/${id}`, { params: { permanent } });
  }

  async restoreDocument(id: string): Promise<Document> {
    const response: AxiosResponse<Document> = 
      await this.api.post(`/documents/${id}/restore`);
    return response.data;
  }

  // ===== DOCUMENT SHARING =====

  async shareDocument(request: ShareDocumentRequest): Promise<DocumentShare> {
    const response: AxiosResponse<DocumentShare> = 
      await this.api.post('/documents/share', request);
    return response.data;
  }

  async getSharedDocuments(documentId?: string): Promise<DocumentShare[]> {
    const response: AxiosResponse<DocumentShare[]> = 
      await this.api.get('/documents/shares', { params: { documentId } });
    return response.data;
  }

  async revokeShare(shareId: string): Promise<void> {
    await this.api.delete(`/documents/shares/${shareId}`);
  }

  async getSharedDocument(shareId: string, password?: string): Promise<Document> {
    const response: AxiosResponse<Document> = 
      await this.api.get(`/documents/shares/${shareId}/document`, {
        params: { password }
      });
    return response.data;
  }

  // ===== VERSION CONTROL =====

  async getDocumentVersions(documentId: string): Promise<DocumentVersion[]> {
    const response: AxiosResponse<DocumentVersion[]> = 
      await this.api.get(`/documents/${documentId}/versions`);
    return response.data;
  }

  async uploadNewVersion(documentId: string, file: File, changes: string): Promise<DocumentVersion> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('changes', changes);

    const response: AxiosResponse<DocumentVersion> = 
      await this.api.post(`/documents/${documentId}/versions`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    return response.data;
  }

  async revertToVersion(documentId: string, versionId: string): Promise<Document> {
    const response: AxiosResponse<Document> = 
      await this.api.post(`/documents/${documentId}/versions/${versionId}/revert`);
    return response.data;
  }

  async compareVersions(documentId: string, version1: string, version2: string): Promise<{ differences: string[], summary: string }> {
    const response: AxiosResponse<{ differences: string[], summary: string }> = 
      await this.api.get(`/documents/${documentId}/versions/compare`, {
        params: { version1, version2 }
      });
    return response.data;
  }

  // ===== DIGITAL SIGNATURES =====

  async signDocument(request: SignDocumentRequest): Promise<DigitalSignature> {
    const response: AxiosResponse<DigitalSignature> = 
      await this.api.post('/documents/sign', request);
    return response.data;
  }

  async getDocumentSignatures(documentId: string): Promise<DigitalSignature[]> {
    const response: AxiosResponse<DigitalSignature[]> = 
      await this.api.get(`/documents/${documentId}/signatures`);
    return response.data;
  }

  async verifySignature(signatureId: string): Promise<{ isValid: boolean; details: any }> {
    const response: AxiosResponse<{ isValid: boolean; details: any }> = 
      await this.api.post(`/documents/signatures/${signatureId}/verify`);
    return response.data;
  }

  async requestSignature(documentId: string, signerEmail: string, message?: string): Promise<{ requestId: string; expiresAt: string }> {
    const response: AxiosResponse<{ requestId: string; expiresAt: string }> = 
      await this.api.post(`/documents/${documentId}/signature-request`, {
        signerEmail, message
      });
    return response.data;
  }

  // ===== DOCUMENT CATEGORIES & TYPES =====

  async getCategories(): Promise<DocumentCategory[]> {
    const response: AxiosResponse<DocumentCategory[]> = 
      await this.api.get('/documents/categories');
    return response.data;
  }

  async createCategory(category: Omit<DocumentCategory, 'id'>): Promise<DocumentCategory> {
    const response: AxiosResponse<DocumentCategory> = 
      await this.api.post('/documents/categories', category);
    return response.data;
  }

  async getDocumentTypes(categoryId?: string): Promise<DocumentType[]> {
    const response: AxiosResponse<DocumentType[]> = 
      await this.api.get('/documents/types', { params: { categoryId } });
    return response.data;
  }

  // ===== FOLDERS =====

  async getFolders(parentId?: string): Promise<DocumentFolder[]> {
    const response: AxiosResponse<DocumentFolder[]> = 
      await this.api.get('/documents/folders', { params: { parentId } });
    return response.data;
  }

  async createFolder(folder: Omit<DocumentFolder, 'id' | 'documentCount' | 'totalSize' | 'createdAt' | 'updatedAt'>): Promise<DocumentFolder> {
    const response: AxiosResponse<DocumentFolder> = 
      await this.api.post('/documents/folders', folder);
    return response.data;
  }

  async moveDocument(documentId: string, folderId: string): Promise<void> {
    await this.api.put(`/documents/${documentId}/move`, { folderId });
  }

  // ===== TEMPLATES =====

  async getTemplates(category?: string): Promise<DocumentTemplate[]> {
    const response: AxiosResponse<DocumentTemplate[]> = 
      await this.api.get('/documents/templates', { params: { category } });
    return response.data;
  }

  async createDocumentFromTemplate(templateId: string, data: Record<string, any>): Promise<Document> {
    const response: AxiosResponse<Document> = 
      await this.api.post(`/documents/templates/${templateId}/create`, data);
    return response.data;
  }

  // ===== WORKFLOWS =====

  async getWorkflows(): Promise<DocumentWorkflow[]> {
    const response: AxiosResponse<DocumentWorkflow[]> = 
      await this.api.get('/documents/workflows');
    return response.data;
  }

  async startWorkflow(documentId: string, workflowId: string): Promise<DocumentWorkflow> {
    const response: AxiosResponse<DocumentWorkflow> = 
      await this.api.post(`/documents/${documentId}/workflow`, { workflowId });
    return response.data;
  }

  async approveWorkflowStep(workflowId: string, stepId: string, comments?: string): Promise<WorkflowStep> {
    const response: AxiosResponse<WorkflowStep> = 
      await this.api.post(`/documents/workflows/${workflowId}/steps/${stepId}/approve`, {
        comments
      });
    return response.data;
  }

  async rejectWorkflowStep(workflowId: string, stepId: string, reason: string): Promise<WorkflowStep> {
    const response: AxiosResponse<WorkflowStep> = 
      await this.api.post(`/documents/workflows/${workflowId}/steps/${stepId}/reject`, {
        reason
      });
    return response.data;
  }

  // ===== ANALYTICS & REPORTING =====

  async getDocumentAnalytics(timeRange?: string): Promise<DocumentAnalytics> {
    const response: AxiosResponse<DocumentAnalytics> = 
      await this.api.get('/documents/analytics', { params: { timeRange } });
    return response.data;
  }

  async getAuditTrail(documentId?: string, userId?: string): Promise<DocumentAudit[]> {
    const response: AxiosResponse<DocumentAudit[]> = 
      await this.api.get('/documents/audit-trail', {
        params: { documentId, userId }
      });
    return response.data;
  }

  async exportDocuments(documentIds: string[], format: 'zip' | 'pdf'): Promise<Blob> {
    const response: AxiosResponse<Blob> = await this.api.post('/documents/export', {
      documentIds, format
    }, { responseType: 'blob' });
    return response.data;
  }

  // ===== COMPLIANCE & SECURITY =====

  async scanDocumentForCompliance(documentId: string): Promise<{ compliant: boolean; issues: string[]; recommendations: string[] }> {
    const response: AxiosResponse<{ compliant: boolean; issues: string[]; recommendations: string[] }> = 
      await this.api.post(`/documents/${documentId}/compliance-scan`);
    return response.data;
  }

  async getExpiringDocuments(days: number = 30): Promise<Document[]> {
    const response: AxiosResponse<Document[]> = 
      await this.api.get('/documents/expiring', { params: { days } });
    return response.data;
  }

  async applyRetentionPolicy(documentIds: string[], policyId: string): Promise<{ applied: number; errors: any[] }> {
    const response: AxiosResponse<{ applied: number; errors: any[] }> = 
      await this.api.post('/documents/retention-policy', { documentIds, policyId });
    return response.data;
  }
}

// Export singleton instance
export const documentSharingApi = new DocumentSharingApi();