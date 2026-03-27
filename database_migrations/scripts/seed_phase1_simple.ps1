# Simple seed data execution using connection string from appsettings.json
$ErrorActionPreference = "Stop"

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Phase 1 Test Data Seeding" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Read connection string from appsettings.json
$appsettingsPath = "microservices\auth-service\AuthService\appsettings.json"
$appsettings = Get-Content $appsettingsPath | ConvertFrom-Json
$connectionString = $appsettings.ConnectionStrings.DefaultConnection

Write-Host "Database Connection: $connectionString" -ForegroundColor Yellow
Write-Host ""
Write-Host "Executing seed script..." -ForegroundColor Green

try {
    # Use dotnet ef command to execute raw SQL
    $env:ASPNETCORE_ENVIRONMENT = "Development"
    
    dotnet ef database drop --force --project "microservices\auth-service\AuthService" --no-build 2>$null
    dotnet ef database update --project "microservices\auth-service\AuthService"
    
    # Execute seed script using psql (requires PostgreSQL client tools)
    $sqlContent = Get-Content "seed_phase1_test_data.sql" -Raw
    
    # Parse connection string
    if ($connectionString -match "Host=([^;]+);.*Database=([^;]+);.*Username=([^;]+);.*Password=([^;]+)") {
        $dbHost = $matches[1]
        $dbName = $matches[2]
        $dbUser = $matches[3]
        $dbPassword = $matches[4]
        
        $env:PGPASSWORD = $dbPassword
        
        # Execute using psql
        $sqlContent | psql -h $dbHost -U $dbUser -d $dbName -q
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "============================================" -ForegroundColor Green
            Write-Host "  SUCCESS!" -ForegroundColor Green  
            Write-Host "============================================" -ForegroundColor Green
            Write-Host ""
            Write-Host "Test Data Created:" -ForegroundColor Cyan
            Write-Host "  ✓ 30 Patients" -ForegroundColor White
            Write-Host "  ✓ 180 Appointments (6/day x 30 days)" -ForegroundColor White
            Write-Host "  ✓ 180 OPD Bills" -ForegroundColor White
            Write-Host "  ✓ ~150 Payments" -ForegroundColor White
            Write-Host "  ✓ ~24 Visits (today)" -ForegroundColor White
            Write-Host ""
            Write-Host "Scenario Breakdown (per day):" -ForegroundColor Cyan
            Write-Host "  1. Fully paid + finalized → REFUND testing" -ForegroundColor Yellow
            Write-Host "  2. Fully paid + finalized → REFUND testing" -ForegroundColor Yellow
            Write-Host "  3. Partially paid → PAYMENT collection" -ForegroundColor Yellow
            Write-Host "  4. Fully paid, NOT finalized → FINALIZATION" -ForegroundColor Yellow
            Write-Host "  5. Unpaid → CHECK-IN gate failure" -ForegroundColor Yellow
            Write-Host "  6. Fully paid + finalized + visit → WALKOUT" -ForegroundColor Yellow
            Write-Host ""
            Write-Host "Testing URLs:" -ForegroundColor Cyan
            Write-Host "  • Bill Finalization: http://localhost:3001/dashboard/billing/opd" -ForegroundColor White
            Write-Host "  • Check-In Gate: http://localhost:3001/dashboard/frontdesk/check-in" -ForegroundColor White
            Write-Host "  • Backend API: http://localhost:5073/swagger" -ForegroundColor White
            Write-Host ""
        }
        
        $env:PGPASSWORD = $null
    } else {
        Write-Host "Error: Could not parse connection string" -ForegroundColor Red
        exit 1
    }
    
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
    exit 1
}
