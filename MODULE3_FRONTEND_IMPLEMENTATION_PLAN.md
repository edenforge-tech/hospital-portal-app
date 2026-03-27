# Module 3 Frontend Implementation Plan
## Counseling & Surgery Package Management UI (Modules 3.6-3.10)

**Date:** February 23, 2026  
**Status:** Planning Phase  
**Backend:** ✅ Complete (78 endpoints)  
**Database:** ✅ Complete (13 tables)  
**Frontend:** ⏳ Pending Implementation

---

## 📋 Overview

This document outlines the complete frontend implementation for Module 3 (Counseling & Surgery Package Management), covering 5 major subsystems:

1. **Module 3.6** - Insurance Pre-Auth Workflow UI
2. **Module 3.7** - Payment Processing Forms
3. **Module 3.8** - Admission Management Interface
4. **Module 3.9** - Consent Management (Digital Signatures)
5. **Module 3.10** - Workflow Orchestration Dashboard

---

## 🏗️ Architecture

### Technology Stack
- **Framework:** Next.js 13.5.1 (App Router)
- **UI Library:** React 18+ with TypeScript
- **State Management:** Zustand (existing pattern)
- **Forms:** React Hook Form + Zod validation
- **Tables:** TanStack Table v8
- **Charts:** Recharts / Chart.js
- **Signatures:** React Signature Canvas (HTML5 Canvas)
- **PDF Generation:** jsPDF / PDFKit
- **HTTP Client:** Axios (existing `src/lib/api.ts`)

### Folder Structure
```
apps/hospital-portal-web/src/
├── app/
│   └── (dashboard)/
│       └── counseling/               # New Module 3 routes
│           ├── insurance/            # 3.6: Insurance Pre-Auth
│           ├── payments/             # 3.7: Payment Processing
│           ├── admissions/           # 3.8: Admission Management
│           ├── consents/             # 3.9: Consent Management
│           └── workflow/             # 3.10: Workflow Orchestration
├── components/
│   └── counseling/                   # Module 3 components
│       ├── insurance/
│       ├── payments/
│       ├── admissions/
│       ├── consents/
│       └── workflow/
├── lib/
│   └── api/
│       └── counseling/               # API client functions
└── types/
    └── counseling.ts                 # TypeScript interfaces
```

---

## 🔧 Module 3.6: Insurance Pre-Auth Workflow UI

### Components to Build

#### 1. **InsurancePreAuthList.tsx**
- DataTable with TanStack Table
- Columns: Patient, Policy Number, Insurance Company, Amount, Status, Actions
- Filters: Status, Priority, Date Range
- Pagination + Search
- Quick Actions: View, Edit, Submit to TPA, Track Status

#### 2. **CreateInsurancePreAuthForm.tsx**
- Multi-step form (3 steps):
  - **Step 1:** Patient & Insurance Details
    - Patient selection (autocomplete)
    - Insurance company, policy number
    - Policy holder name, relationship
  - **Step 2:** Treatment Details
    - Treatment type, description
    - ICD codes (multi-select)
    - Estimated amount
    - Itemized breakdown (dynamic fields)
  - **Step 3:** Document Upload
    - Drag-and-drop file upload
    - Document type selection (11 types)
    - Preview uploaded documents
- Form validation with Zod
- Submit → Create pre-auth + Initialize approval workflow

#### 3. **InsuranceApprovalWorkflow.tsx**
- **5-Stage Approval Pipeline:**
  1. Insurance Dept Review
  2. Payment Dept Approval
  3. TPA Submission
  4. TPA Review
  5. TPA Approval
- Visual workflow stepper (MUI Stepper / Custom)
- Stage-specific actions:
  - Approve/Reject buttons
  - Add notes/comments
  - View stage history
- Real-time status updates
- Email/notification triggers

#### 4. **TPACommunicationPanel.tsx**
- Communication log table
- Filters: Direction (Inbound/Outbound), Type
- Create new communication:
  - Type: Email, Phone, Fax, Portal
  - Subject, Message body
  - Attachments
- Track response required/received
- Follow-up reminders

### API Integration

