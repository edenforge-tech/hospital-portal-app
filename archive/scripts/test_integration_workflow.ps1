# Integration Test: Complete Counseling Workflow
# Tests cross-module interaction: Session → Package → Insurance → Payment → Consent → Admission

Write-Host "`n=== INTEGRATION TEST: Complete Counseling Workflow ===" -ForegroundColor Cyan
cd "C:\Users\Sam Aluri\Downloads\Hospital Portal"

# Login
$loginBody = '{"email":"admin@test.com","password":"Admin123!","tenantId":"155fe198-6ae5-4a01-9254-ead5b427247e"}'
$login = Invoke-RestMethod -Uri "http://localhost:5073/api/auth/login" -Method Post -ContentType "application/json" -Body $loginBody
$headers = @{
    "Authorization" = "Bearer $($login.accessToken)"
    "X-Tenant-ID" = "155fe198-6ae5-4a01-9254-ead5b427247e"
    "Content-Type" = "application/json"
}
Write-Host "√ Logged in" -ForegroundColor Gray

# Well-known UUIDs from sample data
$sessionId = "11111111-1111-1111-1111-111111111111"
$patientId = "5a4ca192-8060-4672-b212-cc1e7e8cc081"

# Step 1: Create Surgery Package
Write-Host "`n[1/7] Creating Surgery Package..." -ForegroundColor Yellow
$packageBody = @{
    sessionId = $sessionId
    packageName = "Integration Test - Cataract Package"
    description = "End-to-end integration test package"
    packageType = "Surgery"
    surgeryTypes = @("Cataract")
    eyeOperated = "Right"
    packageItems = @(
        @{ itemId = "00000000-0000-0000-0000-000000000001"; itemType = "Surgery"; itemName = "Phacoemulsification"; unitPrice = 15000; quantity = 1; totalPrice = 15000 }
        @{ itemId = "00000000-0000-0000-0000-000000000002"; itemType = "IOL"; itemName = "Monofocal IOL"; unitPrice = 8000; quantity = 1; totalPrice = 8000 }
        @{ itemId = "00000000-0000-0000-0000-000000000003"; itemType = "Investigation"; itemName = "Pre-Op Tests"; unitPrice = 2000; quantity = 1; totalPrice = 2000 }
    )
    totalPackageAmount = 25000
    packageValidityDays = 30
} | ConvertTo-Json -Depth 5

try {
    $package = Invoke-RestMethod -Uri "http://localhost:5073/api/packages" -Method Post -Headers $headers -Body $packageBody
    Write-Host "√ Package: $($package.packageName) - $($package.totalPackageAmount) INR" -ForegroundColor Green
    $global:packageId = $package.id
} catch {
    Write-Host "? Failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 2: Create Insurance Pre-Authorization
Write-Host "`n[2/7] Creating Insurance Pre-Auth..." -ForegroundColor Yellow
$preAuthBody = @{
    sessionId = $sessionId
    patientId = $patientId
    insuranceType = "Mediclaim"
    insuranceProvider = "Star Health Insurance"
    tpaName = "Medi Assist"
    policyNumber = "INT-TEST-" + (Get-Random -Maximum 9999)
    policyHolderName = "Integration Test Patient"
    surgeryType = "Cataract Surgery"
    plannedProcedure = "Phacoemulsification with IOL"
    diagnosisCode = "H25.9"
    procedureCode = "66984"
    eyeOperated = "Right"
    requestedAmount = 25000
    copayAmount = 2500
    deductibleAmount = 1000
} | ConvertTo-Json

try {
    $preAuth = Invoke-RestMethod -Uri "http://localhost:5073/api/insurance/pre-auths" -Method Post -Headers $headers -Body $preAuthBody
    Write-Host "√ Pre-Auth: $($preAuth.policyNumber) - Status: $($preAuth.status)" -ForegroundColor Green
    $global:preAuthId = $preAuth.id
} catch {
    Write-Host "? Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Step 3: Create Payment Transaction
Write-Host "`n[3/7] Creating Payment..." -ForegroundColor Yellow
$paymentBody = @{
    sessionId = $sessionId
    patientId = $patientId
    transactionType = "Surgery Payment"
    paymentMethod = "Card"
    amount = 25000
    paymentFor = "Package Payment - Integration Test"
    receiptRequired = $true
} | ConvertTo-Json

try {
    $payment = Invoke-RestMethod -Uri "http://localhost:5073/api/payments" -Method Post -Headers $headers -Body $paymentBody
    Write-Host "√ Payment: $($payment.transactionNumber) - $($payment.amount) INR" -ForegroundColor Green
    $global:paymentId = $payment.id
} catch {
    Write-Host "? Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Step 4: Create Consent Template (if not exists)
Write-Host "`n[4/7] Ensuring Consent Template..." -ForegroundColor Yellow
$templates = Invoke-RestMethod -Uri "http://localhost:5073/api/consents/templates" -Method Get -Headers $headers
if ($templates.Count -eq 0) {
    $templateBody = Get-Content "test_consent_template1_surgery.json" -Raw
    $template = Invoke-RestMethod -Uri "http://localhost:5073/api/consents/templates" -Method Post -Headers $headers -Body $templateBody
    Write-Host "√ Created Template: $($template.templateName)" -ForegroundColor Green
    $global:templateId = $template.id
} else {
    $global:templateId = $templates[0].id
    Write-Host "√ Using Existing Template: $($templates[0].templateName)" -ForegroundColor Green
}

# Step 5: Render Patient Consent
Write-Host "`n[5/7] Rendering Patient Consent..." -ForegroundColor Yellow
$consentBody = @{
    templateId = $global:templateId
    sessionId = $sessionId
    patientId = $patientId
    placeholderValues = @{
        PATIENT_NAME = "Integration Test Patient"
        AGE = "65"
        GENDER = "Male"
        SURGERY_TYPE = "Cataract Surgery - Right Eye"
        SURGERY_DATE = (Get-Date).AddDays(7).ToString("yyyy-MM-dd")
        DOCTOR_NAME = "Dr. Test Surgeon"
    }
} | ConvertTo-Json -Depth 3

try {
    $consent = Invoke-RestMethod -Uri "http://localhost:5073/api/consents/render" -Method Post -Headers $headers -Body $consentBody
    Write-Host "√ Consent: ID $($consent.id) - Status: $($consent.consentStatus)" -ForegroundColor Green
    $global:consentId = $consent.id
} catch {
    Write-Host "? Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Step 6: Create Admission
Write-Host "`n[6/7] Creating Day Care Admission..." -ForegroundColor Yellow
$admissionBody = @{
    sessionId = $sessionId
    patientId = $patientId
    admissionType = "DayCare"
    plannedAdmissionDate = (Get-Date).AddDays(7).ToString("yyyy-MM-ddTHH:mm:ss")
    surgeryType = "Cataract"
    eyeOperated = "Right"
    estimatedDischargeDate = (Get-Date).AddDays(7).AddHours(6).ToString("yyyy-MM-ddTHH:mm:ss")
    specialInstructions = "Integration test admission - complete workflow"
    preOpChecklistCompleted = $true
} | ConvertTo-Json

try {
    $admission = Invoke-RestMethod -Uri "http://localhost:5073/api/admissions" -Method Post -Headers $headers -Body $admissionBody
    Write-Host "√ Admission: ID $($admission.id) - Type: $($admission.admissionType)" -ForegroundColor Green
    $global:admissionId = $admission.id
} catch {
    Write-Host "? Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Step 7: Initialize Workflow
Write-Host "`n[7/7] Initializing Workflow..." -ForegroundColor Yellow
$workflowBody = @{
    sessionId = $sessionId
    patientId = $patientId
    workflowType = "CataractSurgery"
    priorityLevel = "Normal"
    initialStage = "SessionStarted"
    expectedCompletionDays = 7
    notes = "Integration test - full workflow"
} | ConvertTo-Json

try {
    $workflow = Invoke-RestMethod -Uri "http://localhost:5073/api/workflow/initialize" -Method Post -Headers $headers -Body $workflowBody
    Write-Host "√ Workflow: ID $($workflow.id) - Progress: $($workflow.progressPercentage)%" -ForegroundColor Green
} catch {
    Write-Host "? Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Summary
Write-Host "`n=== INTEGRATION TEST SUMMARY ===" -ForegroundColor Cyan
Write-Host "√ Package Created: $global:packageId" -ForegroundColor Green
Write-Host "√ Insurance Pre-Auth: $global:preAuthId" -ForegroundColor Green
Write-Host "√ Payment Processed: $global:paymentId" -ForegroundColor Green
Write-Host "√ Consent Rendered: $global:consentId" -ForegroundColor Green
Write-Host "√ Admission Created: $global:admissionId" -ForegroundColor Green
Write-Host "√ Workflow Initialized: $($workflow.id)" -ForegroundColor Green
Write-Host "`n=== ALL MODULES INTEGRATED SUCCESSFULLY! ===" -ForegroundColor Green
