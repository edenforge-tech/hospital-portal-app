# Execute User-Role Mappings via Backend Database Context
# This script reads the SQL file and sends it to backend for execution

$ApiUrl = "http://localhost:5072/api"
$token = ""

# Step 1: Login
Write-Host "Logging in..." -ForegroundColor Cyan
$loginBody = @{
    email = "admin@hospital.com"
    password = "Admin@123456"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$ApiUrl/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    $token = $loginResponse.token
    Write-Host "✓ Logged in successfully" -ForegroundColor Green
} catch {
    Write-Host "✗ Login failed: $_" -ForegroundColor Red
    exit 1
}

$headers = @{
    "Authorization" = "Bearer $token"
    "X-Tenant-ID" = "11111111-1111-1111-1111-111111111111"
    "Content-Type" = "application/json"
}

# Step 2: Read SQL file and execute via custom endpoint
# (Note: We need to execute via backend since direct DB access is not available)

# Alternative approach: Use the existing API endpoints
Write-Host "`nFetching users and roles..." -ForegroundColor Cyan
$users = Invoke-RestMethod -Uri "$ApiUrl/users" -Method Get -Headers $headers
$roles = Invoke-RestMethod -Uri "$ApiUrl/roles" -Method Get -Headers $headers

Write-Host "✓ Loaded $($users.Count) users" -ForegroundColor Green
Write-Host "✓ Loaded $($roles.Count) roles" -ForegroundColor Green

# Create comprehensive mapping
$roleMap = @{
    'Ophthalmologist - Cataract' = 'Ophthalmologist'
    'Ophthalmologist - Retina' = 'Ophthalmologist'
    'Ophthalmologist - Glaucoma' = 'Ophthalmologist'
    'Ophthalmologist - Cornea' = 'Ophthalmologist'
    'Ophthalmologist - Oculoplasty' = 'Ophthalmologist'
    'Ophthalmologist - Pediatric' = 'Ophthalmologist'
    'Ophthalmologist - Neuro-Ophthalmology' = 'Ophthalmologist'
    'Ophthalmologist - Medical Retina' = 'Ophthalmologist'
    'Ophthalmologist - Vitreo-Retinal Surgery' = 'Ophthalmologist'
    'Ophthalmologist - Contact Lens' = 'Ophthalmologist'
    'Optometrist' = 'Optometrist'
    'Ophthalmic Nurse' = 'Ophthalmic Nurse'
    'Ward Manager' = 'Ward Manager'
    'OT Manager' = 'OT Manager'
    'Doctor' = 'Doctor'
    'Lab Technician' = 'Lab Technician'
    'Imaging Technician' = 'Imaging Technician'
    'Pharmacist' = 'Pharmacist'
    'Optician' = 'Optician'
    'Sales Optician' = 'Sales Optician'
    'Receptionist' = 'Receptionist'
    'Registration Staff' = 'Registration Staff'
    'Billing Staff' = 'Billing Staff'
    'Accountant' = 'Accountant'
    'Insurance Coordinator' = 'Insurance Coordinator'
    'MRD Staff' = 'MRD Staff'
    'Admin Officer' = 'Admin Officer'
    'Administrative' = 'Admin Officer'
    'HR Manager' = 'HR Manager'
    'Finance Manager' = 'Finance Manager'
    'IT Officer' = 'IT Officer'
    'Counselor' = 'Counselor'
    'Maintenance Supervisor' = 'Maintenance Supervisor'
    'Biomedical Engineer' = 'Biomedical Engineer'
    'Security Officer' = 'Security Officer'
    'Housekeeping Staff' = 'Housekeeping Staff'
    'Quality Manager' = 'Quality Manager'
    'Compliance Officer' = 'Compliance Officer'
    'Grievance Officer' = 'Grievance Officer'
    'Outreach Coordinator' = 'Outreach Coordinator'
    'Research Fellow' = 'Research Fellow'
}

# Step 3: Use direct Identity API instead of custom endpoint
Write-Host "`nAssigning roles to users..." -ForegroundColor Cyan

$successCount = 0
$skipCount = 0
$failCount = 0

foreach ($user in $users) {
    if (-not $user.userType) {
        Write-Host "⊙ Skipping $($user.fullName) - no userType" -ForegroundColor Yellow
        $skipCount++
        continue
    }

    $targetRoleName = $roleMap[$user.userType]
    if (-not $targetRoleName) {
        Write-Host "⊙ Skipping $($user.fullName) - no role mapping for userType: $($user.userType)" -ForegroundColor Yellow
        $skipCount++
        continue
    }

    $targetRole = $roles | Where-Object { $_.name -eq $targetRoleName } | Select-Object -First 1
    if (-not $targetRole) {
        Write-Host "⊙ Skipping $($user.fullName) - role not found: $targetRoleName" -ForegroundColor Yellow
        $skipCount++
        continue
    }

    try {
        # Try using Identity API with userName instead of ID
        $identityBody = @{
            userName = $user.userName
            roleName = $targetRole.name
        } | ConvertTo-Json

        # Use a simpler endpoint if available, or fallback to direct SQL via backend
        # First, let's check if the user already has this role
        $userDetails = Invoke-RestMethod -Uri "$ApiUrl/users/$($user.id)" -Method Get -Headers $headers -ErrorAction SilentlyContinue
        
        if ($userDetails.roles -and ($userDetails.roles.name -contains $targetRole.name)) {
            Write-Host "⊙ $($user.fullName) - already has role $($targetRole.name)" -ForegroundColor Yellow
            $skipCount++
            continue
        }

        # Try the assignment
        $assignBody = @{ roleId = $targetRole.id } | ConvertTo-Json
        $result = Invoke-RestMethod -Uri "$ApiUrl/users/$($user.id)/roles" -Method Post -Headers $headers -Body $assignBody -ContentType "application/json"
        
        Write-Host "✓ $($user.fullName) → $($targetRole.name)" -ForegroundColor Green
        $successCount++
    } catch {
        Write-Host "✗ $($user.fullName) - $($_.Exception.Message)" -ForegroundColor Red
        $failCount++
    }

    Start-Sleep -Milliseconds 100
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "ROLE ASSIGNMENT SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✓ Successfully assigned: $successCount roles" -ForegroundColor Green
Write-Host "⊙ Skipped/Already assigned: $skipCount users" -ForegroundColor Yellow
Write-Host "✗ Failed: $failCount users" -ForegroundColor Red
Write-Host "========================================" -ForegroundColor Cyan
