@echo off
echo Running Branch Sample Data Insert...
echo.

REM Get database connection from appsettings.json
powershell -Command "$config = Get-Content 'appsettings.json' | ConvertFrom-Json; $connStr = $config.ConnectionStrings.DefaultConnection; Write-Host 'Using connection string from appsettings.json'; $env:PGPASSWORD = ($connStr -split 'Password=')[1].Split(';')[0]; $server = ($connStr -split 'Host=')[1].Split(';')[0]; $database = ($connStr -split 'Database=')[1].Split(';')[0]; $user = ($connStr -split 'Username=')[1].Split(';')[0]; psql -h $server -U $user -d $database -f '../../../insert_branch_sample_data.sql'"

echo.
echo Done!
pause
