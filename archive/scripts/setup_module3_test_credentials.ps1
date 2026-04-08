# ========================================
# Module 3 Test Credentials Setup Guide
# Creates test users and provides integration test script
# Date: February 23, 2026
# ========================================

$baseUrl = "http://localhost:5073/api"
$ContentType = "application/json"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "🔐 Module 3 Test Credentials Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

Write-Host "`n📋 Prerequisites:" -ForegroundColor Yellow
Write-Host "   1. Backend server running on port 5073" -ForegroundColor Gray
Write-Host "   2. Database migrations applied (13 tables)" -ForegroundColor Gray
Write-Host "   3. Admin user credentials available" -ForegroundColor Gray

# Check if backend is running
Write-Host "`n🔍 Checking backend status..." -ForegroundColor Yellow
try {
    $healthCheck = Invoke-RestMethod -Uri "$baseUrl/../health" -Method GET -ErrorAction SilentlyContinue -TimeoutSec 5
    Write-Host "✅ Backend server is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend server not responding on port 5073" -ForegroundColor Red
    Write-Host "   Start with: cd microservices\auth-service\AuthService; dotnet run" -ForegroundColor Yellow
    exit 1
}

# ========================================
# Step 1: Get Admin Token
# ========================================
Write-Host "`n[Step 1/4] 🔑 Getting admin token..." -ForegroundColor Yellow

$adminCredentials = @{
    username = "admin@hospitalportal.com"
    password = "Admin@123"
}

Write-Host "   Attempting login with: $($adminCredentials.username)" -ForegroundColor Gray

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST `
        -Body ($adminCredentials | ConvertTo-Json) -ContentType $ContentType
    
    $adminToken = $loginResponse.token
    $tenantId = $loginResponse.user.tenantId
    $branchId = $loginResponse.user.branchId
    
    Write-Host "✅ Admin login successful" -ForegroundColor Green
    Write-Host "   Tenant ID: $tenantId" -ForegroundColor Gray
    Write-Host "   Branch ID: $branchId" -ForegroundColor Gray
    
} catch {
    Write-Host "❌ Admin login failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "`n💡 Alternative: Use Swagger UI to create admin user" -ForegroundColor Yellow
    Write-Host "   1. Navigate to: http://localhost:5073/swagger" -ForegroundColor Gray
    Write-Host "   2. Use POST /api/auth/register endpoint" -ForegroundColor Gray
    Write-Host "   3. Create admin user with proper role" -ForegroundColor Gray
    exit 1
}

$adminHeaders = @{
    "Authorization" = "Bearer $adminToken"
    "X-Tenant-ID" = $tenantId
    "Content-Type" = $ContentType
}

# ========================================
# Step 2: Create Test Users
# ========================================
Write-Host "`n[Step 2/4] 👥 Creating test users..." -ForegroundColor Yellow

# Test User 1: Counselor
$counselorPayload = @{
    username = "counselor.test@hospitalportal.com"
    email = "counselor.test@hospitalportal.com"
    password = "Counselor@123"
    firstName = "Test"
    lastName = "Counselor"
    phoneNumber = "+919876543210"
    role = "Counselor"
    departmentIds = @()
    branchIds = @($branchId)
} | ConvertTo-Json

