# Day 10: End-to-End Testing Guide
**Phase 1 OPD Workflow Gates - Complete Testing Protocol**

## Overview
This document provides a comprehensive testing protocol for the complete OPD workflow implementation (Days 1-9). It covers all features, hard gates, emergency overrides, and integrations.

## Test Environment Setup

### Prerequisites
- ✅ Backend running on `http://localhost:5073`
- ✅ Frontend running on `http://localhost:3000`
- ✅ PostgreSQL database with latest migrations
- ✅ Test user accounts created (Front Desk, Doctor, Admin)
- ✅ Sample patient data loaded

### Test Data Required
```sql
-- Create test patient
INSERT INTO patients (id, tenant_id, mrn, first_name, last_name, phone, email)
VALUES (
  gen_random_uuid(),
  'your-tenant-id',
  'TEST001',
  'John',
  'Doe',
  '+1234567890',
  'john.doe@test.com'
);

-- Create test doctor
-- (Use existing user or create via UI)

-- Create test service catalog items
INSERT INTO service_catalog (id, tenant_id, code, name, category, base_price, tax_rate)
VALUES
  (gen_random_uuid(), 'your-tenant-id', 'CONS001', 'General Consultation', 'Consultation', 500.00, 18.00),
  (gen_random_uuid(), 'your-tenant-id', 'LAB001', 'Blood Test', 'Laboratory', 300.00, 18.00),
  (gen_random_uuid(), 'your-tenant-id', 'IMG001', 'X-Ray', 'Imaging', 800.00, 18.00);
```

## Test Scenarios

### 1. Complete Workflow Test (Happy Path)

#### 1.1 Patient Check-In (Day 1)
**URL**: `http://localhost:3000/dashboard/patients`

**Steps**:
1. Click on a patient in the directory
2. Click "Check In" button
3. Verify check-in dialog opens
4. Select doctor from dropdown
5. Select appointment type (e.g., "Follow-up")
6. Enter reason for visit
7. Click "Check In" button
8. ✅ **Expected**: Success message, status changes to "Checked In"
9. ✅ **Expected**: Token slip dialog appears (Day 6)

**Test Cases**:
- [ ] Check-in succeeds with valid data
- [ ] Required field validation works
- [ ] Cannot check in same patient twice
- [ ] Status indicator shows "Checked In" badge

#### 1.2 Token Display & Print (Day 6)
**Context**: After successful check-in

**Steps**:
1. Verify token slip dialog displays
2. Check token number is visible (large, prominent)
3. Verify QR code is generated
4. Check patient details are correct
5. Click "Print Token" button
6. ✅ **Expected**: Print preview opens in new window
7. ✅ **Expected**: Layout optimized for 80mm thermal printer
8. Click "Close" to dismiss dialog

**Test Cases**:
- [ ] Token number increments sequentially
- [ ] QR code scans correctly (contains visitId, tokenNumber, patientName, checkedInAt)
- [ ] Print preview shows correct formatting
- [ ] Token sequence resets daily

#### 1.3 Hard Gate: Examination Access (Day 2)
**URL**: Navigate to clinical examination section

**Steps**:
1. Before check-in: Try to access examination tab
2. ✅ **Expected**: Tab is disabled/grayed out
3. ✅ **Expected**: Click shows "Patient must be checked in first" message
4. After check-in: Access examination tab
5. ✅ **Expected**: Tab is enabled and accessible

**Test Cases**:
- [ ] Cannot access examination before check-in
- [ ] Can access examination after check-in
- [ ] Error message is clear and actionable

#### 1.4 Backend Middleware Enforcement (Day 3)
**Context**: Direct API call without check-in

**Test with cURL**:
```bash
# Try to create clinical examination without check-in
curl -X POST http://localhost:5073/api/clinical-examination \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "X-Tenant-ID: YOUR_TENANT_ID" \
  -d '{
    "visitId": "UNCHECKED_VISIT_ID",
    "findings": "Test"
  }'
```

**Expected Response**:
```json
{
  "statusCode": 403,
  "message": "Patient must be checked in before accessing this resource",
  "error": "Forbidden"
}
```

**Test Cases**:
- [ ] API returns 403 for unchecked patients
- [ ] API allows access for checked-in patients
- [ ] Middleware logs access attempts

#### 1.5 Itemized Billing (Days 4 & 7)
**URL**: Navigate to billing section after examination

