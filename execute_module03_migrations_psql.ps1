# Module 3: Counselor Management - Database Migration Executor (using psql)
# Executes all 10 migration files sequentially

$ErrorActionPreference = "Continue"
$logFile = "module03_migration_log.txt"

function Log {
    param($message, $color = "White")
    Write-Host $message -ForegroundColor $color
    Add-Content -Path $logFile -Value "$(Get-Date -Format 'HH:mm:ss') - $message"
}

Clear-Content -Path $logFile -ErrorAction SilentlyContinue

Log "`n===============================================================" "Cyan"
Log "      MODULE 3: COUNSELOR MANAGEMENT - MIGRATIONS              " "Cyan"
Log "===============================================================" "Cyan"
Log "Starting at $(Get-Date)" "Gray"

# Define migration files in order
$migrationFiles = @(
    "database_migrations/schema/module03_01_package_management.sql",
    "database_migrations/schema/module03_02_counseling_workflow.sql",
    "database_migrations/schema/module03_03_patient_type_workflows.sql",
    "database_migrations/schema/module03_04_preop_test_management.sql",
    "database_migrations/schema/module03_05_ot_booking_system.sql",
    "database_migrations/schema/module03_06_insurance_preauth_workflow.sql",
    "database_migrations/schema/module03_07_payment_processing.sql",
    "database_migrations/schema/module03_08_admission_management.sql",
    "database_migrations/schema/module03_09_consent_management.sql",
    "database_migrations/schema/module03_10_workflow_orchestration.sql"
)

# PostgreSQL connection details
$env:PGHOST = "hospitalportal-db-server.postgres.database.azure.com"
$env:PGPORT = "5432"
$env:PGDATABASE = "hospitalportal"
$env:PGUSER = "postgres"
$env:PGPASSWORD = "NewPass@2026!"

$totalFiles = $migrationFiles.Count
$successCount = 0
$failedFiles = @()

Log "`n===============================================================" "Cyan"
Log "  EXECUTING MIGRATIONS ($totalFiles files)" "Cyan"
Log "===============================================================" "Cyan"

# Execute each migration file
for ($i = 0; $i -lt $migrationFiles.Count; $i++) {
    $file = $migrationFiles[$i]
    $fileNum = $i + 1
    $fileName = Split-Path $file -Leaf
    
    Log "`n-------------------------------------------------------------" "White"
    Log "  [$fileNum/$totalFiles] $fileName" "Cyan"
    Log "-------------------------------------------------------------" "White"
    
    try {
        if (-not (Test-Path $file)) {
            throw "File not found: $file"
        }
        
        $fileSize = [Math]::Round((Get-Item $file).Length / 1KB, 2)
        Log "  Reading SQL file... ($fileSize KB)" "Gray"
        
        $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
        
        # Execute using psql
        $psqlPath = "C:\Program Files\PostgreSQL\17\bin\psql.exe"
        $output = & $psqlPath -f $file --set=sslmode=require 2>&1
        
        $stopwatch.Stop()
        
        if ($LASTEXITCODE -eq 0) {
            Log "  [OK] Executed successfully ($($stopwatch.ElapsedMilliseconds)ms)" "Green"
            $successCount++
        } else {
            throw "psql returned error code $LASTEXITCODE"
        }
        
    } catch {
        Log "  [FAIL] Error: $($_.Exception.Message)" "Red"
        Log "  Output: $output" "Red"
        $failedFiles += $fileName
    }
}

# Verification
Log "`n" "White"
Log "===============================================================" "Cyan"
Log "  VERIFICATION" "Cyan"
Log "===============================================================" "Cyan"

Log "`nChecking created tables..." "Yellow"
$verifyQuery = @"
SELECT 
    tablename,
    pg_size_pretty(pg_total_relation_size('public.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
AND (tablename LIKE '%counseling%'
   OR tablename LIKE '%package%'
   OR tablename LIKE '%preop%'
   OR tablename LIKE '%ot_%'
   OR tablename LIKE '%insurance%'
   OR tablename LIKE '%payment%'
   OR tablename LIKE '%admission%'
   OR tablename LIKE '%consent%'
   OR tablename LIKE '%workflow%'
   OR tablename LIKE '%tpa%'
   OR tablename LIKE '%bed_reservation%'
   OR tablename LIKE '%government_scheme%'
   OR tablename LIKE '%cheque%'
   OR tablename LIKE '%razorpay%'
   OR tablename LIKE '%day_care%')
ORDER BY tablename;
"@

$tables = & $psqlPath -t -c $verifyQuery --set=sslmode=require 2>&1
if ($LASTEXITCODE -eq 0) {
    $tableLines = $tables | Where-Object { $_ -match '\S' }
    $tableCount = ($tableLines | Measure-Object).Count
    foreach ($line in $tableLines) {
        Log "  [OK] $($line.Trim())" "Green"
    }
    Log "`nTotal tables created: $tableCount" "Cyan"
} else {
    Log "  [WARN] Could not verify tables" "Yellow"
}

# Check indexes
$indexQuery = "SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public' AND (tablename LIKE '%counseling%' OR tablename LIKE '%package%' OR tablename LIKE '%preop%' OR tablename LIKE '%ot_%' OR tablename LIKE '%insurance%' OR tablename LIKE '%payment%' OR tablename LIKE '%admission%' OR tablename LIKE '%consent%' OR tablename LIKE '%workflow%');"
$indexCount = & $psqlPath -t -c $indexQuery --set=sslmode=require 2>&1
if ($LASTEXITCODE -eq 0) {
    Log "  [OK] Indexes created: $($indexCount.Trim())" "Green"
}

# Check RLS policies
$rlsQuery = "SELECT COUNT(*) FROM pg_policies WHERE tablename LIKE '%counseling%' OR tablename LIKE '%package%' OR tablename LIKE '%preop%' OR tablename LIKE '%ot_%' OR tablename LIKE '%insurance%' OR tablename LIKE '%payment%' OR tablename LIKE '%admission%' OR tablename LIKE '%consent%' OR tablename LIKE '%workflow%';"
$policyCount = & $psqlPath -t -c $rlsQuery --set=sslmode=require 2>&1
if ($LASTEXITCODE -eq 0) {
    Log "  [OK] RLS policies: $($policyCount.Trim())" "Green"
}

# Summary
if ($successCount -eq $totalFiles) {
    Log "`n" "White"
    Log "===============================================================" "Green"
    Log "  MIGRATION COMPLETED SUCCESSFULLY!" "Green"
    Log "===============================================================" "Green"
} else {
    Log "`n" "White"
    Log "===============================================================" "Yellow"
    Log "  MIGRATION COMPLETED WITH ERRORS" "Yellow"
    Log "===============================================================" "Yellow"
}

Log "`nSummary:" "White"
Log "  - Files executed: $successCount/$totalFiles" "White"

if ($failedFiles.Count -gt 0) {
    Log "`nFailed files:" "Red"
    foreach ($fail in $failedFiles) {
        Log "  [FAIL] $fail" "Red"
    }
}

Log "`nLog file saved: $logFile" "Gray"
Log "Completed at $(Get-Date)" "Gray"

# Clear sensitive env variables
Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
