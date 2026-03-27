# ========================================
# Counselor Queue Test Data Seeding Script
# ========================================
# Creates test patients and adds them to counselor queue
# with various urgency levels and referral sources

param(
    [string]$ApiUrl = "http://localhost:5073/api",
    [string]$Email = "admin@hospital.com",
    [string]$Password = "Admin@123"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Counselor Queue Test Data Seeding" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Function to make API calls
function Invoke-ApiRequest {
    param(
        [string]$Method,
        [string]$Endpoint,
        [object]$Body = $null,
        [hashtable]$Headers = @{}
    )
    
    $uri = "$ApiUrl$Endpoint"
    $params = @{
        Method = $Method
        Uri = $uri
        Headers = $Headers
        ContentType = "application/json"
    }
    
    if ($Body) {
        $params.Body = ($Body | ConvertTo-Json -Depth 10)
    }
    
    try {
        $response = Invoke-RestMethod @params
        return $response
    }
    catch {
        Write-Host "❌ API Error: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.ErrorDetails.Message) {
            Write-Host "   Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
        }
        return $null
    }
}

# Step 1: Login to get token
Write-Host "🔐 Step 1: Authenticating..." -ForegroundColor Yellow
$loginResponse = Invoke-ApiRequest -Method POST -Endpoint "/auth/login" -Body @{
    email = $Email
    password = $Password
}

if (-not $loginResponse -or -not $loginResponse.token) {
    Write-Host "❌ Login failed. Please check credentials." -ForegroundColor Red
    exit 1
}

$token = $loginResponse.token
$tenantId = $loginResponse.tenantId
$branchId = $loginResponse.branchId
$userId = $loginResponse.userId

Write-Host "✅ Authenticated successfully" -ForegroundColor Green
Write-Host "   User ID: $userId" -ForegroundColor Gray
Write-Host "   Tenant ID: $tenantId" -ForegroundColor Gray
Write-Host "   Branch ID: $branchId" -ForegroundColor Gray
Write-Host ""

# Set auth headers
$headers = @{
    "Authorization" = "Bearer $token"
    "X-Tenant-ID" = $tenantId
}

# Step 2: Get existing patients or create test patients
Write-Host "👥 Step 2: Checking for existing patients..." -ForegroundColor Yellow

$patientsResponse = Invoke-ApiRequest -Method GET -Endpoint "/patients" -Headers $headers

$patients = @()
# The API returns a direct array, not wrapped in "items"
if ($patientsResponse -and $patientsResponse.GetType().Name -eq "Object[]") {
    $patients = $patientsResponse
    Write-Host "✅ Found $($patients.Count) existing patients" -ForegroundColor Green
} elseif ($patientsResponse -and $patientsResponse.Count -gt 0) {
    $patients = $patientsResponse
    Write-Host "✅ Found $($patients.Count) existing patients" -ForegroundColor Green
} elseif ($patientsResponse.items) {
    # Fallback: Check if wrapped in items property
    $patients = $patientsResponse.items
    Write-Host "✅ Found $($patients.Count) existing patients (from items)" -ForegroundColor Green
}

if ($patients.Count -eq 0) {
    Write-Host "❌ No patients found. Please create patients first." -ForegroundColor Red
    Write-Host "   You can create patients via the UI or run a patient seeding script." -ForegroundColor Gray
    Write-Host ""
    Write-Host "   Debug Info:" -ForegroundColor Yellow
    Write-Host "   Response Type: $($patientsResponse.GetType().Name)" -ForegroundColor Gray
    Write-Host "   Response: $($patientsResponse | ConvertTo-Json -Depth 3)" -ForegroundColor Gray
    exit 1
}

# Show first patient details for debugging
Write-Host "   Sample Patient (for debugging):" -ForegroundColor Gray
Write-Host "   - ID: $($patients[0].Id)" -ForegroundColor Gray
Write-Host "   - Name: $($patients[0].FirstName) $($patients[0].LastName)" -ForegroundColor Gray
Write-Host "   - MRN: $($patients[0].MedicalRecordNumber)" -ForegroundColor Gray

Write-Host ""

# Step 3: Get counselor user (or use admin)
Write-Host "🧑‍⚕️ Step 3: Getting counselor user..." -ForegroundColor Yellow
$counselors = Invoke-ApiRequest -Method GET -Endpoint "/users?role=Counselor" -Headers $headers

$counselorId = $userId # Default to current user
$counselorName = "Admin User"

if ($counselors -and $counselors.items -and $counselors.items.Count -gt 0) {
    $counselor = $counselors.items[0]
    $counselorId = $counselor.id
    $counselorName = $counselor.fullName
    Write-Host "✅ Found counselor: $counselorName" -ForegroundColor Green
} else {
    Write-Host "⚠️  No counselor found, using current user" -ForegroundColor Yellow
}
Write-Host ""

