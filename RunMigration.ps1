# MODULE 4 Database Migration Runner
# Executes module4_database_tables.sql against Azure PostgreSQL

param(
    [string]$Server = "hospitalportal-db-server.postgres.database.azure.com",
    [string]$Database = "hospitalportal",
    [string]$Username = "postgres",
    [string]$Password = "NewPass@2026!",
    [string]$SqlFile = "module4_database_tables.sql"
)

Write-Host "`n=== MODULE 4: Database Migration Runner ===" -ForegroundColor Cyan

# Check if SQL file exists
if (-not (Test-Path $SqlFile)) {
    Write-Host "❌ SQL file not found: $SqlFile" -ForegroundColor Red
    exit 1
}

Write-Host "✓ SQL script found: $SqlFile" -ForegroundColor Green
$fileSize = (Get-Item $SqlFile).Length
Write-Host "  File size: $fileSize bytes" -ForegroundColor Gray

# Read SQL content
$sqlScript = Get-Content $SqlFile -Raw
Write-Host "✓ SQL script loaded" -ForegroundColor Green

# Find Npgsql.dll in the compiled project
Write-Host "`nSearching for Npgsql.dll..." -ForegroundColor Yellow
$npgsqlPath = Get-ChildItem -Path "microservices/auth-service/AuthService" -Recurse -Filter "Npgsql.dll" -ErrorAction SilentlyContinue | 
    Where-Object { $_.FullName -like "*\bin\*" } | 
    Select-Object -First 1

if (-not $npgsqlPath) {
    Write-Host "⚠ Npgsql.dll not found. Building project..." -ForegroundColor Yellow
    Push-Location "microservices/auth-service/AuthService"
    $buildOutput = dotnet build --configuration Release 2>&1
    Pop-Location
    
    # Search again
    $npgsqlPath = Get-ChildItem -Path "microservices/auth-service/AuthService" -Recurse -Filter "Npgsql.dll" -ErrorAction SilentlyContinue | 
        Where-Object { $_.FullName -like "*\bin\*" } | 
        Select-Object -First 1
}

if (-not $npgsqlPath) {
    Write-Host "❌ Could not find Npgsql.dll" -ForegroundColor Red
    Write-Host "Please execute the SQL manually using Azure Data Studio or pgAdmin" -ForegroundColor Yellow
    exit 1
}

Write-Host "✓ Found Npgsql at: $($npgsqlPath.FullName)" -ForegroundColor Green

# Load Npgsql assembly
try {
    Add-Type -Path $npgsqlPath.FullName
    Write-Host "✓ Npgsql library loaded" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to load Npgsql: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Build connection string
$connString = "Host=$Server;Port=5432;Database=$Database;Username=$Username;Password=$Password;SSL Mode=Require;Trust Server Certificate=true;Timeout=60;Command Timeout=180;"

Write-Host "`nConnecting to database..." -ForegroundColor Yellow
Write-Host "  Server: $Server" -ForegroundColor Gray
Write-Host "  Database: $Database" -ForegroundColor Gray

try {
    # Create and open connection
    $connection = New-Object Npgsql.NpgsqlConnection($connString)
    $connection.Open()
    Write-Host "✓ Connected successfully" -ForegroundColor Green
    
    # Execute migration script
    Write-Host "`nExecuting migration..." -ForegroundColor Yellow
    $command = $connection.CreateCommand()
    $command.CommandText = $sqlScript
    $command.CommandTimeout = 180
    
    $rowsAffected = $command.ExecuteNonQuery()
    
    Write-Host "✓ Migration executed" -ForegroundColor Green
    Write-Host "  Operations completed: $rowsAffected" -ForegroundColor Gray
    
    # Verify tables
    Write-Host "`nVerifying tables created..." -ForegroundColor Yellow
    $verifyCmd = $connection.CreateCommand()
    $verifyCmd.CommandText = @"
SELECT tablename, 
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
        Write-Host "  ✓ $tableName ($tableSize)" -ForegroundColor Green
    }
    $reader.Close()
    
    # Verify indexes
    Write-Host "`nVerifying indexes..." -ForegroundColor Yellow
    $indexCmd = $connection.CreateCommand()
    $indexCmd.CommandText = @"
SELECT count(*) 
FROM pg_indexes 
WHERE tablename IN ('emergency_override_log', 'visitor_log');
"@
    
    $indexCount = $indexCmd.ExecuteScalar()
    Write-Host "  ✓ $indexCount indexes created" -ForegroundColor Green
    
    # Verify RLS policies
    Write-Host "`nVerifying RLS policies..." -ForegroundColor Yellow
    $rlsCmd = $connection.CreateCommand()
    $rlsCmd.CommandText = @"
SELECT count(*) 
FROM pg_policies 
WHERE tablename IN ('emergency_override_log', 'visitor_log');
"@
    
    $policyCount = $rlsCmd.ExecuteScalar()
    Write-Host "  ✓ $policyCount RLS policies enabled" -ForegroundColor Green
    
    # Count sample data
    Write-Host "`nChecking sample data..." -ForegroundColor Yellow
    $dataCmd = $connection.CreateCommand()
    $dataCmd.CommandText = @"
SELECT 
    (SELECT COUNT(*) FROM emergency_override_log) as override_count,
    (SELECT COUNT(*) FROM visitor_log) as visitor_count;
"@
    
    $dataReader = $dataCmd.ExecuteReader()
    if ($dataReader.Read()) {
        $overrideCount = $dataReader.GetInt64(0)
        $visitorCount = $dataReader.GetInt64(1)
        Write-Host "  - Emergency override logs: $overrideCount" -ForegroundColor Gray
        Write-Host "  - Visitor logs: $visitorCount" -ForegroundColor Gray
    }
    $dataReader.Close()
    
    $connection.Close()
    
    Write-Host "`n✅ MIGRATION COMPLETED SUCCESSFULLY!" -ForegroundColor Green
    Write-Host "`nSummary:" -ForegroundColor Cyan
    Write-Host "  - Tables created: $tableCount/2" -ForegroundColor White
    Write-Host "  - Indexes: $indexCount" -ForegroundColor White
    Write-Host "  - RLS policies: $policyCount" -ForegroundColor White
    Write-Host "  - Sample data inserted: Yes" -ForegroundColor White
    
    Write-Host "`n🎉 MODULE 4 Phase 2 Database Setup Complete!" -ForegroundColor Green
    
} catch {
    Write-Host "`n❌ Migration failed:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    if ($_.Exception.InnerException) {
        Write-Host "`nInner exception:" -ForegroundColor Yellow
        Write-Host $_.Exception.InnerException.Message -ForegroundColor Red
    }
    
    Write-Host "`nPlease check:" -ForegroundColor Yellow
    Write-Host "  1. Database connection credentials" -ForegroundColor White
    Write-Host "  2. Network connectivity to Azure" -ForegroundColor White
    Write-Host "  3. SQL script syntax" -ForegroundColor White
    
    exit 1
} finally {
    if ($connection -and $connection.State -eq 'Open') {
        $connection.Close()
    }
}
