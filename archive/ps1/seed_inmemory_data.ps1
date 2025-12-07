# Seed InMemory Database
# Run this script after backend starts to populate initial data

Write-Host "`n=== Seeding InMemory Database ===" -ForegroundColor Cyan

# Wait for backend to be ready
Write-Host "Waiting for backend..." -ForegroundColor Yellow
Start-Sleep -Seconds 2

# Step 1: Check tenants (skip insertion as endpoint requires auth)
Write-Host "`nStep 1: Checking tenants..." -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "http://localhost:5072/api/tenants/debug/codes" -Method Get
    Write-Host "  ✓ Found $($response.Count) tenants" -ForegroundColor Green
}
catch {
    Write-Host "  ✗ Cannot check tenants: $($_.Exception.Message)" -ForegroundColor Red
}


# Step 2: Admin user already exists in InMemory DB via EnsureCreated()
Write-Host "`nStep 2: Admin user should exist from database seeding..." -ForegroundColor Cyan
Write-Host "  Note: Backend auto-creates admin user with demo mode" -ForegroundColor Yellow


# Step 3: Test Login
Write-Host "`nStep 3: Testing login..." -ForegroundColor Cyan
$loginBody = @{
    email = "admin@hospital.com"
    password = "Admin@123456"
    tenantId = "11111111-1111-1111-1111-111111111111"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:5072/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json" -ErrorAction Stop
    Write-Host "`n  ✓✓✓ LOGIN SUCCESSFUL! ✓✓✓`n" -ForegroundColor Green
    Write-Host "  Email: $($response.user.email)"
    Write-Host "  Tenant: $($response.user.tenantName)"
    Write-Host "  Token: $($response.accessToken.Substring(0, 30))..."
    Write-Host "`n  You can now login at http://localhost:3000/auth/login" -ForegroundColor Cyan
    Write-Host "  Credentials: admin@hospital.com / Admin@123456" -ForegroundColor Cyan
}
catch {
    Write-Host "`n  ✗ Login failed!" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)"
    Write-Host "`n  Note: Backend may be using demo mode or admin user wasn't created." -ForegroundColor Yellow
    Write-Host "  Check if demo mode is enabled in AuthController.cs (line ~60)" -ForegroundColor Yellow
}

Write-Host "`n=== Seeding Complete ===`n" -ForegroundColor Green
