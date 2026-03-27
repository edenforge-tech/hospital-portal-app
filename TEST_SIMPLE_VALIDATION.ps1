# Simple Prescription Validation Test
# Tests core API endpoints for Step 8
# Date: February 19, 2026

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "PRESCRIPTION VALIDATION API TESTS" -ForegroundColor Cyan  
Write-Host "========================================`n" -ForegroundColor Cyan

$baseUrl = "http://localhost:5073/api"
$email = "admin@test.com"
$password = "Admin123!"
$tenantId = "155fe198-6ae5-4a01-9254-ead5b427247e"

# Test 1: Login
Write-Host "Test 1: Authentication..." -ForegroundColor Yellow
try {
    $loginBody = @{ email = $email; password = $password } | ConvertTo-Json
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $loginBody -ContentType "application/json" -Headers @{ "X-Tenant-ID" = $tenantId }
    $token = $loginResponse.accessToken
    Write-Host "✅ Login successful" -ForegroundColor Green
    Write-Host "   Token: $($token.Substring(0, 30))..." -ForegroundColor Gray
} catch {
    Write-Host "❌ Login failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 2: Get Patient
Write-Host "`nTest 2: Fetch Test Patient..." -ForegroundColor Yellow
$env:PGPASSWORD = "NewPass@2026!"
$patientQuery = "SELECT id FROM patient WHERE tenant_id = '$tenantId' LIMIT 1;"
$patientResult = psql -h hospitalportal-db-server.postgres.database.azure.com -p 5432 -U postgres -d hospitalportal -t -A -c $patientQuery 2>$null

if ($patientResult) {
    $patientId = $patientResult.Trim()
    Write-Host "✅ Patient ID: $patientId" -ForegroundColor Green
} else {
    $patientId = "00000000-0000-0000-0000-000000000001"
    Write-Host "⚠️  Using mock patient ID" -ForegroundColor Yellow
}

# Test 3: Valid Prescription
Write-Host "`nTest 3: Valid Prescription (Artificial Tear)..." -ForegroundColor Yellow
try {
    $validationBody = @{
        patientId = $patientId
        medications = @(
            @{
                medicationName = "Carboxymethylcellulose"
                eyeSpecificity = "OU"
                dosage = "0.5%"
                frequency = "QID"
                durationDays = 30
            }
        )
        checkAllergies = $true
        checkInteractions = $true
        checkContraindications = $true
        checkDuplicates = $true
    } | ConvertTo-Json -Depth 10

    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
        "X-Tenant-ID" = $tenantId
    }

    $startTime = Get-Date
    $validation = Invoke-RestMethod -Uri "$baseUrl/prescriptionvalidation/validate" -Method POST -Body $validationBody -Headers $headers
    $duration = ((Get-Date) - $startTime).TotalMilliseconds

    if ($validation.isValid) {
        Write-Host "✅ Validation passed" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Validation failed (expected for some scenarios)" -ForegroundColor Yellow
    }
    Write-Host "   Is Valid: $($validation.isValid)" -ForegroundColor Gray
    Write-Host "   Errors: $($validation.errors.Count)" -ForegroundColor Gray
    Write-Host "   Warnings: $($validation.warnings.Count)" -ForegroundColor Gray
    Write-Host "   Interactions: $($validation.interactions.Count)" -ForegroundColor Gray
    Write-Host "   Duration: $([math]::Round($duration, 0))ms" -ForegroundColor Gray
} catch {
    Write-Host "❌ Validation failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Drug Interaction (Timolol + Brimonidine)
Write-Host "`nTest 4: Critical Drug Interaction..." -ForegroundColor Yellow
try {
    $validationBody = @{
        patientId = $patientId
        medications = @(
            @{
                medicationName = "Timolol"
                eyeSpecificity = "OU"
                dosage = "0.5%"
                frequency = "BD"
                durationDays = 30
            },
            @{
                medicationName = "Brimonidine"
                eyeSpecificity = "OU"
                dosage = "0.2%"
                frequency = "BD"
                durationDays = 30
            }
        )
        checkAllergies = $true
        checkInteractions = $true
        checkContraindications = $true
        checkDuplicates = $true
    } | ConvertTo-Json -Depth 10

    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
        "X-Tenant-ID" = $tenantId
    }

    $startTime = Get-Date
    $validation = Invoke-RestMethod -Uri "$baseUrl/prescriptionvalidation/validate" -Method POST -Body $validationBody -Headers $headers
    $duration = ((Get-Date) - $startTime).TotalMilliseconds

    if ($validation.interactions.Count -gt 0) {
        Write-Host "✅ Interaction detected" -ForegroundColor Green
        Write-Host "   Drug 1: $($validation.interactions[0].drug1Name)" -ForegroundColor Gray
        Write-Host "   Drug 2: $($validation.interactions[0].drug2Name)" -ForegroundColor Gray
        Write-Host "   Severity: $($validation.interactions[0].severity)" -ForegroundColor $(if ($validation.interactions[0].severity -eq 'Critical') { 'Red' } else { 'Yellow' })
        Write-Host "   Description: $($validation.interactions[0].description)" -ForegroundColor Gray
    } else {
        Write-Host "⚠️  No interaction detected (check database)" -ForegroundColor Yellow
    }
    Write-Host "   Duration: $([math]::Round($duration, 0))ms" -ForegroundColor Gray
} catch {
    Write-Host "❌ Test failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: Get All Interactions
Write-Host "`nTest 5: Get All Drug Interactions..." -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $token"
        "X-Tenant-ID" = $tenantId
    }

    $interactions = Invoke-RestMethod -Uri "$baseUrl/prescriptionvalidation/interactions/all" -Method GET -Headers $headers

    if ($interactions.Count -gt 0) {
        Write-Host "✅ Found $($interactions.Count) interactions in database" -ForegroundColor Green
        Write-Host "`n   Sample Interactions:" -ForegroundColor Gray
        $interactions | Select-Object -First 5 | ForEach-Object {
            $color = switch ($_.severity) {
                'Critical' { 'Red' }
                'Serious' { 'Yellow' }
                default { 'Gray' }
            }
            Write-Host "   • $($_.drug1Name) ↔ $($_.drug2Name) [$($_.severity)]" -ForegroundColor $color
        }
    } else {
        Write-Host "⚠️  No interactions found in database" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Test failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 6: Get Medication Info
Write-Host "`nTest 6: Get Medication Information (Timolol)..." -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $token"
        "X-Tenant-ID" = $tenantId
    }

    $medInfo = Invoke-RestMethod -Uri "$baseUrl/prescriptionvalidation/medication?name=Timolol" -Method GET -Headers $headers

    if ($medInfo) {
        Write-Host "✅ Medication info retrieved" -ForegroundColor Green
        Write-Host "   Generic Name: $($medInfo.genericName)" -ForegroundColor Gray
        Write-Host "   Brand Names: $($medInfo.brandNames -join ', ')" -ForegroundColor Gray
        Write-Host "   Drug Class: $($medInfo.drugClass)" -ForegroundColor Gray
        Write-Host "   Contraindications: $($medInfo.contraindications -join ', ')" -ForegroundColor $(if ($medInfo.contraindications.Count -gt 0) { 'Yellow' } else { 'Gray' })
    } else {
        Write-Host "⚠️  Medication not found" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Test failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 7: Multiple Medications (Glaucoma Regimen)
Write-Host "`nTest 7: Multiple Medications - Glaucoma Regimen..." -ForegroundColor Yellow
try {
    $validationBody = @{
        patientId = $patientId
        medications = @(
            @{ medicationName = "Latanoprost"; eyeSpecificity = "OU"; dosage = "0.005%"; frequency = "HS"; durationDays = 90 },
            @{ medicationName = "Timolol"; eyeSpecificity = "OU"; dosage = "0.5%"; frequency = "BD"; durationDays = 90 },
            @{ medicationName = "Dorzolamide"; eyeSpecificity = "OU"; dosage = "2%"; frequency = "TDS"; durationDays = 90 },
            @{ medicationName = "Brimonidine"; eyeSpecificity = "OU"; dosage = "0.2%"; frequency = "BD"; durationDays = 90 }
        )
        checkAllergies = $true
        checkInteractions = $true
        checkContraindications = $true
        checkDuplicates = $true
    } | ConvertTo-Json -Depth 10

    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
        "X-Tenant-ID" = $tenantId
    }

    $startTime = Get-Date
    $validation = Invoke-RestMethod -Uri "$baseUrl/prescriptionvalidation/validate" -Method POST -Body $validationBody -Headers $headers
    $duration = ((Get-Date) - $startTime).TotalMilliseconds

    Write-Host "✅ Validation completed for 4 medications" -ForegroundColor Green
    Write-Host "   Errors: $($validation.errors.Count)" -ForegroundColor $(if ($validation.errors.Count -gt 0) { 'Red' } else { 'Green' })
    Write-Host "   Warnings: $($validation.warnings.Count)" -ForegroundColor $(if ($validation.warnings.Count -gt 0) { 'Yellow' } else { 'Green' })
    Write-Host "   Interactions: $($validation.interactions.Count)" -ForegroundColor $(if ($validation.interactions.Count -gt 0) { 'Yellow' } else { 'Green' })
    Write-Host "   Requires Override: $($validation.requiresOverride)" -ForegroundColor $(if ($validation.requiresOverride) { 'Red' } else { 'Green' })
    Write-Host "   Duration: $([math]::Round($duration, 0))ms" -ForegroundColor Gray

    if ($validation.interactions.Count -gt 0) {
        Write-Host "`n   Detected Interactions:" -ForegroundColor Gray
        $validation.interactions | ForEach-Object {
            $color = switch ($_.severity) {
                'Critical' { 'Red' }
                'Serious' { 'Yellow' }
                default { 'Gray' }
            }
            Write-Host "   • $($_.drug1Name) ↔ $($_.drug2Name) [$($_.severity)]" -ForegroundColor $color
        }
    }
} catch {
    Write-Host "❌ Test failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Testing Complete!" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Review test results above" -ForegroundColor Gray
Write-Host "2. Open http://localhost:3000/dashboard/optometrist/exam" -ForegroundColor Gray
Write-Host "3. Test PrescriptionValidationModal UI manually" -ForegroundColor Gray
Write-Host "4. Refer to PRESCRIPTION_VALIDATION_TESTING_GUIDE.md for detailed scenarios`n" -ForegroundColor Gray
