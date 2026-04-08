# ============================================================================
# Auto-Seed Counselor Queue via Backend API
# ============================================================================

$ErrorActionPreference = "Stop"

Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "Auto-Seed Counselor Queue Data" -ForegroundColor Cyan
Write-Host "============================================`n" -ForegroundColor Cyan

$backendUrl = "http://localhost:5073"
$seedEndpoint = "$backendUrl/api/seed/counselor-queue"

Write-Host "Checking if backend is running..." -ForegroundColor Yellow
try {
    $healthCheck = Invoke-WebRequest -Uri "$backendUrl/swagger/index.html" -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✅ Backend is running on $backendUrl" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend is not running on $backendUrl" -ForegroundColor Red
    Write-Host "   Please start the backend first:" -ForegroundColor Yellow
    Write-Host "   cd microservices\auth-service\AuthService" -ForegroundColor Gray
    Write-Host "   dotnet run`n" -ForegroundColor Gray
    exit 1
}

Write-Host "`nCalling seed endpoint: POST /api/seed/counselor-queue" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri $seedEndpoint -Method Post -ContentType "application/json" -TimeoutSec 30
    
    if ($response.success) {
        Write-Host "✅ Counselor queue seeded successfully!" -ForegroundColor Green
        Write-Host "`n📊 Seed Results:" -ForegroundColor Cyan
        Write-Host "   Message: $($response.message)" -ForegroundColor White
        Write-Host "   Tenant ID: $($response.tenantId)" -ForegroundColor Gray
        Write-Host "   Branch ID: $($response.branchId)" -ForegroundColor Gray
        Write-Host "`n👥 Patients Created:" -ForegroundColor Cyan
        foreach ($patient in $response.patients) {
            Write-Host "   - $($patient.FullName) (MRN: $($patient.MedicalRecordNumber))" -ForegroundColor White
        }
        Write-Host "`n✅ Refresh the counselor page to see the queue data!" -ForegroundColor Green
        Write-Host "   URL: http://localhost:3000/dashboard/counselor`n" -ForegroundColor Cyan
    } else {
        Write-Host "❌ Seeding failed: $($response.message)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error calling seed endpoint:" -ForegroundColor Red
    Write-Host "   $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "`n   Response: $responseBody" -ForegroundColor Gray
    }
    exit 1
}

Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "Seeding Complete" -ForegroundColor Cyan
Write-Host "============================================`n" -ForegroundColor Cyan
