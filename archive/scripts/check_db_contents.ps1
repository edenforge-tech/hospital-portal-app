# Diagnostic script to check database contents
$DbHost = "hospitalportal-db-server.postgres.database.azure.com"
$DbPort = "5432"
$DbName = "hospitalportal"
$DbUser = "postgres"
$DbPassword = "NewPass@2026!"

$env:PGPASSWORD = $DbPassword

Write-Host "Checking patients table..." -ForegroundColor Yellow
Write-Host ""

# Simple count
Write-Host "Total patients:" -ForegroundColor Cyan
& psql -h $DbHost -p $DbPort -U $DbUser -d $DbName -c "SELECT COUNT(*) FROM patient;"

Write-Host ""
Write-Host "Active patients:" -ForegroundColor Cyan
& psql -h $DbHost -p $DbPort -U $DbUser -d $DbName -c "SELECT COUNT(*) FROM patient WHERE deleted_at IS NULL;"

Write-Host ""
Write-Host "Active patients with status 'active':" -ForegroundColor Cyan
& psql -h $DbHost -p $DbPort -U $DbUser -d $DbName -c "SELECT COUNT(*) FROM patient WHERE deleted_at IS NULL AND status = 'active';"

Write-Host ""
Write-Host "All distinct statuses:" -ForegroundColor Cyan
& psql -h $DbHost -p $DbPort -U $DbUser -d $DbName -c "SELECT DISTINCT status FROM patient;"

Write-Host ""
Write-Host "First 5 patients (any status):" -ForegroundColor Cyan
& psql -h $DbHost -p $DbPort -U $DbUser -d $DbName -c "SELECT id, full_name, mrn, status FROM patient WHERE deleted_at IS NULL LIMIT 5;"

Write-Host ""
Write-Host "Checking counselor_queue table..." -ForegroundColor Yellow
& psql -h $DbHost -p $DbPort -U $DbUser -d $DbName -c "SELECT COUNT(*) as queue_count FROM counselor_queue WHERE deleted_at IS NULL;"

$env:PGPASSWORD = ""