**Steps**:
1. Click "Generate Bill" button
2. ✅ **Expected**: ItemizedBillingDialog opens
3. Click "Add Service" dropdown
4. Search for "Consultation"
5. Select service
6. Set quantity: 1
7. Set discount: 5%
8. Add notes (optional)
9. Click "Add to Bill"
10. ✅ **Expected**: Service appears in bill items table
11. Repeat for 2-3 services
12. Verify calculations:
    - Subtotal = Sum of (unit price × quantity) before discount
    - Discount = Sum of discount amounts per item
    - Tax = Sum of tax amounts per item
    - Grand Total = Subtotal - Discount + Tax
13. Click "Save Bill"

**Test Cases**:
- [ ] Can add multiple services
- [ ] Calculations are accurate
- [ ] Discount limits enforced (max discount %)
- [ ] Cannot save bill with 0 items
- [ ] Service search works correctly
- [ ] Inline editing updates totals in real-time

#### 1.6 Payment Recording (Day 7)
**Context**: After bill is generated

**Steps**:
1. Click "Record Payment" button
2. ✅ **Expected**: PaymentDialog opens
3. Select payment mode:

**Test Mode: Cash**
- [ ] Enter amount <= balance due
- [ ] Add notes (optional)
- [ ] Click "Submit Payment"
- [ ] Verify payment recorded

**Test Mode: Card**
- [ ] Enter amount
- [ ] Enter last 4 digits (required)
- [ ] Select card network (Visa/Mastercard/etc.)
- [ ] Enter transaction ID
- [ ] Click "Submit Payment"
- [ ] Verify all fields saved

**Test Mode: UPI**
- [ ] Enter amount
- [ ] Enter UPI ID (required, format validation)
- [ ] Enter UPI transaction ID (required)
- [ ] Click "Submit Payment"

**Test Mode: Insurance**
- [ ] Enter amount
- [ ] Enter provider name (required)
- [ ] Enter policy number (required)
- [ ] Enter claim number
- [ ] Click "Submit Payment"

**Test Mode: Credit**
- [ ] Warning message appears
- [ ] Requires supervisor authorization
- [ ] Click "Submit Payment"

**Test Cases**:
- [ ] Cannot pay more than balance due
- [ ] Required fields enforced per payment mode
- [ ] Multiple partial payments allowed
- [ ] Balance due updates correctly
- [ ] Payment history shows all transactions

#### 1.7 Bill Locking (Day 5)
**Context**: After full payment received

**Steps**:
1. Navigate to bill details
2. Verify "Lock Bill" button is visible
3. Click "Lock Bill"
4. ✅ **Expected**: Confirmation dialog appears
5. Confirm lock
6. ✅ **Expected**: Bill status changes to "Locked"
7. ✅ **Expected**: Lock icon appears
8. Try to edit bill
9. ✅ **Expected**: Edit buttons are disabled
10. ✅ **Expected**: "This bill is locked" message shows

**Test Cases**:
- [ ] Can lock bill after payment
- [ ] Cannot edit locked bill
- [ ] Cannot add items to locked bill
- [ ] Cannot delete locked bill
- [ ] Lock timestamp recorded
- [ ] Locked by user ID captured

**Unlock Test**:
1. Click "Unlock Bill" button
2. ✅ **Expected**: Reason dialog appears
3. Enter reason: "Correction needed"
4. Click "Confirm Unlock"
5. ✅ **Expected**: Bill unlocked, audit log entry created
6. Verify bill is editable again

**Test Cases**:
- [ ] Unlock requires reason
- [ ] Unlock logged to audit_log table
- [ ] Only authorized users can unlock

#### 1.8 Auto-Billing Prompt (Day 8)
**Context**: Attempting to complete visit

**Steps**:
1. Navigate to visit details
2. Click "Complete Visit" button
3. ✅ **Expected**: BillingPromptDialog appears if no bill exists

**Scenario A: No Bill Generated**
- [ ] Warning icon shows
- [ ] Status badge: "No Bill Generated" (orange)
- [ ] "Generate Bill" button visible
- [ ] "Proceed to Complete" button disabled
- [ ] Click "Generate Bill" → redirects to billing

**Scenario B: Bill Unpaid**
- [ ] Warning icon shows
- [ ] Status badge: "Payment Pending" (red)
- [ ] Bill details displayed (number, amount, balance due)
- [ ] "View Bill" button visible
- [ ] "Proceed to Complete" button disabled
- [ ] Click "View Bill" → opens bill details

**Scenario C: Bill Paid**
- [ ] Success icon shows
- [ ] Status badge: "Paid" (green)
- [ ] Bill details displayed
- [ ] "Proceed to Complete" button enabled
- [ ] Click proceed → visit completed

