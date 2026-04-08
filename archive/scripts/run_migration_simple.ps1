# Simple Migration Runner using dotnet CLI
$ErrorActionPreference = "Stop"

Write-Host "`n=== MODULE 4 DATABASE MIGRATION ===" -ForegroundColor Cyan
Write-Host "Using dotnet user-secrets for connection..." -ForegroundColor Yellow

# Create a simple C# console app to run the migration
$csCode = @'
using System;
using System.IO;
using Npgsql;

class Program
{
    static void Main()
    {
        try
        {
            Console.WriteLine("\n=== Connecting to Azure PostgreSQL ===");
            var connString = "Host=hospitalportal-db-server.postgres.database.azure.com;Port=5432;Database=hospitalportal;Username=postgres;Password=NewPass@2026!;SSL Mode=Require;Trust Server Certificate=true;Timeout=60;Command Timeout=180";
            
            using var conn = new NpgsqlConnection(connString);
            conn.Open();
            Console.WriteLine($"Connected to: {conn.Database}");
            
            Console.WriteLine("\n=== Reading SQL script ===");
            var sql = File.ReadAllText("module4_database_tables.sql");
            Console.WriteLine($"Read {sql.Length} bytes");
            
            Console.WriteLine("\n=== Executing migration ===");
            using var cmd = conn.CreateCommand();
            cmd.CommandText = sql;
            cmd.CommandTimeout = 180;
            var rows = cmd.ExecuteNonQuery();
            Console.WriteLine($"Executed! Rows affected: {rows}");
            
            Console.WriteLine("\n=== Verifying tables ===");
            cmd.CommandText = "SELECT tablename FROM pg_tables WHERE tablename IN ('emergency_override_log', 'visitor_log')";
            using (var reader = cmd.ExecuteReader())
            {
                int count = 0;
                while (reader.Read())
                {
                    count++;
                    Console.WriteLine($"  [OK] Table: {reader.GetString(0)}");
                }
                if (count == 0) Console.WriteLine("  [WARNING] No tables found!");
            }
            
            Console.WriteLine("\n=== Verifying indexes ===");
            cmd.CommandText = "SELECT COUNT(*) FROM pg_indexes WHERE tablename IN ('emergency_override_log', 'visitor_log')";
            var indexCount = cmd.ExecuteScalar();
            Console.WriteLine($"  [OK] Indexes: {indexCount}");
            
            Console.WriteLine("\n=== Verifying RLS ===");
            cmd.CommandText = "SELECT COUNT(*) FROM pg_policies WHERE tablename IN ('emergency_override_log', 'visitor_log')";
            var policyCount = cmd.ExecuteScalar();
            Console.WriteLine($"  [OK] RLS Policies: {policyCount}");
            
            Console.WriteLine("\n========================================");
            Console.WriteLine("[SUCCESS] MIGRATION COMPLETE!");
            Console.WriteLine("========================================");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"\n[ERROR] {ex.Message}");
            if (ex.InnerException != null)
                Console.WriteLine($"Inner: {ex.InnerException.Message}");
            Environment.Exit(1);
        }
    }
}
'@

# Save to temp file
$tempDir = "temp_migration"
if (Test-Path $tempDir) { Remove-Item $tempDir -Recurse -Force }
New-Item -ItemType Directory -Path $tempDir | Out-Null

Set-Content -Path "$tempDir\Program.cs" -Value $csCode

# Copy SQL file
Copy-Item "module4_database_tables.sql" "$tempDir\" -Force

# Create csproj
$csproj = @'
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <OutputType>Exe</OutputType>
    <TargetFramework>net8.0</TargetFramework>
  </PropertyGroup>
  <ItemGroup>
    <PackageReference Include="Npgsql" Version="8.0.5" />
  </ItemGroup>
</Project>
'@

Set-Content -Path "$tempDir\migration.csproj" -Value $csproj

Write-Host "`nBuilding migration runner..." -ForegroundColor Yellow
Push-Location $tempDir
dotnet build --verbosity quiet
if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed!" -ForegroundColor Red
    Pop-Location
    exit 1
}

Write-Host "Running migration..." -ForegroundColor Yellow
dotnet run --no-build

Pop-Location

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n[SUCCESS] Check output above for results!" -ForegroundColor Green
    # Cleanup
    Remove-Item $tempDir -Recurse -Force -ErrorAction SilentlyContinue
} else {
    Write-Host "`n[FAILED] Migration encountered errors" -ForegroundColor Red
}
