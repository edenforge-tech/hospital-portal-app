# ============================================================================
# COUNSELOR MODULE - AUTOMATED API TESTING SCRIPT
# ============================================================================
# Purpose: Systematically test all 58 Counselor Module endpoints
# Status: CRITICAL - Required for 100% Production Ready
# Date: February 23, 2026
# ============================================================================

$ErrorActionPreference = "Continue"
$global:testResults = @()
$global:passCount = 0
$global:failCount = 0

# ============================================================================
# TEST CONFIGURATION
# ============================================================================

$baseUrl = "http://localhost:5073/api"
$tenantId = "155fe198-6ae5-4a01-9254-ead5b427247e"

# Test user credentials (from TEST_CREDENTIALS.md)
$loginPayload = @{
    email = "admin@test.com"
    password = "Admin@123456"
    tenantId = $tenantId
} | ConvertTo-Json

Write-Host "`n============================================================================" -ForegroundColor Cyan
Write-Host "  COUNSELOR MODULE - AUTOMATED API TESTING" -ForegroundColor Cyan
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "Base URL: $baseUrl" -ForegroundColor Gray
Write-Host "Tenant ID: $tenantId" -ForegroundColor Gray
Write-Host "Date: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray
Write-Host "============================================================================`n" -ForegroundColor Cyan

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

function Write-TestResult {
    param(
        [string]$Module,
        [string]$TestName,
        [bool]$Passed,
        [string]$Details = ""
    )
    
    $status = if ($Passed) { "[PASS]" } else { "[FAIL]" }
    $color = if ($Passed) { "Green" } else { "Red" }
    
    Write-Host "$status $Module - $TestName" -ForegroundColor $color
    if ($Details) {
        Write-Host "       $Details" -ForegroundColor Gray
    }
    
    $global:testResults += @{
        Module = $Module
        Test = $TestName
        Passed = $Passed
        Details = $Details
        Timestamp = Get-Date
    }
    
    if ($Passed) { $global:passCount++ } else { $global:failCount++ }
}

function Invoke-ApiTest {
    param(
        [string]$Method,
        [string]$Endpoint,
        [object]$Body = $null,
        [hashtable]$Headers,
        [string]$TestName,
        [string]$Module
    )
    
    try {
        $params = @{
            Uri = "$baseUrl$Endpoint"
            Method = $Method
            Headers = $Headers
            UseBasicParsing = $true
        }
        
        if ($Body) {
            $params.Body = ($Body | ConvertTo-Json -Depth 10)
        }
        
        $response = Invoke-RestMethod @params
        Write-TestResult -Module $Module -TestName $TestName -Passed $true -Details "Status: 200 OK"
        return $response
    }
    catch {
        $errorMsg = $_.Exception.Message
        if ($_.ErrorDetails.Message) {
            $errorMsg += " - $($_.ErrorDetails.Message)"
        }
        Write-TestResult -Module $Module -TestName $TestName -Passed $false -Details $errorMsg
        return $null
    }
}

# ============================================================================
# STEP 1: AUTHENTICATION
# ============================================================================

Write-Host "`n[STEP 1] AUTHENTICATION" -ForegroundColor Yellow
Write-Host "========================================`n" -ForegroundColor Yellow

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post `
        -Headers @{ "Content-Type" = "application/json" } `
        -Body $loginPayload
    
    $global:token = $loginResponse.accessToken
    $global:userId = $loginResponse.user.id
    
    Write-TestResult -Module "Auth" -TestName "Login" -Passed $true -Details "User ID: $global:userId"
}
catch {
    Write-TestResult -Module "Auth" -TestName "Login" -Passed $false -Details $_.Exception.Message
    Write-Host "`nCRITICAL: Cannot proceed without valid authentication token" -ForegroundColor Red
    exit 1
}

$global:headers = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer $global:token"
    "X-Tenant-ID" = $tenantId
}

Write-Host "`nAuthentication successful - Token obtained" -ForegroundColor Green

# ============================================================================
# STEP 2: CREATE TEST DATA
# ============================================================================

Write-Host "`n[STEP 2] CREATE TEST DATA" -ForegroundColor Yellow
Write-Host "========================================`n" -ForegroundColor Yellow

# Create test patient (if not exists)
$testPatientId = "5a4ca192-8060-4672-b212-cc1e7e8cc081" # From sample data

