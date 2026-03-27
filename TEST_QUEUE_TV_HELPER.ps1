# Queue TV Testing Helper Script
# Automates calling patients and testing real-time updates

param(
    [string]$Email = "",
    [string]$Password = "",
    [string]$BranchId = "155fe198-6ae5-4a01-9254-ead5b427247e",
    [string]$RoomNumber = "Room 5",
    [string]$DoctorName = "Dr. Smith",
    [switch]$Help
)

$BaseUrl = "http://localhost:5073"

# Color functions
function Write-Success { param($Message) Write-Host "✓ $Message" -ForegroundColor Green }
function Write-Info { param($Message) Write-Host "ℹ $Message" -ForegroundColor Cyan }
function Write-Error { param($Message) Write-Host "✗ $Message" -ForegroundColor Red }
function Write-Warning { param($Message) Write-Host "⚠ $Message" -ForegroundColor Yellow }

if ($Help) {
    Write-Host @"

================================================================
           QUEUE TV TESTING HELPER SCRIPT
================================================================

USAGE:
    .\TEST_QUEUE_TV_HELPER.ps1 -Email "user@example.com" -Password "pass123"

PARAMETERS:
    -Email          Your login email (required)
    -Password       Your login password (required)
    -BranchId       Branch ID (default: Bangalore branch)
    -RoomNumber     Room to call patient to (default: "Room 5")
    -DoctorName     Doctor name (default: "Dr. Smith")
    -Help           Show this help message

EXAMPLES:
    # Basic usage (will prompt for email/password if not provided)
    .\TEST_QUEUE_TV_HELPER.ps1

    # With credentials
    .\TEST_QUEUE_TV_HELPER.ps1 -Email "admin@hospital.com" -Password "Admin@123"

    # Custom room and doctor
    .\TEST_QUEUE_TV_HELPER.ps1 -RoomNumber "Room 10" -DoctorName "Dr. Patel"

WHAT IT DOES:
    1. Logs in and gets JWT token
    2. Fetches queue items from specified branch
    3. Finds first patient in "waiting" status
    4. Calls that patient with room and doctor info
    5. SignalR broadcasts to Queue TV page in real-time

PREREQUISITES:
    - Backend running on http://localhost:5073
    - Queue TV page open at http://localhost:3000/dashboard/queue/tv
    - At least one patient in queue with "waiting" status

"@
    exit 0
}

Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "         QUEUE TV REAL-TIME UPDATE TESTER" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

# Prompt for credentials if not provided
if ([string]::IsNullOrWhiteSpace($Email)) {
    $Email = Read-Host "Enter your email"
}

if ([string]::IsNullOrWhiteSpace($Password)) {
    $PasswordSecure = Read-Host "Enter your password" -AsSecureString
    $BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($PasswordSecure)
    $Password = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
}

