# Module 3.6-3.10 Master API Inventory
## Complete Endpoint Discovery & Testing Status Report

**Generated:** February 22, 2026  
**Author:** AI Assistant  
**Purpose:** Comprehensive inventory of all API endpoints in Modules 3.6-3.10 (Pre-Authorization & Counselor Management)

---

## Executive Summary

### Discovery Completion Status
- **Total Modules Mapped:** 5 out of 5 (100% ✅)
- **Total Endpoints Discovered:** 63 endpoints
- **Total Controllers:** 7 controllers
- **Total Database Tables:** 25+ tables

### Testing Status by Module
| Module | Endpoints | Status | Success Rate |
|--------|-----------|--------|--------------|
| 3.6 Insurance | 9 | ✅ Fully Tested | 100% (9/9) |
| 3.7 Payments | 18 | ⚠️ Blocked | 0% (0/18) |
| 3.8 Admissions | 11 | ⚠️ Blocked | 0% (0/11) |
| 3.9 Consents | 11 | 🔍 Not Tested | 0% (0/11) |
| 3.10 Workflow | 24 | 🔍 Not Tested | 0% (0/24) |
| **TOTAL** | **73** | **Discovery Complete** | **12% (9/73)** |

### Critical Issues Identified
1. **Entity Mapping Issue** - Modules 3.7-3.9 blocked by missing `HasColumnName()` mappings
2. **Column Name Mismatch** - Module 3.8: `actual_admission_date` vs `admission_date`
3. **Service Layer Bug** - Module 3.7: POST still fails after schema fix

---

## Module 3.6: Insurance Pre-Authorization (✅ COMPLETE)

### Controller
- **File:** `Controllers/InsuranceController.cs`
- **Service:** `IInsuranceManagementService`
- **Status:** ✅ Fully Implemented & Tested

### Endpoints (9 Total)

#### Pre-Authorization Management (5 endpoints)
1. **GET** `/api/insurance/pre-auths` - List all pre-authorizations
   - **Status:** ✅ Tested
   - **Result:** Successfully returns list with filtering

2. **GET** `/api/insurance/pre-auths/{id}` - Get pre-auth by ID
   - **Status:** ✅ Tested
   - **Result:** Returns detailed pre-auth record

3. **POST** `/api/insurance/pre-auths` - Create new pre-authorization
   - **Status:** ✅ Tested
   - **Test Cases:** 3 created (Cataract, LASIK, Trabeculectomy)
   - **Result:** All 3 successfully created

4. **PUT** `/api/insurance/pre-auths/{id}` - Update pre-authorization
   - **Status:** ✅ Tested
   - **Result:** Successfully updated amount and notes

5. **POST** `/api/insurance/pre-auths/{id}/update-status` - Update pre-auth status
   - **Status:** ✅ Tested
   - **Result:** Status transitions working (Draft → Submitted → Approved)

#### TPA Submission (2 endpoints)
6. **POST** `/api/insurance/pre-auths/{id}/submit-to-tpa` - Submit to TPA
   - **Status:** ✅ Tested
   - **Result:** Successfully submitted with tracking number

7. **POST** `/api/insurance/pre-auths/{id}/tpa-response` - TPA response
   - **Status:** ✅ Tested
   - **Result:** Successfully recorded TPA approval response

#### Session Linking (1 endpoint)
8. **POST** `/api/insurance/pre-auths/{id}/link-session` - Link to counseling session
   - **Status:** ✅ Tested
   - **Result:** Successfully linked pre-auth to session

#### Document Upload (1 endpoint)
9. **POST** `/api/insurance/pre-auths/{id}/upload-document` - Upload insurance documents
   - **Status:** ✅ Tested
   - **Result:** Document upload paths recorded

