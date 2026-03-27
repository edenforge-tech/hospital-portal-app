# Phase 2 Follow-Up Management - API Testing Guide

**Testing Date:** January 28, 2026  
**Backend URL:** http://localhost:5073  
**Swagger UI:** http://localhost:5073/swagger  
**Status:** ✅ Database tables created, Server running, Ready for testing

---

## ✅ Pre-Testing Checklist

- [✅] Backend server running on http://localhost:5073
- [✅] Database tables created (7 tables verified)
- [✅] Permissions inserted (13 permissions)
- [✅] Swagger UI accessible
- [ ] JWT token obtained (login required)
- [ ] Test data prepared

---

## 🔐 Step 1: Authentication

### Login to get JWT Token

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "admin@test.com",
  "password": "Admin123!",
  "tenantCode": "DEMO"
}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "userId": "dddddddd-dddd-dddd-dddd-dddddddddddd",
    "email": "admin@test.com",
    "firstName": "Admin",
    "lastName": "User",
    "tenantId": "155fe198-6ae5-4a01-9254-ead5b427247e",
    "tenantCode": "DEMO",
    "mustChangePassword": false
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "roles": ["Admin"],
  "permissions": ["*"],
  "message": "Login successful",
  "expiresIn": 60
}
```

**Action:**
1. Click "Try it out" on POST /api/auth/login
2. Enter the request body above
3. Click "Execute"
4. Copy the `token` value from the response
5. Click the "Authorize" button at the top right
6. Enter: `Bearer {paste-token-here}`
7. Click "Authorize"
8. Click "Close"

---

## 📋 Step 2: Get Test Patient ID

**Endpoint:** `GET /api/patients`

**Expected Response:**
```json
[
  {
    "id": "a1b2c3d4-...",
    "firstName": "John",
    "lastName": "Doe",
    "medicalRecordNumber": "MRN-001",
    ...
  }
]
```

**Action:**
1. Scroll to "Patients" section
2. Click GET /api/patients
3. Click "Try it out"
4. Click "Execute"
5. Copy the first patient's `id` (we'll use this for testing)
6. Also note the tenant_id from the response

---

## 🧪 Step 3: Test Follow-Up Appointment APIs (7 Endpoints)

### 3.1 Create Follow-Up Appointment

**Endpoint:** `POST /api/followups`

**Request Body:**
```json
{
  "patientId": "{patient-id-from-step-2}",
  "assignedDoctorId": "dddddddd-dddd-dddd-dddd-dddddddddddd",
  "departmentId": null,
  "followUpType": "post_surgery",
  "scheduledDate": "2026-02-05T10:00:00Z",
  "priority": "high",
  "notes": "Day 1 post-operative follow-up for cataract surgery"
}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "{new-followup-id}",
    "patientId": "...",
    "patientName": "John Doe",
    "assignedDoctorId": "...",
    "assignedDoctorName": "Admin User",
    "followUpType": "post_surgery",
    "scheduledDate": "2026-02-05T10:00:00Z",
    "status": "scheduled",
    "priority": "high",
    "notes": "Day 1 post-operative follow-up for cataract surgery",
    "remindersSent": 0
  },
  "message": "Follow-up created successfully"
}
```

**Test Cases:**
- ✅ Create with minimal data (only required fields)
- ✅ Create with department assigned
- ✅ Create with different follow_up_type: "routine", "complication_check", "monitoring"
- ✅ Create with different priority: "low", "medium", "urgent"

**Copy the `id` from response - we'll use it for subsequent tests**

---

### 3.2 Get All Follow-Ups (with filters)

**Endpoint:** `GET /api/followups`

**Query Parameters:**
- status: "scheduled"
- priority: "high"
- fromDate: "2026-02-01"
- toDate: "2026-02-28"

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "patientName": "John Doe",
      "assignedDoctorName": "Admin User",
      "followUpType": "post_surgery",
      "scheduledDate": "2026-02-05T10:00:00Z",
      "status": "scheduled",
      "priority": "high"
    }
  ],
  "message": "Follow-ups retrieved successfully"
}
```

**Test Cases:**
- ✅ No filters (all follow-ups)
- ✅ Filter by status="scheduled"
- ✅ Filter by priority="high"
- ✅ Filter by date range
- ✅ Filter by departmentId
- ✅ Filter by doctorId
- ✅ Combined filters

---

### 3.3 Get Single Follow-Up

**Endpoint:** `GET /api/followups/{id}`