```typescript
// src/lib/api/counseling/insurance.ts
export const insuranceApi = {
  // Pre-Authorization
  createPreAuth: (data: CreatePreAuthRequest) => 
    api.post('/insurance/pre-auth', data),
  
  getPreAuthById: (id: string) => 
    api.get(`/insurance/pre-auth/${id}`),
  
  getPreAuthBySession: (sessionId: string) => 
    api.get(`/insurance/pre-auth/session/${sessionId}`),
  
  updatePreAuth: (id: string, data: UpdatePreAuthRequest) => 
    api.put(`/insurance/pre-auth/${id}`, data),
  
  submitToTPA: (id: string) => 
    api.post(`/insurance/pre-auth/${id}/submit-to-tpa`),
  
  // Approval Workflow
  approveStage: (id: string, stage: string, data: ApproveStageRequest) => 
    api.post(`/insurance/approval/${id}/approve/${stage}`, data),
  
  getWorkflowStatus: (id: string) => 
    api.get(`/insurance/approval/${id}/status`),
  
  // Documents
  uploadDocument: (id: string, formData: FormData) => 
    api.post(`/insurance/documents/${id}/upload`, formData),
  
  getDocuments: (preAuthId: string) => 
    api.get(`/insurance/documents/${preAuthId}`),
  
  // TPA Communication
  createCommunication: (data: CreateCommunicationRequest) => 
    api.post('/insurance/tpa-communication', data),
  
  getCommunicationLogs: (preAuthId: string) => 
    api.get(`/insurance/tpa-communication/${preAuthId}`)
};
```

### UI Mockup (Text-based)

```
┌─────────────────────────────────────────────────────────┐
│ Insurance Pre-Authorization Requests                    │
├─────────────────────────────────────────────────────────┤
│ [+ New Pre-Auth]  [🔍 Search]  [Filters ▼]             │
├─────────────────────────────────────────────────────────┤
│ Patient      │ Policy      │ Company      │ Amount │ Status │ Actions │
│ John Doe     │ STAR2026001 │ Star Health  │ ₹50K   │ Approved│ [View]  │
│ Jane Smith   │ HDFC2026002 │ HDFC Ergo    │ ₹35K   │ Pending │ [View]  │
└─────────────────────────────────────────────────────────┘
```

---

## 💳 Module 3.7: Payment Processing Forms

### Components to Build

#### 1. **PaymentTransactionForm.tsx**
- **9 Payment Methods:**
  1. Cash
  2. Card (Credit/Debit)
  3. UPI
  4. Cheque
  5. Bank Transfer
  6. Online Gateway (Razorpay)
  7. Government Scheme
  8. Insurance
  9. Mixed Payment (multiple methods)
- **Dynamic Form Fields** based on selected method:
  - Cash: Amount only
  - Card: Amount, Card details (last 4 digits stored only)
  - UPI: Amount, VPA, Transaction ID
  - Cheque: Amount, Cheque number, Bank, Date
  - Government Scheme: Scheme selection, ID number
  - Mixed: Multiple payment method allocations
- **Razorpay Integration:**
  - Generate payment order
  - Launch Razorpay checkout modal
  - Verify payment signature
  - Update transaction status

#### 2. **PaymentLinkGenerator.tsx**
- Form:
  - Patient selection
  - Amount, Purpose
  - Expiry duration (hours)
  - Notification channels: SMS, Email, WhatsApp
- Generate link → Display short URL + QR code
- Link status tracking (Active/Paid/Expired)
- Resend notification buttons

#### 3. **GovernmentSchemeClaimForm.tsx**
- **Supported Schemes:**
  - ESH (Employees State Insurance)
  - CGHS (Central Government Health Scheme)
  - Arograshree (State-specific)
  - SGHS (State Government Health Scheme)
- Form fields:
  - Scheme selection
  - Beneficiary ID number
  - Claim amount
  - Treatment details
  - Hospitalization dates
- Document upload (scheme-specific requirements)
- Submission workflow (12 status states)
- Approval tracking

#### 4. **PaymentSummaryDashboard.tsx**
- **Daily Revenue Charts:**
  - Total revenue (bar chart)
  - Revenue by payment method (pie chart)
  - Payment trend (line chart)
- **Quick Stats:**
  - Today's collection
  - Pending payments
  - Failed transactions
  - Refund requests
- **Filters:** Date range, Branch, Payment method

### API Integration

```typescript
// src/lib/api/counseling/payments.ts
export const paymentsApi = {
  // Transactions
  processPayment: (data: ProcessPaymentRequest) => 
    api.post('/payments/process', data),
  
  getTransactionById: (id: string) => 
    api.get(`/payments/transactions/${id}`),
  
  getPaymentHistory: (patientId: string) => 
    api.get(`/payments/history/${patientId}`),
  
  refundPayment: (id: string, data: RefundRequest) => 
    api.post(`/payments/transactions/${id}/refund`, data),
  
  // Payment Links
  generatePaymentLink: (data: GeneratePaymentLinkRequest) => 
    api.post('/payments/generate-link', data),
  
  getPaymentLinkStatus: (id: string) => 
    api.get(`/payments/links/${id}/status`),
  
  // Government Schemes
  submitSchemeClaim: (data: SchemeClaimRequest) => 
    api.post('/payments/government-claim', data),
  
  getSchemeClaimStatus: (id: string) => 
    api.get(`/payments/government-claim/${id}`),
  
  // Analytics
  getPaymentSummary: (startDate: string, endDate: string) => 
    api.get('/payments/summary', { params: { startDate, endDate } })
};
```

### Razorpay Integration Code

```typescript
// src/lib/razorpay.ts
declare const Razorpay: any;

export const initiateRazorpayPayment = async (
  order: RazorpayOrder,
  onSuccess: (response: RazorpayResponse) => void,
  onFailure: (error: any) => void
) => {
  const options = {
    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    amount: order.amount,
    currency: 'INR',
    name: 'Hospital Portal',
    description: order.description,
    order_id: order.orderId,
    handler: (response: RazorpayResponse) => {
      // Verify signature on backend
      onSuccess(response);
    },
    prefill: {
      name: order.customerName,
      email: order.customerEmail,
      contact: order.customerPhone
    },
    theme: {
      color: '#3b82f6'
    }
  };

  const razorpayInstance = new Razorpay(options);
  razorpayInstance.on('payment.failed', onFailure);
  razorpayInstance.open();
};
```

---

## 🏨 Module 3.8: Admission Management Interface

### Components to Build

#### 1. **AdmissionSchedulingForm.tsx**
- **3 Admission Types:**
  1. Day Care (outpatient surgery, same-day discharge)
  2. IPD (In-Patient Department, multi-day stay)
  3. Emergency (immediate admission)
- Form fields:
  - Patient selection
  - Admission type (radio buttons)
  - Scheduled admission date/time
  - Estimated discharge date
  - Admission purpose (textarea)
  - Assigned doctor (dropdown)
  - Special requirements (textarea)
- **IPD-specific fields:**
  - Bed reservation required? (checkbox)
  - Ward/Room preference
- **Day-care specific fields:**
  - Time slot selection
  - Scheduled discharge time

#### 2. **BedReservationManager.tsx**
- **Bed Availability Grid:**
  - Visual bed map (grid/floor plan)
  - Color-coding: Available (green), Reserved (yellow), Occupied (red)
  - Ward/Room filters
- **Reserve Bed Modal:**
  - Patient info
  - Admission ID
  - Reservation duration
  - Auto-release after 24 hours (display countdown)
- **Actions:**
  - Confirm reservation
  - Release bed
  - Extend reservation

#### 3. **AdmissionStatusTracker.tsx**
- **8-State Workflow:**
  1. Scheduled
  2. Pre-Admission Check
  3. Admitted
  4. Under Care
  5. Post-Operative
  6. Ready for Discharge
  7. Discharged
  8. Cancelled
- Timeline view with milestone timestamps
- Update status buttons (state-specific)
- Discharge workflow:
  - Discharge summary (textarea)
  - Discharge instructions (rich text editor)
  - Financial settlement check
  - Print discharge summary (PDF)

#### 4. **AdmissionsDashboard.tsx**
- **Stats Cards:**
  - Today's admissions
  - Current IPD patients
  - Scheduled discharges
  - Bed occupancy rate
- **Admission Calendar:**
  - Monthly view
  - Color-coded by admission type
  - Click to view details
- **Filters:** Date range, Admission type, Status

### API Integration