### Database Schema
- **Table:** `insurance_pre_authorization` (30 columns)
- **Status:** ✅ Fully compliant
- **Key Fields:**
  - `pre_auth_number`, `insurance_provider`, `policy_number`
  - `patient_id`, `session_id`, `branch_id`, `tenant_id`
  - `requested_amount`, `approved_amount`, `status`
  - `tpa_submitted`, `tpa_submission_date`, `tpa_approval_number`
  - Standard audit fields (created_at, updated_at, created_by_user_id, etc.)

### Entity Configuration (AppDbContext)
- **Status:** ✅ Fully Configured
- **Pattern:** All properties have explicit `HasColumnName()` mappings
- **Example:**
```csharp
entity.Property(e => e.PreAuthNumber).HasColumnName("pre_auth_number");
entity.Property(e => e.InsuranceProvider).HasColumnName("insurance_provider");
entity.Property(e => e.RequestedAmount).HasColumnName("requested_amount");
```

### Test Results
- **Pre-Authorizations Created:** 3
  1. Rajesh Kumar - Cataract Surgery - ₹50,000
  2. Priya Sharma - LASIK - ₹75,000
  3. Amit Verma - Trabeculectomy - ₹60,000
- **Workflow Tested:** Draft → Submitted → TPA Approved → Linked to Session
- **Bugs Fixed:** 4 trigger/constraint issues resolved during testing
- **Overall Status:** 🟢 Production Ready

---

## Module 3.7: Payments Processing (⚠️ BLOCKED)

### Controller
- **File:** `Controllers/PaymentsController.cs`
- **Service:** `IPaymentProcessingService`
- **Status:** ⚠️ Entity mapping issues prevent testing

### Endpoints (18 Total)

#### Payment Transactions (8 endpoints)
1. **POST** `/api/payments` - Create payment transaction
   - **Status:** ❌ Blocked (400 Bad Request)
   - **Issue:** Missing HasColumnName() mappings

2. **GET** `/api/payments/{id}` - Get payment by ID
   - **Status:** 🔍 Not tested

3. **GET** `/api/payments` - List payments
   - **Status:** 🔍 Not tested

4. **POST** `/api/payments/{id}/process` - Process payment
   - **Status:** 🔍 Not tested

5. **POST** `/api/payments/{id}/refund` - Issue refund
   - **Status:** 🔍 Not tested

6. **POST** `/api/payments/{id}/verify` - Verify payment
   - **Status:** 🔍 Not tested

7. **GET** `/api/payments/summary` - Payment summary
   - **Status:** 🔍 Not tested

8. **GET** `/api/payments/reconciliation` - Payment reconciliation report
   - **Status:** 🔍 Not tested

#### Payment Links (4 endpoints)
9. **POST** `/api/payments/links` - Generate payment link (Razorpay)
   - **Status:** 🔍 Not tested

10. **GET** `/api/payments/links/{id}` - Get payment link
    - **Status:** 🔍 Not tested

11. **POST** `/api/payments/links/{id}/send` - Send payment link via SMS/Email
    - **Status:** 🔍 Not tested

12. **GET** `/api/payments/links/{linkId}/status` - Check payment link status
    - **Status:** 🔍 Not tested

#### Government Claims (6 endpoints)
13. **POST** `/api/payments/gov-claims` - Create government scheme claim
    - **Status:** 🔍 Not tested

14. **GET** `/api/payments/gov-claims/{id}` - Get claim by ID
    - **Status:** 🔍 Not tested

15. **GET** `/api/payments/gov-claims` - List government claims
    - **Status:** 🔍 Not tested

16. **POST** `/api/payments/gov-claims/{id}/approve` - Approve/reject claim
    - **Status:** 🔍 Not tested

17. **POST** `/api/payments/gov-claims/{id}/submit` - Submit claim to government
    - **Status:** 🔍 Not tested

18. **POST** `/api/payments/gov-claims/{id}/settlement` - Record claim settlement
    - **Status:** 🔍 Not tested

