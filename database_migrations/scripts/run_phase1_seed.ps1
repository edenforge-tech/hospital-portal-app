# ============================================================================
# Execute Phase 1 Test Data Seeding Script
# ============================================================================

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Phase 1 Test Data Seeding" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Database connection details (from appsettings.json)
$dbHost = "hospitalportal-db-server.postgres.database.azure.com"
$dbName = "hospitalportal"
$dbUser = "dbadmin"
$dbPort = "5432"

Write-Host "Database: $dbName" -ForegroundColor Yellow
Write-Host "Host: $dbHost" -ForegroundColor Yellow
Write-Host ""

# Prompt for password
$dbPassword = Read-Host "Enter database password" -AsString

if ([string]::IsNullOrWhiteSpace($dbPassword)) {
    Write-Host "Error: Password cannot be empty" -ForegroundColor Red
    exit 1
}

# Set password environment variable
$env:PGPASSWORD = $dbPassword

$sqlFile = "seed_phase1_test_data.sql"

if (-not (Test-Path $sqlFile)) {
    Write-Host "Error: SQL file not found: $sqlFile" -ForegroundColor Red
    exit 1
}

Write-Host "Executing seed data script..." -ForegroundColor Green
Write-Host ""

try {
    # Execute using psql
    $psqlCommand = "psql -h $dbHost -U $dbUser -d $dbName -p $dbPort -f $sqlFile"
    
    Invoke-Expression $psqlCommand
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "SUCCESS! Test data seeded successfully" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "Next Steps:" -ForegroundColor Cyan
        Write-Host "1. Navigate to http://localhost:3001/dashboard/billing/opd" -ForegroundColor White
        Write-Host "2. Test Bill Finalization (Scenario 4 bills)" -ForegroundColor White
        Write-Host "3. Test Refunds (Scenarios 1 & 2 bills)" -ForegroundColor White
        Write-Host "4. Navigate to http://localhost:3001/dashboard/frontdesk/check-in" -ForegroundColor White
        Write-Host "5. Test Check-In Gate (Scenario 5 will fail validation)" -ForegroundColor White
        Write-Host "6. Test Walkout (Scenario 6 visits in queue)" -ForegroundColor White
        Write-Host ""
    } else {
        Write-Host "Error: SQL execution failed with exit code $LASTEXITCODE" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "Error executing SQL script: $_" -ForegroundColor Red
    exit 1
} finally {
    # Clear password from environment
    $env:PGPASSWORD = $null
}
