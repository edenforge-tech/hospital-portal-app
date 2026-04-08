# Execute Counselor Queue Sample Data Seed
# This script connects to Azure PostgreSQL and inserts test data

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "  Counselor Queue Sample Data Seed Script" -ForegroundColor Cyan
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host ""

# Database connection details
$server = "sam.postgres.database.azure.com"
$port = "5432"
$database = "hospital_portal_db"
$username = "sam"
$password = "Pass@123"

# PostgreSQL environment variables for psql
$env:PGPASSWORD = $password

Write-Host "Connecting to Azure PostgreSQL..." -ForegroundColor Yellow
Write-Host "  Server: $server" -ForegroundColor Gray
Write-Host "  Database: $database" -ForegroundColor Gray
Write-Host ""

# Read SQL script
$sqlFile = "seed_counselor_queue.sql"
if (-not (Test-Path $sqlFile)) {
    Write-Host "ERROR: SQL file not found: $sqlFile" -ForegroundColor Red
    Write-Host "Make sure you're running this from the project root directory." -ForegroundColor Yellow
    exit 1
}

Write-Host "Reading SQL script: $sqlFile" -ForegroundColor Yellow
Write-Host ""

# Execute using psql
try {
    Write-Host "Executing SQL script..." -ForegroundColor Yellow
    Write-Host ""
    
    $connectionString = "postgresql://${username}@${server}/${database}?sslmode=require"
    
    # Execute with psql
    $output = & psql $connectionString -f $sqlFile 2>&1
    
    # Display output
    $output | ForEach-Object {
        $line = $_.ToString()
        if ($line -match "NOTICE:.*Created") {
            Write-Host $line -ForegroundColor Green
        }
        elseif ($line -match "NOTICE:.*Summary|NOTICE:.*Completed") {
            Write-Host $line -ForegroundColor Cyan
        }
        elseif ($line -match "ERROR|EXCEPTION") {
            Write-Host $line -ForegroundColor Red
        }
        else {
            Write-Host $line -ForegroundColor Gray
        }
    }
    
    Write-Host ""
    Write-Host "======================================================" -ForegroundColor Green
    Write-Host "  SUCCESS! Sample Data Created" -ForegroundColor Green
    Write-Host "======================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor Cyan
    Write-Host "  1. Refresh your browser" -ForegroundColor White
    Write-Host "  2. Go to: http://localhost:3000/dashboard/counselor/workspace" -ForegroundColor White
    Write-Host "  3. You should see 3 patients in the Waiting queue" -ForegroundColor White
    Write-Host "  4. You should see 1 patient in the Called status" -ForegroundColor White
    Write-Host ""
    
} catch {
    Write-Host ""
    Write-Host "ERROR executing SQL script:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "Troubleshooting:" -ForegroundColor Yellow
    Write-Host "  1. Verify psql is installed: psql --version" -ForegroundColor Gray
    Write-Host "  2. Check database credentials" -ForegroundColor Gray
    Write-Host "  3. Verify Azure PostgreSQL firewall rules" -ForegroundColor Gray
    Write-Host ""
    exit 1
} finally {
    # Clean up password from environment
    Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
}
