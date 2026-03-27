# Sequential Implementation Plan - OPD Flow Complete
## Hospital Portal - Day-by-Day Execution Guide

**Document Version:** 1.0  
**Date:** January 30, 2026  
**Timeline:** Feb 3, 2026 - May 29, 2026 (17 weeks)  
**Current Status:** Phase 0 Complete (60%)  
**Target:** 100% OPD Flow Implementation

---

## 📅 COMPLETE TIMELINE OVERVIEW

| Phase | Duration | Start Date | End Date | Days | Focus |
|-------|----------|------------|----------|------|-------|
| **Phase 1** | 2.5 weeks | Feb 3, 2026 | Feb 19, 2026 | 12 | Critical Gates |
| **Phase 2** | 5 weeks | Feb 20, 2026 | Mar 28, 2026 | 24 | Enhanced Workflow |
| **Phase 3** | 2.5 weeks | Mar 31, 2026 | Apr 15, 2026 | 12 | Communication |
| **Phase 4** | 3.5 weeks | Apr 16, 2026 | May 12, 2026 | 17 | Advanced Features |
| **Phase 5** | 2.5 weeks | May 13, 2026 | May 29, 2026 | 12 | Production Polish |
| **TOTAL** | **16 weeks** | **Feb 3** | **May 29** | **77 days** | **Complete OPD** |

**Go-Live:** June 2, 2026 (Monday)

---

## 🎯 PHASE 1: CRITICAL WORKFLOW GATES (Feb 3-19, 2026)

**Goal:** Complete end-to-end OPD flow with hard validation gates and bill locking

### WEEK 1 (Feb 3-9, 2026)

#### **Day 1 - Monday, Feb 3**
**Focus:** Check-In Hard Gate UI - Part 1

**Backend Tasks:**
- [ ] Review Visit API endpoints (already exists)
- [ ] Review Check-In validation logic
- [ ] Test 4-condition validation (Patient, Appointment, Bill, Payment)

**Frontend Tasks:**
- [ ] Create `CheckInValidationWidget.tsx` component
- [ ] Build 4-condition status display:
  ```
  ✓ Patient Registered
  ✓ Appointment Booked
  ✗ Bill Generated → [Generate Bill] button
  ✗ Payment Completed → Blocked
  ```
- [ ] Add visual indicators (green check, red X, yellow warning)
- [ ] Test on `/dashboard/frontdesk` page

**Deliverable:** Check-in status widget showing real-time validation ✅

---

#### **Day 2 - Tuesday, Feb 4**
**Focus:** Check-In Hard Gate UI - Part 2

**Frontend Tasks:**
- [ ] Create `EmergencyOverrideModal.tsx`
- [ ] Add password/PIN verification for override
- [ ] Implement authorization check (Admin, Senior Front Office roles)
- [ ] Add reason dropdown for emergency check-in
- [ ] Test override workflow
- [ ] Block "Check-In" button when conditions not met
- [ ] Show override option with authorization

**Database Tasks:**
- [ ] Add `emergency_override` column to `visits` table
- [ ] Add `override_reason` column
- [ ] Add `override_authorized_by` column

**Deliverable:** Complete check-in hard gate with emergency override ✅

---

#### **Day 3 - Wednesday, Feb 5**
**Focus:** Workflow Enforcement Middleware

**Frontend Tasks:**
- [ ] Create `useWorkflowEnforcement` hook
- [ ] Add route guard to clinical pages:
  - `/dashboard/examination/*`
  - `/dashboard/prescriptions`
  - `/dashboard/pharmacy`
  - `/dashboard/optical`
- [ ] Show "Check-in Required" message when accessing without check-in
- [ ] Redirect to check-in page with patient context
- [ ] Test enforcement across all clinical modules

**Middleware Logic:**
```typescript
// Check if patient has active checked-in visit
if (!hasCheckedInVisit) {
  return <CheckInRequiredMessage />;
}
```

**Deliverable:** Workflow enforcement preventing clinical access without check-in ✅

---

#### **Day 4 - Thursday, Feb 6**
**Focus:** OPD Bill Items Table & API

**Database Tasks:**
- [ ] Create `opd_bill_items` table:
  ```sql
  CREATE TABLE opd_bill_items (
    id UUID PRIMARY KEY,
    opd_bill_id UUID REFERENCES opd_bills(id),
    item_code VARCHAR(50),
    item_name VARCHAR(200) NOT NULL,
    item_category VARCHAR(100),
    quantity INT DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    discount_type VARCHAR(20),
    discount_value DECIMAL(10,2),
    discount_reason_code VARCHAR(50),
    net_amount DECIMAL(10,2) NOT NULL,
    tenant_id UUID NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    created_by_user_id UUID
  );
  ```
- [ ] Run migration on database
- [ ] Add indexes for opd_bill_id, tenant_id

**Backend Tasks:**
- [ ] Create `OpdBillItem.cs` model
- [ ] Add EF Core mapping in `AppDbContext`
- [ ] Add bill items endpoints to `OpdBillsController`:
  - `POST /api/opdbills/{billId}/items` - Add item
  - `PUT /api/opdbills/{billId}/items/{itemId}` - Update item
  - `DELETE /api/opdbills/{billId}/items/{itemId}` - Remove item
  - `GET /api/opdbills/{billId}/items` - Get all items

**Deliverable:** Database table + API support for line items ✅

---

#### **Day 5 - Friday, Feb 7**
**Focus:** Bill Locking Mechanism

**Backend Tasks:**
- [ ] Add `is_finalized` column to `opd_bills` table
- [ ] Add `finalized_at` timestamp
- [ ] Add `finalized_by_user_id` column
- [ ] Create `POST /api/opdbills/{billId}/finalize` endpoint
- [ ] Add validation: Cannot edit if `is_finalized = true`
- [ ] Update existing endpoints to check finalized status
- [ ] Throw error if trying to edit finalized bill

**Business Logic:**
```csharp
// OpdBillService.cs
public async Task FinalizeBill(Guid billId, Guid userId) {
    var bill = await GetBill(billId);
    if (bill.IsFinalized) 
        throw new InvalidOperationException("Bill already finalized");
    
    bill.IsFinalized = true;
    bill.FinalizedAt = DateTime.UtcNow;
    bill.FinalizedByUserId = userId;
    await _context.SaveChangesAsync();
}
```

**Deliverable:** Bill locking implemented (immutable after "Save Final Bill") ✅

---

#### **Day 6-7 - Weekend (Feb 8-9)**
**Tasks:**
- [ ] Deploy Phase 1 Week 1 changes to staging
- [ ] Test check-in hard gate end-to-end
- [ ] Test bill items creation
- [ ] Test bill finalization
- [ ] Fix bugs identified
- [ ] Code review and documentation

---

### WEEK 2 (Feb 10-16, 2026)

#### **Day 8 - Monday, Feb 10**
**Focus:** Token Display & SMS Integration Prep

**Backend Tasks:**
- [ ] Verify token generation in Visit entity (already exists: HYD-001)
- [ ] Create token display endpoint `GET /api/visits/{visitId}/token`
- [ ] Add SMS service interface `INotificationService`
- [ ] Setup Twilio account (test credentials)

**Frontend Tasks:**
- [ ] Create `TokenDisplayCard.tsx` component:
  ```tsx
  <div className="token-display">
    <div className="token-number">HYD-001</div>
    <div className="branch-name">Hyderabad Branch</div>
    <div className="patient-name">John Doe</div>
    <button>Print Token</button>
    <button>Send SMS</button>
  </div>
  ```
- [ ] Add token display to check-in success page
- [ ] Add thermal print functionality (browser print API)
- [ ] Test token generation after check-in

**Deliverable:** Token display on screen + optional print ✅

---

#### **Day 9 - Tuesday, Feb 11**
**Focus:** Complete Bill Integration with Line Items

