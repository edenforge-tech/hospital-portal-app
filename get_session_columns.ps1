# Check counseling_session table columns
$DbHost = "hospitalportal-db-server.postgres.database.azure.com"
$DbPort = "5432"
$DbName = "hospitalportal"
$DbUser = "postgres"
$DbPassword = "NewPass@2026!"

$env:PGPASSWORD = $DbPassword

Write-Host "Counseling Session table columns:" -ForegroundColor Cyan
& psql -h $DbHost -p $DbPort -U $DbUser -d $DbName -c "SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'counseling_session' ORDER BY ordinal_position LIMIT 25;"

$env:PGPASSWORD = ""
