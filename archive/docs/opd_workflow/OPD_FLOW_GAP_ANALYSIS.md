# OPD Flow - Complete Implementation Specification

## Eye Hospital Portal - Finalized OPD Workflow

**Document Version:** 2.0 (FINAL)  
**Date:** January 29, 2026  
**Status:** ✅ SPECIFICATIONS FINALIZED - Ready for Implementation

---

## 📊 EXECUTIVE SUMMARY

| Category | PRD Required | Implemented | Gap | Action |
|----------|-------------|-------------|-----|--------|
| **Workflow Enforcement** | Hard gates at each step | Soft/Optional | 🔴 CRITICAL | Implement gates |
| **Patient Directory** | Comprehensive hub | Basic list | 🟡 PARTIAL | Enhance with tabs |
| **Appointment Booking** | Required after registration | Full calendar ✅ | ✅ Complete | Add billing prompt |
| **Billing Before Check-In** | MANDATORY gate | Not enforced | 🔴 CRITICAL | New OPD Bill page |
| **Check-In Hard Gate** | 4 conditions required | Simple check-in | 🔴 CRITICAL | Implement validation |
| **Visit Entity** | Separate from appointment | Not implemented | 🔴 MISSING | Create entity |
| **Queue/Send-To System** | Role-based routing | Basic queue | 🟡 PARTIAL | Enhance routing |
| **Optometrist Workflow** | Dedicated workstation | Part of examination | 🟡 PARTIAL | New workstation |
| **Doctor Workflow** | Full clinical flow | Doctor's Desk ✅ | ✅ Complete | - |
| **Prescription** | Medical + Optical Rx | Medications only | 🟡 PARTIAL | Add Optical Rx |
| **Patient Portal** | Self-service | Not implemented | 🔴 MISSING | New module |
| **Walk-In Wizard** | Quick registration | Not implemented | 🔴 MISSING | New page |

---

## 🎯 CONFIRMED DECISIONS

### Dashboard Quick Actions
| Decision | Specification |
|----------|---------------|
| **[+ New Patient]** | Slide-out panel with quick fields, expandable for full form |
| **[📅 Book Appointment]** | Modal with patient search embedded |
| **Post-save prompts** | "Book Appointment Now?" / "Generate Bill Now?" |

### Multi-Branch Handling
| Decision | Specification |
|----------|---------------|
| **Default branch** | Logged-in user's branch |
| **Branch selection** | Dropdown to switch branch context |
| **Data visibility** | Can view/book for any branch |

### Check-In Locations (3 Places)
| Location | Behavior |
|----------|----------|
| Front Desk | Primary check-in with full validation |
| Queue Management | Status tracking + check-in button |
| Appointment Page | Inline check-in button with status indicators |
| **Validation** | Same gate at all 3 places: ✓✓✗✗ inline status |

---

## 🚨 CRITICAL GAPS (Must Fix)

### 1. **NON-NEGOTIABLE WORKFLOW ENFORCEMENT**

**PRD Requirement:**
```
Patient MUST be Registered
 → Appointment MUST be Booked
 → Bill MUST be Generated & Paid
 → Check-In MUST happen
 → Visit is Created
 → Clinical Workflow Allowed

❌ No step can be skipped
❌ No UI override
❌ No silent auto-creation
```

**Current Implementation:**
- ❌ No hard gates between steps
- ❌ Can access clinical modules without completing prior steps
- ❌ No payment verification before check-in
- ❌ Workflow can be bypassed via direct URL access

**Required Fix:**
- Implement middleware/guard at each step
- Create `WorkflowValidation` service
- Block UI navigation until prerequisites met
- Server-side validation for all clinical APIs

---

### 2. **BILLING BEFORE CHECK-IN (MISSING)**

**PRD Requirement:**
```
Preconditions for Check-In:
✅ Patient Registered
✅ Appointment Booked
✅ Bill Generated
✅ Payment Completed (or credit approved)
```