**Scenario D: Free Visit**
- [ ] Status badge: "Free Visit" (blue)
- [ ] No payment required
- [ ] "Proceed to Complete" button enabled

**Scenario E: Credit Approved**
- [ ] Status badge: "Credit Approved" (purple)
- [ ] Balance due shown
- [ ] "Proceed to Complete" button enabled

**Test Cases**:
- [ ] Hard gate blocks completion without payment
- [ ] Emergency override works (if allowed)
- [ ] Override requires reason
- [ ] Override logged to audit_log
- [ ] Free visit flag bypasses payment
- [ ] Credit approval bypasses immediate payment

### 2. Emergency Override Tests (Day 2)

#### 2.1 Check-In Override
**Context**: Patient needs urgent examination before formal check-in

**Steps**:
1. Select unchecked patient
2. Try to access examination
3. Click "Emergency Override" button
4. ✅ **Expected**: Override dialog appears
5. Enter reason: "Critical emergency, immediate care needed"
6. Click "Confirm Override"
7. ✅ **Expected**: Access granted temporarily
8. ✅ **Expected**: Warning banner shows "Emergency Override Active"

**Verification**:
```sql
-- Check audit_log table
SELECT * FROM audit_log 
WHERE action = 'emergency_override' 
ORDER BY created_at DESC LIMIT 1;
```

**Test Cases**:
- [ ] Override requires reason (min 10 characters)
- [ ] Override logged with user ID, timestamp, reason
- [ ] Override allows temporary access
- [ ] Warning banner persists until proper check-in

#### 2.2 Billing Override
**Context**: Complete visit without payment in emergency

**Steps**:
1. Attempt to complete visit without payment
2. BillingPromptDialog shows
3. Click "Emergency Override" button
4. ✅ **Expected**: Reason textarea appears
5. Enter reason: "Patient critical condition, billing deferred"
6. Click "Confirm Override"
7. ✅ **Expected**: Visit completes with pending billing flag

**Test Cases**:
- [ ] Override requires substantial reason
- [ ] Override logged separately from regular overrides
- [ ] Billing remains pending for follow-up
- [ ] Report shows overridden visits

### 3. Slot Availability & Conflict Detection (Day 9)

#### 3.1 Real-Time Slot Availability
**URL**: `http://localhost:3000/dashboard/appointments`

**Steps**:
1. Click "New Appointment" button
2. Select doctor
3. Select date
4. ✅ **Expected**: SlotAvailabilityPanel loads
5. Verify slots display:
   - Available slots (green)
   - Booked slots (gray, disabled)
   - Break times (orange badge)
   - Working hours shown
6. Click available slot
7. ✅ **Expected**: Slot turns blue (selected)
8. ✅ **Expected**: Reservation timer starts (5:00 countdown)
9. Wait for auto-refresh (30 seconds)
10. ✅ **Expected**: Availability updates automatically
11. Create another booking in separate tab
12. ✅ **Expected**: Original tab refreshes and shows new booking

**Test Cases**:
- [ ] Slots refresh every 30 seconds
- [ ] Manual refresh works
- [ ] Last updated timestamp accurate
- [ ] Reserved slots expire after 5 minutes
- [ ] Countdown timer displays correctly
- [ ] Multiple users see real-time updates

#### 3.2 Conflict Detection
**Context**: Creating appointment with potential conflicts

**Steps**:
1. Open appointment form
2. Select doctor who has existing appointment
3. Select same date and overlapping time
4. Fill patient details
5. ✅ **Expected**: ConflictDetection component shows warning
6. Verify conflict details:
   - Type: "Doctor Busy"
   - Message: Clear explanation
   - Conflicting appointment ID link
   - Suggested alternative times (up to 5)
7. Click suggested alternative time
8. ✅ **Expected**: Form updates with new time
9. ✅ **Expected**: Conflict warning disappears

**Conflict Types to Test**:
- [ ] Doctor Busy: Overlapping doctor schedule
- [ ] Patient Busy: Patient has another appointment
- [ ] Room Unavailable: Room is booked
- [ ] Outside Hours: Time outside working hours

**Test Cases**:
- [ ] Real-time conflict checking
- [ ] Multiple conflicts displayed
- [ ] Alternative suggestions generated
- [ ] Links to conflicting appointments work

#### 3.3 Walk-In vs Scheduled Differentiation
**Context**: Booking walk-in patient

**Steps**:
1. Click "Walk-In Appointment" button
2. ✅ **Expected**: WalkInBookingDialog opens
3. Notice UI differences:
   - Amber badge: "Walk-In Patient"
   - Alert: "Patient is present and waiting"
   - Simplified patient form (name, phone, email)
   - Priority options include "Urgent"
