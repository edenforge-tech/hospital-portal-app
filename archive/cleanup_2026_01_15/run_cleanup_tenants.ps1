# =====================================================
# PowerShell Script to Clean Up Tenants
# =====================================================

param(
    [switch]$DryRun = $false
)

$ErrorActionPreference = "Stop"

# Load connection string from appsettings
$appSettingsPath = ".\microservices\auth-service\AuthService\appsettings.json"
if (Test-Path $appSettingsPath) {
    $appSettings = Get-Content $appSettingsPath | ConvertFrom-Json
    $connectionString = $appSettings.ConnectionStrings.DefaultConnection
    Write-Host "✓ Loaded connection string from appsettings.json" -ForegroundColor Green
} else {
    Write-Host "❌ appsettings.json not found" -ForegroundColor Red
    exit 1
}

# Parse connection string
$connParams = @{}
$connectionString -split ';' | ForEach-Object {
    if ($_ -match '(.+?)=(.+)') {
        $connParams[$matches[1].Trim()] = $matches[2].Trim()
    }
}

$server = $connParams['Host']
$database = $connParams['Database']
$username = $connParams['Username']
$password = $connParams['Password']

Write-Host "`n=============================================" -ForegroundColor Cyan
Write-Host "  TENANT CLEANUP UTILITY" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "Server: $server" -ForegroundColor Yellow
Write-Host "Database: $database" -ForegroundColor Yellow
Write-Host "User: $username" -ForegroundColor Yellow

if ($DryRun) {
    Write-Host "`n⚠️  DRY RUN MODE - No changes will be made" -ForegroundColor Yellow
}

Write-Host "`n----- Step 1: View Current Tenants -----" -ForegroundColor Cyan

# Query current tenants
$query1 = @"
SELECT id, name, tenant_code, status, subscription_type, 
       (SELECT COUNT(*) FROM users WHERE tenant_id = tenant.id) as user_count
FROM tenant
ORDER BY created_at;
"@

$env:PGPASSWORD = $password
$result1 = & psql -h $server -U $username -d $database -c $query1

Write-Host $result1

Write-Host "`n----- Step 2: Identify Tenants to Delete -----" -ForegroundColor Cyan

$query2 = @"
SELECT id, name, tenant_code 
FROM tenant
WHERE tenant_code != 'INDIA_EYE_NET' OR tenant_code IS NULL;
"@

$result2 = & psql -h $server -U $username -d $database -c $query2
Write-Host $result2 -ForegroundColor Red

if (-not $DryRun) {
    Write-Host "`n⚠️  WARNING: This will DELETE the above tenants and ALL their data!" -ForegroundColor Red
    Write-Host "Press Ctrl+C to cancel, or" -ForegroundColor Yellow
    $confirmation = Read-Host "Type 'DELETE' to continue"
    
    if ($confirmation -ne 'DELETE') {
        Write-Host "❌ Operation cancelled" -ForegroundColor Yellow
        exit 0
    }

    Write-Host "`n----- Step 3: Deleting Unwanted Tenants -----" -ForegroundColor Cyan

    $deleteQuery = @"
DELETE FROM tenant
WHERE tenant_code != 'INDIA_EYE_NET' OR tenant_code IS NULL;
"@

    $deleteResult = & psql -h $server -U $username -d $database -c $deleteQuery
    Write-Host $deleteResult -ForegroundColor Green

    Write-Host "`n----- Step 4: Verify Remaining Tenant -----" -ForegroundColor Cyan

    $verifyQuery = @"
SELECT id, name, tenant_code, status, subscription_type, max_users,
       (SELECT COUNT(*) FROM users WHERE tenant_id = tenant.id) as user_count,
       (SELECT COUNT(*) FROM branch WHERE tenant_id = tenant.id) as branch_count,
       (SELECT COUNT(*) FROM department WHERE tenant_id = tenant.id) as dept_count
FROM tenant;
"@

    $verifyResult = & psql -h $server -U $username -d $database -c $verifyQuery
    Write-Host $verifyResult -ForegroundColor Green

    Write-Host "`n✅ Cleanup completed successfully!" -ForegroundColor Green
    Write-Host "Only 'India Eye Hospital Network' (INDIA_EYE_NET) remains." -ForegroundColor Green
} else {
    Write-Host "`n✓ Dry run completed. Use without -DryRun flag to execute deletion." -ForegroundColor Yellow
}

Remove-Item Env:\PGPASSWORD

Write-Host "`n=============================================" -ForegroundColor Cyan
