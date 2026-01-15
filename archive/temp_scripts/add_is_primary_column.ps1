# Script to add is_primary column to user_department_access table
# Reads connection string from appsettings.Database.json

$ErrorActionPreference = "Stop"

Write-Host "📋 Adding is_primary column to user_department_access table..." -ForegroundColor Cyan

# Read connection string from appsettings.Database.json
$appSettingsPath = Join-Path $PSScriptRoot "appsettings.Database.json"
if (-not (Test-Path $appSettingsPath)) {
    Write-Host "❌ appsettings.Database.json not found at: $appSettingsPath" -ForegroundColor Red
    exit 1
}

$appSettings = Get-Content $appSettingsPath | ConvertFrom-Json
$connectionString = $appSettings.ConnectionStrings.DefaultConnection

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

Write-Host "🔌 Connecting to: $server/$database" -ForegroundColor Yellow

# SQL to add is_primary column
$sql = @"
-- Add is_primary column to user_department_access table
DO `$`$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'user_department_access' 
        AND column_name = 'is_primary'
    ) THEN
        ALTER TABLE user_department_access 
        ADD COLUMN is_primary BOOLEAN NOT NULL DEFAULT FALSE;
        
        RAISE NOTICE 'Column is_primary added successfully';
    ELSE
        RAISE NOTICE 'Column is_primary already exists';
    END IF;
END `$`$;

-- Create index for faster primary department lookups
CREATE INDEX IF NOT EXISTS idx_user_department_access_is_primary 
ON user_department_access(user_id, is_primary) 
WHERE is_primary = TRUE;

-- Ensure only one primary department per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_department_access_one_primary 
ON user_department_access(user_id) 
WHERE is_primary = TRUE;

SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'user_department_access'
ORDER BY ordinal_position;
"@

# Set PostgreSQL password environment variable
$env:PGPASSWORD = $password

try {
    # Execute SQL using psql
    Write-Host "📝 Executing SQL migration..." -ForegroundColor Yellow
    $sql | & psql -h $server -U $username -d $database -w
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Migration completed successfully!" -ForegroundColor Green
    } else {
        Write-Host "❌ Migration failed with exit code: $LASTEXITCODE" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Error executing migration: $_" -ForegroundColor Red
    Write-Host "💡 Tip: Make sure psql is installed and accessible in PATH" -ForegroundColor Yellow
    Write-Host "💡 Alternative: Run the SQL manually in Azure Portal Query Editor" -ForegroundColor Yellow
    exit 1
} finally {
    # Clear password from environment
    Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
}