**Current Implementation:**
- `/dashboard/finance` - Has invoices list
- `/dashboard/billing/coding` - ICD/CPT coding only
- ❌ **No OPD Bill Generation screen**
- ❌ **No payment collection before check-in**
- ❌ **No payment validation gate**

**Required New Components:**

| Component | Path | Purpose |
|-----------|------|---------|
| OPD Bill Create | `/dashboard/billing/opd-bill/new` | Generate consultation bill |
| Bill Payment | `/dashboard/billing/payment` | Collect payment |
| Bill Validation | Service/Hook | Validate payment before check-in |

---

### 3. **VISIT ENTITY (NOT IMPLEMENTED)**

**PRD Requirement:**
```
Visit is automatically created at Check-In:
- Visit ID (unique)
- Patient ID
- Appointment ID
- Branch ID
- Consultant ID
- Visit Type (New/Review/Post-OP/Follow-Up)
- Visit Category (Paid/Free/Discounted/POP)
- Visit Status (Created → Checked-In → In Progress → Completed)
```

**Current Implementation:**
- No `Visit` entity exists
- Clinical data tied directly to `Appointment` or `Patient`
- No visit status tracking

**Required:**
- Create `Visit` database table
- Visit API endpoints
- Visit creation trigger on check-in
- Visit status management

---

### 4. **CHECK-IN HARD GATE (MISSING)**

**PRD Requirement:**
```
Check-In Fields:
- Check-In ID
- Patient ID
- Appointment ID
- Bill ID ← CRITICAL
- Branch ID
- Check-In Time
- Checked-In By
```

**Current Implementation:**
- `/dashboard/queue` has `handleCheckIn()` function
- ❌ No Bill ID validation
- ❌ No payment status check
- ❌ Just marks status as "checked-in"

**Required Fix:**
```typescript
// Pseudo-code for hard gate
async function checkIn(appointmentId: string) {
  // 1. Verify patient exists
  const patient = await patientApi.get(appointment.patientId);
  if (!patient) throw new Error("Patient not registered");
  
  // 2. Verify appointment exists
  const appointment = await appointmentApi.get(appointmentId);
  if (!appointment) throw new Error("Appointment not booked");
  
  // 3. Verify bill exists and paid
  const bill = await billApi.getByAppointment(appointmentId);
  if (!bill) throw new Error("Bill not generated");
  if (bill.status !== 'paid' && bill.status !== 'credit-approved') {
    throw new Error("Payment pending");
  }
  
  // 4. Create Visit
  const visit = await visitApi.create({
    patientId: patient.id,
    appointmentId: appointment.id,
    billId: bill.id,
    status: 'checked-in'
  });
  
  // 5. Create Check-In record
  return await checkInApi.create({
    visitId: visit.id,
    appointmentId,
    billId: bill.id,
    checkedInAt: new Date(),
    checkedInBy: currentUser.id
  });
}
```

---

## 🟡 PARTIAL IMPLEMENTATIONS (Need Enhancement)

### 5. **QUEUE & SEND-TO SYSTEM**

**PRD Requirement:**
```
Send To Options:
- Reception
- Optometrist
- Doctor
- Nurse
- Counselor
- Technician
- Ophthalmology Technician
- Radiologist
- Optician
- Pharmacist

Features:
- Real-time load visible
- Availability indicator
- Re-assignment allowed (logged)
```

**Current Implementation:**
- `/dashboard/queue` - Basic patient queue ✅
- Department-wise view ✅
- Status tracking ✅
- ❌ No role-based "Send To" routing
- ❌ No staff availability indicator
- ❌ No re-assignment logging

**Required Enhancements:**
- Add `SendToModal` component
- Staff availability status
- Role-based queue filtering
- Audit log for re-assignments

---

### 6. **OPTOMETRIST WORKSTATION**

**PRD Requirement:**
```
Optometrist Fields:
- Chief Complaint
- Visual Acuity (OD / OS)
- Refraction
- IOP
- Preliminary Diagnosis
- Dilation Required (Yes/No)
- Notes
```