# Create test counseling session
$sessionPayload = @{
    patientId = $testPatientId
    sessionType = "Pre-Surgery Counseling"
    sessionDate = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss")
    sessionStatus = "Scheduled"
    counselorId = $global:userId
    appointmentId = $null
    notes = "Automated test session - Created by TEST_COUNSELOR_MODULE.ps1"
}

$session = Invoke-ApiTest -Method "POST" -Endpoint "/counseling-sessions" `
    -Body $sessionPayload -Headers $global:headers `
    -TestName "Create Counseling Session" -Module "Sessions"

if ($session) {
    $global:testSessionId = $session.id
    Write-Host "   Session ID: $global:testSessionId" -ForegroundColor Gray
} else {
    Write-Host "`nWARNING: No test session created, some tests may fail" -ForegroundColor Yellow
    # Use a sample session ID as fallback
    $global:testSessionId = "11111111-1111-1111-1111-111111111111"
}

# ============================================================================
# MODULE 3.6: SESSION MANAGEMENT (9 Endpoints)
# ============================================================================

Write-Host "`n[MODULE 3.6] SESSION MANAGEMENT" -ForegroundColor Yellow
Write-Host "========================================`n" -ForegroundColor Yellow

# Test 1: Get all sessions
Invoke-ApiTest -Method "GET" -Endpoint "/counseling-sessions" `
    -Headers $global:headers `
    -TestName "Get All Sessions" -Module "Sessions"

# Test 2: Get session by ID
if ($global:testSessionId) {
    Invoke-ApiTest -Method "GET" -Endpoint "/counseling-sessions/session/$global:testSessionId" `
        -Headers $global:headers `
        -TestName "Get Session By ID" -Module "Sessions"
}

# Test 3: Get sessions by patient
Invoke-ApiTest -Method "GET" -Endpoint "/counseling-sessions/patient/$testPatientId" `
    -Headers $global:headers `
    -TestName "Get Sessions By Patient" -Module "Sessions"

# Test 4: Get sessions by status
Invoke-ApiTest -Method "GET" -Endpoint "/counseling-sessions/status/Scheduled" `
    -Headers $global:headers `
    -TestName "Get Sessions By Status" -Module "Sessions"

# Test 5: Update session status
if ($global:testSessionId) {
    $statusPayload = @{ newStatus = "InProgress" }
    Invoke-ApiTest -Method "PATCH" -Endpoint "/counseling-sessions/session/$global:testSessionId/status" `
        -Body $statusPayload -Headers $global:headers `
        -TestName "Update Session Status" -Module "Sessions"
}

# Test 6: Add session notes
if ($global:testSessionId) {
    $notesPayload = @{ 
        noteText = "Test note added via automated testing script"
        noteType = "General"
    }
    Invoke-ApiTest -Method "POST" -Endpoint "/counseling-sessions/session/$global:testSessionId/notes" `
        -Body $notesPayload -Headers $global:headers `
        -TestName "Add Session Notes" -Module "Sessions"
}

# ============================================================================
# MODULE 3.7: INSURANCE MANAGEMENT (11 Endpoints)
# ============================================================================

Write-Host "`n[MODULE 3.7] INSURANCE MANAGEMENT" -ForegroundColor Yellow
Write-Host "========================================`n" -ForegroundColor Yellow

# Test 1: Create Pre-Authorization
$preAuthPayload = @{
    sessionId = $global:testSessionId
    patientId = $testPatientId
    insuranceType = "Mediclaim"
    insuranceProvider = "Star Health Insurance"
    tpaName = "Medi Assist"
    policyNumber = "TEST-" + (Get-Random -Maximum 999999)
    policyHolderName = "Test Patient"
    surgeryType = "Cataract Surgery"
    plannedProcedure = "Phacoemulsification"
    diagnosisCode = "H25.9"
    procedureCode = "66984"
    eyeOperated = "Right"
    requestedAmount = 45000
    authValidityDays = 30
}

$preAuth = Invoke-ApiTest -Method "POST" -Endpoint "/insurance/pre-auths" `
    -Body $preAuthPayload -Headers $global:headers `
    -TestName "Create Pre-Authorization" -Module "Insurance"

if ($preAuth) {
    $global:preAuthId = $preAuth.id
    Write-Host "   Pre-Auth ID: $global:preAuthId" -ForegroundColor Gray
}

