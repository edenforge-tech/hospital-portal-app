# Front Desk Module - Gap Analysis & Implementation Plan
**Date**: Jan 31, 2026  
**Status**: Patient Search Fixed ✅ | Other APIs Pending ⏳

## ✅ FIXED - Patient Search Issue

### Problem
- Check-in and Walk-in Booking pages were calling `/api/patients/search` endpoint that didn't exist
- Frontend made 4 parallel API calls with different search types (mrn, mobile, name, email)
- **Result**: Shows "No patients found for 'Sam'" even though patient exists

### Solution Implemented
**Added to Backend**:
1. **PatientsController.cs**: Added `GET /api/patients/search` endpoint
2. **PatientService.cs**: Implemented `SearchPatientsAsync` method with:
   - Multi-field search (name, MRN, mobile, email)
   - Case-insensitive matching
   - Tenant isolation
   - Soft delete filtering
   - Results limited to 20 records
   - Proper ordering

**Endpoint Details**:
```csharp
GET /api/patients/search?searchTerm=Sam&searchType=name
// searchType options: "all", "name", "mrn", "mobile", "email"
```

**Status**: ✅ Backend rebuilt and running on http://localhost:5073

---

## ⏳ PENDING - Missing Backend APIs

### 1. Queue Management APIs
**Frontend Component**: `QueueDashboard.tsx`

#### Missing Endpoints:
```typescript
GET /api/queue/all                      // Get all queue items
POST /api/queue/{id}/call               // Call patient to consultation
POST /api/queue/{id}/mark-absent        // Mark patient as absent
POST /api/queue/{id}/transfer           // Transfer patient to another department
```

**Expected Data Model**:
```typescript
interface QueueItem {
  id: string;
  patientId: string;
  patientName: string;
  mrn: string;
  tokenNumber: string;
  department: string;
  doctor: string;
  appointmentTime: string;
  status: 'waiting' | 'called' | 'in-consultation' | 'completed' | 'absent';
  queuePosition: number;
  waitingTime: number; // minutes
  priority: 'normal' | 'urgent' | 'emergency';
}
```

**Database Table**: 
- Likely `appointment` table with status tracking
- Need to add queue-specific columns or create `queue` table

---

### 2. Visitor Management APIs
**Frontend Component**: `VisitorManagement.tsx`

#### Missing Endpoints:
```typescript
GET /api/visitors/active                // Get all active visitors
POST /api/visitors/check-in             // Check in a visitor
POST /api/visitors/{id}/check-out       // Check out a visitor
```

**Expected Data Model**:
```typescript
interface Visitor {
  id: string;
  name: string;
  phone: string;
  purpose: 'patient-visit' | 'consultation' | 'document-submission' | 'other';
  patientToVisit?: string;
  checkInTime: string;
  checkOutTime?: string;
  status: 'checked-in' | 'checked-out';
  remarks?: string;
}
```

**Database Table**: ✅ `visitor_log` (already created)
- Columns: id, tenant_id, visitor_name, visitor_phone, purpose, patient_id, check_in_time, check_out_time, status, remarks
- RLS policies: ✅ Active
- Triggers: ✅ Configured

---

### 3. Surgery Availability APIs
**Frontend Component**: `SurgeryAvailabilityCheck.tsx`

#### Endpoints Needed:
```typescript
GET /api/users/surgeons                 // ✅ EXISTS (verified)
GET /api/ot/availability                // ⏳ MISSING - OT schedule lookup
POST /api/surgery/quick-note            // ⏳ MISSING - Add note for surgery
POST /api/surgery/direct-request        // ⏳ MISSING - Direct surgery request
```

**Expected Data Model**:
```typescript
interface OTAvailability {
  surgeonId: string;
  surgeonName: string;
  date: string;
  slots: {
    time: string;
    status: 'available' | 'booked' | 'blocked';
    operationTheatre: string;
    procedureName?: string;
  }[];
}
```

**Database Tables**:
- Need `operation_theatre` table
- Need `surgery_schedule` table
- Link to existing `user` table for surgeons

---

### 4. OPD Reports APIs
**Frontend Component**: `OPDReports.tsx`

#### Missing Endpoint:
```typescript
GET /api/reports/opd/{dateRange}?date={selectedDate}
// dateRange: 'today' | 'week' | 'month' | 'custom'
```

**Expected Response**:
```typescript
interface OPDReportStats {
  totalAppointments: number;
  completedConsultations: number;
  pendingConsultations: number;
  cancelledAppointments: number;
  newRegistrations: number;
  revenue: number;
  departmentWise: {
    department: string;
    appointments: number;
    revenue: number;
  }[];
  doctorWise: {
    doctorName: string;
    appointments: number;
    consultations: number;
  }[];
}
```

**Database Queries**:
- Aggregate from `appointment` table
- Join with `opd_bill` table for revenue
- Group by department, doctor, date range

---

### 5. Inquiry Panel APIs
**Frontend Component**: `InquiryPanel.tsx`

#### Missing Endpoints:
```typescript
GET /api/users/doctors/availability?search={doctorSearch}
GET /api/appointments/today?departmentId={deptId}&date={date}
GET /api/procedures/pricing?search={procedureSearch}
```

