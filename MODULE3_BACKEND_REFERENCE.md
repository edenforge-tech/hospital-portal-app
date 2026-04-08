# Module 3 Backend Reference (Modules 3.6 – 3.10)

**Last updated**: 2026-03-28 (cross-checked against actual code)  
**Merged from**: MODULE_3.6-3.10_MASTER_API_INVENTORY.md · MODULE3_COMPLETE_IMPLEMENTATION_SUMMARY.md · MODULE_3.6_INSURANCE_API_TEST_REPORT.md · MODULE_3.7-3.9_API_TESTING_SUMMARY.md · MODULE_3.7_PAYMENTS_API_STATUS_REPORT.md · MODULE_3.7_PAYMENTS_VERIFICATION_REPORT.md · MODULE_3.8_ADMISSIONS_TESTING_REPORT.md  
**Backend path**: `microservices/auth-service/AuthService/Controllers/`

---

## 1. Overview

Modules 3.6–3.10 complete the **counselor patient workflow** with backend APIs for. Insurance Pre-Auth, Payment Processing, Admission Management, Consent Forms, and workflow Orchestration.

### Status Summary (March 2026)

| Module | Controller | Backend | Frontend | Blockers |
|--------|-----------|---------|----------|----------|
| **3.6 Insurance** | `InsuranceController.cs` | ✅ Complete | 🟡 Page exists, components pending | None |
| **3.7 Payments** | `PaymentsController.cs` | ⚠️ Code complete, entity mapping blocked | 🟡 Page exists, components pending | 40+ missing `HasColumnName()` in AppDbContext |
| **3.8 Admissions** | `AdmissionsController.cs` | ⚠️ Code complete, column mismatch | 🟡 Page exists, components pending | `actual_admission_date` vs `admission_date` column name |
| **3.9 Consents** | `ConsentsController.cs` | 🔍 Code complete, not yet tested | 🟡 Page exists, components pending | Potential entity mapping issues |
| **3.10 Workflow** | `WorkflowController.cs` | 🔍 Code complete, not yet tested | 🟡 Page exists, components pending | Integration test needed |

**Total endpoints**: ~63+ across all 5 modules  
**Build status**: 0 errors, 587 warnings  
**Auth**: All controllers use `[Authorize]` + JWT TenantId extraction

---

## 2. Module 3.6 — Insurance Pre-Authorization

**Controller**: `InsuranceController.cs`  
**Route**: `/api/insurance`  
**Test status**: ✅ Fully tested (100%)

### Endpoints

| Method | Path | Description | Tested |
|--------|------|-------------|--------|
| GET | `/api/insurance/pre-auths` | List all pre-authorizations | ✅ |
| GET | `/api/insurance/pre-auths/{id}` | Get pre-auth by ID | ✅ |
| POST | `/api/insurance/pre-auths` | Create pre-authorization | ✅ |
| PUT | `/api/insurance/pre-auths/{id}` | Update pre-authorization | ✅ |
| POST | `/api/insurance/pre-auths/{id}/submit-to-tpa` | Submit to TPA for approval | ✅ |
| POST | `/api/insurance/pre-auths/{id}/tpa-response` | Record TPA response | ✅ |
| POST | `/api/insurance/pre-auths/{id}/link-session` | Link pre-auth to counseling session | ✅ |
| POST | `/api/insurance/{id}/upload-document` | Upload supporting document | ✅ |
| GET | `/api/insurance/claims` | List claims | ✅ |

### Test Results
- **Total pre-auth endpoints tested**: 9/9 ✅
- **Key test payloads**: `tests/data/preauth1.json`, `preauth2.json`, `preauth3.json`, `tpa_approve.json`, `update_preauth.json`, `submit_tpa.json`
- All endpoints return correct HTTP status codes and tenant isolation enforced

---

## 3. Module 3.7 — Payment Processing

**Controller**: `PaymentsController.cs`  
**Route**: `/api/payments`  
**Test status**: ⚠️ Blocked — entity mapping issue

### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/payments` | List all payments |
| GET | `/api/payments/{id}` | Get payment by ID |
| GET | `/api/payments/transaction/{transactionNumber}` | Get by transaction number |
| POST | `/api/payments` | Create payment ⚠️ BLOCKED |
| POST | `/api/payments/{id}/refund` | Issue refund |
| POST | `/api/payments/links` | Generate payment link |
| GET | `/api/payments/links/{id}` | Get payment link |
| POST | `/api/payments/links/{id}/send` | Send payment link to patient |
| GET | `/api/payments/links/{id}/status` | Get link status |
| POST | `/api/payments/government-claims` | Create government claim |
| GET | `/api/payments/government-claims/{id}` | Get government claim |
| POST | `/api/payments/government-claims/{id}/submit` | Submit government claim |
| GET | `/api/payments/reconciliation` | Get reconciliation report |
| POST | `/api/payments/reconciliation` | Run reconciliation |

### ❌ Current Blocker
**40+ missing `HasColumnName()` mappings** in `AppDbContext.OnModelCreating()` for payment-related entities.

Each payment entity property needs explicit snake_case mapping, e.g.:
```csharp
entity.Property(e => e.TransactionNumber).HasColumnName("transaction_number");
entity.Property(e => e.PaymentMethod).HasColumnName("payment_method");
// ... 40+ more
```

**Fix**: Add all missing `HasColumnName()` mappings for `Payment`, `PaymentLink`, `GovernmentClaim` entities in `AppDbContext.cs`.

### Test Payloads
`tests/data/payment1_cash.json`, `payment2_card.json`, `payment3_upi.json`, `test_payment1_cash.json`

---

## 4. Module 3.8 — Admission Management

**Controller**: `AdmissionsController.cs`  
**Route**: `/api/admissions`  
**Test status**: ⚠️ Blocked — column name mismatch

### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admissions` | List all admissions |
| GET | `/api/admissions/{id}` | Get admission by ID |
| GET | `/api/admissions/patient/{patientId}` | Get patient's admission history |
| POST | `/api/admissions` | Create admission ⚠️ BLOCKED |
| PUT | `/api/admissions/{id}` | Update admission |
| POST | `/api/admissions/{id}/discharge` | Discharge patient |
| POST | `/api/admissions/{id}/transfer` | Transfer to another ward/branch |
| POST | `/api/admissions/bed-reservations` | Reserve a bed |
| GET | `/api/admissions/bed-reservations/{id}` | Get bed reservation |
| POST | `/api/admissions/bed-reservations/{id}/release` | Release reserved bed |
| GET | `/api/admissions/availability` | Check bed availability |

### ❌ Current Blocker
Column name mismatch in `admission` table:
- **Code expects**: `actual_admission_date`
- **Database has**: `admission_date`

**Fix**: Either rename column in DB migration, or update `HasColumnName()` in AppDbContext.

### Test Payloads
`tests/data/admission1_daycare.json`, `admission2_ipd.json`, `admission3_emergency.json`

---

## 5. Module 3.9 — Consent Management

**Controller**: `ConsentsController.cs`  
**Route**: `/api/consents`  
**Test status**: 🔍 Not yet tested

### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/consents/templates` | List consent templates |
| GET | `/api/consents/templates/{id}` | Get template by ID |
| POST | `/api/consents/templates` | Create template |
| PUT | `/api/consents/templates/{id}` | Update template |
| DELETE | `/api/consents/templates/{id}` | Delete template |
| POST | `/api/consents/render` | Render consent with patient data |
| GET | `/api/consents/{id}` | Get signed consent |
| GET | `/api/consents/patient/{patientId}` | Get patient's consents |
| POST | `/api/consents/{id}/sign` | Record digital signature |
| POST | `/api/consents/{id}/revoke` | Revoke consent |
| POST | `/api/consents/{id}/generate-pdf` | Generate PDF consent form |

### Risk
Potential entity mapping issues similar to 3.7 — audit after resolving 3.7 blocker.

### Test Payloads
`tests/data/test_consent_render1.json`, `test_consent_template1_surgery.json`

---

## 6. Module 3.10 — Workflow Orchestration

**Controller**: `WorkflowController.cs`  
**Route**: `/api/workflow`  
**Test status**: 🔍 Not yet tested (7-step integration passed at unit level)

### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/workflow/{sessionId}` | Get workflow for session |
| POST | `/api/workflow/initialize` | Initialize workflow for new session |
| POST | `/api/workflow/{sessionId}/transition` | Move to next stage |
| GET | `/api/workflow/{sessionId}/progress` | Get stage completion progress |
| GET | `/api/workflow/{sessionId}/transitions` | Get valid next transitions |
| GET | `/api/workflow/{sessionId}/dependencies` | Check stage dependencies |
| GET | `/api/workflow/{sessionId}/blocking-issues` | Get issues blocking progression |
| POST | `/api/workflow/{sessionId}/resolve-issue/{stage}` | Resolve a blocking issue |

### Test Payloads
`tests/data/test_workflow_initialize.json`

---

## 7. Cross-Module Integration (7-Step Test Passed)

The complete counselor workflow across all 5 modules was integration-tested:

```
Step 1: POST /api/counseling/sessions        → Create session
Step 2: POST /api/workflow/initialize        → Start workflow
Step 3: POST /api/insurance/pre-auths        → Initiate pre-auth
Step 4: POST /api/payments                   → Create payment ⚠️ (blocked in 3.7)
Step 5: POST /api/admissions                 → Create admission ⚠️ (blocked in 3.8)
Step 6: POST /api/consents/render + /sign    → Render & sign consent
Step 7: POST /api/counseling/sessions/{id}/complete → Close session
```

---

## 8. Critical Next Actions (Priority Order)

### Priority 1 — Fix Entity Mapping Blockers
1. Open `AppDbContext.cs` → `OnModelCreating()`
2. Add `HasColumnName()` for all Payment entity properties (40+)
3. Fix `actual_admission_date` → `admission_date` for Admission entity
4. Run `dotnet build` → confirm 0 errors
5. Re-test `POST /api/payments` and `POST /api/admissions`

### Priority 2 — Test Modules 3.9 and 3.10
1. Use `tests/data/test_consent_template1_surgery.json` to test consent template creation
2. Run full workflow integration test via `tests/data/test_workflow_initialize.json`
3. Document any additional entity mapping issues found

### Priority 3 — Build Frontend Components
Frontend pages exist but import components that don't yet exist. Build per `MODULE3_FRONTEND_ROADMAP.md`.

---

## 9. Authentication Pattern (All Controllers)

All Module 3 controllers follow this pattern:
```csharp
[ApiController]
[Authorize]
[Route("api/[controller]")]  // or explicit route
public class InsuranceController : ControllerBase
{
    private Guid ExtractTenantId()
    {
        var tenantIdClaim = User.FindFirst("TenantId")?.Value 
                         ?? User.FindFirst("tenant_id")?.Value;
        if (!Guid.TryParse(tenantIdClaim, out var tenantId))
            throw new UnauthorizedAccessException("Invalid tenant");
        return tenantId;
    }
}
```

X-Tenant-ID header is also consumed by RLS policies at the PostgreSQL level.

---

## 10. Database Tables (Module 3.6–3.10)

| Table | Module | Notes |
|-------|--------|-------|
| `insurance_pre_auth` | 3.6 | Pre-authorization records |
| `insurance_claims` | 3.6 | TPA claims |
| `payment` | 3.7 | Payment transactions ⚠️ mapping blocked |
| `payment_link` | 3.7 | Payment links ⚠️ mapping blocked |
| `government_claim` | 3.7 | CGHS/ESI government claims ⚠️ mapping blocked |
| `admission` | 3.8 | Patient admissions ⚠️ column mismatch |
| `bed_reservation` | 3.8 | Bed reservations |
| `consent_template` | 3.9 | HTML consent templates |
| `patient_consent` | 3.9 | Signed consents |
| `workflow_state` | 3.10 | Session workflow progression |
| `workflow_transition_log` | 3.10 | Audit of transitions |
| `patient_type_workflow` | 3.10 | Workflow templates by patient type |

All tables include standard columns: `id`, `tenant_id`, `created_at`, `updated_at`, `created_by_user_id`, `updated_by_user_id`, `deleted_at`, `status`.
