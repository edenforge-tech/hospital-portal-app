# PowerShell script to insert branch sample data
Write-Host "=== Inserting Branch Sample Data ===" -ForegroundColor Cyan
Write-Host ""

# Read connection string from appsettings.json
$configPath = "appsettings.json"
if (!(Test-Path $configPath)) {
    Write-Host "Error: appsettings.json not found!" -ForegroundColor Red
    exit 1
}

$config = Get-Content $configPath | ConvertFrom-Json
$connStr = $config.ConnectionStrings.DefaultConnection

# Parse connection string
$server = ($connStr -split 'Host=')[1].Split(';')[0]
$database = ($connStr -split 'Database=')[1].Split(';')[0]
$username = ($connStr -split 'Username=')[1].Split(';')[0]
$password = ($connStr -split 'Password=')[1].Split(';')[0]

Write-Host "Server: $server" -ForegroundColor Yellow
Write-Host "Database: $database" -ForegroundColor Yellow
Write-Host "User: $username" -ForegroundColor Yellow
Write-Host ""

# Set password environment variable
$env:PGPASSWORD = $password

# Run SQL file
$sqlFile = "../../../insert_branch_sample_data.sql"
Write-Host "Executing SQL file: $sqlFile" -ForegroundColor Green

try {
    psql -h $server -U $username -d $database -f $sqlFile
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✓ Branch sample data inserted successfully!" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "✗ Error inserting data. Exit code: $LASTEXITCODE" -ForegroundColor Red
    }
} catch {
    Write-Host ""
    Write-Host "✗ Error: $_" -ForegroundColor Red
}

# Clear password
$env:PGPASSWORD = $null

Write-Host ""
Read-Host "Press Enter to continue"