**Current Implementation:**
- `/dashboard/examination/visual-acuity` ✅
- `/dashboard/examination/refraction` ✅
- `/dashboard/examination/tonometry` (IOP) ✅
- `/dashboard/examination/auto-refraction` ✅
- ❌ **No unified Optometrist Dashboard**
- ❌ **No Chief Complaint field in optometry**
- ❌ **No Preliminary Diagnosis**
- ❌ **No Dilation Required flag**

**Required:**
- Create `/dashboard/optometrist` workstation
- Combine all examination modules
- Add Chief Complaint field
- Add Dilation Required checkbox
- Add Preliminary Diagnosis (dropdown/text)

---

### 7. **PRESCRIPTION - OPTICAL RX**

**PRD Requirement:**
```
Prescription Fields:
- Drugs (list with dosage, frequency, etc.) ✅
- Optical Prescription:
  - Sphere (OD / OS)
  - Cylinder
  - Axis
  - Add
  - PD (Pupillary Distance)
```

**Current Implementation:**
- `/dashboard/prescriptions` - Medication prescriptions ✅
- Drug interaction checking ✅
- ❌ **Optical Rx not in prescription**
- Optical data exists in:
  - `/dashboard/examination/refraction`
  - `/dashboard/examination/spectacle-dispensing`

**Required Enhancement:**
- Add Optical Rx tab to Prescription page
- Pull data from refraction examination
- Combined print: Medication + Optical Rx

---

### 8. **PATIENT REGISTRATION FIELDS**

**PRD Requirement vs Current:**

| Field | PRD Required | Implemented | Status |
|-------|--------------|-------------|--------|
| Patient ID (auto) | ✅ | ✅ | ✅ |
| First Name | ✅ | ✅ | ✅ |
| Mobile Number | ✅ | ✅ | ✅ |
| Middle Name | Optional | ❌ | Add |
| Last Name | ✅ | ✅ | ✅ |
| Gender | ✅ | ✅ | ✅ |
| DOB | ✅ | ✅ | ✅ |
| Age (Years) | ✅ | Auto-calc | ✅ |
| Age (Months) | ✅ | ❌ | Add |
| Secondary Contact | ✅ | ❌ | Add |
| WhatsApp Number | ✅ | ❌ | Add |
| Relation | ✅ | Emergency contact | ✅ |
| Occupation | ✅ | ❌ | Add |
| Employee ID | ✅ | ❌ | Add |
| Patient Type | ✅ | ❌ | Add |
| Address Line 1 | ✅ | ✅ | ✅ |
| Address Line 2 | ✅ | ❌ | Add |
| PIN Code | ✅ | ✅ (Postal) | ✅ |
| Area | ✅ | ❌ | Add |
| City | ✅ | ✅ | ✅ |
| State | ✅ | ✅ | ✅ |
| Country | ✅ | ❌ | Add |
| MRN | ✅ | ✅ | ✅ |
| Health ID | ✅ | ❌ | Add |
| Primary Language | ✅ | ❌ | Add |
| Secondary Language | ✅ | ❌ | Add |
| Referral Source | ✅ | ❌ | Add |
| Referring Doctor | ✅ | ❌ | Add |
| Branch ID | ✅ | Multi-tenant | ✅ |

---

## ✅ ALREADY COMPLETE (Matches or Exceeds PRD)

### 1. **Appointment Booking** ✅
- Calendar view with drag-drop
- List view with filters
- Real-time conflict detection
- Doctor availability management
- Specialty-specific slots
- Eye-specific appointment booking
- Bulk actions (confirm, cancel, send reminders)

### 2. **Doctor's Desk / Clinical Workflow** ✅
- Patient queue sorted by urgency
- Optometry summary display
- Red flag alerts (high IOP, sudden vision loss)
- Full examination form
- Treatment plan with routing
- Permission-based access

