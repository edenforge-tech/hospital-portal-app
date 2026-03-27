import { getApi } from '../api';

// ============================================================================
// Types
// ============================================================================

export interface SystemSettings {
  id: string;
  tenantId: string;
  category: SettingsCategory;
  settings: Record<string, any>;
  updatedById?: string;
  updatedBy?: { id: string; name: string };
  updatedAt: string;
}

export type SettingsCategory =
  | 'general'
  | 'branding'
  | 'security'
  | 'email'
  | 'notifications'
  | 'appointments'
  | 'billing'
  | 'clinical'
  | 'integrations'
  | 'compliance'
  | 'localization'
  | 'features';

export interface GeneralSettings {
  organizationName: string;
  tagline?: string;
  timezone: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  currency: string;
  language: string;
  supportEmail: string;
  supportPhone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

export interface BrandingSettings {
  logoUrl?: string;
  faviconUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  loginBackgroundUrl?: string;
  emailHeaderUrl?: string;
  emailFooterText?: string;
  customCss?: string;
}

export interface SecuritySettings {
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    preventReuse: number;
    expirationDays: number;
  };
  sessionPolicy: {
    maxSessionDuration: number;
    idleTimeout: number;
    maxConcurrentSessions: number;
    enforceIpBinding: boolean;
  };
  mfaPolicy: {
    required: boolean;
    methods: ('totp' | 'sms' | 'email')[];
    rememberDeviceDays: number;
  };
  loginPolicy: {
    maxFailedAttempts: number;
    lockoutDuration: number;
    captchaAfterFailures: number;
    allowedIpRanges?: string[];
  };
  accessControl: {
    requireApprovalForNewUsers: boolean;
    autoDisableInactiveUsers: boolean;
    inactivityThresholdDays: number;
  };
}

export interface EmailSettings {
  provider: 'smtp' | 'sendgrid' | 'ses' | 'mailgun';
  fromName: string;
  fromEmail: string;
  replyToEmail?: string;
  smtp?: {
    host: string;
    port: number;
    secure: boolean;
    username: string;
    password: string;
  };
  apiKey?: string;
  templates: {
    welcome: boolean;
    passwordReset: boolean;
    appointmentReminder: boolean;
    appointmentConfirmation: boolean;
    labResults: boolean;
    billing: boolean;
  };
}

export interface NotificationSettings {
  channels: {
    email: { enabled: boolean; defaultEnabled: boolean };
    sms: { enabled: boolean; defaultEnabled: boolean; provider?: string };
    push: { enabled: boolean; defaultEnabled: boolean };
    inApp: { enabled: boolean; defaultEnabled: boolean };
  };
  defaults: {
    appointmentReminders: { enabled: boolean; advanceHours: number[] };
    labResultsReady: boolean;
    prescriptionRefills: boolean;
    billingAlerts: boolean;
    systemAnnouncements: boolean;
  };
  quietHours: {
    allowConfiguration: boolean;
    defaultStart: string;
    defaultEnd: string;
  };
}

export interface AppointmentSettings {
  scheduling: {
    minAdvanceHours: number;
    maxAdvanceDays: number;
    defaultDuration: number;
    allowOnlineBooking: boolean;
    requireApproval: boolean;
    allowSameDay: boolean;
    bufferBetweenAppointments: number;
  };
  cancellation: {
    allowCancellation: boolean;
    minCancellationHours: number;
    cancellationFee?: number;
    noShowFee?: number;
  };
  reminders: {
    enabled: boolean;
    channels: ('email' | 'sms' | 'push')[];
    timing: number[];
  };
  workingHours: {
    [key: string]: { start: string; end: string; enabled: boolean };
  };
  holidays: { date: string; name: string; recurring: boolean }[];
}

export interface BillingSettings {
  currency: string;
  taxRate: number;
  taxId?: string;
  paymentMethods: ('credit_card' | 'debit_card' | 'bank_transfer' | 'cash' | 'check' | 'insurance')[];
  paymentGateway?: {
    provider: 'stripe' | 'square' | 'authorize_net';
    publicKey?: string;
    enabled: boolean;
  };
  invoicing: {
    autoGenerate: boolean;
    dueDays: number;
    prefix: string;
    nextNumber: number;
    footer?: string;
    terms?: string;
  };
  insurance: {
    enabled: boolean;
    verificationRequired: boolean;
    autoSubmitClaims: boolean;
    clearinghouse?: string;
  };
}

