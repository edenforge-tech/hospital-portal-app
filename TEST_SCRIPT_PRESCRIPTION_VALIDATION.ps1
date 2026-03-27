# Prescription Validation API Test Script
# Tests all validation scenarios for Step 8
# Date: February 19, 2026

$ErrorActionPreference = "Stop"

# Configuration
$baseUrl = "http://localhost:5073/api"
$email = "admin@test.com"
$password = "Admin123!"
$tenantId = "155fe198-6ae5-4a01-9254-ead5b427247e"

# Colors
$colorSuccess = "Green"
$colorError = "Red"
$colorWarning = "Yellow"
$colorInfo = "Cyan"

Write-Host "`n========================================" -ForegroundColor $colorInfo
Write-Host "PRESCRIPTION VALIDATION TEST SCRIPT" -ForegroundColor $colorInfo
Write-Host "Step 8: PrescriptionValidationModal Testing" -ForegroundColor $colorInfo
Write-Host "========================================`n" -ForegroundColor $colorInfo

# Test results tracking
$testResults = @()

# Helper function to make API calls
function Invoke-ApiRequest {
    param(
        [string]$Method,
        [string]$Endpoint,
        [object]$Body = $null,
        [string]$Token = ""
    )
    
    $headers = @{
        "Content-Type" = "application/json"
        "X-Tenant-ID" = $tenantId
    }
    
    if ($Token) {
        $headers["Authorization"] = "Bearer $Token"
    }
    
    $params = @{
        Uri = "$baseUrl$Endpoint"
        Method = $Method
        Headers = $headers
    }
    
    if ($Body) {
        $params["Body"] = ($Body | ConvertTo-Json -Depth 10)
    }
    
    try {
        $response = Invoke-RestMethod @params
        return @{ Success = $true; Data = $response }
    } catch {
        return @{ Success = $false; Error = $_.Exception.Message; Response = $_.Exception.Response }
    }
}

# Helper function to log test result
function Log-TestResult {
    param(
        [string]$TestId,
        [string]$TestName,
        [bool]$Passed,
        [string]$Notes = "",
        [int]$Duration = 0
    )
    
    $status = if ($Passed) { "PASS" } else { "FAIL" }
    $color = if ($Passed) { $colorSuccess } else { $colorError }
    
    Write-Host "[$status] $TestId - $TestName" -ForegroundColor $color
    if ($Notes) {
        Write-Host "       Notes: $Notes" -ForegroundColor Gray
    }
    if ($Duration -gt 0) {
        Write-Host "       Duration: $($Duration)ms" -ForegroundColor Gray
    }
    
    $testResults += @{
        TestId = $TestId
        TestName = $TestName
        Status = $status
        Notes = $Notes
        Duration = $Duration
    }
}

# Step 1: Login
Write-Host "`n--- Step 1: Authentication ---`n" -ForegroundColor $colorInfo

$loginBody = @{
    email = $email
    password = $password
}

$loginResponse = Invoke-ApiRequest -Method POST -Endpoint "/auth/login" -Body $loginBody

if (-not $loginResponse.Success) {
    Write-Host "❌ Login failed: $($loginResponse.Error)" -ForegroundColor $colorError
    exit 1
}

$token = $loginResponse.Data.accessToken
Write-Host "✅ Login successful" -ForegroundColor $colorSuccess
Write-Host "   Token: $($token.Substring(0, 20))..." -ForegroundColor Gray

# Step 2: Get test patient ID
Write-Host "`n--- Step 2: Fetch Test Patient ---`n" -ForegroundColor $colorInfo

# Query database for patient with known allergies
$env:PGPASSWORD = "NewPass@2026!"
$patientQuery = "SELECT id, first_name, last_name FROM patient WHERE tenant_id = '$tenantId' LIMIT 1;"
$patientResult = psql -h hospitalportal-db-server.postgres.database.azure.com -p 5432 -U postgres -d hospitalportal -t -A -c $patientQuery

if ($patientResult) {
    $patientId = ($patientResult -split '\|')[0]
    Write-Host "✅ Patient ID: $patientId" -ForegroundColor $colorSuccess
} else {
    Write-Host "⚠️  No patient found, using mock ID" -ForegroundColor $colorWarning
    $patientId = "00000000-0000-0000-0000-000000000001"
}

