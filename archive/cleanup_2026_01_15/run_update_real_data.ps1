#!/usr/bin/env pwsh
# =====================================================
# Execute Database Update with Real Data
# =====================================================

param(
    [string]$Server = "hospitalportal-db-server.postgres.database.azure.com",
    [string]$Database = "hospitalportal",
    [string]$Username = "postgres",
    [string]$Password = "Eden@#$0606"
)

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "DATABASE UPDATE WITH REAL-TIME DATA" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

$SqlFile = Join-Path $PSScriptRoot "update_real_data.sql"

if (-not (Test-Path $SqlFile)) {
    Write-Host "ERROR: SQL file not found: $SqlFile" -ForegroundColor Red
    exit 1
}

Write-Host "SQL File: $SqlFile" -ForegroundColor Yellow
Write-Host "Server: $Server" -ForegroundColor Yellow
Write-Host "Database: $Database" -ForegroundColor Yellow
Write-Host ""

# Set password environment variable
$env:PGPASSWORD = $Password

Write-Host "Executing SQL script..." -ForegroundColor Green
Write-Host ""

# Execute the SQL file
$result = psql -h $Server -U $Username -d $Database -f $SqlFile 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "Database updated successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host $result
} else {
    Write-Host "Error executing SQL script:" -ForegroundColor Red
    Write-Host $result
    exit 1
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "COMPLETED SUCCESSFULLY" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Summary of changes:" -ForegroundColor Yellow
Write-Host "  Updated tenant name to India Eye Hospital Network" -ForegroundColor White
Write-Host "  Updated organization names to real-world names" -ForegroundColor White
Write-Host "  Created 8 branches across India" -ForegroundColor White
Write-Host "  Created departments for each branch" -ForegroundColor White
Write-Host ""
Write-Host "Refresh your Organization Management page to see the changes!" -ForegroundColor Cyan
