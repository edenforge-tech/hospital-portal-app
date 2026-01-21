# =====================================================
# Add Phone Numbers to Users
# Executes SQL script to populate phone numbers
# =====================================================

$ErrorActionPreference = "Stop"

# Database connection details
$Server = "20.244.11.113"
$Port = "5432"
$Database = "hospital_portal"
$Username = "hospital_admin"
$Password = "SecureAdmin@2024"

Write-Host "=== Adding Phone Numbers to Users ===" -ForegroundColor Cyan
Write-Host "Server: $Server" -ForegroundColor Yellow
Write-Host "Database: $Database" -ForegroundColor Yellow

# Set environment variable for password
$env:PGPASSWORD = $Password

try {
    # Execute the SQL script
    Write-Host "`nExecuting add_user_phone_numbers.sql..." -ForegroundColor Yellow
    
    $sqlFile = Join-Path $PSScriptRoot "add_user_phone_numbers.sql"
    
    if (-not (Test-Path $sqlFile)) {
        throw "SQL file not found: $sqlFile"
    }
    
    $result = & psql -h $Server -p $Port -U $Username -d $Database -f $sqlFile 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n✓ Phone numbers added successfully!" -ForegroundColor Green
        Write-Host $result -ForegroundColor Gray
    } else {
        throw "SQL execution failed: $result"
    }
} catch {
    Write-Host "`n✗ Error: $_" -ForegroundColor Red
    exit 1
} finally {
    # Clear password from environment
    Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue
}

Write-Host "`n=== Complete ===" -ForegroundColor Green