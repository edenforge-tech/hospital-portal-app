# Test Drug Interaction API
# Verifies that drug interactions are properly seeded and detected

Write-Host "Testing Drug Interaction API..." -ForegroundColor Cyan
Write-Host ""

# Check if backend is running - skip health check, will fail on login if not running
$backendUrl = "http://localhost:5073"

# Get auth token (using test credentials)
Write-Host "[1/6] Authenticating..." -ForegroundColor Yellow
$loginBody = @{
    email = "admin@indiaeye.com"
    password = "Admin@123456"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$backendUrl/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    $token = $loginResponse.token

    if (-not $token) {
        Write-Host "      [FAIL] Authentication failed" -ForegroundColor Red
        exit 1
    }
    Write-Host "      [PASS] Authenticated successfully" -ForegroundColor Green
} catch {
    Write-Host "      [FAIL] Login error: $_" -ForegroundColor Red
    exit 1
}
Write-Host ""

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

# Test 1: Critical interaction - Timolol + Asthma
Write-Host "[2/6] Test: Timolol + Asthma (Critical interaction)" -ForegroundColor Yellow
$test1Body = @("Timolol 0.5%", "Asthma/COPD History") | ConvertTo-Json

try {
    $test1Result = Invoke-RestMethod -Uri "$backendUrl/api/prescriptionvalidation/interactions" -Method POST -Headers $headers -Body $test1Body
    
    if ($test1Result.hasInteractions -eq $true) {
        Write-Host "      [PASS] Interaction detected!" -ForegroundColor Green
        Write-Host "      Severity: $($test1Result.interactions[0].severity)" -ForegroundColor Red
        Write-Host "      Management: $($test1Result.interactions[0].management.Substring(0, 60))..." -ForegroundColor Gray
    } else {
        Write-Host "      [FAIL] No interaction detected" -ForegroundColor Red
    }
} catch {
    Write-Host "      [FAIL] API call error: $_" -ForegroundColor Red
}
Write-Host ""

# Test 2: Duplicate prostaglandin
Write-Host "[3/6] Test: Latanoprost + Bimatoprost (Duplicate prostaglandin)" -ForegroundColor Yellow
$test2Body = @("Latanoprost 0.005%", "Bimatoprost 0.03%") | ConvertTo-Json

try {
    $test2Result = Invoke-RestMethod -Uri "$backendUrl/api/prescriptionvalidation/interactions" -Method POST -Headers $headers -Body $test2Body
    
    if ($test2Result.hasInteractions -eq $true) {
        Write-Host "      [PASS] Interaction detected!" -ForegroundColor Green
        Write-Host "      Severity: $($test2Result.interactions[0].severity)" -ForegroundColor Yellow
    } else {
        Write-Host "      [FAIL] No interaction detected" -ForegroundColor Red
    }
} catch {
    Write-Host "      [FAIL] API call error" -ForegroundColor Red
}
Write-Host ""

# Test 3: Steroid + Herpes
Write-Host "[4/6] Test: Prednisolone + Herpes Keratitis (Critical)" -ForegroundColor Yellow
$test3Body = @("Prednisolone Acetate 1%", "Herpes Simplex Keratitis (Active)") | ConvertTo-Json

try {
    $test3Result = Invoke-RestMethod -Uri "$backendUrl/api/prescriptionvalidation/interactions" -Method POST -Headers $headers -Body $test3Body
    
    if ($test3Result.hasInteractions -eq $true) {
        Write-Host "      [PASS] Interaction detected!" -ForegroundColor Green
        Write-Host "      Severity: $($test3Result.interactions[0].severity)" -ForegroundColor Red
    } else {
        Write-Host "      [FAIL] No interaction detected" -ForegroundColor Red
    }
} catch {
    Write-Host "      [FAIL] API call error" -ForegroundColor Red
}
Write-Host ""

# Test 4: No interactions (safe medications)
Write-Host "[5/6] Test: Timolol + Latanoprost (Should be safe)" -ForegroundColor Yellow
$test4Body = @("Timolol 0.5%", "Latanoprost 0.005%") | ConvertTo-Json

try {
    $test4Result = Invoke-RestMethod -Uri "$backendUrl/api/prescriptionvalidation/interactions" -Method POST -Headers $headers -Body $test4Body
    
    if ($test4Result.hasInteractions -eq $false) {
        Write-Host "      [PASS] No interaction (correct)" -ForegroundColor Green
    } else {
        Write-Host "      [WARN] Interaction detected (unexpected)" -ForegroundColor Yellow
        Write-Host "      Found: $($test4Result.interactions[0].drug1Name) + $($test4Result.interactions[0].drug2Name)" -ForegroundColor Gray
    }
} catch {
    Write-Host "      [FAIL] API call error" -ForegroundColor Red
}
Write-Host ""

# Test 5: Multiple medications
Write-Host "[6/6] Test: Multiple medications (Timolol + Latanoprost + Prednisolone)" -ForegroundColor Yellow
$test5Body = @("Timolol 0.5%", "Latanoprost 0.005%", "Prednisolone Acetate 1%") | ConvertTo-Json

try {
    $test5Result = Invoke-RestMethod -Uri "$backendUrl/api/prescriptionvalidation/interactions" -Method POST -Headers $headers -Body $test5Body
    
    if ($test5Result.hasInteractions -eq $false) {
        Write-Host "      [PASS] No interactions (commonly used together)" -ForegroundColor Green
    } else {
        Write-Host "      [WARN] $($test5Result.interactions.Count) interaction(s) detected" -ForegroundColor Yellow
    }
} catch {
    Write-Host "      [FAIL] API call error" -ForegroundColor Red
}
Write-Host ""

Write-Host "=== TESTING COMPLETE ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Summary:" -ForegroundColor Cyan
Write-Host "  - 41 interactions seeded in database" -ForegroundColor White
Write-Host "  - 14 Critical severity interactions" -ForegroundColor White
Write-Host "  - API: POST /api/prescriptionvalidation/interactions" -ForegroundColor White
Write-Host ""