export interface ClinicalSettings {
  charting: {
    defaultTemplates: string[];
    requireSignature: boolean;
    autoSaveInterval: number;
    vitalSignUnits: Record<string, string>;
  };
  prescriptions: {
    ePrescribingEnabled: boolean;
    requireDEAForControlled: boolean;
    defaultPharmacy?: string;
    drugDatabaseProvider?: string;
  };
  labOrders: {
    defaultLab?: string;
    autoReleaseResults: boolean;
    criticalValueAlerts: boolean;
  };
  documentRetention: {
    medicalRecordYears: number;
    billingRecordYears: number;
    autoArchive: boolean;
  };
}

export interface IntegrationSettings {
  hl7: {
    enabled: boolean;
    version: '2.3' | '2.4' | '2.5' | '2.5.1';
    inboundPort?: number;
    outboundEndpoints: { name: string; host: string; port: number }[];
  };
  fhir: {
    enabled: boolean;
    version: 'R4' | 'STU3';
    serverUrl?: string;
    clientId?: string;
    clientSecret?: string;
  };
  ehr: {
    provider?: string;
    enabled: boolean;
    apiEndpoint?: string;
    syncEnabled: boolean;
    syncInterval: number;
  };
  clearinghouse: {
    provider?: string;
    enabled: boolean;
    submitterId?: string;
  };
}

export interface ComplianceSettings {
  hipaa: {
    enabled: boolean;
    auditLogRetentionDays: number;
    accessLogEnabled: boolean;
    encryptionAtRest: boolean;
    encryptionInTransit: boolean;
    minimumNecessaryEnabled: boolean;
    breachNotificationEnabled: boolean;
  };
  consentManagement: {
    enabled: boolean;
    requirePatientConsent: boolean;
    consentExpirationDays?: number;
    types: string[];
  };
  dataRetention: {
    patientRecordsYears: number;
    auditLogsYears: number;
    communicationsYears: number;
    financialRecordsYears: number;
  };
}

export interface FeatureFlags {
  [key: string]: {
    enabled: boolean;
    name: string;
    description?: string;
    rolloutPercentage?: number;
    enabledForRoles?: string[];
    enabledForUsers?: string[];
  };
}

export interface SettingsHistory {
  id: string;
  tenantId: string;
  category: SettingsCategory;
  previousSettings: Record<string, any>;
  newSettings: Record<string, any>;
  changedFields: string[];
  changedById: string;
  changedBy: { id: string; name: string };
  changedAt: string;
  reason?: string;
}

// ============================================================================
// Settings API
// ============================================================================

export const settingsApi = {
  getAll: async (): Promise<SystemSettings[]> => {
    const api = getApi();
    const response = await api.get('/settings');
    return response.data;
  },

  getByCategory: async (category: SettingsCategory): Promise<SystemSettings> => {
    const api = getApi();
    const response = await api.get(`/settings/${category}`);
    return response.data;
  },

  update: async (category: SettingsCategory, settings: Record<string, any>, reason?: string): Promise<SystemSettings> => {
    const api = getApi();
    const response = await api.put(`/settings/${category}`, { settings, reason });
    return response.data;
  },

  reset: async (category: SettingsCategory): Promise<SystemSettings> => {
    const api = getApi();
    const response = await api.post(`/settings/${category}/reset`);
    return response.data;
  },

  getHistory: async (category?: SettingsCategory, params?: { page?: number; pageSize?: number }): Promise<{ data: SettingsHistory[]; total: number }> => {
    const api = getApi();
    const response = await api.get('/settings/history', { params: { category, ...params } });
    return response.data;
  },

  revertToVersion: async (historyId: string): Promise<SystemSettings> => {
    const api = getApi();
    const response = await api.post(`/settings/history/${historyId}/revert`);
    return response.data;
  },

  export: async (): Promise<Record<SettingsCategory, Record<string, any>>> => {
    const api = getApi();
    const response = await api.get('/settings/export');
    return response.data;
  },

  import: async (settings: Record<SettingsCategory, Record<string, any>>): Promise<void> => {
    const api = getApi();
    await api.post('/settings/import', settings);
  },

  validate: async (category: SettingsCategory, settings: Record<string, any>): Promise<{ valid: boolean; errors: string[] }> => {
    const api = getApi();
    const response = await api.post(`/settings/${category}/validate`, settings);
    return response.data;
  },
};

// ============================================================================
// Specific Settings APIs
// ============================================================================

export const generalSettingsApi = {
  get: async (): Promise<GeneralSettings> => {
    const api = getApi();
    const response = await api.get('/settings/general');
    return response.data.settings;
  },

  update: async (settings: Partial<GeneralSettings>): Promise<GeneralSettings> => {
    const api = getApi();
    const response = await api.put('/settings/general', { settings });
    return response.data.settings;
  },
};

