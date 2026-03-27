# Module 3 API Testing Guide

## Prerequisites
- Backend server running on http://localhost:5073
- Admin credentials: admin@test.com / Admin123!
- Tenant ID: 155fe198-6ae5-4a01-9254-ead5b427247e

## Step 1: Create Test Users via Swagger UI

### Access Swagger UI
1. Open browser: http://localhost:5073/swagger
2. Click "Authorize" button (top right)
3. Enter: `Bearer YOUR_ADMIN_TOKEN`
4. Click "Authorize" and "Close"

### Create Counselor User
1. Navigate to POST `/api/users`
2. Click "Try it out"
3. Use this JSON:
```json
{
  "userName": "counselor.test@hospital.com",
  "email": "counselor.test@hospital.com",
  "password": "Counselor@12345",
  "firstName": "Sarah",
  "lastName": "Miller",
  "userType": "Staff"
,
  "phoneNumber": "+919876543210",
  "designation": "Senior Counselor",
  "employeeId": "COUNS001"
}
```

### Create Doctor User
```json
{
  "userName": "doctor.test@hospital.com",
  "email": "doctor.test@hospital.com",
  "password": "Doctor@12345",
  "firstName": "John",
  "lastName": "Smith",
  "userType": "Staff",
  "phoneNumber": "+919876543211",
  "designation": "Consultant",
  "specialization": "Ophthalmology",
  "licenseNumber": "MED12345",
  "employeeId": "DOC001"
}
```

### Create Payment Officer User
```json
{
  "userName": "payment.test@hospital.com",
  "email": "payment.test@hospital.com",
  "password": "Payment@12345",
  "firstName": "Michael",
  "lastName": "Johnson",
  "userType": "Staff",
  "phoneNumber": "+919876543212",
  "designation": "Payment Officer",
  "employeeId": "PAY001"
}
```

## Step 2: Create Test Patients

### Patient 1 - Rajesh Kumar
```json
{
  "firstName": "Rajesh",
  "lastName": "Kumar",
  "dateOfBirth": "1975-03-15T00:00:00Z",
  "gender": "Male",
  "contactNumber": "+919876543220",
  "email": "rajesh.kumar@example.com",
  "address": "123 MG Road",
  "city": "Bangalore",
  "state": "Karnataka",
  "country": "India",
  "pincode": "560001"
}
```

### Patient 2 - Priya Sharma
```json
{
  "firstName": "Priya",
  "lastName": "Sharma",
  "dateOfBirth": "1982-07-22T00:00:00Z",
  "gender": "Female",
  "contactNumber": "+919876543221",
  "email": "priya.sharma@example.com",
  "address": "456 Park Street",
  "city": "Mumbai",
  "state": "Maharashtra",
  "country": "India",
  "pincode": "400001"
}
```

### Patient 3 - Amit Patel
```json
{
  "firstName": "Amit",
  "lastName": "Patel",
  "dateOfBirth": "1990-11-08T00:00:00Z",
  "gender": "Male",
  "contactNumber": "+919876543222",
  "email": "amit.patel@example.com",
  "address": "789 Gandhi Nagar",
  "city": "Ahmedabad",
  "state": "Gujarat",
  "country": "India",
  "pincode": "380001"
}
```

## Step 3: Test Module 3 Endpoints

### Module 3.6 - Insurance Pre-Authorization Workflow

#### **Test 1: Create Insurance Pre-Authorization**
Endpoint: `POST /api/insurance/pre-authorizations`

```json
{
  "patientId": "PATIENT_ID_FROM_STEP_2",
  "insuranceProvider": "ICICI Lombard",
  "policyNumber": "POL123456789",
  "estimatedAmount": 150000.00,
  "surgeryType": "Cataract Surgery",
  "surgeryDate": "2026-03-15T10:00:00Z",
  "diagnosis": "Bilateral Cataract",
  "requestedBy": "Dr. John Smith",
  "notes": "Patient requires bilateral cataract surgery. Pre-authorization needed."
}
```