4. Fill patient details
5. Select doctor
6. ✅ **Expected**: Slot availability panel appears
7. Select immediate/next available slot
8. ✅ **Expected**: Conflict check runs
9. Click "Create Walk-In Appointment"
10. ✅ **Expected**: Appointment created with `appointmentType: 'walk-in'`

**Verification**:
```sql
-- Check appointment type
SELECT id, patient_name, appointment_type, priority, status 
FROM appointments 
WHERE appointment_type = 'walk-in' 
ORDER BY created_at DESC LIMIT 1;
```

**Test Cases**:
- [ ] Walk-in dialog has distinct UI
- [ ] Walk-in patients get priority
- [ ] Walk-in flag persists in database
- [ ] Walk-in appointments show in separate list/filter
- [ ] Can differentiate walk-in vs scheduled in calendar view

#### 3.4 Slot Reservation Timeout
**Context**: Testing 5-minute reservation expiry

**Steps**:
1. Select a time slot
2. ✅ **Expected**: Slot reserved, timer shows 5:00
3. Wait and observe:
   - At 4:30 remaining → Timer shows 4:30
   - At 3:00 remaining → Timer shows 3:00
   - At 1:00 remaining → Warning color (optional)
   - At 0:00 remaining → Slot becomes available again
4. Do NOT complete booking
5. Wait 5 minutes
6. ✅ **Expected**: Slot automatically unreserved
7. ✅ **Expected**: Another user can book same slot

**Test Cases**:
- [ ] Reservation timer accurate
- [ ] Reservation expires exactly at 5 minutes
- [ ] Expired reservation releases slot
- [ ] Visual countdown works
- [ ] Multiple reservations tracked independently

### 4. Backend API Testing

#### 4.1 Endpoint Tests with Swagger
**URL**: `http://localhost:5073/swagger`

**Endpoints to Test**:

**Visits**:
- `GET /api/visits/{id}/token` (Day 6)
  ```json
  {
    "visitId": "uuid",
    "tokenNumber": 42,
    "tokenSequence": "A042",
    "patientName": "John Doe",
    "appointmentType": "Consultation",
    "checkedInAt": "2026-01-31T10:30:00Z",
    "branchName": "Main Branch",
    "status": "Checked In",
    "currentStation": "Waiting Room"
  }
  ```

**OPD Bills**:
- `GET /api/OpdBills/visit-billing-status/{visitId}` (Day 8)
  ```json
  {
    "hasBill": true,
    "isPaid": false,
    "isLocked": false,
    "isFreeVisit": false,
    "isCredit": false,
    "balanceDue": 250.00,
    "netAmount": 1000.00,
    "amountPaid": 750.00,
    "billNumber": "BILL-001",
    "billId": "uuid",
    "status": "Partial",
    "canComplete": false,
    "message": "Outstanding balance of ₹250.00 must be paid before visit completion"
  }
  ```

**Appointments**:
- `GET /api/appointments/doctor/{doctorId}/availability?date=2026-01-31` (Day 9)
- `POST /api/appointments/check-conflicts` (Day 9)

**Test Cases**:
- [ ] All new endpoints return 200 OK
- [ ] Response format matches DTOs
- [ ] Authorization works (401 without token)
- [ ] Tenant isolation works (403 for wrong tenant)
- [ ] Validation errors return 400
- [ ] Not found returns 404

#### 4.2 Database Integrity
**SQL Queries**:

```sql
-- Verify token generation
SELECT id, token_number, token_sequence, checked_in_at 
FROM visits 
WHERE status = 'Checked In' 
ORDER BY checked_in_at DESC LIMIT 10;

-- Verify bill locking
SELECT id, bill_number, is_locked, locked_at, locked_by_user_id 
FROM opd_bills 
WHERE is_locked = true;

-- Verify audit logs
SELECT * FROM audit_log 
WHERE action IN ('emergency_override', 'bill_locked', 'bill_unlocked') 
ORDER BY created_at DESC;

-- Verify itemized billing
SELECT b.bill_number, bi.service_code, bi.service_name, 
       bi.quantity, bi.unit_price, bi.discount_amount, 
       bi.tax_amount, bi.total_amount
FROM opd_bills b
JOIN opd_bill_items bi ON b.id = bi.bill_id
ORDER BY b.created_at DESC;
```

**Test Cases**:
- [ ] Token numbers sequential
- [ ] Bill lock timestamps accurate
- [ ] Audit logs complete
- [ ] Bill item calculations match

### 5. Performance & Load Testing

