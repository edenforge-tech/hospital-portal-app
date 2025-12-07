# =====================================================
# Direct SQL Execution Script
# =====================================================

param(
    [Parameter(Mandatory=$false)]
    [string]$SqlFile
)

$Host.UI.RawUI.ForegroundColor = "Cyan"
Write-Host "=====================================================" 
Write-Host "SQL Script Executor for Hospital Portal"
Write-Host "=====================================================" 
$Host.UI.RawUI.ForegroundColor = "White"
Write-Host ""

# Connection details from appsettings.json
$server = "hospitalportal-db-server.postgres.database.azure.com"
$database = "hospitalportal"
$username = "postgres"
$port = "5432"

Write-Host "📋 Connection Details:" -ForegroundColor Yellow
Write-Host "   Server: $server" -ForegroundColor Gray
Write-Host "   Database: $database" -ForegroundColor Gray
Write-Host "   Port: $port" -ForegroundColor Gray
Write-Host ""

# Check if psql is available
$psqlPath = (Get-Command psql -ErrorAction SilentlyContinue).Source

if (-not $psqlPath) {
    Write-Host "❌ ERROR: psql command not found" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install PostgreSQL client tools:" -ForegroundColor Yellow
    Write-Host "  Download: https://www.postgresql.org/download/windows/" -ForegroundColor Gray
    Write-Host "  Or use Azure Data Studio / pgAdmin" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Alternative: Copy the SQL files and run them in Azure Data Studio or pgAdmin" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

Write-Host "✓ Found psql at: $psqlPath" -ForegroundColor Green
Write-Host ""

# Prompt for password
Write-Host "🔐 Enter PostgreSQL password for user 'postgres':" -ForegroundColor Yellow
$securePassword = Read-Host -AsSecureString
$password = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto([System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword))

# Set environment variable for password
$env:PGPASSWORD = $password

Write-Host ""
Write-Host "=====================================================" -ForegroundColor Cyan

# If no file specified, show menu
if (-not $SqlFile) {
    Write-Host "Select SQL script to run:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  1. verify_testing_readiness.sql - Check environment" -ForegroundColor White
    Write-Host "  2. create_test_users_for_testing.sql - Create test users" -ForegroundColor White
    Write-Host "  3. Both (verify first, then create users)" -ForegroundColor White
    Write-Host ""
    
    $choice = Read-Host "Enter choice (1-3)"
    
    switch ($choice) {
        "1" { $SqlFile = "verify_testing_readiness.sql" }
        "2" { $SqlFile = "create_test_users_for_testing.sql" }
        "3" {
            Write-Host ""
            Write-Host "🔍 Running verification script..." -ForegroundColor Cyan
            Write-Host "=====================================================" -ForegroundColor Cyan
            & psql -h $server -p $port -d $database -U $username -f "verify_testing_readiness.sql"
            
            Write-Host ""
            Write-Host "=====================================================" -ForegroundColor Cyan
            Write-Host "👤 Creating test users..." -ForegroundColor Cyan
            Write-Host "=====================================================" -ForegroundColor Cyan
            & psql -h $server -p $port -d $database -U $username -f "create_test_users_for_testing.sql"
            
            # Clear password
            $env:PGPASSWORD = $null
            
            Write-Host ""
            Write-Host "✅ COMPLETE!" -ForegroundColor Green
            Write-Host ""
            Write-Host "⚠️  IMPORTANT: Copy the TenantId from the output above" -ForegroundColor Yellow
            Write-Host ""
            exit 0
        }
        default {
            Write-Host "Invalid choice" -ForegroundColor Red
            exit 1
        }
    }
}

# Run the SQL file
Write-Host ""
Write-Host "▶️  Executing: $SqlFile" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host ""

& psql -h $server -p $port -d $database -U $username -f $SqlFile

# Clear password
$env:PGPASSWORD = $null

Write-Host ""
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "✅ Script execution complete!" -ForegroundColor Green
Write-Host ""

if ($SqlFile -like "*create_test_users*") {
    Write-Host "⚠️  IMPORTANT: Copy the TenantId from the output above" -ForegroundColor Yellow
    Write-Host "              You'll need it for API testing" -ForegroundColor Yellow
    Write-Host ""
}
