# Module 3 Frontend Roadmap
**Counseling & Surgery Package Management (Modules 3.6–3.10)**

**Last Verified**: March 2026 (code-checked against actual files)  
**Backend**: ✅ 58 endpoints complete (blockers in 3.7, 3.8 — see below)  
**Frontend Pages**: ✅ All page shells exist  
**Frontend Components**: ✅ All components and hooks exist  
**End-to-End Status**: ⚠️ Blocked pending backend blocker fixes

---

## Actual Code State (Verified)

### Page Files — All Exist
Location: `apps/hospital-portal-web/src/app/dashboard/counselor/`

| Page | File | Status |
|------|------|--------|
| Counselor Root | `page.tsx` | ✅ Exists |
| Insurance | `insurance/page.tsx` | ✅ Exists |
| Payments | `payments/page.tsx` | ✅ Exists |
| Admissions | `admissions/page.tsx` | ✅ Exists |
| Consents | `consents/page.tsx` | ✅ Exists |
| Workflow | `workflow/page.tsx` | ✅ Exists |
| Sessions | `sessions/page.tsx` | ✅ Exists |
| Session Detail | `sessions/[id]/page.tsx` | ✅ Exists |
| Follow-Ups | `follow-ups/page.tsx` | ✅ Exists |
| Queue | `queue/page.tsx` | ✅ Exists |
| Workspace | `workspace/page.tsx` | ✅ Exists |

### Components — All Exist
Location: `apps/hospital-portal-web/src/components/counselor/`

**Module 3.6 Insurance**
- `insurance/PreAuthTable.tsx` ✅
- `insurance/PreAuthForm.tsx` ✅
- `insurance/ClaimsTable.tsx` ✅
- `insurance/ClaimForm.tsx` ✅

**Module 3.7 Payments**
- `payments/PaymentsTable.tsx` ✅
- `payments/PaymentForm.tsx` ✅
- `payments/PaymentLinksTable.tsx` ✅
- `payments/PaymentLinkForm.tsx` ✅
- `payments/GovernmentClaimsTable.tsx` ✅
- `payments/GovernmentClaimForm.tsx` ✅

**Module 3.8 Admissions**
- `admissions/AdmissionsTable.tsx` ✅
- `admissions/AdmissionForm.tsx` ✅
- `admissions/BedReservationsTable.tsx` ✅
- `admissions/BedReservationForm.tsx` ✅

**Module 3.9 Consents**
- `consents/ConsentTemplatesTable.tsx` ✅
- `consents/ConsentTemplateForm.tsx` ✅
- `consents/PatientConsentsTable.tsx` ✅
- `consents/RenderConsentForm.tsx` ✅
- `consents/SignatureModal.tsx` ✅
- `consents/SignaturePad.tsx` ✅

**Module 3.10 Workflow**
- `workflow/WorkflowsTable.tsx` ✅
- `workflow/WorkflowForm.tsx` ✅
- `workflow/WorkflowProgressDialog.tsx` ✅

**Follow-Ups**
- `follow-ups/FollowUpCalendar.tsx` ✅
- `follow-ups/FollowUpForm.tsx` ✅

**Workspace Widgets**
- `workspace/QueueWidget.tsx` ✅
- `workspace/RecentSessionsWidget.tsx` ✅
- `workspace/FollowUpsWidget.tsx` ✅
- `workspace/QuickActionsWidget.tsx` ✅

### API Hooks — All Exist
Location: `apps/hospital-portal-web/src/hooks/`

| Hook File | Covers |
|-----------|--------|
| `use-insurance.ts` | Insurance pre-auths |
| `use-insurance-preauth.ts` | Pre-auth detail actions |
| `use-payments.ts` | Payments, links, govt claims |
| `use-admissions.ts` | Admissions + bed reservations |
| `use-consents.ts` | Consent templates + patient consents |
| `use-workflows.ts` | Workflow orchestration |
| `use-counseling-sessions.ts` | Sessions CRUD |
| `use-follow-ups.ts` | Follow-up management |
| `use-queue.ts` | Queue state |
| `use-packages.ts` | Surgery packages |

---

## Technology Stack
- **Framework**: Next.js 13.5.1 (App Router)
- **UI**: shadcn/ui + Tailwind CSS
- **State**: Zustand (auth/tenant), React Query (server data)
- **Forms**: React Hook Form + Zod
- **Tables**: TanStack Table v8
- **Signatures**: `SignaturePad.tsx` (HTML5 Canvas, `counselor/consents/`)
- **HTTP Client**: Axios via `src/lib/api.ts` (includes tenant + JWT interceptors)

