#!/usr/bin/env pwsh
# =====================================================
# Execute Doctor Seed Script
# =====================================================
# Quick script to add 5 test doctors to the database
# =====================================================

param(
    [string]$DbHost = "hospitalportal-db-server.postgres.database.azure.com",
    [string]$DbPort = "5432",
    [string]$DbUser = "postgres",
    [string]$DbName = "hospitalportal",
    [string]$SqlFile = "seed_test_doctors.sql"
)

function Main {
    Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "  Quick Doctor Seed - Counselor Module" -ForegroundColor Cyan
    Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
    Write-Host ""
    
    # Check if SQL file exists
    if (-not (Test-Path $SqlFile)) {
        Write-Host "❌ SQL file not found: $SqlFile" -ForegroundColor Red
        Write-Host "   Please ensure you're running this from the project root directory" -ForegroundColor Yellow
        exit 1
    }
    
    Write-Host "📄 SQL Script: $SqlFile" -ForegroundColor Gray
    Write-Host "🗄️  Database: $DbHost/$DbName" -ForegroundColor Gray
    Write-Host ""
    
    # Prompt for password
    Write-Host "🔐 Enter PostgreSQL password for user '$DbUser': " -NoNewline -ForegroundColor Yellow
    $securePassword = Read-Host -AsSecureString
    $plainPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto([System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword))
    $env:PGPASSWORD = $plainPassword
    
    Write-Host ""
    Write-Host "⏳ Executing SQL script..." -ForegroundColor Cyan
    
    # Execute the SQL file
    & psql -h $DbHost -U $DbUser -d $DbName -p $DbPort -f $SqlFile
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "═══════════════════════════════════════" -ForegroundColor Green
        Write-Host "  ✅ SUCCESS - Doctors Created!" -ForegroundColor Green
        Write-Host "═══════════════════════════════════════" -ForegroundColor Green
        Write-Host ""
        Write-Host "🩺 5 doctors added to your tenant:" -ForegroundColor Green
        Write-Host "   • Dr. James Anderson (Ophthalmologist)" -ForegroundColor White
        Write-Host "   • Dr. Sarah Johnson (Retina Specialist)" -ForegroundColor White
        Write-Host "   • Dr. Rajesh Kumar (Cataract Surgeon)" -ForegroundColor White
        Write-Host "   • Dr. Maria Garcia (Glaucoma Specialist)" -ForegroundColor White
        Write-Host "   • Dr. Jennifer Taylor (Optometrist)" -ForegroundColor White
        Write-Host ""
        Write-Host "🔍 Try searching for:" -ForegroundColor Cyan
        Write-Host "   • 'james' or 'ja'" -ForegroundColor Yellow
        Write-Host "   • 'sarah' or 'sa'" -ForegroundColor Yellow
        Write-Host "   • 'rajesh' or 'ra'" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "🔑 Password for all doctors: Test@123456" -ForegroundColor Gray
        Write-Host ""
    } else {
        Write-Host ""
        Write-Host "❌ SQL execution failed with exit code: $LASTEXITCODE" -ForegroundColor Red
        Write-Host "   Check the error messages above for details" -ForegroundColor Yellow
        exit 1
    }
    
    # Clear password from environment
    Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
}

# Run the main function
Main
