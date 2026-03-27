// Module 3.6 - Insurance Pre-Authorization Workflow API
import { getApi } from '../api';

export interface InsurancePreAuthorization {
  id: string;
  tenantId: string;
  patientId: string;
  insuranceProvider: string;
  policyNumber: string;
  estimatedAmount: number;
  approvedAmount?: number;
  surgeryType: string;
  surgeryDate: string;
  diagnosis: string;
  currentStage: string;
  currentStatus: string;
  requestedBy: string;
  requestedAt: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePreAuthorizationRequest {
  patientId: string;
  insuranceProvider: string;
  policyNumber: string;
  estimatedAmount: number;
  surgeryType: string;
  surgeryDate: string;
  diagnosis: string;
  requestedBy: string;
  notes?: string;
}

export interface SubmitToTPARequest {
  tpaName: string;
  tpaContactPerson: string;
  tpaEmail: string;
  tpaPhone: string;
  urgencyLevel: 'Low' | 'Normal' | 'High' | 'Critical';
}

export interface ApprovalWorkflow {
  id: string;
  preauthorizationId: string;
  currentStage: string;
  currentStatus: string;
  createdAt: string;
  updatedAt: string;
}

export interface InsuranceDocument {
  id: string;
  preauthorizationId: string;
  documentType: string;
  fileName: string;
  filePath: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface TPACommunicationLog {
  id: string;
  preauthorizationId: string;
  communicationType: string;
  sentBy: string;
  sentAt: string;
  receivedBy?: string;
  receivedAt?: string;
  messageContent: string;
  responseContent?: string;
}

class InsuranceApi {
  // Pre-Authorization endpoints
  async getAllPreAuthorizations(filters?: {
    status?: string;
    patientId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<InsurancePreAuthorization[]> {
    const api = getApi();
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.patientId) params.append('patientId', filters.patientId);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    
    const query = params.toString() ? `?${params.toString()}` : '';
    const response = await api.get(`/insurance/pre-authorizations${query}`);
    return response.data;
  }

  async getPreAuthorizationById(id: string): Promise<InsurancePreAuthorization> {
    const api = getApi();
    const response = await api.get(`/insurance/pre-authorizations/${id}`);
    return response.data;
  }

  async createPreAuthorization(data: CreatePreAuthorizationRequest): Promise<InsurancePreAuthorization> {
    const api = getApi();
    const response = await api.post('/insurance/pre-authorizations', data);
    return response.data;
  }

  async updatePreAuthorization(id: string, data: Partial<CreatePreAuthorizationRequest>): Promise<InsurancePreAuthorization> {
    const api = getApi();
    const response = await api.put(`/insurance/pre-authorizations/${id}`, data);
    return response.data;
  }

  async deletePreAuthorization(id: string): Promise<void> {
    const api = getApi();
    await api.delete(`/insurance/pre-authorizations/${id}`);
  }

  async submitToTPA(id: string, data: SubmitToTPARequest): Promise<InsurancePreAuthorization> {
    const api = getApi();
    const response = await api.post(`/insurance/pre-authorizations/${id}/submit-to-tpa`, data);
    return response.data;
  }

  async approvePreAuthorization(id: string, approvedAmount: number, notes?: string): Promise<InsurancePreAuthorization> {
    const api = getApi();
    const response = await api.post(`/insurance/pre-authorizations/${id}/approve`, {
      approvedAmount,
      notes
    });
    return response.data;
  }

  async rejectPreAuthorization(id: string, rejectionReason: string): Promise<InsurancePreAuthorization> {
    const api = getApi();
    const response = await api.post(`/insurance/pre-authorizations/${id}/reject`, {
      rejectionReason
    });
    return response.data;
  }

  // Approval Workflow endpoints
  async getWorkflowByPreAuthId(preAuthId: string): Promise<ApprovalWorkflow> {
    const api = getApi();
    const response = await api.get(`/insurance/pre-authorizations/${preAuthId}/workflow`);
    return response.data;
  }

  async updateWorkflowStage(workflowId: string, newStage: string, notes?: string): Promise<ApprovalWorkflow> {
    const api = getApi();
    const response = await api.put(`/insurance/workflows/${workflowId}/stage`, {
      newStage,
      notes
    });
    return response.data;
  }

  // Insurance Documents endpoints
  async getDocumentsByPreAuthId(preAuthId: string): Promise<InsuranceDocument[]> {
    const api = getApi();
    const response = await api.get(`/insurance/pre-authorizations/${preAuthId}/documents`);
    return response.data;
  }

  async uploadDocument(preAuthId: string, file: File, documentType: string): Promise<InsuranceDocument> {
    const api = getApi();
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', documentType);
    
    const response = await api.post(`/insurance/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }

  async deleteDocument(documentId: string): Promise<void> {
    const api = getApi();
    await api.delete(`/insurance/documents/${documentId}`);
  }

  // TPA Communication endpoints
  async getCommunicationLogs(preAuthId: string): Promise<TPACommunicationLog[]> {
    const api = getApi();
    const response = await api.get(`/insurance/pre-authorizations/${preAuthId}/communications`);
    return response.data;
  }

  async logCommunication(preAuthId: string, data: {
    communicationType: string;
    messageContent: string;
    responseContent?: string;
  }): Promise<TPACommunicationLog> {
    const api = getApi();
    const response = await api.post(`/insurance/communications`, {
      preauthorizationId: preAuthId,
      ...data
    });
    return response.data;
  }

  // Statistics and Reports
  async getStatistics(startDate?: string, endDate?: string): Promise<{
    totalPreAuthorizations: number;
    pendingCount: number;
    approvedCount: number;
    rejectedCount: number;
    totalEstimatedAmount: number;
    totalApprovedAmount: number;
    averageProcessingTime: number;
  }> {
    const api = getApi();
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const query = params.toString() ? `?${params.toString()}` : '';
    const response = await api.get(`/insurance/statistics${query}`);
    return response.data;
  }
}

export const insuranceApi = new InsuranceApi();
