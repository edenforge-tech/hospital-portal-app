# Quick Manual Testing Guide for Counselor Module

## Prerequisites Check

### 1. Backend Status
- Backend should be running on: `http://localhost:5073`
- Test: Navigate to `http://localhost:5073/swagger` in browser
- Should see Swagger UI with all endpoints listed

### 2. Frontend Status  
- Frontend starting or running on: `http://localhost:3000`
- Test: Navigate to `http://localhost:3000` in browser
- Should see login page

## Manual Testing Steps

### Phase 1: Login via Swagger UI (RECOMMENDED)

1. **Open Swagger**
   - Navigate to: `http://localhost:5073/swagger/index.html`

2. **Find Auth Endpoint**
   - Scroll to "Auth" section
   - Click on `POST /api/auth/login`
   - Click "Try it out"

3. **Enter Login Credentials**
   ```json
   {
     "email": "admin@test.com",
     "password": "Admin@123456",
     "tenantId": "155fe198-6ae5-4a01-9254-ead5b427247e"
   }
   ```

4. **Execute & Copy Token**
   - Click "Execute"
   - If successful (200 OK), copy the `accessToken` from response
   - Response should look like:
   ```json
   {
     "success": true,
     "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     "user": { "id": "...", "email": "admin@test.com", ... }
   }
   ```

5. **Authorize Swagger**
   - Click "Authorize" button  at top right (🔓 icon)
   - Enter: `Bearer {your-access-token}` (replace {your-access-token} with copied token)
   - Click "Authorize"
   - Click "Close"

### Phase 2: Test Counselor Endpoints

#### Test Session Management
1. **POST /api/counseling-sessions** - Create session
   ```json
   {
     "patientId": "5a4ca192-8060-4672-b212-cc1e7e8cc081",
     "sessionType": "Pre-Surgery Counseling",
     "sessionDate": "2026-02-24T10:00:00",
     "sessionStatus": "Scheduled",
     "counselorId": "{your-user-id-from-login}",
     "notes": "Manual test session"
   }
   ```
   - Copy the `id` from response (this is your test session ID)

2. **GET /api/counseling-sessions** - View all sessions
   - Should return array including your new session

3. **GET /api/counseling-sessions/session/{id}** - Get session by ID
   - Use the session ID from step 1

#### Test Insurance
4. **POST /api/insurance/pre-auths** - Create pre-authorization
   ```json
   {
     "sessionId": "{your-session-id}",
     "patientId": "5a4ca192-8060-4672-b212-cc1e7e8cc081",
     "insuranceType": "Mediclaim",
     "insuranceProvider": "Star Health",
     "tpaName": "Medi Assist",
     "policyNumber": "TEST-001",
     "policyHolderName": "Test Patient",
     "surgeryType": "Cataract Surgery",
     "plannedProcedure": "Phacoemulsification",
     "diagnosisCode": "H25.9",
     "procedureCode": "66984",
     "eyeOperated": "Right",
     "requestedAmount": 45000,
     "authValidityDays": 30
   }
   ```

5. **GET /api/insurance/pre-auths** - View all pre-authorizations

#### Test Payments
6. **POST /api/payments/create** - Create payment
   ```json
   {
     "sessionId": "{your-session-id}",
     "patientId": "5a4ca192-8060-4672-b212-cc1e7e8cc081",
     "paymentAmount": 10000,
     "paymentMode": "Cash",
     "paymentDate": "2026-02-23T18:00:00",
     "receiptNumber": "RCP-TEST-001",
     "notes": "Manual test payment"
   }
   ```

7. **GET /api/payments** - View all payments

8. **POST /api/payments/link** - Create payment link
   ```json
   {
     "sessionId": "{your-session-id}",
     "patientId": "5a4ca192-8060-4672-b212-cc1e7e8cc081",
     "linkAmount": 5000,
     "expiryDays": 7,
     "recipientPhone": "+919876543210",
     "recipientEmail": "test@example.com",
     "sendVia": "SMS"
   }
   ```