```typescript
// src/lib/api/counseling/admissions.ts
export const admissionsApi = {
  // Admissions
  scheduleAdmission: (data: ScheduleAdmissionRequest) => 
    api.post('/admissions', data),
  
  getAdmissionById: (id: string) => 
    api.get(`/admissions/${id}`),
  
  updateAdmissionStatus: (id: string, status: string) => 
    api.put(`/admissions/${id}/status`, { admissionStatus: status }),
  
  dischargePatient: (id: string, data: DischargeRequest) => 
    api.post(`/admissions/${id}/discharge`, data),
  
  cancelAdmission: (id: string, reason: string) => 
    api.post(`/admissions/${id}/cancel`, { reason }),
  
  // Bed Reservations
  reserveBed: (data: ReserveBedRequest) => 
    api.post('/admissions/reserve-bed', data),
  
  getBedAvailability: (wardId?: string) => 
    api.get('/admissions/beds/available', { params: { wardId } }),
  
  releaseBed: (reservationId: string) => 
    api.post(`/admissions/beds/${reservationId}/release`),
  
  // Dashboard
  getAdmissionStats: () => 
    api.get('/admissions/stats')
};
```

---

## 📝 Module 3.9: Consent Management (Digital Signatures)

### Components to Build

#### 1. **ConsentTemplateEditor.tsx**
- **Rich Text Editor** (TinyMCE / Quill)
- **Placeholder Management:**
  - Insert placeholder buttons: `{{PATIENT_NAME}}`, `{{SURGERY_TYPE}}`, etc.
  - Preview with sample data
- **Metadata:**
  - Template name, category (6 categories)
  - Version number
  - Legal compliance notes
  - Required signatures (checkboxes)
- Save as active template

#### 2. **ConsentFormRenderer.tsx**
- **Two-Column Layout:**
  - Left: Rendered HTML consent form (read-only)
  - Right: Signature panels
- **Signature Capture:**
  - Using `react-signature-canvas`
  - **Three signature panels:**
    1. Patient Signature (required)
    2. Witness Signature (optional)
    3. Guardian Signature (optional, for minors)
  - Each panel:
    - Canvas area (400x200px)
    - Clear button
    - Timestamp display
    - Name input field
- **Submit Button:**
  - Validates all required signatures present
  - Converts canvas to base64 PNG
  - Submits to backend
- **PDF Generation:**
  - Generate PDF button (after signing)
  - Download PDF with embedded signatures

#### 3. **ConsentManagementDashboard.tsx**
- **Consent Templates List:**
  - DataTable: Template name, Category, Version, Active, Actions
  - Actions: Edit, Preview, Activate/Deactivate, Duplicate
- **Patient Consents List:**
  - DataTable: Patient, Template, Status, Signed Date, Actions
  - Filters: Status (Draft/Signed/Archived), Date range
  - Actions: View, Download PDF, Void consent

#### 4. **SignatureCanvas Component**
```typescript
// src/components/counseling/consents/SignatureCanvas.tsx
import SignatureCanvas from 'react-signature-canvas';

interface SignatureCanvasProps {
  label: string;
  required?: boolean;
  onSave: (signatureBase64: string) => void;
}

export const SignatureCanvas: React.FC<SignatureCanvasProps> = ({
  label,
  required,
  onSave
}) => {
  const sigCanvas = useRef<SignatureCanvas>(null);
  const [signedAt, setSignedAt] = useState<Date | null>(null);

  const clear = () => {
    sigCanvas.current?.clear();
    setSignedAt(null);
  };

  const save = () => {
    if (sigCanvas.current?.isEmpty()) {
      alert('Please provide a signature');
      return;
    }
    const base64 = sigCanvas.current.toDataURL('image/png');
    setSignedAt(new Date());
    onSave(base64);
  };

  return (
    <div className="signature-panel">
      <label>{label} {required && '*'}</label>
      <SignatureCanvas
        ref={sigCanvas}
        canvasProps={{
          width: 400,
          height: 200,
          className: 'signature-canvas'
        }}
      />
      <div className="actions">
        <button onClick={clear}>Clear</button>
        <button onClick={save}>Save Signature</button>
      </div>
      {signedAt && <p>Signed at: {signedAt.toLocaleString()}</p>}
    </div>
  );
};
```

