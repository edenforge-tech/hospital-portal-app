<#
  run_all.ps1 - Consolidated Operations Script
  This single script consolidates migration, seeding, test, and dev run workflows
  It is safe to run each step independently. It replaces many of the root-level
  PowerShell scripts and provides the same functionality via named functions.
  
  Usage:
    .\run_all.ps1 -RunMigrations -SeedPermissions -RunTests -StartBackend

  Note: This file was automatically created by the consolidation tool.
#>

param(
    [switch]$RunMigrations,
    [switch]$SeedPermissions,
    [switch]$RunTests,
    [switch]$StartBackend,
    [switch]$QuickSeed
)

function Get-DbConfig {
    # Centralized DB configuration - override using env vars if required
    return @{ 
        Host = $env:DB_HOST -or "hospitalportal-db-server.postgres.database.azure.com";
        Port = $env:DB_PORT -or "5432";
        User = $env:DB_USER -or "postgres";
        Name = $env:DB_NAME -or "hospitalportal";
    }
}

function Prompt-ForPassword {
    Write-Host "Enter PostgreSQL password for user 'postgres': " -NoNewline -ForegroundColor Yellow
    $secure = Read-Host -AsSecureString
    $plain = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto([System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure))
    $env:PGPASSWORD = $plain
}

function Run-EFMigrations {
    Write-Host "▶️  Running EF Core Migrations" -ForegroundColor Cyan
    Set-Location "microservices/auth-service/AuthService"
    dotnet ef database update
    if ($LASTEXITCODE -ne 0) { Write-Host "EF migrations failed" -ForegroundColor Red; exit 1 }
    Write-Host "✅ EF Migrations applied" -ForegroundColor Green
}

function Run-SqlMigrations {
    param([string]$File = "MASTER_DATABASE_MIGRATIONS.sql")
    Write-Host "▶️  Running SQL migrations: $File" -ForegroundColor Cyan
    $cfg = Get-DbConfig
    Write-Host "Using host: $($cfg.Host), db: $($cfg.Name)" -ForegroundColor Gray
    if (-not (Test-Path $File)) { Write-Host "SQL file not found: $File" -ForegroundColor Red; exit 1 }
    & psql -h $cfg.Host -U $cfg.User -d $cfg.Name -p $cfg.Port -f $File
    if ($LASTEXITCODE -ne 0) { Write-Host "SQL migrations had errors" -ForegroundColor Red; exit 1 }
    Write-Host "✅ SQL Migrations applied" -ForegroundColor Green
}

function Run-PermissionsSeed {
    param([string]$File = "MASTER_PERMISSIONS_SEED.sql")
    Write-Host "▶️  Running Permissions Seed: $File" -ForegroundColor Cyan
    $cfg = Get-DbConfig
    if (-not (Test-Path $File)) { Write-Host "Permissions master file not found: $File" -ForegroundColor Red; exit 1 }
    & psql -h $cfg.Host -U $cfg.User -d $cfg.Name -p $cfg.Port -f $File
    if ($LASTEXITCODE -ne 0) { Write-Host "Permissions seed failed" -ForegroundColor Red; exit 1 }
    Write-Host "✅ Permissions seeded" -ForegroundColor Green
}

function Run-Tests {
    Write-Host "▶️  Running DB compliance tests" -ForegroundColor Cyan
    $cfg = Get-DbConfig
    $file = "test_database_compliance.sql"
    if (-not (Test-Path $file)) { Write-Host "Test SQL file missing: $file" -ForegroundColor Red; exit 1 }
    & psql -h $cfg.Host -U $cfg.User -d $cfg.Name -p $cfg.Port -f $file
    if ($LASTEXITCODE -ne 0) { Write-Host "Tests failed" -ForegroundColor Red; exit 1 }
    Write-Host "✅ Tests completed" -ForegroundColor Green
}

function Start-BackendDevServer {
    Write-Host "▶️  Starting Backend (dev)" -ForegroundColor Cyan
    Set-Location "microservices/auth-service/AuthService"
    dotnet run
}

function Quick-Seed {
    Write-Host "▶️  Quick seed (DB setup + sample data)" -ForegroundColor Cyan
    Prompt-ForPassword
    Run-EFMigrations
    
    # Run consolidated SQL setup (migrations + permissions + sample data)
    $setupScript = Join-Path -Path (Get-Location).Path -ChildPath "COMPLETE_DATABASE_SETUP.sql"
    if (Test-Path $setupScript) {
        Write-Host "▶️ Running complete database setup" -ForegroundColor Cyan
        $cfg = Get-DbConfig
        & psql -h $cfg.Host -U $cfg.User -d $cfg.Name -p $cfg.Port -f $setupScript
    }
    
    # Run consolidated data seeding
    $seedScript = Join-Path -Path (Get-Location).Path -ChildPath "SEED_DATA.ps1"
    if (Test-Path $seedScript) {
        Write-Host "▶️ Running data seeding" -ForegroundColor Cyan
        & $seedScript -Mode Quick
    }
}

if ($RunMigrations) { Run-Efmigrations }
if ($SeedPermissions) { Prompt-ForPassword; Run-PermissionsSeed }
if ($RunTests) { Run-Tests }
if ($StartBackend) { Start-BackendDevServer }
if ($QuickSeed) { Quick-Seed }

Write-Host "
Done. For granular operation, use -RunMigrations -SeedPermissions -RunTests -StartBackend as needed." -ForegroundColor Green
