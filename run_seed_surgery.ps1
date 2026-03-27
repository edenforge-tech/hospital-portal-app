#!/usr/bin/env pwsh
# run_seed_surgery.ps1 — Seeds all Surgery Confirmed + Followup (Pre/Post) scenarios

$env:PGPASSWORD = "NewPass@2026!"
$psql = "psql"
$host_  = "hospitalportal-db-server.postgres.database.azure.com"
$port   = "5432"
$dbname = "hospitalportal"
$user   = "postgres"
$script = Join-Path $PSScriptRoot "seed_surgery_scenarios.sql"

Write-Host "▶  Running seed script..." -ForegroundColor Cyan
& $psql --host=$host_ --port=$port --dbname=$dbname --username=$user `
        --file=$script --echo-errors -v ON_ERROR_STOP=1

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅  Seed complete! Open the browser and test:" -ForegroundColor Green
    Write-Host "   Surgery Confirmed      → 10 upcoming patients (Booked/Confirmed)"
    Write-Host "   Followup Pre-Surgery   → 10 sessions (Agreed/Undecided/Declined)"
    Write-Host "   Followup Post-Surgery  → 8 completed surgeries (7 with post-op plans, 1 without)"
} else {
    Write-Host ""
    Write-Host "❌  Seed failed (exit code $LASTEXITCODE). Check above for errors." -ForegroundColor Red
}
