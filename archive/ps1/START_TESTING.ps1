# =====================================================
# QUICK START - End-to-End Permission Testing Setup
# =====================================================
# This script helps you get started with testing
# =====================================================

Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "Hospital Portal - Permission Testing Quick Start" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "📋 PRE-REQUISITES CHECKLIST" -ForegroundColor Yellow
Write-Host "---------------------------------------------------" -ForegroundColor Yellow
Write-Host "✓ PostgreSQL database 'hospitalportal' exists" -ForegroundColor Green
Write-Host "✓ Sample data loaded (tenants, roles, permissions)" -ForegroundColor Green
Write-Host "✓ Connection string configured in appsettings.json" -ForegroundColor Green
Write-Host ""

Write-Host "📝 STEP 1: Create Test Users" -ForegroundColor Yellow
Write-Host "---------------------------------------------------" -ForegroundColor Yellow
Write-Host "Run this SQL script to create 5 test users:" -ForegroundColor White
Write-Host ""
Write-Host "  Option A - Using psql:" -ForegroundColor Cyan
Write-Host "  psql -U postgres -d hospitalportal -f create_test_users_for_testing.sql" -ForegroundColor Gray
Write-Host ""
Write-Host "  Option B - Using pgAdmin:" -ForegroundColor Cyan
Write-Host "  1. Open pgAdmin and connect to 'hospitalportal' database" -ForegroundColor Gray
Write-Host "  2. Open Query Tool (Alt+Shift+Q)" -ForegroundColor Gray
Write-Host "  3. Load file: create_test_users_for_testing.sql" -ForegroundColor Gray
Write-Host "  4. Execute (F5)" -ForegroundColor Gray
Write-Host "  5. Check Messages tab for TenantId output" -ForegroundColor Gray
Write-Host ""
Write-Host "  ⚠️  IMPORTANT: Copy the TenantId from the output!" -ForegroundColor Red
Write-Host "      You'll need it for all API requests." -ForegroundColor Red
Write-Host ""

Write-Host "📝 STEP 2: Start the Backend Service" -ForegroundColor Yellow
Write-Host "---------------------------------------------------" -ForegroundColor Yellow
Write-Host "Run this command:" -ForegroundColor White
Write-Host ""
Write-Host '  cd "microservices\auth-service\AuthService"' -ForegroundColor Cyan
Write-Host "  dotnet run" -ForegroundColor Cyan
Write-Host ""
Write-Host "Wait for output:" -ForegroundColor White
Write-Host '  "Now listening on: https://localhost:7001"' -ForegroundColor Gray
Write-Host ""

Write-Host "📝 STEP 3: Open Swagger UI" -ForegroundColor Yellow
Write-Host "---------------------------------------------------" -ForegroundColor Yellow
Write-Host "Open your browser to:" -ForegroundColor White
Write-Host "  https://localhost:7001/swagger" -ForegroundColor Cyan
Write-Host ""

Write-Host "📝 STEP 4: Login and Test" -ForegroundColor Yellow
Write-Host "---------------------------------------------------" -ForegroundColor Yellow
Write-Host "Test User Credentials (all passwords: Test@123456):" -ForegroundColor White
Write-Host ""
Write-Host "  1. admin@test.com       - System Admin (Full Access)" -ForegroundColor Green
Write-Host "  2. doctor@test.com      - Doctor (Medical Access)" -ForegroundColor Green
Write-Host "  3. nurse@test.com       - Nurse (Clinical Support)" -ForegroundColor Green
Write-Host "  4. receptionist@test.com - Receptionist (Front Desk)" -ForegroundColor Green
Write-Host "  5. labtech@test.com     - Lab Technician (Lab Access)" -ForegroundColor Green
Write-Host ""

Write-Host "Testing Workflow:" -ForegroundColor White
Write-Host "  1. In Swagger, find POST /api/auth/login" -ForegroundColor Gray
Write-Host "  2. Click 'Try it out'" -ForegroundColor Gray
Write-Host "  3. Enter credentials + TenantId" -ForegroundColor Gray
Write-Host "  4. Copy the 'accessToken' from response" -ForegroundColor Gray
Write-Host "  5. Click 'Authorize' button (top right)" -ForegroundColor Gray
Write-Host "  6. Enter: Bearer <paste-token>" -ForegroundColor Gray
Write-Host "  7. Test endpoints and verify permissions" -ForegroundColor Gray
Write-Host ""

Write-Host "📚 DOCUMENTATION" -ForegroundColor Yellow
Write-Host "---------------------------------------------------" -ForegroundColor Yellow
Write-Host "Complete testing guide:" -ForegroundColor White
Write-Host "  END_TO_END_TESTING_GUIDE.md" -ForegroundColor Cyan
Write-Host ""
Write-Host "Implementation details:" -ForegroundColor White
Write-Host "  PERMISSION_MIDDLEWARE_IMPLEMENTATION_COMPLETE.md" -ForegroundColor Cyan
Write-Host ""

Write-Host "🎯 EXPECTED TEST RESULTS" -ForegroundColor Yellow
Write-Host "---------------------------------------------------" -ForegroundColor Yellow
Write-Host "Admin User:        115/115 endpoints return 200 OK" -ForegroundColor White
Write-Host "Doctor User:       ~40 medical endpoints = 200 OK, ~75 admin = 403 Forbidden" -ForegroundColor White
Write-Host "Receptionist User: ~20 front desk = 200 OK, ~95 others = 403 Forbidden" -ForegroundColor White
Write-Host "Unauthenticated:   113 protected = 401, 2 public = 200 OK" -ForegroundColor White
Write-Host ""

Write-Host "🚀 READY TO START!" -ForegroundColor Green
Write-Host "Follow the steps above or refer to END_TO_END_TESTING_GUIDE.md" -ForegroundColor Green
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host ""

# Offer to navigate to auth service directory
$navigate = Read-Host "Navigate to auth service directory now? (Y/N)"
if ($navigate -eq "Y" -or $navigate -eq "y") {
    Set-Location "microservices\auth-service\AuthService"
    Write-Host ""
    Write-Host "✅ Ready! Run: dotnet run" -ForegroundColor Green
    Write-Host ""
}
