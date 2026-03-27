# Module 4 - Testing Session Log

**Session Start**: February 5, 2026  
**Tester**: System  
**Backend**: http://localhost:5073 ✅  
**Frontend**: http://localhost:3000 ✅

---

## 🔐 STEP 1: LOGIN & AUTHENTICATION

### Frontend Login
**URL**: http://localhost:3000/login  
**Credentials**:
- Email: `receptionist@test.com`
- Password: `Test@123456`

**Action**: Login and verify redirect to dashboard

📋 **TODO**:
- [ ] Login successful
- [ ] Dashboard loads without errors
- [ ] Check browser console (F12) for errors
- [ ] Note down any issues

---

## 🔑 STEP 2: GET JWT TOKEN (Swagger)

### Swagger Authentication
**URL**: http://localhost:5073/swagger

1. **Expand**: `POST /api/auth/login`
2. **Click**: "Try it out"
3. **Paste** this JSON in Request body:
```json
{
  "email": "receptionist@test.com",
  "password": "Test@123456",
  "tenantId": "155fe198-6ae5-4a01-9254-ead5b427247e"
}
```
4. **Click**: "Execute"
5. **Copy**: `accessToken` from response (starts with `eyJhbGciOi...`)

**Example Response**:
```json
{
  "success": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "email": "receptionist@test.com"
  }
}
```

### Authorize Swagger
1. **Click**: 🔓 **Authorize** button (top right)
2. **Enter**: `Bearer {paste-your-token-here}`
3. **Click**: "Authorize" → "Close"

✅ **Verification**: Lock icon should change to 🔒

📋 **TODO**:
- [ ] JWT token obtained
- [ ] Swagger authorized successfully
- [ ] Token copied to clipboard

---

## 👤 STEP 3: CREATE TEST PATIENT

### POST /api/patients

1. **Find**: `POST /api/patients` in Swagger
2. **Click**: "Try it out"
3. **Paste** this JSON:
```json
{
  "firstName": "TestPatient",
  "lastName": "CheckIn",
  "dateOfBirth": "1990-01-01",
  "gender": "Male",
  "mobileNumber": "9876543210",
  "email": "test.checkin@hospital.com",
  "address": "123 Test Street, Bangalore"
}
```
4. **Click**: "Execute"

**Expected Response**: HTTP 201 Created
```json
{
  "id": "guid-here-copy-this",
  "firstName": "TestPatient",
  "lastName": "CheckIn",
  "mobileNumber": "9876543210"
}
```

📋 **IMPORTANT**: Copy the `id` from response:
```
PATIENT_ID = _________________________________
```

📋 **TODO**:
- [ ] Patient created successfully (201 response)
- [ ] Patient ID copied

---

## 👨‍⚕️ STEP 4: GET DOCTOR ID

### GET /api/users/doctors

1. **Find**: `GET /api/users` or `GET /api/users/doctors` in Swagger
2. **Click**: "Try it out"
3. **Click**: "Execute"

**Expected Response**: HTTP 200 OK
```json
[
  {
    "id": "doctor-guid-copy-this",
    "firstName": "Dr. Test",
    "lastName": "Doctor",
    "email": "doctor@test.com"
  }
]
```

📋 **IMPORTANT**: Copy any doctor's `id`:
```
DOCTOR_ID = _________________________________
```

📋 **TODO**:
- [ ] Doctors list retrieved
- [ ] Doctor ID copied

---

## 🏥 STEP 5: GET DEPARTMENT ID

### GET /api/departments

1. **Find**: `GET /api/departments` in Swagger
2. **Click**: "Try it out"
3. **Click**: "Execute"

**Expected Response**: HTTP 200 OK
```json
[
  {
    "id": "department-guid-copy-this",
    "name": "Ophthalmology",
    "code": "OPTH"
  }
]
```

📋 **IMPORTANT**: Copy any department's `id` (preferably Ophthalmology):
```
DEPARTMENT_ID = _________________________________
```

📋 **TODO**:
- [ ] Departments list retrieved
- [ ] Department ID copied

---

## 📅 STEP 6: CREATE APPOINTMENT FOR TODAY

### POST /api/appointments