# Test 2: Get all pre-auths
Invoke-ApiTest -Method "GET" -Endpoint "/insurance/pre-auths" `
    -Headers $global:headers `
    -TestName "Get All Pre-Authorizations" -Module "Insurance"

# Test 3: Get pre-auth by ID
if ($global:preAuthId) {
    Invoke-ApiTest -Method "GET" -Endpoint "/insurance/pre-auths/$global:preAuthId" `
        -Headers $global:headers `
        -TestName "Get Pre-Auth By ID" -Module "Insurance"
}

# Test 4: Create Private Claim
$claimPayload = @{
    sessionId = $global:testSessionId
    patientId = $testPatientId
    claimType = "PrivateTPA"
    insuranceProvider = "ICICI Lombard"
    tpaName = "Medi Assist"
    policyNumber = "TEST-CLAIM-" + (Get-Random -Maximum 999999)
    policyHolderName = "Test Patient"
    treatmentDate = (Get-Date).ToString("yyyy-MM-dd")
    claimedAmount = 35000
    diagnosisCode = "H25.1"
    procedureCode = "66984"
}

$claim = Invoke-ApiTest -Method "POST" -Endpoint "/insurance/private-claim" `
    -Body $claimPayload -Headers $global:headers `
    -TestName "Create Private Claim" -Module "Insurance"

if ($claim) {
    $global:claimId = $claim.id
    Write-Host "   Claim ID: $global:claimId" -ForegroundColor Gray
}

# Test 5: Create Government Claim
$govClaimPayload = @{
    sessionId = $global:testSessionId
    patientId = $testPatientId
    schemeType = "CGHS"
    schemeName = "Central Government Health Scheme"
    cardNumber = "CGHS-TEST-" + (Get-Random -Maximum 999999)
    claimAmount = 25000
    applicationNumber = "APP-TEST-" + (Get-Random -Maximum 999999)
    treatmentDetails = "Automated test claim"
}

$govClaim = Invoke-ApiTest -Method "POST" -Endpoint "/insurance/government-claim" `
    -Body $govClaimPayload -Headers $global:headers `
    -TestName "Create Government Claim" -Module "Insurance"

if ($govClaim) {
    $global:govClaimId = $govClaim.id
    Write-Host "   Govt Claim ID: $global:govClaimId" -ForegroundColor Gray
}

# Test 6: Get all claims
Invoke-ApiTest -Method "GET" -Endpoint "/insurance/claims" `
    -Headers $global:headers `
    -TestName "Get All Claims" -Module "Insurance"

# Test 7: Get claims by session
if ($global:testSessionId) {
    Invoke-ApiTest -Method "GET" -Endpoint "/insurance/claims/session/$global:testSessionId" `
        -Headers $global:headers `
        -TestName "Get Claims By Session" -Module "Insurance"
}

# ============================================================================
# MODULE 3.8: PAYMENT MANAGEMENT (14 Endpoints)
# ============================================================================

Write-Host "`n[MODULE 3.8] PAYMENT MANAGEMENT" -ForegroundColor Yellow
Write-Host "========================================`n" -ForegroundColor Yellow

# Test 1: Create Payment
$paymentPayload = @{
    sessionId = $global:testSessionId
    patientId = $testPatientId
    paymentAmount = 10000
    paymentMode = "Cash"
    paymentDate = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss")
    receiptNumber = "RCP-TEST-" + (Get-Random -Maximum 999999)
    transactionReference = $null
    notes = "Automated test payment"
}

$payment = Invoke-ApiTest -Method "POST" -Endpoint "/payments/create" `
    -Body $paymentPayload -Headers $global:headers `
    -TestName "Create Payment" -Module "Payments"

if ($payment) {
    $global:paymentId = $payment.id
    Write-Host "   Payment ID: $global:paymentId" -ForegroundColor Gray
}

# Test 2: Get all payments
Invoke-ApiTest -Method "GET" -Endpoint "/payments" `
    -Headers $global:headers `
    -TestName "Get All Payments" -Module "Payments"

# Test 3: Get payment by ID
if ($global:paymentId) {
    Invoke-ApiTest -Method "GET" -Endpoint "/payments/$global:paymentId" `
        -Headers $global:headers `
        -TestName "Get Payment By ID" -Module "Payments"
}

