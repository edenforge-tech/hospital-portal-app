import { getApi } from '../api';

/**
 * Lab Orders API — counselor-ordered pre-operative investigations
 * Backed by PreOpTestManagementController + lab_test_catalog / counselor_lab_order_items tables.
 */

// ── Types ──────────────────────────────────────────────────────────────────────

export interface LabTestCatalogItem {
  id: string;
  testName: string;
  testCode: string;
  category: string;
  description?: string;
  price: number;
  sampleType?: string;
  turnaroundHours?: number;
  isPreOperative: boolean;
  isActive: boolean;
}

export interface CounselorLabOrderItem {
  id: string;
  testName: string;
  testCode?: string;
  price?: number;
  status: 'Pending' | 'InProgress' | 'Completed' | 'Cancelled';
  urgency: 'Routine' | 'Urgent' | 'STAT';
  notes?: string;
  orderedAt: string;
  completedAt?: string;
  labTestCatalogId?: string;
}

export interface LabOrderTestItem {
  catalogId?: string;
  testName: string;
  testCode?: string;
  price?: number;
}

export interface CreateLabOrderRequest {
  patientId: string;
  sessionId: string;
  tests: LabOrderTestItem[];
  urgency?: 'Routine' | 'Urgent' | 'STAT';
  notes?: string;
}

export interface CreateLabOrderResponse {
  orderedCount: number;
  items: CounselorLabOrderItem[];
}

// ── API client ─────────────────────────────────────────────────────────────────

export const labOrdersApi = {
  /**
   * Fetch the lab test catalog.
   * Pass preOperativeOnly=true to receive only tests relevant to pre-op step.
   */
  async getLabCatalog(preOperativeOnly = true): Promise<LabTestCatalogItem[]> {
    const api = getApi();
    const response = await api.get<LabTestCatalogItem[]>(
      `/PreOpTestManagement/lab-catalog`,
      { params: { preOperativeOnly } }
    );
    return response.data ?? [];
  },

  /**
   * Get all lab orders already placed for a counseling session.
   * Used on widget mount to restore previously ordered items.
   */
  async getSessionLabOrders(sessionId: string): Promise<CounselorLabOrderItem[]> {
    const api = getApi();
    const response = await api.get<CounselorLabOrderItem[]>(
      `/PreOpTestManagement/lab-orders/by-session/${sessionId}`
    );
    return response.data ?? [];
  },

  /**
   * Place one or more lab orders for a counseling session.
   */
  async createLabOrders(request: CreateLabOrderRequest): Promise<CreateLabOrderResponse> {
    const api = getApi();
    const response = await api.post<CreateLabOrderResponse>(
      `/PreOpTestManagement/lab-orders`,
      request
    );
    return response.data;
  },

  /**
   * Soft-delete a single lab order item (counselor removed it before submission).
   */
  async deleteLabOrder(id: string): Promise<void> {
    const api = getApi();
    await api.delete(`/PreOpTestManagement/lab-orders/${id}`);
  },
};
