# User-Department Mapping Script
# Maps 70 users to appropriate departments based on their roles and specialties

$ApiUrl = "http://localhost:5072/api"
$TenantId = "11111111-1111-1111-1111-111111111111"

# Login
Write-Host "`nLogging in..." -ForegroundColor Cyan
$loginBody = @{
    email = "admin@hospital.com"
    password = "Admin@123456"
    tenantId = $TenantId
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "$ApiUrl/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
$token = $loginResponse.accessToken

$headers = @{
    "Authorization" = "Bearer $token"
    "X-Tenant-ID" = $TenantId
}

# Fetch data
Write-Host "Fetching users, departments, and roles..." -ForegroundColor Cyan
$users = Invoke-RestMethod -Uri "$ApiUrl/users" -Headers $headers
$departments = Invoke-RestMethod -Uri "$ApiUrl/departments" -Headers $headers
$roles = Invoke-RestMethod -Uri "$ApiUrl/roles" -Headers $headers

Write-Host "Loaded $($users.Count) users, $($departments.Count) departments, $($roles.Count) roles" -ForegroundColor Green

# Create department lookup by name
$deptLookup = @{}
foreach ($dept in $departments) {
    $deptLookup[$dept.name] = $dept.id
}

# Define role → department mappings
$roleDeptMap = @{
    # Eye Clinical Departments
    'Ophthalmologist' = @('Cataract Surgery', 'Retina & Vitreous', 'Glaucoma', 'Cornea & Refractive', 'Oculoplasty', 'Pediatric Ophthalmology', 'Neuro-Ophthalmology', 'Uvea & Ocular Immunology', 'Medical Retina', 'Ocular Oncology', 'Vitreo-Retinal Surgery', 'Contact Lens & Low Vision', 'Operation Theatre')
    'Optometrist' = @('Optometry', 'Contact Lens & Low Vision', 'Refraction')
    'Ophthalmic Nurse' = @('Operation Theatre', 'Ward', 'Outpatient Department')
    'Ward Manager' = @('Ward', 'Nursing Services')
    'OT Manager' = @('Operation Theatre')
    
    # General Clinical
    'Doctor' = @('Outpatient Department', 'Emergency Department')
    
    # Diagnostic
    'Lab Technician' = @('Laboratory')
    'Imaging Technician' = @('Imaging & Diagnostics')
    
    # Pharmacy
    'Pharmacist' = @('Pharmacy')
    
    # Front Office
    'Optician' = @('Optical Shop')
    'Sales Optician' = @('Optical Shop')
    'Receptionist' = @('Front Office', 'Outpatient Department')
    'Registration Staff' = @('Front Office')
    
    # Administrative
    'Billing Staff' = @('Billing & Accounts')
    'Accountant' = @('Finance')
    'Insurance Coordinator' = @('Insurance & TPA')
    'MRD Staff' = @('Medical Records')
    'Admin Officer' = @('Administration', 'General Administration')
    'HR Manager' = @('Human Resources')
    'Finance Manager' = @('Finance')
    'IT Officer' = @('IT & Digital Services')
    
    # Support Services
    'Counselor' = @('Patient Counseling & Support')
    'Maintenance Supervisor' = @('Facilities & Maintenance')
    'Biomedical Engineer' = @('Biomedical Engineering')
    'Security Officer' = @('Security Services')
    'Housekeeping Staff' = @('Housekeeping')
    
    # Regulatory
    'Quality Manager' = @('Quality Assurance')
    'Compliance Officer' = @('Regulatory Compliance')
    'Grievance Officer' = @('Patient Grievance Redressal')
    'Outreach Coordinator' = @('Community Outreach')
    'Research Fellow' = @('Research & Academics')
}

Write-Host "`nStarting user-department mappings..." -ForegroundColor Cyan
$successCount = 0
$skipCount = 0
$failCount = 0

foreach ($user in $users) {
    # Get user details with roles
    $userDetail = Invoke-RestMethod -Uri "$ApiUrl/users/$($user.id)" -Headers $headers
    
    if (-not $userDetail.roles -or $userDetail.roles.Count -eq 0) {
        Write-Host "Skipping $($userDetail.fullName) - no roles assigned" -ForegroundColor Yellow
        $skipCount++
        continue
    }
    
    # Get primary role (first role)
    $primaryRole = $userDetail.roles[0].name
    
    # Find departments for this role
    $targetDepts = $roleDeptMap[$primaryRole]
    if (-not $targetDepts) {
        Write-Host "Skipping $($userDetail.fullName) - no department mapping for role: $primaryRole" -ForegroundColor Yellow
        $skipCount++
        continue
    }
    
    # Get role ID
    $roleObj = $roles | Where-Object { $_.name -eq $primaryRole } | Select-Object -First 1
    if (-not $roleObj) {
        Write-Host "Skipping $($userDetail.fullName) - role object not found: $primaryRole" -ForegroundColor Yellow
        $skipCount++
        continue
    }
    
    # Assign to primary department (first in list)
    $primaryDeptName = $targetDepts[0]
    $primaryDeptId = $deptLookup[$primaryDeptName]
    
    if (-not $primaryDeptId) {
        Write-Host "Skipping $($userDetail.fullName) - department not found: $primaryDeptName" -ForegroundColor Yellow
        $skipCount++
        continue
    }
    
    try {
        # Create user-department mapping
        $mapping = @{
            userId = $userDetail.id
            departmentId = $primaryDeptId
            roleId = $roleObj.id
            isPrimary = $true
            accessLevel = "full"
            status = "active"
        } | ConvertTo-Json
        
        # Note: This endpoint needs to be created in the backend
        # For now, we'll track what needs to be created
        Write-Host "$($userDetail.fullName) ($primaryRole) -> $primaryDeptName" -ForegroundColor Green
        $successCount++
    } catch {
        Write-Host "Failed $($userDetail.fullName) - $($_.Exception.Message)" -ForegroundColor Red
        $failCount++
    }
}

Write-Host "`n========================================"
Write-Host "USER-DEPARTMENT MAPPING SUMMARY"
Write-Host "========================================"
Write-Host "Ready to map: $successCount users" -ForegroundColor Green
Write-Host "Skipped: $skipCount users" -ForegroundColor Yellow
Write-Host "Failed: $failCount users" -ForegroundColor Red
Write-Host "========================================"
Write-Host "`nNote: API endpoint for user-department mapping needs to be implemented" -ForegroundColor Yellow
