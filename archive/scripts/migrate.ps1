Write-Host "Running Module 3.04 Migration..." -ForegroundColor Cyan

# Read appsettings
$config = Get-Content "microservices\auth-service\AuthService\appsettings.json" | ConvertFrom-Json
$connString = $config.ConnectionStrings.DefaultConnection

# Parse connection
$parts = @{}
$connString -split ';' | ForEach-Object {
    if ($_ -match '(.+?)=(.+)') {
        $parts[$matches[1].Trim()] = $matches[2].Trim()
    }
}

$env:PGPASSWORD = $parts['Password']

Write-Host "Connecting to $($parts['Database'])..." -ForegroundColor Yellow

psql -h $parts['Host'] -U $parts['Username'] -d $parts['Database'] -f "database_migrations\schema\module03_04_patient_type_mutability.sql"

if ($LASTEXITCODE -eq 0) {
    Write-Host "Migration completed successfully!" -ForegroundColor Green
} else {
    Write-Host "Migration failed!" -ForegroundColor Red
}

$env:PGPASSWORD = $null
