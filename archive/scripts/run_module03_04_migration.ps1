# =====================================================
# Run Module 3.04 Migration - Patient Type Mutability
# =====================================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Module 3.04 Migration - Package Data" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Load connection string from appsettings.json
$appsettingsPath = "microservices\auth-service\AuthService\appsettings.json"
if (Test-Path $appsettingsPath) {
    $appsettings = Get-Content $appsettingsPath | ConvertFrom-Json
    $connString = $appsettings.ConnectionStrings.DefaultConnection
    
    # Parse connection string components
    $connParts = @{}
    $connString -split ';' | ForEach-Object {
        if ($_ -match '(.+?)=(.+)') {
            $connParts[$matches[1].Trim()] = $matches[2].Trim()
        }
    }
    
    $host = $connParts['Host']
    $database = $connParts['Database']
    $username = $connParts['Username']
    $password = $connParts['Password']
    
    if ($host -and $database -and $username -and $password) {
        Write-Host "✅ Connection Details:" -ForegroundColor Green
        Write-Host "   Host: $host" -ForegroundColor Gray
        Write-Host "   Database: $database" -ForegroundColor Gray
        Write-Host "   User: $username" -ForegroundColor Gray
        Write-Host ""
        
        # Set environment variable for password
        $env:PGPASSWORD = $password
        
        # Run the migration
        Write-Host "📦 Running Module 3.04 migration..." -ForegroundColor Yellow
        $migrationFile = "database_migrations\schema\module03_04_patient_type_mutability.sql"
        
        if (Test-Path $migrationFile) {
            & psql -h $host -U $username -d $database -f $migrationFile
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host ""
                Write-Host "✅ Migration completed successfully!" -ForegroundColor Green
                Write-Host ""
                Write-Host "The following columns were added to counseling_sessions:" -ForegroundColor Cyan
                Write-Host "  - selected_package_id (UUID)" -ForegroundColor Gray
                Write-Host "  - package_amount (NUMERIC)" -ForegroundColor Gray
                Write-Host "  - package_addons_json (TEXT)" -ForegroundColor Gray
                Write-Host "  - current_stage (VARCHAR)" -ForegroundColor Gray
                Write-Host ""
                Write-Host "New table created:" -ForegroundColor Cyan
                Write-Host "  - counseling_session_audit_log" -ForegroundColor Gray
                Write-Host ""
            } else {
                Write-Host ""
                Write-Host "❌ Migration failed! Check the error above." -ForegroundColor Red
                Write-Host ""
            }
        } else {
            Write-Host "❌ Migration file not found: $migrationFile" -ForegroundColor Red
        }
        
        # Clear password
        $env:PGPASSWORD = $null
    } else {
        Write-Host "❌ Could not parse connection string" -ForegroundColor Red
    }
} else {
    Write-Host "❌ appsettings.json not found at: $appsettingsPath" -ForegroundColor Red
}

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