# Step 1: Login and get JWT token
Write-Info "Step 1/4: Authenticating..."
try {
    $loginBody = @{
        email = $Email
        password = $Password
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "$BaseUrl/api/auth/login" `
        -Method POST `
        -Body $loginBody `
        -ContentType "application/json" `
        -ErrorAction Stop

    $token = $loginResponse.token
    if ([string]::IsNullOrWhiteSpace($token)) {
        Write-Error "Login failed - No token received"
        exit 1
    }

    Write-Success "Authenticated successfully"
    Write-Host "   User: $($loginResponse.email)" -ForegroundColor Gray
} catch {
    Write-Error "Login failed: $($_.Exception.Message)"
    Write-Warning "Make sure backend is running on http://localhost:5073"
    exit 1
}

# Step 2: Get queue items
Write-Info "Step 2/4: Fetching queue items..."
try {
    $headers = @{
        "Authorization" = "Bearer $token"
        "X-Tenant-ID" = $BranchId
    }

    $queueItems = Invoke-RestMethod -Uri "$BaseUrl/api/queue/branch/$BranchId" `
        -Method GET `
        -Headers $headers `
        -ErrorAction Stop

    if ($queueItems.Count -eq 0) {
        Write-Error "No queue items found for branch $BranchId"
        Write-Warning "Create test queue items via POST /api/visits/check-in"
        exit 1
    }

    Write-Success "Found $($queueItems.Count) queue items"
    
    # Display queue items
    Write-Host "`n   Queue Items:" -ForegroundColor Yellow
    $queueItems | Select-Object -First 5 | ForEach-Object {
        $statusColor = if ($_.status -eq 'waiting') { 'Green' } else { 'Gray' }
        Write-Host "   • Token: $($_.tokenNumber) | Status: $($_.status)" -ForegroundColor $statusColor
    }

} catch {
    Write-Error "Failed to fetch queue items: $($_.Exception.Message)"
    exit 1
}

# Step 3: Find first waiting patient
Write-Info "`nStep 3/4: Selecting patient to call..."
$waitingPatient = $queueItems | Where-Object { $_.status -eq 'waiting' } | Select-Object -First 1

if ($null -eq $waitingPatient) {
    Write-Error "No patients in 'waiting' status"
    Write-Warning "All patients already called or completed"
    Write-Host "`n   Available statuses:" -ForegroundColor Yellow
    $queueItems | Group-Object status | ForEach-Object {
        Write-Host "   • $($_.Name): $($_.Count)" -ForegroundColor Gray
    }
    exit 1
}

Write-Success "Selected patient:"
Write-Host "   Token: $($waitingPatient.tokenNumber)" -ForegroundColor Cyan
Write-Host "   Patient: $($waitingPatient.patientName)" -ForegroundColor Cyan
Write-Host "   Queue Type: $($waitingPatient.queueType)" -ForegroundColor Cyan

# Step 4: Call the patient
Write-Info "`nStep 4/4: Calling patient..."
Write-Host "   Room: $RoomNumber" -ForegroundColor Yellow
Write-Host "   Doctor: $DoctorName" -ForegroundColor Yellow

try {
    $callBody = @{
        roomNumber = $RoomNumber
        doctorName = $DoctorName
    } | ConvertTo-Json

    $callResponse = Invoke-RestMethod -Uri "$BaseUrl/api/queue/$($waitingPatient.id)/call" `
        -Method POST `
        -Body $callBody `
        -Headers $headers `
        -ContentType "application/json" `
        -ErrorAction Stop

    Write-Host ""
    Write-Success "PATIENT CALLED SUCCESSFULLY!"
    Write-Host ""
    Write-Host "================================================================" -ForegroundColor Green
    Write-Host "                QUEUE TV SHOULD UPDATE NOW" -ForegroundColor Green
    Write-Host "================================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "   Token Called:  $($callResponse.queueItem.tokenNumber)" -ForegroundColor Cyan
    Write-Host "   Room Number:   $($callResponse.queueItem.roomNumber)" -ForegroundColor Cyan
    Write-Host "   Doctor Name:   $($callResponse.queueItem.doctorName)" -ForegroundColor Cyan
    Write-Host "   Called At:     $($callResponse.queueItem.calledAt)" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "✓ SignalR event broadcasted to Queue TV page" -ForegroundColor Green
    Write-Host "✓ Audio notification should play (if enabled)" -ForegroundColor Green
    Write-Host "✓ Token display should update in real-time" -ForegroundColor Green
    Write-Host ""
    Write-Info "Queue TV URL: http://localhost:3000/dashboard/queue/tv"
    Write-Host ""

} catch {
    Write-Error "Failed to call patient: $($_.Exception.Message)"
    Write-Host ""
    Write-Warning "Possible issues:"
    Write-Host "   • Backend SignalR hub not running" -ForegroundColor Gray
    Write-Host "   • Queue TV page not connected to WebSocket" -ForegroundColor Gray
    Write-Host "   • Invalid queue item ID" -ForegroundColor Gray
    exit 1
}

Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "Test complete! Check the Queue TV page for real-time updates." -ForegroundColor Green
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""
