# =====================================================
# PATIENT REGISTRATION PHASE 1: EXECUTE MIGRATION
# =====================================================
# This script applies the Phase 1 migration to fix data loss
# Date: January 30, 2026
# Priority: P0 - CRITICAL
# =====================================================

param(
    [switch]$SkipMigration,
    [switch]$SkipBuild,
    [switch]$TestOnly
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PATIENT REGISTRATION PHASE 1 MIGRATION" -ForegroundColor Cyan
Write-Host "Fix Emergency Contact & Insurance Data Loss" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$projectPath = "microservices\auth-service\AuthService"
$rootPath = $PSScriptRoot
$migrationPath = Join-Path $rootPath "migrations\patient_registration_phase1_emergency_insurance.sql"

# Change to project directory
Set-Location $projectPath

# Step 1: Build the project
if (-not $SkipBuild -and -not $TestOnly) {
    Write-Host "[1/5] Building project..." -ForegroundColor Yellow
    dotnet build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Build failed!" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Build successful`n" -ForegroundColor Green
}

# Step 2: Create EF Core migration
if (-not $SkipMigration -and -not $TestOnly) {
    Write-Host "[2/5] Creating EF Core migration..." -ForegroundColor Yellow
    $migrationName = "AddEmergencyContactAndInsurance_$(Get-Date -Format 'yyyyMMddHHmmss')"
    dotnet ef migrations add $migrationName
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Migration creation failed!" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Migration created: $migrationName`n" -ForegroundColor Green
}

# Step 3: Apply EF Core migration
if (-not $SkipMigration -and -not $TestOnly) {
    Write-Host "[3/5] Applying migration to database..." -ForegroundColor Yellow
    dotnet ef database update
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Database update failed!" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Database updated successfully`n" -ForegroundColor Green
}

# Step 4: Verify migration (query database)
Write-Host "[4/5] Verifying migration..." -ForegroundColor Yellow
$verificationQuery = @"
SELECT 
    column_name, 
    data_type, 
    character_maximum_length,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'patients' 
  AND column_name IN (
    'emergency_contact_name', 'emergency_contact_phone', 'emergency_contact_relationship',
    'emergency_contact_email', 'emergency_contact_address',
    'insurance_provider', 'insurance_policy_number', 'insurance_group_number',
    'insurance_valid_from', 'insurance_valid_to', 'insurance_status',
    'created_by_user_id', 'updated_by_user_id', 'status', 'deceased_date'
  )
ORDER BY column_name;
"@

Write-Host "Expected: 15 new columns" -ForegroundColor Gray
Write-Host "To verify manually, run this SQL query:" -ForegroundColor Gray
Write-Host $verificationQuery -ForegroundColor DarkGray
Write-Host ""

# Step 5: Restart backend server
if (-not $TestOnly) {
    Write-Host "[5/5] Restarting backend server..." -ForegroundColor Yellow
    
    # Stop existing dotnet processes
    $dotnetProcesses = Get-Process -Name "dotnet" -ErrorAction SilentlyContinue
    if ($dotnetProcesses) {
        Write-Host "Stopping existing backend server..." -ForegroundColor Gray
        Stop-Process -Name "dotnet" -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 2
    }
    
    # Start backend in background
    Write-Host "Starting backend server on port 5073..." -ForegroundColor Gray
    Start-Process -FilePath "dotnet" -ArgumentList "run" -NoNewWindow
    
    Write-Host "✅ Backend server starting...`n" -ForegroundColor Green
    Write-Host "Backend will be available at:" -ForegroundColor Cyan
    Write-Host "  HTTP:  http://localhost:5073" -ForegroundColor White
    Write-Host "  HTTPS: https://localhost:7285" -ForegroundColor White
    Write-Host "  Swagger: http://localhost:5073/swagger`n" -ForegroundColor White
}

Write-Host "========================================" -ForegroundColor Green
Write-Host "✅ PHASE 1 MIGRATION COMPLETED!" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Green

Write-Host "📋 NEXT STEPS:" -ForegroundColor Yellow
Write-Host "1. Wait 10 seconds for backend to start" -ForegroundColor White
Write-Host "2. Open frontend: http://localhost:3000/dashboard/patients/new" -ForegroundColor White
Write-Host "3. Register a new patient with:" -ForegroundColor White
Write-Host "   - Emergency Contact Name: 'John Doe'" -ForegroundColor Gray
Write-Host "   - Emergency Contact Phone: '+1234567890'" -ForegroundColor Gray
Write-Host "   - Insurance Provider: 'Blue Cross'" -ForegroundColor Gray
Write-Host "   - Insurance Policy Number: 'BC123456'" -ForegroundColor Gray
Write-Host "4. Verify data saved in database:`n" -ForegroundColor White

$testQuery = @"
SELECT 
    first_name, 
    last_name,
    emergency_contact_name,
    emergency_contact_phone,
    insurance_provider,
    insurance_policy_number,
    status,
    created_by_user_id
FROM patients 
ORDER BY created_at DESC 
LIMIT 5;
"@

Write-Host "SQL Verification Query:" -ForegroundColor Cyan
Write-Host $testQuery -ForegroundColor Gray
Write-Host ""

Write-Host "📁 FILES MODIFIED:" -ForegroundColor Yellow
Write-Host "  ✅ Patient.cs - Added 15 new properties" -ForegroundColor White
Write-Host "  ✅ PatientDtos.cs - Updated DTOs" -ForegroundColor White
Write-Host "  ✅ AppDbContext.cs - Added column mappings" -ForegroundColor White
Write-Host "  ✅ Database - Added 15 new columns" -ForegroundColor White
Write-Host ""

Write-Host "⚠️  IMPORTANT: Test patient registration before proceeding to Phase 2!" -ForegroundColor Yellow
Write-Host ""

# Return to original directory
Set-Location $rootPath
