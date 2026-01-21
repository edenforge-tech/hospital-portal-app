$ErrorActionPreference = "Stop"

$Server = "20.244.11.113"
$Port = "5432"
$Database = "hospital_portal"
$Username = "hospital_admin"
$Password = "SecureAdmin@2024"

Write-Host "=== Adding Phone Numbers to Users ===" -ForegroundColor Cyan

$env:PGPASSWORD = $Password

try {
    $sqlFile = "C:\Users\Sam Aluri\Downloads\Hospital Portal\add_user_phone_numbers.sql"
    
    if (-not (Test-Path $sqlFile)) {
        throw "SQL file not found: $sqlFile"
    }
    
    $result = & psql -h $Server -p $Port -U $Username -d $Database -f $sqlFile 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`nPhone numbers added successfully!" -ForegroundColor Green
        Write-Host $result -ForegroundColor Gray
    } else {
        throw "SQL execution failed: $result"
    }
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
    exit 1
} finally {
    Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue
}

Write-Host "Complete!" -ForegroundColor Green
