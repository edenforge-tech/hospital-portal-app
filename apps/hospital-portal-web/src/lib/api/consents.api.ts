// Consent Forms API - Module 3 Counseling Workflow
import { getApi } from '../api';
import type {
  ConsentTemplate,
  PatientConsent,
  RenderConsentRequest,
  ConsentListResponse,
} from '@/types/counselor';

// ============================================================================
// Additional Request Types (not in counselor.ts)
// ============================================================================

export interface SignConsentRequest {
  patientSignatureBase64?: string;
  witnessName?: string;
  witnessSignatureBase64?: string;
  guardianName?: string;
  guardianRelation?: string;
  guardianSignatureBase64?: string;
}

export interface RevokeConsentRequest {
  revocationReason: string;
}

// ============================================================================
// API Functions
// ============================================================================

export const consentsApi = {
  /**
   * Get all consent templates
   */
  getTemplates: async (): Promise<ConsentTemplate[]> => {
    const response = await getApi().get<ConsentTemplate[]>('/consents/templates');
    return response.data;
  },

  /**
   * Get template by ID
   */
  getTemplateById: async (id: string): Promise<ConsentTemplate> => {
    const response = await getApi().get<ConsentTemplate>(`/consents/templates/${id}`);
    return response.data;
  },

  /**
   * Get all patient consents with optional filtering
   */
  getAllConsents: async (params?: {
    page?: number;
    pageSize?: number;
    sessionId?: string;
  }): Promise<ConsentListResponse> => {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.pageSize) query.append('pageSize', params.pageSize.toString());
    if (params?.sessionId) query.append('sessionId', params.sessionId);
    
    const url = `/consents${query.toString() ? `?${query}` : ''}`;
    const response = await getApi().get<ConsentListResponse>(url);
    return response.data;
  },

  /**
   * Get consent by ID
   */
  getConsentById: async (id: string): Promise<PatientConsent> => {
    const response = await getApi().get<PatientConsent>(`/consents/${id}`);
    return response.data;
  },

  /**
   * Render consent from template
   */
  renderConsent: async (request: RenderConsentRequest): Promise<PatientConsent> => {
    const response = await getApi().post<PatientConsent>('/consents/render', request);
    return response.data;
  },

  /**
   * Sign consent
   */
  signConsent: async (consentId: string, request: SignConsentRequest): Promise<PatientConsent> => {
    const response = await getApi().post<PatientConsent>(`/consents/${consentId}/sign`, request);
    return response.data;
  },

  /**
   * Revoke consent
   */
  revokeConsent: async (consentId: string, request: RevokeConsentRequest): Promise<PatientConsent> => {
    const response = await getApi().post<PatientConsent>(`/consents/${consentId}/revoke`, request);
    return response.data;
  },

  /**
   * Get consents for a specific session
   */
  getSessionConsents: async (sessionId: string): Promise<PatientConsent[]> => {
    const response = await consentsApi.getAllConsents({ sessionId, pageSize: 100 });
    return response.consents;
  },
};