**Frontend Tasks:**
- [ ] Enhance `/dashboard/billing/opd/page.tsx`
- [ ] Add line items table to billing form:
  ```
  | Item Code | Item Name | Qty | Unit Price | Discount | Net Amount | Actions |
  |-----------|-----------|-----|------------|----------|------------|---------|
  | CONS-001  | Consultation | 1 | ₹500 | ₹0 | ₹500 | [Edit] [Delete] |
  ```
- [ ] Add "Add Item" button with modal
- [ ] Item fields: Code, Name, Category, Quantity, Unit Price, Discount
- [ ] Calculate net amount automatically
- [ ] Add "Finalize Bill" button (calls finalize API)
- [ ] Show finalized status badge (green "Finalized" badge)
- [ ] Disable edit when finalized

**Deliverable:** Itemized billing page with finalization ✅

---

#### **Day 10 - Wednesday, Feb 12**
**Focus:** Auto-Billing Prompt - Part 1

**Frontend Tasks:**
- [ ] Create `AutoBillingPromptModal.tsx`
- [ ] Add trigger after appointment booking success
- [ ] Modal fields (pre-filled from appointment):
  - Patient Name (read-only)
  - Appointment Date/Time (read-only)
  - Visit Type (read-only)
  - Consultation Fee (auto-calculated based on visit type)
  - Add additional items button
- [ ] "Proceed to Full Billing" button → Opens full billing page
- [ ] "Skip for Now" button → Closes modal
- [ ] "Don't Show Again" checkbox (store preference in localStorage)

**Deliverable:** Auto-billing modal integrated ✅

---

#### **Day 11 - Thursday, Feb 13**
**Focus:** Appointment Slot Enhancements & Patient Field Verification

**Backend Tasks (Appointments):**
- [ ] Add columns to `appointments` table:
  - `slot_duration` INT (minutes)
  - `freeze_consultant` BOOLEAN
  - `slot_status` VARCHAR(50) (Available/Reserved/Booked)
  - `slot_lock_timestamp` TIMESTAMP
  - `arrived_status` BOOLEAN
- [ ] Update `Appointment.cs` model
- [ ] Update DTOs
- [ ] Run migration

**Backend Tasks (Patient Fields):**
- [ ] Check if these columns exist in `patient` table:
  - `relation` (for secondary contact)
  - `area` (in address)
  - `secondary_language`
- [ ] Add missing columns if needed
- [ ] Update `Patient.cs` model
- [ ] Update `PatientDto`

**Deliverable:** Appointment slots enhanced + Patient fields verified ✅

---

#### **Day 12 - Friday, Feb 14**
**Focus:** End-to-End Testing & Bug Fixes

**Testing Scenarios:**
1. **Complete OPD Flow:**
   - Patient Registration → Success ✅
   - Appointment Booking → Auto-billing prompt appears ✅
   - Generate Bill with line items → Success ✅
   - Finalize Bill → Becomes immutable ✅
   - Check-In → 4-condition validation passes ✅
   - Visit Created → Token generated (HYD-001) ✅
   - Clinical access → Allowed after check-in ✅

2. **Negative Scenarios:**
   - Try check-in without bill → Blocked ✅
   - Try edit finalized bill → Error ✅
   - Access clinical page without check-in → Blocked ✅
   - Emergency override → Requires authorization ✅

**Tasks:**
- [ ] Fix identified bugs
- [ ] Performance testing (check query times)
- [ ] Code review
- [ ] Update documentation
- [ ] Prepare Phase 1 demo

**Deliverable:** Phase 1 Complete - Core OPD flow with hard gates ready ✅

---

## 🎯 PHASE 2: ENHANCED WORKFLOW (Feb 20 - Mar 28, 2026)

**Goal:** Streamlined workflows, patient directory hub, investigations module

### WEEK 3 (Feb 20-26, 2026)

#### **Day 13 - Thursday, Feb 20**
**Focus:** Walk-In Wizard - Part 1 (Design & Structure)

**Frontend Tasks:**
- [ ] Create `/dashboard/walkin/page.tsx`
- [ ] Design single-page wizard with 3 sections (vertical layout):
  ```
  ┌─────────────────────────────────────────┐
  │  Walk-In Patient Registration Wizard    │
  ├─────────────────────────────────────────┤
  │  Section 1: Quick Patient Registration  │
  │  [Essential fields only]                │
  ├─────────────────────────────────────────┤
  │  Section 2: Appointment Booking         │
  │  [Doctor, Date, Time, Visit Type]       │
  ├─────────────────────────────────────────┤
  │  Section 3: Billing & Payment           │
  │  [Consultation fee, Payment]            │
  ├─────────────────────────────────────────┤
  │  [Save & Check-In] [Cancel]             │
  └─────────────────────────────────────────┘
  ```
- [ ] Setup form state management (single form for all 3 sections)

**Deliverable:** Walk-in wizard structure ✅

---

#### **Day 14 - Friday, Feb 21**
**Focus:** Walk-In Wizard - Part 2 (Implementation)

**Frontend Tasks:**
- [ ] Section 1: Patient Registration (essential fields only)
  - Name, Mobile, Gender, DOB, Age
- [ ] Section 2: Appointment
  - Doctor dropdown, Date picker, Time slot
  - Visit Type (auto-set to "Walk-in")
- [ ] Section 3: Billing
  - Auto-calculate consultation fee
  - Payment mode selection
  - Amount paid input
- [ ] "Save & Check-In" button → Calls 3 APIs sequentially:
  1. Create Patient
  2. Create Appointment
  3. Create Bill + Payment
  4. Check-In
  5. Create Visit
- [ ] Success → Show token + "Patient checked in successfully"

**Deliverable:** Functional walk-in wizard (single-page registration) ✅

---

#### **Day 15 - Monday, Feb 24**
**Focus:** Walk-In Wizard - Part 3 (Testing & Polish)

**Tasks:**
- [ ] Error handling (if any API fails, rollback)
- [ ] Form validation
- [ ] Loading states
- [ ] Success message with token display
- [ ] Print token option
- [ ] Send SMS option
- [ ] Edge case testing (duplicate mobile, invalid data)

**Deliverable:** Walk-in wizard complete with error handling ✅

---

#### **Day 16 - Tuesday, Feb 25**
**Focus:** Optometrist Workstation - Part 1 (Backend)

**Database Tasks:**
- [ ] Create `optometry_examinations` table:
  ```sql
  CREATE TABLE optometry_examinations (
    id UUID PRIMARY KEY,
    visit_id UUID REFERENCES visits(id),
    patient_id UUID REFERENCES patient(id),
    examination_date TIMESTAMP,
    chief_complaint TEXT,
    -- Visual Acuity
    va_distance_od VARCHAR(20),
    va_distance_os VARCHAR(20),
    va_near_od VARCHAR(20),
    va_near_os VARCHAR(20),
    -- Auto-Refraction
    auto_ref_sphere_od DECIMAL(5,2),
    auto_ref_cylinder_od DECIMAL(5,2),
    auto_ref_axis_od INT,
    auto_ref_sphere_os DECIMAL(5,2),
    auto_ref_cylinder_os DECIMAL(5,2),
    auto_ref_axis_os INT,
    -- Subjective Refraction
    subjective_sphere_od DECIMAL(5,2),
    subjective_cylinder_od DECIMAL(5,2),
    subjective_axis_od INT,
    subjective_sphere_os DECIMAL(5,2),
    subjective_cylinder_os DECIMAL(5,2),
    subjective_axis_os INT,
    -- IOP
    iop_od INT,
    iop_os INT,
    -- Keratometry
    k1_od DECIMAL(5,2),
    k2_od DECIMAL(5,2),
    k1_os DECIMAL(5,2),
    k2_os DECIMAL(5,2),
    preliminary_diagnosis TEXT,
    dilation_required BOOLEAN,
    notes TEXT,
    examined_by_user_id UUID,
    tenant_id UUID,
    created_at TIMESTAMP
  );
  ```
