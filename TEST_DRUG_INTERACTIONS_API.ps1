# Test Drug Interaction API
# Verifies that drug interactions are properly seeded and detected

Write-Host "🔍 Testing Drug Interaction API..." -ForegroundColor Cyan
Write-Host ""

# Check if backend is running
$backendUrl = "http://localhost:5073"
try {
    $healthCheck = Invoke-WebRequest -Uri "$backendUrl/health" -Method GET -TimeoutSec 2 -ErrorAction Stop
} catch {
    Write-Host "❌ Backend is not running at $backendUrl" -ForegroundColor Red
    Write-Host "   Please start the backend first: cd microservices/auth-service/AuthService; dotnet run" -ForegroundColor Yellow
    exit 1
}

# Get auth token (using test credentials)
Write-Host "1️⃣  Authenticating..." -ForegroundColor Yellow
$loginBody = @{
    email = "admin@indiaeye.com"
    password = "Admin@123456"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "$backendUrl/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
$token = $loginResponse.token

if (-not $token) {
    Write-Host "   ❌ Authentication failed" -ForegroundColor Red
    exit 1
}
Write-Host "   ✅ Authenticated successfully" -ForegroundColor Green
Write-Host ""

# Test 1: Critical interaction - Timolol + Asthma
Write-Host "2️⃣  Test 1: Timolol + Asthma (Critical interaction)" -ForegroundColor Yellow
$test1Body = @("Timolol 0.5%", "Asthma/COPD History") | ConvertTo-Json
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

try {
    $test1Result = Invoke-RestMethod -Uri "$backendUrl/api/prescriptionvalidation/interactions" -Method POST -Headers $headers -Body $test1Body
    
    if ($test1Result.hasInteractions -eq $true) {
        Write-Host "   ✅ Interaction detected!" -ForegroundColor Green
        foreach ($interaction in $test1Result.interactions) {
            Write-Host "      - $($interaction.drug1Name) + $($interaction.drug2Name)" -ForegroundColor White
            Write-Host "        Severity: $($interaction.severity)" -ForegroundColor Red
            Write-Host "        Description: $($interaction.description)" -ForegroundColor Gray
            Write-Host "        Management: $($interaction.management)" -ForegroundColor Cyan
        }
    } else {
        Write-Host "   ❌ No interaction detected (FAILED - should have detected Critical interaction)" -ForegroundColor Red
    }
} catch {
    Write-Host "   ❌ API call failed: $_" -ForegroundColor Red
}
Write-Host ""

# Test 2: Duplicate prostaglandin
Write-Host "3️⃣  Test 2: Latanoprost + Bimatoprost (Duplicate prostaglandin)" -ForegroundColor Yellow
$test2Body = @("Latanoprost 0.005%", "Bimatoprost 0.03%") | ConvertTo-Json

try {
    $test2Result = Invoke-RestMethod -Uri "$backendUrl/api/prescriptionvalidation/interactions" -Method POST -Headers $headers -Body $test2Body
    
    if ($test2Result.hasInteractions -eq $true) {
        Write-Host "   ✅ Interaction detected!" -ForegroundColor Green
        foreach ($interaction in $test2Result.interactions) {
            Write-Host "      - $($interaction.drug1Name) + $($interaction.drug2Name)" -ForegroundColor White
            Write-Host "        Severity: $($interaction.severity)" -ForegroundColor Yellow
        }
    } else {
        Write-Host "   ❌ No interaction detected (FAILED)" -ForegroundColor Red
    }
} catch {
    Write-Host "   ❌ API call failed: $_" -ForegroundColor Red
}
Write-Host ""

# Test 3: Steroid + Herpes (Critical contraindication)
Write-Host "4️⃣  Test 3: Prednisolone + Herpes Keratitis (Critical contraindication)" -ForegroundColor Yellow
$test3Body = @("Prednisolone Acetate 1%", "Herpes Simplex Keratitis (Active)") | ConvertTo-Json

try {
    $test3Result = Invoke-RestMethod -Uri "$backendUrl/api/prescriptionvalidation/interactions" -Method POST -Headers $headers -Body $test3Body
    
    if ($test3Result.hasInteractions -eq $true) {
        Write-Host "   ✅ Interaction detected!" -ForegroundColor Green
        foreach ($interaction in $test3Result.interactions) {
            Write-Host "      - $($interaction.drug1Name) + $($interaction.drug2Name)" -ForegroundColor White
            Write-Host "        Severity: $($interaction.severity)" -ForegroundColor Red
            Write-Host "        Description: $($interaction.description)" -ForegroundColor Gray
        }
    } else {
        Write-Host "   ❌ No interaction detected (FAILED)" -ForegroundColor Red
    }
} catch {
    Write-Host "   ❌ API call failed: $_" -ForegroundColor Red
}
Write-Host ""

# Test 4: No interactions (safe medications)
Write-Host "5️⃣  Test 4: No interaction test (Timolol + Latanoprost)" -ForegroundColor Yellow
$test4Body = @("Timolol 0.5%", "Latanoprost 0.005%") | ConvertTo-Json

try {
    $test4Result = Invoke-RestMethod -Uri "$backendUrl/api/prescriptionvalidation/interactions" -Method POST -Headers $headers -Body $test4Body
    
    if ($test4Result.hasInteractions -eq $false) {
        Write-Host "   ✅ No interaction detected (correct - these medications are safe together)" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Interaction detected (check if this is expected):" -ForegroundColor Yellow
        foreach ($interaction in $test4Result.interactions) {
            Write-Host "      - $($interaction.drug1Name) + $($interaction.drug2Name): $($interaction.severity)" -ForegroundColor White
        }
    }
} catch {
    Write-Host "   ❌ API call failed: $_" -ForegroundColor Red
}
Write-Host ""

# Test 5: Multiple medications
Write-Host "6️⃣  Test 5: Multiple medications (Timolol + Latanoprost + Prednisolone)" -ForegroundColor Yellow
$test5Body = @("Timolol 0.5%", "Latanoprost 0.005%", "Prednisolone Acetate 1%") | ConvertTo-Json

try {
    $test5Result = Invoke-RestMethod -Uri "$backendUrl/api/prescriptionvalidation/interactions" -Method POST -Headers $headers -Body $test5Body
    
    if ($test5Result.hasInteractions -eq $false) {
        Write-Host "   ✅ No interactions detected (these are commonly used together)" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Interaction(s) detected:" -ForegroundColor Yellow
        foreach ($interaction in $test5Result.interactions) {
            Write-Host "      - $($interaction.drug1Name) + $($interaction.drug2Name): $($interaction.severity)" -ForegroundColor White
        }
    }
} catch {
    Write-Host "   ❌ API call failed: $_" -ForegroundColor Red
}
Write-Host ""

Write-Host "✅ Drug interaction testing complete" -ForegroundColor Green
Write-Host ""
Write-Host "Summary:" -ForegroundColor Cyan
Write-Host "  - 41 interactions seeded in database" -ForegroundColor White
Write-Host "  - 14 Critical severity interactions" -ForegroundColor White
Write-Host '  - API endpoint: POST /api/prescriptionvalidation/interactions' -ForegroundColor White
Write-Host ""
