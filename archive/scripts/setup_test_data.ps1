# Hospital Portal - Test Data Setup Script
# Creates test users, patients, and sample Module 3 data

param(
    [string]$ApiUrl = "http://localhost:5073/api",
    [string]$AdminEmail = "admin@test.com",
    [string]$AdminPassword = "Admin123!",
    [string]$TenantId = "155fe198-6ae5-4a01-9254-ead5b427247e"
)

$ErrorActionPreference = "Stop"

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Hospital Portal - Test Data Setup" -ForegroundColor Cyan  
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Login as Admin
Write-Host "[1/6] Logging in as admin..." -ForegroundColor Yellow
$loginBody = @{
    email = $AdminEmail
    password = $AdminPassword
    tenantId = $TenantId
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$ApiUrl/auth/login" -Method Post -Headers @{"Content-Type"="application/json"} -Body $loginBody
    $token = $loginResponse.accessToken
    Write-Host "✓ Login successful - Token obtained" -ForegroundColor Green
} catch {
    Write-Host "✗ Login failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

$authHeaders = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer $token"
    "X-Tenant-ID" = $TenantId
}

# Step 2: Create Test Users
Write-Host "`n[2/6] Creating test users..." -ForegroundColor Yellow

$testUsers = @(
    @{
        userName = "counselor.test@hospital.com"
        email = "counselor.test@hospital.com"
        password = "Counselor@12345"
        firstName = "Sarah"
        lastName = "Miller"
        userType = "Staff"
        phoneNumber = "+919876543210"
        designation = "Senior Counselor"
        employeeId = "COUNS001"
    },
    @{
        userName = "doctor.test@hospital.com"
        email = "doctor.test@hospital.com"
        password = "Doctor@12345"
        firstName = "Dr. John"
        lastName = "Smith"
        userType = "Staff"
        phoneNumber = "+919876543211"
        designation = "Consultant Ophthalmologist"
        specialization = "Ophthalmology"
        licenseNumber = "MED12345"
        employeeId = "DOC001"
    },
    @{
        userName = "payment.test@hospital.com"
        email = "payment.test@hospital.com"
        password = "Payment@12345"
        firstName = "Michael"
        lastName = "Johnson"
        userType = "Staff"
        phoneNumber = "+919876543212"
        designation = "Payment Officer"
        employeeId = "PAY001"
    }
)

$createdUsers = @()

foreach ($user in $testUsers) {
    try {
        $userBody = $user | ConvertTo-Json
        $response = Invoke-RestMethod -Uri "$ApiUrl/users" -Method Post -Headers $authHeaders -Body $userBody
        $createdUsers += $response
        Write-Host "  ✓ Created: $($user.firstName) $($user.lastName) ($($user.email))" -ForegroundColor Green
    } catch {
        $errorDetails = $_.ErrorDetails.Message
        if ($errorDetails -like "*already exists*" -or $errorDetails -like "*duplicate*") {
            Write-Host "  ⊙ Already exists: $($user.email)" -ForegroundColor Yellow
        } else {
            Write-Host "  ✗ Failed to create $($user.email): $errorDetails" -ForegroundColor Red
        }
    }
}

# Step 3: Create Test Patients
Write-Host "`n[3/6] Creating test patients..." -ForegroundColor Yellow

$testPatients = @(
    @{
        firstName = "Rajesh"
        lastName = "Kumar"
        dateOfBirth = "1975-03-15T00:00:00Z"
        gender = "Male"
        contactNumber = "+919876543220"
        email = "rajesh.kumar@example.com"
        address = "123 MG Road, Bangalore"
        city = "Bangalore"
        state = "Karnataka"
        country = "India"
        pincode = "560001"
    },
    @{
        firstName = "Priya"
        lastName = "Sharma"
        dateOfBirth = "1982-07-22T00:00:00Z"
        gender = "Female"
        contactNumber = "+919876543221"
        email = "priya.sharma@example.com"
        address = "456 Park Street, Mumbai"
        city = "Mumbai"
        state = "Maharashtra"
        country = "India"
        pincode = "400001"
    },
    @{
        firstName = "Amit"
        lastName = "Patel"
        dateOfBirth = "1990-11-08T00:00:00Z"
        gender = "Male"
        contactNumber = "+919876543222"
        email = "amit.patel@example.com"
        address = "789 Gandhi Nagar, Ahmedabad"
        city = "Ahmedabad"
        state = "Gujarat"
        country = "India"
        pincode = "380001"
    }
)

