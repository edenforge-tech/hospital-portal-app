# Module 4 Database Migration Executor
# Outputs to both console and log file

$logFile = "migration_log.txt"
function Log {
    param($message, $color = "White")
    Write-Host $message -ForegroundColor $color
    Add-Content -Path $logFile -Value "$(Get-Date -Format 'HH:mm:ss') - $message"
}

Clear-Content -Path $logFile -ErrorAction SilentlyContinue

Log "`n=== MODULE 4 DATABASE MIGRATION ===" "Cyan"
Log "Starting at $(Get-Date)" "Gray"

try {
    Log "`nStep 1: Finding Npgsql.dll..." "Yellow"
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
        Log "  Found: $($npgsqlPath.FullName)" "Green"
    } else {
        throw "Npgsql.dll not found even after build"
    }
    
    Log "`nStep 2: Loading Npgsql assembly and dependencies..." "Yellow"
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
                Log "    Loaded: $dep" "Gray"
            } catch {
                # Ignore if already loaded
            }
        }
    }
    
    # Now load Npgsql
    Add-Type -Path $npgsqlPath.FullName
    Log "  Assembly loaded successfully" "Green"
    
    Log "`nStep 3: Reading SQL script..." "Yellow"
    if (-not (Test-Path "module4_database_tables.sql")) {
        throw "SQL file not found: module4_database_tables.sql"
    }
    $sqlScript = Get-Content "module4_database_tables.sql" -Raw
    Log "  Read $($sqlScript.Length) bytes from SQL file" "Green"
    
    Log "`nStep 4: Connecting to Azure PostgreSQL..." "Yellow"
    $connectionString = "Host=hospitalportal-db-server.postgres.database.azure.com;Port=5432;Database=hospitalportal;Username=postgres;Password=NewPass@2026!;SSL Mode=Require;Trust Server Certificate=true;Timeout=60;Command Timeout=180"
    
    $connection = New-Object Npgsql.NpgsqlConnection($connectionString)
    $connection.Open()
    Log "  Connected to database: $($connection.Database)" "Green"
    Log "  Server version: $($connection.ServerVersion)" "Green"
    
    Log "`nStep 5: Executing migration script..." "Yellow"
    $command = $connection.CreateCommand()
    $command.CommandText = $sqlScript
    $command.CommandTimeout = 180
    
    $rowsAffected = $command.ExecuteNonQuery()
    Log "  Migration executed (rows affected: $rowsAffected)" "Green"
    
    Log "`nStep 6: Verifying table creation..." "Cyan"
    $verifyCmd = $connection.CreateCommand()
    $verifyCmd.CommandText = @"
SELECT 
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE tablename IN ('emergency_override_log', 'visitor_log')
ORDER BY tablename;
"@
    
    $reader = $verifyCmd.ExecuteReader()
    $tableCount = 0
    while ($reader.Read()) {
        $tableCount++
        $tableName = $reader.GetString(0)
        $tableSize = $reader.GetString(1)
        Log "  [OK] Table: $tableName (Size: $tableSize)" "Green"
    }
    $reader.Close()
    
    if ($tableCount -eq 0) {
        Log "  WARNING: No tables found!" "Red"
    } else {
        Log "  Created $tableCount tables" "Green"
    }
    
    Log "`nStep 7: Verifying indexes..." "Cyan"
    $indexCmd = $connection.CreateCommand()
    $indexCmd.CommandText = "SELECT COUNT(*) FROM pg_indexes WHERE tablename IN ('emergency_override_log', 'visitor_log');"
    $indexCount = $indexCmd.ExecuteScalar()
    Log "  [OK] Indexes created: $indexCount" "Green"
    
    Log "`nStep 8: Verifying RLS policies..." "Cyan"
    $rlsCmd = $connection.CreateCommand()
    $rlsCmd.CommandText = "SELECT COUNT(*) FROM pg_policies WHERE tablename IN ('emergency_override_log', 'visitor_log');"
    $policyCount = $rlsCmd.ExecuteScalar()
    Log "  [OK] RLS policies: $policyCount" "Green"
    
    Log "`nStep 9: Checking sample data..." "Cyan"
    $dataCmd1 = $connection.CreateCommand()
    $dataCmd1.CommandText = "SELECT COUNT(*) FROM emergency_override_log;"
    $overrideCount = $dataCmd1.ExecuteScalar()
    Log "  [OK] Emergency override logs: $overrideCount rows" "Green"
    
    $dataCmd2 = $connection.CreateCommand()
    $dataCmd2.CommandText = "SELECT COUNT(*) FROM visitor_log;"
    $visitorCount = $dataCmd2.ExecuteScalar()
    Log "  [OK] Visitor logs: $visitorCount rows" "Green"
    
    $connection.Close()
    
    Log "`n========================================" "Cyan"
    Log "[SUCCESS] MIGRATION COMPLETED!" "Green"
    Log "========================================" "Cyan"
    Log "Tables created: $tableCount/2" "White"
    Log "Indexes created: $indexCount/14" "White"
    Log "RLS policies: $policyCount/2" "White"
    Log "Sample data: $($overrideCount + $visitorCount) rows" "White"
    Log "`nLog file saved: $logFile" "Gray"
    
} catch {
    Log "`n[ERROR] Migration failed:" "Red"
    Log $_.Exception.Message "Red"
    if ($_.Exception.InnerException) {
        Log "Inner exception: $($_.Exception.InnerException.Message)" "Red"
    }
    Log "`nStack trace:" "Gray"
    Log "$($_.ScriptStackTrace)" "Gray"
    
    if ($connection -and $connection.State -eq 'Open') {
        $connection.Close()
    }
    
    exit 1
}
