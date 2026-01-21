# Integration Test
Write-Host "=== Testing Services ===" -ForegroundColor Cyan

# Test Notification Service
Write-Host "Test 1: Notification Service..." -ForegroundColor Yellow
try {
    $body = @{ userId = "00000000-0000-0000-0000-000000000001"; deliveryMethod = "email"; recipient = "test@example.com" } | ConvertTo-Json
    $r = Invoke-RestMethod -Uri "http://localhost:7071/api/activation/send-otp" -Method POST -Body $body -ContentType "application/json" -TimeoutSec 5
    Write-Host "OK: Notification service responding" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Notification service not running" -ForegroundColor Red
    exit 1
}

# Test Auth Service
Write-Host "Test 2: Auth Service..." -ForegroundColor Yellow
try {
    $headers = @{ "X-Tenant-ID" = "00000000-0000-0000-0000-000000000001"; "Content-Type" = "application/json" }
    $body = @{ deliveryMethod = "email" } | ConvertTo-Json
    `$r = Invoke-RestMethod -Uri "http://localhost:5073/api/users/00000000-0000-0000-0000-000000000001/send-activation" -Method POST -Headers `$headers -Body `$body -TimeoutSec 15
    Write-Host "SUCCESS! Integration working!" -ForegroundColor Green
    $r | ConvertTo-Json -Depth 3
} catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
}
