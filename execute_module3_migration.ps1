# ========================================
# Execute Module 3 Database Migration
# Tables: 3.6-3.10 (13 new tables)
# Date: February 23, 2026
# ========================================

param(
    [string]$Server = "hospitalportal-db-server.postgres.database.azure.com",
    [string]$Database = "hospitalportal",
    [string]$Username = "postgres_admin",
    [switch]$PromptPassword = $false
)

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "🗄️  Module 3 Database Migration (3.6-3.10)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Check if psql is available
try {
    $psqlVersion = psql --version 2>&1
    Write-Host "✅ PostgreSQL Client: $psqlVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ psql not found. Please install PostgreSQL client tools." -ForegroundColor Red
    Write-Host "   Download: https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
    exit 1
}

# Migration file path
$migrationFile = Join-Path $PSScriptRoot "module3_migration_complete.sql"

if (-not (Test-Path $migrationFile)) {
    Write-Host "❌ Migration file not found: $migrationFile" -ForegroundColor Red
    exit 1
}

Write-Host "`n📋 Migration Details:" -ForegroundColor Yellow
Write-Host "   Server: $Server" -ForegroundColor Gray
Write-Host "   Database: $Database" -ForegroundColor Gray
Write-Host "   User: $Username" -ForegroundColor Gray
Write-Host "   Migration File: $(Split-Path $migrationFile -Leaf)" -ForegroundColor Gray

# Get file stats
$fileInfo = Get-Item $migrationFile
Write-Host "   File Size: $([math]::Round($fileInfo.Length / 1KB, 2)) KB" -ForegroundColor Gray

# Prepare password
if ($PromptPassword) {
    $securePassword = Read-Host "Enter PostgreSQL password" -AsSecureString
    $BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
    $password = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
    $env:PGPASSWORD = $password
} else {
    Write-Host "`n⚠️  Using environment variable PGPASSWORD for authentication" -ForegroundColor Yellow
    Write-Host "   Set with: `$env:PGPASSWORD = 'your_password'" -ForegroundColor Gray
}

# Confirm execution
Write-Host "`n⚠️  This will create 13 new tables for Module 3.6-3.10" -ForegroundColor Yellow
Write-Host "   Continue? (Y/N): " -NoNewline -ForegroundColor Yellow
$confirm = Read-Host

if ($confirm -ne 'Y' -and $confirm -ne 'y') {
    Write-Host "`n❌ Migration cancelled by user" -ForegroundColor Red
    exit 0
}

# Execute migration
Write-Host "`n🚀 Executing migration..." -ForegroundColor Green

try {
    $output = psql -h $Server -U $Username -d $Database -f $migrationFile 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n✅ Migration completed successfully!" -ForegroundColor Green
        Write-Host $output -ForegroundColor Gray
        
        # Verify table creation
        Write-Host "`n🔍 Verifying table creation..." -ForegroundColor Yellow
        
        $verifyQuery = @"
SELECT 
    table_name, 
    (SELECT count(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
AND table_name IN (
    'insurance_pre_authorizations', 'insurance_approval_workflows', 
    'insurance_documents', 'tpa_communication_logs',
    'payment_transactions', 'payment_links', 'government_scheme_claims',
    'patient_admissions', 'bed_reservations',
    'consent_form_templates', 'counseling_consents',
    'counseling_workflow_states', 'workflow_stage_transitions'
)
ORDER BY table_name;
"@
        
        $verifyOutput = psql -h $Server -U $Username -d $Database -c $verifyQuery 2>&1
        Write-Host $verifyOutput -ForegroundColor Cyan
        
    } else {
        Write-Host "`n❌ Migration failed with exit code: $LASTEXITCODE" -ForegroundColor Red
        Write-Host $output -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "`n❌ Migration error: $_" -ForegroundColor Red
    exit 1
} finally {
    # Clear password from environment
    if ($PromptPassword) {
        Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "✅ Module 3 Migration Complete" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan

Write-Host "`n📊 Summary:" -ForegroundColor Yellow
Write-Host "   Module 3.6: 4 tables (Insurance Pre-Auth)" -ForegroundColor Green
Write-Host "   Module 3.7: 3 tables (Payment Processing)" -ForegroundColor Green
Write-Host "   Module 3.8: 2 tables (Admission Management)" -ForegroundColor Green
Write-Host "   Module 3.9: 2 tables (Consent Management)" -ForegroundColor Green
Write-Host "   Module 3.10: 2 tables (Workflow Orchestration)" -ForegroundColor Green
Write-Host "   Total: 13 tables + 31 indexes + 13 RLS policies" -ForegroundColor Cyan

Write-Host "`n🎯 Next Steps:" -ForegroundColor Yellow
Write-Host "   1. Verify backend APIs: http://localhost:5073/swagger" -ForegroundColor Gray
Write-Host "   2. Run API integration tests: .\TEST_MODULE3_COMPLETE.ps1" -ForegroundColor Gray
Write-Host "   3. Start frontend implementation" -ForegroundColor Gray

Write-Host "`n"
