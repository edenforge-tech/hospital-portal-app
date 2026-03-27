# Execute Imaging Orders Migration
$ErrorActionPreference = "Stop"

Write-Host "`n=== IMAGING ORDERS TABLE MIGRATION ===" -ForegroundColor Cyan
Write-Host "Date: February 20, 2026" -ForegroundColor Yellow
Write-Host "Description: Create imaging_orders table + add pin_hash to users" -ForegroundColor Yellow

# Create temporary C# program to execute migration
$csCode = @'
using System;
using System.IO;
using Npgsql;

class Program
{
    static void Main(string[] args)
    {
        if (args.Length == 0)
        {
            Console.WriteLine("Error: SQL file path required as argument");
            Environment.Exit(1);
        }
        
        var sqlFilePath = args[0];
        
        try
        {
            Console.WriteLine("\n=== Connecting to Azure PostgreSQL ===");
            var connString = "Host=hospitalportal-db-server.postgres.database.azure.com;Port=5432;Database=hospitalportal;Username=postgres;Password=NewPass@2026!;SSL Mode=Require;Trust Server Certificate=true;Timeout=60;Command Timeout=180";
            
            using var conn = new NpgsqlConnection(connString);
            conn.Open();
            Console.WriteLine($"Connected to: {conn.Database}");
            
            Console.WriteLine("\n=== Reading migration SQL ===");
            var sql = File.ReadAllText(sqlFilePath);
            Console.WriteLine($"Read {sql.Length} bytes");
            
            Console.WriteLine("\n=== Executing migration ===");
            using var cmd = conn.CreateCommand();
            cmd.CommandText = sql;
            cmd.CommandTimeout = 180;
            var rows = cmd.ExecuteNonQuery();
            Console.WriteLine($"Migration executed! Rows affected: {rows}");
            
            Console.WriteLine("\n=== Verifying imaging_orders table ===");
            cmd.CommandText = @"
                SELECT 
                    table_name,
                    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'imaging_orders') as column_count,
                    (SELECT COUNT(*) FROM pg_indexes WHERE tablename = 'imaging_orders') as index_count
                FROM information_schema.tables 
                WHERE table_name = 'imaging_orders'
            ";
            
            using (var reader = cmd.ExecuteReader())
            {
                if (reader.Read())
                {
                    Console.WriteLine($"  Table: {reader.GetString(0)}");
                    Console.WriteLine($"  Columns: {reader.GetInt64(1)}");
                    Console.WriteLine($"  Indexes: {reader.GetInt64(2)}");
                }
                else
                {
                    Console.WriteLine("  Table not found!");
                    Environment.Exit(1);
                }
            }
            
            Console.WriteLine("\n=== Verifying pin_hash column ===");
            cmd.CommandText = @"
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = 'users' AND column_name = 'pin_hash'
            ";
            
            using (var reader = cmd.ExecuteReader())
            {
                if (reader.Read())
                {
                    Console.WriteLine($"  Column: {reader.GetString(0)} ({reader.GetString(1)})");
                }
                else
                {
                    Console.WriteLine("  pin_hash column not found (might already exist)");
                }
            }
            
            Console.WriteLine("\n=== Verifying RLS policy ===");
            cmd.CommandText = @"
                SELECT COUNT(*) 
                FROM pg_policies 
                WHERE tablename = 'imaging_orders'
            ";
            var policyCount = cmd.ExecuteScalar();
            Console.WriteLine($"  RLS Policies: {policyCount}");
            
            Console.WriteLine("\n========================================");
            Console.WriteLine("MIGRATION COMPLETED SUCCESSFULLY");
            Console.WriteLine("========================================\n");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"\nError: {ex.Message}");
            Console.WriteLine($"Stack: {ex.StackTrace}");
            Environment.Exit(1);
        }
    }
}
'@

# Create temp directory
$tempDir = [System.IO.Path]::GetTempPath()
$projectDir = Join-Path $tempDir "ImagingOrdersMigration"
Remove-Item -Path $projectDir -Recurse -Force -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Path $projectDir -Force | Out-Null

# Create project file
$csprojContent = @'
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <OutputType>Exe</OutputType>
    <TargetFramework>net8.0</TargetFramework>
    <Nullable>enable</Nullable>
  </PropertyGroup>
  <ItemGroup>
    <PackageReference Include="Npgsql" Version="8.0.1" />
  </ItemGroup>
</Project>
'@

Set-Content -Path (Join-Path $projectDir "Program.csproj") -Value $csprojContent
Set-Content -Path (Join-Path $projectDir "Program.cs") -Value $csCode

Write-Host "Building migration runner..." -ForegroundColor Yellow
Push-Location $projectDir
try {
    dotnet build --verbosity quiet
    if ($LASTEXITCODE -ne 0) { throw "Build failed" }
    
    Write-Host "`n=== Running migration ===" -ForegroundColor Cyan
    $sqlFilePath = Resolve-Path "$PSScriptRoot\migrations\35_imaging_orders_and_pin_hash.sql"
    dotnet run --no-build -- "$sqlFilePath"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n" -NoNewline
        Write-Host "Migration completed successfully!" -ForegroundColor Green
        Write-Host "`n" -NoNewline
        Write-Host "Next Steps:" -ForegroundColor Cyan
        Write-Host "  1. Test finalization endpoint: POST /api/examinations/{id}/finalize" -ForegroundColor White
        Write-Host "  2. Test imaging orders: POST /api/imaging/order" -ForegroundColor White
        Write-Host "  3. Configure DICOM storage integration" -ForegroundColor White
        Write-Host "  4. Set up PIN management for users" -ForegroundColor White
    } else {
        Write-Host "`nMigration failed!" -ForegroundColor Red
        exit 1
    }
}
finally {
    Pop-Location
    # Cleanup
    Remove-Item -Path $projectDir -Recurse -Force -ErrorAction SilentlyContinue
}
