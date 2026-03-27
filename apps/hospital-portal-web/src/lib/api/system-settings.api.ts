// System Settings & Configuration API
// Comprehensive multi-tenant configuration management with feature toggles and advanced settings

import axios, { AxiosResponse } from 'axios';
import { getApi } from '../api';

// ===== CORE CONFIGURATION INTERFACES =====

export interface TenantSettings {
  id: string;
  tenantId: string;
  
  // General Settings
  generalSettings: {
    organizationName: string;
    timeZone: string;
    dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
    timeFormat: '12h' | '24h';
    language: string;
    currency: string;
    fiscalYearStart: string; // MM-DD format
  };

  // Branding & Appearance
  branding: {
    logoUrl?: string;
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    favicon?: string;
    customCss?: string;
    headerBackgroundColor: string;
    sidebarBackgroundColor: string;
    fontFamily: string;
    customTheme?: Record<string, any>;
  };

  // Feature Toggles
  features: {
    patientPortal: boolean;
    telehealth: boolean;
    documentSharing: boolean;
    bulkOperations: boolean;
    advancedReporting: boolean;
    auditLogs: boolean;
    multiLocation: boolean;
    appointmentReminders: boolean;
    patientSurveys: boolean;
    billingIntegration: boolean;
    labIntegration: boolean;
    pharmacyIntegration: boolean;
    insuranceVerification: boolean;
    electronicPrescribing: boolean;
    patientCommunication: boolean;
    customFields: boolean;
    workflowAutomation: boolean;
    mobileApp: boolean;
    apiAccess: boolean;
    singleSignOn: boolean;
  };

  // Security Settings
  security: {
    passwordPolicy: {
      minLength: number;
      requireUppercase: boolean;
      requireLowercase: boolean;
      requireNumbers: boolean;
      requireSpecialChars: boolean;
      passwordExpiry: number; // days, 0 = never
      preventReuse: number; // number of previous passwords
      maxLoginAttempts: number;
      lockoutDuration: number; // minutes
    };
    sessionSettings: {
      sessionTimeout: number; // minutes
      multipleSessionsAllowed: boolean;
      forceLogoutInactive: boolean;
    };
    mfaSettings: {
      required: boolean;
      methods: ('SMS' | 'Email' | 'Authenticator')[];
      gracePeriod: number; // days
    };
    ipRestrictions: {
      enabled: boolean;
      allowedIPs: string[];
      restrictAdmins: boolean;
    };
    dataEncryption: {
      encryptPatientData: boolean;
      encryptCommunications: boolean;
      keyRotationDays: number;
    };
  };

  // Notification Preferences
  notifications: {
    email: {
      enabled: boolean;
      smtpServer: string;
      smtpPort: number;
      smtpUsername: string;
      smtpPassword?: string; // encrypted
      fromAddress: string;
      fromName: string;
      useSSL: boolean;
      templates: NotificationTemplate[];
    };
    sms: {
      enabled: boolean;
      provider: 'Twilio' | 'AWS_SNS' | 'Other';
      apiKey?: string; // encrypted
      apiSecret?: string; // encrypted
      fromNumber: string;
      templates: NotificationTemplate[];
    };
    push: {
      enabled: boolean;
      firebaseKey?: string; // encrypted
      apnsKey?: string; // encrypted
      templates: NotificationTemplate[];
    };
    inApp: {
      enabled: boolean;
      retentionDays: number;
      templates: NotificationTemplate[];
    };
  };

  // Integration Settings
  integrations: {
    ehr: {
      enabled: boolean;
      provider?: string;
      apiUrl?: string;
      apiKey?: string; // encrypted
      syncFrequency: number; // minutes
      lastSync?: string;
    };
    billing: {
      enabled: boolean;
      provider?: string;
      apiUrl?: string;
      apiKey?: string; // encrypted
      autoSync: boolean;
      syncTypes: ('patients' | 'appointments' | 'procedures' | 'payments')[];
    };
    lab: {
      enabled: boolean;
      provider?: string;
      apiUrl?: string;
      credentials?: Record<string, any>; // encrypted
      autoImportResults: boolean;
      resultTypes: string[];
    };
    pharmacy: {
      enabled: boolean;
      provider?: string;
      apiUrl?: string;
      credentials?: Record<string, any>; // encrypted
      electronicPrescribing: boolean;
    };
    insurance: {
      enabled: boolean;
      provider?: string;
      apiUrl?: string;
      credentials?: Record<string, any>; // encrypted
      autoVerification: boolean;
      verificationTimeout: number; // minutes
    };
  };

