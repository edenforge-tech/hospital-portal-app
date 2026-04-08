# Check counselor_queue table columns
$DbHost = "hospitalportal-db-server.postgres.database.azure.com"
$DbPort = "5432"
$DbName = "hospitalportal"
$DbUser = "postgres"
$DbPassword = "NewPass@2026!"

$env:PGPASSWORD = $DbPassword

Write-Host "Counselor Queue table columns:" -ForegroundColor Cyan
& psql -h $DbHost -p $DbPort -U $DbUser -d $DbName -c "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'counselor_queue' ORDER BY ordinal_position;"

$env:PGPASSWORD = ""