# Step 4: Seed counselor queue with test data
Write-Host "📋 Step 4: Adding patients to counselor queue..." -ForegroundColor Yellow
Write-Host ""

$queueData = @(
    @{
        Patient = 0
        ReferralSource = "DoctorReferral"
        UrgencyLevel = "Critical"
        PriorityScore = 95
        SessionType = "PreSurgery"
        PatientType = "Insurance"
        RequiresFinancialCounseling = $true
        RequiresSurgicalConsent = $true
        ReferralNotes = "Urgent cataract surgery consent needed - surgery scheduled for tomorrow"
    },
    @{
        Patient = 1
        ReferralSource = "Emergency"
        UrgencyLevel = "High"
        PriorityScore = 85
        SessionType = "Financial"
        PatientType = "Cash"
        RequiresFinancialCounseling = $true
        RequiresSurgicalConsent = $false
        ReferralNotes = "Emergency case - needs immediate financial counseling for treatment"
    },
    @{
        Patient = 2
        ReferralSource = "OptometryReferral"
        UrgencyLevel = "High"
        PriorityScore = 75
        SessionType = "Initial"
        PatientType = "CoPay"
        RequiresFinancialCounseling = $true
        RequiresSurgicalConsent = $false
        ReferralNotes = "Optometry referred for glasses and lens selection"
    },
    @{
        Patient = 3
        ReferralSource = "DoctorReferral"
        UrgencyLevel = "Medium"
        PriorityScore = 55
        SessionType = "Followup"
        PatientType = "Insurance"
        RequiresFinancialCounseling = $false
        RequiresSurgicalConsent = $false
        ReferralNotes = "Follow-up post-operative counseling"
    },
    @{
        Patient = 4
        ReferralSource = "Scheduled"
        UrgencyLevel = "Medium"
        PriorityScore = 50
        SessionType = "Initial"
        PatientType = "GovernmentScheme"
        RequiresFinancialCounseling = $true
        RequiresSurgicalConsent = $false
        ReferralNotes = "Scheduled consultation for government scheme benefits"
    },
    @{
        Patient = 5
        ReferralSource = "WalkIn"
        UrgencyLevel = "Low"
        PriorityScore = 30
        SessionType = "General"
        PatientType = "Cash"
        RequiresFinancialCounseling = $false
        RequiresSurgicalConsent = $false
        ReferralNotes = "Walk-in patient for general inquiry"
    }
)

$addedCount = 0
$failedCount = 0

foreach ($queueItem in $queueData) {
    if ($queueItem.Patient -ge $patients.Count) {
        Write-Host "⚠️  Skipping - Patient index $($queueItem.Patient) out of range (have $($patients.Count) patients)" -ForegroundColor Yellow
        $failedCount++
        continue
    }
    
    $patient = $patients[$queueItem.Patient]
    $patientFullName = "$($patient.FirstName) $($patient.LastName)"
    
    $requestBody = @{
        branchId = $branchId
        patientId = $patient.Id
        referralSource = $queueItem.ReferralSource
        urgencyLevel = $queueItem.UrgencyLevel
        priorityScore = $queueItem.PriorityScore
        sessionType = $queueItem.SessionType
        patientType = $queueItem.PatientType
        requiresFinancialCounseling = $queueItem.RequiresFinancialCounseling
        requiresSurgicalConsent = $queueItem.RequiresSurgicalConsent
        referralNotes = $queueItem.ReferralNotes
        assignedCounselorId = $counselorId
        referredByUserId = $userId
    }
    
    Write-Host "   Adding: $patientFullName (MRN: $($patient.MedicalRecordNumber)) - " -NoNewline
    Write-Host "$($queueItem.UrgencyLevel)" -NoNewline -ForegroundColor $(
        switch ($queueItem.UrgencyLevel) {
            "Critical" { "Red" }
            "High" { "Yellow" }
            "Medium" { "Cyan" }
            "Low" { "Green" }
            default { "Gray" }
        }
    )
    Write-Host " - $($queueItem.ReferralSource)" -ForegroundColor Gray
    
    $result = Invoke-ApiRequest -Method POST -Endpoint "/counseling/queue" -Body $requestBody -Headers $headers
    
    if ($result) {
        Write-Host "      ✅ Added to queue with token: $($result.tokenNumber)" -ForegroundColor Green
        $addedCount++
    } else {
        Write-Host "      ❌ Failed to add" -ForegroundColor Red
        $failedCount++
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Seeding Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ Successfully added: $addedCount patients" -ForegroundColor Green
if ($failedCount -gt 0) {
    Write-Host "❌ Failed: $failedCount patients" -ForegroundColor Red
}
Write-Host ""
Write-Host "🌐 View Queue at: http://localhost:3001/dashboard/counselor/queue" -ForegroundColor Cyan
Write-Host ""