  // System Preferences
  systemPreferences: {
    dataRetention: {
      patientRecords: number; // years, 0 = forever
      auditLogs: number; // years
      appointments: number; // years
      communications: number; // years
      documents: number; // years
    };
    backupSettings: {
      frequency: 'Daily' | 'Weekly' | 'Monthly';
      retentionPeriod: number; // days
      includeLogs: boolean;
      includeDocuments: boolean;
      encryptBackups: boolean;
    };
    maintenanceWindow: {
      enabled: boolean;
      dayOfWeek: number; // 0-6 (Sunday = 0)
      startTime: string; // HH:MM
      duration: number; // hours
      timeZone: string;
    };
    apiLimits: {
      requestsPerHour: number;
      concurrentConnections: number;
      maxFileUploadSize: number; // MB
      enableRateLimiting: boolean;
    };
  };

  // Audit & Compliance
  audit: {
    enabled: boolean;
    logLevel: 'Basic' | 'Detailed' | 'Comprehensive';
    retentionDays: number;
    logUserActions: boolean;
    logDataAccess: boolean;
    logSystemChanges: boolean;
    logApiCalls: boolean;
    alertOnSuspiciousActivity: boolean;
    complianceStandards: ('HIPAA' | 'SOC2' | 'GDPR' | 'HITECH')[];
    automaticReporting: boolean;
    reportingFrequency: 'Weekly' | 'Monthly' | 'Quarterly';
  };

  // Custom Fields Configuration
  customFields: {
    patients: CustomFieldDefinition[];
    appointments: CustomFieldDefinition[];
    providers: CustomFieldDefinition[];
    departments: CustomFieldDefinition[];
  };

  // Workflow Automation
  workflows: {
    appointmentReminders: {
      enabled: boolean;
      emailReminder: { enabled: boolean; daysBefore: number[]; };
      smsReminder: { enabled: boolean; daysBefore: number[]; };
      callReminder: { enabled: boolean; daysBefore: number[]; };
    };
    patientOnboarding: {
      enabled: boolean;
      welcomeEmail: boolean;
      portalInvitation: boolean;
      documentRequests: string[];
    };
    followUpCare: {
      enabled: boolean;
      appointmentTypes: string[];
      daysBetweenFollowUp: number;
      autoSchedule: boolean;
    };
    billingWorkflows: {
      autoGenerateInvoices: boolean;
      paymentReminders: { enabled: boolean; daysBetween: number[]; };
      overdueNotifications: { enabled: boolean; daysOverdue: number[]; };
    };
  };

  // Metadata
  createdAt: string;
  updatedAt: string;
  createdByUserId: string;
  updatedByUserId: string;
  version: number;
  status: 'Active' | 'Inactive' | 'Pending';
}

export interface NotificationTemplate {
  id: string;
  name: string;
  type: 'Email' | 'SMS' | 'Push' | 'InApp';
  event: string; // appointment_reminder, welcome_email, etc.
  subject?: string;
  body: string;
  variables: string[]; // available template variables
  isActive: boolean;
  isDefault: boolean;
}

export interface CustomFieldDefinition {
  id: string;
  name: string;
  label: string;
  type: 'Text' | 'Number' | 'Date' | 'Boolean' | 'Select' | 'MultiSelect' | 'TextArea';
  required: boolean;
  options?: string[]; // for Select/MultiSelect
  defaultValue?: any;
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    min?: number;
    max?: number;
  };
  isActive: boolean;
}