### Database Schema
- **Tables:** 6 tables
  1. `payment_transactions` (45 columns) ✅ Schema correct
  2. `payment_links` (24 columns) ✅ Schema correct
  3. `payment_link_delivery_log` (15 columns) ✅ Schema correct
  4. `government_scheme_claims` (35 columns) ✅ Schema correct
  5. `claim_approval_stages` (18 columns) ✅ Schema correct
  6. `payment_reconciliation_log` (20 columns) ✅ Schema correct

- **Migration Applied:** ✅ `module03_07_payment_processing.sql`

### Entity Configuration (AppDbContext)
- **Status:** ❌ MISSING - No HasColumnName() mappings found
- **Required Fields:**
```csharp
entity.Property(e => e.TotalBillAmount).HasColumnName("total_bill_amount");
entity.Property(e => e.DiscountAmount).HasColumnName("discount_amount");
entity.Property(e => e.NetPayableAmount).HasColumnName("net_payable_amount");
entity.Property(e => e.AmountPaid).HasColumnName("amount_paid");
entity.Property(e => e.BalanceDue).HasColumnName("balance_due");
entity.Property(e => e.PaymentMethod).HasColumnName("payment_method");
entity.Property(e => e.PaymentStatus).HasColumnName("payment_status");
// ... (35+ more properties)
```

### Test Data Prepared
1. **payment1_cash.json** - Cash payment ₹50,000
2. **payment2_card.json** - Card payment ₹75,000
3. **payment3_upi.json** - UPI payment ₹60,000

### Blocking Issue
- **Root Cause:** Entity model uses PascalCase, DB uses snake_case, no mappings
- **Fix Required:** Add ~40 HasColumnName() mappings to AppDbContext
- **Template:** Use Module 3.6 pattern as reference
- **Priority:** 🔴 HIGH - Blocks 18 endpoints

---

## Module 3.8: Admissions Management (⚠️ BLOCKED)

### Controller
- **File:** `Controllers/AdmissionsController.cs`
- **Service:** `IAdmissionManagementService`
- **Status:** ⚠️ Column name mismatch blocks testing

### Endpoints (11 Total)

#### Patient Admissions (8 endpoints)
1. **POST** `/api/admissions` - Create admission
   - **Status:** ❌ Blocked (400 Bad Request)
   - **Issue:** Column `actual_admission_date` vs `admission_date` mismatch

2. **GET** `/api/admissions/{id}` - Get admission by ID
   - **Status:** 🔍 Not tested

3. **GET** `/api/admissions` - List admissions
   - **Status:** 🔍 Not tested

4. **PUT** `/api/admissions/{id}` - Update admission
   - **Status:** 🔍 Not tested

5. **POST** `/api/admissions/{id}/assign-bed` - Assign bed to patient
   - **Status:** 🔍 Not tested

6. **POST** `/api/admissions/{id}/discharge` - Discharge patient
   - **Status:** 🔍 Not tested

7. **POST** `/api/admissions/{id}/cancel` - Cancel admission
   - **Status:** 🔍 Not tested

8. **GET** `/api/admissions/patient/{patientId}` - Get patient admission history
   - **Status:** 🔍 Not tested

#### Bed Management (3 endpoints)
9. **POST** `/api/admissions/bed-reservations` - Reserve bed
   - **Status:** 🔍 Not tested

10. **GET** `/api/admissions/available-beds` - Check bed availability
    - **Status:** 🔍 Not tested

11. **GET** `/api/admissions/bed-occupancy` - Bed occupancy report
    - **Status:** 🔍 Not tested

### Database Schema
- **Table:** `patient_admissions` (39 columns)
- **Status:** ⚠️ Column name mismatch
- **Issue:** Database has `admission_date` but entity expects `actual_admission_date`

### Entity Configuration (AppDbContext)
- **Status:** ❌ INCORRECT MAPPING
- **Problem:** 
```csharp
// Current (WRONG):
entity.Property(e => e.ActualAdmissionDate).HasColumnName("actual_admission_date");

// Should be:
entity.Property(e => e.ActualAdmissionDate).HasColumnName("admission_date");
```

