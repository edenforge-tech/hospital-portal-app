# Check patient table columns
$DbHost = "hospitalportal-db-server.postgres.database.azure.com"
$DbPort = "5432"
$DbName = "hospitalportal"
$DbUser = "postgres"
$DbPassword = "NewPass@2026!"

$env:PGPASSWORD = $DbPassword

Write-Host "Patient table columns:" -ForegroundColor Cyan
& psql -h $DbHost -p $DbPort -U $DbUser -d $DbName -c "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'patient' ORDER BY ordinal_position LIMIT 20;"

$env:PGPASSWORD = ""
