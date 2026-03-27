# =====================================================================
# Module 3 Master Seed Data Execution Script
# Purpose: Execute all Module 3 seed data scripts in correct order
# Database: Azure PostgreSQL (hospitalportal)
# Author: AI Agent
# Date: February 24, 2026
# =====================================================================

param(
    [string]$Server = "hospitalportal-db-server.postgres.database.azure.com",
    [string]$Database = "hospitalportal",
    [string]$Username = "postgres",
    [string]$Password = $env:PGPASSWORD
)

# Configuration
$ErrorActionPreference = "Stop"
$MigrationsPath = Split-Path -Parent $MyInvocation.MyCommand.Path

# Color functions
function Write-Success { Write-Host $args -ForegroundColor Green }
function Write-Info { Write-Host $args -ForegroundColor Cyan }
function Write-Warning { Write-Host $args -ForegroundColor Yellow }
function Write-Error { Write-Host $args -ForegroundColor Red }

# Banner
Write-Host "`n========================================" -ForegroundColor Magenta
Write-Host "  MODULE 3 SEED DATA EXECUTION" -ForegroundColor Magenta
Write-Host "========================================`n" -ForegroundColor Magenta

# Validate password
if ([string]::IsNullOrEmpty($Password)) {
    Write-Error "ERROR: PGPASSWORD environment variable not set!"
    Write-Info "Set it with: `$env:PGPASSWORD='NewPass@2026!'"
    exit 1
}

# Test database connection
Write-Info "Testing database connection..."
$env:PGPASSWORD = $Password
$testResult = psql -h $Server -U $Username -d $Database -c "SELECT 1;" 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Error "ERROR: Cannot connect to database!"
    Write-Error $testResult
    exit 1
}
Write-Success "✓ Database connection successful`n"

# Seed scripts in execution order
$seedScripts = @(
    @{
        File = "20_seed_patients.sql"
        Description = "Seed 100 sample patients"
        Required = $true
    }
    @{
        File = "53_seed_master_data_final.sql"
        Description = "Seed master data - insurance providers TPAs surgery types anesthesia types government schemes"
        Required = $true
    }
    @{
        File = "54_seed_surgery_packages.sql"
        Description = "Seed surgery package templates and item catalog"
        Required = $false
    }
    @{
        File = "55_seed_consent_templates.sql"
        Description = "Seed consent form templates - 12 templates"
        Required = $false
    }
    @{
        File = "54_seed_counseling_sessions.sql"
        Description = "Seed 30 counseling sessions - various statuses"
        Required = $true
    }
    @{
        File = "55_seed_insurance_pre_auths.sql"
        Description = "Seed 17 insurance pre-authorizations"
        Required = $true
    }
    @{
        File = "56_seed_payment_transactions.sql"
        Description = "Seed 30 payment transactions - cash card UPI schemes"
        Required = $true
    }
    @{
        File = "57_seed_patient_admissions.sql"
        Description = "Seed 15 patient admissions - IPD Daycare Emergency"
        Required = $true
    }
)

# Execution summary
$total = $seedScripts.Count
$executed = 0
$failed = 0
$skipped = 0
$startTime = Get-Date

Write-Info "📋 Execution Plan: $total seed scripts queued`n"

foreach ($script in $seedScripts) {
    $scriptPath = Join-Path $MigrationsPath $script.File
    $number = ++$executed
    
    Write-Host "[$number/$total] " -NoNewline -ForegroundColor Yellow
    Write-Host $script.Description -ForegroundColor White
    Write-Host "        File: $($script.File)" -ForegroundColor Gray
    
    if (-not (Test-Path $scriptPath)) {
        if ($script.Required) {
            Write-Error "✗ REQUIRED FILE NOT FOUND: $scriptPath"
            $failed++
        } else {
            Write-Warning "⊘ Optional file not found - SKIPPING"
            $skipped++
        }
        Write-Host ""
        continue
    }
    
    try {
        $output = psql -h $Server -U $Username -d $Database -f $scriptPath 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Success "        ✓ SUCCESS"
            
            # Show row counts from verification queries
            $verificationLines = $output | Select-String -Pattern "✓|row_count|count.*\|" | Select-Object -Last 3
            if ($verificationLines) {
                foreach ($line in $verificationLines) {
                    Write-Host "        $line" -ForegroundColor DarkGray
                }
            }
        } else {
            Write-Error "        ✗ EXECUTION FAILED"
            Write-Error "        $output"
            $failed++
        }
    }
    catch {
        Write-Error "        ✗ EXCEPTION: $($_.Exception.Message)"
        $failed++
    }
    
    Write-Host ""
}

# Summary
$duration = (Get-Date) - $startTime
Write-Host "`n========================================" -ForegroundColor Magenta
Write-Host "  EXECUTION SUMMARY" -ForegroundColor Magenta
Write-Host "========================================" -ForegroundColor Magenta

Write-Host "Total Scripts:    " -NoNewline
Write-Host $total -ForegroundColor White

Write-Host "Executed:         " -NoNewline
Write-Host ($executed - $failed - $skipped) -ForegroundColor Green

if ($skipped -gt 0) {
    Write-Host "Skipped:          " -NoNewline
    Write-Host $skipped -ForegroundColor Yellow
}

if ($failed -gt 0) {
    Write-Host "Failed:           " -NoNewline
    Write-Host $failed -ForegroundColor Red
}

Write-Host "Duration:         " -NoNewline
Write-Host "$($duration.TotalSeconds) seconds" -ForegroundColor Cyan

Write-Host "`n========================================`n" -ForegroundColor Magenta

if ($failed -gt 0) {
    Write-Error "❌ SEED DATA EXECUTION COMPLETED WITH ERRORS!"
    exit 1
} else {
    Write-Success "✅ ALL SEED DATA EXECUTED SUCCESSFULLY!"
    Write-Info "`n📊 Next Steps:"
    Write-Info "   1. Refresh your frontend: http://localhost:3000/dashboard/counselor"
    Write-Info "   2. Dashboard should now show populated data"
    Write-Info "   3. Test forms - dropdowns should load from database"
    Write-Info "`n🔗 Verify data in PostgreSQL:"
    Write-Info "   SELECT COUNT(*) FROM counseling_session;"
    Write-Info "   SELECT COUNT(*) FROM insurance_pre_authorization;"
    Write-Info "   SELECT COUNT(*) FROM payment_transaction;"
    Write-Info "   SELECT COUNT(*) FROM patient_admission;`n"
    exit 0
}