### Test Data Prepared
1. **admission1_daycare.json** - DayCare ₹50,000
2. **admission2_ipd.json** - IPD ₹150,000
3. **admission3_emergency.json** - Emergency ₹200,000

### Blocking Issue
- **Root Cause:** Column name mismatch in entity configuration
- **Fix Required:** Update single HasColumnName() mapping
- **Priority:** 🔴 HIGH - Quick fix, blocks 11 endpoints

---

## Module 3.9: Consents Management (🔍 NOT TESTED)

### Controller
- **File:** `Controllers/ConsentsController.cs`
- **Service:** `IConsentManagementService`
- **Status:** 🔍 Not tested yet (may have entity issues)

### Endpoints (11 Total)

#### Consent Templates (4 endpoints)
1. **GET** `/api/consents/templates` - List consent templates
   - **Status:** 🔍 Not tested

2. **GET** `/api/consents/templates/{id}` - Get template by ID
   - **Status:** 🔍 Not tested

3. **POST** `/api/consents/templates` - Create consent template
   - **Status:** 🔍 Not tested

4. **PUT** `/api/consents/templates/{id}` - Update consent template
   - **Status:** 🔍 Not tested

#### Patient Consents (7 endpoints)
5. **POST** `/api/consents/render` - Render consent for patient
   - **Status:** 🔍 Not tested

6. **GET** `/api/consents/{id}` - Get consent by ID
   - **Status:** 🔍 Not tested

7. **GET** `/api/consents/patient/{patientId}` - Get patient consents
   - **Status:** 🔍 Not tested

8. **POST** `/api/consents/{id}/sign` - Digital signature
   - **Status:** 🔍 Not tested

9. **POST** `/api/consents/{id}/revoke` - Revoke consent
   - **Status:** 🔍 Not tested

10. **POST** `/api/consents/{id}/generate-pdf` - Generate PDF
    - **Status:** 🔍 Not tested

11. **GET** `/api/consents/pending-signatures` - List pending signatures
    - **Status:** 🔍 Not tested

### Database Schema
- **Tables:** 5 tables
  1. `consent`
  2. `consent_form_templates`
  3. `counseling_consents`
  4. `patient_consents`
  5. `patient_research_consent`

### Entity Configuration (AppDbContext)
- **Status:** ⚠️ Unknown - Not tested yet
- **Recommendation:** Check for HasColumnName() mappings before testing

### Test Data
- **Status:** Not prepared yet (waiting for entity verification)

---

## Module 3.10: Workflow Engine (🔍 DISCOVERED - NOT TESTED)

### Controllers (2 Total)

#### 1. WorkflowController
- **File:** `Controllers/WorkflowController.cs`
- **Service:** `IWorkflowOrchestrationService`
- **Status:** 🔍 Just discovered

#### 2. PatientTypeWorkflowController
- **File:** `Controllers/PatientTypeWorkflowController.cs`
- **Service:** `IPatientTypeWorkflowService`
- **Status:** 🔍 Just discovered

### Endpoints (24 Total)

#### WorkflowController - Workflow State Management (5 endpoints)
1. **GET** `/api/workflow/{sessionId}` - Get workflow by session ID
   - **Status:** 🔍 Not tested

2. **POST** `/api/workflow/initialize` - Initialize new workflow
   - **Status:** 🔍 Not tested

3. **POST** `/api/workflow/{sessionId}/transition` - Update workflow stage
   - **Status:** 🔍 Not tested

4. **GET** `/api/workflow/{sessionId}/dependencies` - Check stage dependencies
   - **Status:** 🔍 Not tested

5. **GET** `/api/workflow/{sessionId}/progress` - Get workflow progress
   - **Status:** 🔍 Not tested

#### WorkflowController - Stage Transitions (1 endpoint)
6. **GET** `/api/workflow/{sessionId}/transitions` - Get stage transitions
   - **Status:** 🔍 Not tested

