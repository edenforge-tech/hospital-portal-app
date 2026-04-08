# Hospital Portal - Test Data Setup Script
# Creates test users and patients

param(
    [string]$ApiUrl = "http://localhost:5073/api",
    [string]$AdminEmail = "admin@test.com",
    [string]$AdminPassword = "Admin123!",
    [string]$TenantId = "155fe198-6ae5-4a01-9254-ead5b427247e"
)

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Hospital Portal - Test Data Setup" -ForegroundColor Cyan  
Write-Host "=====================================" -ForegroundColor Cyan

# Step 1: Login
Write-Host "`n[1/4] Logging in..." -ForegroundColor Yellow
$loginBody = @{
    email = $AdminEmail
    password = $AdminPassword
    tenantId = $TenantId
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$ApiUrl/auth/login" -Method Post -Headers @{"Content-Type"="application/json"} -Body $loginBody -ErrorAction Stop
    $token = $loginResponse.accessToken
    Write-Host "  ✓ Login successful" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Login failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

$authHeaders = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer $token"
    "X-Tenant-ID" = $TenantId
}

# Step 2: Create Test Users
Write-Host "`n[2/4] Creating test users..." -ForegroundColor Yellow

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
        firstName = "John"
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

$userCount = 0

foreach ($user in $testUsers) {
    try {
        $userBody = $user | ConvertTo-Json
        $response = Invoke-RestMethod -Uri "$ApiUrl/users" -Method Post -Headers $authHeaders -Body $userBody -ErrorAction Stop
        $userCount++
        Write-Host "  ✓ Created: $($user.firstName) $($user.lastName)" -ForegroundColor Green
    } catch {
        if ($_.ErrorDetails.Message -like "*already exists*") {
            Write-Host "  ⊙ Already exists: $($user.email)" -ForegroundColor Yellow
        } else {
            Write-Host "  ✗ Failed: $($user.email)" -ForegroundColor Red
        }
    }
}

# Step 3: Create Test Patients
Write-Host "`n[3/4] Creating test patients..." -ForegroundColor Yellow

$testPatients = @(
    @{
        firstName = "Rajesh"
        lastName = "Kumar"
        dateOfBirth = "1975-03-15T00:00:00Z"
        gender = "Male"
        contactNumber = "+919876543220"
        email = "rajesh.kumar@example.com"
        address = "123 MG Road"
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
        address = "456 Park Street"
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
        address = "789 Gandhi Nagar"
        city = "Ahmedabad"
        state = "Gujarat"
        country = "India"
        pincode = "380001"
    }
)

$patientCount = 0
$createdPatients = @()

foreach ($patient in $testPatients) {
    try {
        $patientBody = $patient | ConvertTo-Json
        $response = Invoke-RestMethod -Uri "$ApiUrl/patients" -Method Post -Headers $authHeaders -Body $patientBody -ErrorAction Stop
        $patientCount++
        $createdPatients += $response
        Write-Host "  ✓ Created: $($patient.firstName) $($patient.lastName) - MRN: $($response.medicalRecordNumber)" -ForegroundColor Green
    } catch {
        Write-Host "  ✗ Failed: $($patient.firstName) $($patient.lastName)" -ForegroundColor Red
    }
}

# Step 4: Summary
Write-Host "`n[4/4] Summary" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "Users created: $userCount" -ForegroundColor White
Write-Host "Patients created: $patientCount" -ForegroundColor White

Write-Host "`nTest Credentials:" -ForegroundColor Cyan
Write-Host "  Admin: admin@test.com / Admin123!" -ForegroundColor White
Write-Host "  Counselor: counselor.test@hospital.com / Counselor@12345" -ForegroundColor White
Write-Host "  Doctor: doctor.test@hospital.com / Doctor@12345" -ForegroundColor White
Write-Host "  Payment: payment.test@hospital.com / Payment@12345" -ForegroundColor White

Write-Host "`n✓ Setup complete!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan
