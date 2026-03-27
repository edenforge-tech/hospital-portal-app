# Module 4 - End-to-End Testing Guide 🧪

**Date**: February 5, 2026  
**Status**: IN PROGRESS  
**Duration**: 3 hours (estimated)

---

## 📋 TESTING PREREQUISITES

### **1. Start Backend Server**

```powershell
cd "C:\Users\Sam Aluri\Downloads\Hospital Portal\microservices\auth-service\AuthService"
dotnet run
```

**Expected Output**:
```
✓ SignalR hubs mapped (NotificationHub, CapacityHub, QueueHub)
Now listening on: http://localhost:5073
Now listening on: https://localhost:7285
```

**Verify**: Open `http://localhost:5073/swagger` → Should load Swagger UI

---

### **2. Start Frontend Server**

```powershell
cd "C:\Users\Sam Aluri\Downloads\Hospital Portal\apps\hospital-portal-web"
pnpm dev
```

**Expected Output**:
```
- ready started server on 0.0.0.0:3000, url: http://localhost:3000
- event compiled client and server successfully
```

**Verify**: Open `http://localhost:3000` → Should load login page

---

### **3. Test Credentials**

| Email | Password | Role |
|-------|----------|------|
| admin@test.com | Test@123456 | System Administrator |
| receptionist@test.com | Test@123456 | Receptionist |
| doctor@test.com | Test@123456 | Doctor |

**Tenant ID**: `155fe198-6ae5-4a01-9254-ead5b427247e`

---

### **4. Login to Frontend**

1. Open `http://localhost:3000/login`
2. Enter:
   - Email: `receptionist@test.com`
   - Password: `Test@123456`
3. Click "Login"
4. Verify redirect to dashboard

---

### **5. Get Test Data IDs**

Open browser console (F12) and run:

```javascript
// Get current tenant and branch IDs
const tenantId = localStorage.getItem('tenantId');
const branchId = localStorage.getItem('branchId');
console.log('Tenant ID:', tenantId);
console.log('Branch ID:', branchId);
```

**Alternative**: Use Swagger to get IDs:
- **GET /api/tenants** → Get tenant ID
- **GET /api/branches** → Get branch ID
- **GET /api/patients** → Get patient ID
- **GET /api/departments** → Get department ID

---

## 🧪 TEST SUITE 1: CHECK-IN WORKFLOW (1 hour)

### **Test 1.1: Successful Check-In** ✅

**Scenario**: Patient with appointment, fee paid, no outstanding bills

**Prerequisites**:
1. Create test patient via Swagger:
   - **POST /api/patients**
   ```json
   {
     "firstName": "John",
     "lastName": "Doe",
     "dateOfBirth": "1990-01-01",
     "gender": "Male",
     "mobileNumber": "9876543210",
     "email": "john.doe@test.com",
     "address": "123 Test Street"
   }
   ```
   - Copy patient ID from response

2. Create appointment for today:
   - **POST /api/appointments**
   ```json
   {
     "patientId": "{PATIENT_ID}",
     "doctorId": "{DOCTOR_ID}",
     "departmentId": "{DEPARTMENT_ID}",
     "appointmentDate": "2026-02-05T00:00:00Z",
     "startTime": "10:00:00",
     "endTime": "10:30:00",
     "appointmentType": "New",
     "status": "Confirmed"
   }
   ```
   - Copy appointment ID

3. Mark consultation fee as paid:
   - **POST /api/opdbills**
   ```json
   {
     "appointmentId": "{APPOINTMENT_ID}",
     "patientId": "{PATIENT_ID}",
     "totalAmount": 500,
     "paidAmount": 500,
     "status": "Paid",
     "paymentMethod": "Cash"
   }
   ```

**Test Steps**:
1. **Frontend**: Navigate to `/dashboard/frontdesk/check-in`
2. Click "Check In" tab
3. Enter patient mobile number: `9876543210`
4. Click "Search Patient"
5. Verify patient details display
6. Click "Verify & Check In"

