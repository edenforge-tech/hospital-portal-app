# Test Dashboard API Endpoints
Write-Host "`n=== Testing Dashboard API Endpoints ===" -ForegroundColor Cyan

# Wait for backend to be ready
Write-Host "`nWaiting for backend to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Step 1: Login to get JWT token
Write-Host "`n1. Testing Login..." -ForegroundColor Green
$loginBody = @{
    emailOrUsername = "admin@test.com"
    password = "Admin123!"
    tenantCode = "test-tenant"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri 'http://localhost:5073/api/auth/login' -Method POST -Body $loginBody -ContentType 'application/json'
    $token = $loginResponse.token
    $tenantId = $loginResponse.tenantId
    Write-Host "   ✓ Login successful" -ForegroundColor Green
    Write-Host "   Token: $($token.Substring(0, 30))..." -ForegroundColor Gray
    Write-Host "   TenantId: $tenantId" -ForegroundColor Gray
} catch {
    Write-Host "   ✗ Login failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Prepare headers with JWT token
$headers = @{
    "Authorization" = "Bearer $token"
    "X-Tenant-ID" = $tenantId
}

# Step 2: Test Overview Stats
Write-Host "`n2. Testing GET /api/dashboard/admin/overview..." -ForegroundColor Green
try {
    $overviewStats = Invoke-RestMethod -Uri 'http://localhost:5073/api/dashboard/admin/overview' -Method GET -Headers $headers
    Write-Host "   ✓ Overview Stats retrieved successfully" -ForegroundColor Green
    Write-Host "   Total Tenants: $($overviewStats.totalTenants)" -ForegroundColor Gray
    Write-Host "   Active Users: $($overviewStats.activeUsers)" -ForegroundColor Gray
    Write-Host "   Total Departments: $($overviewStats.totalDepartments)" -ForegroundColor Gray
    Write-Host "   Total Branches: $($overviewStats.totalBranches)" -ForegroundColor Gray
    Write-Host "   System Health: $($overviewStats.systemHealth)" -ForegroundColor Gray
    Write-Host "   Last 24h Activity: $($overviewStats.last24HoursActivity)" -ForegroundColor Gray
} catch {
    Write-Host "   ✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Step 3: Test Quick Stats
Write-Host "`n3. Testing GET /api/dashboard/admin/quick-stats..." -ForegroundColor Green
try {
    $quickStats = Invoke-RestMethod -Uri 'http://localhost:5073/api/dashboard/admin/quick-stats' -Method GET -Headers $headers
    Write-Host "   ✓ Quick Stats retrieved successfully" -ForegroundColor Green
    Write-Host "   User Growth This Month: $($quickStats.userGrowth.thisMonth)" -ForegroundColor Gray
    Write-Host "   Active Departments: $($quickStats.departmentOperations.activeDepartments)" -ForegroundColor Gray
    Write-Host "   Compliance Status: $($quickStats.complianceStatus.status)" -ForegroundColor Gray
    Write-Host "   System Performance: $($quickStats.systemPerformance.status)" -ForegroundColor Gray
} catch {
    Write-Host "   ✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Step 4: Test Recent Activities
Write-Host "`n4. Testing GET /api/dashboard/admin/recent-activities..." -ForegroundColor Green
try {
    $activities = Invoke-RestMethod -Uri 'http://localhost:5073/api/dashboard/admin/recent-activities?limit=5' -Method GET -Headers $headers
    Write-Host "   ✓ Recent Activities retrieved successfully" -ForegroundColor Green
    Write-Host "   Total activities: $($activities.Count)" -ForegroundColor Gray
    if ($activities.Count -gt 0) {
        Write-Host "   First 3 activities:" -ForegroundColor Gray
        $activities | Select-Object -First 3 | ForEach-Object {
            Write-Host "     - $($_.userName): $($_.action) on $($_.entityType)" -ForegroundColor Gray
        }
    }
} catch {
    Write-Host "   ✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Step 5: Test Alerts
Write-Host "`n5. Testing GET /api/dashboard/admin/alerts..." -ForegroundColor Green
try {
    $alerts = Invoke-RestMethod -Uri 'http://localhost:5073/api/dashboard/admin/alerts' -Method GET -Headers $headers
    Write-Host "   ✓ Alerts retrieved successfully" -ForegroundColor Green
    Write-Host "   Total alerts: $($alerts.Count)" -ForegroundColor Gray
    if ($alerts.Count -gt 0) {
        Write-Host "   First 3 alerts:" -ForegroundColor Gray
        $alerts | Select-Object -First 3 | ForEach-Object {
            Write-Host "     - [$($_.severity)] $($_.title)" -ForegroundColor Gray
        }
    }
} catch {
    Write-Host "   ✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== All tests completed ===" -ForegroundColor Cyan