---

## Backend Blockers (Must Fix Before E2E Testing)

### Blocker 1 — Module 3.7 Payments: Missing Entity Mappings
**File**: `microservices/auth-service/AuthService/Data/AppDbContext.cs`  
**Issue**: 40+ `HasColumnName()` mappings missing for Payment and GovernmentClaim entities  
**Effect**: Payments API throws EF Core `column not found` errors at runtime  
**Fix**: Add explicit `HasColumnName()` for every property on `Payment`, `PaymentLink`, `GovernmentClaim` entities  
**Responsible**: Backend developer

### Blocker 2 — Module 3.8 Admissions: Column Name Mismatch
**File**: `microservices/auth-service/AuthService/Data/AppDbContext.cs`  
**Issue**: `AdmissionManagement` entity maps to `actual_admission_date` but DB column is `admission_date`  
**Effect**: Admissions API `POST /api/admissions` returns 500 error  
**Fix**: Change mapping to `.HasColumnName("admission_date")` for that property  
**Responsible**: Backend developer

### Resolution Order
1. Fix Blocker 2 first (1-line change, low risk)
2. Fix Blocker 1 (audit all Payment entity properties against DB schema)
3. Run `consolidated\run_all.ps1 -RunTests` to validate
4. Then begin frontend E2E integration testing

---

## Module 3.6 — Insurance Pre-Authorization
**Backend**: ✅ 9 endpoints, fully tested  
**Frontend**: ✅ All components built

**API Endpoints**:
- `GET /api/insurance/pre-authorizations` — list pre-auths
- `POST /api/insurance/pre-authorizations` — create pre-auth
- `PUT /api/insurance/pre-authorizations/{id}` — update pre-auth
- `GET /api/insurance/pre-authorizations/{id}/workflow` — approval workflow
- `PUT /api/insurance/pre-authorizations/{id}/workflow/advance` — advance stage
- `GET /api/insurance/claims` — list claims
- `POST /api/insurance/claims` — submit claim
- `PUT /api/insurance/claims/{id}` — update claim
- `GET /api/insurance/claims/{id}` — claim detail

**Component → Page Mapping**:
- `insurance/page.tsx` → uses `PreAuthTable`, `ClaimsTable`, `use-insurance.ts`
- `PreAuthForm.tsx` → creates/edits pre-authorization records
- `ClaimForm.tsx` → submits insurance claims linked to pre-auths

**Testing Status**: ✅ Module tested, integration verified

---

## Module 3.7 — Payment Processing
**Backend**: ⚠️ 18 endpoints built, BLOCKED by missing entity mappings  
**Frontend**: ✅ All components built

**API Endpoints** (available once blocker fixed):
- `GET/POST /api/payments/transactions`
- `GET/PUT /api/payments/transactions/{id}`
- `GET/POST /api/payments/links`
- `GET/PUT /api/payments/links/{id}`
- `POST /api/payments/links/{id}/send`
- `GET/POST /api/payments/government-claims`
- `GET/PUT /api/payments/government-claims/{id}`
- `POST /api/payments/government-claims/{id}/submit`

**Component → Page Mapping**:
- `payments/page.tsx` → uses `PaymentsTable`, `PaymentLinksTable`, `GovernmentClaimsTable`, `use-payments.ts`
- Forms: `PaymentForm`, `PaymentLinkForm`, `GovernmentClaimForm`

**Note**: Per project policy, patients do NOT pay during counseling. Payments are created as payment links or insurance claims only.

---

## Module 3.8 — Admission Management
**Backend**: ⚠️ 11 endpoints built, BLOCKED by `admission_date` column mismatch  
**Frontend**: ✅ All components built

**API Endpoints** (available once blocker fixed):
- `GET/POST /api/admissions`
- `GET/PUT/DELETE /api/admissions/{id}`
- `POST /api/admissions/{id}/confirm`
- `GET/POST /api/admissions/bed-reservations`
- `GET/PUT /api/admissions/bed-reservations/{id}`
- `POST /api/admissions/bed-reservations/{id}/confirm`

**Component → Page Mapping**:
- `admissions/page.tsx` → uses `AdmissionsTable`, `BedReservationsTable`, `use-admissions.ts`
- Forms: `AdmissionForm`, `BedReservationForm`