### 3. **Queue Management** ✅
- Real-time patient queue
- Department-wise view
- Status badges
- Priority handling (Emergency/Urgent/Routine)
- Walk-in patient support
- Average wait time calculation

### 4. **ICD/CPT Coding** ✅
- `/dashboard/billing/coding`
- Comprehensive ICD-10 codes for ophthalmology
- CPT codes for procedures
- Encounter coding workflow

### 5. **Examination Modules** ✅
All optometry examinations implemented:
- Visual Acuity
- Refraction
- Auto-Refraction
- Tonometry (IOP)
- Keratometry
- Pachymetry
- Color Vision
- Contrast Sensitivity
- Visual Field
- Contact Lens Fitting
- Spectacle Dispensing

---

## 📋 COMPLETE OPD FLOW (MERGED)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    COMPLETE EYE HOSPITAL OPD WORKFLOW                            │
│                         (PRD + Implementation Merged)                            │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ① PATIENT REGISTRATION (STEP 1) ─────────────────────────────────────────────  │
│  └─→ /dashboard/patients/new                                                    │
│      📋 Creates Patient entity ONLY                                             │
│      ❌ No appointment auto-created                                             │
│      ❌ No billing allowed yet                                                  │
│      ❌ No check-in possible                                                    │
│      ✅ Prompt: "Please book an appointment to proceed"                         │
│                                                                                  │
│  ② APPOINTMENT BOOKING (STEP 2 - MANDATORY) ──────────────────────────────────  │
│  └─→ /dashboard/appointments                                                    │
│      📋 Precondition: Patient MUST exist                                        │
│      📋 Fields: Date, Time, Consultant, Department, Visit Type                  │
│      📋 Visit Types: New / Review / Post-OP / Follow-Up                         │
│      📋 Visit Category: Paid / Free / Discounted / POP                          │
│      ❌ Cannot proceed to billing without appointment                            │
│                                                                                  │
│  ③ BILLING & PAYMENT (STEP 3 - MANDATORY) ────────────────────────────────────  │
│  └─→ /dashboard/billing/opd-bill/new [NEW PAGE REQUIRED]                        │
│      📋 Precondition: Patient + Appointment MUST exist                          │
│      📋 Generate OPD Consultation Bill                                          │
│      📋 Add services: Consultation, Investigations, etc.                        │
│      📋 Apply discounts (password-protected)                                    │
│      📋 Collect payment (Cash/Card/UPI/Insurance)                               │
│      📋 Multiple payments allowed                                               │
│      📋 Partial payment only if credit enabled                                  │
│      ❌ Check-In blocked until payment complete                                 │
│      ✅ Bill finalized = Immutable (audit trail)                                │
│                                                                                  │
│  ④ CHECK-IN (STEP 4 - HARD GATE) ─────────────────────────────────────────────  │
│  └─→ /dashboard/frontdesk [ENHANCE EXISTING]                                    │
│      📋 HARD GATE VALIDATION:                                                   │
│         ✓ Patient Registered                                                    │
│         ✓ Appointment Booked                                                    │
│         ✓ Bill Generated                                                        │
│         ✓ Payment Complete (or credit approved)                                 │
│      ❌ ANY failure = Check-In BLOCKED                                          │
│      ✅ On success: Visit entity auto-created                                   │
│                                                                                  │
│  ⑤ VISIT CREATION (AUTOMATIC) ────────────────────────────────────────────────  │
│  └─→ System auto-creates at Check-In                                            │
│      📋 Visit ID, Patient ID, Appointment ID, Bill ID                           │
│      📋 Status: Created → Checked-In                                            │
│      📋 Visit is the CLINICAL ANCHOR                                            │
│                                                                                  │
│  ⑥ QUEUE & SEND-TO ───────────────────────────────────────────────────────────  │
│  └─→ /dashboard/queue [ENHANCE EXISTING]                                        │
│      📋 Patient enters queue automatically after check-in                       │
│      📋 Send To options:                                                        │
│         • Reception    • Optometrist    • Doctor                                │
│         • Nurse        • Counselor      • Technician                            │
│         • Radiologist  • Optician       • Pharmacist                            │
│      📋 Real-time load & availability visible                                   │
│      📋 Re-assignment logged                                                    │
│                                                                                  │
│  ⑦ OPTOMETRIST WORKSTATION ───────────────────────────────────────────────────  │
│  └─→ /dashboard/optometrist [NEW PAGE REQUIRED]                                 │
│      📋 Patient queue (for optometrist role)                                    │
│      📋 Unified view:                                                           │
│         • Chief Complaint                                                       │
│         • Visual Acuity (OD/OS)                                                 │
│         • Refraction                                                            │
│         • IOP (Tonometry)                                                       │
│         • Preliminary Diagnosis                                                 │
│         • Dilation Required (Yes/No)                                            │
│         • Notes                                                                 │
│      📋 Send to Doctor after completion                                         │
│                                                                                  │
│  ⑧ DOCTOR'S EXAMINATION ──────────────────────────────────────────────────────  │
│  └─→ /dashboard/doctors-desk [EXISTING - WORKING]                               │
│      📋 Patient queue with optometry summary (read-only)                        │
│      📋 Red flag alerts displayed                                               │
│      📋 Doctor enters:                                                          │
│         • Clinical Findings                                                     │
│         • Diagnosis (ICD-10)                                                    │
│         • Investigation Advice                                                  │
│         • Surgery Advice                                                        │
│         • Follow-Up Interval                                                    │
│         • Clinical Notes                                                        │
│                                                                                  │
│  ⑨ INVESTIGATIONS (IF ORDERED) ───────────────────────────────────────────────  │
│  └─→ /dashboard/imaging/* or /dashboard/diagnostic/*                            │
│      📋 For each investigation:                                                 │
│         • Investigation Name & Type                                             │
│         • Ordered By (Doctor)                                                   │
│         • Status (Ordered/In Progress/Completed)                                │
│         • Result & Result Date                                                  │
│                                                                                  │
│  ⑩ PRESCRIPTION ──────────────────────────────────────────────────────────────  │
│  └─→ /dashboard/prescriptions [ENHANCE EXISTING]                                │
│      📋 Medication Rx:                                                          │
│         • Drug Name, Strength, Dosage                                           │
│         • Frequency, Duration, Instructions                                     │
│      📋 Optical Rx [ADD]:                                                       │
│         • Sphere (OD/OS)                                                        │
│         • Cylinder, Axis                                                        │
│         • Add (Near)                                                            │
│         • PD (Pupillary Distance)                                               │
│      📋 Print / WhatsApp / Email                                                │
│                                                                                  │
│  ⑪ ROUTING BASED ON TREATMENT PLAN ───────────────────────────────────────────  │
│      📋 Based on doctor's advice:                                               │
│         → Pharmacy (/dashboard/pharmacy)                                        │
│         → Spectacles (/dashboard/examination/spectacle-dispensing)              │
│         → Contact Lens (/dashboard/examination/contact-lens)                    │
│         → Specialty Clinic (/dashboard/specialty-clinics/*)                     │
│         → Surgery Counselor (/dashboard/counselor)                              │
│         → Investigations (/dashboard/diagnostic/*)                              │
│                                                                                  │
│  ⑫ VISIT COMPLETION ──────────────────────────────────────────────────────────  │
│  └─→ System marks visit as complete                                             │
│      📋 All clinical steps completed OR explicitly skipped (logged)             │
│      📋 Visit End Fields:                                                       │
│         • Completion Time                                                       │
│         • Completed By                                                          │
│         • Outcome (Treated / Referred / Surgery Planned)                        │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔧 IMPLEMENTATION PRIORITY

### Phase 1: Critical Gates (Week 1-2)
| Priority | Task | Effort |
|----------|------|--------|
| P0 | Create `/dashboard/billing/opd-bill` page | 3 days |
| P0 | Implement Bill-before-Check-In gate | 2 days |
| P0 | Create Visit entity & API | 2 days |
| P0 | Implement Check-In hard gate validation | 2 days |
| P0 | Add workflow enforcement middleware | 2 days |

### Phase 2: Enhanced Workflow (Week 3-4)
| Priority | Task | Effort |
|----------|------|--------|
| P1 | Create `/dashboard/optometrist` workstation | 3 days |
| P1 | Enhance Send-To routing system | 2 days |
| P1 | Add Optical Rx to Prescription | 2 days |
| P1 | Enhance Patient Registration fields | 1 day |
| P1 | Staff availability indicator | 1 day |

### Phase 3: Polish & Audit (Week 5)
| Priority | Task | Effort |
|----------|------|--------|
| P2 | Audit logging for all workflow steps | 2 days |
| P2 | Password-protected discount override | 1 day |
| P2 | Bill finalization & immutability | 1 day |
| P2 | Visit completion workflow | 1 day |

---

## 📊 STATE DIAGRAMS

### Patient State
```
[Registered] → (only state, no lifecycle)
```

### Appointment State
```
[Booked] → [Arrived] → [Completed]
              ↓            ↓
         [Cancelled]  [No-Show]
```

### Billing State
```
[Draft] → [Generated] → [Paid]
              ↓
         [Credit Approved]
```

### Visit State
```
[Created] → [Checked-In] → [In Progress] → [Completed]
```

---

## 🔐 SECURITY & AUDIT REQUIREMENTS

### Password-Protected Actions
- [ ] Discount override (> 10%)
- [ ] Refund processing
- [ ] Appointment cancellation (same day)
- [ ] Bill modification after finalization

### Audit Trail Required
- [ ] Every workflow state change
- [ ] Payment transactions
- [ ] Clinical data modifications
- [ ] Queue re-assignments
- [ ] Before/After values logged

### Role-Based Access
- [ ] Reception: Registration, Appointment, Billing
- [ ] Optometrist: Optometry Workstation only
- [ ] Doctor: Doctor's Desk, Prescriptions
- [ ] Counselor: Surgery counseling
- [ ] Pharmacist: Pharmacy module
- [ ] Admin: All modules + audit logs

---

## 📈 PERFORMANCE REQUIREMENTS (PRD)

| Metric | Requirement | Current |
|--------|-------------|---------|
| OPD Load | 50-400+ patients/day | ✅ Scalable |
| Concurrent Users | 50+ | ✅ Supported |
| Response Time | < 2 seconds | ✅ ~1-2s |
| Branch Isolation | Required | ✅ Multi-tenant |
| Horizontal Scaling | Required | ✅ Azure ready |

---

## ✅ FINAL CHECKLIST

### Hard Gates
- [ ] Patient → Appointment (enforced)
- [ ] Appointment → Bill (enforced)
- [ ] Bill Paid → Check-In (enforced)
- [ ] Check-In → Visit (auto-created)
- [ ] Visit → Clinical Workflow (enforced)

### Entities
- [ ] Patient (existing ✅)
- [ ] Appointment (existing ✅)
- [ ] Bill (partial - needs OPD bill)
- [ ] Payment (needs implementation)
- [ ] Check-In (needs implementation)
- [ ] Visit (needs implementation)
- [ ] Queue (existing ✅)

### Screens
- [ ] Patient Registration ✅
- [ ] Appointment Booking ✅
- [ ] OPD Bill Generation (NEW REQUIRED)
- [ ] Payment Collection (NEW REQUIRED)
- [ ] Check-In with Validation (ENHANCE)
- [ ] Optometrist Workstation (NEW REQUIRED)
- [ ] Doctor's Desk ✅
- [ ] Prescription (ENHANCE - add Optical Rx)

---

**Document Prepared By:** AI Coding Agent  
**Review Required:** Yes  
**Implementation Ready:** After review
