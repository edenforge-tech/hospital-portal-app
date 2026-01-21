# Quick Start - Azure Email Setup
# This script performs all necessary steps to switch to Azure Communication Services

param(
    [switch]$SkipAzureSetup,
    [switch]$Help
)

if ($Help) {
    Write-Host @"
Azure Email Quick Start Script

Usage:
  .\quick_start_azure_email.ps1           # Full setup (Azure + code)
  .\quick_start_azure_email.ps1 -SkipAzureSetup  # Only install package & update config

Steps performed:
  1. Install Azure.Communication.Email NuGet package
  2. Run Azure setup script (unless -SkipAzureSetup)
  3. Prompt for configuration values
  4. Update local.settings.json
  5. Restart notification service
  6. Test email sending

"@
    exit 0
}

$ErrorActionPreference = "Stop"

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "Hospital Portal - Azure Email Quick Start" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Install NuGet Package
Write-Host "[Step 1/5] Installing Azure.Communication.Email package..." -ForegroundColor Yellow
$notificationServicePath = "c:\Users\Sam Aluri\Downloads\Hospital Portal\microservices\notification-service\NotificationService"

if (!(Test-Path $notificationServicePath)) {
    Write-Host "✗ Notification service path not found: $notificationServicePath" -ForegroundColor Red
    exit 1
}

Push-Location $notificationServicePath
try {
    dotnet add package Azure.Communication.Email
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Package installed successfully" -ForegroundColor Green
    } else {
        Write-Host "✗ Package installation failed" -ForegroundColor Red
        exit 1
    }
} finally {
    Pop-Location
}

# Step 2: Run Azure Setup (optional)
if (!$SkipAzureSetup) {
    Write-Host ""
    Write-Host "[Step 2/5] Running Azure Communication Services setup..." -ForegroundColor Yellow
    Write-Host "NOTE: This will open Azure login in browser" -ForegroundColor Cyan
    Write-Host ""
    
    $runSetup = Read-Host "Run Azure setup script now? (Y/N)"
    if ($runSetup -eq "Y" -or $runSetup -eq "y") {
        $setupScriptPath = "c:\Users\Sam Aluri\Downloads\Hospital Portal\setup_azure_email.ps1"
        if (Test-Path $setupScriptPath) {
            & $setupScriptPath
        } else {
            Write-Host "✗ Setup script not found: $setupScriptPath" -ForegroundColor Red
            Write-Host "Continuing with manual configuration..." -ForegroundColor Yellow
        }
    } else {
        Write-Host "Skipping Azure setup - you'll need to configure manually" -ForegroundColor Yellow
    }
} else {
    Write-Host ""
    Write-Host "[Step 2/5] Skipping Azure setup (as requested)" -ForegroundColor Yellow
}

# Step 3: Get Configuration Values
Write-Host ""
Write-Host "[Step 3/5] Configuration Setup" -ForegroundColor Yellow
Write-Host ""

$connectionString = Read-Host "Enter Azure Communication Services Connection String"
$fromEmail = Read-Host "Enter From Email (e.g., DoNotReply@yourXXXX.azurecomm.net)"
$fromName = Read-Host "Enter From Name (default: Hospital Portal)"

if ([string]::IsNullOrWhiteSpace($fromName)) {
    $fromName = "Hospital Portal"
}

# Step 4: Update local.settings.json
Write-Host ""
Write-Host "[Step 4/5] Updating local.settings.json..." -ForegroundColor Yellow

$localSettingsPath = Join-Path $notificationServicePath "local.settings.json"

if (!(Test-Path $localSettingsPath)) {
    Write-Host "✗ local.settings.json not found: $localSettingsPath" -ForegroundColor Red
    exit 1
}

$localSettings = Get-Content $localSettingsPath -Raw | ConvertFrom-Json

# Remove Resend configuration
if ($localSettings.Values.PSObject.Properties.Name -contains "Resend__ApiKey") {
    $localSettings.Values.PSObject.Properties.Remove("Resend__ApiKey")
    Write-Host "  - Removed Resend__ApiKey" -ForegroundColor DarkGray
}
if ($localSettings.Values.PSObject.Properties.Name -contains "Resend__FromEmail") {
    $localSettings.Values.PSObject.Properties.Remove("Resend__FromEmail")
    Write-Host "  - Removed Resend__FromEmail" -ForegroundColor DarkGray
}
if ($localSettings.Values.PSObject.Properties.Name -contains "Resend__FromName") {
    $localSettings.Values.PSObject.Properties.Remove("Resend__FromName")
    Write-Host "  - Removed Resend__FromName" -ForegroundColor DarkGray
}

# Add Azure Communication Services configuration
$localSettings.Values | Add-Member -MemberType NoteProperty -Name "AzureCommunication__ConnectionString" -Value $connectionString -Force
$localSettings.Values | Add-Member -MemberType NoteProperty -Name "AzureCommunication__FromEmail" -Value $fromEmail -Force
$localSettings.Values | Add-Member -MemberType NoteProperty -Name "AzureCommunication__FromName" -Value $fromName -Force

Write-Host "  + Added AzureCommunication__ConnectionString" -ForegroundColor Green
Write-Host "  + Added AzureCommunication__FromEmail: $fromEmail" -ForegroundColor Green
Write-Host "  + Added AzureCommunication__FromName: $fromName" -ForegroundColor Green

# Save configuration
$localSettings | ConvertTo-Json -Depth 10 | Set-Content $localSettingsPath
Write-Host "✓ Configuration updated successfully" -ForegroundColor Green

# Step 5: Restart Notification Service
Write-Host ""
Write-Host "[Step 5/5] Restarting Notification Service..." -ForegroundColor Yellow
Write-Host ""
Write-Host "MANUAL STEP REQUIRED:" -ForegroundColor Cyan
Write-Host "1. Find the terminal running notification service (func start)" -ForegroundColor White
Write-Host "2. Press Ctrl+C to stop it" -ForegroundColor White
Write-Host "3. Run this command in that terminal:" -ForegroundColor White
Write-Host ""
Write-Host '   cd "c:\Users\Sam Aluri\Downloads\Hospital Portal\microservices\notification-service\NotificationService"' -ForegroundColor Cyan
Write-Host '   func start' -ForegroundColor Cyan
Write-Host ""
Write-Host "4. Look for this log line to confirm Azure email is configured:" -ForegroundColor White
Write-Host "   [INFO] AzureEmailService initialized - From: $fromEmail ($fromName)" -ForegroundColor Cyan
Write-Host ""

# Summary
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Summary:" -ForegroundColor Yellow
Write-Host "✓ Azure.Communication.Email package installed" -ForegroundColor Green
Write-Host "✓ local.settings.json updated with Azure configuration" -ForegroundColor Green
Write-Host "✓ Resend configuration removed" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Restart notification service (see instructions above)" -ForegroundColor White
Write-Host "2. Test activation flow:" -ForegroundColor White
Write-Host "   - Login to http://localhost:3001" -ForegroundColor Cyan
Write-Host "   - Go to Users → Find sam@test.com → Click Activate" -ForegroundColor Cyan
Write-Host "   - Send activation email" -ForegroundColor Cyan
Write-Host ""
Write-Host "Troubleshooting:" -ForegroundColor Yellow
Write-Host "- If email fails, check notification service logs" -ForegroundColor White
Write-Host "- Verify Azure domain is provisioned (5-10 min wait)" -ForegroundColor White
Write-Host "- Review: AZURE_EMAIL_MIGRATION_GUIDE.md" -ForegroundColor White
Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
