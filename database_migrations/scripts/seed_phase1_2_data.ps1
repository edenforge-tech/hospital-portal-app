<#
.SYNOPSIS
    Execute Phase 1 & 2 Data Seeding - Complete Sample Data Setup

.DESCRIPTION
    This script executes all Phase 1 & 2 data seeding migrations:
    - 30 Test Users across all 78 roles
    - Sample Clinical Data (100 patients, 200 appointments)
    - 5 Additional Tenants (multi-tenant examples)
    - 40 Medical Specialty Departments
    
.PARAMETER DatabaseHost
    Azure PostgreSQL server hostname
    Default: hospitalportal-db-server.postgres.database.azure.com

.PARAMETER DatabaseName
    Database name
    Default: hospitalportal

.PARAMETER DatabaseUser
    PostgreSQL username
    Default: postgres

.PARAMETER DatabasePort
    PostgreSQL port
    Default: 5432

.PARAMETER SkipConfirmation
    Skip confirmation prompt and execute immediately

.EXAMPLE
    .\seed_phase1_2_data.ps1
    Prompts for password and executes all seeding with confirmation

.EXAMPLE
    .\seed_phase1_2_data.ps1 -SkipConfirmation
    Executes immediately without confirmation

.NOTES
    Author: Hospital Portal Development Team
    Date: January 23, 2026
    Prerequisites: 
    - EF Core migrations must be applied first
    - Migrations 01, 02, 03 must be executed (employment tables, roles, permissions)
#>

param(
    [string]$DatabaseHost = $env:DB_HOST ?? "hospitalportal-db-server.postgres.database.azure.com",
    [string]$DatabaseName = $env:DB_NAME ?? "hospitalportal",
    [string]$DatabaseUser = $env:DB_USER ?? "postgres",
    [string]$DatabasePort = $env:DB_PORT ?? "5432",
    [switch]$SkipConfirmation
)

# Set strict mode
$ErrorActionPreference = "Stop"

# Display banner
Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "PHASE 1 & 2 DATA SEEDING" -ForegroundColor Cyan
Write-Host "Hospital Portal - Complete Sample Data" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Display what will be seeded
Write-Host "📊 This script will seed the following:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  ✓ 30 Test Users (across all 78 roles)" -ForegroundColor White
Write-Host "     - 5 Executive users (CEO, CMO, CFO, etc.)"
Write-Host "     - 8 Clinical users (Ophthalmologists, Surgeons)"
Write-Host "     - 4 Optometry staff"
Write-Host "     - 3 Nursing staff"
Write-Host "     - 5 Admin staff (HR, Billing, Front Desk)"
Write-Host "     - 3 Support staff"
Write-Host "     - 2 External users (Consultants, Auditors)"
Write-Host ""
Write-Host "  ✓ Sample Clinical Data" -ForegroundColor White
Write-Host "     - 100 Patients with realistic eye conditions"
Write-Host "     - 200 Appointments (past/present/future)"
Write-Host "     - 50 Prescriptions with eye medications"
Write-Host "     - 30 Lab Orders with results"
Write-Host "     - 20 Imaging Studies (OCT, Fundus photos)"
Write-Host "     - 15 Surgical Schedules (Cataract, Retina, LASIK)"
Write-Host ""
Write-Host "  ✓ 5 Additional Tenants (Multi-tenant examples)" -ForegroundColor White
Write-Host "     - Small Clinic (1 branch, 25 users)"
Write-Host "     - Large Network (5 branches, 500 users)"
Write-Host "     - Specialized Hospital (3 branches)"
Write-Host "     - Academic Center (2 branches)"
Write-Host "     - Rural Facility (1 branch)"
Write-Host ""
Write-Host "  ✓ 40 Medical Specialty Departments" -ForegroundColor White
Write-Host "     - 8 Eye Care Specialties"
Write-Host "     - 10 General Medical Specialties"
Write-Host "     - 5 Surgical Specialties"
Write-Host "     - 12 Diagnostic & Support"
Write-Host "     - 5 Administrative Departments"
Write-Host ""

# Display connection info
Write-Host "📡 Database Connection:" -ForegroundColor Yellow
Write-Host "   Host: $DatabaseHost"
Write-Host "   Database: $DatabaseName"
Write-Host "   User: $DatabaseUser"
Write-Host "   Port: $DatabasePort"
Write-Host ""