**Path Parameter:** Use the ID from Step 3.1

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "patientId": "...",
    "patientName": "John Doe",
    "assignedDoctorId": "...",
    "assignedDoctorName": "Admin User",
    "departmentName": null,
    "followUpType": "post_surgery",
    "scheduledDate": "2026-02-05T10:00:00Z",
    "status": "scheduled",
    "priority": "high",
    "notes": "Day 1 post-operative follow-up for cataract surgery",
    "outcome": null,
    "completedDate": null,
    "remindersSent": 0
  },
  "message": "Follow-up retrieved successfully"
}
```

**Test Cases:**
- ✅ Valid ID
- ✅ Invalid ID (should return 404)
- ✅ ID from different tenant (should return 404 due to tenant isolation)

---

### 3.4 Update Follow-Up

**Endpoint:** `PUT /api/followups/{id}`

**Request Body:**
```json
{
  "scheduledDate": "2026-02-06T14:00:00Z",
  "priority": "medium",
  "notes": "Rescheduled to afternoon slot"
}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "scheduledDate": "2026-02-06T14:00:00Z",
    "priority": "medium",
    "notes": "Rescheduled to afternoon slot",
    "status": "scheduled"
  },
  "message": "Follow-up updated successfully"
}
```

**Test Cases:**
- ✅ Update schedule date
- ✅ Update priority
- ✅ Update notes
- ✅ Update assigned doctor
- ✅ Update department

---

### 3.5 Complete Follow-Up

**Endpoint:** `POST /api/followups/{id}/complete`

**Request Body:**
```json
{
  "outcome": "Patient recovering well. No complications. Visual acuity 20/30. Next follow-up in 1 week."
}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "status": "completed",
    "completedDate": "2026-01-28T11:15:00Z",
    "outcome": "Patient recovering well. No complications. Visual acuity 20/30. Next follow-up in 1 week."
  },
  "message": "Follow-up marked as completed"
}
```

**Test Cases:**
- ✅ Complete with detailed outcome
- ✅ Complete with minimal outcome
- ✅ Try completing already completed (should handle gracefully)

---

### 3.6 Reschedule Follow-Up

**Endpoint:** `POST /api/followups/{id}/reschedule`

**Request Body:**
```json
{
  "newScheduledDate": "2026-02-10T10:00:00Z"
}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "scheduledDate": "2026-02-10T10:00:00Z",
    "status": "scheduled"
  },
  "message": "Follow-up rescheduled successfully"
}
```

**Test Cases:**
- ✅ Reschedule to future date
- ✅ Reschedule completed follow-up (should reset status to "scheduled")

---

### 3.7 Delete Follow-Up (Soft Delete)

**Endpoint:** `DELETE /api/followups/{id}`

**Expected Response:**
```json
{
  "success": true,
  "message": "Follow-up deleted successfully"
}
```

**Verification:**
- GET /api/followups/{id} should return 404
- Database should have `deleted_at` timestamp set (not hard deleted)

**Test Cases:**
- ✅ Delete existing follow-up
- ✅ Delete already deleted (should return 404)
- ✅ Delete non-existent ID (should return 404)

---

## 🏥 Step 4: Test Post-Op Care APIs (5 Endpoints)

### 4.1 Create Post-Op Care Schedule

**Endpoint:** `POST /api/post-op-care`

**Request Body:**
```json
{
  "patientId": "{patient-id-from-step-2}",
  "surgeonId": "dddddddd-dddd-dddd-dddd-dddddddddddd",
  "surgeryType": "Cataract Surgery - Phacoemulsification",
  "surgeryDate": "2026-01-28",
  "surgeryEye": "OD"
}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "{new-schedule-id}",
    "patientId": "...",
    "patientName": "John Doe",
    "surgeonId": "...",
    "surgeonName": "Admin User",
    "surgeryType": "Cataract Surgery - Phacoemulsification",
    "surgeryDate": "2026-01-28",
    "surgeryEye": "OD",
    "instructions": [
      "Use prescribed eye drops as directed",
      "Avoid rubbing or pressing on the operated eye",
      "Wear protective eye shield while sleeping for first week",
      "Apply cold compress if swelling occurs",
      "Keep the operated eye clean and dry"
    ],
    "restrictions": [
      "No water in the operated eye for 1 week",
      "Avoid eye makeup for 2 weeks",
      "No heavy lifting or strenuous exercise for 3 weeks",
      "Avoid contact sports for 1 month"
    ],
    "visits": [
      {
        "visitName": "Day 1",
        "scheduledDate": "2026-01-29",
        "completed": false
      },
      {
        "visitName": "1 Week",
        "scheduledDate": "2026-02-04",
        "completed": false
      },
      {
        "visitName": "1 Month",
        "scheduledDate": "2026-02-28",
        "completed": false
      },
      {
        "visitName": "3 Months",
        "scheduledDate": "2026-04-28",
        "completed": false
      }
    ],
    "medications": [],
    "status": "active"
  },
  "message": "Post-op care schedule created successfully"
}
```

**Verification:**
- ✅ 4 default visits auto-generated (Day 1, 1 Week, 1 Month, 3 Months)
- ✅ 5 default instructions included
- ✅ 4 default restrictions included
- ✅ Medication list empty initially

**Copy the `id` from response and one of the visit IDs**

---

### 4.2 Get Active Post-Op Patients

**Endpoint:** `GET /api/post-op-care/active`

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "patientName": "John Doe",
      "surgeryType": "Cataract Surgery - Phacoemulsification",
      "surgeryDate": "2026-01-28",
      "surgeryEye": "OD",
      "pendingVisits": 4,
      "nextVisitDate": "2026-01-29"
    }
  ],
  "message": "Active post-op patients retrieved successfully"
}
```