- [ ] Run migration

**Backend Tasks:**
- [ ] Create `OptometryExamination.cs` model
- [ ] Create `OptometryExaminationsController` with CRUD endpoints
- [ ] Create `OptometryExaminationService`

**Deliverable:** Optometry backend ready ✅

---

#### **Day 17 - Wednesday, Feb 26**
**Focus:** Optometrist Workstation - Part 2 (Frontend Form)

**Frontend Tasks:**
- [ ] Create `/dashboard/optometrist/page.tsx`
- [ ] Create `OptometryExaminationForm.tsx` component
- [ ] Form sections:
  1. Chief Complaint (textarea)
  2. Visual Acuity (4 fields: OD Distance, OS Distance, OD Near, OS Near)
  3. Auto-Refraction (6 fields: Sphere, Cylinder, Axis for OD/OS)
  4. Subjective Refraction (6 fields)
  5. IOP (2 fields: OD, OS) - Highlight if >21 mmHg
  6. Keratometry (4 fields: K1/K2 for OD/OS)
  7. Preliminary Diagnosis (textarea with suggestions)
  8. Dilation Required (Yes/No radio)
  9. Notes (textarea)
- [ ] "Send to Doctor" button
- [ ] Save draft functionality

**Deliverable:** Optometry examination form ✅

---

### WEEK 4 (Feb 27 - Mar 5, 2026)

#### **Day 18 - Thursday, Feb 27**
**Focus:** Optometrist Workstation - Part 3 (Queue Integration)

**Frontend Tasks:**
- [ ] Add patient queue to `/dashboard/optometrist`
- [ ] Filter queue: Only patients assigned to "Optometrist" role
- [ ] Show patient card with:
  - Name, Age, Token Number
  - Visit Type
  - Chief Complaint
- [ ] Click patient → Load examination form
- [ ] After "Send to Doctor" → Move patient to Doctor's queue
- [ ] Update visit status: In Progress → Completed (Optometry)

**Deliverable:** Optometrist workstation with queue integration ✅

---

#### **Day 19 - Friday, Feb 28**
**Focus:** Optometrist Workstation - Part 4 (Testing)

**Tasks:**
- [ ] Test complete optometry workflow
- [ ] Validate auto-refraction calculations
- [ ] Test IOP alerts (>21 mmHg)
- [ ] Test send-to-doctor functionality
- [ ] Performance testing
- [ ] Bug fixes

**Deliverable:** Optometrist workstation complete ✅

---

#### **Day 20 - Monday, Mar 3**
**Focus:** Optical Prescription Module - Part 1 (Backend)

**Database Tasks:**
- [ ] Create `optical_prescriptions` table:
  ```sql
  CREATE TABLE optical_prescriptions (
    id UUID PRIMARY KEY,
    visit_id UUID REFERENCES visits(id),
    patient_id UUID REFERENCES patient(id),
    prescription_date TIMESTAMP,
    -- Distance Rx
    distance_sphere_od DECIMAL(5,2),
    distance_cylinder_od DECIMAL(5,2),
    distance_axis_od INT,
    distance_sphere_os DECIMAL(5,2),
    distance_cylinder_os DECIMAL(5,2),
    distance_axis_os INT,
    -- Near Rx
    near_add_od DECIMAL(5,2),
    near_add_os DECIMAL(5,2),
    -- Pupillary Distance
    pd_distance INT,
    pd_near INT,
    -- Lens Details
    lens_type VARCHAR(50), -- Single Vision/Bifocal/Progressive
    lens_material VARCHAR(50), -- CR39/Polycarbonate/Hi-Index
    lens_coating VARCHAR(100), -- AR/Blue Cut/Photochromic
    frame_recommendation TEXT,
    prescribed_by_user_id UUID,
    tenant_id UUID,
    created_at TIMESTAMP
  );
  ```
- [ ] Run migration

**Backend Tasks:**
- [ ] Create `OpticalPrescription.cs` model
- [ ] Create `OpticalPrescriptionsController`
- [ ] Create service

**Deliverable:** Optical prescription backend ✅

---

#### **Day 21 - Tuesday, Mar 4**
**Focus:** Optical Prescription Module - Part 2 (Frontend)

**Frontend Tasks:**
- [ ] Add "Optical Rx" tab to `/dashboard/prescriptions`
- [ ] Create `OpticalPrescriptionForm.tsx`
- [ ] Auto-populate from optometry refraction (if available)
- [ ] Allow doctor to edit before finalizing
- [ ] Form fields:
  - Distance Rx (Sphere, Cylinder, Axis for OD/OS)
  - Near Rx (Add power for OD/OS)
  - PD (Distance, Near)
  - Lens Type dropdown
  - Lens Material dropdown
  - Coatings checkboxes (AR, Blue Cut, Photochromic)
  - Frame recommendations (textarea)
- [ ] "Send to Optical Shop" button
- [ ] Print prescription (PDF)

**Deliverable:** Optical prescription UI ✅

---

#### **Day 22 - Wednesday, Mar 5**
**Focus:** Investigations Module - Part 1 (Backend)

**Database Tasks:**
- [ ] Create `investigations` table:
  ```sql
  CREATE TABLE investigations (
    id UUID PRIMARY KEY,
    visit_id UUID REFERENCES visits(id),
    patient_id UUID REFERENCES patient(id),
    investigation_code VARCHAR(50),
    investigation_name VARCHAR(200) NOT NULL,
    investigation_type VARCHAR(100), -- Ophthal/Blood/Radiology/etc
    ordered_by_user_id UUID,
    ordered_at TIMESTAMP,
    status VARCHAR(50), -- Ordered/In Progress/Completed
    result_text TEXT,
    result_file_url VARCHAR(500),
    result_date TIMESTAMP,
    notes TEXT,
    tenant_id UUID,
    created_at TIMESTAMP
  );
  ```
- [ ] Run migration

**Backend Tasks:**
- [ ] Create `Investigation.cs` model
- [ ] Create `InvestigationsController` with endpoints:
  - `POST /api/investigations` - Order investigation
  - `GET /api/investigations/patient/{patientId}` - Get all for patient
  - `GET /api/investigations/visit/{visitId}` - Get all for visit
  - `PUT /api/investigations/{id}/result` - Update result
  - `PUT /api/investigations/{id}/status` - Update status

**Deliverable:** Investigations backend ✅

---

### WEEK 5 (Mar 6-12, 2026)

#### **Day 23 - Thursday, Mar 6**
**Focus:** Investigations Module - Part 2 (Frontend Order)

**Frontend Tasks:**
- [ ] Create `/dashboard/investigations/order/page.tsx`
- [ ] Investigation order form:
  - Patient search/select
  - Investigation type dropdown (Blood Test, OCT, Fundus Photo, etc.)
  - Specific tests checkboxes
  - Priority (Routine/Urgent)
  - Clinical indication (textarea)
  - Ordered by (auto-fill from logged-in user)
- [ ] "Submit Order" button
- [ ] Success message with investigation ID

**Deliverable:** Investigation ordering UI ✅

---

#### **Day 24 - Friday, Mar 7**
**Focus:** Investigations Module - Part 3 (Frontend Tracking)

**Frontend Tasks:**
- [ ] Create `/dashboard/investigations/track/page.tsx`
- [ ] Investigation list with filters:
  - Status (All/Ordered/In Progress/Completed)
  - Date range
  - Investigation type
- [ ] Investigation card showing:
  - Investigation name
  - Patient name, MRN
  - Ordered date
  - Status badge
  - Result (if completed)
  - Download button (if result file available)
- [ ] "Update Status" button (for lab staff)
- [ ] "Upload Result" button (file upload + result text)

**Deliverable:** Investigation tracking UI ✅

---

#### **Day 25 - Monday, Mar 10**
**Focus:** Queue Enhancement - Part 1 (Real-time Load)