#### 5.1 Concurrent Operations
**Scenario**: Multiple users booking same slot

**Test Script**:
```bash
# Use Apache Bench or similar
ab -n 100 -c 10 -H "Authorization: Bearer TOKEN" \
  -H "X-Tenant-ID: TENANT_ID" \
  -p appointment.json \
  http://localhost:5073/api/appointments

# Only ONE booking should succeed, others get conflict errors
```

**Test Cases**:
- [ ] No double-booking occurs
- [ ] Conflict detection prevents duplicates
- [ ] Database transactions isolated
- [ ] No race conditions

#### 5.2 Real-Time Updates
**Scenario**: Slot availability updates across clients

**Steps**:
1. Open 2 browser windows
2. Both navigate to slot availability panel
3. In Window 1: Book a slot
4. ✅ **Expected**: Window 2 refreshes within 30 seconds
5. ✅ **Expected**: Booked slot now unavailable in Window 2

### 6. Error Handling & Edge Cases

#### 6.1 Network Failures
**Test Cases**:
- [ ] Graceful degradation when API offline
- [ ] Retry logic works
- [ ] Error messages user-friendly
- [ ] No data loss on connection drop

#### 6.2 Invalid Data
**Test Cases**:
- [ ] Empty form submissions blocked
- [ ] Invalid dates rejected
- [ ] Negative amounts prevented
- [ ] SQL injection attempts blocked
- [ ] XSS attempts sanitized

#### 6.3 Boundary Conditions
**Test Cases**:
- [ ] Maximum discount percentage enforced
- [ ] Minimum payment amount enforced (if any)
- [ ] Token number rollover at day boundary
- [ ] Slot reservation at exactly working hours end

## Test Reports

### Test Execution Checklist

#### Days 1-2: Check-In & Hard Gates
- [ ] Check-in dialog functional
- [ ] Hard gates enforce rules
- [ ] Emergency override works
- [ ] Audit logging complete

#### Days 3-5: Backend & Billing
- [ ] Middleware enforces check-in
- [ ] Itemized billing accurate
- [ ] Bill locking works
- [ ] Unlock requires reason

#### Days 6-8: Token & Auto-Billing
- [ ] Token generation sequential
- [ ] QR codes scan correctly
- [ ] Print layout correct
- [ ] Auto-billing prompt blocks completion
- [ ] Payment validation works

#### Day 9: Slot Management
- [ ] Real-time availability works
- [ ] Conflict detection accurate
- [ ] Walk-in differentiation clear
- [ ] Slot reservations expire correctly

### Issue Tracking Template

```markdown
## Issue #N: [Brief Description]

**Severity**: Critical / High / Medium / Low
**Component**: Check-In / Billing / Slots / etc.
**Test Case**: [Reference to test case]

**Steps to Reproduce**:
1. Step 1
2. Step 2
3. Step 3

**Expected Result**: [What should happen]
**Actual Result**: [What actually happened]

**Environment**:
- Browser: Chrome 120
- OS: Windows 11
- Backend Version: 1.0.0
- Frontend Version: 0.1.0

**Screenshots**: [Attach if applicable]

**Logs**:
```
[Backend logs]
[Browser console logs]
```

**Priority**: [Next release / Future]
```

## Sign-Off Criteria

### Must Pass (Blocking Issues)
- [ ] Complete workflow works end-to-end
- [ ] Hard gates enforce business rules
- [ ] Payment calculations accurate
- [ ] No data loss or corruption
- [ ] Security: Authorization works
- [ ] Security: Tenant isolation works

### Should Pass (Non-Blocking)
- [ ] All UI elements render correctly
- [ ] Real-time updates work
- [ ] Performance acceptable (<2s page load)
- [ ] Error messages clear

### Nice to Have
- [ ] Animations smooth
- [ ] Print layout perfect
- [ ] Mobile responsive (if applicable)

## Final Validation

### Stakeholder Demo Script
**Duration**: 30 minutes

**Agenda**:
1. **Overview** (5 min): Explain workflow gates
2. **Live Demo** (15 min):
   - Check in patient → Token → Examination
   - Generate bill → Record payment → Lock bill
   - Complete visit with billing validation
   - Show walk-in booking with slot availability
3. **Q&A** (10 min): Address questions

### Acceptance Criteria
- [ ] All 10 days implemented
- [ ] All tests passing
- [ ] No critical bugs
- [ ] Documentation complete
- [ ] Stakeholder approval obtained

---

**Testing Period**: February 3-14, 2026
**Tester**: [Your Name]
**Last Updated**: January 31, 2026
**Status**: Ready for Testing
