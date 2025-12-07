# ============================================
# Test Permissions Seeding
# Hospital Portal - Verify 297 Permissions
# Created: November 10, 2025
# ============================================

Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "   TESTING PERMISSIONS SEEDING" -ForegroundColor Green
Write-Host "============================================`n" -ForegroundColor Cyan

# Configuration
$dbHost = "localhost"
$dbPort = "5432"
$dbName = "hospital_portal"
$dbUser = "postgres"
$dbPassword = Read-Host "Enter PostgreSQL password for user '$dbUser'" -AsSecureString
$dbPasswordPlain = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto([System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($dbPassword))

# Set environment variable for psql
$env:PGPASSWORD = $dbPasswordPlain

Write-Host "→ Testing database connection..." -ForegroundColor Yellow

# Test connection
$connectionTest = psql -h $dbHost -p $dbPort -U $dbUser -d $dbName -c "SELECT version();" 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Database connection successful`n" -ForegroundColor Green
} else {
    Write-Host "✗ Database connection failed" -ForegroundColor Red
    Write-Host $connectionTest -ForegroundColor Red
    exit 1
}

Write-Host "→ Checking if permissions table exists..." -ForegroundColor Yellow

$tableCheck = psql -h $dbHost -p $dbPort -U $dbUser -d $dbName -t -c "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'permissions');" 2>&1

if ($tableCheck -match "t") {
    Write-Host "✓ Permissions table exists`n" -ForegroundColor Green
} else {
    Write-Host "✗ Permissions table not found" -ForegroundColor Red
    exit 1
}

Write-Host "→ Counting existing permissions..." -ForegroundColor Yellow

$existingCount = psql -h $dbHost -p $dbPort -U $dbUser -d $dbName -t -c "SELECT COUNT(*) FROM permissions;" 2>&1
$existingCount = $existingCount.Trim()

Write-Host "   Current permissions in database: $existingCount`n" -ForegroundColor Cyan

Write-Host "→ Running MASTER_PERMISSIONS_SEED.sql..." -ForegroundColor Yellow
Write-Host "   This will insert 297 permissions across 16 modules`n" -ForegroundColor Gray

# Execute master seed script
$seedResult = psql -h $dbHost -p $dbPort -U $dbUser -d $dbName -f ".\MASTER_PERMISSIONS_SEED.sql" 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✓ Permissions seeding completed`n" -ForegroundColor Green
} else {
    Write-Host "`n✗ Permissions seeding failed" -ForegroundColor Red
    Write-Host $seedResult -ForegroundColor Red
    exit 1
}

# Verify final count
Write-Host "→ Verifying permissions count..." -ForegroundColor Yellow

$finalCount = psql -h $dbHost -p $dbPort -U $dbUser -d $dbName -t -c "SELECT COUNT(*) FROM permissions;" 2>&1
$finalCount = $finalCount.Trim()

Write-Host "   Total permissions after seeding: $finalCount`n" -ForegroundColor Cyan

# Get module breakdown
Write-Host "→ Permissions by module:" -ForegroundColor Yellow
$moduleBreakdown = psql -h $dbHost -p $dbPort -U $dbUser -d $dbName -c "SELECT module, COUNT(*) as count FROM permissions GROUP BY module ORDER BY module;" 2>&1
Write-Host $moduleBreakdown -ForegroundColor Gray

Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "   VERIFICATION COMPLETE" -ForegroundColor Green
Write-Host "============================================`n" -ForegroundColor Cyan

if ([int]$finalCount -ge 297) {
    Write-Host "✓ SUCCESS: All 297+ permissions seeded successfully!" -ForegroundColor Green
    Write-Host "`nNext Steps:" -ForegroundColor Yellow
    Write-Host "  1. Create 20 roles (seed_roles.sql)" -ForegroundColor Gray
    Write-Host "  2. Map permissions to roles (seed_role_permissions_*.sql)" -ForegroundColor Gray
    Write-Host "  3. Test RBAC in Swagger UI" -ForegroundColor Gray
} else {
    Write-Host "⚠ WARNING: Expected 297+ permissions, found $finalCount" -ForegroundColor Yellow
    Write-Host "   Some permissions may not have been inserted (check for duplicates)" -ForegroundColor Gray
}

Write-Host ""

# Clear password from environment
$env:PGPASSWORD = $null
