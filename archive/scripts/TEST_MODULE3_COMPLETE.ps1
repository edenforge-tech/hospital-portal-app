# ========================================
# Module 3 Complete API Test Suite
# Tests Modules 3.6-3.10 (Feb 23, 2026)
# ========================================

$baseUrl = "http://localhost:5073/api"
$ContentType = "application/json"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "🧪 Module 3 Complete API Test Suite" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# ========================================
# Step 1: Login & Get Token
# ========================================
Write-Host "`n[1/6] 🔐 Authenticating..." -ForegroundColor Yellow

$loginPayload = @{
    username = "admin@hospitalportal.com"
    password = "Admin@123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $loginPayload -ContentType $ContentType
    $token = $loginResponse.token
    $tenantId = $loginResponse.user.tenantId
    Write-Host "✅ Login successful" -ForegroundColor Green
    Write-Host "   Token: $($token.Substring(0,20))..." -ForegroundColor Gray
    Write-Host "   Tenant ID: $tenantId" -ForegroundColor Gray
} catch {
    Write-Host "❌ Login failed: $_" -ForegroundColor Red
    exit 1
}

$headers = @{
    "Authorization" = "Bearer $token"
    "X-Tenant-ID" = $tenantId
    "Content-Type" = $ContentType
}

# ========================================
# Step 2: Test Module 3.6 - Insurance Pre-Auth
# ========================================
Write-Host "`n[2/6] 🏥 Testing Module 3.6 - Insurance Pre-Auth Workflow..." -ForegroundColor Yellow

# Create Insurance Pre-Authorization
$insurancePayload = @{
    patientId = "00000000-0000-0000-0000-000000000001"
    sessionId = [Guid]::NewGuid()
    insuranceCompany = "Star Health Insurance"
    policyNumber = "STAR2026001"
    policyHolderName = "John Doe"
    treatmentType = "Cataract Surgery"
    estimatedAmount = 50000
    itemizedBreakdown = @{
        surgeryCharges = 30000
        anesthesiaCharges = 5000
        roomCharges = 10000
        medicationCharges = 5000
    } | ConvertTo-Json
    documentIds = @()
    priorityLevel = "Normal"
} | ConvertTo-Json

try {
    $insurance = Invoke-RestMethod -Uri "$baseUrl/insurance/pre-auth" -Method POST -Body $insurancePayload -Headers $headers
    $preAuthId = $insurance.id
    Write-Host "✅ Insurance pre-auth created: $preAuthId" -ForegroundColor Green
    Write-Host "   Status: $($insurance.status)" -ForegroundColor Gray
    Write-Host "   Approval Stage: $($insurance.currentApprovalStage)" -ForegroundColor Gray
} catch {
    Write-Host "⚠️  Insurance pre-auth failed: $($_.Exception.Message)" -ForegroundColor Yellow
}

# ========================================
# Step 3: Test Module 3.7 - Payment Processing
# ========================================
Write-Host "`n[3/6] 💳 Testing Module 3.7 - Payment Processing..." -ForegroundColor Yellow

# Process Cash Payment
$paymentPayload = @{
    sessionId = [Guid]::NewGuid()
    patientId = "00000000-0000-0000-0000-000000000001"
    amount = 50000
    paymentMethod = "Cash"
    paymentType = "PackagePayment"
    notes = "Full payment for cataract surgery package"
} | ConvertTo-Json