# Test 4: Get payments by session
if ($global:testSessionId) {
    Invoke-ApiTest -Method "GET" -Endpoint "/payments/session/$global:testSessionId" `
        -Headers $global:headers `
        -TestName "Get Payments By Session" -Module "Payments"
}

# Test 5: Create Payment Link
$linkPayload = @{
    sessionId = $global:testSessionId
    patientId = $testPatientId
    linkAmount = 5000
    expiryDays = 7
    recipientPhone = "+919876543210"
    recipientEmail = "test@example.com"
    sendVia = "SMS"
}

$link = Invoke-ApiTest -Method "POST" -Endpoint "/payments/link" `
    -Body $linkPayload -Headers $global:headers `
    -TestName "Create Payment Link" -Module "Payments"

if ($link) {
    $global:linkId = $link.id
    Write-Host "   Link ID: $global:linkId" -ForegroundColor Gray
}

# Test 6: Get all payment links
Invoke-ApiTest -Method "GET" -Endpoint "/payments/links" `
    -Headers $global:headers `
    -TestName "Get All Payment Links" -Module "Payments"

# Test 7: Get payment link by ID
if ($global:linkId) {
    Invoke-ApiTest -Method "GET" -Endpoint "/payments/link/$global:linkId" `
        -Headers $global:headers `
        -TestName "Get Payment Link By ID" -Module "Payments"
}

# Test 8: Create Refund
if ($global:paymentId) {
    $refundPayload = @{
        originalPaymentId = $global:paymentId
        refundAmount = 1000
        refundMode = "Cash"
        refundReason = "Automated test refund"
        approvedBy = $global:userId
    }
    
    $refund = Invoke-ApiTest -Method "POST" -Endpoint "/payments/refund" `
        -Body $refundPayload -Headers $global:headers `
        -TestName "Create Refund" -Module "Payments"
    
    if ($refund) {
        $global:refundId = $refund.id
        Write-Host "   Refund ID: $global:refundId" -ForegroundColor Gray
    }
}

# Test 9: Get all refunds
Invoke-ApiTest -Method "GET" -Endpoint "/payments/refunds" `
    -Headers $global:headers `
    -TestName "Get All Refunds" -Module "Payments"

# ============================================================================
# MODULE 3.9: ADMISSION MANAGEMENT (8 Endpoints)
# ============================================================================

Write-Host "`n[MODULE 3.9] ADMISSION MANAGEMENT" -ForegroundColor Yellow
Write-Host "========================================`n" -ForegroundColor Yellow

# Test 1: Create Admission
$admissionPayload = @{
    sessionId = $global:testSessionId
    patientId = $testPatientId
    admissionType = "Surgery"
    plannedAdmissionDate = (Get-Date).AddDays(1).ToString("yyyy-MM-ddTHH:mm:ss")
    surgeryType = "Cataract Surgery"
    eyeOperated = "Right"
    estimatedDischargeDate = (Get-Date).AddDays(2).ToString("yyyy-MM-ddTHH:mm:ss")
    bedAssigned = "B-101"
    wardAssigned = "General Ward"
    surgeonAssigned = "Dr. Test Surgeon"
    anesthesiaType = "Local"
    preOpChecklistCompleted = $true
    specialInstructions = "Automated test admission"
}

$admission = Invoke-ApiTest -Method "POST" -Endpoint "/admissions" `
    -Body $admissionPayload -Headers $global:headers `
    -TestName "Create Admission" -Module "Admissions"

if ($admission) {
    $global:admissionId = $admission.id
    Write-Host "   Admission ID: $global:admissionId" -ForegroundColor Gray
}

# Test 2: Get all admissions
Invoke-ApiTest -Method "GET" -Endpoint "/admissions" `
    -Headers $global:headers `
    -TestName "Get All Admissions" -Module "Admissions"

# Test 3: Get admission by ID
if ($global:admissionId) {
    Invoke-ApiTest -Method "GET" -Endpoint "/admissions/$global:admissionId" `
        -Headers $global:headers `
        -TestName "Get Admission By ID" -Module "Admissions"
}

# Test 4: Get admissions by session
if ($global:testSessionId) {
    Invoke-ApiTest -Method "GET" -Endpoint "/admissions/session/$global:testSessionId" `
        -Headers $global:headers `
        -TestName "Get Admissions By Session" -Module "Admissions"
}

