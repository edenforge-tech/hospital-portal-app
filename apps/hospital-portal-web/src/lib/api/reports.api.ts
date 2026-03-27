import { getApi } from './index';

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  parameters: ReportParameter[];
}

export interface ReportParameter {
  name: string;
  type: 'date' | 'dateRange' | 'select' | 'multiSelect' | 'text';
  label: string;
  required: boolean;
  options?: { value: string; label: string }[];
}

export interface GenerateReportRequest {
  templateId: string;
  parameters: Record<string, any>;
  format: 'pdf' | 'excel' | 'csv';
}

export interface GeneratedReport {
  id: string;
  name: string;
  format: string;
  generatedAt: string;
  fileUrl: string;
  fileSize: number;
}

/**
 * Reports API Client
 * Custom report generation and export
 */
export const reportsApi = {
  /**
   * Get available report templates
   */
  async getTemplates(): Promise<{ data: ReportTemplate[] }> {
    return getApi().get('/reports/templates');
  },

  /**
   * Generate report
   */
  async generate(request: GenerateReportRequest): Promise<{ data: GeneratedReport }> {
    return getApi().post('/reports/generate', request);
  },

  /**
   * Get report history
   */
  async getHistory(): Promise<{ data: GeneratedReport[] }> {
    return getApi().get('/reports/history');
  },

  /**
   * Download report
   */
  async download(reportId: string): Promise<Blob> {
    const response = await getApi().get(`/reports/${reportId}/download`, {
      responseType: 'blob'
    });
    return response.data;
  }
};
