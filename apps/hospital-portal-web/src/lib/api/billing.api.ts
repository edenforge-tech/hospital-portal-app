/**
 * Billing & Insurance API Service
 * Claims processing, payments, invoicing, insurance management
 */

import { getApi } from '../api';

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface Invoice {
  id: string;
  tenantId: string;
  invoiceNumber: string;
  patientId: string;
  patientName: string;
  mrn: string;
  encounterId?: string;
  encounterDate?: string;
  accountId?: string;
  status: InvoiceStatus;
  type: InvoiceType;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  adjustmentAmount: number;
  totalAmount: number;
  paidAmount: number;
  balanceDue: number;
  currency: string;
  issueDate: string;
  dueDate: string;
  paidDate?: string;
  lineItems: InvoiceLineItem[];
  payments: Payment[];
  insuranceClaims?: InsuranceClaim[];
  notes?: string;
  billingAddressId?: string;
  billingAddress?: Address;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export type InvoiceStatus = 
  | 'draft'
  | 'pending'
  | 'sent'
  | 'partially_paid'
  | 'paid'
  | 'overdue'
  | 'cancelled'
  | 'written_off'
  | 'disputed';

export type InvoiceType = 
  | 'patient_responsibility'
  | 'insurance_claim'
  | 'self_pay'
  | 'third_party'
  | 'facility_fee'
  | 'professional_fee';

export interface InvoiceLineItem {
  id: string;
  description: string;
  serviceDate: string;
  cptCode?: string;
  hcpcsCode?: string;
  revenueCode?: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  amount: number;
  providerId?: string;
  providerName?: string;
  departmentId?: string;
  departmentName?: string;
  diagnosisCodes?: string[];
  modifiers?: string[];
  notes?: string;
}

export interface Payment {
  id: string;
  tenantId: string;
  invoiceId: string;
  paymentNumber: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  referenceNumber?: string;
  payerId: string;
  payerName: string;
  payerType: 'patient' | 'insurance' | 'guarantor' | 'other';
  paymentDate: string;
  postedDate: string;
  notes?: string;
  checkNumber?: string;
  cardLastFour?: string;
  cardBrand?: string;
  createdById: string;
  createdAt: string;
}

export type PaymentMethod = 
  | 'cash'
  | 'check'
  | 'credit_card'
  | 'debit_card'
  | 'ach'
  | 'wire_transfer'
  | 'insurance_payment'
  | 'payment_plan'
  | 'other';

export type PaymentStatus = 
  | 'pending'
  | 'completed'
  | 'failed'
  | 'refunded'
  | 'voided'
  | 'chargeback';

export interface InsuranceClaim {
  id: string;
  tenantId: string;
  claimNumber: string;
  patientId: string;
  patientName: string;
  mrn: string;
  insurancePolicyId: string;
  insuranceCompanyId: string;
  insuranceCompanyName: string;
  policyNumber: string;
  groupNumber?: string;
  encounterId?: string;
  invoiceId?: string;
  status: ClaimStatus;
  type: ClaimType;
  filingIndicator: FilingIndicator;
  totalCharges: number;
  allowedAmount?: number;
  paidAmount?: number;
  patientResponsibility?: number;
  adjustments: ClaimAdjustment[];
  serviceDateFrom: string;
  serviceDateTo: string;
  submissionDate?: string;
  receivedDate?: string;
  adjudicationDate?: string;
  paymentDate?: string;
  claimLines: ClaimLine[];
  diagnoses: ClaimDiagnosis[];
  attachments?: ClaimAttachment[];
  statusHistory: ClaimStatusHistory[];
  denialReason?: string;
  appealDeadline?: string;
  notes?: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export type ClaimStatus = 
  | 'draft'
  | 'ready_to_submit'
  | 'submitted'
  | 'acknowledged'
  | 'pending'
  | 'in_review'
  | 'partially_paid'
  | 'paid'
  | 'denied'
  | 'appealed'
  | 'voided'
  | 'rejected';

export type ClaimType = 'professional' | 'institutional' | 'dental' | 'pharmacy';
export type FilingIndicator = 'primary' | 'secondary' | 'tertiary' | 'self_pay';

export interface ClaimLine {
  id: string;
  lineNumber: number;
  serviceDate: string;
  placeOfService: string;
  cptCode: string;
  hcpcsCode?: string;
  revenueCode?: string;
  modifiers?: string[];
  diagnosisPointers: number[];
  quantity: number;
  unitPrice: number;
  chargeAmount: number;
  allowedAmount?: number;
  paidAmount?: number;
  adjustmentAmount?: number;
  patientResponsibility?: number;
  renderingProviderId?: string;
  renderingProviderNpi?: string;
  notes?: string;
}

export interface ClaimDiagnosis {
  sequence: number;
  code: string;
  type: 'principal' | 'admitting' | 'other';
  presentOnAdmission?: 'Y' | 'N' | 'W' | 'U';
}

export interface ClaimAdjustment {
  id: string;
  groupCode: string;
  reasonCode: string;
  amount: number;
  description?: string;
}

export interface ClaimAttachment {
  id: string;
  type: string;
  fileName: string;
  fileUrl: string;
  uploadedAt: string;
}

export interface ClaimStatusHistory {
  status: ClaimStatus;
  timestamp: string;
  notes?: string;
  userId?: string;
  userName?: string;
}

export interface InsurancePolicy {
  id: string;
  tenantId: string;
  patientId: string;
  insuranceCompanyId: string;
  insuranceCompany: InsuranceCompany;
  policyNumber: string;
  groupNumber?: string;
  groupName?: string;
  subscriberId: string;
  subscriberName: string;
  relationshipToSubscriber: 'self' | 'spouse' | 'child' | 'other';
  planType: PlanType;
  planName?: string;
  priority: 'primary' | 'secondary' | 'tertiary';
  effectiveDate: string;
  terminationDate?: string;
  isActive: boolean;
  copay?: number;
  deductible?: number;
  deductibleMet?: number;
  outOfPocketMax?: number;
  outOfPocketMet?: number;
  coinsurance?: number;
  preAuthRequired?: boolean;
  referralRequired?: boolean;
  verificationDate?: string;
  verificationStatus?: 'verified' | 'pending' | 'failed' | 'expired';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type PlanType = 
  | 'hmo'
  | 'ppo'
  | 'epo'
  | 'pos'
  | 'hdhp'
  | 'medicare'
  | 'medicaid'
  | 'tricare'
  | 'workers_comp'
  | 'auto_insurance'
  | 'other';

export interface InsuranceCompany {
  id: string;
  tenantId: string;
  name: string;
  shortName?: string;
  payerId: string;
  clearinghouseId?: string;
  address?: Address;
  phone?: string;
  fax?: string;
  email?: string;
  website?: string;
  electronicPayerId?: string;
  claimFilingAddress?: Address;
  claimFilingMethod: 'electronic' | 'paper' | 'both';
  averagePaymentDays?: number;
  contractStatus?: 'in_network' | 'out_of_network' | 'pending';
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface PatientAccount {
  id: string;
  tenantId: string;
  patientId: string;
  patientName: string;
  mrn: string;
  accountNumber: string;
  status: 'active' | 'inactive' | 'collections' | 'closed';
  totalCharges: number;
  totalPayments: number;
  totalAdjustments: number;
  currentBalance: number;
  insuranceBalance: number;
  patientBalance: number;
  lastPaymentDate?: string;
  lastPaymentAmount?: number;
  paymentPlan?: PaymentPlan;
  guarantor?: Guarantor;
  creditScore?: number;
  collectionsStatus?: 'none' | 'pre_collections' | 'collections' | 'bad_debt';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentPlan {
  id: string;
  status: 'active' | 'completed' | 'defaulted' | 'cancelled';
  totalAmount: number;
  remainingAmount: number;
  installmentAmount: number;
  frequency: 'weekly' | 'bi_weekly' | 'monthly';
  startDate: string;
  endDate?: string;
  nextPaymentDate: string;
  paymentsCompleted: number;
  totalPayments: number;
  autoPayEnabled: boolean;
  paymentMethod?: PaymentMethod;
}

export interface Guarantor {
  id: string;
  firstName: string;
  lastName: string;
  relationship: string;
  phone: string;
  email?: string;
  address?: Address;
  employerName?: string;
  employerPhone?: string;
}

export interface FeeSchedule {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  type: 'standard' | 'insurance_contracted' | 'medicare' | 'medicaid' | 'custom';
  effectiveDate: string;
  expirationDate?: string;
  insuranceCompanyId?: string;
  items: FeeScheduleItem[];
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FeeScheduleItem {
  id: string;
  cptCode: string;
  hcpcsCode?: string;
  description: string;
  standardFee: number;
  allowedAmount?: number;
  medicareRate?: number;
  modifiers?: { code: string; fee: number }[];
}

export interface BillingStatement {
  id: string;
  statementNumber: string;
  patientId: string;
  patientName: string;
  accountId: string;
  statementDate: string;
  dueDate: string;
  previousBalance: number;
  newCharges: number;
  payments: number;
  adjustments: number;
  currentBalance: number;
  minimumDue: number;
  invoices: string[];
  status: 'generated' | 'sent' | 'viewed' | 'paid';
  deliveryMethod: 'mail' | 'email' | 'portal' | 'all';
  sentAt?: string;
  viewedAt?: string;
}

export interface ERA {
  id: string;
  tenantId: string;
  eraNumber: string;
  payerId: string;
  payerName: string;
  checkNumber?: string;
  checkDate?: string;
  totalPaid: number;
  receivedDate: string;
  processedDate?: string;
  status: 'received' | 'processing' | 'posted' | 'exception';
  claimPayments: ERAClaimPayment[];
  exceptions?: ERAException[];
  createdAt: string;
}

export interface ERAClaimPayment {
  claimNumber: string;
  patientName: string;
  serviceDate: string;
  chargeAmount: number;
  allowedAmount: number;
  paidAmount: number;
  adjustmentAmount: number;
  patientResponsibility: number;
  remarkCodes?: string[];
  adjustmentCodes?: string[];
  status: 'matched' | 'unmatched' | 'partial_match';
}

export interface ERAException {
  type: 'unmatched_claim' | 'amount_mismatch' | 'patient_not_found' | 'other';
  description: string;
  claimNumber?: string;
  resolution?: string;
  resolvedAt?: string;
  resolvedById?: string;
}

export interface BillingDashboardMetrics {
  totalCharges: number;
  totalCollections: number;
  outstandingAR: number;
  insuranceAR: number;
  patientAR: number;
  daysInAR: number;
  collectionRate: number;
  denialRate: number;
  cleanClaimRate: number;
  arAgingBuckets: {
    current: number;
    days30: number;
    days60: number;
    days90: number;
    days120Plus: number;
  };
  monthlyTrend: {
    month: string;
    charges: number;
    collections: number;
    adjustments: number;
  }[];
  claimsByStatus: {
    status: ClaimStatus;
    count: number;
    amount: number;
  }[];
  topDenialReasons: {
    reason: string;
    count: number;
    amount: number;
  }[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ============================================================================
// API Functions
// ============================================================================

export const invoicesApi = {
  // List invoices
  list: async (
    page = 1,
    pageSize = 20,
    filters?: {
      patientId?: string;
      status?: InvoiceStatus;
      startDate?: string;
      endDate?: string;
    }
  ): Promise<PaginatedResponse<Invoice>> => {
    const api = getApi();
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
      ...(filters?.patientId && { patientId: filters.patientId }),
      ...(filters?.status && { status: filters.status }),
      ...(filters?.startDate && { startDate: filters.startDate }),
      ...(filters?.endDate && { endDate: filters.endDate }),
    });
    const response = await api.get(`/invoices?${params}`);
    return response.data;
  },

  // Get invoice
  get: async (id: string): Promise<Invoice> => {
    const api = getApi();
    const response = await api.get(`/invoices/${id}`);
    return response.data;
  },

  // Create invoice
  create: async (data: Partial<Invoice>): Promise<Invoice> => {
    const api = getApi();
    const response = await api.post('/invoices', data);
    return response.data;
  },

  // Update invoice
  update: async (id: string, data: Partial<Invoice>): Promise<Invoice> => {
    const api = getApi();
    const response = await api.put(`/invoices/${id}`, data);
    return response.data;
  },

  // Send invoice
  send: async (id: string, method: 'email' | 'mail' | 'portal' = 'email'): Promise<Invoice> => {
    const api = getApi();
    const response = await api.post(`/invoices/${id}/send`, { method });
    return response.data;
  },

  // Void invoice
  void: async (id: string, reason: string): Promise<Invoice> => {
    const api = getApi();
    const response = await api.post(`/invoices/${id}/void`, { reason });
    return response.data;
  },

  // Apply discount
  applyDiscount: async (id: string, amount: number, reason: string): Promise<Invoice> => {
    const api = getApi();
    const response = await api.post(`/invoices/${id}/discount`, { amount, reason });
    return response.data;
  },

  // Generate PDF
  generatePdf: async (id: string): Promise<Blob> => {
    const api = getApi();
    const response = await api.get(`/invoices/${id}/pdf`, { responseType: 'blob' });
    return response.data;
  },

  // Generate from encounter
  generateFromEncounter: async (encounterId: string): Promise<Invoice> => {
    const api = getApi();
    const response = await api.post(`/invoices/generate-from-encounter/${encounterId}`);
    return response.data;
  },
};

export const paymentsApi = {
  // List payments
  list: async (
    page = 1,
    pageSize = 20,
    filters?: {
      invoiceId?: string;
      patientId?: string;
      method?: PaymentMethod;
      startDate?: string;
      endDate?: string;
    }
  ): Promise<PaginatedResponse<Payment>> => {
    const api = getApi();
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
      ...(filters?.invoiceId && { invoiceId: filters.invoiceId }),
      ...(filters?.patientId && { patientId: filters.patientId }),
      ...(filters?.method && { method: filters.method }),
      ...(filters?.startDate && { startDate: filters.startDate }),
      ...(filters?.endDate && { endDate: filters.endDate }),
    });
    const response = await api.get(`/payments?${params}`);
    return response.data;
  },

  // Record payment
  record: async (data: Partial<Payment>): Promise<Payment> => {
    const api = getApi();
    const response = await api.post('/payments', data);
    return response.data;
  },

  // Void payment
  void: async (id: string, reason: string): Promise<Payment> => {
    const api = getApi();
    const response = await api.post(`/payments/${id}/void`, { reason });
    return response.data;
  },

  // Refund payment
  refund: async (id: string, amount: number, reason: string): Promise<Payment> => {
    const api = getApi();
    const response = await api.post(`/payments/${id}/refund`, { amount, reason });
    return response.data;
  },

  // Process credit card
  processCard: async (
    invoiceId: string,
    cardDetails: {
      cardNumber: string;
      expiryMonth: string;
      expiryYear: string;
      cvv: string;
      amount: number;
    }
  ): Promise<Payment> => {
    const api = getApi();
    const response = await api.post('/payments/process-card', { invoiceId, ...cardDetails });
    return response.data;
  },
};

export const claimsApi = {
  // List claims
  list: async (
    page = 1,
    pageSize = 20,
    filters?: {
      patientId?: string;
      status?: ClaimStatus;
      insuranceCompanyId?: string;
      startDate?: string;
      endDate?: string;
    }
  ): Promise<PaginatedResponse<InsuranceClaim>> => {
    const api = getApi();
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
      ...(filters?.patientId && { patientId: filters.patientId }),
      ...(filters?.status && { status: filters.status }),
      ...(filters?.insuranceCompanyId && { insuranceCompanyId: filters.insuranceCompanyId }),
      ...(filters?.startDate && { startDate: filters.startDate }),
      ...(filters?.endDate && { endDate: filters.endDate }),
    });
    const response = await api.get(`/claims?${params}`);
    return response.data;
  },

  // Get claim
  get: async (id: string): Promise<InsuranceClaim> => {
    const api = getApi();
    const response = await api.get(`/claims/${id}`);
    return response.data;
  },

  // Create claim
  create: async (data: Partial<InsuranceClaim>): Promise<InsuranceClaim> => {
    const api = getApi();
    const response = await api.post('/claims', data);
    return response.data;
  },

  // Update claim
  update: async (id: string, data: Partial<InsuranceClaim>): Promise<InsuranceClaim> => {
    const api = getApi();
    const response = await api.put(`/claims/${id}`, data);
    return response.data;
  },

  // Submit claim
  submit: async (id: string): Promise<InsuranceClaim> => {
    const api = getApi();
    const response = await api.post(`/claims/${id}/submit`);
    return response.data;
  },

  // Batch submit claims
  batchSubmit: async (claimIds: string[]): Promise<{ submitted: number; errors: string[] }> => {
    const api = getApi();
    const response = await api.post('/claims/batch-submit', { claimIds });
    return response.data;
  },

  // Void claim
  void: async (id: string, reason: string): Promise<InsuranceClaim> => {
    const api = getApi();
    const response = await api.post(`/claims/${id}/void`, { reason });
    return response.data;
  },

  // Appeal claim
  appeal: async (id: string, appealData: {
    reason: string;
    supportingDocuments?: string[];
    notes?: string;
  }): Promise<InsuranceClaim> => {
    const api = getApi();
    const response = await api.post(`/claims/${id}/appeal`, appealData);
    return response.data;
  },

  // Rebill claim
  rebill: async (id: string, changes?: Partial<InsuranceClaim>): Promise<InsuranceClaim> => {
    const api = getApi();
    const response = await api.post(`/claims/${id}/rebill`, changes);
    return response.data;
  },

  // Generate from invoice
  generateFromInvoice: async (invoiceId: string, policyId: string): Promise<InsuranceClaim> => {
    const api = getApi();
    const response = await api.post(`/claims/generate-from-invoice/${invoiceId}`, { policyId });
    return response.data;
  },

  // Scrub claim (pre-submission validation)
  scrub: async (id: string): Promise<{
    isClean: boolean;
    errors: { field: string; message: string; severity: 'error' | 'warning' }[];
  }> => {
    const api = getApi();
    const response = await api.post(`/claims/${id}/scrub`);
    return response.data;
  },
};

export const insurancePoliciesApi = {
  // List policies for patient
  list: async (patientId: string): Promise<InsurancePolicy[]> => {
    const api = getApi();
    const response = await api.get(`/patients/${patientId}/insurance-policies`);
    return response.data;
  },

  // Get policy
  get: async (id: string): Promise<InsurancePolicy> => {
    const api = getApi();
    const response = await api.get(`/insurance-policies/${id}`);
    return response.data;
  },

  // Create policy
  create: async (data: Partial<InsurancePolicy>): Promise<InsurancePolicy> => {
    const api = getApi();
    const response = await api.post('/insurance-policies', data);
    return response.data;
  },

  // Update policy
  update: async (id: string, data: Partial<InsurancePolicy>): Promise<InsurancePolicy> => {
    const api = getApi();
    const response = await api.put(`/insurance-policies/${id}`, data);
    return response.data;
  },

  // Verify eligibility
  verifyEligibility: async (id: string): Promise<{
    isEligible: boolean;
    effectiveDate: string;
    terminationDate?: string;
    copay?: number;
    deductible?: number;
    deductibleMet?: number;
    outOfPocketMax?: number;
    outOfPocketMet?: number;
    coverageDetails?: Record<string, string>;
  }> => {
    const api = getApi();
    const response = await api.post(`/insurance-policies/${id}/verify`);
    return response.data;
  },

  // Terminate policy
  terminate: async (id: string, terminationDate: string, reason: string): Promise<InsurancePolicy> => {
    const api = getApi();
    const response = await api.post(`/insurance-policies/${id}/terminate`, { terminationDate, reason });
    return response.data;
  },
};

export const insuranceCompaniesApi = {
  // List companies
  list: async (search?: string): Promise<InsuranceCompany[]> => {
    const api = getApi();
    const params = search ? `?search=${encodeURIComponent(search)}` : '';
    const response = await api.get(`/insurance-companies${params}`);
    return response.data;
  },

  // Get company
  get: async (id: string): Promise<InsuranceCompany> => {
    const api = getApi();
    const response = await api.get(`/insurance-companies/${id}`);
    return response.data;
  },

  // Create company
  create: async (data: Partial<InsuranceCompany>): Promise<InsuranceCompany> => {
    const api = getApi();
    const response = await api.post('/insurance-companies', data);
    return response.data;
  },

  // Update company
  update: async (id: string, data: Partial<InsuranceCompany>): Promise<InsuranceCompany> => {
    const api = getApi();
    const response = await api.put(`/insurance-companies/${id}`, data);
    return response.data;
  },
};

export const patientAccountsApi = {
  // Get account
  get: async (patientId: string): Promise<PatientAccount> => {
    const api = getApi();
    const response = await api.get(`/patients/${patientId}/account`);
    return response.data;
  },

  // Get account statement
  getStatement: async (accountId: string): Promise<BillingStatement> => {
    const api = getApi();
    const response = await api.get(`/patient-accounts/${accountId}/statement`);
    return response.data;
  },

  // Create payment plan
  createPaymentPlan: async (accountId: string, plan: Partial<PaymentPlan>): Promise<PaymentPlan> => {
    const api = getApi();
    const response = await api.post(`/patient-accounts/${accountId}/payment-plan`, plan);
    return response.data;
  },

  // Update payment plan
  updatePaymentPlan: async (accountId: string, planId: string, data: Partial<PaymentPlan>): Promise<PaymentPlan> => {
    const api = getApi();
    const response = await api.put(`/patient-accounts/${accountId}/payment-plan/${planId}`, data);
    return response.data;
  },

  // Send to collections
  sendToCollections: async (accountId: string, agencyId: string): Promise<PatientAccount> => {
    const api = getApi();
    const response = await api.post(`/patient-accounts/${accountId}/send-to-collections`, { agencyId });
    return response.data;
  },
};

export const feeSchedulesApi = {
  // List fee schedules
  list: async (): Promise<FeeSchedule[]> => {
    const api = getApi();
    const response = await api.get('/fee-schedules');
    return response.data;
  },

  // Get fee schedule
  get: async (id: string): Promise<FeeSchedule> => {
    const api = getApi();
    const response = await api.get(`/fee-schedules/${id}`);
    return response.data;
  },

  // Create fee schedule
  create: async (data: Partial<FeeSchedule>): Promise<FeeSchedule> => {
    const api = getApi();
    const response = await api.post('/fee-schedules', data);
    return response.data;
  },

  // Update fee schedule
  update: async (id: string, data: Partial<FeeSchedule>): Promise<FeeSchedule> => {
    const api = getApi();
    const response = await api.put(`/fee-schedules/${id}`, data);
    return response.data;
  },

  // Look up fee
  lookupFee: async (cptCode: string, feeScheduleId?: string): Promise<FeeScheduleItem | null> => {
    const api = getApi();
    const params = feeScheduleId ? `?feeScheduleId=${feeScheduleId}` : '';
    const response = await api.get(`/fee-schedules/lookup/${cptCode}${params}`);
    return response.data;
  },
};

export const eraApi = {
  // List ERAs
  list: async (
    page = 1,
    pageSize = 20,
    status?: ERA['status']
  ): Promise<PaginatedResponse<ERA>> => {
    const api = getApi();
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
      ...(status && { status }),
    });
    const response = await api.get(`/era?${params}`);
    return response.data;
  },

  // Get ERA
  get: async (id: string): Promise<ERA> => {
    const api = getApi();
    const response = await api.get(`/era/${id}`);
    return response.data;
  },

  // Process ERA (auto-post payments)
  process: async (id: string): Promise<ERA> => {
    const api = getApi();
    const response = await api.post(`/era/${id}/process`);
    return response.data;
  },

  // Resolve exception
  resolveException: async (eraId: string, exceptionIndex: number, resolution: string): Promise<ERA> => {
    const api = getApi();
    const response = await api.post(`/era/${eraId}/exceptions/${exceptionIndex}/resolve`, { resolution });
    return response.data;
  },
};

export const billingDashboardApi = {
  // Get dashboard metrics
  getMetrics: async (startDate?: string, endDate?: string): Promise<BillingDashboardMetrics> => {
    const api = getApi();
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const queryString = params.toString() ? `?${params}` : '';
    const response = await api.get(`/billing/dashboard${queryString}`);
    return response.data;
  },

  // Get AR aging report
  getArAgingReport: async (): Promise<{
    bucket: string;
    insuranceAmount: number;
    patientAmount: number;
    totalAmount: number;
    claimCount: number;
  }[]> => {
    const api = getApi();
    const response = await api.get('/billing/reports/ar-aging');
    return response.data;
  },

  // Get denial analysis
  getDenialAnalysis: async (startDate?: string, endDate?: string): Promise<{
    denialReason: string;
    count: number;
    amount: number;
    appealSuccessRate: number;
  }[]> => {
    const api = getApi();
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const queryString = params.toString() ? `?${params}` : '';
    const response = await api.get(`/billing/reports/denial-analysis${queryString}`);
    return response.data;
  },
};