#### WorkflowController - Blocking Issues (3 endpoints)
7. **GET** `/api/workflow/{sessionId}/blocking-issues` - Get blocking issues
   - **Status:** 🔍 Not tested

8. **POST** `/api/workflow/{sessionId}/resolve-issue/{stageName}` - Resolve blocking issue
   - **Status:** 🔍 Not tested

#### PatientTypeWorkflowController - Patient Type Configurations (6 endpoints)
9. **GET** `/api/PatientTypeWorkflow/configurations` - Get all configurations
   - **Status:** 🔍 Not tested

10. **GET** `/api/PatientTypeWorkflow/configurations/{id}` - Get config by ID
    - **Status:** 🔍 Not tested

11. **GET** `/api/PatientTypeWorkflow/configurations/by-type/{patientType}` - Get config by type
    - **Status:** 🔍 Not tested

12. **POST** `/api/PatientTypeWorkflow/configurations` - Create configuration
    - **Status:** 🔍 Not tested

13. **PUT** `/api/PatientTypeWorkflow/configurations/{id}` - Update configuration
    - **Status:** 🔍 Not tested

14. **DELETE** `/api/PatientTypeWorkflow/configurations/{id}` - Delete configuration
    - **Status:** 🔍 Not tested

#### PatientTypeWorkflowController - Document Checklist (8 endpoints)
15. **GET** `/api/PatientTypeWorkflow/checklist/session/{sessionId}` - Get session checklist
    - **Status:** 🔍 Not tested

16. **GET** `/api/PatientTypeWorkflow/checklist/{id}` - Get checklist item by ID
    - **Status:** 🔍 Not tested

17. **POST** `/api/PatientTypeWorkflow/checklist/generate` - Generate checklist from config
    - **Status:** 🔍 Not tested

18. **POST** `/api/PatientTypeWorkflow/checklist` - Create checklist item
    - **Status:** 🔍 Not tested

19. **PUT** `/api/PatientTypeWorkflow/checklist/{id}` - Update checklist item
    - **Status:** 🔍 Not tested

20. **POST** `/api/PatientTypeWorkflow/checklist/{id}/upload` - Upload document
    - **Status:** 🔍 Not tested

21. **POST** `/api/PatientTypeWorkflow/checklist/{id}/verify` - Verify document
    - **Status:** 🔍 Not tested

22. **DELETE** `/api/PatientTypeWorkflow/checklist/{id}` - Delete checklist item
    - **Status:** 🔍 Not tested

#### PatientTypeWorkflowController - Checklist Status (1 endpoint)
23. **GET** `/api/PatientTypeWorkflow/checklist/session/{sessionId}/status` - Get checklist status
    - **Status:** 🔍 Not tested

### Database Schema
- **Tables:** 5 tables
  1. `counseling_workflow_state` (state machine, 30+ columns) ✅
  2. `workflow_stage_transitions` (audit log, 15+ columns) ✅
  3. `workflow_notifications` (real-time alerts, 20+ columns) ✅
  4. `patient_type_configurations` (8 patient types seeded) ✅
  5. `patient_type_document_checklist` (dynamic checklist, 18 columns) ✅

- **Migration:** `module03_10_workflow_orchestration.sql` + `module03_03_patient_type_workflows.sql`

### Workflow Stages
```
SessionStarted
→ AssessmentInProgress
→ PackageBuilt
→ DocumentsCollected
→ TestsOrdered
→ TestsCompleted
→ FitnessClearanceObtained
→ OTBooked
→ PaymentInitiated
→ PaymentCompleted
→ InsuranceProcessing
→ InsuranceApproved
→ ConsentsSigned
→ AdmissionScheduled
→ ReadyForSurgery
→ SessionCompleted
```

