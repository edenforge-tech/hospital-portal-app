param()

$ErrorActionPreference = "Stop"

# Database connection parameters
$server = "20.244.11.113"
$port = 5432
$database = "hospital_portal"
$username = "postgres"
$password = "Conga@12345"

Write-Host "=== DATABASE MIGRATION TOOL ===" -ForegroundColor Cyan
Write-Host "Target: $server`:$port/$database" -ForegroundColor Yellow
Write-Host ""

# SQL Script
$sqlScript = @"
ALTER TABLE users ADD COLUMN IF NOT EXISTS activation_status VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS one_time_password_hash TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS otp_expires_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS must_reset_password BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_reset_token TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token_expires_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_password_change TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verification_token TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verification_sent_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS failed_login_attempts INT DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_ip TEXT;

UPDATE users SET activation_status = 'Active', email_verified = true, last_password_change = NOW() WHERE "PasswordHash" IS NOT NULL AND activation_status IS NULL;

CREATE TABLE IF NOT EXISTS user_branches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    user_id UUID NOT NULL,
    branch_id UUID NOT NULL,
    is_default BOOLEAN DEFAULT false,
    assigned_at TIMESTAMP DEFAULT NOW(),
    assigned_by_user_id UUID,
    effective_from TIMESTAMP DEFAULT NOW(),
    effective_until TIMESTAMP,
    status VARCHAR(20) DEFAULT 'active',
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    created_by_user_id UUID,
    updated_at TIMESTAMP DEFAULT NOW(),
    updated_by_user_id UUID,
    deleted_at TIMESTAMP,
    deleted_by_user_id UUID,
    FOREIGN KEY (tenant_id) REFERENCES tenant(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (branch_id) REFERENCES branch(id)
);

CREATE TABLE IF NOT EXISTS user_activation_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    user_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL,
    old_status VARCHAR(20),
    new_status VARCHAR(20),
    reason TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    created_by_user_id UUID,
    FOREIGN KEY (tenant_id) REFERENCES tenant(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS password_reset_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    user_id UUID NOT NULL,
    reset_token TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (tenant_id) REFERENCES tenant(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

SELECT 'Migration completed!' AS result;
"@

Write-Host "SQL Preview (first 300 chars):" -ForegroundColor Cyan
Write-Host $sqlScript.Substring(0, 300) -ForegroundColor DarkGray
Write-Host "... (total: $($sqlScript.Length) characters)" -ForegroundColor DarkGray
Write-Host ""

# Check for psql
$psqlFound = $false
if (Get-Command psql -ErrorAction SilentlyContinue) {
    Write-Host "✓ Found psql command" -ForegroundColor Green
    Write-Host "Attempting database connection..." -ForegroundColor Yellow
    $psqlFound = $true
    
    $env:PGPASSWORD = $password
    $result = $sqlScript | psql -h $server -p $port -U $username -d $database 2>&1
    $exitCode = $LASTEXITCODE
    Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
    
    Write-Host ""
    Write-Host "psql output:" -ForegroundColor Gray
    Write-Host $result
    Write-Host ""
    
    if ($exitCode -eq 0) {
        Write-Host "✓ MIGRATION SUCCESS!" -ForegroundColor Green
        Write-Host "  - 13 columns added to users table" -ForegroundColor Green
        Write-Host "  - 3 supporting tables created" -ForegroundColor Green
        Write-Host ""
        Write-Host "Next: Restart backend:" -ForegroundColor Cyan
        Write-Host "  cd 'microservices/auth-service/AuthService'; dotnet run" -ForegroundColor White
        exit 0
    } else {
        Write-Host "✗ psql failed (exit code: $exitCode)" -ForegroundColor Red
    }
}

if (-not $psqlFound) {
    Write-Host "✗ psql not found" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== ALTERNATIVE OPTIONS ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Install PostgreSQL Client" -ForegroundColor Yellow
Write-Host "   https://www.postgresql.org/download/windows/" -ForegroundColor White
Write-Host ""
Write-Host "2. Use Azure Data Studio" -ForegroundColor Yellow
Write-Host "   Download: https://aka.ms/azuredatastudio" -ForegroundColor White
Write-Host "   Connect to: $server`:$port" -ForegroundColor White
Write-Host "   Run SQL from: add_user_columns.sql" -ForegroundColor White
Write-Host ""
Write-Host "3. Use pgAdmin" -ForegroundColor Yellow
Write-Host "   https://www.pgadmin.org/download/" -ForegroundColor White
Write-Host ""
Write-Host "4. Azure Portal Query Editor" -ForegroundColor Yellow
Write-Host "   Portal → PostgreSQL → Query editor" -ForegroundColor White
Write-Host ""

exit 1
