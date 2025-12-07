Write-Host "=========================================" -ForegroundColor Green
Write-Host "Starting Hospital Portal Backend Server" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green

# Set the working directory
$backendPath = "c:\Users\Sam Aluri\Downloads\Hospital Portal\microservices\auth-service\AuthService"
Set-Location $backendPath

Write-Host "Current directory: $(Get-Location)" -ForegroundColor Yellow
Write-Host "Starting ASP.NET Core application on http://localhost:5073..." -ForegroundColor Yellow

# Start the backend process
try {
    & dotnet run --urls "http://localhost:5073"
} catch {
    Write-Host "Error starting backend: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "Backend server stopped." -ForegroundColor Yellow
Read-Host "Press Enter to exit"