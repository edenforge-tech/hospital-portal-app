# SQL Setup for Testing - Manual Instructions

Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "Hospital Portal - Testing Setup"
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Since psql may not be available, here are manual steps:" -ForegroundColor Yellow
Write-Host ""

Write-Host "OPTION 1 - Azure Data Studio (Recommended):" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host "1. Open Azure Data Studio" -ForegroundColor White
Write-Host "2. Connect to:" -ForegroundColor White
Write-Host "   Server: hospitalportal-db-server.postgres.database.azure.com" -ForegroundColor Gray
Write-Host "   Database: hospitalportal" -ForegroundColor Gray
Write-Host "   User: postgres" -ForegroundColor Gray
Write-Host "   Password: Eden@#`$0606" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Open file: verify_testing_readiness.sql" -ForegroundColor White
Write-Host "4. Run it (F5 or click Run)" -ForegroundColor White
Write-Host "5. Check results - should show tenants, roles, permissions" -ForegroundColor White
Write-Host ""
Write-Host "6. Open file: create_test_users_for_testing.sql" -ForegroundColor White
Write-Host "7. Run it (F5)" -ForegroundColor White
Write-Host "8. In the Messages tab, find and COPY the TenantId UUID" -ForegroundColor Yellow
Write-Host "   (looks like: 12345678-1234-1234-1234-123456789abc)" -ForegroundColor Gray
Write-Host ""

Write-Host "OPTION 2 - pgAdmin:" -ForegroundColor Green
Write-Host "===================" -ForegroundColor Green
Write-Host "1. Open pgAdmin" -ForegroundColor White
Write-Host "2. Connect to hospitalportal database" -ForegroundColor White
Write-Host "3. Right-click database -> Query Tool" -ForegroundColor White
Write-Host "4. Load verify_testing_readiness.sql and execute" -ForegroundColor White
Write-Host "5. Load create_test_users_for_testing.sql and execute" -ForegroundColor White
Write-Host "6. Copy the TenantId from output" -ForegroundColor Yellow
Write-Host ""

Write-Host "OPTION 3 - Direct psql command:" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host "If you have psql installed, run:" -ForegroundColor White
Write-Host ""
Write-Host 'psql -h hospitalportal-db-server.postgres.database.azure.com -U postgres -d hospitalportal -f verify_testing_readiness.sql' -ForegroundColor Cyan
Write-Host ""
Write-Host 'psql -h hospitalportal-db-server.postgres.database.azure.com -U postgres -d hospitalportal -f create_test_users_for_testing.sql' -ForegroundColor Cyan
Write-Host ""

Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "After completing database setup:" -ForegroundColor Yellow
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Start the backend with:" -ForegroundColor White
Write-Host 'cd microservices\auth-service\AuthService' -ForegroundColor Cyan
Write-Host 'dotnet run' -ForegroundColor Cyan
Write-Host ""
Write-Host "Then open: https://localhost:7001/swagger" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