Expected Response: 201 Created with pre-authorization ID

#### **Test 2: Submit to TPA**
Endpoint: `POST /api/insurance/pre-authorizations/{id}/submit-to-tpa`

```json
{
  "tpaName": "Medi Assist",
  "tpaContactPerson": "Rahul Kumar",
  "tpaEmail": "rahul@mediassist.in",
  "tpaPhone": "+919876543300",
  "urgencyLevel": "Normal"
}
```

#### **Test 3: Upload Insurance Document**
Endpoint: `POST /api/insurance/documents`

```json
{
  "preauthorizationId": "PREAUTH_ID_FROM_TEST_1",
  "documentType": "PolicyCopy",
  "fileName": "policy_copy.pdf",
  "filePath": "/documents/insurance/policy_copy.pdf",
  "uploadedBy": "USER_ID"
}
```

#### **Test 4: Get Pre-Authorization Status**
Endpoint: `GET /api/insurance/pre-authorizations/{id}`

Expected Response: Full pre-authorization details with current status

### Module 3.7 - Payment Processing

#### **Test 5: Create Payment Transaction**
Endpoint: `POST /api/payments/transactions`

```json
{
  "patientId": "PATIENT_ID",
  "amount": 50000.00,
  "paymentMethod": "Cash",
  "paymentFor": "Surgery Advance",
  "referenceNumber": "PAY20260223001",
  "notes": "Advance payment for cataract surgery"
}
```

#### **Test 6: Generate Payment Link**
Endpoint: `POST /api/payments/links`

```json
{
  "patientId": "PATIENT_ID",
  "amount": 100000.00,
  "purpose": "Surgery Full Payment",
  "expiryHours": 48,
  "allowPartialPayment": false,
  "sendSms": true,
  "sendEmail": true
}
```

#### **Test 7: Create Government Scheme Claim**
Endpoint: `POST /api/payments/government-schemes`

```json
{
  "patientId": "PATIENT_ID",
  "schemeName": "Ayushman Bharat",
  "schemeId": "AB1234567890",
  "claimAmount": 150000.00,
  "approvedAmount": 0,
  "claimedServices": "Cataract Surgery - Both Eyes",
  "hospitalClaimNumber": "CLAIM2026001"
}
```

### Module 3.8 - Admission Management

####  **Test 8: Create Patient Admission**
Endpoint: `POST /api/admissions`

```json
{
  "patientId": "PATIENT_ID",
  "admissionType": "DayCare",
  "admissionDate": "2026-03-15T08:00:00Z",
  "expectedDischargeDate": "2026-03-15T18:00:00Z",
  "admittingDoctor": "Dr. John Smith",
  "department": "Ophthalmology",
  "reason": "Scheduled cataract surgery",
  "notes": "Day care admission for bilateral cataract surgery"
}
```

#### **Test 9: Reserve Bed**
Endpoint: `POST /api/admissions/bed-reservations`

```json
{
  "admissionId": "ADMISSION_ID_FROM_TEST_8",
  "bedNumber": "DC-101",
  "ward": "Day Care Ward",
  "bedCategory": "DayCare",
  "reservationStartTime": "2026-03-15T08:00:00Z",
  "reservationEndTime": "2026-03-15T18:00:00Z"
}
```

### Module 3.9 - Consent Management

#### **Test 10: Create Consent Template**
Endpoint: `POST /api/consents/templates`

```json
{
  "templateName": "Surgery Consent Form - Cataract",
  "templateCode": "SURG_CAT_V1",
  "category": "Surgery",
  "htmlContent": "<h2>Cataract Surgery Consent</h2><p>Patient: {{PatientName}}</p><p>I consent to cataract surgery.</p>",
  "isActive": true,
  "requiresWitnessSignature": true,
  "requiresGuardianSignature": false,
  "version": "1.0"
}
```

#### **Test 11: Create Patient Consent**
Endpoint: `POST /api/consents`

