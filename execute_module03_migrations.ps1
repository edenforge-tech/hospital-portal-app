# Module 3: Counselor Management - Database Migration Executor
# Executes all 10 migration files sequentially

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

$totalFiles = $migrationFiles.Count
$successCount = 0
$failedFiles = @()

try {
    Log "`n[1/3] Finding Npgsql.dll..." "Yellow"
    $npgsqlPath = Get-ChildItem -Path "microservices/auth-service/AuthService/bin" -Recurse -Filter "Npgsql.dll" -ErrorAction SilentlyContinue | 
        Where-Object { $_.FullName -like "*Release*" -or $_.FullName -like "*Debug*" } | 
        Select-Object -First 1
    
    if (-not $npgsqlPath) {
        Log "  Npgsql.dll not found, building project..." "Yellow"
        Push-Location "microservices/auth-service/AuthService"
        $buildOutput = dotnet build --configuration Release 2>&1
        Pop-Location
        
        $npgsqlPath = Get-ChildItem -Path "microservices/auth-service/AuthService/bin" -Recurse -Filter "Npgsql.dll" | Select-Object -First 1
    }
    
    if ($npgsqlPath) {
        Log "  [OK] Found: $($npgsqlPath.FullName)" "Green"
    } else {
        throw "Npgsql.dll not found even after build"
    }
    
    Log "`n[2/3] Loading Npgsql assembly and dependencies..." "Yellow"
    $binFolder = Split-Path $npgsqlPath.FullName
    
    # Load dependencies first
    $dependencies = @(
        "System.Runtime.CompilerServices.Unsafe.dll",
        "System.Threading.Channels.dll", 
        "System.Diagnostics.DiagnosticSource.dll",
        "Microsoft.Extensions.Logging.Abstractions.dll"
    )
    
    foreach ($dep in $dependencies) {
        $depPath = Join-Path $binFolder $dep
        if (Test-Path $depPath) {
            try {
                Add-Type -Path $depPath -ErrorAction SilentlyContinue
            } catch {
                # Ignore if already loaded
            }
        }
    }
    
    Add-Type -Path $npgsqlPath.FullName
    Log "  [OK] Assembly loaded successfully" "Green"
    
    Log "`n[3/3] Connecting to Azure PostgreSQL..." "Yellow"
    $connectionString = "Host=hospitalportal-db-server.postgres.database.azure.com;Port=5432;Database=hospitalportal;Username=postgres;Password=NewPass@2026!;SSL Mode=Require;Trust Server Certificate=true;Timeout=60;Command Timeout=300"
    
    $connection = New-Object Npgsql.NpgsqlConnection($connectionString)
    $connection.Open()
    Log "  [OK] Connected to database: $($connection.Database)" "Green"
    Log "  [OK] Server version: $($connection.ServerVersion)" "Green"
    
    Log "`n" "White"
    Log "===============================================================" "Cyan"
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
            
            $sqlScript = Get-Content $file -Raw
            $fileSize = [Math]::Round($sqlScript.Length / 1KB, 2)
            Log "  Reading SQL file... ($fileSize KB)" "Gray"
            
            $command = $connection.CreateCommand()
            $command.CommandText = $sqlScript
            $command.CommandTimeout = 300
            
            $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
            $rowsAffected = $command.ExecuteNonQuery()
            $stopwatch.Stop()
            
            Log "  [OK] Executed successfully (${rowsAffected} rows affected, $($stopwatch.ElapsedMilliseconds)ms)" "Green"
            $successCount++
            
        } catch {
            Log "  [FAIL] Error: $($_.Exception.Message)" "Red"
            $failedFiles += $fileName
        }
    }
    
    Log "`n" "White"
    Log "===============================================================" "Cyan"
    Log "  VERIFICATION" "Cyan"
    Log "===============================================================" "Cyan"
    
    # Verify table creation
    Log "`nChecking created tables..." "Yellow"
    $verifyCmd = $connection.CreateCommand()
    $verifyCmd.CommandText = @"
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
    
    $reader = $verifyCmd.ExecuteReader()
    $tableCount = 0
    while ($reader.Read()) {
        $tableCount++
        $tableName = $reader.GetString(0)
        $tableSize = $reader.GetString(1)
        Log "  [OK] $tableName ($tableSize)" "Green"
    }
    $reader.Close()
    
    Log "`nTotal tables created: $tableCount" "Cyan"
    
    # Check indexes
    Log "`nChecking indexes..." "Yellow"
    $indexCmd = $connection.CreateCommand()
    $indexCmd.CommandText = @"