# Confirmation prompt
if (-not $SkipConfirmation) {
    $response = Read-Host "Do you want to proceed with seeding? (yes/no)"
    if ($response -ne "yes" -and $response -ne "y") {
        Write-Host ""
        Write-Host "❌ Seeding cancelled by user" -ForegroundColor Red
        exit 0
    }
}

Write-Host ""
Write-Host "▶️  Proceeding with data seeding..." -ForegroundColor Green
Write-Host ""

# Prompt for password
Write-Host "🔐 Enter PostgreSQL password for user '$DatabaseUser': " -NoNewline -ForegroundColor Yellow
$securePassword = Read-Host -AsSecureString
$plainPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
)
$env:PGPASSWORD = $plainPassword

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "EXECUTING SEED SCRIPT" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Check if psql is available
try {
    $psqlVersion = & psql --version 2>&1
    Write-Host "✓ PostgreSQL Client: $psqlVersion" -ForegroundColor Gray
} catch {
    Write-Host "❌ ERROR: psql command not found" -ForegroundColor Red
    Write-Host "   Please install PostgreSQL client tools and add to PATH" -ForegroundColor Yellow
    exit 1
}

# Check if seed script exists
$seedScriptPath = Join-Path -Path $PSScriptRoot -ChildPath "SEED_PHASE1_2_DATA.sql"
if (-not (Test-Path $seedScriptPath)) {
    Write-Host "❌ ERROR: Seed script not found at: $seedScriptPath" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Seed script found: SEED_PHASE1_2_DATA.sql" -ForegroundColor Gray
Write-Host ""

# Execute the seed script
Write-Host "⏳ Executing seed script (this may take 2-5 minutes)..." -ForegroundColor Cyan
Write-Host ""

try {
    & psql -h $DatabaseHost `
           -U $DatabaseUser `
           -d $DatabaseName `
           -p $DatabasePort `
           -f $seedScriptPath `
           --echo-errors `
           --set ON_ERROR_STOP=on
    
    if ($LASTEXITCODE -ne 0) {
        throw "psql command exited with code $LASTEXITCODE"
    }
    
    Write-Host ""
    Write-Host "============================================" -ForegroundColor Green
    Write-Host "✅ SEEDING COMPLETED SUCCESSFULLY" -ForegroundColor Green
    Write-Host "============================================" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "📊 Next Steps:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  1. Verify data in database:" -ForegroundColor White
    Write-Host "     SELECT COUNT(*) FROM ""AspNetUsers"" WHERE deleted_at IS NULL;"
    Write-Host "     SELECT COUNT(*) FROM patient WHERE deleted_at IS NULL;"
    Write-Host "     SELECT COUNT(*) FROM appointment WHERE deleted_at IS NULL;"
    Write-Host ""
    Write-Host "  2. Run compliance tests:" -ForegroundColor White
    Write-Host "     .\run_tests.ps1"
    Write-Host ""
    Write-Host "  3. Start the backend:" -ForegroundColor White
    Write-Host "     cd microservices\auth-service\AuthService"
    Write-Host "     dotnet run"
    Write-Host ""
    Write-Host "  4. Test user credentials:" -ForegroundColor White
    Write-Host "     Username: superadmin@hospitalportal.com"
    Write-Host "     Password: Test@123456"
    Write-Host ""
    
} catch {
    Write-Host ""
    Write-Host "============================================" -ForegroundColor Red
    Write-Host "❌ SEEDING FAILED" -ForegroundColor Red
    Write-Host "============================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Error: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Troubleshooting:" -ForegroundColor Yellow
    Write-Host "  1. Check database connection: psql -h $DatabaseHost -U $DatabaseUser -d $DatabaseName -c 'SELECT version();'"
    Write-Host "  2. Verify migrations 01, 02, 03 were executed"
    Write-Host "  3. Check error messages above for specific issues"
    Write-Host "  4. Review migration logs in migrations/ folder"
    Write-Host ""
    exit 1
} finally {
    # Clear password from environment
    $env:PGPASSWORD = $null
}

Write-Host "🎉 Phase 1 & 2 data seeding complete!" -ForegroundColor Green
Write-Host ""
