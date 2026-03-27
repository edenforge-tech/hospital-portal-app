# =====================================================
# Execute Master Data Migrations and Seed Data
# Purpose: Create IOL catalog, enhance surgery types, add pricing tables
# Created: 2026-02-25
# Usage: .\execute_master_data_migrations.ps1
# =====================================================

param(
    [string]$ConnectionString = $env:DATABASE_CONNECTION_STRING,
    [switch]$SkipSeedData,
    [switch]$Help
)

if ($Help) {
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host "  Master Data Migrations Script" -ForegroundColor Cyan
    Write-Host "========================================`n" -ForegroundColor Cyan
    Write-Host "Usage:" -ForegroundColor Yellow
    Write-Host "  .\execute_master_data_migrations.ps1 [OPTIONS]`n" -ForegroundColor White
    Write-Host "Options:" -ForegroundColor Yellow
    Write-Host "  -ConnectionString    Database connection string (default: from env)" -ForegroundColor White
    Write-Host "  -SkipSeedData        Skip seed data execution" -ForegroundColor White
    Write-Host "  -Help                Show this help message`n" -ForegroundColor White
    Write-Host "Examples:" -ForegroundColor Yellow
    Write-Host '  .\execute_master_data_migrations.ps1' -ForegroundColor White
    Write-Host '  .\execute_master_data_migrations.ps1 -SkipSeedData' -ForegroundColor White
    Write-Host ""
    exit 0
}

# Check if connection string is provided
if (-not $ConnectionString) {
    Write-Host "`n[ERROR] Database connection string not provided!" -ForegroundColor Red
    Write-Host "Set environment variable DATABASE_CONNECTION_STRING or pass via -ConnectionString parameter`n" -ForegroundColor Yellow
    exit 1
}

$ErrorActionPreference = "Stop"
$MigrationsPath = ".\consolidated\migrations"
$SeedDataPath = ".\consolidated\seed_data"

# List of migration files in order
$MigrationFiles = @(
    "60_create_iol_catalog_master.sql",
    "61_enhance_surgery_types.sql",
    "62_create_branch_pricing_overrides.sql",
    "63_create_consultation_charges.sql"
)

# List of seed data files
$SeedDataFiles = @(
    "iol_catalog_seed.sql",
    "surgery_types_seed.sql"
)

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "  Master Data Migrations & Seed Data" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Green

# Function to execute SQL file
function Execute-SqlFile {
    param(
        [string]$FilePath,
        [string]$Description
    )
    
    Write-Host "[INFO] Executing: $Description..." -ForegroundColor Cyan
    
    if (-not (Test-Path $FilePath)) {
        Write-Host "[ERROR] File not found: $FilePath" -ForegroundColor Red
        return $false
    }
    
    try {
        # Execute using psql (PostgreSQL command-line tool)
        $result = & psql $ConnectionString -f $FilePath 2>&1
        
        if ($LASTEXITCODE -ne 0) {
            Write-Host "[ERROR] Migration failed: $Description" -ForegroundColor Red
            Write-Host $result -ForegroundColor Red
            return $false
        }
        
        Write-Host "[SUCCESS] $Description completed" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "[ERROR] $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Execute migrations
Write-Host "Starting database migrations...`n" -ForegroundColor Yellow

$successCount = 0
$failCount = 0

foreach ($file in $MigrationFiles) {
    $filePath = Join-Path $MigrationsPath $file
    $description = $file -replace '^\d+_', '' -replace '\.sql$', '' -replace '_', ' '
    
    if (Execute-SqlFile -FilePath $filePath -Description $description) {
        $successCount++
    }
    else {
        $failCount++
        Write-Host "`n[WARNING] Migration failed but continuing...`n" -ForegroundColor Yellow
    }
}

Write-Host "`n----------------------------------------" -ForegroundColor Cyan
Write-Host "Migrations Summary:" -ForegroundColor Yellow
Write-Host "  Success: $successCount" -ForegroundColor Green
Write-Host "  Failed:  $failCount" -ForegroundColor $(if ($failCount -gt 0) { "Red" } else { "Green" })
Write-Host "----------------------------------------`n" -ForegroundColor Cyan

# Execute seed data (unless skipped)
if (-not $SkipSeedData) {
    Write-Host "Starting seed data execution...`n" -ForegroundColor Yellow
    
    $seedSuccessCount = 0
    $seedFailCount = 0
    
    foreach ($file in $SeedDataFiles) {
        $filePath = Join-Path $SeedDataPath $file
        $description = "Seed: " + ($file -replace '_seed\.sql$', '' -replace '_', ' ')
        
        if (Execute-SqlFile -FilePath $filePath -Description $description) {
            $seedSuccessCount++
        }
        else {
            $seedFailCount++
            Write-Host "`n[WARNING] Seed data failed but continuing...`n" -ForegroundColor Yellow
        }
    }
    
    Write-Host "`n----------------------------------------" -ForegroundColor Cyan
    Write-Host "Seed Data Summary:" -ForegroundColor Yellow
    Write-Host "  Success: $seedSuccessCount" -ForegroundColor Green
    Write-Host "  Failed:  $seedFailCount" -ForegroundColor $(if ($seedFailCount -gt 0) { "Red" } else { "Green" })
    Write-Host "----------------------------------------`n" -ForegroundColor Cyan
}
else {
    Write-Host "[INFO] Seed data execution skipped (-SkipSeedData flag)`n" -ForegroundColor Yellow
}

# Final summary
Write-Host "`n========================================" -ForegroundColor Green
Write-Host "  Migration Process Completed!" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Green

if ($failCount -eq 0 -and ($SkipSeedData -or $seedFailCount -eq 0)) {
    Write-Host "✓ All operations completed successfully!" -ForegroundColor Green
    Write-Host "`nNext steps:" -ForegroundColor Yellow
    Write-Host "1. Verify tables created: iol_catalog_master, branch_pricing_overrides, consultation_charges" -ForegroundColor White
    Write-Host "2. Check seed data: SELECT COUNT(*) FROM iol_catalog_master;" -ForegroundColor White
    Write-Host "3. Rebuild backend: cd microservices/auth-service/AuthService; dotnet build`n" -ForegroundColor White
    exit 0
}
else {
    Write-Host "⚠ Some operations failed. Please review errors above.`n" -ForegroundColor Yellow
    exit 1
}