1. **Find**: `POST /api/appointments` in Swagger
2. **Click**: "Try it out"
3. **Paste** this JSON (replace IDs with your copied values):
```json
{
  "patientId": "PASTE_PATIENT_ID_HERE",
  "doctorId": "PASTE_DOCTOR_ID_HERE",
  "departmentId": "PASTE_DEPARTMENT_ID_HERE",
  "appointmentDate": "2026-02-05T00:00:00Z",
  "startTime": "10:00:00",
  "endTime": "10:30:00",
  "appointmentType": "New",
  "status": "Confirmed",
  "reasonForVisit": "Routine checkup"
}
```
4. **Click**: "Execute"

**Expected Response**: HTTP 201 Created
```json
{
  "id": "appointment-guid-copy-this",
  "patientId": "...",
  "appointmentDate": "2026-02-05T00:00:00Z",
  "status": "Confirmed"
}
```

📋 **IMPORTANT**: Copy the `id` from response:
```
APPOINTMENT_ID = _________________________________
```

📋 **TODO**:
- [ ] Appointment created (201 response)
- [ ] Appointment ID copied
- [ ] Date is today (2026-02-05)

---

## 💰 STEP 7: MARK CONSULTATION FEE AS PAID

### POST /api/opdbills

1. **Find**: `POST /api/opdbills` in Swagger
2. **Click**: "Try it out"
3. **Paste** this JSON (replace IDs):
```json
{
  "appointmentId": "PASTE_APPOINTMENT_ID_HERE",
  "patientId": "PASTE_PATIENT_ID_HERE",
  "totalAmount": 500,
  "paidAmount": 500,
  "status": "Paid",
  "paymentMethod": "Cash",
  "description": "Consultation fee"
}
```
4. **Click**: "Execute"

**Expected Response**: HTTP 201 Created
```json
{
  "id": "bill-guid",
  "totalAmount": 500,
  "paidAmount": 500,
  "status": "Paid"
}
```

📋 **TODO**:
- [ ] Bill created successfully (201 response)
- [ ] Status is "Paid"
- [ ] Amount matches (500)

---

## ✅ STEP 8: TEST CHECK-IN (CRITICAL TEST #1)

### Frontend Check-In Flow

1. **Navigate**: http://localhost:3000/dashboard/frontdesk/check-in
2. **Enter** mobile number: `9876543210`
3. **Click**: "Search Patient"
4. **Verify**: Patient details display (TestPatient CheckIn)
5. **Click**: "Verify & Check In"

### Expected Behavior:

**✅ Gate 1 Validation (Payment Status)**:
- API Call: `GET /api/opdbills/payment-status/{appointmentId}`
- Expected: Returns `{ paid: true, amount: 500 }`
- Result: ✅ PASS

**✅ Gate 2 Validation (Outstanding Bills)**:
- API Call: `GET /api/opdbills/outstanding/{patientId}`
- Expected: Returns `{ totalOutstanding: 0 }`
- Result: ✅ PASS