export const brandingSettingsApi = {
  get: async (): Promise<BrandingSettings> => {
    const api = getApi();
    const response = await api.get('/settings/branding');
    return response.data.settings;
  },

  update: async (settings: Partial<BrandingSettings>): Promise<BrandingSettings> => {
    const api = getApi();
    const response = await api.put('/settings/branding', { settings });
    return response.data.settings;
  },

  uploadLogo: async (file: File): Promise<string> => {
    const api = getApi();
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/settings/branding/logo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.url;
  },

  uploadFavicon: async (file: File): Promise<string> => {
    const api = getApi();
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/settings/branding/favicon', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.url;
  },
};

export const securitySettingsApi = {
  get: async (): Promise<SecuritySettings> => {
    const api = getApi();
    const response = await api.get('/settings/security');
    return response.data.settings;
  },

  update: async (settings: Partial<SecuritySettings>): Promise<SecuritySettings> => {
    const api = getApi();
    const response = await api.put('/settings/security', { settings });
    return response.data.settings;
  },

  testPasswordPolicy: async (password: string): Promise<{ valid: boolean; errors: string[] }> => {
    const api = getApi();
    const response = await api.post('/settings/security/test-password', { password });
    return response.data;
  },
};

export const emailSettingsApi = {
  get: async (): Promise<EmailSettings> => {
    const api = getApi();
    const response = await api.get('/settings/email');
    return response.data.settings;
  },

  update: async (settings: Partial<EmailSettings>): Promise<EmailSettings> => {
    const api = getApi();
    const response = await api.put('/settings/email', { settings });
    return response.data.settings;
  },

  testConnection: async (): Promise<{ success: boolean; message: string }> => {
    const api = getApi();
    const response = await api.post('/settings/email/test');
    return response.data;
  },

  sendTestEmail: async (recipient: string): Promise<{ success: boolean; message: string }> => {
    const api = getApi();
    const response = await api.post('/settings/email/send-test', { recipient });
    return response.data;
  },
};

export const featureFlagsApi = {
  get: async (): Promise<FeatureFlags> => {
    const api = getApi();
    const response = await api.get('/settings/features');
    return response.data.settings;
  },

  update: async (key: string, settings: FeatureFlags[string]): Promise<FeatureFlags> => {
    const api = getApi();
    const response = await api.put(`/settings/features/${key}`, settings);
    return response.data.settings;
  },

  toggle: async (key: string, enabled: boolean): Promise<FeatureFlags> => {
    const api = getApi();
    const response = await api.post(`/settings/features/${key}/toggle`, { enabled });
    return response.data.settings;
  },

  isEnabled: async (key: string): Promise<boolean> => {
    const api = getApi();
    const response = await api.get(`/settings/features/${key}/enabled`);
    return response.data.enabled;
  },

  bulkUpdate: async (flags: Record<string, boolean>): Promise<FeatureFlags> => {
    const api = getApi();
    const response = await api.post('/settings/features/bulk-update', flags);
    return response.data.settings;
  },
};

// ============================================================================
// System Health & Diagnostics API
// ============================================================================

export const systemHealthApi = {
  getStatus: async (): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    services: { name: string; status: string; latency: number; message?: string }[];
    uptime: number;
    version: string;
  }> => {
    const api = getApi();
    const response = await api.get('/system/health');
    return response.data;
  },

  getDiagnostics: async (): Promise<{
    database: { connected: boolean; latency: number; poolSize: number };
    cache: { connected: boolean; hitRate: number; memoryUsage: number };
    storage: { available: boolean; usedSpace: number; totalSpace: number };
    queue: { connected: boolean; pendingJobs: number; failedJobs: number };
  }> => {
    const api = getApi();
    const response = await api.get('/system/diagnostics');
    return response.data;
  },

  getMetrics: async (period: '1h' | '6h' | '24h' | '7d'): Promise<{
    requests: { timestamp: string; count: number; avgLatency: number }[];
    errors: { timestamp: string; count: number }[];
    activeUsers: { timestamp: string; count: number }[];
  }> => {
    const api = getApi();
    const response = await api.get('/system/metrics', { params: { period } });
    return response.data;
  },

  clearCache: async (type?: 'all' | 'settings' | 'permissions' | 'sessions'): Promise<{ success: boolean; message: string }> => {
    const api = getApi();
    const response = await api.post('/system/cache/clear', { type });
    return response.data;
  },

  runMaintenance: async (task: 'cleanup' | 'optimize' | 'reindex'): Promise<{ success: boolean; message: string; duration: number }> => {
    const api = getApi();
    const response = await api.post('/system/maintenance', { task });
    return response.data;
  },
};