**Filter Logic:** Surgery date within last 6 months

**Test Cases:**
- ✅ Should include today's surgery
- ✅ Should exclude surgeries older than 6 months

---

### 4.3 Get Post-Op Care by Patient

**Endpoint:** `GET /api/post-op-care/patient/{patientId}`

**Path Parameter:** Use patient ID from Step 2

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "patientName": "John Doe",
    "surgeryType": "Cataract Surgery - Phacoemulsification",
    "surgeryDate": "2026-01-28",
    "visits": [
      { "visitName": "Day 1", "scheduledDate": "2026-01-29", "completed": false }
    ],
    "medications": [],
    "instructions": [...],
    "restrictions": [...]
  },
  "message": "Post-op care retrieved successfully"
}
```

**Test Cases:**
- ✅ Valid patient with post-op schedule
- ✅ Patient without post-op schedule (should return 404)

---

### 4.4 Complete Post-Op Visit

**Endpoint:** `POST /api/post-op-care/visits/{visitId}/complete`

**Path Parameter:** Use visit ID from Step 4.1

**Request Body:**
```json
{
  "findings": "No complications noted. Clear cornea. Well-centered IOL.",
  "visualAcuity": "20/30",
  "iop": "14 mmHg",
  "complications": "None"
}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "{visit-id}",
    "visitName": "Day 1",
    "scheduledDate": "2026-01-29",
    "completed": true,
    "completedDate": "2026-01-28T11:30:00Z",
    "completedByDoctorName": "Admin User",
    "findings": "No complications noted. Clear cornea. Well-centered IOL.",
    "visualAcuity": "20/30",
    "iop": "14 mmHg",
    "complications": "None"
  },
  "message": "Visit completed successfully"
}
```

**Test Cases:**
- ✅ Complete with all clinical data
- ✅ Complete with minimal data
- ✅ Complete already completed visit (should update data)

---

### 4.5 Update Medication Adherence

**Endpoint:** `PUT /api/post-op-care/medications/{medicationId}/adherence`

**Note:** First need to add a medication to the schedule manually in the database or create an endpoint for it

**Request Body:**
```json
{
  "adherence": "full",
  "adherenceNotes": "Patient using Vigamox drops 4 times daily as prescribed",
  "lastRefillDate": "2026-01-25"
}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "{medication-id}",
    "medicationName": "Vigamox (Moxifloxacin)",
    "dosage": "0.5%",
    "frequency": "4 times daily",
    "adherence": "full",
    "adherenceNotes": "Patient using Vigamox drops 4 times daily as prescribed",
    "lastRefillDate": "2026-01-25"
  },
  "message": "Medication adherence updated successfully"
}
```

---

## 📊 Step 5: Test Adherence Monitoring APIs (3 Endpoints)

### 5.1 Create Treatment Adherence Record

**Note:** Need to manually create in database first, or create via direct DB insert:

**SQL to create test data:**
```sql
INSERT INTO treatment_adherence 
(id, tenant_id, patient_id, condition, treatment_plan, start_date, scheduled_appointments, completed_appointments, adherence_rate, risk_level, created_at, updated_at)
VALUES 
(gen_random_uuid(), '{your-tenant-id}', '{patient-id}', 'Primary Open-Angle Glaucoma', 'Latanoprost 0.005% nightly, Monthly IOP monitoring', '2025-06-01', 8, 5, 62.5, 'high', NOW(), NOW());
```

### 5.2 Get Patient Adherence

**Endpoint:** `GET /api/adherence/patients/{patientId}`

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "patientId": "...",
    "patientName": "John Doe",
    "condition": "Primary Open-Angle Glaucoma",
    "treatmentPlan": "Latanoprost 0.005% nightly, Monthly IOP monitoring",
    "startDate": "2025-06-01",
    "endDate": null,
    "scheduledAppointments": 8,
    "completedAppointments": 5,
    "adherenceRate": 62.5,
    "riskLevel": "high",
    "recommendations": [
      "High priority: Schedule missed appointments immediately",
      "Patient requires urgent intervention",
      "Risk of vision loss if treatment is delayed further"
    ],
    "medicationAdherences": []
  },
  "message": "Adherence data retrieved successfully"
}
```