---

## Module 3.9 — Consent Management
**Backend**: ✅ 11 endpoints, tested  
**Frontend**: ✅ All components built (including digital signature capture)

**API Endpoints**:
- `GET/POST /api/consents/templates`
- `GET/PUT/DELETE /api/consents/templates/{id}`
- `POST /api/consents/render` — renders template with patient placeholders
- `GET/POST /api/consents/patient-consents`
- `GET /api/consents/patient-consents/{id}`
- `POST /api/consents/patient-consents/{id}/sign`

**Component → Page Mapping**:
- `consents/page.tsx` → uses `ConsentTemplatesTable`, `PatientConsentsTable`, `use-consents.ts`
- Signature flow: `RenderConsentForm` → `SignatureModal` → `SignaturePad`

---

## Module 3.10 — Workflow Orchestration
**Backend**: ✅ 9 endpoints, tested  
**Frontend**: ✅ All components built

**API Endpoints**:
- `GET/POST /api/workflow/workflows`
- `GET /api/workflow/workflows/{id}`
- `POST /api/workflow/workflows/{id}/initialize`
- `GET /api/workflow/workflows/{id}/progress`
- `PUT /api/workflow/workflows/{id}/stage`
- `GET /api/workflow/workflows/{id}/transitions`

**Component → Page Mapping**:
- `workflow/page.tsx` → uses `WorkflowsTable`, `WorkflowProgressDialog`, `use-workflows.ts`

---

## Integration Points

### Shared Infrastructure (All Modules)
- **API Client**: `src/lib/api.ts` — automatically adds `X-Tenant-ID` header + JWT Bearer
- **Auth**: `src/lib/auth-store.ts` (Zustand) — provides `token`, `tenantId`, `user`
- **Layout**: `src/app/dashboard/layout.tsx` — sidebar + navigation
- **UI Primitives**: shadcn/ui (Table, Dialog, Form, Button, Badge, etc.)

### Cross-Module Data Flow
```
Session (3.1-3.5)
  └→ Package selected
       ├→ Insurance Pre-Auth (3.6) — if insurance patient
       ├→ Payment Link (3.7) — payment collection after discharge
       ├→ Admission (3.8) — bed reservation for surgery day
       ├→ Consent (3.9) — digital signatures before procedure
       └→ Workflow (3.10) — orchestrates all above stages
```

### Multi-Tenant API Pattern
All API calls must include tenant context. The `api.ts` Axios instance handles this automatically. Do NOT use `fetch()` directly — always use the `getApi()` helper.

---

## Testing Approach

### Backend Testing (Before Frontend)
1. Fix the two blockers (3.7, 3.8) listed above
2. Run Swagger at `http://localhost:5073/swagger`
3. Authenticate: `POST /api/auth/login` → copy token → Authorize
4. Test each POST endpoint with JSON from `tests/data/` folder
5. Validate `tenant_id` is auto-assigned from JWT (never pass manually)

### Frontend Testing
1. Start backend: `.\START_BACKEND.ps1` from project root
2. Start frontend: `cd apps/hospital-portal-web; pnpm dev`
3. Login with test credentials (see `TEST_CREDENTIALS.md`)
4. Navigate to `/dashboard/counselor/insurance` to test 3.6 first
5. Proceed through 3.8 → 3.9 → 3.10 once blockers are fixed

### Session-to-Discharge End-to-End Flow
1. Create counseling session (existing queue)
2. Select surgery package
3. Create insurance pre-auth (3.6) — for insurance patients
4. Reserve bed (3.8) — on surgery date
5. Render + sign consent forms (3.9)
6. Initialize workflow (3.10) — tracks all above stages
7. Create payment link (3.7) — after discharge

---

## Replaced Documents
This file consolidates and replaces:
- `MODULE3_FRONTEND_IMPLEMENTATION_PLAN.md` → archived to `archive/docs/module3-status/`
- `MODULE_3_FRONTEND_ROADMAP.md` → archived to `archive/docs/module3-status/`
- `MODULE_3_COMPLETE_IMPLEMENTATION_STATUS.md` → archived to `archive/docs/module3-status/`

For backend API details, see: `MODULE3_BACKEND_REFERENCE.md`  
For counselor session workflow, see: `COUNSELOR_MODULE_REFERENCE.md`
