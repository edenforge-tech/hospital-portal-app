# Hospital Portal - Azure Deployment Script
# Deploys infrastructure and application to Azure

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("dev", "staging", "prod")]
    [string]$Environment,
    
    [Parameter(Mandatory=$false)]
    [string]$ResourceGroupName = "hospital-portal-$Environment-rg",
    
    [Parameter(Mandatory=$false)]
    [string]$Location = "eastus",
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipInfrastructure,
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipBackend,
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipFrontend,
    
    [Parameter(Mandatory=$false)]
    [switch]$RunMigrations
)

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Hospital Portal - Azure Deployment" -ForegroundColor Cyan
Write-Host " Environment: $Environment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Azure CLI is installed
try {
    $azVersion = az version --output json | ConvertFrom-Json
    Write-Host "✓ Azure CLI version: $($azVersion.'azure-cli')" -ForegroundColor Green
} catch {
    Write-Host "✗ Azure CLI is not installed. Please install from https://aka.ms/azure-cli" -ForegroundColor Red
    exit 1
}

# Check if logged in to Azure
$account = az account show --output json 2>$null | ConvertFrom-Json
if (-not $account) {
    Write-Host "Not logged in to Azure. Initiating login..." -ForegroundColor Yellow
    az login
    $account = az account show --output json | ConvertFrom-Json
}

Write-Host "✓ Logged in as: $($account.user.name)" -ForegroundColor Green
Write-Host "✓ Subscription: $($account.name) ($($account.id))" -ForegroundColor Green
Write-Host ""

# Create or validate resource group
Write-Host "Checking resource group: $ResourceGroupName" -ForegroundColor Yellow
$rgExists = az group exists --name $ResourceGroupName
if ($rgExists -eq "false") {
    Write-Host "Creating resource group: $ResourceGroupName in $Location" -ForegroundColor Yellow
    az group create --name $ResourceGroupName --location $Location --output none
    Write-Host "✓ Resource group created" -ForegroundColor Green
} else {
    Write-Host "✓ Resource group exists" -ForegroundColor Green
}
Write-Host ""

