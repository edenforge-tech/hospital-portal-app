# Fix Tenant Status - Update tenant to Active
$apiUrl = "http://localhost:5073/api"

# Login to get token
$loginBody = @{
    email = "admin@hospital.com"
    password = "Admin@123"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "$apiUrl/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
$token = $loginResponse.token
$tenantId = $loginResponse.tenantId

Write-Host "Logged in successfully"
Write-Host "Tenant ID: $tenantId"

# Get all tenants
$headers = @{
    "Authorization" = "Bearer $token"
    "X-Tenant-ID" = $tenantId
}

$tenants = Invoke-RestMethod -Uri "$apiUrl/tenants" -Method GET -Headers $headers
Write-Host "Found tenants: $($tenants.totalCount)"

foreach ($tenant in $tenants.tenants) {
    Write-Host "Tenant: $($tenant.name) - Status: $($tenant.status)"
    
    if ($tenant.status -ne "Active") {
        Write-Host "Updating to Active..."
        
        $updateBody = @{
            name = $tenant.name
            status = "Active"
        } | ConvertTo-Json
        
        try {
            $updated = Invoke-RestMethod -Uri "$apiUrl/tenants/$($tenant.id)" -Method PUT -Body $updateBody -ContentType "application/json" -Headers $headers
            Write-Host "Updated successfully"
        } catch {
            Write-Host "Error updating: $_"
        }
    }
}

Write-Host "Done!"
