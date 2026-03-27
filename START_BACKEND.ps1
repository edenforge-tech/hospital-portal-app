# Hospital Portal Backend Startup Script
# This script starts the backend server on http://localhost:5073

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Hospital Portal - Backend Server" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Navigate to backend directory
$backendPath = "c:\Users\Sam Aluri\Downloads\Hospital Portal\microservices\auth-service\AuthService"
Set-Location $backendPath

Write-Host "[1/3] Checking for existing processes on port 5073..." -ForegroundColor Yellow
$existingProcess = Get-NetTCPConnection -LocalPort 5073 -ErrorAction SilentlyContinue
if ($existingProcess) {
    $processId = $existingProcess[0].OwningProcess
    Write-Host "      Found process $processId using port 5073 - killing it..." -ForegroundColor Red
    Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
    Write-Host "      Process killed successfully" -ForegroundColor Green
}
else {
    Write-Host "      Port 5073 is free" -ForegroundColor Green
}

Write-Host ""
Write-Host "[2/3] Building backend..." -ForegroundColor Yellow
dotnet build --no-restore 2>&1 | Out-Null
Write-Host "      Build complete" -ForegroundColor Green

Write-Host ""
Write-Host "[3/3] Starting backend server..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Backend will be available at: http://localhost:5073" -ForegroundColor Green
Write-Host "Swagger UI will be at: http://localhost:5073/swagger" -ForegroundColor Green
Write-Host "SignalR hubs at: http://localhost:5073/hubs" -ForegroundColor Green
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Magenta
Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Run the backend server (this will block)
dotnet run --no-build
