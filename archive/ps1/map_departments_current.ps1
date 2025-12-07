# User-Department Mapping Script (Working with existing 13 departments)
# Maps 70 users to available departments

$ApiUrl = "http://localhost:5072/api"
$TenantId = "11111111-1111-1111-1111-111111111111"

# Login
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
Write-Host "`nFetching data..." -ForegroundColor Cyan
$users = Invoke-RestMethod -Uri "$ApiUrl/users" -Headers $headers
$departments = Invoke-RestMethod -Uri "$ApiUrl/departments" -Headers $headers
$roles = Invoke-RestMethod -Uri "$ApiUrl/roles" -Headers $headers

Write-Host "Loaded: $($users.Count) users, $($departments.Count) departments, $($roles.Count) roles" -ForegroundColor Green

# Create department lookup by name
$deptLookup = @{}
foreach ($dept in $departments) {
    $deptLookup[$dept.departmentName] = $dept.id
}

Write-Host "`nAvailable departments:" -ForegroundColor Yellow
$deptLookup.Keys | Sort-Object | ForEach-Object { Write-Host "  - $_" }

# Role → Department mappings (using existing 13 departments)
$roleDeptMap = @{
    'Ophthalmologist' = 'Cataract Surgery'  # Primary
    'Optometrist' = 'Eye Imaging Center'    # Primary
    'Ophthalmic Nurse' = 'Cataract Surgery'
    'Ward Manager' = 'Cataract Surgery'
    'OT Manager' = 'Cataract Surgery'
    'Doctor' = 'Pediatric Ophthalmology'
    'Lab Technician' = 'Laboratory'
    'Imaging Technician' = 'Eye Imaging Center'
    'Pharmacist' = 'Optical Shop'  # No pharmacy dept, using closest
    'Optician' = 'Optical Shop'
    'Sales Optician' = 'Optical Shop'
    'Receptionist' = 'Pediatric Ophthalmology'  # No front office
    'Registration Staff' = 'Pediatric Ophthalmology'
    'Billing Staff' = 'Optical Shop'  # No billing dept
    'Accountant' = 'Optical Shop'
    'Insurance Coordinator' = 'Optical Shop'
    'MRD Staff' = 'Optical Shop'
    'Admin Officer' = 'Optical Shop'
    'HR Manager' = 'Optical Shop'
    'Finance Manager' = 'Optical Shop'
    'IT Officer' = 'Optical Shop'
    'Counselor' = 'Pediatric Ophthalmology'
    'Maintenance Supervisor' = 'Optical Shop'
    'Biomedical Engineer' = 'Eye Imaging Center'
    'Security Officer' = 'Optical Shop'
    'Housekeeping Staff' = 'Optical Shop'
    'Quality Manager' = 'Optical Shop'
    'Compliance Officer' = 'Optical Shop'
    'Grievance Officer' = 'Pediatric Ophthalmology'
    'Outreach Coordinator' = 'Pediatric Ophthalmology'
    'Research Fellow' = 'Neuro-Ophthalmology'
    'Nurse' = 'Cataract Surgery'
    'Admin Staff' = 'Optical Shop'
}

Write-Host "`nMapping users to departments..." -ForegroundColor Cyan
$mappings = @()

foreach ($user in $users) {
    $userDetail = Invoke-RestMethod -Uri "$ApiUrl/users/$($user.id)" -Headers $headers
    
    if (-not $userDetail.roles -or $userDetail.roles.Count -eq 0) {
        continue
    }
    
    $primaryRole = $userDetail.roles[0].name
    $targetDept = $roleDeptMap[$primaryRole]
    
    if (-not $targetDept) {
        Write-Host "No mapping for $($userDetail.fullName) - role: $primaryRole" -ForegroundColor Yellow
        continue
    }
    
    $deptId = $deptLookup[$targetDept]
    if (-not $deptId) {
        Write-Host "Dept not found for $($userDetail.fullName): $targetDept" -ForegroundColor Red
        continue
    }
    
    $roleObj = $roles | Where-Object { $_.name -eq $primaryRole } | Select-Object -First 1
    
    $mappings += [PSCustomObject]@{
        UserName = $userDetail.fullName
        UserId = $userDetail.id
        Role = $primaryRole
        RoleId = $roleObj.id
        Department = $targetDept
        DepartmentId = $deptId
    }
    
    Write-Host "$($userDetail.fullName) ($primaryRole) → $targetDept" -ForegroundColor Green
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "MAPPING SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Total mappings ready: $($mappings.Count)" -ForegroundColor Green
Write-Host "`nBy Department:" -ForegroundColor Yellow
$mappings | Group-Object Department | Sort-Object Count -Descending | ForEach-Object {
    Write-Host "  $($_.Name): $($_.Count) staff" -ForegroundColor White
}
Write-Host "========================================" -ForegroundColor Cyan

# Export for later use
$mappings | Export-Csv "user_department_mappings.csv" -NoTypeInformation
Write-Host "`nMappings exported to: user_department_mappings.csv" -ForegroundColor Green
Write-Host "Note: Need to create API endpoint or SQL script to insert these mappings" -ForegroundColor Yellow