**Backend Tasks:**
- [ ] Create endpoint `GET /api/queue/load` returns:
  ```json
  {
    "reception": 5,
    "optometrist": 12,
    "doctor": 8,
    "pharmacy": 3,
    ...
  }
  ```
- [ ] Add WebSocket/SignalR for real-time updates

**Frontend Tasks:**
- [ ] Update `/dashboard/queue/page.tsx`
- [ ] Show staff load before sending:
  ```
  Send To:
  [ ] Reception (5 patients) 🟢
  [ ] Optometrist (12 patients) 🟡
  [ ] Doctor (8 patients) 🟢
  ```
- [ ] Color coding:
  - Green: 0-5 patients
  - Yellow: 6-10 patients
  - Red: >10 patients

**Deliverable:** Real-time queue load indicator ✅

---

#### **Day 26 - Tuesday, Mar 11**
**Focus:** Queue Enhancement - Part 2 (Availability & Re-assignment)

**Backend Tasks:**
- [ ] Add `staff_availability` table:
  ```sql
  CREATE TABLE staff_availability (
    user_id UUID PRIMARY KEY,
    role VARCHAR(50),
    is_available BOOLEAN,
    last_updated TIMESTAMP
  );
  ```
- [ ] Add availability toggle endpoint

**Frontend Tasks:**
- [ ] Show availability indicator next to staff names:
  - ✅ Available (green)
  - ⏸️ Break (yellow)
  - 🚫 Offline (red)
- [ ] Add re-assignment feature with reason dropdown:
  - Wrong routing
  - Staff unavailable
  - Emergency
  - Other (specify)
- [ ] Log re-assignment in audit table

**Deliverable:** Staff availability + re-assignment logging ✅

---

#### **Day 27 - Wednesday, Mar 12**
**Focus:** Patient Directory Hub - Day 1 (Left Panel)

**Frontend Tasks:**
- [ ] Create `/dashboard/patients/directory/page.tsx` (split-panel layout)
- [ ] Left panel:
  - Patient search input (Name, MRN, Mobile, Health ID)
  - Filters (Status, Branch, Date range)
  - Recent/New patients list (10 by default)
  - Patient card: Photo/Avatar, Name, MRN
  - Click → Load in right panel
- [ ] Setup state management for selected patient
- [ ] API integration: `GET /api/patients/recent`

**Deliverable:** Patient directory left panel with search ✅

---

### WEEK 6 (Mar 13-19, 2026)

#### **Day 28 - Thursday, Mar 13**
**Focus:** Patient Directory Hub - Day 2 (Overview Section)

**Frontend Tasks:**
- [ ] Right panel - Overview section (always visible at top):
  - Photo/Avatar (large size)
  - Demographics (Name, Age, Gender, MRN, Health ID, DOB)
  - Contact (Mobile, WhatsApp, Email, Address)
  - Referral info
  - Quick stats:
    - Total visits (with API call)
    - Last visit date
    - Outstanding balance (from billing API)
    - Next appointment date
  - Action buttons: [Edit Patient] [Book Appointment] [Generate Bill]

**API Integration:**
- [ ] `GET /api/patients/{id}/quick-stats` - Returns overview data

**Deliverable:** Patient overview section ✅

---

#### **Day 29 - Friday, Mar 14**
**Focus:** Patient Directory Hub - Day 3 (Tabs 1-3: Visits, Appointments, Billing)

**Frontend Tasks:**
- [ ] Create tab navigation below overview
- [ ] **Tab 1: Visits**
  - Visit timeline (vertical timeline component)
  - Each visit: Date, Token, Doctor, Diagnosis, Outcome
  - Click → View full visit modal
- [ ] **Tab 2: Appointments**
  - Upcoming appointments (with countdown)
  - Past appointments
  - [+ Book New] button
  - Check-in button (with validation)
