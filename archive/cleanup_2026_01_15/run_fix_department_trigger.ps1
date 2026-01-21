# FIX: Department Access Trigger

$ErrorActionPreference = "Stop"

$connString = "Host=hospitalportal-db-server.postgres.database.azure.com;Port=5432;Database=hospitalportal;Username=postgres;Password=Eden@#$0606;SSL Mode=Require;Trust Server Certificate=true;Timeout=60;Command Timeout=60;"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  FIX DEPARTMENT ACCESS TRIGGER" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

try {
    # Load Npgsql assembly
    Add-Type -Path "C:\Users\Sam Aluri\.nuget\packages\npgsql\8.0.3\lib\net8.0\Npgsql.dll"
    
    Write-Host "Connecting to Azure PostgreSQL..." -ForegroundColor Yellow
    $connection = New-Object Npgsql.NpgsqlConnection($connString)
    $connection.Open()
    Write-Host "Connected successfully!`n" -ForegroundColor Green

    # Read SQL file
    $sqlFile = Join-Path $PSScriptRoot "fix_department_access_trigger.sql"
    Write-Host "Reading SQL file: $sqlFile" -ForegroundColor Yellow
    $sql = Get-Content $sqlFile -Raw

    # Execute
    Write-Host "Executing trigger fix..." -ForegroundColor Yellow
    $command = $connection.CreateCommand()
    $command.CommandText = $sql
    $command.CommandTimeout = 120
    $result = $command.ExecuteNonQuery()

    Write-Host "Trigger fixed successfully!`n" -ForegroundColor Green

    # Verify
    Write-Host "Verifying trigger..." -ForegroundColor Yellow
    $verifyCommand = $connection.CreateCommand()
    $verifyCommand.CommandText = "SELECT trigger_name, event_manipulation, event_object_table, action_timing FROM information_schema.triggers WHERE trigger_name = 'trg_audit_department_access_changes';"
    
    $reader = $verifyCommand.ExecuteReader()
    if ($reader.Read()) {
        Write-Host "Trigger verified!" -ForegroundColor Green
        Write-Host "  Name: $($reader['trigger_name'])" -ForegroundColor Gray
        Write-Host "  Event: $($reader['event_manipulation'])" -ForegroundColor Gray
        Write-Host "  Table: $($reader['event_object_table'])" -ForegroundColor Gray
        Write-Host "  Timing: $($reader['action_timing'])" -ForegroundColor Gray
    } else {
        Write-Host "WARNING: Trigger not found after creation!" -ForegroundColor Red
    }
    $reader.Close()

    $connection.Close()
    Write-Host "`nAll done! Department assignment should now work.`n" -ForegroundColor Green

} catch {
    Write-Host "`nERROR occurred:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}
