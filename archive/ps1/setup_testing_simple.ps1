# =====================================================
# Direct SQL Execution - Simple Version
# =====================================================

Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "Hospital Portal - SQL Script Executor"
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host ""

# Check if psql is available
try {
    $null = Get-Command psql -ErrorAction Stop
    Write-Host "✓ PostgreSQL client (psql) found" -ForegroundColor Green
} catch {
    Write-Host "❌ ERROR: psql command not found" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please use one of these options instead:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Option 1 - Azure Data Studio:" -ForegroundColor Cyan
    Write-Host "  1. Open Azure Data Studio" -ForegroundColor Gray
    Write-Host "  2. Connect to: hospitalportal-db-server.postgres.database.azure.com" -ForegroundColor Gray
    Write-Host "  3. Open verify_testing_readiness.sql" -ForegroundColor Gray
    Write-Host "  4. Run it (F5)" -ForegroundColor Gray
    Write-Host "  5. Then open and run create_test_users_for_testing.sql" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Option 2 - pgAdmin:" -ForegroundColor Cyan
    Write-Host "  1. Open pgAdmin" -ForegroundColor Gray
    Write-Host "  2. Connect to your Azure PostgreSQL server" -ForegroundColor Gray
    Write-Host "  3. Open Query Tool (Alt+Shift+Q)" -ForegroundColor Gray
    Write-Host "  4. Load and execute verify_testing_readiness.sql" -ForegroundColor Gray
    Write-Host "  5. Load and execute create_test_users_for_testing.sql" -ForegroundColor Gray
    Write-Host ""
    Write-Host "⚠️  IMPORTANT: Copy the TenantId from the create_test_users output!" -ForegroundColor Yellow
    Write-Host ""
    
    # Ask if user wants to continue with manual steps
    $continue = Read-Host "Do you have Azure Data Studio or pgAdmin open? (Y/N)"
    if ($continue -eq "Y" -or $continue -eq "y") {
        Write-Host ""
        Write-Host "📋 Files to run (in this order):" -ForegroundColor Yellow
        Write-Host "  1. verify_testing_readiness.sql" -ForegroundColor White
        Write-Host "  2. create_test_users_for_testing.sql" -ForegroundColor White
        Write-Host ""
        Write-Host "After running, come back here and we'll start the backend!" -ForegroundColor Green
        Write-Host ""
    }
    exit 1
}

Write-Host ""
Write-Host "📋 Connection Details:" -ForegroundColor Yellow
Write-Host "   Server: hospitalportal-db-server.postgres.database.azure.com" -ForegroundColor Gray
Write-Host "   Database: hospitalportal" -ForegroundColor Gray
Write-Host ""

Write-Host "🔐 Enter password for 'postgres' user:" -ForegroundColor Yellow
$securePassword = Read-Host -AsSecureString
$password = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword))
$env:PGPASSWORD = $password

Write-Host ""
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "🔍 Step 1: Verifying Environment" -ForegroundColor Yellow
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host ""

psql -h hospitalportal-db-server.postgres.database.azure.com -p 5432 -d hospitalportal -U postgres -f verify_testing_readiness.sql

Write-Host ""
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "👤 Step 2: Creating Test Users" -ForegroundColor Yellow
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host ""

psql -h hospitalportal-db-server.postgres.database.azure.com -p 5432 -d hospitalportal -U postgres -f create_test_users_for_testing.sql

$env:PGPASSWORD = $null

Write-Host ""
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "✅ SETUP COMPLETE!" -ForegroundColor Green
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  CRITICAL: Look for 'TenantId:' in the output above and COPY IT" -ForegroundColor Yellow
Write-Host ""
Write-Host "Next step: Start the backend service" -ForegroundColor Cyan
Write-Host '  cd "microservices\auth-service\AuthService"' -ForegroundColor Gray
Write-Host "  dotnet run" -ForegroundColor Gray
Write-Host ""