#### Test Admissions
9. **POST /api/admissions** - Create admission
   ```json
   {
     "sessionId": "{your-session-id}",
     "patientId": "5a4ca192-8060-4672-b212-cc1e7e8cc081",
     "admissionType": "Surgery",
     "plannedAdmissionDate": "2026-02-25T08:00:00",
     "surgeryType": "Cataract Surgery",
     "eyeOperated": "Right",
     "estimatedDischargeDate": "2026-02-26T12:00:00",
     "bedAssigned": "B-101",
     "wardAssigned": "General Ward",
     "surgeonAssigned": "Dr. Test",
     "anesthesiaType": "Local",
     "preOpChecklistCompleted": true,
     "specialInstructions": "Manual test admission"
   }
   ```

10. **GET /api/admissions** - View all admissions

#### Test Consents
11. **POST /api/consents/template** - Create consent template
    ```json
    {
      "templateName": "Manual Test Consent",
      "templateCategory": "SurgeryConsent",
      "templateContent": "<h3>Surgery Consent</h3><p>I, {{PATIENT_NAME}}, consent to {{SURGERY_TYPE}} on {{DATE}}.</p>",
      "requiresPatientSignature": true,
      "requiresWitnessSignature": true,
      "requiresGuardianSignature": false,
      "isActive": true
    }
    ```
    - Copy template `id` from response

12. **POST /api/consents/render** - Render consent
    ```json
    {
      "templateId": "{template-id-from-step-11}",
      "sessionId": "{your-session-id}",
      "patientId": "5a4ca192-8060-4672-b212-cc1e7e8cc081",
      "placeholderValues": {
        "PATIENT_NAME": "Test Patient",
        "SURGERY_TYPE": "Cataract Surgery",
        "DATE": "2026-02-25"
      }
    }
    ```

#### Test Workflow
13. **POST /api/workflow/initialize** - Initialize workflow
    ```json
    {
      "sessionId": "{your-session-id}",
      "patientId": "5a4ca192-8060-4672-b212-cc1e7e8cc081",
      "initialState": "SessionStarted",
      "totalMilestones": 16,
      "expectedCompletionDate": "2026-03-02T17:00:00",
      "workflowType": "PreSurgeryCounseling",
      "priorityLevel": "Normal"
    }
    ```

14. **GET /api/workflow** - View all workflows

15. **GET /api/workflow/progress/{sessionId}** - View workflow progress
    - Use your session ID

---

## Testing Checklist

Mark each as you test:

### Sessions (9 endpoints)
- [ ] POST /api/counseling-sessions - Create
- [ ] GET /api/counseling-sessions - Get all
- [ ] GET /api/counseling-sessions/session/{id} - Get by ID
- [ ] GET /api/counseling-sessions/patient/{patientId} - Get by patient
- [ ] GET /api/counseling-sessions/status/{status} - Get by status
- [ ] PATCH /api/counseling-sessions/session/{id}/status - Update status
- [ ] POST /api/counseling-sessions/session/{id}/notes - Add notes
- [ ] PUT /api/counseling-sessions/session/{id} - Update
- [ ] DELETE /api/counseling-sessions/session/{id} - Delete

### Insurance (11 endpoints)
- [ ] POST /api/insurance/pre-auths - Create pre-auth
- [ ] GET /api/insurance/pre-auths - Get all
- [ ] GET /api/insurance/pre-auths/{id} - Get by ID
- [ ] POST /api/insurance/private-claim - Create private claim
- [ ] POST /api/insurance/government-claim - Create govt claim
- [ ] GET /api/insurance/claims - Get all claims
- [ ] GET /api/insurance/claims/session/{sessionId} - Get by session
- [ ] GET /api/insurance/claims/{id} - Get claim by ID
- [ ] PATCH /api/insurance/claims/{id}/status - Update claim status
- [ ] POST /api/insurance/settlements - Create settlement
- [ ] GET /api/insurance/settlements/{claimId} - Get settlement

### Payments (14 endpoints)
- [ ] POST /api/payments/create - Create payment
- [ ] GET /api/payments - Get all
- [ ] GET /api/payments/{id} - Get by ID
- [ ] GET /api/payments/session/{sessionId} - Get by session
- [ ] POST /api/payments/link - Create link
- [ ] GET /api/payments/links - Get all links
- [ ] GET /api/payments/link/{id} - Get link by ID
- [ ] POST /api/payments/link/{id}/send - Send link
- [ ] PATCH /api/payments/link/{id}/status - Update link status
- [ ] POST /api/payments/refund - Create refund
- [ ] GET /api/payments/refunds - Get all refunds
- [ ] GET /api/payments/refunds/{id} - Get refund by ID
- [ ] PATCH /api/payments/refunds/{id}/process - Process refund
- [ ] GET /api/payments/receipt/{paymentId} - Get receipt

