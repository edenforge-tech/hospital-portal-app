# Run Database Migrations for Hospital Portal
# Executes all migration scripts against Azure PostgreSQL

$ErrorActionPreference = "Stop"

# Database connection details from appsettings.json
$Host = "hospitalportal-db-server.postgres.database.azure.com"
$Port = "5432"
$Database = "hospitalportal"
$Username = "postgres"
$Password = "Eden@#$0606"

# Connection string for psql
$env:PGPASSWORD = $Password

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "HOSPITAL PORTAL - DATABASE MIGRATION" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Array of migration scripts in order
$migrations = @(
    "01_create_organization_table.sql",
    "02_update_branch_with_organization.sql",
    "03_restructure_departments_14_standards.sql",
    "04_convert_75_to_subdepartments.sql"
)

$scriptPath = "c:\Users\Sam Aluri\Downloads\Hospital Portal\database_migrations"

foreach ($migration in $migrations) {
    $fullPath = Join-Path $scriptPath $migration
    
    Write-Host "Executing: $migration" -ForegroundColor Yellow
    
    if (Test-Path $fullPath) {
        try {
            # Use psql to execute the script
            $result = psql -h $Host -p $Port -U $Username -d $Database -f $fullPath 2>&1
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✓ $migration completed successfully" -ForegroundColor Green
            } else {
                Write-Host "✗ $migration failed with exit code $LASTEXITCODE" -ForegroundColor Red
                Write-Host $result -ForegroundColor Red
            }
        }
        catch {
            Write-Host "✗ Error executing $migration : $_" -ForegroundColor Red
        }
    } else {
        Write-Host "✗ File not found: $fullPath" -ForegroundColor Red
    }
    
    Write-Host ""
}

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "MIGRATION PROCESS COMPLETED" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

# Clear password from environment
$env:PGPASSWORD = ""
