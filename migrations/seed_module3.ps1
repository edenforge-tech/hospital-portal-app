# Module 3 Seed Data Execution - Direct Runner
# Set password first: $env:PGPASSWORD='NewPass@2026!'

$Server = "hospitalportal-db-server.postgres.database.azure.com"
$Database = "hospitalportal"
$Username = "postgres"

Write-Host "`n========================================" -ForegroundColor Magenta
Write-Host "  MODULE 3 SEED DATA EXECUTION" -ForegroundColor Magenta
Write-Host "========================================`n" -ForegroundColor Magenta

# List of seed scripts in order
$scripts = @(
    "20_seed_patients.sql",
    "53_seed_master_data_final.sql",
    "54_seed_surgery_packages.sql",
    "55_seed_consent_templates.sql",
    "54_seed_counseling_sessions.sql",
    "55_seed_insurance_pre_auths.sql",
    "56_seed_payment_transactions.sql",
    "57_seed_patient_admissions.sql"
)

$num = 0
$failed = @()

foreach ($script in $scripts) {
    $num++
    Write-Host "`n[$num/$($scripts.Count)] Executing: $script" -ForegroundColor Cyan
    Write-Host "=" * 60 -ForegroundColor Gray
    
    if (-not (Test-Path $script)) {
        Write-Host "WARNING: File not found - skipping" -ForegroundColor Yellow
        continue
    }
    
    # Run psql directly - let output show
    psql -h $Server -U $Username -d $Database -f $script
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "`nFAILED: $script" -ForegroundColor Red
        $failed += $script
    } else {
        Write-Host "`nSUCCESS: $script" -ForegroundColor Green
    }
}

# Final summary
Write-Host "`n`n========================================" -ForegroundColor Magenta
Write-Host "  EXECUTION COMPLETE" -ForegroundColor Magenta
Write-Host "========================================" -ForegroundColor Magenta
Write-Host "Total scripts: $($scripts.Count)" -ForegroundColor White
Write-Host "Successful: $($scripts.Count - $failed.Count)" -ForegroundColor Green
Write-Host "Failed: $($failed.Count)" -ForegroundColor $(if($failed.Count -gt 0){"Red"}else{"Green"})

if ($failed.Count -gt 0) {
    Write-Host "`nFailed scripts:" -ForegroundColor Red
    $failed | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
    exit 1
} else {
    Write-Host "`nALL SEED DATA LOADED SUCCESSFULLY!" -ForegroundColor Green
    Write-Host "Refresh your browser: http://localhost:3000/dashboard/counselor`n" -ForegroundColor Cyan
    exit 0
}