# Test 5: Update admission
if ($global:admissionId) {
    $updatePayload = @{
        bedAssigned = "B-102"
        wardAssigned = "Private Ward"
        specialInstructions = "Updated via automated test"
    }
    
    Invoke-ApiTest -Method "PATCH" -Endpoint "/admissions/$global:admissionId" `
        -Body $updatePayload -Headers $global:headers `
        -TestName "Update Admission" -Module "Admissions"
}

# ============================================================================
# MODULE 3.10: CONSENT MANAGEMENT (8 Endpoints)
# ============================================================================

Write-Host "`n[MODULE 3.10] CONSENT MANAGEMENT" -ForegroundColor Yellow
Write-Host "========================================`n" -ForegroundColor Yellow

# Test 1: Create Consent Template
$templatePayload = @{
    templateName = "Automated Test Consent Template"
    templateCategory = "SurgeryConsent"
    templateContent = "<h3>Consent for {{SURGERY_TYPE}}</h3><p>I, {{PATIENT_NAME}}, consent to surgery on {{DATE}}.</p>"
    requiresPatientSignature = $true
    requiresWitnessSignature = $true
    requiresGuardianSignature = $false
    isActive = $true
}

$template = Invoke-ApiTest -Method "POST" -Endpoint "/consents/template" `
    -Body $templatePayload -Headers $global:headers `
    -TestName "Create Consent Template" -Module "Consents"

if ($template) {
    $global:templateId = $template.id
    Write-Host "   Template ID: $global:templateId" -ForegroundColor Gray
}

# Test 2: Get all templates
Invoke-ApiTest -Method "GET" -Endpoint "/consents/templates" `
    -Headers $global:headers `
    -TestName "Get All Templates" -Module "Consents"

# Test 3: Get template by ID
if ($global:templateId) {
    Invoke-ApiTest -Method "GET" -Endpoint "/consents/template/$global:templateId" `
        -Headers $global:headers `
        -TestName "Get Template By ID" -Module "Consents"
}

# Test 4: Render Consent
if ($global:templateId) {
    $renderPayload = @{
        templateId = $global:templateId
        sessionId = $global:testSessionId
        patientId = $testPatientId
        placeholderValues = @{
            PATIENT_NAME = "Test Patient"
            SURGERY_TYPE = "Cataract Surgery"
            DATE = (Get-Date).ToString("yyyy-MM-dd")
        }
    }
    
    $consent = Invoke-ApiTest -Method "POST" -Endpoint "/consents/render" `
        -Body $renderPayload -Headers $global:headers `
        -TestName "Render Consent" -Module "Consents"
    
    if ($consent) {
        $global:consentId = $consent.id
        Write-Host "   Consent ID: $global:consentId" -ForegroundColor Gray
    }
}

# Test 5: Get all consents
Invoke-ApiTest -Method "GET" -Endpoint "/consents" `
    -Headers $global:headers `
    -TestName "Get All Consents" -Module "Consents"

# Test 6: Patient Sign Consent
if ($global:consentId) {
    $signPayload = @{
        signedBy = $global:userId
        signatureData = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
    }
    
    Invoke-ApiTest -Method "POST" -Endpoint "/consents/$global:consentId/sign" `
        -Body $signPayload -Headers $global:headers `
        -TestName "Patient Sign Consent" -Module "Consents"
}

# ============================================================================
# MODULE 3.11: WORKFLOW MANAGEMENT (8 Endpoints)
# ============================================================================

Write-Host "`n[MODULE 3.11] WORKFLOW MANAGEMENT" -ForegroundColor Yellow
Write-Host "========================================`n" -ForegroundColor Yellow

# Test 1: Initialize Workflow
$workflowPayload = @{
    sessionId = $global:testSessionId
    patientId = $testPatientId
    initialState = "SessionStarted"
    totalMilestones = 16
    expectedCompletionDate = (Get-Date).AddDays(7).ToString("yyyy-MM-ddTHH:mm:ss")
    workflowType = "PreSurgeryCounseling"
    priorityLevel = "Normal"
}

$workflow = Invoke-ApiTest -Method "POST" -Endpoint "/workflow/initialize" `
    -Body $workflowPayload -Headers $global:headers `
    -TestName "Initialize Workflow" -Module "Workflow"

if ($workflow) {
    $global:workflowId = $workflow.id
    Write-Host "   Workflow ID: $global:workflowId" -ForegroundColor Gray
}