$createdPatients = @()

foreach ($patient in $testPatients) {
    try {
        $patientBody = $patient | ConvertTo-Json
        $response = Invoke-RestMethod -Uri "$ApiUrl/patients" -Method Post -Headers $authHeaders -Body $patientBody
        $createdPatients += $response
        Write-Host "  ✓ Created patient: $($patient.firstName) $($patient.lastName) (MRN: $($response.medicalRecordNumber))" -ForegroundColor Green
    } catch {
        $errorDetails = $_.ErrorDetails.Message
        Write-Host "  ✗ Failed to create $($patient.firstName) $($patient.lastName): $errorDetails" -ForegroundColor Red
    }
}

# Step 4: Create Consent Templates
Write-Host "`n[4/6] Creating consent form templates..." -ForegroundColor Yellow

$surgeryHtml = '<h2>Surgery Consent Form</h2><p>Patient Name: {{PatientName}}</p><p>Date: {{Date}}</p>'

$insuranceHtml = '<h2>Insurance Authorization Form</h2><p>Patient Name: {{PatientName}}</p><p>Policy Number: {{PolicyNumber}}</p>'

$consentTemplates = @(
    @{
        templateName = "Surgery Consent Form"
        templateCode = "SURGERY_CONSENT_V1"
        category = "Surgery"
        htmlContent = $surgeryHtml
        isActive = $true
        requiresWitnessSignature = $true
        requiresGuardianSignature = $false
        version = "1.0"
    },
    @{
        templateName = "Insurance Authorization Form"
        templateCode = "INSURANCE_AUTH_V1"
        category = "Insurance"
        htmlContent = $insuranceHtml
        isActive = $true
        requiresWitnessSignature = $false
        requiresGuardianSignature = $false
        version = "1.0"
    }
)

foreach ($template in $consentTemplates) {
    try {
        $templateBody = $template | ConvertTo-Json
        $response = Invoke-RestMethod -Uri "$ApiUrl/consents/templates" -Method Post -Headers $authHeaders -Body $templateBody
        Write-Host "  ✓ Created template: $($template.templateName)" -ForegroundColor Green
    } catch {
        $errorDetails = $_.ErrorDetails.Message
        if ($errorDetails -like "*already exists*") {
            Write-Host "  ⊙ Template already exists: $($template.templateName)" -ForegroundColor Yellow
        } else {
            Write-Host "  ✗ Failed to create template: $errorDetails" -ForegroundColor Red
        }
    }
}

# Step 5: Summary
Write-Host "`n[5/6] Test Data Summary" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "Test Users Created: $($createdUsers.Count)" -ForegroundColor White
Write-Host "Test Patients Created: $($createdPatients.Count)" -ForegroundColor White
Write-Host ""
Write-Host "Test Credentials:" -ForegroundColor Cyan
Write-Host "  Counselor: counselor.test@hospital.com / Counselor@12345" -ForegroundColor White
Write-Host "  Doctor: doctor.test@hospital.com / Doctor@12345" -ForegroundColor White
Write-Host "  Payment: payment.test@hospital.com / Payment@12345" -ForegroundColor White

if ($createdPatients.Count -gt 0) {
    Write-Host "`nTest Patients:" -ForegroundColor Cyan
    foreach ($patient in $createdPatients) {
        Write-Host "  $($patient.firstName) $($patient.lastName) - MRN: $($patient.medicalRecordNumber)" -ForegroundColor White
    }
}

Write-Host "`n[6/6] ✓ Test data setup complete!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan
