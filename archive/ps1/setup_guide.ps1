# Database Setup - Step by Step Guide
# =====================================

Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "Hospital Portal - Database Setup Guide"
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "STEP 1: Reset Database in Azure Data Studio" -ForegroundColor Yellow
Write-Host "--------------------------------------------" -ForegroundColor Yellow
Write-Host ""
Write-Host "Copy and paste this SQL into Azure Data Studio:" -ForegroundColor White
Write-Host ""
Write-Host "DROP SCHEMA IF EXISTS public CASCADE;"
Write-Host "CREATE SCHEMA public;"
Write-Host "GRANT ALL ON SCHEMA public TO postgres;"
Write-Host "GRANT ALL ON SCHEMA public TO public;"
Write-Host 'CREATE EXTENSION IF NOT EXISTS "uuid-ossp";'
Write-Host ""
Write-Host "Press ENTER after running the above SQL..." -ForegroundColor Cyan
Read-Host

Write-Host ""
Write-Host "STEP 2: Apply EF Migrations" -ForegroundColor Yellow
Write-Host "--------------------------------------------" -ForegroundColor Yellow
Write-Host ""

Set-Location "c:\Users\Sam Aluri\Downloads\Hospital Portal\microservices\auth-service\AuthService"
Write-Host "Running EF database update..." -ForegroundColor Gray
dotnet ef database update

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "Success! EF migrations applied." -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "ERROR: EF migration failed. Check errors above." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "STEP 3: Apply SQL Migrations" -ForegroundColor Yellow
Write-Host "--------------------------------------------" -ForegroundColor Yellow
Write-Host ""
Write-Host "In Azure Data Studio, open and run:" -ForegroundColor White
Write-Host "  MASTER_DATABASE_MIGRATIONS.sql" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press ENTER after running..." -ForegroundColor Cyan
Read-Host

Write-Host ""
Write-Host "STEP 4: Load Sample Data" -ForegroundColor Yellow
Write-Host "--------------------------------------------" -ForegroundColor Yellow
Write-Host ""
Write-Host "In Azure Data Studio, open and run:" -ForegroundColor White
Write-Host "  sample_data_complete.sql" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press ENTER after running..." -ForegroundColor Cyan
Read-Host

Write-Host ""
Write-Host "STEP 5: Create Test Users" -ForegroundColor Yellow
Write-Host "--------------------------------------------" -ForegroundColor Yellow
Write-Host ""
Write-Host "In Azure Data Studio, open and run:" -ForegroundColor White
Write-Host "  create_test_users_for_testing.sql" -ForegroundColor Cyan
Write-Host ""
Write-Host "IMPORTANT: Copy the TenantId from output!" -ForegroundColor Red
Write-Host ""
Write-Host "Press ENTER after copying TenantId..." -ForegroundColor Cyan
Read-Host

Write-Host ""
Write-Host "=====================================================" -ForegroundColor Green
Write-Host "SETUP COMPLETE!" -ForegroundColor Green
Write-Host "=====================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next: Start backend with:" -ForegroundColor Yellow
Write-Host '  cd microservices\auth-service\AuthService' -ForegroundColor Cyan
Write-Host "  dotnet run" -ForegroundColor Cyan
Write-Host ""
