# =====================================================
# APPLY PATIENT PHASE 1 MIGRATION
# =====================================================
# Applies emergency contact and insurance fields to patients table
# Date: January 30, 2026
# =====================================================

param(
    [string]$Server = "sam-medical-care.postgres.database.azure.com",
    [string]$Database = "MedicalCareDB",
    [string]$User = "postgresadmin",
    [string]$Password = "S@m12345"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PATIENT PHASE 1: EMERGENCY & INSURANCE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$scriptPath = Join-Path $PSScriptRoot "migrations\patient_phase1_emergency_insurance.sql"

if (-not (Test-Path $scriptPath)) {
    Write-Host "ERROR: SQL script not found: $scriptPath" -ForegroundColor Red
    exit 1
}

Write-Host "SQL Script: $scriptPath" -ForegroundColor Gray
Write-Host "Database: $Database @ $Server" -ForegroundColor Gray
Write-Host ""

# Set password environment variable
$env:PGPASSWORD = $Password

Write-Host "Step 1/2: Applying SQL migration..." -ForegroundColor Yellow

# Apply the migration
psql -h $Server -U $User -d $Database -f $scriptPath

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Migration failed!" -ForegroundColor Red
    exit 1
}

Write-Host "SUCCESS: Migration applied" -ForegroundColor Green
Write-Host ""

Write-Host "Step 2/2: Verifying columns..." -ForegroundColor Yellow

# Verify the columns were added
$verifyScript = "SELECT COUNT(*) as added_columns FROM information_schema.columns WHERE table_name = 'patients' AND column_name IN ('emergency_contact_name', 'emergency_contact_phone', 'insurance_provider', 'insurance_policy_number', 'status');"

psql -h $Server -U $User -d $Database -c $verifyScript

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "PHASE 1 MIGRATION COMPLETE" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

Write-Host "NEXT STEPS:" -ForegroundColor Yellow
Write-Host "1. Restart backend server:" -ForegroundColor White
Write-Host "   cd microservices\auth-service\AuthService" -ForegroundColor Gray
Write-Host "   dotnet run" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Test patient registration with new fields" -ForegroundColor White
Write-Host "   http://localhost:3000/dashboard/patients/new" -ForegroundColor Gray
Write-Host ""
