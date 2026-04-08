# =============================================================================
# Comprehensive Counselor Queue Seed Script
# Seeds patients with different scenarios for complete workflow testing
# =============================================================================

$ErrorActionPreference = "Stop"
$tenantId = "155fe198-6ae5-4a01-9254-ead5b427247e"
$backendUrl = "http://localhost:5073/api"

Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "🏥 Comprehensive Counselor Queue Seeding" -ForegroundColor Cyan
Write-Host "============================================`n" -ForegroundColor Cyan

# Step 1: Verify backend is running
Write-Host "📡 Checking backend availability..." -ForegroundColor Yellow
try {
    $healthCheck = Invoke-WebRequest -Uri "$backendUrl/health" -UseBasicParsing -TimeoutSec 5 -ErrorAction SilentlyContinue
    Write-Host "   ✅ Backend is healthy and reachable" -ForegroundColor Green
} catch {
    try {
        # Try alternative health check via seed endpoint OPTIONS
        $testConnection = Test-NetConnection -ComputerName localhost -Port 5073 -WarningAction SilentlyContinue
        if ($testConnection.TcpTestSucceeded) {
            Write-Host "   ✅ Backend port 5073 is listening" -ForegroundColor Green
        } else {
            throw "Backend is not running on port 5073"
        }
    } catch {
        Write-Host "   ❌ Backend is not running!" -ForegroundColor Red
        Write-Host "   Please start the backend first:" -ForegroundColor Yellow
        Write-Host "   cd microservices\auth-service\AuthService" -ForegroundColor Gray
        Write-Host "   dotnet run`n" -ForegroundColor Gray
        exit 1
    }
}

# Step 2: Seed basic test patients (Waiting state)
Write-Host "`n📊 Seeding Test Patients..." -ForegroundColor Yellow
Write-Host "   Creating 3 patients in 'Waiting' status with different urgency levels`n" -ForegroundColor Gray

try {
    $response = Invoke-RestMethod -Uri "$backendUrl/seed/counselor-queue" `
        -Method Post `
        -Headers @{
            "X-Tenant-ID" = $tenantId
            "Content-Type" = "application/json"
        } `
        -TimeoutSec 30

    if ($response.success) {
        Write-Host "   ✅ Successfully seeded $($response.queueItemsCreated) queue items!" -ForegroundColor Green
        Write-Host "`n   📋 Details:" -ForegroundColor Cyan
        Write-Host "   Tenant: $($response.tenantName)" -ForegroundColor White
        Write-Host "   Branch: $($response.branchName) ($($response.branchId))" -ForegroundColor Gray
        
        Write-Host "`n   👥 Patients Created:" -ForegroundColor Cyan
        foreach ($patient in $response.patients) {
            $age = [Math]::Floor(((Get-Date) - [DateTime]$patient.DateOfBirth).Days / 365.25)
            Write-Host "   🎫 Token $($patient.TokenNumber): $($patient.FirstName) $($patient.LastName), $age yrs" -ForegroundColor White
            Write-Host "      MRN: $($patient.MedicalRecordNumber) | Urgency: $($patient.UrgencyLevel) | Status: $($patient.Status)" -ForegroundColor Gray
        }
    } else {
        Write-Host "   ❌ Seeding failed: $($response.message)" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "   ❌ Error calling seed endpoint:" -ForegroundColor Red
    Write-Host "   $($_.Exception.Message)" -ForegroundColor Yellow
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "`n   Response: $responseBody" -ForegroundColor Gray
    }
    exit 1
}

# Step 3: Verify data in database
Write-Host "`n🔍 Verifying Queue Data..." -ForegroundColor Yellow
$env:PGPASSWORD = "NewPass@2026!"
try {
    $verifyCommand = "SELECT COUNT(*) as count FROM counselor_queue WHERE tenant_id = '$tenantId' AND deleted_at IS NULL AND status = 'Waiting';"
    $verifyResult = psql -h "hospitalportal-db-server.postgres.database.azure.com" `
        -p 5432 `
        -U postgres `
        -d hospitalportal `
        -t `
        -c $verifyCommand `
        2>$null
    
    $queueCount = $verifyResult.Trim()
    if ($queueCount -gt 0) {
        Write-Host "   ✅ Found $queueCount patients waiting in queue" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  No waiting patients found in database" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ⚠️  Could not verify database (psql not available or connection failed)" -ForegroundColor Yellow
}

# Step 4: Display next steps
Write-Host "`n============================================" -ForegroundColor Green
Write-Host "✅ Seeding Complete!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green

Write-Host "`n📝 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Open your browser: http://localhost:3000/dashboard/counselor" -ForegroundColor White
Write-Host "   2. Hard refresh the page (Ctrl+Shift+R or Cmd+Shift+R)" -ForegroundColor White
Write-Host "   3. You should see:" -ForegroundColor White
Write-Host "      - Patient Queue panel: 'Waiting: 3+'" -ForegroundColor Gray
Write-Host "      - 3 patient cards with tokens T-001, T-002, T-003" -ForegroundColor Gray
Write-Host "      - Different urgency levels (High, Normal, Low)" -ForegroundColor Gray

Write-Host "`n🧪 Test Scenarios:" -ForegroundColor Cyan
Write-Host "   ✓ Click on a patient card to start counseling session" -ForegroundColor Gray
Write-Host "   ✓ Navigate through 7 steps: Demographics → Pre-Op → IOL → Package → Imaging → Surgery → Documents" -ForegroundColor Gray
Write-Host "   ✓ Test validation on IOL and Package steps" -ForegroundColor Gray
Write-Host "   ✓ Complete workflow and mark as 'Completed'" -ForegroundColor Gray

Write-Host "`n🔧 Troubleshooting:" -ForegroundColor Yellow
Write-Host "   If queue is still empty:" -ForegroundColor White
Write-Host "   1. Check browser console (F12) for errors" -ForegroundColor Gray
Write-Host "   2. Verify API call: Look for 'GET /counseling/queue'" -ForegroundColor Gray
Write-Host "   3. Check response: Should have 'queueItems' array with 3+ items" -ForegroundColor Gray
Write-Host "   4. Verify you're logged in with correct tenant" -ForegroundColor Gray

Write-Host "`n📞 Support:" -ForegroundColor Yellow
Write-Host "   Re-run this script anytime to refresh test data" -ForegroundColor Gray
Write-Host "   Script location: $PSCommandPath`n" -ForegroundColor Gray