export interface FeatureFlag {
  id: string;
  tenantId: string;
  featureName: string;
  isEnabled: boolean;
  description: string;
  dependencies?: string[]; // other feature names
  rolloutPercentage: number; // 0-100
  startDate?: string;
  endDate?: string;
  conditions?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface SystemHealth {
  status: 'Healthy' | 'Warning' | 'Critical';
  uptime: number; // seconds
  version: string;
  environment: string;
  services: ServiceHealth[];
  metrics: {
    cpu: number;
    memory: number;
    disk: number;
    activeConnections: number;
    requestsPerSecond: number;
    errorRate: number;
  };
  lastCheck: string;
}

export interface ServiceHealth {
  name: string;
  status: 'Healthy' | 'Warning' | 'Critical' | 'Unknown';
  responseTime: number; // ms
  lastCheck: string;
  details?: string;
}

export interface BackupInfo {
  id: string;
  tenantId: string;
  type: 'Full' | 'Incremental' | 'Differential';
  status: 'Running' | 'Completed' | 'Failed';
  startTime: string;
  endTime?: string;
  size: number; // bytes
  location: string;
  checksum: string;
  includes: ('Database' | 'Documents' | 'Logs' | 'Configurations')[];
}

// ===== API REQUEST/RESPONSE TYPES =====

export interface GetTenantSettingsResponse {
  settings: TenantSettings;
  lastModified: string;
  modifiedBy: {
    id: string;
    name: string;
    email: string;
  };
}

export interface UpdateTenantSettingsRequest {
  settings: Partial<TenantSettings>;
  reason?: string;
  notifyUsers?: boolean;
}

export interface FeatureFlagRequest {
  featureName: string;
  isEnabled: boolean;
  description?: string;
  rolloutPercentage?: number;
  startDate?: string;
  endDate?: string;
  conditions?: Record<string, any>;
}

export interface BulkFeatureFlagRequest {
  flags: FeatureFlagRequest[];
}

export interface NotificationTemplateRequest {
  name: string;
  type: 'Email' | 'SMS' | 'Push' | 'InApp';
  event: string;
  subject?: string;
  body: string;
  variables?: string[];
  isActive?: boolean;
  isDefault?: boolean;
}

export interface CustomFieldRequest {
  entity: 'patients' | 'appointments' | 'providers' | 'departments';
  field: Omit<CustomFieldDefinition, 'id'>;
}

export interface SystemMaintenanceRequest {
  startTime: string;
  duration: number; // hours
  description: string;
  notifyUsers: boolean;
  maintenanceType: 'Scheduled' | 'Emergency';
}

// ===== SYSTEM SETTINGS API CLASS =====

export class SystemSettingsApi {
  private api = getApi();

  // ===== TENANT SETTINGS =====

  async getTenantSettings(): Promise<GetTenantSettingsResponse> {
    const response: AxiosResponse<GetTenantSettingsResponse> = 
      await this.api.get('/system/settings');
    return response.data;
  }

  async updateTenantSettings(request: UpdateTenantSettingsRequest): Promise<TenantSettings> {
    const response: AxiosResponse<TenantSettings> = 
      await this.api.put('/system/settings', request);
    return response.data;
  }

  async resetTenantSettings(section?: string): Promise<TenantSettings> {
    const response: AxiosResponse<TenantSettings> = 
      await this.api.post('/system/settings/reset', { section });
    return response.data;
  }

  async exportTenantSettings(): Promise<Blob> {
    const response: AxiosResponse<Blob> = 
      await this.api.get('/system/settings/export', { responseType: 'blob' });
    return response.data;
  }

