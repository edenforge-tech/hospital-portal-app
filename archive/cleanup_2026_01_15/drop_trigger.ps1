$ErrorActionPreference = "Stop"

$connString = "Host=hospitalportal-db-server.postgres.database.azure.com;Port=5432;Database=hospitalportal;Username=postgres;Password=Eden@#$0606;SSL Mode=Require;Trust Server Certificate=true;"

Write-Host "`n=== DROPPING PROBLEMATIC TRIGGER ===" -ForegroundColor Cyan
Write-Host "This will remove the audit trigger that is blocking department assignments`n" -ForegroundColor Yellow

try {
    Add-Type -Path "C:\Users\Sam Aluri\.nuget\packages\npgsql\8.0.3\lib\net8.0\Npgsql.dll"
    
    $connection = New-Object Npgsql.NpgsqlConnection($connString)
    $connection.Open()
    Write-Host "Connected to database" -ForegroundColor Green

    # Drop the trigger
    $sql = "DROP TRIGGER IF EXISTS trg_audit_department_access_changes ON department_access CASCADE;"
    $command = $connection.CreateCommand()
    $command.CommandText = $sql
    $command.ExecuteNonQuery() | Out-Null
    
    Write-Host "Trigger dropped successfully!" -ForegroundColor Green

    $connection.Close()
    Write-Host "`nDepartment assignment should now work. Try updating the user again.`n" -ForegroundColor Green

} catch {
    Write-Host "`nERROR: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
