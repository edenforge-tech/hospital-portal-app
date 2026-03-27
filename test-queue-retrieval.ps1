$ErrorActionPreference = "Stop"
$tenantId = "155fe198-6ae5-4a01-9254-ead5b427247e"
$backendUrl = "http://localhost:5073/api"

Write-Host "`n=== Testing Queue Retrieval (Frontend API Call) ===" -ForegroundColor Cyan

try {
    Write-Host "`nCalling GET /api/counseling/queue?branchId=..." -ForegroundColor Yellow
    
    # Test WITHOUT branchId (should return all tenant items)
    $response = Invoke-RestMethod -Uri "$backendUrl/counseling/queue" `
        -Method Get `
        -Headers @{
            "X-Tenant-ID" = $tenantId
            "Content-Type" = "application/json"
        } `
        -TimeoutSec 30

    Write-Host "`n✅ SUCCESS!" -ForegroundColor Green
    Write-Host "`nQueue Items Retrieved: $($response.queueItems.Count)" -ForegroundColor Cyan
    
    if ($response.queueItems.Count -gt 0) {
        Write-Host "`nPatients in Queue:" -ForegroundColor Green
        foreach ($item in $response.queueItems) {
            Write-Host "  🎫 Token: $($item.tokenNumber)" -ForegroundColor White
            Write-Host "     Patient: $($item.patientName) (MRN: $($item.patientMedicalRecordNumber))" -ForegroundColor Gray
            Write-Host "     Status: $($item.status) | Urgency: $($item.urgencyLevel)" -ForegroundColor Gray
            Write-Host "     Session: $($item.sessionNumber)" -ForegroundColor Gray
            Write-Host ""
        }
    } else {
        Write-Host "`n⚠️  No queue items found!" -ForegroundColor Yellow
    }
    
    Write-Host "`n📊 Full Response (First Item):" -ForegroundColor Cyan
    if ($response.queueItems.Count -gt 0) {
        $response.queueItems[0] | ConvertTo-Json -Depth 3 | Write-Host
    }
    
} catch {
    Write-Host "`n❌ ERROR:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Yellow
    
    if ($_.ErrorDetails) {
        Write-Host "`nDetails:" -ForegroundColor Gray
        Write-Host $_.ErrorDetails.Message
    }
}

Write-Host "`n=== Test Complete ===" -ForegroundColor Cyan