try {
    $counselor = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method POST `
        -Body $counselorPayload -Headers $adminHeaders
    Write-Host "✅ Counselor user created: $($counselor.email)" -ForegroundColor Green
} catch {
    if ($_.Exception.Message -like "*already exists*") {
        Write-Host "⚠️  Counselor user already exists" -ForegroundColor Yellow
    } else {
        Write-Host "❌ Counselor creation failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test User 2: Doctor
$doctorPayload = @{
    username = "doctor.test@hospitalportal.com"
    email = "doctor.test@hospitalportal.com"
    password = "Doctor@123"
    firstName = "Test"
    lastName = "Doctor"
    phoneNumber = "+919876543211"
    role = "Doctor"
    departmentIds = @()
    branchIds = @($branchId)
} | ConvertTo-Json

try {
    $doctor = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method POST `
        -Body $doctorPayload -Headers $adminHeaders
    Write-Host "✅ Doctor user created: $($doctor.email)" -ForegroundColor Green
} catch {
    if ($_.Exception.Message -like "*already exists*") {
        Write-Host "⚠️  Doctor user already exists" -ForegroundColor Yellow
    } else {
        Write-Host "❌ Doctor creation failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test User 3: Payment Officer
$paymentOfficerPayload = @{
    username = "payment.officer@hospitalportal.com"
    email = "payment.officer@hospitalportal.com"
    password = "Payment@123"
    firstName = "Test"
    lastName = "PaymentOfficer"
    phoneNumber = "+919876543212"
    role = "PaymentOfficer"
    departmentIds = @()
    branchIds = @($branchId)
} | ConvertTo-Json

try {
    $paymentOfficer = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method POST `
        -Body $paymentOfficerPayload -Headers $adminHeaders
    Write-Host "✅ Payment Officer user created: $($paymentOfficer.email)" -ForegroundColor Green
} catch {
    if ($_.Exception.Message -like "*already exists*") {
        Write-Host "⚠️  Payment Officer user already exists" -ForegroundColor Yellow
    } else {
        Write-Host "❌ Payment Officer creation failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# ========================================
# Step 3: Create Test Patient
# ========================================
Write-Host "`n[Step 3/4] 🏥 Creating test patient..." -ForegroundColor Yellow

$patientPayload = @{
    firstName = "John"
    lastName = "Doe"
    dateOfBirth = "1980-01-15"
    gender = "Male"
    phoneNumber = "+919876543220"
    email = "john.doe@example.com"
    address = "123 Test Street, Test City"
    bloodGroup = "O+"
    emergencyContactName = "Jane Doe"
    emergencyContactPhone = "+919876543221"
} | ConvertTo-Json

try {
    $patient = Invoke-RestMethod -Uri "$baseUrl/patients" -Method POST `
        -Body $patientPayload -Headers $adminHeaders
    $patientId = $patient.id
    Write-Host "✅ Test patient created: $($patient.firstName) $($patient.lastName)" -ForegroundColor Green
    Write-Host "   Patient ID: $patientId" -ForegroundColor Gray
} catch {
    Write-Host "⚠️  Patient creation skipped: $($_.Exception.Message)" -ForegroundColor Yellow
    # Use placeholder ID for testing
    $patientId = "00000000-0000-0000-0000-000000000001"
}

# ========================================
# Step 4: Save Credentials to File
# ========================================
Write-Host "`n[Step 4/4] 💾 Saving credentials..." -ForegroundColor Yellow

$credentialsFile = Join-Path $PSScriptRoot "TEST_CREDENTIALS_MODULE3.json"

$credentials = @{
    baseUrl = $baseUrl
    tenantId = $tenantId
    branchId = $branchId
    generatedAt = (Get-Date -Format "yyyy-MM-dd HH:mm:ss")
    users = @{
        admin = @{
            username = "admin@hospitalportal.com"
            password = "Admin@123"
            token = $adminToken
        }
        counselor = @{
            username = "counselor.test@hospitalportal.com"
            password = "Counselor@123"
        }
        doctor = @{
            username = "doctor.test@hospitalportal.com"
            password = "Doctor@123"
        }
        paymentOfficer = @{
            username = "payment.officer@hospitalportal.com"
            password = "Payment@123"
        }
    }
    testData = @{
        patientId = $patientId
    }
}

$credentials | ConvertTo-Json -Depth 5 | Out-File $credentialsFile -Encoding UTF8
Write-Host "✅ Credentials saved to: $credentialsFile" -ForegroundColor Green

# ========================================
# Summary
# ========================================
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "✅ Test Credentials Setup Complete" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan

Write-Host "`n📋 Test Users Created:" -ForegroundColor Yellow
Write-Host "   1. Admin: admin@hospitalportal.com / Admin@123" -ForegroundColor Cyan
Write-Host "   2. Counselor: counselor.test@hospitalportal.com / Counselor@123" -ForegroundColor Green
Write-Host "   3. Doctor: doctor.test@hospitalportal.com / Doctor@123" -ForegroundColor Green
Write-Host "   4. Payment Officer: payment.officer@hospitalportal.com / Payment@123" -ForegroundColor Green

Write-Host "`n🏥 Test Data:" -ForegroundColor Yellow
Write-Host "   Patient ID: $patientId" -ForegroundColor Cyan
Write-Host "   Tenant ID: $tenantId" -ForegroundColor Gray
Write-Host "   Branch ID: $branchId" -ForegroundColor Gray

Write-Host "`n📝 Credentials File:" -ForegroundColor Yellow
Write-Host "   Location: $credentialsFile" -ForegroundColor Cyan
Write-Host "   Use with: `$creds = Get-Content $credentialsFile | ConvertFrom-Json" -ForegroundColor Gray

Write-Host "`n🧪 Next Steps:" -ForegroundColor Yellow
Write-Host "   1. Update TEST_MODULE3_COMPLETE.ps1 with new credentials" -ForegroundColor Gray
Write-Host "   2. Run integration tests: .\TEST_MODULE3_COMPLETE.ps1" -ForegroundColor Gray
Write-Host "   3. Test via Swagger UI: http://localhost:5073/swagger" -ForegroundColor Gray

Write-Host "`n"