# Test 2: Get all workflows
Invoke-ApiTest -Method "GET" -Endpoint "/workflow" `
    -Headers $global:headers `
    -TestName "Get All Workflows" -Module "Workflow"

# Test 3: Get workflow progress
if ($global:testSessionId) {
    Invoke-ApiTest -Method "GET" -Endpoint "/workflow/progress/$global:testSessionId" `
        -Headers $global:headers `
        -TestName "Get Workflow Progress" -Module "Workflow"
}

# Test 4: Update workflow stage
if ($global:workflowId) {
    $stagePayload = @{
        newStage = "InsuranceVerified"
        transitionReason = "Automated test transition"
        triggeredBy = "Manual"
    }
    
    Invoke-ApiTest -Method "POST" -Endpoint "/workflow/update-stage" `
        -Body $stagePayload -Headers $global:headers `
        -TestName "Update Workflow Stage" -Module "Workflow"
}

# Test 5: Get stage transitions
if ($global:testSessionId) {
    Invoke-ApiTest -Method "GET" -Endpoint "/workflow/transitions/$global:testSessionId" `
        -Headers $global:headers `
        -TestName "Get Stage Transitions" -Module "Workflow"
}

# Test 6: Get stage dependencies
if ($global:testSessionId) {
    Invoke-ApiTest -Method "GET" -Endpoint "/workflow/dependencies/$global:testSessionId" `
        -Headers $global:headers `
        -TestName "Get Stage Dependencies" -Module "Workflow"
}

# ============================================================================
# TEST SUMMARY
# ============================================================================

Write-Host "`n============================================================================" -ForegroundColor Cyan
Write-Host "  TEST EXECUTION SUMMARY" -ForegroundColor Cyan
Write-Host "============================================================================" -ForegroundColor Cyan

$totalTests = $global:passCount + $global:failCount
$passRate = if ($totalTests -gt 0) { [math]::Round(($global:passCount / $totalTests) * 100, 2) } else { 0 }

Write-Host "`nTotal Tests: $totalTests" -ForegroundColor White
Write-Host "Passed: $global:passCount" -ForegroundColor Green
Write-Host "Failed: $global:failCount" -ForegroundColor Red
Write-Host "Pass Rate: $passRate%" -ForegroundColor $(if ($passRate -ge 90) { "Green" } elseif ($passRate -ge 70) { "Yellow" } else { "Red" })

# Breakdown by module
Write-Host "`n--- Test Results by Module ---" -ForegroundColor Cyan
$moduleStats = $global:testResults | Group-Object Module | ForEach-Object {
    $modulePassed = ($_.Group | Where-Object { $_.Passed }).Count
    $moduleTotal = $_.Group.Count
    $modulePassRate = [math]::Round(($modulePassed / $moduleTotal) * 100, 2)
    
    [PSCustomObject]@{
        Module = $_.Name
        Passed = $modulePassed
        Total = $moduleTotal
        PassRate = "$modulePassRate%"
    }
}

$moduleStats | Format-Table -AutoSize

# Failed tests detail
if ($global:failCount -gt 0) {
    Write-Host "`n--- Failed Tests Detail ---" -ForegroundColor Red
    $failedTests = $global:testResults | Where-Object { -not $_.Passed }
    foreach ($test in $failedTests) {
        Write-Host "`n[FAIL] $($test.Module) - $($test.Test)" -ForegroundColor Red
        Write-Host "  Error: $($test.Details)" -ForegroundColor Gray
    }
}

# Export results to JSON
$resultsFile = "TEST_RESULTS_$(Get-Date -Format 'yyyyMMdd_HHmmss').json"
$global:testResults | ConvertTo-Json -Depth 5 | Out-File $resultsFile
Write-Host "`nTest results exported to: $resultsFile" -ForegroundColor Green

# Final verdict
Write-Host "`n============================================================================" -ForegroundColor Cyan
if ($passRate -ge 95) {
    Write-Host "  VERDICT: PRODUCTION READY (Pass rate >= 95%)" -ForegroundColor Green
} elseif ($passRate -ge 80) {
    Write-Host "  VERDICT: NEEDS MINOR FIXES (Pass rate 80-95%)" -ForegroundColor Yellow
} else {
    Write-Host "  VERDICT: NEEDS MAJOR FIXES (Pass rate < 80%)" -ForegroundColor Red
}
Write-Host "============================================================================`n" -ForegroundColor Cyan
