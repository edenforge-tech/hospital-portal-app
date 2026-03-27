import { getApi } from '../api';

export interface OpticalOrder {
  id: string;
  patientId: string;
  visitId?: string;
  tenantId?: string;
  orderNumber?: string;
  orderType: string; // eyeglasses, contact_lenses, sunglasses, safety_glasses
  // Right eye (OD)
  odSphere?: string;
  odCylinder?: string;
  odAxis?: string;
  odAdd?: string;
  odPrism?: string;
  odVa?: string;
  // Left eye (OS)
  osSphere?: string;
  osCylinder?: string;
  osAxis?: string;
  osAdd?: string;
  osPrism?: string;
  osVa?: string;
  // PD
  pd?: string;
  pdRight?: string;
  pdLeft?: string;
  segHeight?: string;
  // Frame
  frameType?: string;
  frameBrand?: string;
  frameModel?: string;
  frameColor?: string;
  // Lens
  lensType?: string;
  lensMaterial?: string;
  lensCoating?: string;
  tint?: string;
  // Order info
  orderDate?: string;
  estimatedDelivery?: string;
  deliveredAt?: string;
  amount?: number;
  paidAmount?: number;
  prescribedByName?: string;
  prescribedById?: string;
  notes?: string;
  status: string; // ordered, in_production, ready, delivered, cancelled, returned
  createdAt: string;
  updatedAt?: string;
}

export interface OpticalOrderFormData {
  patientId: string;
  visitId?: string;
  orderType: string;
  odSphere?: string;
  odCylinder?: string;
  odAxis?: string;
  odAdd?: string;
  odPrism?: string;
  odVa?: string;
  osSphere?: string;
  osCylinder?: string;
  osAxis?: string;
  osAdd?: string;
  osPrism?: string;
  osVa?: string;
  pd?: string;
  pdRight?: string;
  pdLeft?: string;
  segHeight?: string;
  frameType?: string;
  frameBrand?: string;
  frameModel?: string;
  frameColor?: string;
  lensType?: string;
  lensMaterial?: string;
  lensCoating?: string;
  tint?: string;
  orderDate?: string;
  estimatedDelivery?: string;
  amount?: number;
  prescribedByName?: string;
  prescribedById?: string;
  notes?: string;
  status?: string;
}

export const opticalOrdersApi = {
  async getByPatient(patientId: string, status?: string) {
    const api = getApi();
    const query = status ? `?status=${status}` : '';
    return api.get<OpticalOrder[]>(`/optical-orders/patient/${patientId}${query}`);
  },

  async getById(id: string) {
    const api = getApi();
    return api.get<OpticalOrder>(`/optical-orders/${id}`);
  },

  async create(data: OpticalOrderFormData) {
    const api = getApi();
    return api.post<OpticalOrder>('/optical-orders', data);
  },

  async update(id: string, data: Partial<OpticalOrderFormData>) {
    const api = getApi();
    return api.put<OpticalOrder>(`/optical-orders/${id}`, data);
  },

  async markDelivered(id: string) {
    const api = getApi();
    return api.post<OpticalOrder>(`/optical-orders/${id}/deliver`);
  },

  async delete(id: string) {
    const api = getApi();
    return api.delete(`/optical-orders/${id}`);
  },
};
