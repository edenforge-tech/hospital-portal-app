# Counselor Module — Complete Reference

**Last updated**: 2026-03-28 (cross-checked against actual code)  
**Merged from**: COUNSELOR_WORKFLOW_COMPLETE.md · COUNSELOR_7_STEP_WORKFLOW_INTEGRATION_GUIDE.md · COUNSELOR_WORKFLOW_TEST_PLAN.md · COUNSELOR_PERSONALIZED_UX_COMPLETE.md  
**Frontend path**: `apps/hospital-portal-web/src/app/dashboard/counselor/`  
**Backend**: `api/counseling/` (CounselingController)

---

## 1. Overview

The Counselor module manages the **pre-surgical patient journey** from queue intake through final surgical confirmation and follow-up. Counselors guide patients through clinical, financial, and administrative steps — **without collecting payments directly** (directed to the billing desk).

### Role Responsibilities
| Action | Counselor | Billing Desk |
|--------|-----------|--------------|
| Queue management | ✅ | — |
| Clinical review / IOL selection | ✅ | — |
| Package selection | ✅ | — |
| Insurance pre-auth | ✅ | — |
| Payment collection | ❌ | ✅ |
| Consent management | ✅ | — |
| Surgery scheduling | ✅ | — |
| Post-surgery follow-up | ✅ | — |

---

## 2. 7-Stage Patient Journey (Canonical)

> **Note**: Earlier docs (WORKFLOW_TEST_PLAN) listed 8 stages. The 7-stage model below is the canonical flow used in production code.

| Stage | Name | Key Actions | Widget/Component |
|-------|------|-------------|-----------------|
| 1 | **Queue Intake** | Patient arrives, counselor calls next in queue | `EnhancedQueueCard`, `CounselorSmartStats` |
| 2 | **Initial Assessment** | Demographics review, chief complaint, visual acuity entry | `PatientSearchBarEnhanced`, demographics form |
| 3 | **Clinical Review** | Pre-operative tests review, IOL selection, eye condition | `PreOperativeInstructionsWidget` |
| 4 | **Package Selection** | Treatment package and addons, pricing | Package selection widget |
| 5 | **Insurance & Financial** | Pre-auth initiation if insured; direct billing otherwise | Insurance form → billing desk handoff |
| 6 | **Consent & Documentation** | Consent form digital signature, document upload | `SessionCompletionModal` |
| 7 | **Surgery Confirmation & Follow-up** | Schedule surgery, post-op follow-up booking | `SurgeryConfirmedTab`, `SurgeryFollowupTab` |

### Stage Progression
Steps are tracked via `StepProgressBreadcrumb` (collapsible with `CollapsedWidgetBadge`).

> ⚠️ **Known Issue**: Stage state is **not persisted** server-side yet. Refreshing the page resets to Stage 1.  
> **Fix needed**: `PUT /api/counseling/sessions/{id}/advance-stage` endpoint (does not exist yet).

---

## 3. Backend — API Endpoints

**Base URL**: `/api/counseling/`  
**Auth**: JWT Bearer + TenantId in claims  
**Controller**: `CounselingController.cs`  

### Session Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/counseling/sessions` | List sessions (filtered by tenant/branch) |
| GET | `/api/counseling/sessions/{id}` | Get session detail |
| POST | `/api/counseling/sessions` | Create new session |
| PUT | `/api/counseling/sessions/{id}` | Update session |
| POST | `/api/counseling/sessions/{id}/start` | Start session (mark in-progress) |
| POST | `/api/counseling/sessions/{id}/complete` | Complete session |
| POST | `/api/counseling/sessions/{id}/cancel` | Cancel session |

### Queue Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/counseling/queue` | Get current queue |
| POST | `/api/counseling/queue/{id}/call-next-patient` | Call next patient from queue |

### Supporting Features
- Session notes and document attachment via CounselingWorkflowService
- Statistics endpoint for counselor dashboard stats
- CounselorCommunicationService for activity logging

### ❌ Missing Endpoint (to be implemented)
```
PUT /api/counseling/sessions/{id}/advance-stage
Body: { "stage": 3 }
```
Required for server-side stage persistence.

---

## 4. Frontend — Component Structure

**Root path**: `apps/hospital-portal-web/src/app/dashboard/counselor/`

### Pages (all exist)
| Path | File | Status |
|------|------|--------|
| `/dashboard/counselor` | `page.tsx` | ✅ Queue dashboard |
| `/dashboard/counselor/workspace` | `workspace/page.tsx` | ✅ Overview |
| `/dashboard/counselor/sessions` | `sessions/page.tsx` | ✅ List |
| `/dashboard/counselor/sessions/[id]` | `sessions/[id]/page.tsx` | ✅ Session detail |
| `/dashboard/counselor/insurance` | `insurance/page.tsx` | ✅ Pre-auth management |
| `/dashboard/counselor/payments` | `payments/page.tsx` | ✅ Payment view |
| `/dashboard/counselor/admissions` | `admissions/page.tsx` | ✅ Admissions |
| `/dashboard/counselor/consents` | `consents/page.tsx` | ✅ Consent forms |
| `/dashboard/counselor/queue` | `queue/` | ✅ Queue TV display |
| `/dashboard/counselor/surgery-confirmed` | `surgery-confirmed/` | ✅ Confirmed surgeries |
| `/dashboard/counselor/surgery-followup` | `surgery-followup/` | ✅ Follow-up tracker |
| `/dashboard/counselor/workflow` | `workflow/page.tsx` | ✅ Workflow overview |

