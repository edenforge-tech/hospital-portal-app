# =====================================================
# Hospital Portal - Backend API Test
# =====================================================

Write-Host "`n=== Testing Hospital Portal Backend API ===" -ForegroundColor Cyan

# Test 1: Health check
Write-Host "`n[1/3] Testing API health..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:5073/api/tenants" -Method Get -ErrorAction Stop
    Write-Host "✓ API is responding" -ForegroundColor Green
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "✓ API is responding (401 Unauthorized - authentication required as expected)" -ForegroundColor Green
    } else {
        Write-Host "✗ API error: $_" -ForegroundColor Red
    }
}

# Test 2: Login with test credentials
Write-Host "`n[2/3] Testing authentication..." -ForegroundColor Yellow
try {
    $loginData = @{
        email = "admin@test.com"
        password = "Admin123!"
    } | ConvertTo-Json

    $headers = @{
        "Content-Type" = "application/json"
    }

    $authResponse = Invoke-RestMethod -Uri "http://localhost:5073/api/auth/login" -Method Post -Body $loginData -Headers $headers -ErrorAction Stop
    
    if ($authResponse.token) {
        Write-Host "✓ Authentication successful" -ForegroundColor Green
        Write-Host "  Token: $($authResponse.token.Substring(0, 50))..." -ForegroundColor Gray
        
        # Store token for next test
        $token = $authResponse.token
        $tenantId = $authResponse.user.tenantId
        
        # Test 3: Access protected endpoint with token
        Write-Host "`n[3/3] Testing authorized access to roles..." -ForegroundColor Yellow
        
        $authHeaders = @{
            "Authorization" = "Bearer $token"
            "X-Tenant-ID" = $tenantId
        }
        
        $rolesResponse = Invoke-RestMethod -Uri "http://localhost:5073/api/roles" -Method Get -Headers $authHeaders -ErrorAction Stop
        
        Write-Host "✓ Authorized API access successful" -ForegroundColor Green
        Write-Host "  Found $($rolesResponse.Count) roles" -ForegroundColor Gray
        
        # Show some role details
        Write-Host "`nSample roles:" -ForegroundColor Cyan
        $rolesResponse | Select-Object -First 5 | ForEach-Object {
            Write-Host "  - $($_.roleCode): $($_.description)" -ForegroundColor Gray
        }
        
    } else {
        Write-Host "✗ Authentication failed - no token received" -ForegroundColor Red
    }
} catch {
    Write-Host "✗ Authentication error: $_" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

Write-Host "`n=== Test Complete ===" -ForegroundColor Cyan
Write-Host "`nSwagger UI: http://localhost:5073/swagger" -ForegroundColor Green
Write-Host "Test Credentials: admin@test.com / Admin123!`n" -ForegroundColor Yellow