### API Integration

```typescript
// src/lib/api/counseling/consents.ts
export const consentsApi = {
  // Templates
  createTemplate: (data: CreateTemplateRequest) => 
    api.post('/consents/templates', data),
  
  getTemplates: (category?: string) => 
    api.get('/consents/templates', { params: { category } }),
  
  updateTemplate: (id: string, data: UpdateTemplateRequest) => 
    api.put(`/consents/templates/${id}`, data),
  
  // Patient Consents
  generateConsent: (data: GenerateConsentRequest) => 
    api.post('/consents/generate', data),
  
  getConsentById: (id: string) => 
    api.get(`/consents/${id}`),
  
  signConsent: (id: string, data: SignConsentRequest) => 
    api.post(`/consents/${id}/sign`, data),
  
  generatePDF: (id: string) => 
    api.post(`/consents/${id}/generate-pdf`)
};
```

---

## 🔄 Module 3.10: Workflow Orchestration Dashboard

### Components to Build

#### 1. **WorkflowStateMachine.tsx**
- **18-State Visual Workflow:**
  - Horizontal stepper / Sankey diagram
  - States color-coded by status:
    - Completed: Green
    - In Progress: Blue
    - Pending: Gray
    - Blocked: Red
- **Current State Highlight**
- **Clickable states** → Show milestone details
- **State Transition Actions:**
  - Move to next state button
  - Add transition notes
  - View transition history

#### 2. **WorkflowProgressMetrics.tsx**
- **Progress Circle** (0-100%)
- **Milestones Tracker:**
  - List of 16 milestones
  - Checkmark icon for completed
  - Timestamp for each
- **Dependency Status:**
  - Assessment Complete ✅
  - Package Built ✅
  - Tests Completed ⏳ (in progress)
  - OT Booked ❌ (blocked)
  - Payment Complete ✅
  - Insurance Approved ⏳
  - Consents Signed ❌
  - Admission Scheduled ❌
- **Blocking Issues Panel:**
  - Red alert badges
  - Issue description
  - Severity (Low/Medium/High/Critical)
  - Resolve button

#### 3. **WorkflowDependencyChecker.tsx**
- **Cross-Module Validation:**
  - Module 3.1: Package exists? ✅/❌
  - Module 3.4: Tests completed? ✅/❌
  - Module 3.5: OT booked? ✅/❌
  - Module 3.6: Insurance approved? ✅/❌ (if required)
  - Module 3.7: Payment completed? ✅/❌
  - Module 3.8: Admission scheduled? ✅/❌
  - Module 3.9: Consents signed? ✅/❌
- **Missing Dependencies:**
  - Red list of incomplete items
  - Quick action links (e.g., "Book OT Now")
- **Auto-refresh** every 30 seconds

#### 4. **WorkflowTimeline.tsx**
- **Vertical Timeline:**
  - Each transition as timeline item
  - Icon, State name, Timestamp, User
  - Transition notes (expandable)
- **Filters:** Date range, Triggered by (User/System)

### API Integration

```typescript
// src/lib/api/counseling/workflow.ts
export const workflowApi = {
  // Workflow State
  initializeWorkflow: (data: InitializeWorkflowRequest) => 
    api.post('/workflow/initialize', data),
  
  getWorkflowBySession: (sessionId: string) => 
    api.get(`/workflow/${sessionId}`),
  
  transitionState: (sessionId: string, data: TransitionRequest) => 
    api.post(`/workflow/${sessionId}/transition`, data),
  
  // Progress & Dependencies
  getProgress: (sessionId: string) => 
    api.get(`/workflow/${sessionId}/progress`),
  
  checkDependencies: (sessionId: string) => 
    api.get(`/workflow/${sessionId}/dependencies`),
  
  // Blocking Issues
  getBlockingIssues: (sessionId: string) => 
    api.get(`/workflow/${sessionId}/blocking-issues`),
  
  resolveIssue: (sessionId: string, stageName: string) => 
    api.post(`/workflow/${sessionId}/resolve-issue/${stageName}`),
  
  // Transitions
  getTransitionHistory: (sessionId: string) => 
    api.get(`/workflow/${sessionId}/transitions`)
};
```