### Key Components (confirmed implemented)
| Component | Purpose |
|-----------|---------|
| `CounselorSmartStats` | Dashboard KPI cards (patients seen, queue depth) |
| `EnhancedQueueCard` | Queue entry card with patient summary |
| `PatientSearchBarEnhanced` | Global search with assigned-patients filter |
| `SurgeryConfirmedTab` | Confirmed surgery list with details |
| `SurgeryFollowupTab` | Post-op follow-up scheduling |
| `CounselorAnalyticsTab` | Session analytics and trends |
| `CollapsedWidgetBadge` | Compact stage indicator (for collapsed widgets) |
| `StepProgressBreadcrumb` | Step-by-step navigation breadcrumb |
| `SessionCompletionModal` | Consent + completion confirmation dialog |

### Components Referenced but Awaiting Verification
- `PreOperativeInstructionsWidget` — 751-line component, documented as created
- `ImagingOrderWidget` — 290-line component, documented as created
- Payment widgets — may be present for display-only (payment collection handled by billing desk)

---

## 5. Personalized Counselor Dashboard

Each counselor sees a personalized view based on:
- **MyAssignedPatients** — only patients assigned to this counselor
- **CounselorStats** — personal queue metrics (consultations today, avg time, follow-ups)
- **PatientSearchBar** — searches across tenant patients with assignment filtering

> ⚠️ **Current Status**: Components exist with mock data. Full API integration for personalized stats pending.

---

## 6. Testing Guide

### Prerequisites
1. Backend running (`dotnet run` from `microservices/auth-service/AuthService`)
2. User with Counselor role logged in
3. At least one patient in queue

### Manual Test Flow — Core 7-Stage Journey
```
1. Login as counselor → confirm queue visible at /dashboard/counselor
2. Click "Call Next" → patient enters session
3. Stage 1 → verify demographics auto-populated
4. Stage 2 → enter visual acuity, select IOL type
5. Stage 3 → select treatment package
6. Stage 4 → initiate insurance pre-auth (if insured)
7. Stage 5 → direct to billing desk for payment
8. Stage 6 → get digital consent signature
9. Stage 7 → schedule surgery date, book follow-up
10. Mark session "Complete" → verify queue count updates
```

### API Test (curl)
```bash
# 1. Login
POST /api/auth/login  {"email":"counselor@test.com","password":"..."}

# 2. Get queue
GET /api/counseling/queue  -H "Authorization: Bearer {token}" -H "X-Tenant-ID: {tenantId}"

# 3. Start session
POST /api/counseling/sessions/{id}/start

# 4. Update session
PUT /api/counseling/sessions/{id}  {"stage":2,...}

# 5. Complete session
POST /api/counseling/sessions/{id}/complete
```

### Known Issues During Testing
| Issue | Severity | Workaround |
|-------|----------|------------|
| Stage resets on page refresh | Medium | Manual re-navigation to current stage |
| Print functionality logs to console only | Low | No workaround yet |
| Can advance stage without required fields | Medium | Validate manually |
| Personalized stats show mock data | Low | Use analytics tab for real data |

---

## 7. Current Status (March 2026)

| Area | Status | Notes |
|------|--------|-------|
| Backend API | ✅ Complete | All session/queue endpoints working |
| Queue dashboard | ✅ Complete | Functional with real data |
| Session management | ✅ Complete | Create, update, complete, cancel |
| 7-stage workflow UI | 🟡 Partial | Steps navigate but state not persisted server-side |
| Insurance integration | ✅ Complete | Pre-auth via `/api/insurance/pre-auths` |
| Payments view | 🟡 Display only | Collection handled by billing desk |
| Admissions | ✅ Complete | Bed reservation via `/api/admissions` |
| Consent forms | ✅ Complete | Digital signature via `/api/consents` |
| Analytics | 🟡 Partial | Some metrics use mock data |
| Stage persistence API | ❌ Missing | `PUT /api/counseling/sessions/{id}/advance-stage` not implemented |
| State persistence (localStorage) | ❌ Missing | Step state resets on refresh |
| Print/PDF export | ❌ Missing | Console.log only |
| End-to-end validation | 🟡 Partial | 7-step integration test passed but field validation not enforced |

---

## 8. Related Modules

| Module | Interface | Used By |
|--------|-----------|---------|
| **3.6 Insurance** | `/api/insurance/pre-auths` | Stage 5 — pre-auth initiation |
| **3.8 Admissions** | `/api/admissions` | Stage 7 — admission booking |
| **3.9 Consents** | `/api/consents` | Stage 6 — consent form |
| **3.10 Workflow** | `/api/workflow` | Cross-module orchestration |
| **Imaging** | `/api/imaging` | Stage 3 — pre-op scan orders |
| **OT Scheduling** | `/api/ot-schedules` | Stage 7 — surgery scheduling |
