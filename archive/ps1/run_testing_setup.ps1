# =====================================================
# RUN TESTING SETUP SQL SCRIPTS
# =====================================================
# This script runs the verification and test user creation scripts
# =====================================================

Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "Hospital Portal - Testing Setup Runner" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host ""

# Database connection details from appsettings.json
$dbHost = "hospitalportal-db-server.postgres.database.azure.com"
$dbPort = "5432"
$dbName = "hospitalportal"
$dbUser = "postgres"
$dbPassword = "Eden@#$0606"

Write-Host "📋 Database Connection:" -ForegroundColor Yellow
Write-Host "  Host: $dbHost" -ForegroundColor Gray
Write-Host "  Database: $dbName" -ForegroundColor Gray
Write-Host "  User: $dbUser" -ForegroundColor Gray
Write-Host ""

# Check if psql is available
Write-Host "🔍 Checking for PostgreSQL client (psql)..." -ForegroundColor Yellow
$psqlPath = Get-Command psql -ErrorAction SilentlyContinue

if (-not $psqlPath) {
    Write-Host "❌ ERROR: psql command not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install PostgreSQL client or use pgAdmin instead:" -ForegroundColor Yellow
    Write-Host "  1. Open pgAdmin" -ForegroundColor White
    Write-Host "  2. Connect to server: $dbHost" -ForegroundColor White
    Write-Host "  3. Open database: $dbName" -ForegroundColor White
    Write-Host "  4. Open Query Tool (Alt+Shift+Q)" -ForegroundColor White
    Write-Host "  5. Load file: verify_testing_readiness.sql" -ForegroundColor White
    Write-Host "  6. Execute (F5)" -ForegroundColor White
    Write-Host "  7. Load file: create_test_users_for_testing.sql" -ForegroundColor White
    Write-Host "  8. Execute (F5) and copy TenantId from Messages tab" -ForegroundColor White
    Write-Host ""
    
    $usePgAdmin = Read-Host "Would you like instructions to continue with pgAdmin? (Y/N)"
    if ($usePgAdmin -eq "Y" -or $usePgAdmin -eq "y") {
        Write-Host ""
        Write-Host "✅ Opening file locations..." -ForegroundColor Green
        Start-Process explorer.exe -ArgumentList (Get-Location).Path
        Write-Host ""
        Write-Host "Files ready in current directory:" -ForegroundColor Green
        Write-Host "  - verify_testing_readiness.sql" -ForegroundColor Cyan
        Write-Host "  - create_test_users_for_testing.sql" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Load these files in pgAdmin Query Tool and execute them." -ForegroundColor Yellow
    }
    exit
}

Write-Host "✅ PostgreSQL client found: $($psqlPath.Source)" -ForegroundColor Green
Write-Host ""

# Set environment variable for password
$env:PGPASSWORD = $dbPassword

Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "STEP 1: Verify Testing Readiness" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host ""

$verifyFile = "verify_testing_readiness.sql"
if (-not (Test-Path $verifyFile)) {
    Write-Host "❌ ERROR: File not found: $verifyFile" -ForegroundColor Red
    exit
}

Write-Host "Running: $verifyFile" -ForegroundColor Yellow
Write-Host "---------------------------------------------------" -ForegroundColor Gray

try {
    & psql -h $dbHost -p $dbPort -U $dbUser -d $dbName -f $verifyFile
    Write-Host ""
    Write-Host "✅ Verification complete!" -ForegroundColor Green
} catch {
    Write-Host "❌ ERROR running verification script:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "Please check:" -ForegroundColor Yellow
    Write-Host "  1. Database is accessible" -ForegroundColor White
    Write-Host "  2. Password is correct" -ForegroundColor White
    Write-Host "  3. SSL certificate is trusted" -ForegroundColor White
    exit
}

Write-Host ""
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "STEP 2: Create Test Users" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host ""

$createUsersFile = "create_test_users_for_testing.sql"
if (-not (Test-Path $createUsersFile)) {
    Write-Host "❌ ERROR: File not found: $createUsersFile" -ForegroundColor Red
    exit
}

Write-Host "⚠️  IMPORTANT: Watch for TenantId in the output below!" -ForegroundColor Red
Write-Host "             You'll need to copy it for API testing." -ForegroundColor Red
Write-Host ""
Write-Host "Running: $createUsersFile" -ForegroundColor Yellow
Write-Host "---------------------------------------------------" -ForegroundColor Gray

try {
    & psql -h $dbHost -p $dbPort -U $dbUser -d $dbName -f $createUsersFile
    Write-Host ""
    Write-Host "✅ Test users created successfully!" -ForegroundColor Green
} catch {
    Write-Host "❌ ERROR creating test users:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "✅ SETUP COMPLETE!" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "📝 Next Steps:" -ForegroundColor Yellow
Write-Host "---------------------------------------------------" -ForegroundColor Yellow
Write-Host "1. Copy the TenantId from the output above" -ForegroundColor White
Write-Host "2. Start the backend service:" -ForegroundColor White
Write-Host '   cd "microservices\auth-service\AuthService"' -ForegroundColor Cyan
Write-Host "   dotnet run" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Open Swagger UI:" -ForegroundColor White
Write-Host "   https://localhost:7001/swagger" -ForegroundColor Cyan
Write-Host ""
Write-Host "4. Test with credentials (password: Test@123456):" -ForegroundColor White
Write-Host "   - admin@test.com       (System Admin)" -ForegroundColor Green
Write-Host "   - doctor@test.com      (Doctor)" -ForegroundColor Green
Write-Host "   - nurse@test.com       (Nurse)" -ForegroundColor Green
Write-Host "   - receptionist@test.com (Receptionist)" -ForegroundColor Green
Write-Host "   - labtech@test.com     (Lab Technician)" -ForegroundColor Green
Write-Host ""
Write-Host "📚 Documentation: END_TO_END_TESTING_GUIDE.md" -ForegroundColor Yellow
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host ""

# Clear password from environment
$env:PGPASSWORD = $null

# Offer to start backend
$startBackend = Read-Host "Would you like to start the backend service now? (Y/N)"
if ($startBackend -eq "Y" -or $startBackend -eq "y") {
    Write-Host ""
    Write-Host "🚀 Starting backend service..." -ForegroundColor Green
    Set-Location "microservices\auth-service\AuthService"
    dotnet run
}