### UI Mockup (Workflow Dashboard)

```
┌────────────────────────────────────────────────────────────────┐
│ Workflow Orchestration - Patient: John Doe                    │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  Progress: [████████░░░░░░░░] 55% (9/16 milestones)          │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ Workflow States (18 states)                              │ │
│  │ ✅ SessionStarted → ✅ AssessmentInProgress →           │ │
│  │ ✅ PackageBuilt → ✅ DocumentsCollected →               │ │
│  │ ✅ TestsOrdered → ⏳ TestsCompleted →                    │ │
│  │ ❌ FitnessClearanceObtained → ❌ OTBooked               │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  ┌─────────────────────┐  ┌─────────────────────────────────┐ │
│  │ Dependencies (7/9)  │  │ Blocking Issues (2)             │ │
│  │ ✅ Package Built    │  │ ❌ OT Not Booked (HIGH)        │ │
│  │ ⏳ Tests Pending    │  │ ❌ Insurance Pending (MEDIUM)  │ │
│  │ ❌ OT Not Booked   │  │ [Resolve] [View Details]        │ │
│  └─────────────────────┘  └─────────────────────────────────┘ │
│                                                                │
│  [Transition to Next State] [View Full Timeline]              │
└────────────────────────────────────────────────────────────────┘
```

---

## 📦 Shared Components & Utilities

### 1. **Reusable UI Components**
```typescript
// src/components/counseling/shared/

- DataTable.tsx (TanStack Table wrapper)
- FormField.tsx (React Hook Form + Zod)
- StatusBadge.tsx (color-coded status pills)
- DateRangePicker.tsx
- FileUploader.tsx (drag-and-drop)
- ConfirmationModal.tsx
- LoadingSpinner.tsx
- ErrorAlert.tsx
```

### 2. **TypeScript Interfaces**
```typescript
// src/types/counseling.ts

export interface InsurancePreAuth {
  id: string;
  patientId: string;
  policyNumber: string;
  insuranceCompany: string;
  estimatedAmount: number;
  status: string;
  // ... 25 more fields
}

export interface PaymentTransaction {
  id: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: string;
  // ... 40 more fields
}

// ... interfaces for all 13 tables
```

### 3. **Form Validation Schemas**
```typescript
// src/lib/validations/counseling.ts
import { z } from 'zod';

export const insurancePreAuthSchema = z.object({
  patientId: z.string().uuid(),
  insuranceCompany: z.string().min(2).max(200),
  policyNumber: z.string().min(5).max(100),
  estimatedAmount: z.number().positive(),
  // ... all required fields
});

export const paymentTransactionSchema = z.object({
  amount: z.number().positive(),
  paymentMethod: z.enum([
    'Cash', 'Card', 'UPI', 'Cheque', 
    'BankTransfer', 'OnlineGateway', 
    'GovernmentScheme', 'Insurance', 'Mixed'
  ]),
  // ... conditional validation based on payment method
});
```

---

## 🚀 Implementation Phases

### Phase 1: Foundation (Week 1)
- ✅ Set up folder structure
- ✅ Create TypeScript interfaces for all 13 tables
- ✅ Implement API client functions
- ✅ Build shared components (DataTable, FormField, StatusBadge)

### Phase 2: Insurance Module (Week 2)
- ✅ InsurancePreAuthList + CRUD
- ✅ CreateInsurancePreAuthForm (3-step wizard)
- ✅ InsuranceApprovalWorkflow (5-stage pipeline)
- ✅ TPACommunicationPanel

### Phase 3: Payment Module (Week 3)
- ✅ PaymentTransactionForm (9 payment methods)
- ✅ Razorpay integration
- ✅ PaymentLinkGenerator
- ✅ GovernmentSchemeClaimForm
- ✅ PaymentSummaryDashboard

### Phase 4: Admission Module (Week 4)
- ✅ AdmissionSchedulingForm
- ✅ BedReservationManager (visual grid)
- ✅ AdmissionStatusTracker (8-state workflow)
- ✅ AdmissionsDashboard

### Phase 5: Consent Module (Week 5)
- ✅ ConsentTemplateEditor (rich text + placeholders)
- ✅ ConsentFormRenderer
- ✅ SignatureCanvas integration (HTML5 Canvas)
- ✅ PDF generation

