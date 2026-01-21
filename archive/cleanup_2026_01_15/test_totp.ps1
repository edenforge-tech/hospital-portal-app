# Test TOTP Verification
$apiUrl = "http://localhost:7071"

# Get the TOTP secret from database
$env:PGPASSWORD='Eden@#$0606'
$secretQuery = "SELECT totp_secret_encrypted FROM user_mfa_settings WHERE user_id = (SELECT id FROM users WHERE email = 'receptionist6@hospital.com');"
$secretResult = psql -h hospitalportal-db-server.postgres.database.azure.com -U postgres -d hospitalportal -t -c $secretQuery 2>&1

if ($secretResult) {
    $secret = $secretResult.Trim()
    Write-Host "TOTP Secret (first 10 chars): $($secret.Substring(0, 10))..." -ForegroundColor Cyan
    Write-Host "Secret Length: $($secret.Length)" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "✅ TOTP secret found in database" -ForegroundColor Green
    Write-Host ""
    Write-Host "📱 Next steps:" -ForegroundColor Yellow
    Write-Host "1. Open your authenticator app (Google Authenticator, Authy, Microsoft Authenticator)" -ForegroundColor White
    Write-Host "2. Find the entry for 'receptionist6@hospital.com' or 'Eye Hospital'" -ForegroundColor White
    Write-Host "3. Wait for a NEW 6-digit code to appear (codes change every 30 seconds)" -ForegroundColor White
    Write-Host "4. Enter that code in the login screen IMMEDIATELY" -ForegroundColor White
    Write-Host ""
    Write-Host "⚠️  Important:" -ForegroundColor Red
    Write-Host "- Don't use an old code - wait for it to refresh" -ForegroundColor White
    Write-Host "- Make sure your phone has automatic date/time enabled" -ForegroundColor White
    Write-Host "- Enter the code within 30 seconds of it appearing" -ForegroundColor White
} else {
    Write-Host "❌ No TOTP secret found" -ForegroundColor Red
}
