$ErrorActionPreference = "Stop"
$tenantId = "155fe198-6ae5-4a01-9254-ead5b427247e"
$backendUrl = "http://localhost:5073/api"

Write-Host "`n=== Testing Counselor Queue Seed Endpoint ===" -ForegroundColor Cyan

try {
    Write-Host "`nCalling POST /api/seed/counselor-queue..." -ForegroundColor Yellow
    
    $response = Invoke-RestMethod -Uri "$backendUrl/seed/counselor-queue" `
        -Method Post `
        -Headers @{
            "X-Tenant-ID" = $tenantId
            "Content-Type" = "application/json"
        } `
        -TimeoutSec 30

    Write-Host "`n✅ SUCCESS!" -ForegroundColor Green
    Write-Host "`nResponse:" -ForegroundColor Cyan
    $response | ConvertTo-Json -Depth 5 | Write-Host
    
} catch {
    Write-Host "`n❌ ERROR:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Yellow
    
    if ($_.ErrorDetails) {
        Write-Host "`nDetails:" -ForegroundColor Gray
        Write-Host $_.ErrorDetails.Message
    }
}

Write-Host "`n=== Test Complete ===" -ForegroundColor Cyan