### Phase 6: Workflow Module (Week 6)
- ✅ WorkflowStateMachine (18-state visual)
- ✅ WorkflowProgressMetrics
- ✅ WorkflowDependencyChecker (cross-module validation)
- ✅ WorkflowTimeline

### Phase 7: Testing & Polish (Week 7)
- ✅ Integration testing
- ✅ E2E user flows
- ✅ Responsive design verification
- ✅ Performance optimization
- ✅ Documentation

---

## 🧪 Testing Strategy

### Unit Tests
- Each component with Jest + React Testing Library
- Form validation tests
- API client mock tests

### Integration Tests
- Multi-step form flows
- Payment gateway integration (Razorpay sandbox)
- Signature capture → PDF generation
- Workflow state transitions

### E2E Tests (Playwright)
```typescript
// tests/e2e/counseling/insurance-workflow.spec.ts
test('Complete insurance pre-auth workflow', async ({ page }) => {
  // 1. Login
  await page.goto('/login');
  await page.fill('[name=username]', 'counselor.test@hospitalportal.com');
  await page.fill('[name=password]', 'Counselor@123');
  await page.click('button[type=submit]');
  
  // 2. Create pre-auth
  await page.goto('/counseling/insurance');
  await page.click('text=New Pre-Auth');
  await page.fill('[name=policyNumber]', 'TEST2026001');
  // ... fill form
  await page.click('text=Submit');
  
  // 3. Approve stages
  await page.click('text=Approve Insurance Dept');
  await page.fill('textarea[name=notes]', 'Approved');
  await page.click('text=Confirm');
  
  // 4. Verify status
  await expect(page.locator('.status-badge')).toHaveText('Approved');
});
```

---

## 📚 Documentation

### Developer Documentation
- Component API documentation (Storybook)
- API integration guide
- Form validation examples
- State management patterns

### User Documentation
- User flow diagrams
- Feature screenshots
- Video tutorials (Loom/Camtasia)
- FAQ section

---

## 🎯 Success Metrics

### Technical Metrics
- ✅ 100% TypeScript coverage
- ✅ <3s page load time
- ✅ >90% test coverage
- ✅ 0 console errors/warnings

### User Metrics
- ✅ <5 min average time to complete insurance pre-auth form
- ✅ <2 min average time to process payment
- ✅ <3 min average time to complete consent signing
- ✅ 100% workflow state transition success rate

---

## 🔧 Tools & Libraries to Install

```bash
# Core dependencies
pnpm add react-hook-form zod @hookform/resolvers
pnpm add @tanstack/react-table
pnpm add recharts
pnpm add react-signature-canvas
pnpm add jspdf
pnpm add @types/react-signature-canvas -D

# Razorpay
# Include via CDN in app/layout.tsx:
# <script src="https://checkout.razorpay.com/v1/checkout.js"></script>

# UI Components (if not already installed)
pnpm add @radix-ui/react-dialog @radix-ui/react-select
pnpm add date-fns
pnpm add react-dropzone

# Testing
pnpm add @testing-library/react @testing-library/jest-dom -D
pnpm add @playwright/test -D
```

---

## 🚦 Current Status

- **Backend API:** ✅ Complete (78 endpoints, 0 errors)
- **Database:** ✅ Complete (13 tables, RLS policies)
- **Migration Scripts:** ✅ Ready for execution
- **Test Credentials:** ✅ Setup script created
- **Frontend:** ⏳ **Pending - Ready to start Phase 1**

---

## 📞 Next Actions

1. **Execute Database Migration:**
   ```powershell
   .\execute_module3_migration.ps1
   ```

2. **Create Test Users:**
   ```powershell
   .\setup_module3_test_credentials.ps1
   ```

3. **Start Frontend Implementation:**
   - Begin Phase 1 (Foundation)
   - Scaffold folder structure
   - Create TypeScript interfaces
   - Build API client layer

4. **Test Backend APIs:**
   ```powershell
   .\TEST_MODULE3_COMPLETE.ps1
   ```

---

**Document Version:** 1.0  
**Last Updated:** February 23, 2026  
**Author:** AI Development Team  
**Status:** Ready for Implementation 🚀