**✅ Gate 3 Validation (Today's Appointment)**:
- API Call: `GET /api/appointments/patient/{patientId}/today`
- Expected: Returns `{ hasAppointment: true, appointment: {...} }`
- Result: ✅ PASS

**✅ Token Generation**:
- Queue entry created
- Token number generated (e.g., "BLR-001")
- Success message displayed

**✅ Success Message**:
```
Patient checked in successfully!
Token Number: BLR-001
Queue: Doctor
```

### Troubleshooting

**If validation fails**:
1. **Check browser console** (F12) for API errors
2. **Check Network tab** for failed requests
3. **Verify** all IDs are correct (patient, appointment, bill)
4. **Check** appointment date is today (2026-02-05)

📋 **TODO**:
- [ ] Patient search works
- [ ] All 3 validations pass
- [ ] Token generated successfully
- [ ] No console errors
- [ ] Success message displayed

---

## 🎯 STEP 9: TEST QUEUE DISPLAY (CRITICAL TEST #2)

### Queue Dashboard

1. **Navigate**: http://localhost:3000/dashboard/frontdesk/queue
2. **Verify**: Checked-in patient appears in queue
3. **Check**: 
   - Token number visible
   - Patient name visible
   - Status: "Waiting"
   - Wait time showing

📋 **TODO**:
- [ ] Patient appears in queue
- [ ] Token number matches check-in
- [ ] Status is "Waiting"

---

## 📺 STEP 10: TEST SIGNALR REAL-TIME UPDATES (CRITICAL TEST #3)

### Setup (2 Browser Windows)

**Window 1 (Dashboard)**:
```
http://localhost:3000/dashboard/frontdesk/queue
```

**Window 2 (Queue TV)**:
```
http://localhost:3000/dashboard/frontdesk/queue-tv?queueType=Doctor
```

### Test Procedure

1. **Window 2**: Open browser console (F12)
2. **Verify** console logs:
   ```
   Queue Display: Connected to SignalR ✅
   Queue Display: Subscription confirmed ✅
   ```

3. **Window 1**: Find checked-in patient in "Doctor Queue"
4. **Window 1**: Click "Call Patient" button
5. **Window 1**: Enter room number: `R-101`
6. **Window 1**: Click "Confirm"

### Expected Behavior

**Window 1 (Dashboard)**:
- ✅ Patient status changes to "Called"
- ✅ Patient moves to "In Progress" section
- ✅ Console log: `"Queue Dashboard: Token called"`

**Window 2 (Queue TV)**:
- ✅ **INSTANT UPDATE** (<1 second)
- ✅ Current token changes to checked-in patient's token
- ✅ Shows "NOW SERVING: BLR-001"
- ✅ Shows doctor name
- ✅ Shows room number: "R-101"
- ✅ Console log: `"Queue Display: Token called"`

### Verification

**Both windows should update simultaneously!**

📋 **TODO**:
- [ ] SignalR connected in both windows
- [ ] Call patient from dashboard
- [ ] Queue TV updates INSTANTLY (<1 second)
- [ ] Token number correct on TV
- [ ] Room number displays (R-101)
- [ ] Console logs show SignalR events

---

## 📊 STEP 11: TEST OPD REPORTS (BONUS TEST)

### Daily Report

1. **Navigate**: http://localhost:3000/dashboard/frontdesk/reports
2. **Select**: "Daily Report"
3. **Select Date**: 2026-02-05 (today)
4. **Click**: "Generate Report"

**Expected**:
- ✅ Total appointments: 1+ (includes our test patient)
- ✅ Report loads without errors
- ✅ Shows appointment breakdown

**Alternative (Swagger)**:
```
GET /api/reports/opd/daily?date=2026-02-05
```

📋 **TODO**:
- [ ] Daily report loads
- [ ] Shows at least 1 appointment
- [ ] No errors

---

## ✅ TEST RESULTS SUMMARY

### Critical Tests (Must Pass)

| Test | Status | Notes |
|------|--------|-------|
| 1. Login | ⬜ | Frontend & Swagger |
| 2. Create patient | ⬜ | Via Swagger API |
| 3. Create appointment | ⬜ | For today |
| 4. Mark fee paid | ⬜ | Consultation fee |
| 5. Check-in validation | ⬜ | All 3 gates pass |
| 6. Token generation | ⬜ | Queue entry created |
| 7. Queue display | ⬜ | Patient in queue |
| 8. SignalR real-time | ⬜ | Instant TV update |

### Pass Criteria

- **Minimum**: 7/8 tests pass (87.5%)
- **Target**: 8/8 tests pass (100%)

---

## 🐛 ISSUES FOUND

### Blocker Issues (Stop Testing)
- 

### Major Issues (Continue but note)
- 

### Minor Issues (Note for later)
- 

---

## 📝 NOTES

**Performance**:
- SignalR latency: _____ ms
- Check-in total time: _____ seconds
- API response times: Fast / Slow / Timeout

**User Experience**:
- UI intuitive: Yes / No
- Error messages clear: Yes / No
- Loading states: Yes / No

**Browser Tested**: Chrome / Edge / Firefox  
**Console Errors**: Count: _____  
**Network Errors**: Count: _____

---

## 🎯 NEXT STEPS

**If all tests pass** ✅:
- Mark Step 4 as COMPLETE
- Proceed to Step 5: Documentation & Polish
- Module 4 → 99% complete!

**If critical tests fail** ❌:
- Debug and fix issues
- Re-test failed scenarios
- Mark blocking issues in this log

---

**Testing Started**: _____________  
**Testing Completed**: _____________  
**Total Duration**: _____________  
**Final Result**: PASS / FAIL
