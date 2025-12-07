# Simple Database Migration Execution
# Runs all SQL scripts and reports results based on exit codes only

$env:PGPASSWORD = 'Eden@#$0606'
$dbHost = "hospitalportal-db-server.postgres.database.azure.com"
$dbUser = "postgres"
$dbName = "hospitalportal"
$dbPort = "5432"

$scripts = @(
    "implement_soft_deletes.sql",
    "soft_delete_functions.sql",
    "extend_rls_coverage.sql",
    "add_audit_user_columns.sql",
    "comprehensive_audit_triggers.sql",
    "add_status_columns.sql"
)

Write-Host "=============================================`n"
Write-Host "DATABASE MIGRATION EXECUTION`n"
Write-Host "=============================================`n"
Write-Host "Database: $dbName`n"
Write-Host "Scripts: $($scripts.Count)`n"

$confirm = Read-Host "`nContinue? (yes/no)"
if ($confirm -ne "yes") {
    exit 1
}

$success = 0
$failed = 0

Write-Host "`nExecuting migrations...`n"

foreach ($script in $scripts) {
    $path = Join-Path $PSScriptRoot $script
    Write-Host "Executing: $script ... " -NoNewline
    
    $result = & psql -h $dbHost -U $dbUser -d $dbName -p $dbPort -f $path 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "SUCCESS" -ForegroundColor Green
        $success++
    } else {
        Write-Host "FAILED" -ForegroundColor Red
        $failed++
        # Show first error
        $errors = $result | Where-Object { $_ -match "ERROR" } | Select-Object -First 1
        if ($errors) {
            Write-Host "  Error: $errors" -ForegroundColor Red
        }
    }
}

Write-Host "`n=============================================`n"
Write-Host "SUMMARY: $success succeeded, $failed failed`n"
Write-Host "============================================="

if ($failed -eq 0) {
    Write-Host "`nALL MIGRATIONS COMPLETED!`n"
    Write-Host "Next: Run .\execute_tests.ps1`n"
}