- [ ] **Tab 3: Billing**
  - All bills table (columns: Date, Bill#, Amount, Paid, Balance, Status)
  - Payment history
  - Outstanding balance summary
  - [Generate Bill] button
  - Download receipt

**Deliverable:** First 3 tabs implemented ✅

---

#### **Day 30 - Monday, Mar 17**
**Focus:** Patient Directory Hub - Day 4 (Tabs 4-6: Eye History, Lab Reports, Insurance)

**Frontend Tasks:**
- [ ] **Tab 4: Eye History**
  - Refraction history (line chart using Chart.js)
  - IOP trends (line chart with alert line at 21 mmHg)
  - Visual acuity progression (bar chart)
  - "Compare Visits" feature (select 2-3 visits, show side-by-side)
- [ ] **Tab 5: Lab Reports**
  - Investigations list with status badges
  - Filter by: Date, Type, Status
  - View button → Opens result modal
  - Download button (if file available)
  - Upload external reports button
- [ ] **Tab 6: Insurance**
  - Policy details card (Provider, Number, Validity)
  - Claims history table
  - Pre-auth status with timeline
  - Corporate account info (if linked)

**Deliverable:** Tabs 4-6 implemented ✅

---

#### **Day 31 - Tuesday, Mar 18**
**Focus:** Patient Directory Hub - Day 5 (Tabs 7-9: Surgery, Prescriptions, Optical)

**Frontend Tasks:**
- [ ] **Tab 7: Surgery**
  - Past surgeries table (Date, Procedure, Surgeon, Eye, Outcome)
  - Scheduled surgeries (Upcoming, with countdown)
  - Surgery packages info
  - Post-OP follow-up schedule
- [ ] **Tab 8: Prescriptions**
  - Medication Rx history (Date, Doctor, Drugs)
  - Optical Rx history (Date, Doctor, Prescription)
  - Download/Print buttons for each
  - Share via WhatsApp/Email
- [ ] **Tab 9: Optical**
  - Spectacle orders (Frame, Lens, Status, Delivery date)
  - Contact lens orders
  - Order history
  - "Repeat Last Order" button

**Deliverable:** Tabs 7-9 implemented ✅

---

#### **Day 32 - Wednesday, Mar 19**
**Focus:** Patient Directory Hub - Day 6 (Tabs 10-12: Pharmacy, Notes, Documents)

**Frontend Tasks:**
- [ ] **Tab 10: Pharmacy**
  - Medication orders table
  - Dispensing history
  - Status: Pending/Dispensed/Collected
  - Print medication list
- [ ] **Tab 11: Notes**
  - Clinical notes list (Date, Doctor, Note)
  - Reminders (Follow-up alerts, Test due)
  - Patient flags:
    - 🔴 VIP
    - ⚠️ Difficult
    - ♿ Special needs
  - [Add New Note] button
  - Private notes (admin only visibility)
- [ ] **Tab 12: Documents**
  - Document list with categories (Consents, Reports, IDs)
  - Upload button (drag & drop, max 10MB)
  - View/Download buttons
  - Delete with confirmation

**Deliverable:** All 12 tabs complete! Patient Directory Hub done ✅

---

### WEEK 7 (Mar 20-26, 2026)

#### **Day 33 - Thursday, Mar 20**
**Focus:** Dashboard Quick Actions

**Frontend Tasks:**
- [ ] Add to dashboard header:
  - `[+ New Patient]` button → Opens slide-out panel
  - `[📅 Book Appointment]` button → Opens modal
- [ ] **New Patient Slide-out:**
  - Quick fields: Name, Mobile, Gender, DOB
  - [Expand] button → Full registration form
  - On save → "Book Appointment Now?" prompt
- [ ] **Book Appointment Modal:**
  - Patient search (required)
  - Branch selector
  - Date/Time picker
  - Doctor selection
  - On save → Auto-billing modal opens

**Deliverable:** Dashboard quick actions ✅

---

#### **Day 34 - Friday, Mar 21**
**Focus:** Billing Rules Admin UI

**Frontend Tasks:**
- [ ] Create `/dashboard/admin/billing-rules/page.tsx`
- [ ] Billing rules list table:
  - Visit Type, Free Days, Free Visits, Active
- [ ] Add/Edit rule modal:
  - Visit Type dropdown (Review/Follow-up/Post-OP)
  - Free Days input
  - Free Visits Count input
  - Active toggle
  - Branch selector (or "All Branches")
- [ ] CRUD operations
- [ ] Test rule application in billing

**Deliverable:** Billing rules configuration UI ✅

---

#### **Day 35-36 - Weekend (Mar 22-23)**
**Tasks:**
- [ ] Deploy Phase 2 to staging
- [ ] End-to-end testing
- [ ] Performance testing
- [ ] Bug fixes
- [ ] Documentation updates

---

#### **Day 37 - Monday, Mar 24**
**Focus:** Phase 2 Testing & Bug Fixes - Part 1

**Testing Scenarios:**
1. Walk-In Wizard (complete flow)
2. Optometrist Workstation (examination + send to doctor)
3. Optical Prescription (create + print)
4. Investigations (order + track + result upload)
5. Queue (load indicator + availability + re-assignment)
6. Patient Directory Hub (all 12 tabs)
7. Dashboard Quick Actions
8. Billing Rules

**Tasks:**
- [ ] Fix identified bugs
- [ ] UI/UX improvements
- [ ] Performance optimization

---

#### **Day 38 - Tuesday, Mar 25**
**Focus:** Phase 2 Testing & Bug Fixes - Part 2

**Tasks:**
- [ ] Cross-browser testing (Chrome, Edge, Firefox)
- [ ] Mobile responsiveness testing
- [ ] Accessibility testing
- [ ] Security testing
- [ ] Final bug fixes

---

#### **Day 39 - Wednesday, Mar 26**
**Focus:** Phase 2 Documentation & Demo Prep

**Tasks:**
- [ ] Update API documentation
- [ ] Create user guides for new features
- [ ] Record demo videos
- [ ] Prepare Phase 2 presentation
- [ ] Code review and refactoring

**Deliverable:** Phase 2 Complete! ✅

---

## 🎯 PHASE 3: COMMUNICATION & PORTAL (Mar 31 - Apr 15, 2026)

**Goal:** Patient engagement and automated communications

### WEEK 8 (Mar 31 - Apr 4, 2026)

#### **Day 40 - Monday, Mar 31**
**Focus:** SMS Integration - Twilio Setup

**Backend Tasks:**
- [ ] Install Twilio SDK: `dotnet add package Twilio`
- [ ] Add Twilio settings to `appsettings.json`:
  ```json
  "Twilio": {
    "AccountSid": "your_sid",
    "AuthToken": "your_token",
    "PhoneNumber": "+1234567890"
  }
  ```
- [ ] Create `ISmsService` interface
- [ ] Create `TwilioSmsService` implementation
- [ ] Register in DI container

**Deliverable:** Twilio SMS service ready ✅

---

#### **Day 41 - Tuesday, Apr 1**
**Focus:** SMS Notification Triggers

**Backend Tasks:**
- [ ] Create `NotificationService` to handle all notifications
- [ ] Implement triggers:
  1. **Appointment Booked** → Send confirmation SMS
  2. **1 Day Before Appointment** → Send reminder SMS
  3. **2 Hours Before Appointment** → Send final reminder SMS
  4. **Check-in Complete** → Send token number SMS
- [ ] Create notification templates:
  ```
  "Your appointment is confirmed for {date} at {time} with Dr. {doctor}. Token will be sent on check-in."
  
  "Reminder: Your appointment with Dr. {doctor} is tomorrow at {time}. Please carry your ID."
  
  "Your token number is {token}. Please wait in the waiting area."
  ```
- [ ] Add background job (Hangfire) for scheduled reminders

**Deliverable:** SMS triggers implemented ✅

---

#### **Day 42 - Wednesday, Apr 2**
**Focus:** WhatsApp Business API Integration

**Backend Tasks:**
- [ ] Setup WhatsApp Business API account (requires approval - 2-3 weeks)
- [ ] OR use Twilio WhatsApp API (faster alternative)
- [ ] Install package: `dotnet add package Twilio.AspNet.Core`
- [ ] Create `IWhatsAppService` interface
- [ ] Create `TwilioWhatsAppService` implementation
- [ ] Configure message templates (WhatsApp requires pre-approved templates)

**Deliverable:** WhatsApp service ready ✅

---

#### **Day 43 - Thursday, Apr 3**
**Focus:** WhatsApp Notifications & Document Sharing

**Backend Tasks:**
- [ ] Implement WhatsApp triggers:
  1. **Bill Generated** → Send bill PDF via WhatsApp
  2. **Prescription Ready** → Send prescription PDF
  3. **Lab Report Ready** → Send report PDF
- [ ] Generate PDFs for:
  - Bill receipt
  - Prescription (medication + optical)
  - Lab reports
- [ ] Upload PDFs to Azure Blob Storage
- [ ] Send WhatsApp message with PDF link

**Deliverable:** WhatsApp document sharing ✅

---

#### **Day 44 - Friday, Apr 4**
**Focus:** Email Service - Azure Communication Services

**Backend Tasks:**
- [ ] Setup Azure Communication Services
- [ ] Install SDK: `dotnet add package Azure.Communication.Email`
- [ ] Create `IEmailService` interface
- [ ] Create `AzureEmailService` implementation
- [ ] Email templates (HTML):
  - Appointment confirmation
  - Appointment reminder
  - Bill receipt
  - Prescription
  - Lab report

**Deliverable:** Email service ready ✅

---

### WEEK 9 (Apr 7-11, 2026)

#### **Day 45 - Monday, Apr 7**
**Focus:** Patient Portal - Backend (Authentication)

**Backend Tasks:**
- [ ] Create Patient Portal endpoints (separate from main API):
  - `POST /api/portal/auth/login` (Health ID/MRN + Password)
  - `POST /api/portal/auth/register` (Health ID/MRN + Mobile OTP)
  - `POST /api/portal/auth/forgot-password` (Mobile OTP verification)
  - `POST /api/portal/auth/reset-password`
- [ ] Add `portal_password_hash` column to `patient` table
- [ ] Implement OTP sending via SMS
- [ ] JWT token generation for portal users

**Deliverable:** Patient portal authentication ✅

---

#### **Day 46 - Tuesday, Apr 8**
**Focus:** Patient Portal - Profile & Appointments

**Frontend Tasks:**
- [ ] Create `/patient-portal` directory
- [ ] **Login Page:**
  - Health ID/MRN input
  - Password input
  - "Forgot Password?" link
  - "Register" link
- [ ] **Dashboard:**
  - Welcome message
  - Quick stats (Next appointment, Outstanding bills)
  - Recent activity
- [ ] **Profile Tab:**
  - View demographics
  - Edit contact info
  - Change password
- [ ] **Appointments Tab:**
  - Upcoming appointments
  - Past appointments
  - [Book New Appointment] button
  - Appointment booking form (Doctor, Date, Time)

**Deliverable:** Patient portal - Profile & Appointments ✅

---

#### **Day 47 - Wednesday, Apr 9**
**Focus:** Patient Portal - Bills & Prescriptions

**Frontend Tasks:**
- [ ] **Bills Tab:**
  - All bills (Paid, Pending, Credit)
  - Download receipt (PDF)
  - Pay online (integrate payment gateway - placeholder for now)
  - Outstanding balance summary
- [ ] **Prescriptions Tab:**
  - Medication prescriptions history
  - Optical prescriptions history
  - Download/Print PDF
  - View details modal

**Deliverable:** Patient portal - Bills & Prescriptions ✅

---

#### **Day 48 - Thursday, Apr 10**
**Focus:** Patient Portal - Lab Reports & Documents

**Frontend Tasks:**
- [ ] **Lab Reports Tab:**
  - All investigations
  - Status tracking
  - View/Download results
- [ ] **Documents Tab:**
  - Consent forms
  - Medical records
  - ID documents
  - Download/View

**Deliverable:** Patient portal - Lab Reports & Documents ✅

---

#### **Day 49 - Friday, Apr 11**
**Focus:** Receipt Customization & Communication Dashboard

**Frontend Tasks:**
- [ ] Create `/dashboard/admin/receipt-templates/page.tsx`
- [ ] Receipt customization:
  - Upload hospital logo
  - Edit header (Hospital name, address, contact, GST)
  - Edit footer (customizable text)
  - Preview receipt
  - Save template
- [ ] Create `/dashboard/admin/communications/page.tsx`
- [ ] Communication dashboard:
  - Notification history (SMS, WhatsApp, Email)
  - Filter by: Date, Type, Status
  - Resend failed notifications
  - Edit templates

**Deliverable:** Receipt customization + Communication dashboard ✅

---

### WEEK 10 (Apr 14-15, 2026)

#### **Day 50 - Monday, Apr 14**
**Focus:** Phase 3 Testing & Bug Fixes

**Testing Scenarios:**
1. SMS notifications (all triggers)
2. WhatsApp PDF sharing
3. Email notifications
4. Patient portal (login, profile, appointments, bills, prescriptions)
5. Receipt customization
6. Communication dashboard

**Tasks:**
- [ ] Fix bugs
- [ ] Test notification delivery
- [ ] Test patient portal on mobile
- [ ] Performance testing

---

#### **Day 51 - Tuesday, Apr 15**
**Focus:** Phase 3 Final Polish & Documentation

**Tasks:**
- [ ] UI/UX improvements
- [ ] Accessibility testing
- [ ] Security review
- [ ] Documentation updates
- [ ] Demo preparation

**Deliverable:** Phase 3 Complete! ✅

---

## 🎯 PHASE 4: ADVANCED FEATURES (Apr 16 - May 12, 2026)

**Goal:** Insurance, corporate accounts, refunds, and advanced billing

### WEEK 11 (Apr 16-22, 2026)

#### **Day 52 - Wednesday, Apr 16**
**Focus:** Insurance Pre-Authorization - Backend

**Database Tasks:**
- [ ] Create `insurance_preauth` table:
  ```sql
  CREATE TABLE insurance_preauth (
    id UUID PRIMARY KEY,
    patient_id UUID REFERENCES patient(id),
    appointment_id UUID REFERENCES appointments(id),
    insurance_provider_id UUID,
    policy_number VARCHAR(100),
    requested_amount DECIMAL(10,2),
    approved_amount DECIMAL(10,2),
    status VARCHAR(50), -- Pending/Approved/Rejected/More Info
    submitted_at TIMESTAMP,
    reviewed_at TIMESTAMP,
    reviewed_by_user_id UUID,
    reviewer_comments TEXT,
    validity_days INT,
    expiry_date TIMESTAMP,
    documents JSONB,
    tenant_id UUID,
    created_at TIMESTAMP
  );
  ```
- [ ] Run migration

**Backend Tasks:**
- [ ] Create `InsurancePreAuth.cs` model
- [ ] Create `InsuranceController` with endpoints:
  - `POST /api/insurance/preauth` - Submit pre-auth
  - `GET /api/insurance/preauth/patient/{id}` - Get all for patient
  - `PUT /api/insurance/preauth/{id}/review` - Approve/Reject
  - `PUT /api/insurance/preauth/{id}/request-info` - Request more info

**Deliverable:** Insurance pre-auth backend ✅

---

#### **Day 53 - Thursday, Apr 17**
**Focus:** Insurance Pre-Authorization - Frontend (Submit)

**Frontend Tasks:**
- [ ] Create `/dashboard/insurance/preauth/submit/page.tsx`
- [ ] Pre-auth submission form:
  - Patient search/select
  - Appointment details
  - Insurance provider dropdown
  - Policy number
  - Treatment details
  - Estimated amount
  - Upload documents (policy copy, medical records)
- [ ] Submit button → Creates pre-auth request
- [ ] Success message with pre-auth ID

**Deliverable:** Insurance pre-auth submission UI ✅

---

#### **Day 54 - Friday, Apr 18**
**Focus:** Insurance Pre-Authorization - Frontend (Review)

**Frontend Tasks:**
- [ ] Create `/dashboard/insurance/preauth/review/page.tsx`
- [ ] Pre-auth requests list (for Insurance team):
  - Filter: Status, Date range
  - Table columns: Patient, Policy, Amount, Status, Submitted Date
- [ ] Click request → Review modal:
  - Patient details
  - Insurance info
  - Treatment details
  - Documents preview
  - Approve/Reject buttons
  - Comments textarea
  - Approved amount input
  - Validity days input
- [ ] Status updates with notifications

**Deliverable:** Insurance pre-auth review UI ✅

---

#### **Day 55 - Monday, Apr 21**
**Focus:** Corporate Accounts - Backend

**Database Tasks:**
- [ ] Create `corporate_accounts` table:
  ```sql
  CREATE TABLE corporate_accounts (
    id UUID PRIMARY KEY,
    company_name VARCHAR(200) NOT NULL,
    company_code VARCHAR(50) UNIQUE,
    credit_limit DECIMAL(12,2),
    payment_terms VARCHAR(100), -- Net 30, Net 60, etc.
    contact_person_name VARCHAR(100),
    contact_email VARCHAR(100),
    contact_phone VARCHAR(20),
    billing_address TEXT,
    authorization_required BOOLEAN DEFAULT true,
    status VARCHAR(50), -- Active/Inactive/Suspended
    outstanding_balance DECIMAL(12,2) DEFAULT 0,
    tenant_id UUID,
    created_at TIMESTAMP
  );
  ```
- [ ] Create `corporate_employee_links` table:
  ```sql
  CREATE TABLE corporate_employee_links (
    id UUID PRIMARY KEY,
    patient_id UUID REFERENCES patient(id),
    corporate_account_id UUID REFERENCES corporate_accounts(id),
    employee_id VARCHAR(50),
    authorization_letter_url VARCHAR(500),
    valid_from DATE,
    valid_to DATE,
    status VARCHAR(50),
    tenant_id UUID
  );
  ```
- [ ] Run migrations

**Backend Tasks:**
- [ ] Create models and controllers
- [ ] Endpoints for CRUD operations

**Deliverable:** Corporate accounts backend ✅

---

#### **Day 56 - Tuesday, Apr 22**
**Focus:** Corporate Accounts - Frontend

**Frontend Tasks:**
- [ ] Create `/dashboard/admin/corporate/page.tsx`
- [ ] Corporate accounts list
- [ ] Add/Edit corporate account modal:
  - Company name, code
  - Credit limit
  - Payment terms
  - Contact details
  - Billing address
  - Authorization required toggle
- [ ] Link employee to corporate:
  - Patient search
  - Employee ID
  - Upload authorization letter
  - Validity dates
- [ ] Corporate credit approval in billing:
  - If patient linked to corporate → Show "Credit Approved" option
  - Check credit limit before approval

**Deliverable:** Corporate accounts UI ✅

---

### WEEK 12 (Apr 23-29, 2026)

#### **Day 57 - Wednesday, Apr 23**
**Focus:** Refund Processing - Backend

**Database Tasks:**
- [ ] Create `refunds` table:
  ```sql
  CREATE TABLE refunds (
    id UUID PRIMARY KEY,
    bill_id UUID REFERENCES opd_bills(id),
    refund_amount DECIMAL(10,2) NOT NULL,
    refund_reason VARCHAR(200),
    refund_mode VARCHAR(50), -- Same Mode/Cash/Patient Wallet
    requested_by_user_id UUID,
    requested_at TIMESTAMP,
    authorized_by_user_id UUID,
    authorized_at TIMESTAMP,
    status VARCHAR(50), -- Pending/Approved/Rejected/Processed
    processing_time_days INT,
    receipt_number VARCHAR(100),
    notes TEXT,
    tenant_id UUID,
    created_at TIMESTAMP
  );
  ```
- [ ] Run migration

**Backend Tasks:**
- [ ] Create `Refund.cs` model
- [ ] Create `RefundsController`
- [ ] Endpoints:
  - `POST /api/refunds` - Request refund
  - `GET /api/refunds` - Get all refunds
  - `PUT /api/refunds/{id}/authorize` - Approve/Reject
  - `PUT /api/refunds/{id}/process` - Mark as processed

**Deliverable:** Refunds backend ✅

---

#### **Day 58 - Thursday, Apr 24**
**Focus:** Refund Processing - Frontend

**Frontend Tasks:**
- [ ] Create `/dashboard/billing/refunds/page.tsx`
- [ ] Refund request form:
  - Bill search/select
  - Refund amount
  - Reason dropdown (Cancellation, Duplicate payment, Service not provided, Other)
  - Refund mode (Same payment mode, Cash, Patient wallet)
  - Notes
- [ ] Refund authorization page (for Managers):
  - Pending refunds list
  - Review modal with bill details
  - Approve/Reject buttons
  - Comments
- [ ] Refund processing:
  - Mark as processed
  - Generate refund receipt
  - Update bill status

**Deliverable:** Refunds UI ✅

---

#### **Day 59 - Friday, Apr 25**
**Focus:** Surgery Package Module - Backend

**Database Tasks:**
- [ ] Create `surgery_packages` table:
  ```sql
  CREATE TABLE surgery_packages (
    id UUID PRIMARY KEY,
    package_name VARCHAR(200) NOT NULL,
    package_code VARCHAR(50) UNIQUE,
    surgery_type VARCHAR(100),
    base_cost DECIMAL(10,2),
    -- Included Items
    iol_type VARCHAR(100),
    ot_charges_included BOOLEAN,
    medications_included BOOLEAN,
    post_op_visits_included INT,
    post_op_validity_days INT,
    -- Package Details
    description TEXT,
    exclusions TEXT,
    terms_conditions TEXT,
    status VARCHAR(50),
    tenant_id UUID,
    created_at TIMESTAMP
  );
  ```
- [ ] Create `patient_surgery_packages` table (links patient to package)
- [ ] Run migrations

**Backend Tasks:**
- [ ] Create models and controllers
- [ ] Logic to auto-apply free follow-ups for post-OP visits

**Deliverable:** Surgery packages backend ✅

---

#### **Day 60 - Monday, Apr 28**
**Focus:** Surgery Package Module - Frontend

**Frontend Tasks:**
- [ ] Create `/dashboard/admin/surgery-packages/page.tsx`
- [ ] Package list and CRUD UI
- [ ] Link patient to package:
  - During surgery booking
  - Select package
  - Package details display
- [ ] Auto-apply free visit in billing:
  - Check if patient has active package
  - Check post-OP visit count and validity
  - Auto-apply "Free" if within limits

**Deliverable:** Surgery packages UI ✅

---

#### **Day 61 - Tuesday, Apr 29**
**Focus:** Phase 4 Testing

**Testing Scenarios:**
1. Insurance pre-auth (submit, review, approve)
2. Corporate accounts (create, link employee, credit approval)
3. Refunds (request, authorize, process)
4. Surgery packages (create, link patient, auto-free follow-ups)

**Tasks:**
- [ ] Fix bugs
- [ ] Integration testing
- [ ] Security testing

**Deliverable:** Phase 4 tested ✅

---

### WEEK 13 (Apr 30 - May 6, 2026)

#### **Day 62-65 - Wed-Fri (Apr 30 - May 2)**
**Focus:** Phase 4 Final Polish & Buffer

**Tasks:**
- [ ] UI/UX improvements
- [ ] Performance optimization
- [ ] Documentation
- [ ] Bug fixes
- [ ] Code review

---

#### **Day 66-68 - Mon-Wed (May 5-7)**
**Focus:** Pre-Production Testing

**Tasks:**
- [ ] End-to-end testing of entire OPD flow
- [ ] Test all integrations (SMS, WhatsApp, Email)
- [ ] Test all advanced features
- [ ] Performance testing
- [ ] Security audit prep

**Deliverable:** Phase 4 Complete! ✅

---

## 🎯 PHASE 5: PRODUCTION POLISH (May 13-29, 2026)

**Goal:** Production readiness, performance, security, and go-live prep

### WEEK 14 (May 13-16, 2026)

#### **Day 69 - Tuesday, May 13**
**Focus:** End-to-End Testing - Part 1

**Testing Scenarios:**
1. **Patient Registration → OPD Visit → Billing → Check-in → Clinical → Completion**
   - Register new patient
   - Book appointment
   - Auto-billing prompt
   - Generate bill with line items
   - Finalize bill
   - Check-in (4-condition validation)
   - Token generation
   - Optometry examination
   - Doctor examination
   - Prescription
   - Pharmacy/Optical routing
   - Visit completion

2. **Walk-In Flow**
   - Walk-in wizard (single page)
   - Auto check-in
   - Token display
   - Clinical workflow

**Tasks:**
- [ ] Execute scenarios 50+ times
- [ ] Record bugs
- [ ] Measure response times

---

#### **Day 70 - Wednesday, May 14**
**Focus:** End-to-End Testing - Part 2

**Testing Scenarios:**
3. **Insurance Flow**
   - Submit pre-auth
   - Review and approve
   - Link to billing
   - Check-in allowed

4. **Corporate Flow**
   - Link employee to corporate
   - Credit approval
   - Billing with corporate credit

5. **Refund Flow**
   - Request refund
   - Authorize
   - Process

6. **Patient Portal**
   - Login
   - Book appointment
   - View bills
   - Download prescription

**Tasks:**
- [ ] Test all flows
- [ ] Fix critical bugs

---

#### **Day 71 - Thursday, May 15**
**Focus:** Performance Testing - Load Simulation

**Testing Setup:**
- [ ] Setup load testing tool (JMeter/k6)
- [ ] Create test scenarios simulating 50-400 OPD patients/day
- [ ] Test with 50+ concurrent users

**Metrics to Measure:**
- [ ] Page load time (<2 seconds target)
- [ ] API response time
- [ ] Database query performance
- [ ] Concurrent user handling

**Tasks:**
- [ ] Run load tests
- [ ] Identify bottlenecks
- [ ] Record metrics

---

#### **Day 72 - Friday, May 16**
**Focus:** Performance Optimization

**Tasks:**
- [ ] Database indexing:
  - Add indexes on frequently queried columns
  - Optimize complex queries
- [ ] Frontend optimization:
  - Code splitting
  - Lazy loading components
  - Image optimization
  - Caching strategies
- [ ] Backend optimization:
  - Query optimization
  - Implement caching (Redis)
  - Optimize API response payloads

**Target Metrics:**
- ✅ Page load: <2 seconds
- ✅ API response: <500ms
- ✅ Database queries: <200ms
- ✅ Handles 50+ concurrent users

---

### WEEK 15 (May 19-23, 2026)

#### **Day 73 - Monday, May 19**
**Focus:** Security Audit - Part 1

**Security Checks:**
- [ ] SQL Injection testing
- [ ] XSS (Cross-Site Scripting) testing
- [ ] CSRF (Cross-Site Request Forgery) protection
- [ ] Authentication vulnerabilities
- [ ] Authorization checks (role-based access)
- [ ] Password security (hashing, strength)
- [ ] API endpoint security
- [ ] File upload security

**Tasks:**
- [ ] Run automated security scans
- [ ] Manual penetration testing
- [ ] Review code for security issues

---

#### **Day 74 - Tuesday, May 20**
**Focus:** Security Audit - Part 2

**Security Checks:**
- [ ] Immutable billing records (cannot edit after finalization)
- [ ] Audit trail verification (28 triggers working)
- [ ] Soft delete enforcement (no hard deletes)
- [ ] Row-level security (tenant isolation)
- [ ] Password-protected overrides (discount, refund, cancellation)
- [ ] Sensitive data encryption
- [ ] HTTPS enforcement
- [ ] CORS configuration

**Tasks:**
- [ ] Fix security vulnerabilities
- [ ] Update security policies
- [ ] Document security measures

---

#### **Day 75 - Wednesday, May 21**
**Focus:** HIPAA Compliance Verification

**HIPAA Checks:**
- [ ] Data encryption at rest (Azure Blob Storage, Database)
- [ ] Data encryption in transit (HTTPS)
- [ ] Access controls (RBAC)
- [ ] Audit logs (all PHI access logged)
- [ ] Patient privacy (consent forms)
- [ ] Data backup and recovery
- [ ] Breach notification procedures
- [ ] Business Associate Agreements (BAAs)

**Tasks:**
- [ ] Review compliance checklist
- [ ] Generate compliance report
- [ ] Document gaps (if any)

---

#### **Day 76 - Thursday, May 22**
**Focus:** Documentation - Part 1

**User Guides:**
- [ ] Front Desk User Guide
  - Patient registration
  - Appointment booking
  - Check-in process
  - Walk-in wizard
- [ ] Billing User Guide
  - Generate bill
  - Payment collection
  - Refunds
  - Receipt customization
- [ ] Clinical Staff Guide
  - Optometry examination
  - Doctor examination
  - Prescriptions
- [ ] Admin Guide
  - User management
  - Billing rules
  - Corporate accounts
  - Insurance management

**Tasks:**
- [ ] Write user guides with screenshots
- [ ] Create video tutorials
- [ ] PDF generation

---

#### **Day 77 - Friday, May 23**
**Focus:** Documentation - Part 2

**Technical Documentation:**
- [ ] API documentation (Swagger complete)
- [ ] Database schema documentation
- [ ] Architecture diagrams
- [ ] Deployment guide
- [ ] Troubleshooting guide
- [ ] FAQs

**Tasks:**
- [ ] Complete all documentation
- [ ] Review and finalize
- [ ] Publish to documentation portal

---

### WEEK 16 (May 26-29, 2026)

#### **Day 78 - Monday, May 26**
**Focus:** Deployment Preparation

**Azure Infrastructure:**
- [ ] Setup production environment
- [ ] Configure App Service
- [ ] Configure Azure SQL/PostgreSQL
- [ ] Configure Azure Blob Storage
- [ ] Configure Azure Communication Services
- [ ] Setup Application Insights (monitoring)
- [ ] Setup Azure Key Vault (secrets management)

**CI/CD Pipeline:**
- [ ] Azure DevOps pipeline setup
- [ ] Automated build
- [ ] Automated tests
- [ ] Automated deployment

**Deliverable:** Production infrastructure ready ✅

---

#### **Day 79 - Tuesday, May 27**
**Focus:** Production Deployment

**Deployment Steps:**
- [ ] Database migration to production
- [ ] Deploy backend API
- [ ] Deploy frontend
- [ ] Configure DNS
- [ ] Setup SSL certificates
- [ ] Configure monitoring and alerts
- [ ] Test production environment

**Smoke Testing:**
- [ ] Test all critical flows in production
- [ ] Verify integrations (SMS, WhatsApp, Email)
- [ ] Check performance

**Deliverable:** Production deployment complete ✅

---

#### **Day 80 - Wednesday, May 28**
**Focus:** Final Testing & User Acceptance

**User Acceptance Testing (UAT):**
- [ ] Front desk staff testing
- [ ] Billing team testing
- [ ] Clinical staff testing
- [ ] Admin testing
- [ ] Patient portal testing

**Tasks:**
- [ ] Collect feedback
- [ ] Fix critical issues
- [ ] Final adjustments

---

#### **Day 81 - Thursday, May 29**
**Focus:** Go-Live Preparation & Training

**Training Sessions:**
- [ ] Front desk team training (2 hours)
- [ ] Billing team training (2 hours)
- [ ] Clinical staff training (2 hours)
- [ ] Admin training (1 hour)

**Go-Live Checklist:**
- [ ] All features working ✅
- [ ] All integrations tested ✅
- [ ] Documentation complete ✅
- [ ] Staff trained ✅
- [ ] Support team ready ✅
- [ ] Rollback plan prepared ✅

**Deliverable:** Ready for Go-Live! ✅

---

## 🚀 GO-LIVE: MONDAY, JUNE 2, 2026

### Launch Day Activities:
- [ ] Monitor system closely
- [ ] Support team on standby
- [ ] Track all issues
- [ ] Collect user feedback
- [ ] Quick bug fixes if needed

### Week 1 Post-Launch (June 2-6):
- [ ] Daily monitoring
- [ ] User support
- [ ] Bug fixes
- [ ] Performance optimization
- [ ] Collect feedback

### Week 2 Post-Launch (June 9-13):
- [ ] Stability monitoring
- [ ] Final bug fixes
- [ ] Process improvements
- [ ] User satisfaction survey

---

## 📊 SUCCESS METRICS

### Performance Targets:
- ✅ Page load time: <2 seconds
- ✅ API response time: <500ms
- ✅ Support 50-400 OPD patients/day
- ✅ Handle 50+ concurrent users
- ✅ 99.9% uptime

### Compliance Targets:
- ✅ HIPAA compliant
- ✅ Immutable billing records
- ✅ Complete audit trail
- ✅ Row-level security enforced

### User Satisfaction Targets:
- ✅ 90%+ staff satisfaction
- ✅ 95%+ patient satisfaction
- ✅ <5% error rate
- ✅ <1 hour average resolution time

---

## 📅 QUICK REFERENCE CALENDAR

| Week | Dates | Phase | Key Deliverables |
|------|-------|-------|------------------|
| 1 | Feb 3-9 | Phase 1 | Check-in hard gate, Bill locking |
| 2 | Feb 10-19 | Phase 1 | Token display, Bill items, Auto-billing, Testing |
| 3-4 | Feb 20-Mar 5 | Phase 2 | Walk-in wizard, Optometrist, Optical Rx |
| 5-6 | Mar 6-19 | Phase 2 | Investigations, Queue, Patient Directory (6 tabs) |
| 7 | Mar 20-26 | Phase 2 | Patient Directory (6 tabs), Quick actions, Billing rules |
| 8-9 | Mar 31-Apr 11 | Phase 3 | SMS, WhatsApp, Email, Patient Portal |
| 10 | Apr 14-15 | Phase 3 | Testing & Polish |
| 11-12 | Apr 16-29 | Phase 4 | Insurance, Corporate, Refunds, Surgery packages |
| 13 | Apr 30-May 7 | Phase 4 | Testing & Polish |
| 14-15 | May 13-23 | Phase 5 | Performance, Security, HIPAA, Documentation |
| 16 | May 26-29 | Phase 5 | Deployment, Training, Go-Live Prep |
| **GO-LIVE** | **Jun 2** | **Launch** | **🚀 Hospital Portal Live!** |

---

## ✅ SUMMARY

**Total Duration:** 81 days (16 weeks)  
**Start Date:** February 3, 2026  
**End Date:** May 29, 2026  
**Go-Live:** June 2, 2026

**Features Delivered:**
- ✅ Complete OPD flow with hard gates
- ✅ Patient Directory Hub (12 tabs)
- ✅ Walk-in Wizard
- ✅ Optometrist Workstation
- ✅ Investigations Module
- ✅ Enhanced Queue Management
- ✅ SMS/WhatsApp/Email Notifications
- ✅ Patient Portal
- ✅ Insurance Pre-Authorization
- ✅ Corporate Accounts
- ✅ Refund Processing
- ✅ Surgery Packages
- ✅ HIPAA Compliant
- ✅ Production Ready

**Your Hospital Portal will be fully operational on June 2, 2026! 🎉**
