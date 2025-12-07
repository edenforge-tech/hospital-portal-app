# Run Database Compliance Tests

$env:PGPASSWORD = 'Eden@#$0606'
$dbHost = "hospitalportal-db-server.postgres.database.azure.com"
$dbUser = "postgres"
$dbName = "hospitalportal"
$dbPort = "5432"

$testScript = "test_database_compliance.sql"
$path = Join-Path $PSScriptRoot $testScript

Write-Host "============================================="
Write-Host "RUNNING COMPLIANCE TESTS"
Write-Host "============================================="
Write-Host ""

if (-not (Test-Path $path)) {
    Write-Host "ERROR: Test script not found!"
    exit 1
}

Write-Host "Executing tests...`n"

$output = & psql -h $dbHost -U $dbUser -d $dbName -p $dbPort -f $path 2>&1

# Display output
$output | ForEach-Object {
    $line = $_.ToString()
    Write-Host $line
}

Write-Host "`n============================================="

if ($LASTEXITCODE -eq 0) {
    Write-Host "TEST EXECUTION COMPLETED" -ForegroundColor Green
} else {
    Write-Host "TEST EXECUTION FAILED" -ForegroundColor Red
}

Write-Host "============================================="