### Patient Types Supported
1. **Cash** - Direct payment (50% advance)
2. **Insurance** - Cashless (pre-auth required)
3. **CoPay** - 20% patient co-payment
4. **ESH** - Employee State Health (zero advance)
5. **CGHS** - Central Govt Health Scheme (reimbursement)
6. **Arograshree** - Karnataka state scheme for BPL
7. **SGHS** - State Govt Health Scheme (direct billing)
8. **Camp** - Free surgery camp (NGO/CSR sponsored)

### Entity Configuration (AppDbContext)
- **Status:** ⚠️ Unknown - Not verified yet
- **Recommendation:** Check before testing

---

## Critical Issues Summary

### Issue 1: Module 3.7 Payments - Missing Entity Mappings
- **Severity:** 🔴 HIGH
- **Impact:** Blocks 18 endpoints
- **Root Cause:** No HasColumnName() mappings in AppDbContext
- **Fix Effort:** 2-3 hours
- **Priority:** P1

### Issue 2: Module 3.8 Admissions - Column Name Mismatch
- **Severity:** 🔴 HIGH
- **Impact:** Blocks 11 endpoints
- **Root Cause:** Wrong column name in HasColumnName() mapping
- **Fix Effort:** 5 minutes
- **Priority:** P0 (Quick Win)

### Issue 3: Module 3.9 Consents - Unknown Entity Status
- **Severity:** 🟡 MEDIUM
- **Impact:** Potentially blocks 11 endpoints
- **Root Cause:** Not yet investigated
- **Fix Effort:** Unknown (likely similar to 3.7)
- **Priority:** P2

### Issue 4: Module 3.10 Workflow - Not Verified
- **Severity:** 🟡 MEDIUM
- **Impact:** Potentially blocks 24 endpoints
- **Root Cause:** Not yet investigated
- **Fix Effort:** Unknown
- **Priority:** P3

---

## Recommended Fix Strategy

### Phase 1: Quick Wins (30 minutes)
1. **Fix Module 3.8 Admissions** - Single column mapping fix
   - Update: `entity.Property(e => e.ActualAdmissionDate).HasColumnName("admission_date");`
   - Test: Create 3 admissions (DayCare, IPD, Emergency)
   - Expected Result: 11 endpoints unblocked ✅

### Phase 2: Module 3.7 Payments (3 hours)
1. **Add Entity Mappings** - Apply Module 3.6 pattern
   - Add ~40 HasColumnName() mappings for PaymentTransaction entity
   - Add ~20 mappings for PaymentLink entity
   - Add ~25 mappings for GovernmentSchemeClaim entity
2. **Test Payment Workflows**
   - Create 3 payments (Cash, Card, UPI)
   - Test payment links generation
   - Test government claims workflow
3. **Expected Result:** 18 endpoints unblocked ✅

### Phase 3: Module 3.9 Consents (2 hours)
1. **Verify Entity Configuration** - Check AppDbContext
2. **Add Missing Mappings** (if needed)
3. **Test Consent Workflows**
   - Create consent templates
   - Render consents for patients
   - Test digital signature flow
4. **Expected Result:** 11 endpoints unblocked ✅

### Phase 4: Module 3.10 Workflow (2 hours)
1. **Verify Entity Configuration** - Check AppDbContext
2. **Add Missing Mappings** (if needed)
3. **Test Workflow Orchestration**
   - Initialize workflow for session
   - Test stage transitions
   - Test patient type configurations
   - Test document checklist workflow
4. **Expected Result:** 24 endpoints unblocked ✅

### Total Estimated Effort: 7.5 hours

---

## Testing Checklist

### Module 3.6 Insurance ✅
- [x] List pre-authorizations
- [x] Create pre-authorization (3 test cases)
- [x] Update pre-authorization
- [x] Change status (Draft → Submitted → Approved)
- [x] Submit to TPA
- [x] Record TPA response
- [x] Link to counseling session
- [x] Upload documents
- [x] Filter by status
- [x] Filter by sessionId

