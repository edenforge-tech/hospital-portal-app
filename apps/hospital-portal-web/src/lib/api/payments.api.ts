// Payment Processing API - Module 3 Counseling Workflow
import { getApi } from '../api';
import type {
  PaymentTransaction,
  PaymentLink,
  PaymentListResponse,
} from '@/types/counselor';

// ============================================================================
// Additional Request Types (not in counselor.ts)
// ============================================================================

export interface CreatePaymentRequest {
  sessionId: string;
  patientId: string;
  transactionType: 'Advance' | 'Partial' | 'Full' | 'Refund' | 'Adjustment';
  paymentMethod: 'Cash' | 'Card' | 'UPI' | 'NetBanking' | 'Cheque' | 'PaymentLink';
  amount: number;
  paymentFor: string;
  receiptRequired: boolean;
  paymentGateway?: string;
  transactionId?: string;
  paymentNotes?: string;
}

export interface ProcessPaymentRequest {
  transactionStatus: 'Pending' | 'Processing' | 'Completed' | 'Failed' | 'Cancelled';
  paymentGateway?: string;
  transactionId?: string;
  paymentNotes?: string;
}

export interface RefundPaymentRequest {
  refundAmount: number;
  refundReason: string;
  refundMethod?: string;
  refundNotes?: string;
}

export interface CreatePaymentLinkRequest {
  sessionId: string;
  patientId: string;
  linkAmount: number;
  expiryDate: string;
  currency?: string;
  recipientPhone?: string;
  recipientEmail?: string;
  linkDescription?: string;
}

export interface PaymentSummary {
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  refundedAmount: number;
  paymentCount: number;
}

// ============================================================================
// API Functions
// ============================================================================

export const paymentsApi = {
  /**
   * Get all payments with filtering
   */
  getPayments: async (params?: {
    page?: number;
    pageSize?: number;
    sessionId?: string;
  }): Promise<PaymentListResponse> => {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.pageSize) query.append('pageSize', params.pageSize.toString());
    if (params?.sessionId) query.append('sessionId', params.sessionId);
    
    const url = `/payments${query.toString() ? `?${query}` : ''}`;
    const response = await getApi().get<PaymentListResponse>(url);
    return response.data;
  },

  /**
   * Get payment by ID
   */
  getPaymentById: async (id: string): Promise<PaymentTransaction> => {
    const response = await getApi().get<PaymentTransaction>(`/payments/${id}`);
    return response.data;
  },

  /**
   * Create payment transaction
   */
  createPayment: async (request: CreatePaymentRequest): Promise<PaymentTransaction> => {
    const response = await getApi().post<PaymentTransaction>('/payments', request);
    return response.data;
  },

  /**
   * Process payment (update status)
   */
  processPayment: async (id: string, request: ProcessPaymentRequest): Promise<PaymentTransaction> => {
    const response = await getApi().post<PaymentTransaction>(`/payments/${id}/process`, request);
    return response.data;
  },

  /**
   * Process refund
   */
  processRefund: async (id: string, request: RefundPaymentRequest): Promise<PaymentTransaction> => {
    const response = await getApi().post<PaymentTransaction>(`/payments/${id}/refund`, request);
    return response.data;
  },

  /**
   * Generate payment link
   */
  generatePaymentLink: async (request: CreatePaymentLinkRequest): Promise<PaymentLink> => {
    const response = await getApi().post<PaymentLink>('/payments/links', request);
    return response.data;
  },

  /**
   * Get payment link by ID
   */
  getPaymentLinkById: async (id: string): Promise<PaymentLink> => {
    const response = await getApi().get<PaymentLink>(`/payments/links/${id}`);
    return response.data;
  },

  /**
   * Send payment link
   */
  sendPaymentLink: async (id: string, method: 'SMS' | 'Email' | 'WhatsApp'): Promise<PaymentLink> => {
    const response = await getApi().post<PaymentLink>(`/payments/links/${id}/send`, { method });
    return response.data;
  },

  /**
   * Get payment summary
   */
  getPaymentSummary: async (params?: {
    startDate?: string;
    endDate?: string;
    branchId?: string;
  }): Promise<PaymentSummary> => {
    const query = new URLSearchParams();
    if (params?.startDate) query.append('startDate', params.startDate);
    if (params?.endDate) query.append('endDate', params.endDate);
    if (params?.branchId) query.append('branchId', params.branchId);
    
    const url = `/payments/summary${query.toString() ? `?${query}` : ''}`;
    const response = await getApi().get<PaymentSummary>(url);
    return response.data;
  },

  /**
   * Get payments for a specific session
   */
  getSessionPayments: async (sessionId: string): Promise<PaymentTransaction[]> => {
    const response = await paymentsApi.getPayments({ sessionId, pageSize: 100 });
    return response.payments || response.Payments || [];
  },
};
