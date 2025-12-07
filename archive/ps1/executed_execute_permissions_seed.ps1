# Archived copy of execute_permissions_seed.ps1
@'
# =====================================================
# execute_permissions_seed.ps1 (archived original)
# =====================================================
Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   PERMISSIONS SEEDING SCRIPT" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Configuration - Azure PostgreSQL
$dbHost = "hospitalportal-db-server.postgres.database.azure.com"
$dbPort = "5432"
$dbName = "hospitalportal"
$dbUser = "postgres"

Write-Host "Enter PostgreSQL password for user '$dbUser': " -ForegroundColor Yellow -NoNewline
$dbPassword = Read-Host -AsSecureString
$dbPasswordPlain = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto([System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($dbPassword))

# Set environment variable
$env:PGPASSWORD = $dbPasswordPlain

Write-Host ""
Write-Host "Testing database connection..." -ForegroundColor Yellow

# Test connection
$testResult = psql -h $dbHost -p $dbPort -U $dbUser -d $dbName -c "SELECT 1;" 2>&1

if ($LASTEXITCODE -eq 0) {
	Write-Host "SUCCESS: Database connection established" -ForegroundColor Green
} else {
	Write-Host "ERROR: Cannot connect to database" -ForegroundColor Red
	Write-Host $testResult -ForegroundColor Red
	exit 1
}

Write-Host ""
Write-Host "Checking permissions table..." -ForegroundColor Yellow

$tableCheck = psql -h $dbHost -p $dbPort -U $dbUser -d $dbName -t -c "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'permissions');"

if ($tableCheck -match "t") {
	Write-Host "SUCCESS: Permissions table found" -ForegroundColor Green
} else {
	Write-Host "ERROR: Permissions table does not exist" -ForegroundColor Red
	Write-Host "Run database migrations first: dotnet ef database update" -ForegroundColor Yellow
	exit 1
}

Write-Host ""
Write-Host "Counting existing permissions..." -ForegroundColor Yellow

$existingCount = (psql -h $dbHost -p $dbPort -U $dbUser -d $dbName -t -c "SELECT COUNT(*) FROM permissions;" ).Trim()

Write-Host "Current permissions in database: $existingCount" -ForegroundColor Cyan

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   EXECUTING MASTER SEED SCRIPT" -ForegroundColor Yellow
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Running MASTER_PERMISSIONS_SEED.sql..." -ForegroundColor Yellow
Write-Host ""

# Execute master seed script
$seedResult = psql -h $dbHost -p $dbPort -U $dbUser -d $dbName -f "MASTER_PERMISSIONS_SEED.sql" 2>&1

Write-Host $seedResult

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   VERIFICATION" -ForegroundColor Yellow
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Count final permissions
$finalCount = (psql -h $dbHost -p $dbPort -U $dbUser -d $dbName -t -c "SELECT COUNT(*) FROM permissions;" ).Trim()

Write-Host "Total permissions after seeding: $finalCount" -ForegroundColor Green
Write-Host ""

if ([int]$finalCount -ge 297) {
	Write-Host "SUCCESS: All permissions seeded successfully!" -ForegroundColor Green
	Write-Host "Expected: 297+  |  Actual: $finalCount" -ForegroundColor Green
} else {
	Write-Host "WARNING: Permission count less than expected" -ForegroundColor Yellow
	Write-Host "Expected: 297+  |  Actual: $finalCount" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Permissions by module:" -ForegroundColor Yellow

psql -h $dbHost -p $dbPort -U $dbUser -d $dbName -c "SELECT module, COUNT(*) as count FROM permissions GROUP BY module ORDER BY module;"

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   WEEK 1 DAY 1 COMPLETE" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Clear password
$env:PGPASSWORD = ""

'@