**Test Cases:**
- ✅ Patient with adherence data
- ✅ Patient without adherence data (should return 404)

---

### 5.3 Get High-Risk Patients

**Endpoint:** `GET /api/adherence/high-risk`

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "patientId": "...",
      "patientName": "John Doe",
      "condition": "Primary Open-Angle Glaucoma",
      "adherenceRate": 62.5,
      "riskLevel": "high",
      "missedAppointments": 3,
      "lastAppointmentDate": "2025-12-15"
    }
  ],
  "message": "High-risk patients retrieved successfully"
}
```

**Filter Logic:** risk_level = 'high' AND end_date IS NULL (active only)

**Test Cases:**
- ✅ Should include patient with <70% adherence
- ✅ Should exclude patient with ≥70% adherence
- ✅ Should exclude completed treatments (end_date NOT NULL)

---

### 5.4 Update Adherence (Recalculate)

**Endpoint:** `POST /api/adherence/{adherenceId}/update`

**Request Body:** None (it recalculates based on current data)

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "adherenceRate": 62.5,
    "riskLevel": "high",
    "recommendations": [
      "High priority: Schedule missed appointments immediately",
      "Patient requires urgent intervention",
      "Risk of vision loss if treatment is delayed further"
    ]
  },
  "message": "Adherence updated successfully"
}
```

**Test Logic:**
- If adherence_rate ≥ 90% → risk_level = "low", recommendations = ["Continue current treatment plan"]
- If adherence_rate ≥ 70% → risk_level = "medium", recommendations = ["Review drop instillation technique"]
- If adherence_rate < 70% → risk_level = "high", recommendations = ["High priority: Schedule missed appointments"]

---

## 📱 Step 6: Test Patient Reminder APIs (5 Endpoints)

### 6.1 Create Patient Reminder

**Endpoint:** `POST /api/reminders`

**Request Body:**
```json
{
  "patientId": "{patient-id-from-step-2}",
  "reminderType": "appointment",
  "relatedId": "{followup-id-from-step-3.1}",
  "message": "You have a follow-up appointment tomorrow at 10:00 AM with Dr. Admin User",
  "channels": ["sms", "email"],
  "scheduledDate": "2026-02-04T08:00:00Z"
}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "{new-reminder-id}",
    "patientId": "...",
    "patientName": "John Doe",
    "reminderType": "appointment",
    "relatedId": "...",
    "message": "You have a follow-up appointment tomorrow at 10:00 AM with Dr. Admin User",
    "channels": ["sms", "email"],
    "scheduledDate": "2026-02-04T08:00:00Z",
    "status": "pending",
    "acknowledged": false,
    "retryCount": 0
  },
  "message": "Reminder created successfully"
}
```

**Test Cases:**
- ✅ Create with single channel (SMS)
- ✅ Create with multiple channels (SMS + Email)
- ✅ Create with different reminder types: "medication", "test", "follow_up", "screening"

**Copy the reminder ID for subsequent tests**

---

### 6.2 Get All Reminders (with filters)

**Endpoint:** `GET /api/reminders`

