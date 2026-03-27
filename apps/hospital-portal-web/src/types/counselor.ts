// Counselor Module Types - Module 3 (Insurance, Payments, Admissions, Consents, Workflow)

// ==================== Module 3.6 Insurance ====================

export interface InsurancePreAuth {
  id: string;
  tenantId: string;
  branchId: string;
  sessionId: string;
  patientId: string;
  insuranceType: string;
  insuranceProvider: string;
  tpaName?: string;
  policyNumber: string;
  policyHolderName: string;
  relationshipToPatient?: string;
  surgeryType: string;
  plannedProcedure: string;
  diagnosisCode: string;
  procedureCode: string;
  eyeOperated?: string;
  requestedAmount: number;
  approvedAmount?: number;
  copayAmount?: number;
  deductibleAmount?: number;
  status: string;
  submittedDate: string;
  approvedDate?: string;
  rejectionReason?: string;
  itemizedBreakdown?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InsuranceClaim {
  id: string;
  tenantId: string;
  branchId: string;
  preAuthId?: string;
  sessionId: string;
  patientId: string;
  claimNumber: string;
  insuranceProvider: string;
  tpaName?: string;
  policyNumber: string;
  claimType: string;
  claimAmount: number;
  approvedAmount?: number;
  settledAmount?: number;
  claimStatus: string;
  submissionDate: string;
  settlementDate?: string;
  itemizedBills?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

// ==================== Module 3.7 Payments ====================

export interface PaymentTransaction {
  id: string;
  tenantId: string;
  branchId: string;
  sessionId: string;
  patientId: string;
  transactionNumber: string;
  transactionType: string;
  paymentMethod: string;
  amount: number;
  paymentFor: string;
  transactionStatus: string;
  paymentDate: string;
  refundAmount?: number;
  refundDate?: string;
  refundReason?: string;
  receiptNumber?: string;
  receiptRequired: boolean;
  receiptGeneratedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentLink {
  id: string;
  tenantId: string;
  sessionId: string;
  patientId: string;
  linkAmount: number;
  fullUrl: string;
  paymentLinkId?: string;
  qrCodeUrl?: string;
  linkStatus: string;
  expiryDate: string;
  currency: string;
  recipientPhone?: string;
  recipientEmail?: string;
  sentAt?: string;
  sentVia?: string;
  reminderSentCount: number;
  lastReminderSentAt?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GovernmentSchemeClaim {
  id: string;
  tenantId: string;
  branchId: string;
  sessionId: string;
  patientId: string;
  schemeType: string;
  schemeName: string;
  cardNumber?: string;
  claimAmount: number;
  approvedAmount?: number;
  claimStatus: string;
  applicationNumber: string;
  submittedDate: string;
  approvalDate?: string;
  reimbursementDate?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

// ==================== Module 3.5 Packages ====================

export interface SurgeryPackageTemplateDto {
  id: string;
  tenantId: string;
  packageName: string;
  packageCode?: string;
  packageCategory: string;
  description?: string;
  basePrice: number;
  currency: string;
  maxDiscountPercent: number;
  requiresApprovalForCustom: boolean;
  applicableSurgeryTypes?: string[];
  includedServices?: string[];
  validityDays: number;
  isActive: boolean;
  createdAt: string;
}

export interface CounselorPackageDto {
  id: string;
  tenantId: string;
  branchId: string;
  packageNumber: string;
  templateId?: string;
  sessionId: string;
  patientId: string;
  packageName: string;
  packageCategory: string;
  basePrice: number;
  discountPercent: number;
  discountAmount: number;
  finalPrice: number;
  packageStatus: string;
  customizedItems?: string;
  counselorNotes?: string;
  approvedByUserId?: string;
  approvedAt?: string;
  validUntil?: string;
  createdAt: string;
  updatedAt: string;
  patientName?: string;
  patientMRN?: string;
}

export interface PackageFilters {
  tenantId?: string;
  sessionId?: string;
  patientId?: string;
  packageStatus?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface PackageListResponse {
  packages?: CounselorPackageDto[];
  Packages?: CounselorPackageDto[]; // Backend sends PascalCase
  totalRecords?: number;
  TotalRecords?: number; // Backend sends PascalCase
}

// ====================Module 3.8 Admissions ====================

export interface PatientAdmission {
  id: string;
  tenantId: string;
  branchId: string;
  sessionId: string;
  patientId: string;
  admissionNumber: string;
  admissionType: string;
  plannedAdmissionDate: string;
  actualAdmissionDate?: string;
  surgeryType?: string;
  eyeOperated?: string;
  estimatedDischargeDate?: string;
  actualDischargeDate?: string;
  bedAssigned?: string;
  wardAssigned?: string;
  admissionStatus: string;
  specialInstructions?: string;
  preOpChecklistCompleted: boolean;
  dischargeSummaryGenerated: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BedReservation {
  id: string;
  tenantId: string;
  branchId: string;
  admissionId: string;
  patientId: string;
  bedId: string;
  reservationStartDate: string;
  reservationEndDate: string;
  reservationStatus: string;
  createdAt: string;
  updatedAt: string;
}

// ==================== Module 3.9 Consents ====================

export interface ConsentTemplate {
  id: string;
  tenantId: string;
  templateName: string;
  consentCategory: string;
  description?: string;
  templateHtml: string;
  requiresPatientSignature: boolean;
  requiresWitnessSignature: boolean;
  requiresGuardianSignature: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PatientConsent {
  id: string;
  tenantId: string;
  branchId: string;
  templateId: string;
  sessionId: string;
  patientId: string;
  renderedHtml: string;
  consentStatus: string;
  patientSignature?: string;
  patientSignedAt?: string;
  witnessSignature?: string;
  witnessSignedAt?: string;
  guardianSignature?: string;
  guardianSignedAt?: string;
  finalizedAt?: string;
  pdfUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// ==================== Module 3.10 Workflow ====================

export interface WorkflowState {
  id: string;
  tenantId: string;
  branchId: string;
  sessionId: string;
  patientId: string;
  currentState: string;
  stagesPending: string[];
  stagesCompleted: string[];
  progressPercentage: number;
  milestonesAchieved: number;
  totalMilestones: number;
  lastTransitionDate: string;
  expectedCompletionDate?: string;
  isBlocked: boolean;
  blockageReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StageTransition {
  id: string;
  tenantId: string;
  workflowId: string;
  fromState: string;
  toState: string;
  transitionDate: string;
  triggeredBy: string;
  transitionReason?: string;
  stageData?: string;
}

// ==================== Request/Response Types ====================

export interface CreatePreAuthRequest {
  sessionId: string;
  patientId: string;
  insuranceType: string;
  insuranceProvider: string;
  tpaName?: string;
  policyNumber: string;
  policyHolderName: string;
  relationshipToPatient?: string;
  surgeryType: string;
  plannedProcedure: string;
  diagnosisCode: string;
  procedureCode: string;
  eyeOperated?: string;
  requestedAmount: number;
  copayAmount?: number;
  deductibleAmount?: number;
  itemizedBreakdown?: string;
}

export interface CreatePaymentRequest {
  sessionId: string;
  patientId: string;
  transactionType: string;
  paymentMethod: string;
  amount: number;
  paymentFor: string;
  receiptRequired: boolean;
}

export interface CreatePaymentLinkRequest {
  sessionId: string;
  patientId: string;
  linkAmount: number;
  expiryDays?: number;
  expiryDate?: string;
  recipientPhone?: string;
  recipientEmail?: string;
  sendVia?: string;
}

export interface CreateClaimRequest {
  sessionId: string;
  patientId: string;
  claimType: string;
  insuranceProvider: string;
  tpaName?: string;
  policyNumber: string;
  policyHolderName: string;
  treatmentDate: string;
  claimedAmount: number;
  diagnosisCode: string;
  procedureCode: string;
  supportingDocuments?: string;
}

export interface CreateGovernmentClaimRequest {
  sessionId: string;
  patientId: string;
  schemeType: string;
  schemeName: string;
  cardNumber?: string;
  claimAmount: number;
  applicationNumber: string;
  treatmentDetails?: string;
}

export interface CreateAdmissionRequest {
  sessionId: string;
  patientId: string;
  admissionType: string;
  plannedAdmissionDate: string;
  surgeryType?: string;
  eyeOperated?: string;
  estimatedDischargeDate?: string;
  bedAssigned?: string;
  wardAssigned?: string;
  surgeonAssigned?: string;
  anesthesiaType?: string;
  specialInstructions?: string;
  preOpChecklistCompleted: boolean;
}

export interface RenderConsentRequest {
  templateId: string;
  sessionId: string;
  patientId: string;
  placeholderValues: string | Record<string, any>;
}

export interface InitializeWorkflowRequest {
  sessionId: string;
  patientId: string;
  initialState?: string;
  totalMilestones?: number;
  expectedCompletionDate?: string;
  workflowMetadata?: string;
  workflowType?: string;
  priorityLevel?: string;
  initialStage?: string;
  expectedCompletionDays?: number;
  notes?: string;
}

// ==================== List Response Types ====================

export interface PreAuthListResponse {
  preAuths: InsurancePreAuth[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

export interface PaymentListResponse {
  payments?: PaymentTransaction[];
  Payments?: PaymentTransaction[]; // Backend sends PascalCase
  totalRecords?: number;
  TotalRecords?: number; // Backend sends PascalCase
}

export interface AdmissionListResponse {
  admissions?: PatientAdmission[];
  Admissions?: PatientAdmission[]; // Backend sends PascalCase
  totalRecords?: number;
  TotalRecords?: number; // Backend sends PascalCase
}

export interface ConsentListResponse {
  consents?: PatientConsent[];
  Consents?: PatientConsent[]; // Backend sends PascalCase
  totalRecords?: number;
  TotalRecords?: number; // Backend sends PascalCase
}

export interface WorkflowListResponse {
  workflows: WorkflowState[];
  totalRecords: number;
}
