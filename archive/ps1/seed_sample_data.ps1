# Seed Sample Data for Testing
# Run this after logging in to populate data for all admin pages

Write-Host "`n=== Seeding Sample Data ===" -ForegroundColor Cyan

# Get token
Write-Host "`nStep 1: Getting authentication token..." -ForegroundColor Yellow
$loginBody = @{
    email = "admin@hospital.com"
    password = "Admin@123456"
    tenantId = "11111111-1111-1111-1111-111111111111"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "http://localhost:5072/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
$token = $loginResponse.accessToken
$tenantId = "11111111-1111-1111-1111-111111111111"
$headers = @{
    "Authorization" = "Bearer $token"
    "X-Tenant-ID" = $tenantId
    "Content-Type" = "application/json"
}

Write-Host "✓ Token obtained" -ForegroundColor Green

# Seed Roles
Write-Host "`nStep 2: Creating Roles..." -ForegroundColor Yellow
$roles = @(
    @{ name = "Doctor"; description = "Medical doctor with patient access"; isActive = "true" },
    @{ name = "Nurse"; description = "Nursing staff"; isActive = "true" },
    @{ name = "Receptionist"; description = "Front desk staff"; isActive = "true" },
    @{ name = "Lab Technician"; description = "Laboratory staff"; isActive = "true" }
)

foreach ($role in $roles) {
    $body = $role | ConvertTo-Json
    try {
        Invoke-RestMethod -Uri "http://localhost:5072/api/roles" -Method Post -Body $body -Headers $headers | Out-Null
        Write-Host "  ✓ $($role.name)" -ForegroundColor Green
    } catch {
        Write-Host "  - $($role.name) (may already exist)" -ForegroundColor Yellow
    }
}

# Seed Organizations
Write-Host "`nStep 3: Creating Organizations..." -ForegroundColor Yellow
$organizations = @(
    @{
        name = "Apollo Hospitals Enterprise Ltd"
        orgCode = "APOLLO-HQ"
        orgType = "Hospital Chain"
        address = "19, Bishop Gardens, Raja Annamalaipuram"
        city = "Chennai"
        state = "Tamil Nadu"
        country = "India"
        postalCode = "600028"
        phone = "+91-44-28296000"
        email = "info@apollohospitals.com"
        website = "https://www.apollohospitals.com"
        gstin = "33AABCA0000A1Z5"
        isActive = $true
    },
    @{
        name = "Apollo Hospitals - Mumbai Branch"
        orgCode = "APOLLO-MUM"
        orgType = "Branch"
        address = "Mumbai Central"
        city = "Mumbai"
        state = "Maharashtra"
        country = "India"
        postalCode = "400008"
        phone = "+91-22-12345678"
        email = "mumbai@apollohospitals.com"
        website = "https://www.apollohospitals.com"
        gstin = "27AABCA0000A1Z6"
        isActive = $true
    }
)

foreach ($org in $organizations) {
    $body = $org | ConvertTo-Json
    try {
        Invoke-RestMethod -Uri "http://localhost:5072/api/organizations" -Method Post -Body $body -Headers $headers | Out-Null
        Write-Host "  ✓ $($org.name)" -ForegroundColor Green
    } catch {
        Write-Host "  - $($org.name) (error: $($_.Exception.Message))" -ForegroundColor Yellow
    }
}

# Seed Branches  
Write-Host "`nStep 4: Creating Branches..." -ForegroundColor Yellow
$branches = @(
    @{
        name = "Apollo Main Hospital - Chennai"
        branchCode = "APL-CHN-01"
        address = "Greams Road"
        city = "Chennai"
        state = "Tamil Nadu"
        country = "India"
        postalCode = "600006"
        phone = "+91-44-28296000"
        email = "chennai@apollohospitals.com"
        isMainBranch = $true
        isActive = $true
        hipaaCompliant = $true
        nabhAccredited = $true
    },
    @{
        name = "Apollo Clinic - Nungambakkam"
        branchCode = "APL-CHN-02"
        address = "Nungambakkam High Road"
        city = "Chennai"
        state = "Tamil Nadu"
        country = "India"
        postalCode = "600034"
        phone = "+91-44-12345678"
        email = "nungambakkam@apollohospitals.com"
        isMainBranch = $false
        isActive = $true
        hipaaCompliant = $true
        nabhAccredited = $false
    }
)

foreach ($branch in $branches) {
    $body = $branch | ConvertTo-Json
    try {
        Invoke-RestMethod -Uri "http://localhost:5072/api/branches" -Method Post -Body $body -Headers $headers | Out-Null
        Write-Host "  ✓ $($branch.name)" -ForegroundColor Green
    } catch {
        Write-Host "  - $($branch.name) (error)" -ForegroundColor Yellow
    }
}

# Seed Departments
Write-Host "`nStep 5: Creating Departments..." -ForegroundColor Yellow
$departments = @(
    @{
        name = "Ophthalmology"
        deptCode = "OPHTHAL"
        description = "Eye care and vision services"
        isActive = $true
    },
    @{
        name = "Cardiology"
        deptCode = "CARDIO"
        description = "Heart and cardiovascular services"
        isActive = $true
    },
    @{
        name = "Orthopedics"
        deptCode = "ORTHO"
        description = "Bone and joint care"
        isActive = $true
    },
    @{
        name = "Pediatrics"
        deptCode = "PEDIA"
        description = "Child healthcare"
        isActive = $true
    }
)

foreach ($dept in $departments) {
    $body = $dept | ConvertTo-Json
    try {
        Invoke-RestMethod -Uri "http://localhost:5072/api/departments" -Method Post -Body $body -Headers $headers | Out-Null
        Write-Host "  ✓ $($dept.name)" -ForegroundColor Green
    } catch {
        Write-Host "  - $($dept.name) (error)" -ForegroundColor Yellow
    }
}

# Seed Users
Write-Host "`nStep 6: Creating Additional Users..." -ForegroundColor Yellow
$users = @(
    @{
        userName = "dr.sharma@hospital.com"
        email = "dr.sharma@hospital.com"
        password = "Doctor@123456"
        firstName = "Rajesh"
        lastName = "Sharma"
        phoneNumber = "+91-98100-12345"
        userType = "Doctor"
        isActive = $true
        mustChangePassword = $false
    },
    @{
        userName = "nurse.priya@hospital.com"
        email = "nurse.priya@hospital.com"
        password = "Nurse@123456"
        firstName = "Priya"
        lastName = "Kumar"
        phoneNumber = "+91-98100-23456"
        userType = "Nurse"
        isActive = $true
        mustChangePassword = $false
    }
)

foreach ($user in $users) {
    $body = $user | ConvertTo-Json
    try {
        Invoke-RestMethod -Uri "http://localhost:5072/api/users" -Method Post -Body $body -Headers $headers | Out-Null
        Write-Host "  ✓ $($user.firstName) $($user.lastName) ($($user.userType))" -ForegroundColor Green
    } catch {
        Write-Host "  - $($user.email) (may already exist)" -ForegroundColor Yellow
    }
}

# Verify counts
Write-Host "`n=== Verification ===" -ForegroundColor Cyan
try {
    $users = Invoke-RestMethod -Uri "http://localhost:5072/api/users" -Method Get -Headers $headers
    Write-Host "Users: $($users.Count)" -ForegroundColor Green
} catch {}

try {
    $tenants = Invoke-RestMethod -Uri "http://localhost:5072/api/tenants" -Method Get -Headers $headers
    Write-Host "Tenants: $($tenants.Count)" -ForegroundColor Green
} catch {}

try {
    $roles = Invoke-RestMethod -Uri "http://localhost:5072/api/roles" -Method Get -Headers $headers
    Write-Host "Roles: $($roles.Count)" -ForegroundColor Green
} catch {}

try {
    $orgs = Invoke-RestMethod -Uri "http://localhost:5072/api/organizations" -Method Get -Headers $headers
    Write-Host "Organizations: $($orgs.Count)" -ForegroundColor Green
} catch {}

try {
    $branches = Invoke-RestMethod -Uri "http://localhost:5072/api/branches" -Method Get -Headers $headers
    Write-Host "Branches: $($branches.Count)" -ForegroundColor Green
} catch {}

try {
    $depts = Invoke-RestMethod -Uri "http://localhost:5072/api/departments" -Method Get -Headers $headers
    Write-Host "Departments: $($depts.Count)" -ForegroundColor Green
} catch {}

Write-Host "`n=== Seeding Complete! ===" -ForegroundColor Green
Write-Host "Now refresh your browser and check the admin pages.`n" -ForegroundColor Cyan
