/**
 * Bulk Operations API Service
 * Mass data processing, batch updates, import/export operations
 */

import { getApi } from '../api';

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface BulkOperation {
  id: string;
  tenantId: string;
  name: string;
  type: BulkOperationType;
  status: BulkOperationStatus;
  entityType: EntityType;
  totalRecords: number;
  processedRecords: number;
  successCount: number;
  errorCount: number;
  skippedCount: number;
  progress: number;
  startedAt?: string;
  completedAt?: string;
  estimatedCompletion?: string;
  createdById: string;
  createdByName: string;
  configuration: BulkOperationConfig;
  errors?: BulkOperationError[];
  summary?: BulkOperationSummary;
  createdAt: string;
  updatedAt: string;
}

export type BulkOperationType = 
  | 'import'
  | 'export'
  | 'update'
  | 'delete'
  | 'archive'
  | 'restore'
  | 'merge'
  | 'split'
  | 'transform'
  | 'validate'
  | 'sync';

export type BulkOperationStatus = 
  | 'pending'
  | 'queued'
  | 'processing'
  | 'paused'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'partially_completed';

export type EntityType =
  | 'patients'
  | 'appointments'
  | 'users'
  | 'departments'
  | 'inventory'
  | 'invoices'
  | 'claims'
  | 'documents'
  | 'medical_records'
  | 'prescriptions'
  | 'lab_results'
  | 'staff_schedules';

export interface BulkOperationConfig {
  sourceFormat?: 'csv' | 'xlsx' | 'json' | 'xml';
  targetFormat?: 'csv' | 'xlsx' | 'json' | 'xml' | 'pdf';
  fieldMappings?: FieldMapping[];
  filters?: BulkFilter[];
  transformations?: DataTransformation[];
  validationRules?: ValidationRule[];
  updateFields?: string[];
  mergeStrategy?: 'overwrite' | 'skip_existing' | 'merge_fields';
  batchSize?: number;
  continueOnError?: boolean;
  notifyOnComplete?: boolean;
  scheduleAt?: string;
}

export interface FieldMapping {
  sourceField: string;
  targetField: string;
  transformation?: string;
  defaultValue?: string;
  required?: boolean;
}

export interface BulkFilter {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'starts_with' | 'ends_with' | 'greater_than' | 'less_than' | 'in' | 'not_in' | 'is_null' | 'is_not_null';
  value: string | string[] | number | boolean | null;
}

export interface DataTransformation {
  field: string;
  type: 'uppercase' | 'lowercase' | 'trim' | 'date_format' | 'number_format' | 'custom';
  params?: Record<string, string>;
}

export interface ValidationRule {
  field: string;
  rule: 'required' | 'email' | 'phone' | 'date' | 'number' | 'regex' | 'unique' | 'exists';
  params?: Record<string, string>;
  message?: string;
}

