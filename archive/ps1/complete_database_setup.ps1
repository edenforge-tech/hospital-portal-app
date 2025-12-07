# =====================================================
# Complete Database Setup Workflow
# =====================================================

param(
    [switch]$SkipReset
)

$ErrorActionPreference = "Stop"

Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "Hospital Portal - Complete Database Setup"
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Database Reset (if not skipped)
if (-not $SkipReset) {
    Write-Host "📋 Step 1: Resetting Database" -ForegroundColor Yellow
    Write-Host "-----------------------------------------------------" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "⚠️  This will DROP ALL DATA in the database!" -ForegroundColor Red
    Write-Host ""
    $confirm = Read-Host "Continue with database reset? (yes/no)"
    
    if ($confirm -ne "yes") {
        Write-Host "Aborted." -ForegroundColor Red
        exit 1
    }
    
    Write-Host ""
    Write-Host "Run this SQL in Azure Data Studio or pgAdmin:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "-- Copy and paste this into your SQL tool:" -ForegroundColor Gray
    Write-Host "DROP SCHEMA IF EXISTS public CASCADE;" -ForegroundColor White
    Write-Host "CREATE SCHEMA public;" -ForegroundColor White
    Write-Host "GRANT ALL ON SCHEMA public TO postgres;" -ForegroundColor White
    Write-Host "GRANT ALL ON SCHEMA public TO public;" -ForegroundColor White
    Write-Host "CREATE EXTENSION IF NOT EXISTS ""uuid-ossp"";" -ForegroundColor White
    Write-Host ""
    
    $completed = Read-Host "Have you run the reset SQL? (yes/no)"
    if ($completed -ne "yes") {
        Write-Host "Please run the SQL first, then re-run this script." -ForegroundColor Yellow
        exit 1
    }
}

Write-Host ""
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "📋 Step 2: Applying EF Core Migrations" -ForegroundColor Yellow
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host ""

Set-Location "c:\Users\Sam Aluri\Downloads\Hospital Portal\microservices\auth-service\AuthService"

Write-Host "▶️  Running: dotnet ef database update" -ForegroundColor Cyan
Write-Host ""

dotnet ef database update

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ EF Migration failed!" -ForegroundColor Red
    Write-Host "Check the error above and try again." -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "✅ EF Migrations applied successfully!" -ForegroundColor Green
Write-Host ""

# Step 3: Apply additional SQL migrations
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "📋 Step 3: Applying Additional SQL Migrations" -ForegroundColor Yellow
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "This adds soft deletes, audit triggers, RLS policies, etc." -ForegroundColor Gray
Write-Host ""

Set-Location "c:\Users\Sam Aluri\Downloads\Hospital Portal"

Write-Host "Run this SQL file in Azure Data Studio:" -ForegroundColor Cyan
Write-Host "  File: MASTER_DATABASE_MIGRATIONS.sql" -ForegroundColor White
Write-Host ""

$sqlDone = Read-Host "Have you run MASTER_DATABASE_MIGRATIONS.sql? (yes/no)"
if ($sqlDone -ne "yes") {
    Write-Host ""
    Write-Host "⚠️  Run MASTER_DATABASE_MIGRATIONS.sql in your SQL tool, then continue." -ForegroundColor Yellow
    Write-Host ""
    exit 0
}

# Step 4: Load sample data
Write-Host ""
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "📋 Step 4: Loading Sample Data" -ForegroundColor Yellow
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Run this SQL file in Azure Data Studio:" -ForegroundColor Cyan
Write-Host "  File: sample_data_complete.sql" -ForegroundColor White
Write-Host ""

$sampleDone = Read-Host "Have you run sample_data_complete.sql? (yes/no)"
if ($sampleDone -ne "yes") {
    Write-Host ""
    Write-Host "⚠️  Run sample_data_complete.sql in your SQL tool, then continue." -ForegroundColor Yellow
    Write-Host ""
    exit 0
}

# Step 5: Create test users
Write-Host ""
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "📋 Step 5: Creating Test Users" -ForegroundColor Yellow
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Run this SQL file in Azure Data Studio:" -ForegroundColor Cyan
Write-Host "  File: create_test_users_for_testing.sql" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  IMPORTANT: Copy the TenantId from the output!" -ForegroundColor Yellow
Write-Host ""

$testUsersDone = Read-Host "Have you run create_test_users_for_testing.sql? (yes/no)"
if ($testUsersDone -ne "yes") {
    Write-Host ""
    Write-Host "⚠️  Run create_test_users_for_testing.sql and copy the TenantId!" -ForegroundColor Yellow
    Write-Host ""
    exit 0
}

Write-Host ""
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "✅ DATABASE SETUP COMPLETE!" -ForegroundColor Green
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 What was done:" -ForegroundColor Yellow
Write-Host "  ✓ Database schema created (96 tables)" -ForegroundColor Green
Write-Host "  ✓ Soft deletes, audit triggers, RLS enabled" -ForegroundColor Green
Write-Host "  ✓ Sample data loaded (tenants, roles, permissions)" -ForegroundColor Green
Write-Host "  ✓ Test users created (5 users)" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Next Step: Start the Backend" -ForegroundColor Yellow
Write-Host "-----------------------------------------------------" -ForegroundColor Yellow
Write-Host ""
Write-Host "Run:" -ForegroundColor White
Write-Host '  cd "microservices\auth-service\AuthService"' -ForegroundColor Cyan
Write-Host "  dotnet run" -ForegroundColor Cyan
Write-Host ""
Write-Host "Then open: https://localhost:7001/swagger" -ForegroundColor Cyan
Write-Host ""
Write-Host "Test Credentials (Password: Test@123456):" -ForegroundColor White
Write-Host "  admin@test.com" -ForegroundColor Green
Write-Host "  doctor@test.com" -ForegroundColor Green
Write-Host "  nurse@test.com" -ForegroundColor Green
Write-Host "  receptionist@test.com" -ForegroundColor Green
Write-Host "  labtech@test.com" -ForegroundColor Green
Write-Host ""
