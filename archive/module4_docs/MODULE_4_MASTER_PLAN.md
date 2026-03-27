# Module 4: Front Office/OPD Management - MASTER IMPLEMENTATION PLAN 🏥

**Created**: February 1, 2026  
**Status**: ✅ ALL REQUIREMENTS FINALIZED - READY TO IMPLEMENT  
**Estimated Time**: 10 days (2 weeks)

---

## 📋 TABLE OF CONTENTS

1. [Executive Summary](#executive-summary)
2. [Finalized Business Logic](#finalized-business-logic)
3. [Current Implementation Status](#current-implementation-status)
4. [What Needs to Be Implemented](#what-needs-to-be-implemented)
5. [Day-by-Day Implementation Plan](#day-by-day-implementation-plan)
6. [Technical Requirements](#technical-requirements)
7. [Success Metrics](#success-metrics)

---

## 📊 EXECUTIVE SUMMARY

### **What's Complete**:
- ✅ **Backend**: 100% (PatientsController, AppointmentsController, VisitsController)
- ✅ **Database**: 100% (patient, appointment, visits, token_sequences tables)
- ✅ **Business Logic**: 100% finalized (all 5 clarifications received)

### **What's Needed**:
- ⏳ **Frontend**: 60% complete (need 8 new components)
  - Existing: PatientFormModal, PatientDetailsModal, FrontDeskDashboard
  - Missing: Enhanced registration, Check-in, Token display, Queue management, Walk-in flow

### **Timeline**:
- **Week 1** (5 days): Patient Registration + Check-In Workflow
- **Week 2** (3 days): Queue Management + Reception Services
- **Week 3** (2 days): Surgery Availability + Reports + Testing

---

## ✅ FINALIZED BUSINESS LOGIC

### **1. Payment Validation - DUAL HARD GATE**

**Decision**: ✅ **BOTH** (Consultation fee paid + No outstanding bills)

**Implementation**:
```typescript
interface CheckInValidation {
  hasAppointmentToday: boolean;
  consultationFeePaid: boolean;      // GATE 1
  outstandingBills: number;          // GATE 2
}

const canCheckIn = (validation: CheckInValidation): boolean => {
  return (
    validation.hasAppointmentToday === true &&
    validation.consultationFeePaid === true &&
    validation.outstandingBills === 0
  );
};
```

**APIs Required**:
- `GET /api/appointments/patient/{patientId}?date=today` - Verify appointment
- `GET /api/billing/payment-status/{appointmentId}` - Check fee paid (GATE 1)
- `GET /api/opdbills/outstanding/{patientId}` - Check outstanding (GATE 2)

**Error Messages**:
- ❌ No appointment: `"No appointment booked for today"`
- ❌ Fee not paid: `"Consultation fee not paid - Please pay at billing counter"`
- ❌ Outstanding: `"Outstanding bills: ₹X,XXX - Please clear previous dues"`

---

### **2. Emergency Override - ENABLED**

**Decision**: ✅ **YES** (Approval + Reason required, logged in database)

**Implementation**:
```typescript
interface EmergencyOverride {
  enabled: boolean;
  approvedBy: string;       // User ID
  approverName: string;     // User name
  reason: string;           // Minimum 20 characters
  timestamp: string;
}

const canCheckIn = (
  validation: CheckInValidation,
  override?: EmergencyOverride
): boolean => {
  // Emergency override bypasses all payment validation
  if (override?.enabled && override.approvedBy && override.reason) {
    return true;
  }
  
  // Normal validation (both gates required)
  return (
    validation.hasAppointmentToday === true &&
    validation.consultationFeePaid === true &&
    validation.outstandingBills === 0
  );
};
```

**Database Table** (create new):
```sql
CREATE TABLE emergency_override_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id),
    patient_id UUID NOT NULL REFERENCES patient(id),
    appointment_id UUID REFERENCES appointment(id),
    visit_id UUID REFERENCES visits(id),
    override_type VARCHAR(50) NOT NULL DEFAULT 'PAYMENT_VALIDATION',
    approved_by_user_id UUID NOT NULL REFERENCES users(id),
    approver_name VARCHAR(200) NOT NULL,
    reason TEXT NOT NULL,
    overridden_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by_user_id UUID NOT NULL REFERENCES users(id)
);

CREATE INDEX idx_emergency_override_tenant ON emergency_override_log(tenant_id);
CREATE INDEX idx_emergency_override_patient ON emergency_override_log(patient_id);
```

**UI Component**:
```typescript
<div className="emergency-override">
  <input type="checkbox" id="emergency" />
  <label>Emergency Case - Override Payment Validation</label>
  
  {emergencyEnabled && (
    <>
      <select required>
        <option>Select Approver</option>
        <option value="senior-doctor">Senior Doctor</option>
        <option value="admin">Admin</option>
        <option value="dept-head">Department Head</option>
      </select>
      <textarea 
        placeholder="Reason (mandatory, min 20 chars)" 
        minLength={20}
        required
      />
    </>
  )}
</div>
```

---

### **3. Token Print Button - COMPLETELY REMOVED**

**Decision**: ❌ **REMOVE** (Display only on screen)

**Implementation**:
```typescript
// TokenDisplay.tsx
export default function TokenDisplay({ token, patientName }: Props) {
  return (
    <div className="token-display">
      {/* Large display for visibility */}
      <h1 className="text-7xl font-bold text-blue-600">
        {token.tokenNumber}
      </h1>
      <p className="text-2xl text-gray-600">{patientName}</p>
      
      {/* QR code for internal tracking only */}
      <QRCodeSVG value={token.tokenNumber} size={200} />
      
      {/* NO PRINT BUTTON - completely removed */}
    </div>
  );
}
```

**Token Format**: `Branch-Date-Sequence` (e.g., `BLR-20260201-045`)

---

### **4. Registration Card Print - ENABLED**

**Decision**: ✅ **KEEP PRINT** (MRN card with QR + Photo)

**Implementation**:
```typescript
// RegistrationCardPreview.tsx
export default function RegistrationCardPreview({ patient }: Props) {
  return (
    <>
      {/* Printable card */}
      <div className="registration-card print:block" style={{ width: '3.5in', height: '2in' }}>
        {/* QR Code + Barcode */}
        <div className="flex gap-2">
          <QRCodeSVG value={patient.mrn} size={80} />
          <Barcode value={patient.mrn} format="CODE128" height={40} />
        </div>
        
        {/* Patient Photo */}
        {patient.photoUrl && (
          <img src={patient.photoUrl} className="w-20 h-20 rounded" />
        )}
        
        {/* Details */}
        <div className="patient-details text-xs">
          <p className="font-bold">{patient.name}</p>
          <p>MRN: {patient.mrn}</p>
          <p>DOB: {patient.dob}</p>
          <p>Contact: {patient.contact}</p>
          <p>Blood: {patient.bloodGroup}</p>
          <p>Emergency: {patient.emergencyContact}</p>
        </div>
      </div>
      
      {/* Print button */}
      <button onClick={() => window.print()} className="btn-primary mt-4">
        🖨️ Print Registration Card
      </button>
    </>
  );
}
```

**Note**: Registration card is DIFFERENT from token. Card printed once during registration, token displayed on screen during check-in.

---

### **5. Walk-In Patients - DUAL MODE BOOKING**

**Decision**: ✅ **BOTH** (Quick auto-assign + Manual slot selection)

**Implementation**:

#### **Workflow 1: Existing Patient Walk-In**
```
1. Search patient (MRN / Mobile / Name)
2. Check if appointment exists for today
3. If NO appointment - Choose booking mode:
   
   OPTION A - QUICK BOOKING:
   → Click "⚡ Quick Book" button
   → System finds next available slot
   → Auto-books appointment
   → Redirect to billing
   
   OPTION B - MANUAL BOOKING:
   → Click "📅 Choose Time" button
   → Open appointment calendar
   → Select preferred time slot
   → Book appointment
   → Redirect to billing

4. After payment → Enable check-in button
```

#### **Workflow 2: New Patient Walk-In**
```
1. Click "New Patient" button
2. Fill PatientFormModal (photo/ID optional)
3. Auto-generate MRN on save
4. Choose booking mode:
   → Quick Book OR Choose Time
5. After payment → Enable check-in button
```

**Component**:
```typescript
// WalkInRegistration.tsx
export default function WalkInRegistration() {
  const [patientType, setPatientType] = useState<'existing' | 'new'>(null);
  
  const handleQuickBooking = async () => {
    // Find next available slot
    const nextSlot = await getNextAvailableSlot(selectedDoctor, selectedDepartment);
    
    // Auto-book appointment
    const appointment = await createAppointment({
      patientId,
      doctorId: selectedDoctor,
      departmentId: selectedDepartment,
      appointmentDate: nextSlot.date,
      appointmentTime: nextSlot.time,
      appointmentType: 'walk-in',
    });
    
    // Redirect to payment
    router.push(`/billing/payment/${appointment.id}`);
  };
  
  const handleManualBooking = () => {
    setShowAppointmentModal(true);
  };
  
  return (
    <div>
      {/* Patient Type Selection */}
      <div className="patient-type-selector">
        <button onClick={() => setPatientType('existing')}>
          Existing Patient
        </button>
        <button onClick={() => setPatientType('new')}>
          New Patient
        </button>
      </div>
      
      {/* Booking Mode Selection */}
      {patientSelected && (
        <div className="booking-mode-selector">
          <h3>Book Appointment</h3>
          <div className="flex gap-4">
            <button onClick={handleQuickBooking} className="btn-primary">
              ⚡ Quick Book (Next Available Slot)
            </button>
            <button onClick={handleManualBooking} className="btn-secondary">
              📅 Choose Time (Select Slot)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
```

**Use Cases**:
- **Quick Booking**: Emergency patients, busy hours, no time preference
- **Manual Booking**: Patient preference, non-urgent, specific doctor needed

---

## 📊 CURRENT IMPLEMENTATION STATUS

### ✅ **Backend API - 100% Complete**

| Controller | Endpoints | Status |
|------------|-----------|--------|
| PatientsController | GET, POST, PUT, DELETE, Upload Photo, Search | ✅ Complete |
| AppointmentsController | CRUD, Conflicts, Reschedule, Reminders | ✅ Complete |
| VisitsController | Check-in, Token generation, Queue management | ✅ Complete |
| OpdBillsController | Outstanding bills check | ✅ Exists |

**Key APIs Available**:
- `GET /api/patients/search` - Search patients ✅
- `POST /api/patients` - Create patient (auto-generates MRN) ✅
- `POST /api/patients/upload-photo` - Upload photo ✅
- `POST /api/appointments` - Create appointment ✅
- `GET /api/appointments/conflicts` - Check conflicts ✅
- `POST /api/visits/check-in` - Check-in patient ✅
- `GET /api/visits/queue/{branchId}` - Get patient queue ✅
- `GET /api/opdbills/outstanding/{patientId}` - Check outstanding bills ✅

---

### ✅ **Database - 100% Complete**

| Table | Key Fields | Status |
|-------|------------|--------|
| patient | 65+ fields (demographics, contact, medical, insurance, photo_url, id_proof) | ✅ Complete |
| appointment | patient_id, doctor_id, date, time, priority, is_recurring, status | ✅ Complete |
| visits | token_number, token_sequence, current_station, assigned_to, status | ✅ Complete |
| token_sequences | branch-wise sequence tracking | ✅ Complete |
| appointment_reminders | Automated reminders | ✅ Complete |

**Tables to Create**:
- ❌ `emergency_override_log` - Log emergency overrides (SQL provided above)
- ❌ `visitor_log` - Track IPD visitors (optional, low priority)

---

### 🟡 **Frontend - 60% Complete**

| Component | Status | Notes |
|-----------|--------|-------|
| PatientFormModal | ✅ Exists | Need to add: Photo capture, ID upload, MRN display, Print card button |
| PatientDetailsModal | ✅ Exists | 15 tabs complete, 5 tabs pending (low priority) |
| FrontDeskDashboard | ✅ Exists | Need to add: Queue widgets, Check-in panel |
| Appointments Calendar | ✅ Complete | Full booking system with conflicts |
| PhotoCapture | ✅ Exists | In `patients/new/page.tsx` - REUSE this |
| CheckInComponent | ❌ Missing | Main check-in interface with dual gate validation |
| TokenDisplay | ❌ Missing | Token display (NO print button) |
| WalkInRegistration | ❌ Missing | Dual-mode booking (quick/manual) |
| RegistrationCardPreview | ❌ Missing | Printable MRN card |
| QueueDisplayTV | ❌ Missing | Waiting area TV display |
| QueueDashboard | ❌ Missing | Reception queue management |
| InquiryPanel | ❌ Missing | Reception services |
| OPDReports | ❌ Missing | Daily/weekly reports |

---

## 🛠️ WHAT NEEDS TO BE IMPLEMENTED

### **Priority 1: Enhanced Patient Registration** (1-2 days)

**Files to Modify/Create**:
1. `apps/hospital-portal-web/src/components/patients/PatientFormModal.tsx`
   - Add photo capture (reuse from `patients/new/page.tsx`)
   - Add ID proof upload (optional)
   - Display auto-generated MRN
   - Add "Print Registration Card" button

2. `apps/hospital-portal-web/src/components/patients/RegistrationCardPreview.tsx` (**NEW**)
   - MRN QR code + barcode
   - Patient photo (if uploaded)
   - Demographics (name, DOB, contact, blood group)
   - Emergency contact
   - Print button (3.5" x 2" card format)

**APIs to Use**:
- `POST /api/patients` - Create patient (returns auto-generated MRN)
- `POST /api/patients/upload-photo` - Upload photo (optional)

---

### **Priority 2: Check-In Workflow** (2-3 days)

**Files to Create**:
1. `apps/hospital-portal-web/src/components/frontdesk/CheckInComponent.tsx` (**NEW**)
   - Patient search (MRN scan, mobile, name)
   - **Dual hard gate validation**:
     - Gate 1: Verify consultation fee paid
     - Gate 2: Check no outstanding bills
   - Show specific error messages
   - Chief complaint capture
   - Emergency override with approval + reason
   - Call check-in API on success

2. `apps/hospital-portal-web/src/components/frontdesk/TokenDisplay.tsx` (**NEW**)
   - Display token number (72px+ font)
   - QR code generation
   - **NO PRINT BUTTON**
   - Auto-close after 10 seconds

3. `apps/hospital-portal-web/src/components/frontdesk/WalkInRegistration.tsx` (**NEW**)
   - Patient type selection (Existing/New)
   - Dual-mode booking buttons (Quick Book / Choose Time)
   - Integration with PatientFormModal
   - Integration with AppointmentFormModal

**APIs to Use**:
- `GET /api/appointments/patient/{patientId}?date=today`
- `GET /api/billing/payment-status/{appointmentId}`
- `GET /api/opdbills/outstanding/{patientId}`
- `POST /api/visits/check-in`

---

### **Priority 3: Queue Management** (1-2 days)

**Files to Create**:
1. `apps/hospital-portal-web/src/components/frontdesk/QueueDisplayTV.tsx` (**NEW**)
   - Current token being served
   - Next 5 tokens in queue
   - Doctor name, room number
   - Auto-refresh every 5 seconds (WebSocket)

2. `apps/hospital-portal-web/src/components/frontdesk/QueueDashboard.tsx` (**NEW**)
   - Real-time queue status (all queues)
   - Waiting patients count
   - Average wait time
   - Manual status updates (call patient, mark absent, transfer)

**APIs to Use**:
- `GET /api/visits/queue/{branchId}`
- `PATCH /api/visits/{id}/station`
- `PATCH /api/visits/{id}/assign`

---

### **Priority 4: Reception Services** (1 day)

**Files to Modify/Create**:
1. `apps/hospital-portal-web/src/app/dashboard/frontdesk/page.tsx`
   - Add today's summary widgets (registrations, check-ins, doctor-wise count)
   - Add quick action buttons (Register, Check-In, Search)

2. `apps/hospital-portal-web/src/components/frontdesk/InquiryPanel.tsx` (**NEW**)
   - Doctor availability search
   - Appointment availability calendar
   - Procedure pricing lookup

3. `apps/hospital-portal-web/src/components/frontdesk/VisitorManagement.tsx` (**NEW**)
   - IPD patient visitors
   - Visitor check-in/out
   - Issue visitor passes

---

### **Priority 5: Surgery Availability** (0.5 days)

**Files to Create**:
1. `apps/hospital-portal-web/src/components/frontdesk/SurgeryAvailabilityCheck.tsx` (**NEW**)
   - Surgeon availability lookup
   - OT schedule calendar
   - Two modes: Quick note to counselor / Direct doctor support

**APIs to Use** (verify exist or create):
- `GET /api/users/surgeons`
- `GET /api/users/{surgeonId}/availability`
- `GET /api/ot/availability`

---

### **Priority 6: Reports** (0.5 days)

**Files to Create**:
1. `apps/hospital-portal-web/src/components/frontdesk/OPDReports.tsx` (**NEW**)
   - Total registrations (new vs returning)
   - Check-in statistics
   - Doctor-wise patient count
   - Department-wise distribution
   - Peak hours analysis (chart)
   - No-show analysis

**APIs to Use** (create if missing):
- `GET /api/reports/opd/daily`
- `GET /api/reports/opd/summary`

---

## 📅 SEQUENTIAL IMPLEMENTATION PLAN

> **Order**: Frontend → Backend → Database → Sidebar  
> **Duration**: 10 days (2 weeks)  
> **Approach**: Complete all FE components first, then add missing BE APIs, then create DB tables, finally update navigation

---

### **PHASE 1: FRONTEND IMPLEMENTATION** (Days 1-8)

Complete all 8 frontend components before touching backend or database.

---

#### **Day 1: Setup + Enhanced Patient Registration - Part 1** (6-8 hours)

**Setup (30 minutes)**:
```powershell
# Install required npm packages
cd "C:\Users\Sam Aluri\Downloads\Hospital Portal\apps\hospital-portal-web"
pnpm add react-webcam react-qr-code jsbarcode socket.io-client
```

**Morning (9:00 AM - 12:00 PM)**:
- [ ] Review existing PhotoCapture in `apps/hospital-portal-web/src/app/dashboard/patients/new/page.tsx`
- [ ] Extract photo capture logic into reusable component
- [ ] Create: `apps/hospital-portal-web/src/components/shared/PhotoCapture.tsx`
  ```typescript
  // Reusable photo capture component
  export default function PhotoCapture({ onPhotoCapture, optional = true }) {
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    // ... webcam logic from patients/new/page.tsx
  }
  ```

**Afternoon (1:00 PM - 5:00 PM)**:
- [ ] Modify: `apps/hospital-portal-web/src/components/patients/PatientFormModal.tsx`
  - [ ] Import PhotoCapture component
  - [ ] Add photo capture section (mark as OPTIONAL)
  - [ ] Add ID proof upload section (mark as OPTIONAL)
  - [ ] Add MRN display field (read-only, populated after save)
  - [ ] Add "Print Registration Card" button (disabled until patient saved)

**Evening (5:00 PM - 7:00 PM)**:
- [ ] Create: `apps/hospital-portal-web/src/components/patients/RegistrationCardPreview.tsx`
  - [ ] Import `react-qr-code` and `jsbarcode`
  - [ ] Add QR code generation
  - [ ] Add barcode generation
  - [ ] Add patient photo display (if exists)
  - [ ] Add demographics section (name, MRN, DOB, contact, blood group)
  - [ ] Add emergency contact section
  - [ ] Style for 3.5" x 2" card format (business card size)
  - [ ] Add print CSS media queries

---

#### **Day 2: Enhanced Patient Registration - Part 2** (6-8 hours)

**Morning (9:00 AM - 12:00 PM)**:
- [ ] Test PatientFormModal photo capture:
  - [ ] Upload photo via file picker
  - [ ] Capture photo via webcam
  - [ ] Preview photo before save
- [ ] Test ID proof upload functionality
- [ ] Validate file size (max 5MB) and format (jpg, png, pdf)

**Afternoon (1:00 PM - 5:00 PM)**:
- [ ] Implement print registration card flow:
  - [ ] After patient saved, show MRN
  - [ ] Enable "Print Registration Card" button
  - [ ] Open RegistrationCardPreview component
  - [ ] Test print dialog (window.print())
- [ ] Polish UI/UX (loading states, error messages)

**Evening (5:00 PM - 7:00 PM)**:
- [ ] End-to-end testing (registration without photo, with photo, print card)
- [ ] Fix bugs
- [ ] Code review

**✅ Deliverables**: Enhanced PatientFormModal + RegistrationCardPreview (print-enabled)

---

#### **Day 3: Check-In Workflow - Part 1** (6-8 hours)

**Morning (9:00 AM - 12:00 PM)**:
- [ ] Create: `apps/hospital-portal-web/src/components/frontdesk/CheckInComponent.tsx`
  - [ ] Patient search section (MRN scan, mobile number, name search)
  - [ ] Display patient details card (name, MRN, photo, last visit)
  - [ ] Create validation state management:
    ```typescript
    interface CheckInValidation {
      hasAppointmentToday: boolean;
      consultationFeePaid: boolean;
      outstandingBills: number;
      canCheckIn: boolean;
      errorMessage?: string;
    }
    ```

**Afternoon (1:00 PM - 5:00 PM)**:
- [ ] Implement dual hard gate validation UI:
  - [ ] Gate 1 indicator: Consultation fee paid (✅ / ❌)
  - [ ] Gate 2 indicator: No outstanding bills (✅ / ❌)
  - [ ] Show specific error messages:
    - "No appointment booked for today"
    - "Consultation fee not paid - Please pay at billing counter"
    - "Outstanding bills: ₹X,XXX - Please clear previous dues"
- [ ] Add chief complaint input field (required, min 10 chars)
- [ ] Add contact details update section (optional)

**Evening (5:00 PM - 7:00 PM)**:
- [ ] Add emergency override section:
  - [ ] Checkbox: "Emergency Case - Override Payment Validation"
  - [ ] Conditional fields (show only when checked):
    - Approval dropdown (Senior Doctor / Admin / Dept Head)
    - Reason textarea (mandatory, min 20 chars)
  - [ ] Update canCheckIn logic to include override

**✅ Deliverables**: CheckInComponent with dual validation + emergency override

---

#### **Day 4: Check-In Workflow - Part 2** (6-8 hours)

**Morning (9:00 AM - 12:00 PM)**:
- [ ] Create: `apps/hospital-portal-web/src/components/frontdesk/TokenDisplay.tsx`
  ```typescript
  interface TokenDisplayProps {
    token: {
      tokenNumber: string;  // e.g., "BLR-20260201-045"
      patientName: string;
      queueType: string;    // "Optometry" | "Doctor" | "Billing"
    };
  }
  ```
  - [ ] Display token number (text-7xl font, 72px+)
  - [ ] Add QR code generation (for internal tracking)
  - [ ] Add routing info (next station: Optometry / Doctor)
  - [ ] **Ensure NO print button** (completely removed)
  - [ ] Add auto-close timer (10 seconds)

**Afternoon (1:00 PM - 5:00 PM)**:
- [ ] Create: `apps/hospital-portal-web/src/components/frontdesk/WalkInRegistration.tsx`
  - [ ] Patient type selection UI:
    ```typescript
    <div className="patient-type-selector">
      <button>Existing Patient</button>
      <button>New Patient</button>
    </div>
    ```
  - [ ] For Existing Patients:
    - Patient search component
    - Display patient details
    - Show booking mode selector
  - [ ] For New Patients:
    - Open PatientFormModal
    - After save, show booking mode selector

**Evening (5:00 PM - 7:00 PM)**:
- [ ] Implement dual-mode booking UI:
  ```typescript
  <div className="booking-mode-selector">
    <button className="btn-primary">
      ⚡ Quick Book (Next Available Slot)
    </button>
    <button className="btn-secondary">
      📅 Choose Time (Select Slot)
    </button>
  </div>
  ```
- [ ] Quick Book: Show doctor/department selector, then auto-book
- [ ] Choose Time: Open AppointmentFormModal with today's calendar
- [ ] After booking: Redirect to billing payment page

**✅ Deliverables**: TokenDisplay + WalkInRegistration with dual-mode booking

---

#### **Day 5: Queue Management** (6-8 hours)

**Morning (9:00 AM - 12:00 PM)**:
- [ ] Create: `apps/hospital-portal-web/src/components/frontdesk/QueueDisplayTV.tsx`
  ```typescript
  // Large display for waiting area TV
  interface QueueDisplayProps {
    currentToken: string;
    nextTokens: string[];  // Next 5 tokens
    doctorName: string;
    roomNumber: string;
  }
  ```
  - [ ] Large fonts (current token: 10rem, next tokens: 4rem)
  - [ ] Color coding (current: green, next: blue)
  - [ ] Doctor name and room number
  - [ ] Install `socket.io-client` for real-time updates

**Afternoon (1:00 PM - 5:00 PM)**:
- [ ] Add WebSocket connection for real-time queue updates:
  ```typescript
  useEffect(() => {
    const socket = io('http://localhost:5073');
    socket.on('queue-update', (data) => {
      setQueueData(data);
    });
  }, []);
  ```
- [ ] Add auto-refresh fallback (every 5 seconds)
- [ ] Test real-time updates

**Evening (5:00 PM - 7:00 PM)**:
- [ ] Create: `apps/hospital-portal-web/src/components/frontdesk/QueueDashboard.tsx`
  - [ ] Display all queues (Optometry, Doctor, Billing, Pharmacy)
  - [ ] Show waiting count for each queue
  - [ ] Calculate and display average wait time
  - [ ] Add manual action buttons:
    - Call Patient
    - Mark Absent
    - Transfer to Another Queue

**✅ Deliverables**: QueueDisplayTV (real-time) + QueueDashboard (management)

---

#### **Day 6: Reception Services** (6-8 hours)

**Morning (9:00 AM - 12:00 PM)**:
- [ ] Modify: `apps/hospital-portal-web/src/app/dashboard/frontdesk/page.tsx`
  - [ ] Add today's summary widgets:
    ```typescript
    <div className="grid grid-cols-4 gap-4">
      <StatCard title="Total Registrations" value={stats.registrations} />
      <StatCard title="Total Check-Ins" value={stats.checkIns} />
      <StatCard title="In Queue" value={stats.inQueue} />
      <StatCard title="Completed" value={stats.completed} />
    </div>
    ```
  - [ ] Add doctor-wise patient count table
  - [ ] Add department-wise distribution chart

**Afternoon (1:00 PM - 5:00 PM)**:
- [ ] Create: `apps/hospital-portal-web/src/components/frontdesk/InquiryPanel.tsx`
  - [ ] Doctor availability search
  - [ ] Appointment availability calendar (read-only view)
  - [ ] Procedure pricing lookup (search by procedure name)
  - [ ] Department locations map (future enhancement)

**Evening (5:00 PM - 7:00 PM)**:
- [ ] Create: `apps/hospital-portal-web/src/components/frontdesk/VisitorManagement.tsx`
  - [ ] Visitor check-in form (name, patient, purpose)
  - [ ] Visitor check-out button
  - [ ] Active visitors list
  - [ ] Issue visitor pass (print option)

**✅ Deliverables**: Enhanced FrontDeskDashboard + InquiryPanel + VisitorManagement

---

#### **Day 7: Surgery Availability + Reports** (6-8 hours)

**Morning (9:00 AM - 12:00 PM)**:
- [ ] Create: `apps/hospital-portal-web/src/components/frontdesk/SurgeryAvailabilityCheck.tsx`
  - [ ] Surgeon dropdown selector
  - [ ] Date picker (default: today)
  - [ ] Display OT schedule (available/booked slots)
  - [ ] Two modes:
    ```typescript
    <div className="mode-selector">
      <button>Quick Note to Counselor</button>
      <button>Direct Doctor Support</button>
    </div>
    ```

**Afternoon (1:00 PM - 5:00 PM)**:
- [ ] Create: `apps/hospital-portal-web/src/components/frontdesk/OPDReports.tsx`
  - [ ] Date range selector (daily/weekly/monthly)
  - [ ] Report sections:
    - Total registrations (new vs returning)
    - Check-in statistics
    - Doctor-wise patient count (table)
    - Department-wise distribution (pie chart)
    - Peak hours analysis (bar chart)
    - No-show analysis
  - [ ] Export to CSV button (future enhancement)

**Evening (5:00 PM - 7:00 PM)**:
- [ ] Test all components
- [ ] Fix bugs
- [ ] Code review

**✅ Deliverables**: SurgeryAvailabilityCheck + OPDReports

---

#### **Day 8: Frontend Integration + Testing** (6-8 hours)

**Morning (9:00 AM - 12:00 PM)**:
- [ ] Integrate all components into FrontDesk dashboard
- [ ] Test complete workflows:
  - [ ] New patient registration → Print card
  - [ ] Existing patient walk-in → Quick book → Check-in → Token
  - [ ] Check-in validation (all gates)
  - [ ] Emergency override flow

**Afternoon (1:00 PM - 5:00 PM)**:
- [ ] Performance testing:
  - [ ] Patient search speed
  - [ ] Queue display refresh rate
  - [ ] Token generation speed
- [ ] Cross-browser testing (Chrome, Firefox, Edge)
- [ ] Mobile responsiveness check

**Evening (5:00 PM - 7:00 PM)**:
- [ ] Fix bugs
- [ ] Polish UI/UX
- [ ] Code review

**✅ PHASE 1 COMPLETE**: All 8 frontend components built and tested

---

### **PHASE 2: BACKEND IMPLEMENTATION** (Days 9-9.5)

Add missing backend APIs to support frontend functionality.

---

#### **Day 9: Backend APIs** (4 hours)

**Morning (9:00 AM - 1:00 PM)**:

Navigate to backend:
```powershell
cd "C:\Users\Sam Aluri\Downloads\Hospital Portal\microservices\auth-service\AuthService"
```

**APIs to Create** (verify first if they don't exist):

1. **`GET /api/billing/payment-status/{appointmentId}`**
   - [ ] Create in `Controllers/BillingController.cs`
   - [ ] Return: `{ paid: boolean, amount: number, paidAt: timestamp }`
   - [ ] Query opd_bills table for consultation fee payment

2. **`GET /api/appointments/patient/{patientId}/today`**
   - [ ] Add to `Controllers/AppointmentsController.cs`
   - [ ] Filter: `appointmentDate = today AND patientId = {patientId}`
   - [ ] Return: appointment object or null

3. **`GET /api/appointments/next-available-slot`**
   - [ ] Add to `Controllers/AppointmentsController.cs`
   - [ ] Parameters: `doctorId`, `departmentId`, `date`
   - [ ] Logic: Find first available 15-min slot
   - [ ] Return: `{ date, time, doctorId }`

4. **`POST /api/emergency-override`**
   - [ ] Create in `Controllers/EmergencyOverrideController.cs`
   - [ ] Body: `{ patientId, appointmentId, visitId, approvedBy, approverName, reason }`
   - [ ] Insert into `emergency_override_log` table
   - [ ] Return: override record

5. **`GET /api/reports/opd/daily`**
   - [ ] Create in `Controllers/ReportsController.cs`
   - [ ] Parameters: `date`, `branchId`
   - [ ] Aggregate: registrations, check-ins, doctor-wise count, department-wise, peak hours
   - [ ] Return: report object

6. **`GET /api/users/surgeons`**
   - [ ] Add to `Controllers/UsersController.cs`
   - [ ] Filter: `role = "Surgeon" AND status = "active"`
   - [ ] Return: list of surgeons

7. **`GET /api/ot/availability`**
   - [ ] Create in `Controllers/OTController.cs` (or add to existing)
   - [ ] Parameters: `date`, `surgeonId`
   - [ ] Return: OT schedule (available/booked slots)

**Testing**:
- [ ] Test all APIs in Swagger (`http://localhost:5073/swagger`)
- [ ] Test with frontend components

**✅ PHASE 2 COMPLETE**: All missing backend APIs created

---

### **PHASE 3: DATABASE IMPLEMENTATION** (Days 9.5-10)

Create missing database tables.

---

#### **Day 10 (Morning): Database Tables** (2 hours)

**9:00 AM - 11:00 AM**:

Create SQL migration file:
- [ ] Create: `create_module4_tables.sql` in project root

```sql
-- Emergency Override Log
CREATE TABLE emergency_override_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id),
    patient_id UUID NOT NULL REFERENCES patient(id),
    appointment_id UUID REFERENCES appointment(id),
    visit_id UUID REFERENCES visits(id),
    override_type VARCHAR(50) NOT NULL DEFAULT 'PAYMENT_VALIDATION',
    approved_by_user_id UUID NOT NULL REFERENCES users(id),
    approver_name VARCHAR(200) NOT NULL,
    reason TEXT NOT NULL,
    overridden_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by_user_id UUID NOT NULL REFERENCES users(id),
    tenant_id UUID NOT NULL REFERENCES tenant(id)
);

CREATE INDEX idx_emergency_override_tenant ON emergency_override_log(tenant_id);
CREATE INDEX idx_emergency_override_patient ON emergency_override_log(patient_id);
CREATE INDEX idx_emergency_override_date ON emergency_override_log(overridden_at);

-- Visitor Log (Optional)
CREATE TABLE visitor_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id),
    visitor_name VARCHAR(200) NOT NULL,
    visitor_type VARCHAR(50) NOT NULL, -- 'IPD_VISITOR', 'VENDOR', 'SUPPLIER', 'OTHER'
    purpose TEXT,
    patient_id UUID REFERENCES patient(id),
    contact_number VARCHAR(20),
    check_in_time TIMESTAMP NOT NULL DEFAULT NOW(),
    check_out_time TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP,
    created_by_user_id UUID NOT NULL REFERENCES users(id),
    updated_by_user_id UUID REFERENCES users(id),
    deleted_at TIMESTAMP
);

CREATE INDEX idx_visitor_log_tenant ON visitor_log(tenant_id);
CREATE INDEX idx_visitor_log_patient ON visitor_log(patient_id);
CREATE INDEX idx_visitor_log_check_in ON visitor_log(check_in_time);

-- RLS Policies
ALTER TABLE emergency_override_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitor_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON emergency_override_log
FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation ON visitor_log
FOR ALL USING (tenant_id::text = current_setting('app.current_tenant_id', true));
```

**Execute migration**:
```powershell
# Run against Azure PostgreSQL
psql -h <azure-host> -U <user> -d <database> -f create_module4_tables.sql
```

**Or use consolidated script**:
```powershell
cd consolidated
.\run_all.ps1 -RunMigrations
```

**✅ PHASE 3 COMPLETE**: Database tables created

---

### **PHASE 4: SIDEBAR NAVIGATION** (Day 10 - 1 hour)

Update left sidebar to include Module 4 links.

---

#### **Day 10 (11:00 AM - 12:00 PM): Sidebar Navigation**

- [ ] Modify: `apps/hospital-portal-web/src/components/layout/Sidebar.tsx`

Add new menu section for Front Office:

```typescript
const frontOfficeMenuItems = [
  {
    label: 'Front Desk Dashboard',
    href: '/dashboard/frontdesk',
    icon: <HomeIcon />,
  },
  {
    label: 'Patient Registration',
    href: '/dashboard/patients/new',
    icon: <UserPlusIcon />,
  },
  {
    label: 'Check-In',
    href: '/dashboard/frontdesk/check-in',
    icon: <CheckCircleIcon />,
  },
  {
    label: 'Queue Management',
    href: '/dashboard/frontdesk/queue',
    icon: <QueueListIcon />,
  },
  {
    label: 'Queue Display (TV)',
    href: '/dashboard/frontdesk/queue-display',
    icon: <TvIcon />,
  },
  {
    label: 'Visitor Management',
    href: '/dashboard/frontdesk/visitors',
    icon: <UserGroupIcon />,
  },
  {
    label: 'Surgery Availability',
    href: '/dashboard/frontdesk/surgery-availability',
    icon: <CalendarIcon />,
  },
  {
    label: 'OPD Reports',
    href: '/dashboard/frontdesk/reports',
    icon: <ChartBarIcon />,
  },
];
```

- [ ] Add to sidebar navigation:
```typescript
<NavSection title="Front Office" items={frontOfficeMenuItems} />
```

- [ ] Update route file: `apps/hospital-portal-web/src/app/dashboard/frontdesk/layout.tsx`
- [ ] Test all navigation links

**✅ PHASE 4 COMPLETE**: Sidebar navigation updated

---

### **PHASE 5: FINAL TESTING** (Day 10 - 2 hours)

End-to-end testing of complete Module 4.

---

#### **Day 10 (1:00 PM - 3:00 PM): Complete Testing

#### **Day 1: Enhanced Patient Registration - Part 1** (6-8 hours)

**Morning (9:00 AM - 12:00 PM)**:
- [ ] Review existing PhotoCapture in `patients/new/page.tsx`
- [ ] Extract photo capture logic into reusable component
- [ ] Update PatientFormModal.tsx:
  - [ ] Add photo capture section (optional)
  - [ ] Add ID proof upload section (optional)
  - [ ] Display auto-generated MRN after save

**Afternoon (1:00 PM - 5:00 PM)**:
- [ ] Create RegistrationCardPreview.tsx
  - [ ] Install `react-qr-code` and `jsbarcode`
  - [ ] Add QR code generation
  - [ ] Add barcode generation
  - [ ] Add patient photo display
  - [ ] Add demographics section
  - [ ] Style for 3.5" x 2" card format

**Evening (5:00 PM - 7:00 PM)**:
- [ ] Add print button functionality
- [ ] Test registration flow:
  - [ ] Create patient without photo
  - [ ] Create patient with photo
  - [ ] Print registration card
- [ ] Fix bugs

---

#### **Day 2: Enhanced Patient Registration - Part 2** (6-8 hours)

**Morning (9:00 AM - 12:00 PM)**:
- [ ] Add ID proof upload functionality
- [ ] Test photo upload API
- [ ] Test ID proof upload API
- [ ] Validate file size/format

**Afternoon (1:00 PM - 5:00 PM)**:
- [ ] Test complete registration flow
- [ ] Test MRN auto-generation
- [ ] Test registration card print
- [ ] Polish UI/UX

**Evening (5:00 PM - 7:00 PM)**:
- [ ] End-to-end testing
- [ ] Fix bugs
- [ ] Code review

---

#### **Day 3: Check-In Workflow - Part 1** (6-8 hours)

**Morning (9:00 AM - 12:00 PM)**:
- [ ] Create CheckInComponent.tsx
- [ ] Add patient search functionality (MRN/mobile/name)
- [ ] Display patient details
- [ ] Implement Gate 1 validation (consultation fee paid)
- [ ] Implement Gate 2 validation (no outstanding bills)

**Afternoon (1:00 PM - 5:00 PM)**:
- [ ] Add appointment verification
- [ ] Show specific error messages for each gate
- [ ] Add chief complaint input field
- [ ] Add emergency override checkbox

**Evening (5:00 PM - 7:00 PM)**:
- [ ] Implement emergency override logic:
  - [ ] Approval dropdown
  - [ ] Reason text field (min 20 chars)
  - [ ] Log to database
- [ ] Test validation logic

---

#### **Day 4: Check-In Workflow - Part 2** (6-8 hours)

**Morning (9:00 AM - 12:00 PM)**:
- [ ] Create TokenDisplay.tsx
- [ ] Generate token number (Branch-Date-Sequence)
- [ ] Display token (72px+ font size)
- [ ] Add QR code generation
- [ ] **Ensure NO print button**

**Afternoon (1:00 PM - 5:00 PM)**:
- [ ] Create WalkInRegistration.tsx
- [ ] Add patient type selection (Existing/New)
- [ ] Implement Quick Booking button:
  - [ ] Create getNextAvailableSlot API call
  - [ ] Auto-book appointment
  - [ ] Redirect to payment

**Evening (5:00 PM - 7:00 PM)**:
- [ ] Implement Manual Booking button:
  - [ ] Open AppointmentFormModal
  - [ ] Select time slot manually
  - [ ] Redirect to payment
- [ ] Test both booking modes

---

#### **Day 5: Check-In Workflow - Testing** (6-8 hours)

**Morning (9:00 AM - 12:00 PM)**:
- [ ] Test check-in validation:
  - [ ] With appointment + payment → Success
  - [ ] Without appointment → Error
  - [ ] Without fee paid → Error
  - [ ] With outstanding bills → Error
  - [ ] Emergency override → Success

**Afternoon (1:00 PM - 5:00 PM)**:
- [ ] Test walk-in registration (existing patients)
- [ ] Test walk-in registration (new patients)
- [ ] Test quick booking vs manual booking
- [ ] Test token generation and display

**Evening (5:00 PM - 7:00 PM)**:
- [ ] End-to-end flow testing:
  - [ ] New patient → Register → Book → Pay → Check-in → Token
  - [ ] Existing patient → Search → Book → Pay → Check-in → Token
- [ ] Fix bugs
- [ ] Code review

---

### **WEEK 2: Queue Management + Reception Services**

#### **Day 6: Queue Management - Part 1** (6-8 hours)

**Morning (9:00 AM - 12:00 PM)**:
- [ ] Create QueueDisplayTV.tsx
- [ ] Fetch current queue from API
- [ ] Display current token being served
- [ ] Display next 5 tokens
- [ ] Show doctor name, room number

**Afternoon (1:00 PM - 5:00 PM)**:
- [ ] Install `socket.io-client`
- [ ] Implement WebSocket connection
- [ ] Add real-time queue updates
- [ ] Auto-refresh every 5 seconds

**Evening (5:00 PM - 7:00 PM)**:
- [ ] Test queue display
- [ ] Test real-time updates
- [ ] Polish UI (large fonts for TV display)

---

#### **Day 7: Queue Management - Part 2** (6-8 hours)

**Morning (9:00 AM - 12:00 PM)**:
- [ ] Create QueueDashboard.tsx
- [ ] Display all queues (Optometry, Doctor, Billing, etc.)
- [ ] Show waiting patients count
- [ ] Calculate average wait time

**Afternoon (1:00 PM - 5:00 PM)**:
- [ ] Add manual status updates:
  - [ ] Call patient button
  - [ ] Mark absent button
  - [ ] Transfer to another queue
- [ ] Implement PATCH APIs for status updates

**Evening (5:00 PM - 7:00 PM)**:
- [ ] Test queue dashboard
- [ ] Test manual actions
- [ ] Test with multiple patients

---

#### **Day 8: Reception Services** (6-8 hours)

**Morning (9:00 AM - 12:00 PM)**:
- [ ] Enhance FrontDeskDashboard
- [ ] Add today's summary widgets:
  - [ ] Total registrations
  - [ ] Total check-ins
  - [ ] Doctor-wise count
  - [ ] Department-wise distribution

**Afternoon (1:00 PM - 5:00 PM)**:
- [ ] Create InquiryPanel.tsx
- [ ] Add doctor availability search
- [ ] Add appointment availability calendar
- [ ] Add procedure pricing lookup

**Evening (5:00 PM - 7:00 PM)**:
- [ ] Create VisitorManagement.tsx
- [ ] Add visitor check-in/out
- [ ] Test full front desk workflow

---

### **WEEK 3: Advanced Features + Reports**

#### **Day 9: Surgery Availability** (4 hours)

**Morning (9:00 AM - 12:00 PM)**:
- [ ] Create SurgeryAvailabilityCheck.tsx
- [ ] Add surgeon lookup
- [ ] Display OT schedule
- [ ] Add two modes (counselor note / direct doctor)

**Afternoon (1:00 PM - 3:00 PM)**:
- [ ] Test surgery availability workflow
- [ ] Fix bugs

---

#### **Day 10 (1:00 PM - 3:00 PM): Complete Testing**

**End-to-End Workflows**:
- [ ] **Workflow 1: New Patient Walk-In**
  1. Open Front Desk Dashboard
  2. Click "New Patient"
  3. Fill registration form (with photo)
  4. Save → MRN generated
  5. Print registration card
  6. Click "Quick Book" → Auto-assigns slot
  7. Redirect to billing → Pay consultation fee
  8. Return to check-in → Verify dual gates pass
  9. Click "Check-In" → Token generated
  10. Token displays on screen (verify NO print button)
  11. Queue TV updates in real-time

- [ ] **Workflow 2: Existing Patient Walk-In**
  1. Search patient by MRN/mobile
  2. Patient found → Check appointment status
  3. No appointment → Click "Choose Time"
  4. Select time slot manually → Book
  5. Redirect to billing → Pay
  6. Return to check-in → Both gates verified
  7. Check-in → Token generated
  8. Queue dashboard shows patient in queue

- [ ] **Workflow 3: Emergency Override**
  1. Patient has outstanding bills
  2. Check-in blocked by Gate 2
  3. Check "Emergency Case" checkbox
  4. Select approver (Senior Doctor)
  5. Enter reason ("Accident case, critical condition")
  6. Check-in allowed → Token generated
  7. Override logged in database

**Performance Testing**:
- [ ] Patient search: < 1 second for 10,000 records
- [ ] Registration: < 2 minutes with photo
- [ ] Check-in: < 30 seconds
- [ ] Token generation: < 5 seconds
- [ ] Queue display update: < 1 second latency

**Acceptance Criteria Validation**:
- [ ] Patient can register with/without photo (OPTIONAL) ✅
- [ ] MRN auto-generated and registration card printable ✅
- [ ] Walk-in patients: Dual-mode booking (Quick/Manual) ✅
- [ ] Check-in ONLY for booked appointments ✅
- [ ] Check-in validation: BOTH fee paid AND no outstanding ✅
- [ ] Emergency override: Enabled with approval + reason ✅
- [ ] Token DISPLAYED only (NO print button) ✅
- [ ] Queue TV displays current + next 5 tokens ✅
- [ ] Queue dashboard shows real-time status ✅
- [ ] All sidebar links working ✅

**✅ PHASE 5 COMPLETE**: Module 4 fully implemented and tested

---

## 📊 IMPLEMENTATION SUMMARY

### **Sequential Order**:

| Phase | Focus | Days | Deliverables |
|-------|-------|------|--------------|
| **Phase 1** | **Frontend** | 1-8 | 8 components (PatientFormModal, RegistrationCardPreview, CheckInComponent, TokenDisplay, WalkInRegistration, QueueDisplayTV, QueueDashboard, InquiryPanel, VisitorManagement, SurgeryAvailabilityCheck, OPDReports) |
| **Phase 2** | **Backend** | 9 (4h) | 7 APIs (payment-status, patient/today, next-slot, emergency-override, opd/daily, surgeons, ot/availability) |
| **Phase 3** | **Database** | 10 (2h) | 2 tables (emergency_override_log, visitor_log) + RLS policies |
| **Phase 4** | **Sidebar** | 10 (1h) | Navigation menu with 8 links |
| **Phase 5** | **Testing** | 10 (2h) | End-to-end workflows + performance validation |

### **Component File Locations**:

**Frontend Components Created**:
```
apps/hospital-portal-web/src/
├── components/
│   ├── shared/
│   │   └── PhotoCapture.tsx (NEW - reusable)
│   ├── patients/
│   │   ├── PatientFormModal.tsx (MODIFIED - add photo, MRN, print)
│   │   └── RegistrationCardPreview.tsx (NEW - printable MRN card)
│   └── frontdesk/
│       ├── CheckInComponent.tsx (NEW - dual gate validation)
│       ├── TokenDisplay.tsx (NEW - display only, no print)
│       ├── WalkInRegistration.tsx (NEW - dual-mode booking)
│       ├── QueueDisplayTV.tsx (NEW - waiting area TV)
│       ├── QueueDashboard.tsx (NEW - reception queue mgmt)
│       ├── InquiryPanel.tsx (NEW - reception services)
│       ├── VisitorManagement.tsx (NEW - visitor check-in/out)
│       ├── SurgeryAvailabilityCheck.tsx (NEW - OT schedule)
│       └── OPDReports.tsx (NEW - daily reports)
└── app/
    └── dashboard/
        └── frontdesk/
            ├── page.tsx (MODIFIED - add widgets)
            ├── check-in/
            │   └── page.tsx (NEW - check-in page)
            ├── queue/
            │   └── page.tsx (NEW - queue dashboard)
            ├── queue-display/
            │   └── page.tsx (NEW - TV display)
            ├── visitors/
            │   └── page.tsx (NEW - visitor management)
            ├── surgery-availability/
            │   └── page.tsx (NEW - surgery check)
            └── reports/
                └── page.tsx (NEW - OPD reports)
```

**Backend APIs Created**:
```
microservices/auth-service/AuthService/
└── Controllers/
    ├── BillingController.cs (ADD: payment-status endpoint)
    ├── AppointmentsController.cs (ADD: patient/today, next-slot)
    ├── EmergencyOverrideController.cs (NEW)
    ├── ReportsController.cs (NEW - OPD reports)
    └── OTController.cs (NEW or modify existing)
```

**Database Tables Created**:
```sql
- emergency_override_log (NEW)
- visitor_log (NEW)
```

---

## 🗂️ SIDEBAR NAVIGATION STRUCTURE

```
Hospital Portal
├── Dashboard (Home)
├── 📋 Front Office ⭐ NEW SECTION
│   ├── Front Desk Dashboard
│   ├── Patient Registration
│   ├── Check-In
│   ├── Queue Management
│   ├── Queue Display (TV)
│   ├── Visitor Management
│   ├── Surgery Availability
│   └── OPD Reports
├── Patients
│   ├── Patient List
│   └── New Patient
├── Appointments
│   ├── Calendar
│   └── Conflicts
├── Users
│   ├── User List
│   └── Roles & Permissions
├── Departments
├── Branches
└── Settings
```

---

## 🛠️ TECHNICAL REQUIREMENTS

### **npm Packages to Install**:
```powershell
cd apps/hospital-portal-web
pnpm add react-webcam react-qr-code jsbarcode socket.io-client
```

### **Database Tables to Create**:

```sql
-- Emergency Override Log
CREATE TABLE emergency_override_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id),
    patient_id UUID NOT NULL REFERENCES patient(id),
    appointment_id UUID REFERENCES appointment(id),
    visit_id UUID REFERENCES visits(id),
    override_type VARCHAR(50) NOT NULL DEFAULT 'PAYMENT_VALIDATION',
    approved_by_user_id UUID NOT NULL REFERENCES users(id),
    approver_name VARCHAR(200) NOT NULL,
    reason TEXT NOT NULL,
    overridden_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by_user_id UUID NOT NULL REFERENCES users(id)
);

CREATE INDEX idx_emergency_override_tenant ON emergency_override_log(tenant_id);
CREATE INDEX idx_emergency_override_patient ON emergency_override_log(patient_id);

-- Visitor Log (Optional)
CREATE TABLE visitor_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenant(id),
    visitor_name VARCHAR(200) NOT NULL,
    visitor_type VARCHAR(50) NOT NULL,
    purpose TEXT,
    patient_id UUID REFERENCES patient(id),
    contact_number VARCHAR(20),
    check_in_time TIMESTAMP NOT NULL DEFAULT NOW(),
    check_out_time TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP,
    created_by_user_id UUID NOT NULL REFERENCES users(id),
    updated_by_user_id UUID REFERENCES users(id),
    deleted_at TIMESTAMP
);

CREATE INDEX idx_visitor_log_tenant ON visitor_log(tenant_id);
CREATE INDEX idx_visitor_log_patient ON visitor_log(patient_id);
```

### **Backend APIs to Verify/Create**:

**Verify Exist** (should already be there):
- ✅ `GET /api/patients/search`
- ✅ `POST /api/patients`
- ✅ `POST /api/patients/upload-photo`
- ✅ `POST /api/appointments`
- ✅ `GET /api/appointments/conflicts`
- ✅ `POST /api/visits/check-in`
- ✅ `GET /api/visits/queue/{branchId}`
- ✅ `PATCH /api/visits/{id}/station`
- ✅ `GET /api/opdbills/outstanding/{patientId}`

**Create if Missing**:
- ⚠️ `GET /api/billing/payment-status/{appointmentId}` - Check consultation fee paid
- ⚠️ `GET /api/appointments/patient/{patientId}?date=today` - Verify appointment for today
- ⚠️ `GET /api/appointments/next-available-slot` - For quick booking
- ⚠️ `POST /api/emergency-override` - Log emergency override
- ⚠️ `GET /api/reports/opd/daily` - Daily OPD report
- ⚠️ `GET /api/users/surgeons` - List surgeons
- ⚠️ `GET /api/ot/availability` - OT schedule

---

## 🎯 SUCCESS METRICS

### **Performance Targets**:
- Patient Registration: **< 2 minutes** (with photo capture)
- Check-In: **< 30 seconds** (existing patient)
- Token Generation: **< 5 seconds**
- Queue Display: Real-time updates (**< 1 second** latency)
- Patient Search: **< 1 second** for 10,000+ records

### **Acceptance Criteria** (All must pass):
- [ ] Patient can register with/without photo capture and ID proof (OPTIONAL)
- [ ] MRN auto-generated and PRINTED on registration card
- [ ] Walk-in patients: Dual-mode booking (Quick/Manual)
- [ ] Check-in ONLY for patients with booked appointments
- [ ] Check-in validation: BOTH consultation fee paid AND no outstanding bills
- [ ] Emergency override: YES - allowed with approval + reason logging
- [ ] Token generated and DISPLAYED (Print COMPLETELY REMOVED)
- [ ] Waiting area TV displays current token + next 5 tokens in real-time
- [ ] Reception dashboard shows real-time queue status
- [ ] Front desk can handle inquiries
- [ ] Surgery availability can be quickly checked
- [ ] Daily OPD reports available

---

## 📝 FINAL CHECKLIST

### **Before Starting**:
- [ ] Backend running on http://localhost:5073
- [ ] Frontend running on http://localhost:3000
- [ ] npm packages installed (react-webcam, react-qr-code, jsbarcode, socket.io-client)
- [ ] Database tables created (emergency_override_log)
- [ ] Swagger tested (all APIs working)

### **After Completion**:
- [ ] All 8 new components created and tested
- [ ] End-to-end testing passed
- [ ] Performance targets met
- [ ] All acceptance criteria checked
- [ ] Code reviewed
- [ ] Documentation updated
- [ ] **Module 4 Complete** ✅

---

**Document Status**: ✅ **READY TO IMPLEMENT**  
**Total Estimated Time**: 10 days (2 weeks)  
**Start Command**: Say **"START"** to begin Day 1!

---

## 🤝 NOTES & REMINDERS

1. **Photo/ID Capture**: OPTIONAL - registration can proceed without them
2. **Payment Validation**: DUAL HARD GATE - both fee + no outstanding required (unless emergency override)
3. **Token Print**: COMPLETELY REMOVED - display only on screen (72px font)
4. **Registration Card**: Print ENABLED - different from token display
5. **Walk-In Booking**: DUAL MODE - front desk chooses Quick Book or Choose Time based on situation
6. **Reuse Components**: PhotoCapture already exists in `patients/new/page.tsx`
7. **Emergency Override**: Always log in database (approval + reason + timestamp)