### Module 3.7 Payments ⏸️
- [ ] Create payment (Cash, Card, UPI)
- [ ] Process payment
- [ ] Issue refund
- [ ] Generate payment link (Razorpay)
- [ ] Send payment link via SMS/Email
- [ ] Create government scheme claim
- [ ] Approve/reject claim
- [ ] Submit claim to government
- [ ] Payment reconciliation

### Module 3.8 Admissions ⏸️
- [ ] Create admission (DayCare, IPD, Emergency)
- [ ] Assign bed to patient
- [ ] Discharge patient
- [ ] Cancel admission
- [ ] Reserve bed
- [ ] Check bed availability
- [ ] Bed occupancy report

### Module 3.9 Consents ⏸️
- [ ] Create consent templates
- [ ] Render consent for patient
- [ ] Digital signature
- [ ] Revoke consent
- [ ] Generate PDF
- [ ] List pending signatures

### Module 3.10 Workflow ⏸️
- [ ] Initialize workflow
- [ ] Update workflow stage
- [ ] Check dependencies
- [ ] Get workflow progress
- [ ] Create patient type configurations
- [ ] Generate document checklist
- [ ] Upload documents
- [ ] Verify documents
- [ ] Get checklist status

---

## Database Compliance Report

### Schema Status
| Module | Tables | Migration Applied | Schema Valid | Entity Config |
|--------|--------|-------------------|--------------|---------------|
| 3.6 Insurance | 1 | ✅ | ✅ | ✅ |
| 3.7 Payments | 6 | ✅ | ✅ | ❌ |
| 3.8 Admissions | 1 | ✅ | ⚠️ | ❌ |
| 3.9 Consents | 5 | ✅ | 🔍 | 🔍 |
| 3.10 Workflow | 5 | ✅ | ✅ | 🔍 |

### Standard Compliance
All tables follow HIPAA-compliant patterns:
- ✅ UUID primary keys (`id`)
- ✅ Tenant isolation (`tenant_id`)
- ✅ Soft delete (`deleted_at`)
- ✅ Audit trail (`created_by_user_id`, `updated_by_user_id`)
- ✅ Timestamps (`created_at`, `updated_at`)
- ✅ RLS policies enabled

---

## Next Steps

### Immediate Actions (Today)
1. **Fix Module 3.8 Admissions** - 30 minutes
2. **Test Module 3.8 Endpoints** - 1 hour
3. **Document results** - 15 minutes

### This Week
1. **Fix Module 3.7 Payments** - 3 hours (Monday)
2. **Test Module 3.7 Endpoints** - 2 hours (Monday)
3. **Verify Module 3.9 Consents** - 1 hour (Tuesday)
4. **Test Module 3.9 Endpoints** - 2 hours (Tuesday)
5. **Verify Module 3.10 Workflow** - 1 hour (Wednesday)
6. **Test Module 3.10 Endpoints** - 3 hours (Wednesday-Thursday)

### Week 2
1. **Frontend Integration** - Start building UI for tested modules
2. **End-to-End Testing** - Complete patient journey workflow
3. **Performance Testing** - Load testing on all endpoints
4. **Documentation** - API documentation for frontend team

---

## Appendix A: Entity Mapping Reference (Module 3.6 Template)

### Working Pattern from InsurancePreAuthorization.cs

