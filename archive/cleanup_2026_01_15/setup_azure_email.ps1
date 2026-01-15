# Azure Communication Services Setup Script
# This script helps you create and configure Azure Communication Services for email delivery

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "Azure Communication Services Email Setup" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# Check if Azure CLI is installed
Write-Host "Checking for Azure CLI..." -ForegroundColor Yellow
try {
    $azVersion = az --version 2>&1 | Select-Object -First 1
    Write-Host "✓ Azure CLI found: $azVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Azure CLI not found. Please install from: https://aka.ms/installazurecliwindows" -ForegroundColor Red
    exit 1
}

# Login to Azure
Write-Host ""
Write-Host "Logging in to Azure..." -ForegroundColor Yellow
az login
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Azure login failed" -ForegroundColor Red
    exit 1
}

# Get subscription
Write-Host ""
Write-Host "Getting Azure subscription..." -ForegroundColor Yellow
$subscription = az account show --query "{Name:name, Id:id}" -o json | ConvertFrom-Json
Write-Host "✓ Using subscription: $($subscription.Name) ($($subscription.Id))" -ForegroundColor Green

# Get resource groups
Write-Host ""
Write-Host "Available resource groups:" -ForegroundColor Yellow
$resourceGroups = az group list --query "[].{Name:name, Location:location}" -o json | ConvertFrom-Json
$resourceGroups | ForEach-Object { Write-Host "  - $($_.Name) ($($_.Location))" }

# Prompt for resource group
Write-Host ""
$resourceGroupName = Read-Host "Enter resource group name (or press Enter to create new)"

if ([string]::IsNullOrWhiteSpace($resourceGroupName)) {
    $resourceGroupName = "hospital-portal-rg"
    $location = "eastus"
    Write-Host "Creating new resource group: $resourceGroupName in $location..." -ForegroundColor Yellow
    az group create --name $resourceGroupName --location $location
    Write-Host "✓ Resource group created" -ForegroundColor Green
}

# Create Communication Services resource
$communicationServiceName = "hospital-portal-email-$(Get-Random -Minimum 1000 -Maximum 9999)"
Write-Host ""
Write-Host "Creating Communication Services resource: $communicationServiceName..." -ForegroundColor Yellow
az communication create `
    --name $communicationServiceName `
    --resource-group $resourceGroupName `
    --location "global" `
    --data-location "UnitedStates"

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to create Communication Services resource" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Communication Services resource created" -ForegroundColor Green

# Get connection string
Write-Host ""
Write-Host "Getting connection string..." -ForegroundColor Yellow
$connectionString = az communication list-key `
    --name $communicationServiceName `
    --resource-group $resourceGroupName `
    --query "primaryConnectionString" -o tsv

if ([string]::IsNullOrWhiteSpace($connectionString)) {
    Write-Host "✗ Failed to get connection string" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Connection string retrieved" -ForegroundColor Green

# Create Email Communication Service
$emailServiceName = "hospital-portal-email-domain-$(Get-Random -Minimum 1000 -Maximum 9999)"
Write-Host ""
Write-Host "Creating Email Communication Service: $emailServiceName..." -ForegroundColor Yellow
az communication email create `
    --name $emailServiceName `
    --resource-group $resourceGroupName `
    --location "global" `
    --data-location "UnitedStates"

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to create Email Communication Service" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Email Communication Service created" -ForegroundColor Green

# Create Azure Managed Domain
Write-Host ""
Write-Host "Provisioning Azure Managed Domain (*.azurecomm.net)..." -ForegroundColor Yellow
Write-Host "NOTE: This may take a few minutes..." -ForegroundColor Cyan

$domainName = az communication email domain create `
    --domain-name "AzureManagedDomain" `
    --email-service-name $emailServiceName `
    --resource-group $resourceGroupName `
    --location "global" `
    --query "mailFromSenderDomain" -o tsv

if ([string]::IsNullOrWhiteSpace($domainName)) {
    Write-Host "✗ Failed to create Azure Managed Domain" -ForegroundColor Red
    Write-Host "You may need to create it manually via Azure Portal:" -ForegroundColor Yellow
    Write-Host "1. Go to portal.azure.com" -ForegroundColor Yellow
    Write-Host "2. Navigate to: $emailServiceName" -ForegroundColor Yellow
    Write-Host "3. Click 'Provision Domains' > 'Add a free Azure subdomain'" -ForegroundColor Yellow
} else {
    Write-Host "✓ Azure Managed Domain created: $domainName" -ForegroundColor Green
}

# Link Email Domain to Communication Service
Write-Host ""
Write-Host "Linking email domain to communication service..." -ForegroundColor Yellow
az communication update `
    --name $communicationServiceName `
    --resource-group $resourceGroupName `
    --tags EmailDomain=$emailServiceName

# Output configuration
Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Configuration for local.settings.json:" -ForegroundColor Yellow
Write-Host ""
Write-Host '"AzureCommunication__ConnectionString": "' -NoNewline -ForegroundColor White
Write-Host "$connectionString" -NoNewline -ForegroundColor Cyan
Write-Host '",' -ForegroundColor White
Write-Host '"AzureCommunication__FromEmail": "' -NoNewline -ForegroundColor White
Write-Host "DoNotReply@$domainName" -NoNewline -ForegroundColor Cyan
Write-Host '",' -ForegroundColor White
Write-Host '"AzureCommunication__FromName": "' -NoNewline -ForegroundColor White
Write-Host "Hospital Portal" -NoNewline -ForegroundColor Cyan
Write-Host '"' -ForegroundColor White
Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Copy the configuration above to:" -ForegroundColor White
Write-Host "   microservices/notification-service/NotificationService/local.settings.json" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Remove Resend configuration lines:" -ForegroundColor White
Write-Host '   - "Resend__ApiKey"' -ForegroundColor DarkGray
Write-Host '   - "Resend__FromEmail"' -ForegroundColor DarkGray
Write-Host '   - "Resend__FromName"' -ForegroundColor DarkGray
Write-Host ""
Write-Host "3. Install Azure Communication Services package:" -ForegroundColor White
Write-Host '   cd "microservices/notification-service/NotificationService"' -ForegroundColor Cyan
Write-Host '   dotnet add package Azure.Communication.Email' -ForegroundColor Cyan
Write-Host ""
Write-Host "4. Restart notification service:" -ForegroundColor White
Write-Host '   func start' -ForegroundColor Cyan
Write-Host ""
Write-Host "5. Test activation flow via frontend" -ForegroundColor White
Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Cost Information:" -ForegroundColor Yellow
Write-Host "- First 5,000 emails/month: FREE" -ForegroundColor Green
Write-Host "- Additional emails: `$0.00025 each (~`$0.25 per 1,000)" -ForegroundColor Green
Write-Host "- Estimated monthly cost for 10,000 OTPs: ~`$1.25" -ForegroundColor Green
Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
