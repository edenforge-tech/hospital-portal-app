// Reporting & Analytics API Service
// Comprehensive analytics platform with real-time reporting and data visualization

import api from './axios';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface DashboardMetrics {
  id: string;
  name: string;
  type: 'patients' | 'appointments' | 'revenue' | 'occupancy' | 'staff' | 'inventory' | 'custom';
  value: number;
  previousValue: number;
  change: number;
  changePercentage: number;
  trend: 'up' | 'down' | 'stable';
  period: string;
  updatedAt: string;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string;
    fill?: boolean;
    tension?: number;
  }[];
}

export interface ReportDefinition {
  id: string;
  name: string;
  description: string;
  category: ReportCategory;
  type: 'standard' | 'custom' | 'scheduled';
  parameters: ReportParameter[];
  columns: ReportColumn[];
  filters: ReportFilter[];
  schedule?: ReportSchedule;
  permissions: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  lastRunAt?: string;
  runCount: number;
  isFavorite: boolean;
  status: 'active' | 'draft' | 'archived';
}

export type ReportCategory = 
  | 'clinical' 
  | 'financial' 
  | 'operational' 
  | 'compliance' 
  | 'patient' 
  | 'staff' 
  | 'inventory' 
  | 'custom';

export interface ReportParameter {
  id: string;
  name: string;
  label: string;
  type: 'date' | 'dateRange' | 'select' | 'multiSelect' | 'text' | 'number' | 'boolean';
  required: boolean;
  defaultValue?: any;
  options?: { label: string; value: string }[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export interface ReportColumn {
  id: string;
  field: string;
  header: string;
  type: 'string' | 'number' | 'date' | 'currency' | 'percentage' | 'boolean' | 'status';
  sortable: boolean;
  filterable: boolean;
  width?: number;
  format?: string;
  aggregate?: 'sum' | 'avg' | 'count' | 'min' | 'max';
}

export interface ReportFilter {
  id: string;
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'startsWith' | 'endsWith' | 'in' | 'between';
  value: any;
  label: string;
}

export interface ReportSchedule {
  id: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';
  time: string;
  dayOfWeek?: number;
  dayOfMonth?: number;
  recipients: string[];
  format: 'pdf' | 'excel' | 'csv';
  enabled: boolean;
  nextRunAt: string;
  lastRunAt?: string;
}

export interface ReportExecution {
  id: string;
  reportId: string;
  reportName: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  parameters: Record<string, any>;
  startedAt: string;
  completedAt?: string;
  duration?: number;
  rowCount?: number;
  fileUrl?: string;
  errorMessage?: string;
  executedBy: string;
}

export interface ReportResult {
  id: string;
  reportId: string;
  data: any[];
  totalRows: number;
  page: number;
  pageSize: number;
  summary?: {
    field: string;
    aggregate: string;
    value: number;
  }[];
  generatedAt: string;
}

export interface Dashboard {
  id: string;
  name: string;
  description: string;
  type: 'system' | 'department' | 'personal' | 'shared';
  layout: DashboardLayout;
  widgets: DashboardWidget[];
  filters: DashboardFilter[];
  refreshInterval: number;
  permissions: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  isDefault: boolean;
  status: 'active' | 'draft' | 'archived';
}

export interface DashboardLayout {
  columns: number;
  rows: number;
  gap: number;
}

export interface DashboardWidget {
  id: string;
  type: WidgetType;
  title: string;
  description?: string;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  config: WidgetConfig;
  dataSource: DataSource;
  refreshInterval?: number;
  drilldownEnabled: boolean;
  drilldownConfig?: DrilldownConfig;
}

export type WidgetType = 
  | 'metric' 
  | 'lineChart' 
  | 'barChart' 
  | 'pieChart' 
  | 'donutChart' 
  | 'areaChart' 
  | 'table' 
  | 'gauge' 
  | 'heatmap' 
  | 'map' 
  | 'funnel' 
  | 'timeline' 
  | 'sparkline'
  | 'kpi'
  | 'list';

export interface WidgetConfig {
  colors?: string[];
  showLegend?: boolean;
  legendPosition?: 'top' | 'bottom' | 'left' | 'right';
  showGrid?: boolean;
  showTooltip?: boolean;
  animate?: boolean;
  stacked?: boolean;
  comparison?: 'previous' | 'yearOverYear' | 'custom';
  thresholds?: {
    warning: number;
    critical: number;
  };
  format?: string;
  precision?: number;
}

export interface DataSource {
  type: 'api' | 'report' | 'query' | 'static';
  endpoint?: string;
  reportId?: string;
  query?: string;
  data?: any;
  parameters?: Record<string, any>;
  transform?: DataTransform[];
}

export interface DataTransform {
  type: 'filter' | 'sort' | 'aggregate' | 'pivot' | 'join' | 'calculate';
  config: Record<string, any>;
}

export interface DrilldownConfig {
  targetType: 'report' | 'dashboard' | 'page';
  targetId: string;
  parameters: Record<string, string>;
}

export interface DashboardFilter {
  id: string;
  name: string;
  type: 'date' | 'dateRange' | 'select' | 'multiSelect' | 'search';
  field: string;
  defaultValue?: any;
  options?: { label: string; value: string }[];
  affectedWidgets: string[];
}

export interface AnalyticsQuery {
  metrics: string[];
  dimensions: string[];
  filters: {
    field: string;
    operator: string;
    value: any;
  }[];
  dateRange: {
    start: string;
    end: string;
  };
  granularity: 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year';
  limit?: number;
  orderBy?: {
    field: string;
    direction: 'asc' | 'desc';
  };
}

export interface AnalyticsResult {
  data: any[];
  metadata: {
    query: AnalyticsQuery;
    executionTime: number;
    rowCount: number;
    cached: boolean;
    cacheExpiry?: string;
  };
}

export interface Alert {
  id: string;
  name: string;
  description: string;
  type: 'threshold' | 'anomaly' | 'trend' | 'comparison';
  metric: string;
  condition: {
    operator: 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | 'ne' | 'between' | 'outside';
    value: number | [number, number];
    duration?: number;
  };
  severity: 'info' | 'warning' | 'critical';
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
    slack: boolean;
    recipients: string[];
  };
  enabled: boolean;
  lastTriggeredAt?: string;
  triggerCount: number;
  status: 'active' | 'triggered' | 'acknowledged' | 'resolved';
}

export interface ExportOptions {
  format: 'pdf' | 'excel' | 'csv' | 'json' | 'png';
  includeCharts: boolean;
  includeFilters: boolean;
  includeSummary: boolean;
  pageSize?: 'A4' | 'Letter' | 'Legal';
  orientation?: 'portrait' | 'landscape';
  template?: string;
}

// ============================================================================
// DASHBOARD API
// ============================================================================

export const dashboardApi = {
  // Get all dashboards
  getDashboards: async (params?: { type?: string; status?: string }): Promise<Dashboard[]> => {
    const response = await api.get('/reporting/dashboards', { params });
    return response.data;
  },

  // Get dashboard by ID
  getDashboard: async (id: string): Promise<Dashboard> => {
    const response = await api.get(`/reporting/dashboards/${id}`);
    return response.data;
  },

  // Create dashboard
  createDashboard: async (data: Partial<Dashboard>): Promise<Dashboard> => {
    const response = await api.post('/reporting/dashboards', data);
    return response.data;
  },

  // Update dashboard
  updateDashboard: async (id: string, data: Partial<Dashboard>): Promise<Dashboard> => {
    const response = await api.put(`/reporting/dashboards/${id}`, data);
    return response.data;
  },

  // Delete dashboard
  deleteDashboard: async (id: string): Promise<void> => {
    await api.delete(`/reporting/dashboards/${id}`);
  },

  // Duplicate dashboard
  duplicateDashboard: async (id: string, name: string): Promise<Dashboard> => {
    const response = await api.post(`/reporting/dashboards/${id}/duplicate`, { name });
    return response.data;
  },

  // Set default dashboard
  setDefaultDashboard: async (id: string): Promise<void> => {
    await api.post(`/reporting/dashboards/${id}/set-default`);
  },

  // Get dashboard metrics
  getDashboardMetrics: async (dashboardId: string): Promise<DashboardMetrics[]> => {
    const response = await api.get(`/reporting/dashboards/${dashboardId}/metrics`);
    return response.data;
  },

  // Get widget data
  getWidgetData: async (dashboardId: string, widgetId: string, params?: Record<string, any>): Promise<any> => {
    const response = await api.get(`/reporting/dashboards/${dashboardId}/widgets/${widgetId}/data`, { params });
    return response.data;
  },

  // Refresh widget
  refreshWidget: async (dashboardId: string, widgetId: string): Promise<any> => {
    const response = await api.post(`/reporting/dashboards/${dashboardId}/widgets/${widgetId}/refresh`);
    return response.data;
  },

  // Export dashboard
  exportDashboard: async (id: string, options: ExportOptions): Promise<Blob> => {
    const response = await api.post(`/reporting/dashboards/${id}/export`, options, {
      responseType: 'blob'
    });
    return response.data;
  },

  // Share dashboard
  shareDashboard: async (id: string, data: { users?: string[]; roles?: string[]; public?: boolean }): Promise<void> => {
    await api.post(`/reporting/dashboards/${id}/share`, data);
  }
};

// ============================================================================
// REPORTS API
// ============================================================================

export const reportsApi = {
  // Get all reports
  getReports: async (params?: { category?: string; type?: string; status?: string }): Promise<ReportDefinition[]> => {
    const response = await api.get('/reporting/reports', { params });
    return response.data;
  },

  // Get report by ID
  getReport: async (id: string): Promise<ReportDefinition> => {
    const response = await api.get(`/reporting/reports/${id}`);
    return response.data;
  },

  // Create report
  createReport: async (data: Partial<ReportDefinition>): Promise<ReportDefinition> => {
    const response = await api.post('/reporting/reports', data);
    return response.data;
  },

  // Update report
  updateReport: async (id: string, data: Partial<ReportDefinition>): Promise<ReportDefinition> => {
    const response = await api.put(`/reporting/reports/${id}`, data);
    return response.data;
  },

  // Delete report
  deleteReport: async (id: string): Promise<void> => {
    await api.delete(`/reporting/reports/${id}`);
  },

  // Run report
  runReport: async (id: string, parameters: Record<string, any>): Promise<ReportExecution> => {
    const response = await api.post(`/reporting/reports/${id}/run`, { parameters });
    return response.data;
  },

  // Get report results
  getReportResults: async (executionId: string, params?: { page?: number; pageSize?: number }): Promise<ReportResult> => {
    const response = await api.get(`/reporting/executions/${executionId}/results`, { params });
    return response.data;
  },

  // Export report
  exportReport: async (id: string, parameters: Record<string, any>, format: ExportOptions['format']): Promise<Blob> => {
    const response = await api.post(`/reporting/reports/${id}/export`, { parameters, format }, {
      responseType: 'blob'
    });
    return response.data;
  },

  // Get report executions
  getReportExecutions: async (reportId: string): Promise<ReportExecution[]> => {
    const response = await api.get(`/reporting/reports/${reportId}/executions`);
    return response.data;
  },

  // Cancel report execution
  cancelExecution: async (executionId: string): Promise<void> => {
    await api.post(`/reporting/executions/${executionId}/cancel`);
  },

  // Toggle favorite
  toggleFavorite: async (id: string): Promise<void> => {
    await api.post(`/reporting/reports/${id}/favorite`);
  },

  // Get favorite reports
  getFavoriteReports: async (): Promise<ReportDefinition[]> => {
    const response = await api.get('/reporting/reports/favorites');
    return response.data;
  },

  // Get report categories
  getCategories: async (): Promise<{ category: ReportCategory; count: number }[]> => {
    const response = await api.get('/reporting/reports/categories');
    return response.data;
  },

  // Get standard reports
  getStandardReports: async (category?: ReportCategory): Promise<ReportDefinition[]> => {
    const response = await api.get('/reporting/reports/standard', { params: { category } });
    return response.data;
  }
};

// ============================================================================
// SCHEDULED REPORTS API
// ============================================================================

export const scheduledReportsApi = {
  // Get all schedules
  getSchedules: async (): Promise<ReportSchedule[]> => {
    const response = await api.get('/reporting/schedules');
    return response.data;
  },

  // Create schedule
  createSchedule: async (reportId: string, data: Partial<ReportSchedule>): Promise<ReportSchedule> => {
    const response = await api.post(`/reporting/reports/${reportId}/schedule`, data);
    return response.data;
  },

  // Update schedule
  updateSchedule: async (scheduleId: string, data: Partial<ReportSchedule>): Promise<ReportSchedule> => {
    const response = await api.put(`/reporting/schedules/${scheduleId}`, data);
    return response.data;
  },

  // Delete schedule
  deleteSchedule: async (scheduleId: string): Promise<void> => {
    await api.delete(`/reporting/schedules/${scheduleId}`);
  },

  // Enable/disable schedule
  toggleSchedule: async (scheduleId: string, enabled: boolean): Promise<void> => {
    await api.patch(`/reporting/schedules/${scheduleId}`, { enabled });
  },

  // Run schedule now
  runScheduleNow: async (scheduleId: string): Promise<ReportExecution> => {
    const response = await api.post(`/reporting/schedules/${scheduleId}/run`);
    return response.data;
  }
};

// ============================================================================
// ANALYTICS API
// ============================================================================

export const analyticsApi = {
  // Execute analytics query
  query: async (query: AnalyticsQuery): Promise<AnalyticsResult> => {
    const response = await api.post('/reporting/analytics/query', query);
    return response.data;
  },

  // Get key metrics
  getKeyMetrics: async (dateRange?: { start: string; end: string }): Promise<DashboardMetrics[]> => {
    const response = await api.get('/reporting/analytics/metrics', { params: dateRange });
    return response.data;
  },

  // Get trend data
  getTrend: async (metric: string, params: { granularity: string; dateRange: { start: string; end: string } }): Promise<ChartData> => {
    const response = await api.get(`/reporting/analytics/trends/${metric}`, { params });
    return response.data;
  },

  // Get comparison data
  getComparison: async (metrics: string[], periods: { current: { start: string; end: string }; previous: { start: string; end: string } }): Promise<any> => {
    const response = await api.post('/reporting/analytics/comparison', { metrics, periods });
    return response.data;
  },

  // Get real-time stats
  getRealTimeStats: async (): Promise<any> => {
    const response = await api.get('/reporting/analytics/realtime');
    return response.data;
  },

  // Get department analytics
  getDepartmentAnalytics: async (departmentId: string, dateRange?: { start: string; end: string }): Promise<any> => {
    const response = await api.get(`/reporting/analytics/departments/${departmentId}`, { params: dateRange });
    return response.data;
  },

  // Get patient analytics
  getPatientAnalytics: async (dateRange?: { start: string; end: string }): Promise<any> => {
    const response = await api.get('/reporting/analytics/patients', { params: dateRange });
    return response.data;
  },

  // Get financial analytics
  getFinancialAnalytics: async (dateRange?: { start: string; end: string }): Promise<any> => {
    const response = await api.get('/reporting/analytics/financial', { params: dateRange });
    return response.data;
  },

  // Get operational analytics
  getOperationalAnalytics: async (dateRange?: { start: string; end: string }): Promise<any> => {
    const response = await api.get('/reporting/analytics/operational', { params: dateRange });
    return response.data;
  },

  // Get staff analytics
  getStaffAnalytics: async (dateRange?: { start: string; end: string }): Promise<any> => {
    const response = await api.get('/reporting/analytics/staff', { params: dateRange });
    return response.data;
  }
};

// ============================================================================
// ALERTS API
// ============================================================================

export const alertsApi = {
  // Get all alerts
  getAlerts: async (params?: { status?: string; severity?: string }): Promise<Alert[]> => {
    const response = await api.get('/reporting/alerts', { params });
    return response.data;
  },

  // Get alert by ID
  getAlert: async (id: string): Promise<Alert> => {
    const response = await api.get(`/reporting/alerts/${id}`);
    return response.data;
  },

  // Create alert
  createAlert: async (data: Partial<Alert>): Promise<Alert> => {
    const response = await api.post('/reporting/alerts', data);
    return response.data;
  },

  // Update alert
  updateAlert: async (id: string, data: Partial<Alert>): Promise<Alert> => {
    const response = await api.put(`/reporting/alerts/${id}`, data);
    return response.data;
  },

  // Delete alert
  deleteAlert: async (id: string): Promise<void> => {
    await api.delete(`/reporting/alerts/${id}`);
  },

  // Enable/disable alert
  toggleAlert: async (id: string, enabled: boolean): Promise<void> => {
    await api.patch(`/reporting/alerts/${id}`, { enabled });
  },

  // Acknowledge alert
  acknowledgeAlert: async (id: string, note?: string): Promise<void> => {
    await api.post(`/reporting/alerts/${id}/acknowledge`, { note });
  },

  // Resolve alert
  resolveAlert: async (id: string, note?: string): Promise<void> => {
    await api.post(`/reporting/alerts/${id}/resolve`, { note });
  },

  // Get triggered alerts
  getTriggeredAlerts: async (): Promise<Alert[]> => {
    const response = await api.get('/reporting/alerts/triggered');
    return response.data;
  },

  // Get alert history
  getAlertHistory: async (alertId: string): Promise<any[]> => {
    const response = await api.get(`/reporting/alerts/${alertId}/history`);
    return response.data;
  }
};

// ============================================================================
// WIDGET TEMPLATES API
// ============================================================================

export const widgetTemplatesApi = {
  // Get available widget templates
  getTemplates: async (type?: WidgetType): Promise<any[]> => {
    const response = await api.get('/reporting/widgets/templates', { params: { type } });
    return response.data;
  },

  // Get widget preview
  getPreview: async (templateId: string, params?: Record<string, any>): Promise<any> => {
    const response = await api.get(`/reporting/widgets/templates/${templateId}/preview`, { params });
    return response.data;
  }
};

export default {
  dashboardApi,
  reportsApi,
  scheduledReportsApi,
  analyticsApi,
  alertsApi,
  widgetTemplatesApi
};