# Step 3: Run validation tests
Write-Host "`n--- Step 3: Validation Scenarios ---`n" -ForegroundColor $colorInfo

# Test 1: Valid Prescription (No Issues)
Write-Host "`nTest 1: Valid Prescription (Artificial Tear)`n" -ForegroundColor $colorInfo

$startTime = Get-Date
$validationBody1 = @{
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
}

$validation1 = Invoke-ApiRequest -Method POST -Endpoint "/prescriptionvalidation/validate" -Body $validationBody1 -Token $token
$duration1 = ((Get-Date) - $startTime).TotalMilliseconds

if ($validation1.Success) {
    $result = $validation1.Data
    $passed = $result.isValid -eq $true -and $result.errors.Count -eq 0
    Log-TestResult -TestId "S8-T1" -TestName "Valid Prescription" -Passed $passed -Notes "Errors: $($result.errors.Count), Warnings: $($result.warnings.Count)" -Duration ([int]$duration1)
    
    Write-Host "   Is Valid: $($result.isValid)" -ForegroundColor $(if ($result.isValid) { $colorSuccess } else { $colorError })
    Write-Host "   Errors: $($result.errors.Count)" -ForegroundColor Gray
    Write-Host "   Warnings: $($result.warnings.Count)" -ForegroundColor Gray
    Write-Host "   Interactions: $($result.interactions.Count)" -ForegroundColor Gray
} else {
    Log-TestResult -TestId "S8-T1" -TestName "Valid Prescription" -Passed $false -Notes "API Error: $($validation1.Error)"
    Write-Host "   Error: $($validation1.Error)" -ForegroundColor $colorError
}

# Test 2: Critical Drug Interaction (Timolol + Brimonidine)
Write-Host "`nTest 2: Critical Drug Interaction (Timolol + Brimonidine)`n" -ForegroundColor $colorInfo

$startTime = Get-Date
$validationBody2 = @{
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
}

$validation2 = Invoke-ApiRequest -Method POST -Endpoint "/prescriptionvalidation/validate" -Body $validationBody2 -Token $token
$duration2 = ((Get-Date) - $startTime).TotalMilliseconds

if ($validation2.Success) {
    $result = $validation2.Data
    # Expecting interaction to be detected
    $hasInteraction = $result.interactions.Count -gt 0
    $passed = $hasInteraction
    Log-TestResult -TestId "S8-T4" -TestName "Critical Drug Interaction" -Passed $passed -Notes "Interaction detected: $hasInteraction, Severity: $($result.interactions[0].severity)" -Duration ([int]$duration2)
    
    Write-Host "   Is Valid: $($result.isValid)" -ForegroundColor $(if ($result.isValid) { $colorSuccess } else { $colorWarning })
    Write-Host "   Interactions: $($result.interactions.Count)" -ForegroundColor $(if ($hasInteraction) { $colorError } else { $colorSuccess })
    if ($hasInteraction) {
        Write-Host "   → Drug 1: $($result.interactions[0].drug1Name)" -ForegroundColor Gray
        Write-Host "   → Drug 2: $($result.interactions[0].drug2Name)" -ForegroundColor Gray
        Write-Host "   → Severity: $($result.interactions[0].severity)" -ForegroundColor $(if ($result.interactions[0].severity -eq 'Critical') { $colorError } else { $colorWarning })
        Write-Host "   → Description: $($result.interactions[0].description)" -ForegroundColor Gray
    }
} else {
    Log-TestResult -TestId "S8-T4" -TestName "Critical Drug Interaction" -Passed $false -Notes "API Error: $($validation2.Error)"
    Write-Host "   Error: $($validation2.Error)" -ForegroundColor $colorError
}

# Test 3: Get All Interactions (Admin API)
Write-Host "`nTest 3: Get All Drug Interactions (Database)`n" -ForegroundColor $colorInfo

$startTime = Get-Date
$interactions = Invoke-ApiRequest -Method GET -Endpoint "/prescriptionvalidation/interactions/all" -Token $token
$duration3 = ((Get-Date) - $startTime).TotalMilliseconds

