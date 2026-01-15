# Test TOTP Code Verification
$secret = "EU5O7HQO5KPCP5MT3KDOTYWYQNKCU3QL"
$userCode = "424018"

Write-Host "`n=== TOTP VERIFICATION TEST ===" -ForegroundColor Cyan
Write-Host "Secret: $secret" -ForegroundColor White
Write-Host "User Code: $userCode" -ForegroundColor White
Write-Host "Server Time (UTC): $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor White
Write-Host ""

# Call the Notification Service API directly to test
$apiUrl = "http://localhost:7071/api/mfa/verify-login"
$userId = "f52e4031-19a8-4d63-bc28-e8dc7c4c0a10" # receptionist6

$body = @{
    userId = $userId
    code = $userCode
    method = "totp"
} | ConvertTo-Json

Write-Host "Testing with Notification Service..." -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri $apiUrl -Method Post -Body $body -ContentType "application/json" -ErrorAction Stop
    Write-Host "✅ SUCCESS! Code is valid!" -ForegroundColor Green
    Write-Host "Response: $($response | ConvertTo-Json)" -ForegroundColor Green
}
catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    $errorBody = $_.ErrorDetails.Message
    Write-Host "❌ FAILED! Code is invalid!" -ForegroundColor Red
    Write-Host "Status Code: $statusCode" -ForegroundColor Red
    Write-Host "Error: $errorBody" -ForegroundColor Red
    
    Write-Host "`n🔍 Possible Issues:" -ForegroundColor Yellow
    Write-Host "1. Time synchronization - Phone time might be off by more than 30 seconds" -ForegroundColor White
    Write-Host "2. Code expired - TOTP codes change every 30 seconds" -ForegroundColor White
    Write-Host "3. Wrong secret - The QR code in your app might not match the database" -ForegroundColor White
}

Write-Host ""