SELECT COUNT(*) 
FROM pg_indexes 
WHERE schemaname = 'public'
AND (tablename LIKE '%counseling%'
   OR tablename LIKE '%package%'
   OR tablename LIKE '%preop%'
   OR tablename LIKE '%ot_%'
   OR tablename LIKE '%insurance%'
   OR tablename LIKE '%payment%'
   OR tablename LIKE '%admission%'
   OR tablename LIKE '%consent%'
   OR tablename LIKE '%workflow%');
"@
    $indexCount = $indexCmd.ExecuteScalar()
    Log "  [OK] Indexes created: $indexCount" "Green"
    
    # Check RLS policies
    Log "`nChecking RLS policies..." "Yellow"
    $rlsCmd = $connection.CreateCommand()
    $rlsCmd.CommandText = @"
SELECT COUNT(*) 
FROM pg_policies 
WHERE tablename LIKE '%counseling%'
   OR tablename LIKE '%package%'
   OR tablename LIKE '%preop%'
   OR tablename LIKE '%ot_%'
   OR tablename LIKE '%insurance%'
   OR tablename LIKE '%payment%'
   OR tablename LIKE '%admission%'
   OR tablename LIKE '%consent%'
   OR tablename LIKE '%workflow%';
"@
    $policyCount = $rlsCmd.ExecuteScalar()
    Log "  [OK] RLS policies: $policyCount" "Green"
    
    # Check triggers
    Log "`nChecking triggers..." "Yellow"
    $triggerCmd = $connection.CreateCommand()
    $triggerCmd.CommandText = @"
SELECT COUNT(*) 
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
WHERE c.relname LIKE '%counseling%'
   OR c.relname LIKE '%package%'
   OR c.relname LIKE '%preop%'
   OR c.relname LIKE '%ot_%'
   OR c.relname LIKE '%insurance%'
   OR c.relname LIKE '%payment%'
   OR c.relname LIKE '%admission%'
   OR c.relname LIKE '%consent%'
   OR c.relname LIKE '%workflow%';
"@
    $triggerCount = $triggerCmd.ExecuteScalar()
    Log "  [OK] Triggers created: $triggerCount" "Green"
    
    $connection.Close()
    
    Log "`n" "White"
    Log "===============================================================" "Green"
    Log "  MIGRATION COMPLETED SUCCESSFULLY!" "Green"
    Log "===============================================================" "Green"
    Log "`nSummary:" "White"
    Log "  - Files executed: $successCount/$totalFiles" "White"
    Log "  - Tables created: $tableCount" "White"
    Log "  - Indexes created: $indexCount" "White"
    Log "  - RLS policies: $policyCount" "White"
    Log "  - Triggers: $triggerCount" "White"
    
    if ($failedFiles.Count -gt 0) {
        Log "`nFailed files:" "Red"
        foreach ($fail in $failedFiles) {
            Log "  [FAIL] $fail" "Red"
        }
    }
    
    Log "`nLog file saved: $logFile" "Gray"
    Log "Completed at $(Get-Date)" "Gray"
    
} catch {
    Log "`n===============================================================" "Red"
    Log "  MIGRATION FAILED" "Red"
    Log "===============================================================" "Red"
    Log "Error: $($_.Exception.Message)" "Red"
    if ($_.Exception.InnerException) {
        Log "Inner exception: $($_.Exception.InnerException.Message)" "Red"
    }
    Log "`nStack trace:" "Gray"
    Log "$($_.ScriptStackTrace)" "Gray"
    
    if ($connection -and $connection.State -eq 'Open') {
        $connection.Close()
    }
    
    Log "`nLog file saved: $logFile" "Gray"
    exit 1
}