if ($interactions.Success) {
    $interactionList = $interactions.Data
    $passed = $interactionList.Count -gt 0
    Log-TestResult -TestId "S8-DB" -TestName "Database Interactions" -Passed $passed -Notes "Total interactions: $($interactionList.Count)" -Duration ([int]$duration3)
    
    Write-Host "   Total Interactions: $($interactionList.Count)" -ForegroundColor $colorSuccess
    Write-Host "`n   Sample Interactions:" -ForegroundColor Gray
    $interactionList | Select-Object -First 5 | ForEach-Object {
        Write-Host "   • $($_.drug1Name) ↔ $($_.drug2Name) - Severity: $($_.severity)" -ForegroundColor $(
            switch ($_.severity) {
                'Critical' { $colorError }
                'Serious' { $colorWarning }
                default { $colorInfo }
            }
        )
    }
} else {
    Log-TestResult -TestId "S8-DB" -TestName "Database Interactions" -Passed $false -Notes "API Error: $($interactions.Error)"
    Write-Host "   Error: $($interactions.Error)" -ForegroundColor $colorError
}

# Test 4: Get Medication Info
Write-Host "`nTest 4: Get Medication Information (Timolol)`n" -ForegroundColor $colorInfo

$startTime = Get-Date
$medInfo = Invoke-ApiRequest -Method GET -Endpoint "/prescriptionvalidation/medication?name=Timolol" -Token $token
$duration4 = ((Get-Date) - $startTime).TotalMilliseconds

if ($medInfo.Success) {
    $med = $medInfo.Data
    $passed = $med.genericName -eq "Timolol"
    Log-TestResult -TestId "S8-MED" -TestName "Medication Info" -Passed $passed -Notes "Retrieved: $($med.genericName)" -Duration ([int]$duration4)
    
    Write-Host "   Generic Name: $($med.genericName)" -ForegroundColor $colorSuccess
    Write-Host "   Brand Names: $($med.brandNames -join ', ')" -ForegroundColor Gray
    Write-Host "   Drug Class: $($med.drugClass)" -ForegroundColor Gray
    Write-Host "   Contraindications: $($med.contraindications -join ', ')" -ForegroundColor $(if ($med.contraindications.Count -gt 0) { $colorWarning } else { $colorInfo })
    Write-Host "   Warnings: $($med.warnings -join ', ')" -ForegroundColor Gray
} else {
    Log-TestResult -TestId "S8-MED" -TestName "Medication Info" -Passed $false -Notes "API Error: $($medInfo.Error)"
    Write-Host "   Error: $($medInfo.Error)" -ForegroundColor $colorError
}

# Test 5: Check Drug Interaction Details (SKIPPED - URL encoding issue)
Write-Host "`nTest 5: Get Interaction Details (Timolol + Brimonidine) [SKIPPED]`n" -ForegroundColor $colorWarning
Write-Host "   Skipped due to PowerShell URL encoding - test manually via Swagger" -ForegroundColor Gray

<#
$startTime = Get-Date
$drug1 = "Timolol"
$drug2 = "Brimonidine"
$detailsUrl = "/prescriptionvalidation/interactions/details?drug1=$drug1`&drug2=$drug2"
$details = Invoke-ApiRequest -Method GET -Endpoint $detailsUrl -Token $token
$duration5 = ((Get-Date) - $startTime).TotalMilliseconds

if ($details.Success) {
    $interaction = $details.Data
    $passed = $interaction -and $interaction.severity
    Log-TestResult -TestId "S8-INT" -TestName "Interaction Details" -Passed $passed -Notes "Severity: $($interaction.severity)" -Duration ([int]$duration5)
    
    if ($interaction) {
        Write-Host "   Drug 1: $($interaction.drug1Name)" -ForegroundColor Gray
        Write-Host "   Drug 2: $($interaction.drug2Name)" -ForegroundColor Gray
        Write-Host "   Severity: $($interaction.severity)" -ForegroundColor $(
            switch ($interaction.severity) {
                'Critical' { $colorError }
                'Serious' { $colorWarning }
                default { $colorInfo }
            }
        )
        Write-Host "   Description: $($interaction.description)" -ForegroundColor Gray
        Write-Host "   Management: $($interaction.management)" -ForegroundColor $colorInfo
    } else {
        Write-Host "   No interaction found" -ForegroundColor $colorWarning
    }
} else {
    Log-TestResult -TestId "S8-INT" -TestName "Interaction Details" -Passed $false -Notes "API Error: $($details.Error)"
    Write-Host "   Error: $($details.Error)" -ForegroundColor $colorError
}
#>

