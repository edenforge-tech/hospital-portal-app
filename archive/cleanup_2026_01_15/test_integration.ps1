# Integration Test Script for Auth + Notification Services
# Run this after both services are started

Write-Host "`n=== INTEGRATION TEST SCRIPT ===" -ForegroundColor Cyan
Write-Host "Testing Auth-Service to Notification-Service Integration`n" -ForegroundColor White

# Wait for services to be ready
Write-Host "Waiting 3 seconds for services..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# Test 1: Check if notification service is responding
Write-Host "`n[Test 1] Checking Notification Service..." -ForegroundColor Cyan
try {
    $testBody = @{ 
        userId = "00000000-0000-0000-0000-000000000001"
        deliveryMethod = "email"
        recipient = "test@example.com"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "http://localhost:7071/api/activation/send-otp" `
        -Method POST -Body $testBody -ContentType "application/json" -TimeoutSec 5
    
    Write-Host "✓ Notification service is responding" -ForegroundColor Green
} catch {
    Write-Host "✗ Notification service ERROR: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   Make sure notification-service is running on port 7071" -ForegroundColor Yellow
    exit 1
}

# Test 2: Check if auth service is responding
Write-Host "`n[Test 2] Checking Auth Service..." -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "http://localhost:5073/swagger/index.html" `
        -Method GET -TimeoutSec 5 -ErrorAction SilentlyContinue
    
    Write-Host "✓ Auth service is responding" -ForegroundColor Green
} catch {
    Write-Host "✗ Auth service ERROR: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   Make sure auth-service is running on port 5073" -ForegroundColor Yellow
    exit 1
}

# Test 3: Test activation endpoint (integration test)
Write-Host "`n[Test 3] Testing User Activation Endpoint (Auth to Notification)..." -ForegroundColor Cyan
try {
    $headers = @{
        "X-Tenant-ID" = "00000000-0000-0000-0000-000000000001"
        "Content-Type" = "application/json"
    }
    
    $body = @{
        deliveryMethod = "email"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "http://localhost:5073/api/users/00000000-0000-0000-0000-000000000001/activate" `
        -Method POST -Headers $headers -Body $body -TimeoutSec 15
    
    Write-Host "✓ SUCCESS! Activation OTP sent" -ForegroundColor Green
    Write-Host "`nResponse:" -ForegroundColor White
    $response | ConvertTo-Json -Depth 3 | Write-Host
    
} catch {
    Write-Host "✗ ERROR: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails) {
        Write-Host "`nError Details:" -ForegroundColor Yellow
        Write-Host $_.ErrorDetails.Message
    }
}

Write-Host "`n=== TEST COMPLETE ===" -ForegroundColor Cyan