**Expected Result**:
- ✅ Gate 1 validation passes (fee paid)
- ✅ Gate 2 validation passes (no outstanding)
- ✅ Appointment verification passes (has today's appointment)
- ✅ Token generated (e.g., "BLR-001")
- ✅ Success message: "Patient checked in successfully"
- ✅ Queue entry created in database

**Verification**:
```javascript
// Check queue via Swagger: GET /api/queue/all?branchId={BRANCH_ID}
// Should see new queue item with status: "waiting"
```

---

### **Test 1.2: Check-In Without Appointment** ❌

**Scenario**: Patient tries to check in without today's appointment

**Prerequisites**:
- Use same patient from Test 1.1
- Delete today's appointment or use future date

**Test Steps**:
1. Navigate to `/dashboard/frontdesk/check-in`
2. Enter patient mobile: `9876543210`
3. Click "Search Patient"
4. Click "Verify & Check In"

**Expected Result**:
- ❌ Appointment verification fails
- ❌ Error message: "No appointment booked for today"
- ❌ Check-in blocked
- ✅ Emergency override option displayed

**Verification**: No queue entry created

---

### **Test 1.3: Check-In Without Fee Paid** ❌

**Scenario**: Patient has appointment but consultation fee not paid

**Prerequisites**:
1. Create new patient and appointment (same as Test 1.1)
2. **DO NOT** create OPD bill (skip fee payment)

**Test Steps**:
1. Navigate to `/dashboard/frontdesk/check-in`
2. Enter patient mobile
3. Click "Verify & Check In"

**Expected Result**:
- ❌ Gate 1 validation fails
- ❌ Error message: "Consultation fee not paid"
- ❌ Prompt: "Please collect ₹500 consultation fee"
- ❌ Check-in blocked
- ✅ Emergency override option displayed

---

### **Test 1.4: Check-In With Outstanding Bills** ❌

**Scenario**: Patient has outstanding bills from previous visits

**Prerequisites**:
1. Create patient with appointment and fee paid (Test 1.1 setup)
2. Create unpaid bill:
   - **POST /api/opdbills**
   ```json
   {
     "patientId": "{PATIENT_ID}",
     "totalAmount": 2000,
     "paidAmount": 0,
     "status": "Unpaid",
     "description": "Previous consultation"
   }
   ```

**Test Steps**:
1. Navigate to `/dashboard/frontdesk/check-in`
2. Enter patient mobile
3. Click "Verify & Check In"

**Expected Result**:
- ❌ Gate 2 validation fails
- ❌ Error message: "Outstanding bills: ₹2000"
- ❌ List of unpaid bills displayed
- ❌ Check-in blocked
- ✅ Emergency override option displayed

---

### **Test 1.5: Emergency Override** ✅

**Scenario**: Front desk uses emergency override for urgent patient

**Prerequisites**:
- Patient fails one of the validations (Test 1.2, 1.3, or 1.4)

**Test Steps**:
1. After validation fails, click "Emergency Override"
2. Enter reason: "Patient in critical condition - eye injury"
3. Click "Override & Check In"

**Expected Result**:
- ✅ Check-in succeeds despite failed validation
- ✅ Token generated
- ✅ Emergency override logged in `emergency_override_log` table
- ✅ Success message with warning about override

**Verification via Swagger**:
```sql
-- GET /api/emergency-overrides (if endpoint exists)
-- Or check database directly:
SELECT * FROM emergency_override_log ORDER BY created_at DESC LIMIT 1;
```

**Expected database entry**:
- patient_id: {PATIENT_ID}
- override_reason: "Patient in critical condition - eye injury"
- override_type: "check_in"
- approved_by_user_id: {RECEPTIONIST_USER_ID}

---

## 🧪 TEST SUITE 2: WALK-IN BOOKING (30 minutes)

### **Test 2.1: Existing Patient Quick Book** ✅

**Scenario**: Existing patient walks in, needs immediate appointment

**Prerequisites**:
- Existing patient (use from Test 1.1)
- Available doctor slots

**Test Steps**:
1. Navigate to `/dashboard/frontdesk/walk-in-booking`
2. Click "Walk-In Booking" tab
3. Enter patient mobile: `9876543210`
4. Click "Search Patient"
5. Verify patient details auto-populate
6. Select department: "Ophthalmology"
7. Click "Quick Book" (auto-assign next available slot)

**Expected Result**:
- ✅ Next available slot fetched from backend
- ✅ Appointment created with today's date
- ✅ Slot assigned automatically (e.g., 11:00 AM)
- ✅ Redirect to billing page with consultation fee
- ✅ Success message: "Appointment booked for 11:00 AM"

**Verification**:
```javascript
// Swagger: GET /api/appointments/patient/{patientId}
// Should show new appointment for today
```

---

### **Test 2.2: Existing Patient Manual Book** ✅

**Scenario**: Patient wants specific time slot

**Prerequisites**:
- Existing patient

**Test Steps**:
1. Navigate to `/dashboard/frontdesk/walk-in-booking`
2. Search patient
3. Select department: "Ophthalmology"
4. Click "Choose Slot" (manual selection)
5. Select doctor from dropdown
6. Select available time slot (e.g., 2:00 PM)
7. Click "Book Appointment"

**Expected Result**:
- ✅ Available slots displayed for selected doctor
- ✅ Appointment created with chosen slot
- ✅ Redirect to billing
- ✅ Success message with confirmed time

---

### **Test 2.3: New Patient Walk-In** ✅

**Scenario**: New patient (not in system) walks in

**Test Steps**:
1. Navigate to `/dashboard/frontdesk/walk-in-booking`
2. Enter mobile: `8765432109` (new number)
3. Click "Search Patient"
4. Verify "Patient not found" message
5. Click "Register New Patient"
6. Fill registration form:
   - First Name: Jane
   - Last Name: Smith
   - DOB: 1985-05-15
   - Gender: Female
   - Mobile: 8765432109
   - Email: jane.smith@test.com
7. Click "Save & Continue"
8. Select department
9. Click "Quick Book"

**Expected Result**:
- ✅ New patient created in database
- ✅ Appointment auto-booked
- ✅ Redirect to billing
- ✅ Full workflow completes seamlessly

**Verification**:
```javascript
// Swagger: GET /api/patients?mobileNumber=8765432109
// Should return Jane Smith
```

---

## 🧪 TEST SUITE 3: QUEUE MANAGEMENT (1 hour)

### **Test 3.1: Patient Check-In Creates Queue Entry** ✅

**Scenario**: Verify queue entry created on check-in

**Prerequisites**:
- Patient with valid appointment and fee paid

**Test Steps**:
1. Check in patient (use Test 1.1)
2. Navigate to `/dashboard/frontdesk/queue`
3. Verify patient appears in queue

**Expected Result**:
- ✅ Patient appears in "Optometry Queue" (or relevant queue)
- ✅ Token number displayed (e.g., "BLR-001")
- ✅ Wait time shows (e.g., "0 min")
- ✅ Status: "Waiting"
- ✅ Patient name and mobile visible

---

### **Test 3.2: Call Patient → Queue TV Updates** ✅

**Scenario**: Test real-time SignalR updates

**Prerequisites**:
- Patient in queue (from Test 3.1)
- Open Queue TV in separate tab

**Test Steps**:
1. **Tab 1**: Navigate to `/dashboard/frontdesk/queue`
2. **Tab 2**: Navigate to `/dashboard/frontdesk/queue-tv?branchId={BRANCH_ID}&queueType=Doctor`
3. **Tab 1**: Click "Call Patient" for first patient in queue
4. Enter room number: "R-101"
5. Confirm call

**Expected Result**:
- ✅ **Tab 1 (Dashboard)**: Patient status changes to "Called"
- ✅ **Tab 2 (Queue TV)**: Current token updates immediately (<1s)
- ✅ **Tab 2**: Shows "NOW SERVING: BLR-001"
- ✅ **Tab 2**: Shows doctor name and room "R-101"
- ✅ **Console logs**: "Token called" message in both tabs

**Verification**:
- Check browser console for SignalR events:
  ```
  Queue Dashboard: Token called {tokenNumber: "BLR-001", ...}
  Queue Display: Token called {tokenNumber: "BLR-001", roomNumber: "R-101"}
  ```

---

### **Test 3.3: Mark Patient Absent** ✅

**Scenario**: Patient doesn't respond to call

**Prerequisites**:
- Patient in "Waiting" status

**Test Steps**:
1. Navigate to `/dashboard/frontdesk/queue`
2. Click "Absent" button for any patient
3. Confirm action

**Expected Result**:
- ✅ Patient removed from waiting queue
- ✅ Status changed to "Absent"
- ✅ Absent count increments in stats
- ✅ Queue refreshes (patient disappears from list)

**Verification**:
```javascript
// Swagger: GET /api/queue/all?branchId={BRANCH_ID}
// Patient should have status: "absent"
```

---

### **Test 3.4: Transfer Patient to Another Queue** ✅

**Scenario**: Patient needs to move to different queue (e.g., Optometry → Doctor)

**Prerequisites**:
- Patient in Optometry queue

**Test Steps**:
1. Navigate to `/dashboard/frontdesk/queue`
2. Find patient in "Optometry Queue"
3. Click "Transfer" button
4. Select destination queue: "Doctor"
5. Click "Confirm Transfer"

**Expected Result**:
- ✅ Patient removed from Optometry queue
- ✅ Patient appears in Doctor queue
- ✅ Token number preserved
- ✅ Stats update (Optometry -1, Doctor +1)

---

### **Test 3.5: Real-Time Updates Across Multiple Clients** ✅

**Scenario**: Verify all connected clients receive updates

**Prerequisites**:
- 3 browser tabs/windows open

**Test Steps**:
1. **Window 1**: `/dashboard/frontdesk/queue` (Dashboard)
2. **Window 2**: `/dashboard/frontdesk/queue-tv?queueType=Doctor` (Queue TV 1)
3. **Window 3**: `/dashboard/frontdesk/queue-tv?queueType=Doctor` (Queue TV 2)
4. **Window 1**: Call a patient

**Expected Result**:
- ✅ All 3 windows update simultaneously
- ✅ Window 1: Queue list refreshes
- ✅ Window 2: Token changes
- ✅ Window 3: Token changes (same as Window 2)
- ✅ Latency: <1 second across all windows

**Verification**: Check console logs in all windows for SignalR events

---

## 🧪 TEST SUITE 4: OPD REPORTS (30 minutes)

### **Test 4.1: Daily OPD Report** ✅

**Scenario**: Generate today's OPD report

**Prerequisites**:
- At least 3 appointments for today (created in previous tests)

**Test Steps**:
1. Navigate to `/dashboard/frontdesk/reports`
2. Select "Daily Report"
3. Select date: Today (2026-02-05)
4. Select branch
5. Click "Generate Report"

**Expected Result**:
- ✅ Report displays:
  - Total appointments: 3+
  - Completed: X
  - Cancelled: Y
  - No-show: Z
- ✅ Peak hours chart shows hourly distribution
- ✅ Department-wise breakdown
- ✅ Export to PDF/Excel option available

**Verification via Swagger**:
```javascript
// GET /api/reports/opd/daily?branchId={BRANCH_ID}&date=2026-02-05
```

**Expected Response**:
```json
{
  "date": "2026-02-05",
  "totalAppointments": 5,
  "completed": 2,
  "cancelled": 0,
  "noShow": 1,
  "peakHours": [
    { "hour": 10, "count": 3 },
    { "hour": 14, "count": 2 }
  ]
}
```

---

### **Test 4.2: Weekly OPD Report** ✅

**Scenario**: Generate weekly report (last 7 days)

**Test Steps**:
1. Navigate to `/dashboard/frontdesk/reports`
2. Select "Weekly Report"
3. Select start date: 2026-01-30 (7 days ago)
4. Click "Generate Report"

**Expected Result**:
- ✅ Report shows day-wise breakdown (Feb 1 - Feb 5)
- ✅ Daily appointment counts
- ✅ Trend chart (increasing/decreasing)
- ✅ Total for week calculated

**Verification via Swagger**:
```javascript
// GET /api/reports/opd/weekly?branchId={BRANCH_ID}&startDate=2026-01-30
```

---

### **Test 4.3: Monthly OPD Report** ✅

**Scenario**: Generate report for current month (February 2026)

**Test Steps**:
1. Navigate to `/dashboard/frontdesk/reports`
2. Select "Monthly Report"
3. Select month: February 2026
4. Click "Generate Report"

**Expected Result**:
- ✅ Report shows week-wise breakdown
- ✅ Total appointments for month
- ✅ Comparison with previous month (if data exists)
- ✅ Average daily appointments calculated

**Verification via Swagger**:
```javascript
// GET /api/reports/opd/monthly?branchId={BRANCH_ID}&year=2026&month=2
```

---

## 📊 TEST EXECUTION CHECKLIST

### **Check-In Workflow** (5 tests)
- [ ] Test 1.1: Successful check-in ✅
- [ ] Test 1.2: No appointment ❌
- [ ] Test 1.3: Fee not paid ❌
- [ ] Test 1.4: Outstanding bills ❌
- [ ] Test 1.5: Emergency override ✅

### **Walk-In Booking** (3 tests)
- [ ] Test 2.1: Existing patient quick book ✅
- [ ] Test 2.2: Existing patient manual book ✅
- [ ] Test 2.3: New patient registration ✅

### **Queue Management** (5 tests)
- [ ] Test 3.1: Queue entry on check-in ✅
- [ ] Test 3.2: Call patient → TV updates ✅
- [ ] Test 3.3: Mark absent ✅
- [ ] Test 3.4: Transfer queue ✅
- [ ] Test 3.5: Multi-client sync ✅

### **Reports** (3 tests)
- [ ] Test 4.1: Daily report ✅
- [ ] Test 4.2: Weekly report ✅
- [ ] Test 4.3: Monthly report ✅

**Total Tests**: 16  
**Pass Required**: 16/16 (100%)

---

## 🐛 TROUBLESHOOTING

### **Issue: API returns 401 Unauthorized**

**Solution**:
1. Re-login to get fresh JWT token
2. Verify token in localStorage: `localStorage.getItem('token')`
3. Check token expiration (default: 24 hours)

---

### **Issue: SignalR not connecting**

**Solution**:
1. Verify backend running: `http://localhost:5073/swagger`
2. Check browser console for connection errors
3. Verify JWT token present in localStorage
4. Check SignalR logs in backend terminal

---

### **Issue: Queue not updating**

**Solution**:
1. Hard refresh: Ctrl+Shift+R
2. Check network tab for failed API calls
3. Verify branchId in localStorage
4. Check database: `SELECT * FROM queue_item WHERE branch_id = '{BRANCH_ID}';`

---

### **Issue: Reports show no data**

**Solution**:
1. Verify appointments exist for selected date range
2. Check API response in Network tab
3. Ensure correct branchId parameter
4. Create test appointments if needed

---

## ✅ TEST COMPLETION CRITERIA

Step 4 is complete when:

- ✅ All 16 test scenarios pass
- ✅ No console errors in browser
- ✅ No API errors (500/400 responses)
- ✅ SignalR real-time updates confirmed working
- ✅ All expected database entries verified
- ✅ UI behaves as expected (no crashes, loading states work)

---

## 📝 TEST RESULTS TEMPLATE

**Date**: _____________  
**Tester**: _____________  
**Environment**: Local (localhost:3000)

| Test ID | Test Name | Result | Notes |
|---------|-----------|--------|-------|
| 1.1 | Successful check-in | ✅ / ❌ | |
| 1.2 | No appointment error | ✅ / ❌ | |
| 1.3 | Fee not paid error | ✅ / ❌ | |
| 1.4 | Outstanding bills error | ✅ / ❌ | |
| 1.5 | Emergency override | ✅ / ❌ | |
| 2.1 | Quick book existing patient | ✅ / ❌ | |
| 2.2 | Manual book existing patient | ✅ / ❌ | |
| 2.3 | New patient registration | ✅ / ❌ | |
| 3.1 | Queue entry creation | ✅ / ❌ | |
| 3.2 | SignalR token call | ✅ / ❌ | |
| 3.3 | Mark patient absent | ✅ / ❌ | |
| 3.4 | Transfer queue | ✅ / ❌ | |
| 3.5 | Multi-client sync | ✅ / ❌ | |
| 4.1 | Daily report | ✅ / ❌ | |
| 4.2 | Weekly report | ✅ / ❌ | |
| 4.3 | Monthly report | ✅ / ❌ | |

**Pass Rate**: ___/16 (___%)

**Blocking Issues**: 
- _______________________
- _______________________

**Non-Blocking Issues**:
- _______________________
- _______________________

---

## 🚀 NEXT STEPS AFTER TESTING

**If all tests pass** → Proceed to Step 5: Documentation & Polish

**If tests fail** → Fix issues and re-test

**Step 5 Tasks** (1 hour):
- Update README.md with Module 4 completion
- Create user guide for front desk workflows
- Remove console.log statements
- Add error handling improvements
- Polish UI/UX

---

**Testing Started**: _____________  
**Testing Completed**: _____________  
**Total Duration**: _____________