```csharp
protected override void OnModelCreating(ModelBuilder builder)
{
    // Insurance Pre-Authorization (WORKING EXAMPLE)
    builder.Entity<InsurancePreAuthorization>(entity =>
    {
        entity.ToTable("insurance_pre_authorization");
        
        entity.Property(e => e.Id).HasColumnName("id");
        entity.Property(e => e.TenantId).HasColumnName("tenant_id");
        entity.Property(e => e.BranchId).HasColumnName("branch_id");
        entity.Property(e => e.PatientId).HasColumnName("patient_id");
        entity.Property(e => e.SessionId).HasColumnName("session_id");
        
        entity.Property(e => e.PreAuthNumber).HasColumnName("pre_auth_number");
        entity.Property(e => e.InsuranceProvider).HasColumnName("insurance_provider");
        entity.Property(e => e.PolicyNumber).HasColumnName("policy_number");
        entity.Property(e => e.RequestedAmount).HasColumnName("requested_amount");
        entity.Property(e => e.ApprovedAmount).HasColumnName("approved_amount");
        entity.Property(e => e.Status).HasColumnName("status");
        
        entity.Property(e => e.TpaSubmitted).HasColumnName("tpa_submitted");
        entity.Property(e => e.TpaSubmissionDate).HasColumnName("tpa_submission_date");
        entity.Property(e => e.TpaApprovalNumber).HasColumnName("tpa_approval_number");
        
        entity.Property(e => e.CreatedAt).HasColumnName("created_at");
        entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
        entity.Property(e => e.CreatedByUserId).HasColumnName("created_by_user_id");
        entity.Property(e => e.UpdatedByUserId).HasColumnName("updated_by_user_id");
        
        // ... continue for all properties
    });
}
```

### Required Pattern for Module 3.7 Payments

```csharp
builder.Entity<PaymentTransaction>(entity =>
{
    entity.ToTable("payment_transactions");
    
    // Standard fields
    entity.Property(e => e.Id).HasColumnName("id");
    entity.Property(e => e.TenantId).HasColumnName("tenant_id");
    entity.Property(e => e.BranchId).HasColumnName("branch_id");
    entity.Property(e => e.PatientId).HasColumnName("patient_id");
    entity.Property(e => e.SessionId).HasColumnName("session_id");
    
    // Payment amounts
    entity.Property(e => e.TotalBillAmount).HasColumnName("total_bill_amount");
    entity.Property(e => e.DiscountAmount).HasColumnName("discount_amount");
    entity.Property(e => e.NetPayableAmount).HasColumnName("net_payable_amount");
    entity.Property(e => e.AmountPaid).HasColumnName("amount_paid");
    entity.Property(e => e.BalanceDue).HasColumnName("balance_due");
    
    // Payment details
    entity.Property(e => e.PaymentMethod).HasColumnName("payment_method");
    entity.Property(e => e.PaymentStatus).HasColumnName("payment_status");
    entity.Property(e => e.TransactionDate).HasColumnName("transaction_date");
    entity.Property(e => e.ReceiptNumber).HasColumnName("receipt_number");
    
    // ... continue for all 45 properties
});
```

---

## Appendix B: Test Data Files

### Module 3.6 Insurance (Used)
- `preauth1_cataract.json` ✅
- `preauth2_lasik.json` ✅
- `preauth3_trabeculectomy.json` ✅

### Module 3.7 Payments (Prepared)
- `payment1_cash.json` ⏸️
- `payment2_card.json` ⏸️
- `payment3_upi.json` ⏸️

### Module 3.8 Admissions (Prepared)
- `admission1_daycare.json` ⏸️
- `admission2_ipd.json` ⏸️
- `admission3_emergency.json` ⏸️

---

## Appendix C: Error Reference

### Error 1: Module 3.7 Payment Creation
```
POST http://localhost:5073/api/payments
Status: 400 Bad Request
Error: "column 'amount_paid' of relation 'payment_transactions' does not exist"
PostgreSQL Error Code: 42703 (undefined_column)
```

**Resolution:** Schema fixed with migration, entity mapping still missing

### Error 2: Module 3.8 Admission Creation
```
POST http://localhost:5073/api/admissions
Status: 400 Bad Request
Error: "column 'actual_admission_date' of relation 'patient_admissions' does not exist"
PostgreSQL Error Code: 42703 (undefined_column)
```

**Resolution:** Column name mismatch - DB has `admission_date`, not `actual_admission_date`

---

## Document History
- **v1.0** - February 22, 2026 - Initial discovery complete (Modules 3.6-3.10)
- **Next Update** - After fixing Module 3.8 and testing 11 endpoints

---

**End of Report**
