# ============================================================================
# Quick Seed Script for Counselor Queue Test Data
# ============================================================================
# This script seeds the counselor_queue table with test patients

$ErrorActionPreference = "Stop"

Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "Counselor Queue Data Seeding" -ForegroundColor Cyan
Write-Host "============================================`n" -ForegroundColor Cyan

# PostgreSQL connection string (update if needed)
$env:PGPASSWORD = "postgres"
$dbHost = "localhost"
$dbPort = "5432"
$dbName = "hospital_portal_db"
$dbUser = "postgres"

Write-Host "📋 Seeding counselor queue test data..." -ForegroundColor Yellow

# Read and execute the seed SQL file
$sqlFile = Join-Path $PSScriptRoot "seed_counselor_queue.sql"

if (-not (Test-Path $sqlFile)) {
    Write-Host "❌ Error: seed_counselor_queue.sql not found at $sqlFile" -ForegroundColor Red
    exit 1
}

Write-Host "Executing: $sqlFile" -ForegroundColor Gray

try {
    # Execute using psql (PostgreSQL command-line client)
    $output = & psql -h $dbHost -p $dbPort -U $dbUser -d $dbName -f $sqlFile 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Counselor queue data seeded successfully!" -ForegroundColor Green
        Write-Host "`n$output" -ForegroundColor Gray
    } else {
        Write-Host "❌ Error seeding data:" -ForegroundColor Red
        Write-Host "$output" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Error executing SQL: $_" -ForegroundColor Red
    exit 1
}

Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "Seeding Complete" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "`n✅ You can now refresh the counselor page at http://localhost:3000/dashboard/counselor" -ForegroundColor Green
Write-Host "   The queue should show 3-6 test patients waiting`n" -ForegroundColor Green
