import { getApi } from '../api';

/**
 * Imaging API - Manage imaging orders (OCT, Visual Field, FFA, Fundus Photography, etc.)
 * Aligned with backend ImagingController.cs and ImagingDtos.cs
 */

// Types
export interface CreateImagingOrderRequest {
  patientId: string;
  examinationId?: string;
  imagingType: string; // "OCT Macula", "OCT RNFL", "Visual Field", "FFA", etc.
  laterality?: 'OD' | 'OS' | 'OU'; // Right eye, Left eye, Both eyes
  urgency?: 'Routine' | 'Urgent' | 'Stat';
  clinicalIndication?: string;
  notes?: string;
}

export interface ImagingOrderResponse {
  id: string;
  patientId: string;
  patientName: string;
  examinationId?: string;
  imagingType: string;
  laterality?: string;
  urgency: string;
  clinicalIndication?: string;
  orderingDoctorId: string;
  orderingDoctorName: string;
  status: string; // "Pending", "In Progress", "Completed", "Reviewed", "Cancelled"
  orderedAt: string;
  completedAt?: string;
  reviewedByUserId?: string;
  reviewedAt?: string;
  resultSummary?: string;
  dicomStudyId?: string;
  imageStoragePath?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateImagingOrderStatusRequest {
  status: string;
  completedAt?: string;
  resultSummary?: string;
  dicomStudyId?: string;
  imageStoragePath?: string;
}

/**
 * Imaging API client
 */
export const imagingApi = {
  /**
   * Create a new imaging order
   */
  async createOrder(request: CreateImagingOrderRequest): Promise<ImagingOrderResponse> {
    const api = getApi();
    const response = await api.post<ImagingOrderResponse>('/Imaging/order', request);
    return response.data;
  },

  /**
   * Get all imaging orders for a patient
   */
  async getPatientOrders(patientId: string): Promise<ImagingOrderResponse[]> {
    const api = getApi();
    const response = await api.get<ImagingOrderResponse[]>(`/Imaging/patient/${patientId}`);
    return response.data;
  },

  /**
   * Get imaging order by ID
   */
  async getOrderById(orderId: string): Promise<ImagingOrderResponse> {
    const api = getApi();
    const response = await api.get<ImagingOrderResponse>(`/Imaging/${orderId}`);
    return response.data;
  },

  /**
   * Update imaging order status (Pending → In Progress → Completed → Reviewed)
   */
  async updateOrderStatus(
    orderId: string,
    updateRequest: UpdateImagingOrderStatusRequest
  ): Promise<ImagingOrderResponse> {
    const api = getApi();
    const response = await api.patch<ImagingOrderResponse>(`/Imaging/${orderId}/status`, updateRequest);
    return response.data;
  },

  /**
   * Get imaging orders by status
   */
  async getOrdersByStatus(status: string): Promise<ImagingOrderResponse[]> {
    const api = getApi();
    const response = await api.get<ImagingOrderResponse[]>(`/Imaging/status/${status}`);
    return response.data;
  },
};
