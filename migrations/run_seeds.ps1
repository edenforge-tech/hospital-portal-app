# Module 3 Seed Data Execution Script
# Simplified version for reliability

param(
    [string]$Server = "hospitalportal-db-server.postgres.database.azure.com",
    [string]$Database = "hospitalportal",
    [string]$Username = "postgres"
)

$ErrorActionPreference = "Stop"

Write-Host "`n========================================" -ForegroundColor Magenta
Write-Host "  MODULE 3 SEED DATA EXECUTION" -ForegroundColor Magenta
Write-Host "========================================`n" -ForegroundColor Magenta

# Test connection
Write-Host "Testing database connection..." -ForegroundColor Cyan
$testCmd = "SELECT 1"
$result = psql -h $Server -U $Username -d $Database -c $testCmd 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Cannot connect to database!" -ForegroundColor Red
    exit 1
}
Write-Host "SUCCESS: Database connection working`n" -ForegroundColor Green

# Define seed scripts
$scripts = @(
    "20_seed_patients.sql",
    "53_seed_master_data_final.sql",
    "54_seed_surgery_packages.sql",
    "55_seed_consent_templates.sql",
    "54_seed_counseling_sessions.sql",
    "55_seed_insurance_pre_auths.sql",
    "56_seed_payment_transactions.sql",
    "57_seed_patient_admissions.sql"
)

$success = 0
$failed = 0
$skipped = 0
$num = 0

foreach ($script in $scripts) {
    $num++
    Write-Host "[$num/$($scripts.Count)] Executing: $script" -ForegroundColor Yellow
    
    if (-not (Test-Path $script)) {
        Write-Host "  WARNING: File not found - SKIPPING" -ForegroundColor Yellow
        $skipped++
        continue
    }
    
    $output = psql -h $Server -U $Username -d $Database -f $script 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  SUCCESS" -ForegroundColor Green
        $success++
    } else {
        Write-Host "  FAILED: $output" -ForegroundColor Red
        $failed++
    }
    Write-Host ""
}

# Summary
Write-Host "`n========================================" -ForegroundColor Magenta
Write-Host "  EXECUTION SUMMARY" -ForegroundColor Magenta
Write-Host "========================================" -ForegroundColor Magenta
Write-Host "Total:     $($scripts.Count)" -ForegroundColor White
Write-Host "Success:   $success" -ForegroundColor Green
Write-Host "Skipped:   $skipped" -ForegroundColor Yellow
Write-Host "Failed:    $failed" -ForegroundColor $(if($failed -gt 0){"Red"}else{"Green"})
Write-Host "========================================`n" -ForegroundColor Magenta

if ($failed -gt 0) {
    Write-Host "COMPLETED WITH ERRORS" -ForegroundColor Red
    exit 1
} else {
    Write-Host "ALL SEED DATA EXECUTED SUCCESSFULLY!" -ForegroundColor Green
    Write-Host "`nNext: Refresh http://localhost:3000/dashboard/counselor`n" -ForegroundColor Cyan
    exit 0
}