**Expected Data Models**:
```typescript
interface DoctorAvailability {
  id: string;
  name: string;
  department: string;
  specialization: string;
  isAvailable: boolean;
  nextAvailableSlot?: string;
  consultationFee: number;
}

interface ProcedurePricing {
  id: string;
  name: string;
  department: string;
  basePrice: number;
  currency: string;
  duration?: number; // minutes
}
```

---

### 6. Check-In Validation APIs
**Frontend Component**: `CheckInComponent.tsx`

#### Endpoints in Use:
```typescript
GET /api/billing/payment-status/{appointmentId}   // ⏳ VERIFY
GET /api/opdbills/outstanding/{patientId}         // ✅ IMPLEMENTED
POST /api/emergency-override                      // ✅ IMPLEMENTED
POST /api/visits/check-in                         // ⏳ MISSING
```

**Missing Visit Check-In API**:
```csharp
POST /api/visits/check-in
{
  "appointmentId": "guid",
  "patientId": "guid",
  "checkInTime": "datetime",
  "tokenNumber": "string",
  "queuePosition": number
}
```

**Database Table**: `visit` (if exists) or use `appointment` table to track check-in status

---

## 📊 Implementation Priority

### **CRITICAL (Blocking User Workflows)**:
1. ✅ Patient Search API - **DONE**
2. ⏳ Visit Check-In API - Blocks check-in flow
3. ⏳ Queue Management APIs - Core front desk function

### **HIGH (Major Features)**:
4. ⏳ Visitor Management APIs - Database ready, needs controller
5. ⏳ OPD Reports API - Analytics for front desk

### **MEDIUM (Enhancement Features)**:
6. ⏳ Surgery Availability APIs - Requires new tables
7. ⏳ Inquiry Panel APIs - Doctor/procedure lookup
8. ⏳ Billing Payment Status API - Check existing implementation

---

## 🔍 Verification Needed

### Existing APIs to Test:
```typescript
✅ GET /api/patients/search           - NEWLY ADDED
✅ GET /api/users/surgeons            - CONFIRMED EXISTS
✅ GET /api/opdbills/outstanding/{id} - CONFIRMED EXISTS
✅ POST /api/emergency-override       - CONFIRMED EXISTS
✅ GET /api/departments               - CONFIRMED EXISTS
✅ GET /api/users (with role filter)  - CONFIRMED EXISTS
✅ GET /api/appointments/next-available-slot - CONFIRMED EXISTS
✅ POST /api/appointments             - CONFIRMED EXISTS

⏳ GET /api/billing/payment-status/{id} - NEEDS VERIFICATION
⏳ POST /api/visits/check-in            - NEEDS IMPLEMENTATION
⏳ All Queue APIs                       - NEEDS IMPLEMENTATION
⏳ All Visitor APIs                     - NEEDS IMPLEMENTATION
⏳ All Surgery APIs (except surgeons)   - NEEDS IMPLEMENTATION
⏳ OPD Reports API                      - NEEDS IMPLEMENTATION
⏳ Inquiry APIs                         - NEEDS IMPLEMENTATION
```

---

## 📝 Next Steps

### Immediate (Next 30 minutes):
1. Test patient search in Check-in and Walk-in Booking pages
2. Verify `/api/billing/payment-status/{id}` endpoint exists
3. Check database schema for `visit`, `queue`, `operation_theatre` tables
4. Document exact DTO structures needed for each API

### Short-term (Next 2 hours):
1. Implement Visit Check-In API
2. Implement Queue Management APIs (4 endpoints)
3. Implement Visitor Management APIs (3 endpoints)

### Medium-term (Next day):
1. Implement OPD Reports API
2. Implement Surgery Availability APIs
3. Implement Inquiry Panel APIs
4. End-to-end testing of all Front Office workflows

---

## 🎯 Success Criteria

**Front Desk Module 100% Complete When**:
- ✅ All 8 pages load without errors
- ✅ Patient search works in Check-in and Walk-in Booking
- ✅ Check-in flow validates payment and bills
- ✅ Queue management dashboard functional
- ✅ Visitor check-in/out operational
- ✅ Surgery availability lookup works
- ✅ OPD reports generate correctly
- ✅ Zero console errors in frontend
- ✅ All APIs return proper responses (200/400/401/403/500)

---

## 📁 Database Tables Status

**Existing Tables (Ready)**:
- ✅ `patient` - Patient data
- ✅ `appointment` - Appointments
- ✅ `opd_bill` - Billing
- ✅ `emergency_override_log` - Emergency overrides
- ✅ `visitor_log` - Visitor tracking
- ✅ `user` - Doctors, staff
- ✅ `department` - Department data

**Missing Tables (Needed)**:
- ⏳ `queue` or queue-related columns in `appointment`
- ⏳ `visit` or visit tracking in `appointment`
- ⏳ `operation_theatre` - OT information
- ⏳ `surgery_schedule` - Surgery bookings
- ⏳ `procedure` - Procedure catalog with pricing

---

**Last Updated**: Jan 31, 2026 - After patient search fix
**Backend Status**: Running on http://localhost:5073 with patient search endpoint
**Frontend Status**: Running on http://localhost:3000