**Query Parameters:**
- status: "pending"
- reminderType: "appointment"
- fromDate: "2026-02-01"
- toDate: "2026-02-28"

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "patientName": "John Doe",
      "reminderType": "appointment",
      "message": "You have a follow-up appointment tomorrow...",
      "scheduledDate": "2026-02-04T08:00:00Z",
      "status": "pending",
      "channels": ["sms", "email"]
    }
  ],
  "message": "Reminders retrieved successfully"
}
```

**Test Cases:**
- ✅ No filters
- ✅ Filter by status="pending"
- ✅ Filter by reminderType="appointment"
- ✅ Filter by date range
- ✅ Combined filters

---

### 6.3 Send Reminder

**Endpoint:** `POST /api/reminders/{id}/send`

**Path Parameter:** Use reminder ID from Step 6.1

**Request Body:**
```json
{
  "channels": ["sms", "email"]
}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "status": "sent",
    "sentDate": "2026-01-28T11:45:00Z",
    "channels": ["sms", "email"],
    "retryCount": 0
  },
  "message": "Reminder sent successfully"
}
```

**Note:** Currently simulated (always returns success). TODO: Integrate Twilio (SMS) and SendGrid (Email)

**Test Cases:**
- ✅ Send with SMS only
- ✅ Send with Email only
- ✅ Send with multiple channels
- ✅ Send already sent reminder (should re-send and increment retry_count)

---

### 6.4 Acknowledge Reminder (Public Endpoint)

**Endpoint:** `PUT /api/reminders/{id}/acknowledge`

**Path Parameter:** Use reminder ID from Step 6.1

**Request Body:** None

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "acknowledged": true,
    "acknowledgedDate": "2026-01-28T11:50:00Z",
    "status": "acknowledged"
  },
  "message": "Reminder acknowledged successfully"
}
```

**Note:** This endpoint has `[AllowAnonymous]` - no JWT token required. Used in SMS/Email links like:
`https://portal.hospital.com/acknowledge-reminder/{id}`

**Test Cases:**
- ✅ Acknowledge pending reminder
- ✅ Acknowledge sent reminder
- ✅ Acknowledge already acknowledged (should update timestamp)

---

### 6.5 Process Scheduled Reminders (Background Job)

**Endpoint:** `POST /api/reminders/process-scheduled`