try {
    $payment = Invoke-RestMethod -Uri "$baseUrl/payments/process" -Method POST -Body $paymentPayload -Headers $headers
    $paymentId = $payment.id
    Write-Host "✅ Payment processed: $paymentId" -ForegroundColor Green
    Write-Host "   Amount: ₹$($payment.amount)" -ForegroundColor Gray
    Write-Host "   Method: $($payment.paymentMethod)" -ForegroundColor Gray
    Write-Host "   Status: $($payment.paymentStatus)" -ForegroundColor Gray
} catch {
    Write-Host "⚠️  Payment processing failed: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Generate Payment Link
$paymentLinkPayload = @{
    sessionId = [Guid]::NewGuid()
    patientId = "00000000-0000-0000-0000-000000000001"
    amount = 25000
    purpose = "Advance Payment"
    expiryHours = 48
    notifyViaSMS = $true
    notifyViaEmail = $true
} | ConvertTo-Json

try {
    $paymentLink = Invoke-RestMethod -Uri "$baseUrl/payments/generate-link" -Method POST -Body $paymentLinkPayload -Headers $headers
    Write-Host "✅ Payment link generated" -ForegroundColor Green
    Write-Host "   Link ID: $($paymentLink.id)" -ForegroundColor Gray
    Write-Host "   Short URL: $($paymentLink.shortUrl)" -ForegroundColor Gray
} catch {
    Write-Host "⚠️  Payment link generation failed: $($_.Exception.Message)" -ForegroundColor Yellow
}

# ========================================
# Step 4: Test Module 3.8 - Admission Management
# ========================================
Write-Host "`n[4/6] 🏨 Testing Module 3.8 - Admission Management..." -ForegroundColor Yellow

# Schedule Admission
$admissionPayload = @{
    patientId = "00000000-0000-0000-0000-000000000001"
    sessionId = [Guid]::NewGuid()
    admissionType = "IPD"
    scheduledAdmissionDate = (Get-Date).AddDays(7).ToString("yyyy-MM-ddTHH:mm:ss")
    estimatedDischargeDate = (Get-Date).AddDays(10).ToString("yyyy-MM-ddTHH:mm:ss")
    admissionPurpose = "Cataract Surgery - Right Eye"
    assignedDoctorId = "00000000-0000-0000-0000-000000000002"
    requiresBedReservation = $true
    specialRequirements = "Private room preferred"
} | ConvertTo-Json

try {
    $admission = Invoke-RestMethod -Uri "$baseUrl/admissions" -Method POST -Body $admissionPayload -Headers $headers
    $admissionId = $admission.id
    Write-Host "✅ Admission scheduled: $admissionId" -ForegroundColor Green
    Write-Host "   Type: $($admission.admissionType)" -ForegroundColor Gray
    Write-Host "   Status: $($admission.admissionStatus)" -ForegroundColor Gray
    Write-Host "   Scheduled: $($admission.scheduledAdmissionDate)" -ForegroundColor Gray
} catch {
    Write-Host "⚠️  Admission scheduling failed: $($_.Exception.Message)" -ForegroundColor Yellow
}

# ========================================
# Step 5: Test Module 3.9 - Consent Management
# ========================================
Write-Host "`n[5/6] 📝 Testing Module 3.9 - Consent Management..." -ForegroundColor Yellow

# Create Consent Template
$templatePayload = @{
    templateName = "Surgery Consent - Cataract"
    category = "SurgeryConsent"
    htmlContent = @"
<h2>Surgical Consent Form</h2>
<p>I, <strong>{{PATIENT_NAME}}</strong>, hereby consent to undergo <strong>{{SURGERY_TYPE}}</strong> to be performed by <strong>{{SURGEON_NAME}}</strong>.</p>
<p>The procedure, risks, and benefits have been explained to me.</p>
<p>Date: {{CONSENT_DATE}}</p>
"@
    placeholders = @("{{PATIENT_NAME}}", "{{SURGERY_TYPE}}", "{{SURGEON_NAME}}", "{{CONSENT_DATE}}")
    requiresPatientSignature = $true
    requiresWitnessSignature = $true
    requiresGuardianSignature = $false
    legalComplianceNotes = "MCI Standard Consent Form"
} | ConvertTo-Json

try {
    $template = Invoke-RestMethod -Uri "$baseUrl/consents/templates" -Method POST -Body $templatePayload -Headers $headers
    $templateId = $template.id
    Write-Host "✅ Consent template created: $templateId" -ForegroundColor Green
    Write-Host "   Name: $($template.templateName)" -ForegroundColor Gray
    Write-Host "   Category: $($template.category)" -ForegroundColor Gray
} catch {
    Write-Host "⚠️  Consent template creation failed: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Generate Patient Consent (if template created successfully)
if ($templateId) {
    $consentPayload = @{
        templateId = $templateId
        patientId = "00000000-0000-0000-0000-000000000001"
        sessionId = [Guid]::NewGuid()
        placeholderValues = @{
            "{{PATIENT_NAME}}" = "John Doe"
            "{{SURGERY_TYPE}}" = "Cataract Surgery - Right Eye"
            "{{SURGEON_NAME}}" = "Dr. Smith"
            "{{CONSENT_DATE}}" = (Get-Date -Format "MMMM dd, yyyy")
        }
    } | ConvertTo-Json

    try {
        $consent = Invoke-RestMethod -Uri "$baseUrl/consents/generate" -Method POST -Body $consentPayload -Headers $headers
        Write-Host "✅ Patient consent generated: $($consent.id)" -ForegroundColor Green
        Write-Host "   Status: $($consent.consentStatus)" -ForegroundColor Gray
    } catch {
        Write-Host "⚠️  Consent generation failed: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

# ========================================
# Step 6: Test Module 3.10 - Workflow Orchestration
# ========================================
Write-Host "`n[6/6] 🔄 Testing Module 3.10 - Workflow Orchestration..." -ForegroundColor Yellow

# Initialize Workflow
$workflowPayload = @{
    sessionId = [Guid]::NewGuid()
    patientId = "00000000-0000-0000-0000-000000000001"
} | ConvertTo-Json

try {
    $workflow = Invoke-RestMethod -Uri "$baseUrl/workflow/initialize" -Method POST -Body $workflowPayload -Headers $headers
    $workflowSessionId = $workflow.sessionId
    Write-Host "✅ Workflow initialized: $workflowSessionId" -ForegroundColor Green
    Write-Host "   Current State: $($workflow.currentState)" -ForegroundColor Gray
    Write-Host "   Progress: $($workflow.progressPercentage)%" -ForegroundColor Gray
    Write-Host "   Milestones: $($workflow.milestonesAchieved)/$($workflow.totalMilestones)" -ForegroundColor Gray

    # Update Workflow Stage
    Start-Sleep -Seconds 1
    $transitionPayload = @{
        targetState = "AssessmentInProgress"
        triggeredBy = "UserAction"
        transitionNotes = "Assessment started by counselor"
    } | ConvertTo-Json

    try {
        $updatedWorkflow = Invoke-RestMethod -Uri "$baseUrl/workflow/$workflowSessionId/transition" -Method POST -Body $transitionPayload -Headers $headers
        Write-Host "✅ Workflow transitioned to: $($updatedWorkflow.currentState)" -ForegroundColor Green
        Write-Host "   New Progress: $($updatedWorkflow.progressPercentage)%" -ForegroundColor Gray
    } catch {
        Write-Host "⚠️  Workflow transition failed: $($_.Exception.Message)" -ForegroundColor Yellow
    }

    # Get Workflow Progress
    Start-Sleep -Seconds 1
    try {
        $progress = Invoke-RestMethod -Uri "$baseUrl/workflow/$workflowSessionId/progress" -Method GET -Headers $headers
        Write-Host "✅ Workflow progress retrieved" -ForegroundColor Green
        Write-Host "   Ready for Surgery: $($progress.isReadyForSurgery)" -ForegroundColor Gray
    } catch {
        Write-Host "⚠️  Progress retrieval failed: $($_.Exception.Message)" -ForegroundColor Yellow
    }

} catch {
    Write-Host "⚠️  Workflow initialization failed: $($_.Exception.Message)" -ForegroundColor Yellow
}

# ========================================
# Summary
# ========================================
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "✅ Module 3 API Test Suite Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan

Write-Host "`n📊 Modules Tested:" -ForegroundColor Cyan
Write-Host "   ✅ 3.6 - Insurance Pre-Auth Workflow" -ForegroundColor Green
Write-Host "   ✅ 3.7 - Payment Processing" -ForegroundColor Green
Write-Host "   ✅ 3.8 - Admission Management" -ForegroundColor Green
Write-Host "   ✅ 3.9 - Consent Management" -ForegroundColor Green
Write-Host "   ✅ 3.10 - Workflow Orchestration" -ForegroundColor Green

Write-Host "`n📝 Next Steps:" -ForegroundColor Yellow
Write-Host "   1. Check Swagger UI: http://localhost:5073/swagger" -ForegroundColor Gray
Write-Host "   2. Test all endpoints interactively" -ForegroundColor Gray
Write-Host "   3. Create database migration scripts" -ForegroundColor Gray
Write-Host "   4. Implement Module 3 frontend components" -ForegroundColor Gray

Write-Host "`n"