  async importTenantSettings(file: File): Promise<TenantSettings> {
    const formData = new FormData();
    formData.append('settings', file);
    
    const response: AxiosResponse<TenantSettings> = 
      await this.api.post('/system/settings/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    return response.data;
  }

  // ===== FEATURE FLAGS =====

  async getFeatureFlags(): Promise<FeatureFlag[]> {
    const response: AxiosResponse<FeatureFlag[]> = 
      await this.api.get('/system/feature-flags');
    return response.data;
  }

  async getFeatureFlag(featureName: string): Promise<FeatureFlag> {
    const response: AxiosResponse<FeatureFlag> = 
      await this.api.get(`/system/feature-flags/${featureName}`);
    return response.data;
  }

  async updateFeatureFlag(featureName: string, request: FeatureFlagRequest): Promise<FeatureFlag> {
    const response: AxiosResponse<FeatureFlag> = 
      await this.api.put(`/system/feature-flags/${featureName}`, request);
    return response.data;
  }

  async updateFeatureFlags(request: BulkFeatureFlagRequest): Promise<FeatureFlag[]> {
    const response: AxiosResponse<FeatureFlag[]> = 
      await this.api.put('/system/feature-flags/bulk', request);
    return response.data;
  }

  async toggleFeature(featureName: string, enabled: boolean): Promise<FeatureFlag> {
    const response: AxiosResponse<FeatureFlag> = 
      await this.api.post(`/system/feature-flags/${featureName}/toggle`, { enabled });
    return response.data;
  }

  // ===== NOTIFICATION TEMPLATES =====

  async getNotificationTemplates(type?: string): Promise<NotificationTemplate[]> {
    const response: AxiosResponse<NotificationTemplate[]> = 
      await this.api.get('/system/notification-templates', { 
        params: { type } 
      });
    return response.data;
  }

  async createNotificationTemplate(request: NotificationTemplateRequest): Promise<NotificationTemplate> {
    const response: AxiosResponse<NotificationTemplate> = 
      await this.api.post('/system/notification-templates', request);
    return response.data;
  }

  async updateNotificationTemplate(id: string, request: NotificationTemplateRequest): Promise<NotificationTemplate> {
    const response: AxiosResponse<NotificationTemplate> = 
      await this.api.put(`/system/notification-templates/${id}`, request);
    return response.data;
  }

  async deleteNotificationTemplate(id: string): Promise<void> {
    await this.api.delete(`/system/notification-templates/${id}`);
  }

  async testNotificationTemplate(id: string, testData: Record<string, any>): Promise<{ success: boolean; message: string }> {
    const response: AxiosResponse<{ success: boolean; message: string }> = 
      await this.api.post(`/system/notification-templates/${id}/test`, testData);
    return response.data;
  }

  // ===== CUSTOM FIELDS =====

  async getCustomFields(entity?: string): Promise<Record<string, CustomFieldDefinition[]>> {
    const response: AxiosResponse<Record<string, CustomFieldDefinition[]>> = 
      await this.api.get('/system/custom-fields', { 
        params: { entity } 
      });
    return response.data;
  }

  async createCustomField(request: CustomFieldRequest): Promise<CustomFieldDefinition> {
    const response: AxiosResponse<CustomFieldDefinition> = 
      await this.api.post('/system/custom-fields', request);
    return response.data;
  }

  async updateCustomField(id: string, request: Partial<CustomFieldRequest>): Promise<CustomFieldDefinition> {
    const response: AxiosResponse<CustomFieldDefinition> = 
      await this.api.put(`/system/custom-fields/${id}`, request);
    return response.data;
  }

  async deleteCustomField(id: string): Promise<void> {
    await this.api.delete(`/system/custom-fields/${id}`);
  }

  // ===== SYSTEM HEALTH & MONITORING =====

  async getSystemHealth(): Promise<SystemHealth> {
    const response: AxiosResponse<SystemHealth> = 
      await this.api.get('/system/health');
    return response.data;
  }

  async getSystemMetrics(timeRange?: string): Promise<Record<string, any>> {
    const response: AxiosResponse<Record<string, any>> = 
      await this.api.get('/system/metrics', { 
        params: { timeRange } 
      });
    return response.data;
  }

  async getSystemLogs(level?: string, limit?: number): Promise<any[]> {
    const response: AxiosResponse<any[]> = 
      await this.api.get('/system/logs', { 
        params: { level, limit } 
      });
    return response.data;
  }

  // ===== BACKUP & MAINTENANCE =====

  async getBackups(): Promise<BackupInfo[]> {
    const response: AxiosResponse<BackupInfo[]> = 
      await this.api.get('/system/backups');
    return response.data;
  }

  async createBackup(type: 'Full' | 'Incremental' = 'Full'): Promise<BackupInfo> {
    const response: AxiosResponse<BackupInfo> = 
      await this.api.post('/system/backups', { type });
    return response.data;
  }

  async restoreBackup(backupId: string): Promise<{ success: boolean; message: string }> {
    const response: AxiosResponse<{ success: boolean; message: string }> = 
      await this.api.post(`/system/backups/${backupId}/restore`);
    return response.data;
  }

  async scheduleMaintenanceWindow(request: SystemMaintenanceRequest): Promise<{ success: boolean; scheduledFor: string }> {
    const response: AxiosResponse<{ success: boolean; scheduledFor: string }> = 
      await this.api.post('/system/maintenance', request);
    return response.data;
  }

  async getMaintenanceWindows(): Promise<any[]> {
    const response: AxiosResponse<any[]> = 
      await this.api.get('/system/maintenance');
    return response.data;
  }

  // ===== CONFIGURATION VALIDATION =====

  async validateConfiguration(): Promise<{ isValid: boolean; errors: string[]; warnings: string[] }> {
    const response: AxiosResponse<{ isValid: boolean; errors: string[]; warnings: string[] }> = 
      await this.api.post('/system/validate');
    return response.data;
  }

  async testIntegrations(): Promise<Record<string, { success: boolean; message: string; responseTime: number }>> {
    const response: AxiosResponse<Record<string, { success: boolean; message: string; responseTime: number }>> = 
      await this.api.post('/system/test-integrations');
    return response.data;
  }
}

// Export singleton instance
export const systemSettingsApi = new SystemSettingsApi();