**Request Body:** None

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "remindersProcessed": 3
  },
  "message": "Processed 3 scheduled reminders"
}
```

**Logic:**
- Filters: scheduled_date <= NOW AND status = "pending"
- Processes up to 100 reminders per run
- Sends each reminder via configured channels
- Updates status to "sent" or "failed"

**Test Cases:**
- ✅ With pending reminders scheduled in the past
- ✅ With no pending reminders (should return 0)
- ✅ With reminders scheduled in the future (should not process)

**Production Usage:**
- Schedule this endpoint to run every 5 minutes via cron job or Azure Functions Timer Trigger
- Example: Azure Function with `schedule: "0 */5 * * * *"` (every 5 minutes)

---

## ✅ Test Execution Checklist

### Follow-Up Appointments (7 endpoints)
- [ ] POST /api/followups - Create follow-up
- [ ] GET /api/followups - Get all with filters
- [ ] GET /api/followups/{id} - Get single
- [ ] PUT /api/followups/{id} - Update
- [ ] POST /api/followups/{id}/complete - Mark completed
- [ ] POST /api/followups/{id}/reschedule - Reschedule
- [ ] DELETE /api/followups/{id} - Soft delete

### Post-Op Care (5 endpoints)
- [ ] POST /api/post-op-care - Create schedule (auto-generates 4 visits)
- [ ] GET /api/post-op-care/active - Active patients (last 6 months)
- [ ] GET /api/post-op-care/patient/{id} - Get by patient
- [ ] POST /api/post-op-care/visits/{id}/complete - Complete visit
- [ ] PUT /api/post-op-care/medications/{id}/adherence - Update medication

### Adherence Monitoring (3 endpoints)
- [ ] GET /api/adherence/patients/{id} - Get patient adherence
- [ ] GET /api/adherence/high-risk - High-risk patients (risk_level='high')
- [ ] POST /api/adherence/{id}/update - Recalculate adherence

### Patient Reminders (5 endpoints)
- [ ] POST /api/reminders - Create reminder
- [ ] GET /api/reminders - Get all with filters
- [ ] POST /api/reminders/{id}/send - Send via channels
- [ ] PUT /api/reminders/{id}/acknowledge - Acknowledge (public)
- [ ] POST /api/reminders/process-scheduled - Background job

**Total: 20 endpoints to test**

---

## 🔍 Verification Tests

### Tenant Isolation
- [ ] Create follow-up as Tenant A
- [ ] Login as Tenant B
- [ ] Try to access Tenant A's follow-up → Should return 404
- [ ] GET /api/followups as Tenant B → Should NOT include Tenant A's data

### Soft Delete
- [ ] Create follow-up
- [ ] Delete follow-up (DELETE /api/followups/{id})
- [ ] GET /api/followups/{id} → Should return 404
- [ ] Check database: `SELECT * FROM follow_up_appointment WHERE id = '{id}'`
- [ ] Verify `deleted_at` IS NOT NULL (not hard deleted)

### Audit Trail
- [ ] Create follow-up
- [ ] Check database: `created_by_user_id` should be your user ID
- [ ] Update follow-up
- [ ] Check database: `updated_by_user_id` should be your user ID, `updated_at` timestamp updated

### Permission-Based Authorization
- [ ] Create a role without "followup.create" permission
- [ ] Assign role to test user
- [ ] Login as test user
- [ ] Try POST /api/followups → Should return 403 Forbidden
- [ ] Grant "followup.create" permission to role
- [ ] Try again → Should succeed

### Business Logic
- [ ] Create post-op schedule → Verify 4 default visits auto-generated
- [ ] Verify default instructions (5 items) and restrictions (4 items) present
- [ ] Create adherence with 8 scheduled, 5 completed → Verify rate = 62.5%, risk = "high"
- [ ] Update adherence to 8 scheduled, 7 completed → Verify rate = 87.5%, risk = "medium"
- [ ] Update adherence to 8 scheduled, 8 completed → Verify rate = 100%, risk = "low"

---

## 📊 Performance Testing (Optional)

### Load Test Scenarios
1. **Concurrent Follow-Up Creation:**
   - Create 100 follow-ups simultaneously
   - Verify no duplicate IDs
   - Verify all have correct tenant_id

2. **Large Result Set:**
   - Create 1000 follow-ups
   - GET /api/followups (no pagination implemented yet)
   - Measure response time

3. **Complex Filters:**
   - GET /api/followups with all filters applied
   - Measure query execution time (check database logs)

### Expected Performance
- Simple GET (by ID): < 100ms
- List with filters: < 500ms
- Create/Update: < 200ms
- Background job (100 reminders): < 5 seconds

---

## 🐛 Known Issues / TODO

### Current Limitations
1. **No Pagination:** All GET endpoints return full result sets. Need to add pagination for production.
2. **No Sorting:** Cannot sort results. Add `orderBy` and `orderDirection` query params.
3. **Simulated Reminders:** SMS/Email sending is simulated. Integrate Twilio and SendGrid.
4. **No Medication CRUD:** Post-op medications can only be created via schedule. Add dedicated endpoints.
5. **No Visit CRUD:** Post-op visits can only be created via schedule. Add dedicated endpoints.
6. **No Adherence CRUD:** Treatment adherence cannot be created via API. Add create endpoint.

### Future Enhancements
1. **WebSocket Notifications:** Real-time updates when reminder sent or acknowledged
2. **Reminder Templates:** Pre-defined message templates for different reminder types
3. **Bulk Operations:** Create multiple follow-ups, send batch reminders
4. **Excel Export:** Export adherence reports, reminder logs
5. **Advanced Filtering:** Full-text search in notes/outcome, date range presets (today, this week, this month)

---

## 📝 Test Results Template

After completing all tests, document results:

```markdown
# Phase 2 API Testing Results

**Tested By:** [Your Name]
**Date:** January 28, 2026
**Backend Version:** 1.0.0
**Database:** PostgreSQL 17.6 (Azure)

## Test Summary
- **Total Endpoints:** 20
- **Passed:** __/20
- **Failed:** __/20
- **Skipped:** __/20

## Failed Tests
1. [Endpoint Name] - [Error Description]
2. ...

## Performance Metrics
- Average Response Time: __ ms
- Slowest Endpoint: [Endpoint Name] (__ ms)
- Database Query Time: __ ms

## Issues Found
1. [Issue Description]
2. ...

## Recommendations
1. [Recommendation]
2. ...
```

---

## 🎯 Next Steps After Testing

1. **Document Test Results:** Fill in the template above
2. **Fix Bugs:** Address any failed tests
3. **Performance Optimization:** Add indexes for slow queries
4. **Add Pagination:** Implement pagination for list endpoints
5. **Frontend Integration:** Update follow-ups page to use real APIs
6. **Phase 3 Planning:** Begin implementation of Prescriptions module

---

**Testing Status:** 🟡 Ready for execution  
**Swagger UI:** ✅ http://localhost:5073/swagger  
**Database:** ✅ 7 tables + 13 permissions created  
**Documentation:** ✅ Complete testing guide available