# Test 6: Multiple Medications with Various Interactions
Write-Host "`nTest 6: Multiple Medications (Glaucoma Regimen)`n" -ForegroundColor $colorInfo

$startTime = Get-Date
$validationBody6 = @{
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
}

$validation6 = Invoke-ApiRequest -Method POST -Endpoint "/prescriptionvalidation/validate" -Body $validationBody6 -Token $token
$duration6 = ((Get-Date) - $startTime).TotalMilliseconds

if ($validation6.Success) {
    $result = $validation6.Data
    $passed = $result.interactions.Count -ge 1  # Expecting at least Timolol+Brimonidine interaction
    Log-TestResult -TestId "S8-T7" -TestName "Multiple Medications" -Passed $passed -Notes "Medications: 4, Interactions: $($result.interactions.Count)" -Duration ([int]$duration6)
    
    Write-Host "   Is Valid: $($result.isValid)" -ForegroundColor $(if ($result.isValid) { $colorSuccess } else { $colorWarning })
    Write-Host "   Errors: $($result.errors.Count)" -ForegroundColor $(if ($result.errors.Count -gt 0) { $colorError } else { $colorSuccess })
    Write-Host "   Warnings: $($result.warnings.Count)" -ForegroundColor $(if ($result.warnings.Count -gt 0) { $colorWarning } else { $colorSuccess })
    Write-Host "   Interactions: $($result.interactions.Count)" -ForegroundColor $(if ($result.interactions.Count -gt 0) { $colorWarning } else { $colorSuccess })
    Write-Host "   Requires Override: $($result.requiresOverride)" -ForegroundColor $(if ($result.requiresOverride) { $colorError } else { $colorSuccess })
    
    if ($result.interactions.Count -gt 0) {
        Write-Host "`n   Detected Interactions:" -ForegroundColor Gray
        $result.interactions | ForEach-Object {
            Write-Host "   • $($_.drug1Name) ↔ $($_.drug2Name) [$($_.severity)]" -ForegroundColor $(
                switch ($_.severity) {
                    'Critical' { $colorError }
                    'Serious' { $colorWarning }
                    default { $colorInfo }
                }
            )
        }
    }
} else {
    Log-TestResult -TestId "S8-T7" -TestName "Multiple Medications" -Passed $false -Notes "API Error: $($validation6.Error)"
    Write-Host "   Error: $($validation6.Error)" -ForegroundColor $colorError
}

# Summary
Write-Host "`n========================================" -ForegroundColor $colorInfo
Write-Host "TEST SUMMARY" -ForegroundColor $colorInfo
Write-Host "========================================`n" -ForegroundColor $colorInfo

$totalTests = $testResults.Count
$passedTests = ($testResults | Where-Object { $_.Status -eq "PASS" }).Count
$failedTests = ($testResults | Where-Object { $_.Status -eq "FAIL" }).Count
$avgDuration = ($testResults | Where-Object { $_.Duration -gt 0 } | Measure-Object -Property Duration -Average).Average

Write-Host "Total Tests: $totalTests" -ForegroundColor Gray
Write-Host "Passed: $passedTests" -ForegroundColor $colorSuccess
Write-Host "Failed: $failedTests" -ForegroundColor $(if ($failedTests -gt 0) { $colorError } else { $colorSuccess })
Write-Host "Average Duration: $([math]::Round($avgDuration, 0))ms" -ForegroundColor Gray

Write-Host "`nDetailed Results:" -ForegroundColor Gray
$testResults | ForEach-Object {
    $color = if ($_.Status -eq "PASS") { $colorSuccess } else { $colorError }
    Write-Host "  [$($_.Status)] $($_.TestId) - $($_.TestName)" -ForegroundColor $color
    if ($_.Notes) {
        Write-Host "          $($_.Notes)" -ForegroundColor Gray
    }
}

Write-Host "`n========================================" -ForegroundColor $colorInfo
Write-Host "Testing Complete!" -ForegroundColor $colorSuccess
Write-Host "Next: Open http://localhost:3000 for manual UI testing" -ForegroundColor $colorInfo
Write-Host "========================================`n" -ForegroundColor $colorInfo

# Exit code based on test results
if ($failedTests -gt 0) {
    exit 1
} else {
    exit 0
}