export interface BulkOperationError {
  rowNumber: number;
  field?: string;
  value?: string;
  errorCode: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

export interface BulkOperationSummary {
  totalProcessed: number;
  successful: number;
  failed: number;
  skipped: number;
  duration: number;
  averageProcessingTime: number;
  errorsByType: Record<string, number>;
  warningsByType: Record<string, number>;
}

export interface ImportPreview {
  headers: string[];
  sampleRows: Record<string, string>[];
  totalRows: number;
  detectedFormat: string;
  suggestedMappings: FieldMapping[];
  validationIssues: BulkOperationError[];
}

export interface ExportConfig {
  entityType: EntityType;
  format: 'csv' | 'xlsx' | 'json' | 'xml' | 'pdf';
  fields: string[];
  filters?: BulkFilter[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  includeHeaders?: boolean;
  dateRange?: {
    startDate: string;
    endDate: string;
  };
}

export interface BulkTemplate {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  entityType: EntityType;
  operationType: BulkOperationType;
  configuration: BulkOperationConfig;
  isDefault: boolean;
  usageCount: number;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface ScheduledOperation {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  templateId?: string;
  operationType: BulkOperationType;
  entityType: EntityType;
  configuration: BulkOperationConfig;
  schedule: ScheduleConfig;
  isActive: boolean;
  lastRunAt?: string;
  nextRunAt?: string;
  lastRunStatus?: BulkOperationStatus;
  runCount: number;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface ScheduleConfig {
  frequency: 'once' | 'daily' | 'weekly' | 'monthly' | 'custom';
  startDate: string;
  endDate?: string;
  time: string;
  timezone: string;
  daysOfWeek?: number[];
  dayOfMonth?: number;
  cronExpression?: string;
}

export interface BulkOperationRequest {
  name: string;
  type: BulkOperationType;
  entityType: EntityType;
  configuration: BulkOperationConfig;
  fileId?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface BulkOperationFilters {
  type?: BulkOperationType;
  status?: BulkOperationStatus;
  entityType?: EntityType;
  startDate?: string;
  endDate?: string;
  createdById?: string;
}

// ============================================================================
// API Functions
// ============================================================================

export const bulkOperationsApi = {
  // List operations with filters
  list: async (
    page = 1,
    pageSize = 20,
    filters?: BulkOperationFilters
  ): Promise<PaginatedResponse<BulkOperation>> => {
    const api = getApi();
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
      ...(filters?.type && { type: filters.type }),
      ...(filters?.status && { status: filters.status }),
      ...(filters?.entityType && { entityType: filters.entityType }),
      ...(filters?.startDate && { startDate: filters.startDate }),
      ...(filters?.endDate && { endDate: filters.endDate }),
      ...(filters?.createdById && { createdById: filters.createdById }),
    });
    const response = await api.get(`/bulk-operations?${params}`);
    return response.data;
  },

  // Get single operation
  get: async (id: string): Promise<BulkOperation> => {
    const api = getApi();
    const response = await api.get(`/bulk-operations/${id}`);
    return response.data;
  },

  // Create new operation
  create: async (data: BulkOperationRequest): Promise<BulkOperation> => {
    const api = getApi();
    const response = await api.post('/bulk-operations', data);
    return response.data;
  },

  // Start operation
  start: async (id: string): Promise<BulkOperation> => {
    const api = getApi();
    const response = await api.post(`/bulk-operations/${id}/start`);
    return response.data;
  },

  // Pause operation
  pause: async (id: string): Promise<BulkOperation> => {
    const api = getApi();
    const response = await api.post(`/bulk-operations/${id}/pause`);
    return response.data;
  },

  // Resume operation
  resume: async (id: string): Promise<BulkOperation> => {
    const api = getApi();
    const response = await api.post(`/bulk-operations/${id}/resume`);
    return response.data;
  },

  // Cancel operation
  cancel: async (id: string): Promise<BulkOperation> => {
    const api = getApi();
    const response = await api.post(`/bulk-operations/${id}/cancel`);
    return response.data;
  },

  // Retry failed operation
  retry: async (id: string): Promise<BulkOperation> => {
    const api = getApi();
    const response = await api.post(`/bulk-operations/${id}/retry`);
    return response.data;
  },

  // Get operation errors
  getErrors: async (id: string, page = 1, pageSize = 50): Promise<PaginatedResponse<BulkOperationError>> => {
    const api = getApi();
    const response = await api.get(`/bulk-operations/${id}/errors?page=${page}&pageSize=${pageSize}`);
    return response.data;
  },

  // Download operation results
  downloadResults: async (id: string, format: 'csv' | 'xlsx' | 'json' = 'csv'): Promise<Blob> => {
    const api = getApi();
    const response = await api.get(`/bulk-operations/${id}/download?format=${format}`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Download error report
  downloadErrors: async (id: string): Promise<Blob> => {
    const api = getApi();
    const response = await api.get(`/bulk-operations/${id}/errors/download`, {
      responseType: 'blob',
    });
    return response.data;
  },
};

export const importApi = {
  // Upload file for import
  uploadFile: async (file: File, entityType: EntityType): Promise<{ fileId: string; preview: ImportPreview }> => {
    const api = getApi();
    const formData = new FormData();
    formData.append('file', file);
    formData.append('entityType', entityType);
    const response = await api.post('/bulk-operations/import/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Get import preview
  preview: async (fileId: string, entityType: EntityType): Promise<ImportPreview> => {
    const api = getApi();
    const response = await api.get(`/bulk-operations/import/preview?fileId=${fileId}&entityType=${entityType}`);
    return response.data;
  },

  // Validate import data
  validate: async (fileId: string, mappings: FieldMapping[], rules: ValidationRule[]): Promise<{
    isValid: boolean;
    errors: BulkOperationError[];
    warnings: BulkOperationError[];
  }> => {
    const api = getApi();
    const response = await api.post('/bulk-operations/import/validate', {
      fileId,
      mappings,
      rules,
    });
    return response.data;
  },

  // Start import
  start: async (
    fileId: string,
    entityType: EntityType,
    config: BulkOperationConfig
  ): Promise<BulkOperation> => {
    const api = getApi();
    const response = await api.post('/bulk-operations/import/start', {
      fileId,
      entityType,
      configuration: config,
    });
    return response.data;
  },

  // Get sample file template
  getTemplate: async (entityType: EntityType, format: 'csv' | 'xlsx' = 'csv'): Promise<Blob> => {
    const api = getApi();
    const response = await api.get(`/bulk-operations/import/template?entityType=${entityType}&format=${format}`, {
      responseType: 'blob',
    });
    return response.data;
  },
};

export const exportApi = {
  // Start export
  start: async (config: ExportConfig): Promise<BulkOperation> => {
    const api = getApi();
    const response = await api.post('/bulk-operations/export/start', config);
    return response.data;
  },

  // Get available fields for export
  getFields: async (entityType: EntityType): Promise<{ field: string; label: string; type: string }[]> => {
    const api = getApi();
    const response = await api.get(`/bulk-operations/export/fields?entityType=${entityType}`);
    return response.data;
  },

  // Quick export (immediate download for small datasets)
  quickExport: async (config: ExportConfig): Promise<Blob> => {
    const api = getApi();
    const response = await api.post('/bulk-operations/export/quick', config, {
      responseType: 'blob',
    });
    return response.data;
  },
};

export const bulkUpdateApi = {
  // Preview bulk update
  preview: async (
    entityType: EntityType,
    filters: BulkFilter[],
    updates: Record<string, any>
  ): Promise<{ affectedCount: number; sampleRecords: Record<string, any>[] }> => {
    const api = getApi();
    const response = await api.post('/bulk-operations/update/preview', {
      entityType,
      filters,
      updates,
    });
    return response.data;
  },

  // Start bulk update
  start: async (
    entityType: EntityType,
    filters: BulkFilter[],
    updates: Record<string, any>,
    config?: Partial<BulkOperationConfig>
  ): Promise<BulkOperation> => {
    const api = getApi();
    const response = await api.post('/bulk-operations/update/start', {
      entityType,
      filters,
      updates,
      configuration: config,
    });
    return response.data;
  },
};

export const bulkDeleteApi = {
  // Preview bulk delete
  preview: async (
    entityType: EntityType,
    filters: BulkFilter[]
  ): Promise<{ affectedCount: number; sampleRecords: Record<string, any>[] }> => {
    const api = getApi();
    const response = await api.post('/bulk-operations/delete/preview', {
      entityType,
      filters,
    });
    return response.data;
  },

  // Start bulk delete (soft delete)
  start: async (
    entityType: EntityType,
    filters: BulkFilter[],
    hardDelete = false
  ): Promise<BulkOperation> => {
    const api = getApi();
    const response = await api.post('/bulk-operations/delete/start', {
      entityType,
      filters,
      hardDelete,
    });
    return response.data;
  },
};

export const templatesApi = {
  // List templates
  list: async (entityType?: EntityType): Promise<BulkTemplate[]> => {
    const api = getApi();
    const params = entityType ? `?entityType=${entityType}` : '';
    const response = await api.get(`/bulk-operations/templates${params}`);
    return response.data;
  },

  // Get template
  get: async (id: string): Promise<BulkTemplate> => {
    const api = getApi();
    const response = await api.get(`/bulk-operations/templates/${id}`);
    return response.data;
  },

  // Create template
  create: async (data: Omit<BulkTemplate, 'id' | 'tenantId' | 'usageCount' | 'createdById' | 'createdAt' | 'updatedAt'>): Promise<BulkTemplate> => {
    const api = getApi();
    const response = await api.post('/bulk-operations/templates', data);
    return response.data;
  },

  // Update template
  update: async (id: string, data: Partial<BulkTemplate>): Promise<BulkTemplate> => {
    const api = getApi();
    const response = await api.put(`/bulk-operations/templates/${id}`, data);
    return response.data;
  },

  // Delete template
  delete: async (id: string): Promise<void> => {
    const api = getApi();
    await api.delete(`/bulk-operations/templates/${id}`);
  },
};

export const scheduledOperationsApi = {
  // List scheduled operations
  list: async (): Promise<ScheduledOperation[]> => {
    const api = getApi();
    const response = await api.get('/bulk-operations/scheduled');
    return response.data;
  },

  // Get scheduled operation
  get: async (id: string): Promise<ScheduledOperation> => {
    const api = getApi();
    const response = await api.get(`/bulk-operations/scheduled/${id}`);
    return response.data;
  },

  // Create scheduled operation
  create: async (data: Omit<ScheduledOperation, 'id' | 'tenantId' | 'lastRunAt' | 'nextRunAt' | 'lastRunStatus' | 'runCount' | 'createdById' | 'createdAt' | 'updatedAt'>): Promise<ScheduledOperation> => {
    const api = getApi();
    const response = await api.post('/bulk-operations/scheduled', data);
    return response.data;
  },

  // Update scheduled operation
  update: async (id: string, data: Partial<ScheduledOperation>): Promise<ScheduledOperation> => {
    const api = getApi();
    const response = await api.put(`/bulk-operations/scheduled/${id}`, data);
    return response.data;
  },

  // Delete scheduled operation
  delete: async (id: string): Promise<void> => {
    const api = getApi();
    await api.delete(`/bulk-operations/scheduled/${id}`);
  },

  // Toggle active status
  toggleActive: async (id: string): Promise<ScheduledOperation> => {
    const api = getApi();
    const response = await api.post(`/bulk-operations/scheduled/${id}/toggle`);
    return response.data;
  },

  // Run now (execute immediately)
  runNow: async (id: string): Promise<BulkOperation> => {
    const api = getApi();
    const response = await api.post(`/bulk-operations/scheduled/${id}/run-now`);
    return response.data;
  },
};