# Deploy Infrastructure
if (-not $SkipInfrastructure) {
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host " Deploying Azure Infrastructure" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    
    # Prompt for PostgreSQL credentials
    $postgresUsername = Read-Host "Enter PostgreSQL admin username (default: hospitaladmin)" 
    if ([string]::IsNullOrWhiteSpace($postgresUsername)) {
        $postgresUsername = "hospitaladmin"
    }
    
    $postgresPassword = Read-Host "Enter PostgreSQL admin password (min 12 chars, upper, lower, digit, symbol)" -AsSecureString
    $postgresPasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
        [Runtime.InteropServices.Marshal]::SecureStringToBSTR($postgresPassword)
    )
    
    # Validate password complexity
    if ($postgresPasswordPlain.Length -lt 12) {
        Write-Host "✗ Password must be at least 12 characters long" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "Deploying Bicep template..." -ForegroundColor Yellow
    $deploymentName = "hospital-portal-$Environment-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    
    az deployment group create `
        --name $deploymentName `
        --resource-group $ResourceGroupName `
        --template-file "./infrastructure/azure-resources.bicep" `
        --parameters environment=$Environment `
                     postgresAdminUsername=$postgresUsername `
                     postgresAdminPassword=$postgresPasswordPlain `
        --output json | ConvertFrom-Json | Out-Null
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Infrastructure deployed successfully" -ForegroundColor Green
        
        # Get deployment outputs
        $outputs = az deployment group show `
            --name $deploymentName `
            --resource-group $ResourceGroupName `
            --query properties.outputs `
            --output json | ConvertFrom-Json
        
        $webAppUrl = $outputs.webAppUrl.value
        $staticWebAppUrl = $outputs.staticWebAppUrl.value
        $postgresServerFqdn = $outputs.postgresServerFqdn.value
        
        Write-Host "  Backend URL: $webAppUrl" -ForegroundColor Cyan
        Write-Host "  Frontend URL: $staticWebAppUrl" -ForegroundColor Cyan
        Write-Host "  PostgreSQL Server: $postgresServerFqdn" -ForegroundColor Cyan
    } else {
        Write-Host "✗ Infrastructure deployment failed" -ForegroundColor Red
        exit 1
    }
    Write-Host ""
}

# Deploy Backend
if (-not $SkipBackend) {
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host " Deploying Backend API" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    
    $backendPath = "./microservices/auth-service/AuthService"
    $webAppName = "hospital-portal-$Environment-api"
    
    Write-Host "Building backend..." -ForegroundColor Yellow
    Push-Location $backendPath
    dotnet publish --configuration Release --output ./publish
    if ($LASTEXITCODE -ne 0) {
        Write-Host "✗ Backend build failed" -ForegroundColor Red
        Pop-Location
        exit 1
    }
    Pop-Location
    Write-Host "✓ Backend built successfully" -ForegroundColor Green
    
    Write-Host "Deploying to Azure App Service: $webAppName" -ForegroundColor Yellow
    az webapp deployment source config-zip `
        --resource-group $ResourceGroupName `
        --name $webAppName `
        --src "$backendPath/publish.zip" `
        --output none
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Backend deployed successfully" -ForegroundColor Green
    } else {
        Write-Host "✗ Backend deployment failed" -ForegroundColor Red
        exit 1
    }
    Write-Host ""
}

# Deploy Frontend
if (-not $SkipFrontend) {
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host " Deploying Frontend" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    
    $frontendPath = "./apps/hospital-portal-web"
    $staticWebAppName = "hospital-portal-$Environment-web"
    
    Write-Host "Building frontend..." -ForegroundColor Yellow
    Push-Location $frontendPath
    
    # Set API URL environment variable
    $apiUrl = "https://hospital-portal-$Environment-api.azurewebsites.net/api"
    $env:NEXT_PUBLIC_API_URL = $apiUrl
    
    pnpm install --frozen-lockfile
    if ($LASTEXITCODE -ne 0) {
        Write-Host "✗ Frontend dependency installation failed" -ForegroundColor Red
        Pop-Location
        exit 1
    }
    
    pnpm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "✗ Frontend build failed" -ForegroundColor Red
        Pop-Location
        exit 1
    }
    Pop-Location
    Write-Host "✓ Frontend built successfully" -ForegroundColor Green
    
    Write-Host "Getting Static Web App deployment token..." -ForegroundColor Yellow
    $deploymentToken = az staticwebapp secrets list `
        --name $staticWebAppName `
        --resource-group $ResourceGroupName `
        --query properties.apiKey `
        --output tsv
    
    Write-Host "Deploying to Azure Static Web Apps: $staticWebAppName" -ForegroundColor Yellow
    # Use Azure Static Web Apps CLI or GitHub Actions for actual deployment
    Write-Host "⚠ Static Web App deployment requires GitHub Actions or SWA CLI" -ForegroundColor Yellow
    Write-Host "  Deployment token retrieved. Configure in GitHub Secrets as AZURE_STATIC_WEB_APPS_API_TOKEN" -ForegroundColor Yellow
    Write-Host ""
}

# Run Database Migrations
if ($RunMigrations) {
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host " Running Database Migrations" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    
    $webAppName = "hospital-portal-$Environment-api"
    
    # Get connection string from App Service
    Write-Host "Retrieving connection string..." -ForegroundColor Yellow
    $connectionString = az webapp config connection-string list `
        --name $webAppName `
        --resource-group $ResourceGroupName `
        --query "[?name=='DefaultConnection'].value" `
        --output tsv
    
    if ([string]::IsNullOrWhiteSpace($connectionString)) {
        Write-Host "✗ Failed to retrieve connection string" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "Running EF Core migrations..." -ForegroundColor Yellow
    Push-Location "./microservices/auth-service/AuthService"
    $env:ConnectionStrings__DefaultConnection = $connectionString
    dotnet ef database update
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ EF Core migrations completed" -ForegroundColor Green
    } else {
        Write-Host "✗ EF Core migrations failed" -ForegroundColor Red
        Pop-Location
        exit 1
    }
    Pop-Location
    
    Write-Host "Running custom SQL migrations..." -ForegroundColor Yellow
    # Install PostgreSQL client if not available
    $psqlInstalled = Get-Command psql -ErrorAction SilentlyContinue
    if (-not $psqlInstalled) {
        Write-Host "⚠ PostgreSQL client (psql) not found. Skipping custom SQL migrations." -ForegroundColor Yellow
        Write-Host "  Install PostgreSQL client to run custom migrations." -ForegroundColor Yellow
    } else {
        Get-ChildItem "./migrations/*.sql" | Sort-Object Name | ForEach-Object {
            Write-Host "  Running: $($_.Name)" -ForegroundColor Cyan
            psql $connectionString -f $_.FullName
            if ($LASTEXITCODE -ne 0) {
                Write-Host "  ✗ Failed: $($_.Name)" -ForegroundColor Red
            } else {
                Write-Host "  ✓ Completed: $($_.Name)" -ForegroundColor Green
            }
        }
    }
    Write-Host ""
}

# Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Deployment Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Environment: $Environment" -ForegroundColor Cyan
Write-Host "Resource Group: $ResourceGroupName" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Configure JWT secret in App Service settings" -ForegroundColor White
Write-Host "2. Set up custom domain and SSL certificate" -ForegroundColor White
Write-Host "3. Configure Application Insights alerts" -ForegroundColor White
Write-Host "4. Run smoke tests to validate deployment" -ForegroundColor White
Write-Host ""
Write-Host "Access your application:" -ForegroundColor Yellow
Write-Host "  Backend: https://hospital-portal-$Environment-api.azurewebsites.net" -ForegroundColor Cyan
Write-Host "  Frontend: https://hospital-portal-$Environment-web.azurewebsites.net" -ForegroundColor Cyan
Write-Host ""