```json
{
  "patientId": "PATIENT_ID",
  "templateId": "TEMPLATE_ID_FROM_TEST_10",
  "consentType": "Surgery",
  "customContent": null,
  "relatedEntityType": "Admission",
  "relatedEntityId": "ADMISSION_ID"
}
```

#### **Test 12: Submit Consent Signatures**
Endpoint: `POST /api/consents/{id}/signatures`

```json
{
  "patientSignature": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA...",
  "witnessSignature": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA...",
  "guardianSignature": null,
  "patientName": "Rajesh Kumar",
  "witnessName": "Sarah Miller",
  "signedAt": "2026-02-23T12:00:00Z"
}
```

### Module 3.10 - Workflow Orchestration

#### **Test 13: Create Counseling Workflow**
Endpoint: `POST /api/workflow/counseling-workflows`

```json
{
  "patientId": "PATIENT_ID",
  "counselorId": "COUNSELOR_USER_ID",
  "surgeryType": "Cataract",
  "estimatedCost": 150000.00,
  "insuranceApplicable": true,
  "paymentPlan": "Insurance + Partial Payment"
}
```

#### **Test 14: Update Workflow Stage**
Endpoint: `PUT /api/workflow/counseling-workflows/{id}/stage`

```json
{
  "newStage": "InsuranceVerification",
  "notes": "Insurance policy verified with ICICI Lombard",
  "updatedBy": "COUNSELOR_USER_ID"
}
```

#### **Test 15: Add Workflow Transition**
Endpoint: `POST /api/workflow/counseling-workflows/{id}/transitions`

```json
{
  "fromStage": "Initial",
  "toStage": "InsuranceVerification",
  "transitionReason": "Insurance details submitted",
  "performedBy": "COUNSELOR_USER_ID",
  "notes": "Policy number: POL123456789"
}
```

## Expected Results Summary

| Module | Endpoint | Expected Status | Notes |
|--------|----------|----------------|-------|
| 3.6 | POST /insurance/pre-authorizations | 201 | Creates pre-auth record |
| 3.6 | GET /insurance/pre-authorizations/{id} | 200 | Returns pre-auth details |
| 3.7 | POST /payments/transactions | 201 | Creates payment record |
| 3.7 | POST /payments/links | 201 | Generates payment link |
| 3.8 | POST /admissions | 201 | Creates admission |
| 3.8 | POST /admissions/bed-reservations | 201 | Reserves bed |
| 3.9 | POST /consents/templates | 201 | Creates template |
| 3.9 | POST /consents | 201 | Creates consent |
| 3.10 | POST /workflow/counseling-workflows | 201 | Creates workflow |
| 3.10 | PUT /workflow/counseling-workflows/{id}/stage | 200 | Updates stage |

## Automated Testing Script

Run this PowerShell script to test all endpoints:

```powershell
# Save Module 3 endpoint IDs for reference
$results = @{}

# Test Module 3.6 - Insurance
Write-Host "Testing Module 3.6 - Insurance..." -ForegroundColor Cyan
# (Add API calls here)

# Test Module 3.7 - Payments  
Write-Host "Testing Module 3.7 - Payments..." -ForegroundColor Cyan
# (Add API calls here)

# Test Module 3.8 - Admissions
Write-Host "Testing Module 3.8 - Admissions..." -ForegroundColor Cyan
# (Add API calls here)

# Test Module 3.9 - Consents
Write-Host "Testing Module 3.9 - Consents..." -ForegroundColor Cyan
# (Add API calls here)

# Test Module 3.10 - Workflow
Write-Host "Testing Module 3.10 - Workflow..." -ForegroundColor Cyan
# (Add API calls here)
```

## Success Criteria
- ✅ All POST endpoints return 201 Created
- ✅ All GET endpoints return 200 OK with data
- ✅ All PUT endpoints return 200 OK
- ✅ Workflow can progress through all stages
- ✅ Data persists across requests
- ✅ Foreign key relationships maintained