### Admissions (8 endpoints)
- [ ] POST /api/admissions - Create
- [ ] GET /api/admissions - Get all
- [ ] GET /api/admissions/{id} - Get by ID
- [ ] GET /api/admissions/session/{sessionId} - Get by session
- [ ] GET /api/admissions/patient/{patientId} - Get by patient
- [ ] PATCH /api/admissions/{id} - Update
- [ ] PATCH /api/admissions/{id}/status - Update status
- [ ] DELETE /api/admissions/{id} - Delete

### Consents (8 endpoints)
- [ ] POST /api/consents/template - Create template
- [ ] GET /api/consents/templates - Get all templates
- [ ] GET /api/consents/template/{id} - Get template by ID
- [ ] PUT /api/consents/template/{id} - Update template
- [ ] POST /api/consents/render - Render consent
- [ ] GET /api/consents - Get all consents
- [ ] POST /api/consents/{id}/sign - Patient sign
- [ ] POST /api/consents/{id}/witness-sign - Witness sign
- [ ] POST /api/consents/{id}/finalize - Finalize

### Workflow (8 endpoints)
- [ ] POST /api/workflow/initialize - Initialize
- [ ] GET /api/workflow - Get all
- [ ] GET /api/workflow/progress/{sessionId} - Get progress
- [ ] POST /api/workflow/update-stage - Update stage
- [ ] GET /api/workflow/transitions/{sessionId} - Get transitions
- [ ] GET /api/workflow/dependencies/{sessionId} - Get dependencies
- [ ] PATCH /api/workflow/{id}/block - Block workflow
- [ ] DELETE /api/workflow/{id} - Delete

---

## Expected Results

### Success Indicators ✅
- All POST requests return 201 Created or 200 OK
- All GET requests return 200 OK with data
- All PATCH/PUT requests return 200 OK
- Data returned matches what was sent
- IDs are valid GUIDs
- Timestamps are properly formatted
- Status fields are correct

### Common Errors to Watch For ⚠️
- **401 Unauthorized**: Check if token expired (re-login if needed)
- **403 Forbidden**: User doesn't have permission (use admin@test.com)
- **404 Not Found**: Invalid ID or resource deleted
- **400 Bad Request**: Check JSON format and required fields
- **500 Internal Server Error**: Backend issue (check server logs)

---

## Automated Testing Alternative

If manual testing becomes tedious, use the PowerShell script:
```powershell
cd "c:\Users\Sam Aluri\Downloads\Hospital Portal"
.\TEST_COUNSELOR_MODULE.ps1
```

This will automatically test all 58 endpoints and generate a report.

---

## Troubleshooting

### Login Issues
1. Check backend is running: `http://localhost:5073/swagger`
2. Verify tenant ID exists in database
3. Try this direct SQL query (if you have database access):
   ```sql
   SELECT id, email, "TenantId" FROM "AspNetUsers" WHERE email = 'admin@test.com';
   ```

### Permission Issues  
- Ensure user has Admin role
- Check X-Tenant-ID header is set in Swagger
- Re-authorize with fresh token

### Data Not Found
- Verify patient ID exists: `5a4ca192-8060-4672-b212-cc1e7e8cc081`
- Check session was created successfully
- Verify tenant context is correct

---

## Next Steps After Testing

Once manual testing is complete:

1. **Document Results**
   - Note which endpoints work ✅
   - Note any failures ❌
   - Record error messages

2. **Fix Issues**
   - Backend issues: Check `microservices/auth-service/AuthService/Controllers/`
   - Database issues: Check connection and RLS policies
   - Permission issues: Check role assignments

3. **Frontend Testing**
   - Once backend is verified, test frontend at `http://localhost:3000`
   - Login and navigate to Counselor section
   - Test all UI components match backend functionality

4. **Production Readiness**
   - All 58 endpoints working: ✅ Production Ready
   - 50-57 endpoints working: 🟡 Minor fixes needed
   - < 50 endpoints working: 🔴 Major debugging required

---

**Good luck with testing! 🚀**
