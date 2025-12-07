# =====================================================================
# EYE HOSPITAL DATA SEEDING SCRIPT
# =====================================================================
# This script seeds realistic data for an Eye Hospital management system
# with proper relationships and eye-specific departments
# =====================================================================

param(
    [string]$BackendUrl = "http://localhost:5072",
    [string]$TenantId = "11111111-1111-1111-1111-111111111111"
)

$ErrorActionPreference = "Continue"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "   EYE HOSPITAL DATA SEEDING SCRIPT" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Login
Write-Host "Logging in..." -ForegroundColor Yellow
$loginBody = @{
    email = "admin@hospital.com"
    password = "Admin@123456"
    tenantId = $TenantId
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "$BackendUrl/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
$headers = @{
    "Authorization" = "Bearer $($loginResponse.accessToken)"
    "X-Tenant-ID" = $TenantId
    "Content-Type" = "application/json"
}

Write-Host "✓ Logged in successfully`n" -ForegroundColor Green

# =====================================================================
# STEP 1: Clear existing departments (eye hospital specific)
# =====================================================================
Write-Host "[1/5] DEPARTMENTS - Eye Hospital Specialties" -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Gray

$eyeDepartments = @(
    @{name="Cataract and IOL Surgery"; code="CATARACT"; type="Surgical"; desc="Cataract surgery, IOL implantation, premium IOLs"}
    @{name="Glaucoma Services"; code="GLAUCOMA"; type="Diagnostic Surgical"; desc="Glaucoma diagnosis, laser therapy, trabeculectomy"}
    @{name="Retina and Vitreous"; code="RETINA"; type="Surgical"; desc="Retinal detachment, vitrectomy, diabetic retinopathy"}
    @{name="Cornea and External Eye"; code="CORNEA"; type="Surgical"; desc="Corneal transplants, keratoconus, dry eye treatment"}
    @{name="Pediatric Ophthalmology"; code="PEDO"; type="Diagnostic Surgical"; desc="Pediatric eye care, squint surgery, amblyopia"}
    @{name="Oculoplasty and Orbit"; code="OCULO"; type="Surgical"; desc="Eyelid surgery, orbital fractures, cosmetic procedures"}
    @{name="Neuro-Ophthalmology"; code="NEURO"; type="Diagnostic"; desc="Optic nerve disorders, visual pathway diseases"}
    @{name="Contact Lens and Refraction"; code="CONTACT"; type="Clinical"; desc="Contact lens fitting, refraction services"}
    @{name="Optical Services"; code="OPTICAL"; type="Retail"; desc="Eyeglasses, frames, lenses, dispensing"}
    @{name="Orthoptics and Vision Therapy"; code="ORTHOPTICS"; type="Clinical"; desc="Binocular vision, vision therapy, exercises"}
    @{name="Low Vision Services"; code="LOWVISION"; type="Clinical"; desc="Low vision aids, rehabilitation"}
    @{name="Eye Imaging and Diagnostics"; code="IMAGING"; type="Diagnostic"; desc="OCT, fundus photography, visual fields, ultrasound"}
)

$deptCount = 0
foreach ($dept in $eyeDepartments) {
    $body = @{
        departmentName = $dept.name
        departmentCode = $dept.code
        departmentType = $dept.type
        description = $dept.desc
        status = "Active"
    } | ConvertTo-Json
    
    try {
        Invoke-RestMethod -Uri "$BackendUrl/api/departments" -Method Post -Body $body -Headers $headers -ErrorAction Stop | Out-Null
        Write-Host "  ✓ $($dept.name)" -ForegroundColor Green
        $deptCount++
    } catch {
        if ($_.Exception.Message -like "*already exists*") {
            Write-Host "  - $($dept.name) (already exists)" -ForegroundColor DarkGray
        } else {
            Write-Host "  ✗ $($dept.name): $($_.Exception.Message.Substring(0, [Math]::Min(60, $_.Exception.Message.Length)))" -ForegroundColor Red
        }
    }
}
Write-Host "`n  Created: $deptCount/12 departments`n" -ForegroundColor White

# =====================================================================
# STEP 2: Organizations - Major Eye Hospital Chains
# =====================================================================
Write-Host "[2/5] ORGANIZATIONS - Eye Hospital Chains" -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Gray

$eyeOrganizations = @(
    @{name="Sankara Eye Hospital Network"; code="SANKARA"; city="Chennai"; state="Tamil Nadu"; type="Non-Profit Eye Hospital Chain"}
    @{name="Aravind Eye Care System"; code="ARAVIND"; city="Madurai"; state="Tamil Nadu"; type="Non-Profit Eye Hospital Chain"}
    @{name="L V Prasad Eye Institute"; code="LVPEI"; city="Hyderabad"; state="Telangana"; type="Non-Profit Eye Hospital & Research"}
)

$orgCount = 0
$createdOrgs = @()
foreach ($org in $eyeOrganizations) {
    $body = @{
        tenantId = $TenantId
        name = $org.name
        code = $org.code
        type = $org.type
        city = $org.city
        stateProvince = $org.state
        countryCode = "IN"
        status = "active"
    } | ConvertTo-Json
    
    try {
        $result = Invoke-RestMethod -Uri "$BackendUrl/api/organizations" -Method Post -Body $body -Headers $headers -ErrorAction Stop
        Write-Host "  ✓ $($org.name)" -ForegroundColor Green
        $createdOrgs += @{name=$org.name; id=$result.organizationId}
        $orgCount++
    } catch {
        if ($_.Exception.Message -like "*already exists*") {
            Write-Host "  - $($org.name) (already exists)" -ForegroundColor DarkGray
        } else {
            Write-Host "  ✗ $($org.name): $($_.Exception.Message.Substring(0, [Math]::Min(60, $_.Exception.Message.Length)))" -ForegroundColor Red
        }
    }
}
Write-Host "`n  Created: $orgCount/3 organizations`n" -ForegroundColor White

# Get all organizations to link branches
Write-Host "  Fetching organization IDs..." -ForegroundColor Gray
$orgsResponse = Invoke-RestMethod -Uri "$BackendUrl/api/organizations" -Method Get -Headers $headers
$allOrgs = $orgsResponse.organizations | Where-Object { $_.code -in @("SANKARA", "ARAVIND", "LVPEI") }
Write-Host "  Found $($allOrgs.Count) eye hospital organizations`n" -ForegroundColor Gray

# =====================================================================
# STEP 3: Branches - Eye Hospital Locations
# =====================================================================
Write-Host "[3/5] BRANCHES - Eye Hospital Locations" -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Gray

if ($allOrgs.Count -ge 3) {
    $eyeBranches = @(
        @{orgIdx=0; name="Sankara Eye Hospital - T Nagar"; code="SANKARA-TN"; city="Chennai"; region="South India"; tz="Asia/Kolkata"}
        @{orgIdx=0; name="Sankara Eye Hospital - Coimbatore"; code="SANKARA-CBE"; city="Coimbatore"; region="South India"; tz="Asia/Kolkata"}
        @{orgIdx=1; name="Aravind Eye Hospital - Madurai Main"; code="ARAVIND-MDU"; city="Madurai"; region="South India"; tz="Asia/Kolkata"}
        @{orgIdx=1; name="Aravind Eye Hospital - Tirunelveli"; code="ARAVIND-TVL"; city="Tirunelveli"; region="South India"; tz="Asia/Kolkata"}
        @{orgIdx=2; name="LVPEI - Banjara Hills Main"; code="LVPEI-BHM"; city="Hyderabad"; region="South India"; tz="Asia/Kolkata"}
        @{orgIdx=2; name="LVPEI - Kallam Anji Reddy Campus"; code="LVPEI-KAR"; city="Hyderabad"; region="South India"; tz="Asia/Kolkata"}
    )

    $branchCount = 0
    foreach ($branch in $eyeBranches) {
        $orgId = $allOrgs[$branch.orgIdx].id
        $body = @{
            tenantId = $TenantId
            organizationId = $orgId
            name = $branch.name
            code = $branch.code
            city = $branch.city
            region = $branch.region
            timezone = $branch.tz
            languagePrimary = "en"
            status = "active"
        } | ConvertTo-Json
        
        try {
            Invoke-RestMethod -Uri "$BackendUrl/api/branches" -Method Post -Body $body -Headers $headers -ErrorAction Stop | Out-Null
            Write-Host "  ✓ $($branch.name)" -ForegroundColor Green
            $branchCount++
        } catch {
            if ($_.Exception.Message -like "*already exists*") {
                Write-Host "  - $($branch.name) (already exists)" -ForegroundColor DarkGray
            } else {
                Write-Host "  ✗ $($branch.name): $($_.Exception.Message.Substring(0, [Math]::Min(60, $_.Exception.Message.Length)))" -ForegroundColor Red
            }
        }
    }
    Write-Host "`n  Created: $branchCount/6 branches`n" -ForegroundColor White
} else {
    Write-Host "  ⚠ Not enough organizations found to create branches" -ForegroundColor Yellow
    Write-Host "  Available orgs: $($allOrgs.Count)`n" -ForegroundColor Yellow
}

# =====================================================================
# STEP 4: Roles - Eye Hospital Specific
# =====================================================================
Write-Host "[4/5] ROLES - Eye Hospital Staff Roles" -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Gray

$eyeRoles = @(
    @{name="Ophthalmologist"; desc="Eye surgeon and physician"}
    @{name="Optometrist"; desc="Vision care specialist"}
    @{name="Ophthalmic Technician"; desc="Eye care technician"}
    @{name="Ophthalmic Nurse"; desc="Eye surgery and clinic nurse"}
    @{name="Optician"; desc="Eyewear specialist"}
    @{name="Orthoptist"; desc="Binocular vision specialist"}
    @{name="Clinic Coordinator"; desc="Patient care coordinator"}
    @{name="Reception Staff"; desc="Front desk and registration"}
)

$roleCount = 0
foreach ($role in $eyeRoles) {
    $body = @{
        name = $role.name
        description = $role.desc
        tenantId = $TenantId
    } | ConvertTo-Json
    
    try {
        Invoke-RestMethod -Uri "$BackendUrl/api/roles" -Method Post -Body $body -Headers $headers -ErrorAction Stop | Out-Null
        Write-Host "  ✓ $($role.name)" -ForegroundColor Green
        $roleCount++
    } catch {
        if ($_.Exception.Message -like "*already exists*") {
            Write-Host "  - $($role.name) (already exists)" -ForegroundColor DarkGray
        } else {
            Write-Host "  ✗ $($role.name): $($_.Exception.Message.Substring(0, [Math]::Min(60, $_.Exception.Message.Length)))" -ForegroundColor Red
        }
    }
}
Write-Host "`n  Created: $roleCount/8 roles`n" -ForegroundColor White

# =====================================================================
# STEP 5: Users - Eye Hospital Staff
# =====================================================================
Write-Host "[5/5] USERS - Eye Hospital Staff" -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Gray

$eyeUsers = @(
    @{email="dr.sharma@sankara.com"; fname="Rajesh"; lname="Sharma"; role="Ophthalmologist"; designation="Senior Cataract Surgeon"}
    @{email="dr.priya@sankara.com"; fname="Priya"; lname="Nair"; role="Ophthalmologist"; designation="Retina Specialist"}
    @{email="opt.kumar@sankara.com"; fname="Anil"; lname="Kumar"; role="Optometrist"; role="Senior Optometrist"}
    @{email="tech.anjali@sankara.com"; fname="Anjali"; lname="Devi"; role="Ophthalmic Technician"; designation="OCT Technician"}
    @{email="nurse.meera@sankara.com"; fname="Meera"; lname="Krishnan"; role="Ophthalmic Nurse"; designation="OT Nurse"}
)

$userCount = 0
foreach ($user in $eyeUsers) {
    $body = @{
        email = $user.email
        firstName = $user.fname
        lastName = $user.lname
        designation = $user.designation
        userType = "Staff"
        userStatus = "Active"
        tenantId = $TenantId
    } | ConvertTo-Json
    
    try {
        Invoke-RestMethod -Uri "$BackendUrl/api/users" -Method Post -Body $body -Headers $headers -ErrorAction Stop | Out-Null
        Write-Host "  ✓ $($user.fname) $($user.lname) - $($user.designation)" -ForegroundColor Green
        $userCount++
    } catch {
        if ($_.Exception.Message -like "*already exists*") {
            Write-Host "  - $($user.fname) $($user.lname) (already exists)" -ForegroundColor DarkGray
        } else {
            Write-Host "  ✗ $($user.fname) $($user.lname): $($_.Exception.Message.Substring(0, [Math]::Min(60, $_.Exception.Message.Length)))" -ForegroundColor Red
        }
    }
}
Write-Host "`n  Created: $userCount/5 users`n" -ForegroundColor White

# =====================================================================
# SUMMARY
# =====================================================================
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "           SEEDING COMPLETE!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan

Write-Host "`nVerifying data..." -ForegroundColor Yellow
$depts = Invoke-RestMethod -Uri "$BackendUrl/api/departments" -Method Get -Headers $headers
$orgs = Invoke-RestMethod -Uri "$BackendUrl/api/organizations" -Method Get -Headers $headers
$branches = Invoke-RestMethod -Uri "$BackendUrl/api/branches" -Method Get -Headers $headers
$roles = Invoke-RestMethod -Uri "$BackendUrl/api/roles" -Method Get -Headers $headers
$users = Invoke-RestMethod -Uri "$BackendUrl/api/users" -Method Get -Headers $headers

Write-Host "`n📊 FINAL COUNT:" -ForegroundColor Cyan
Write-Host "  Departments: $($depts.Count)" -ForegroundColor White
Write-Host "  Organizations: $($orgs.organizations.Count)" -ForegroundColor White
Write-Host "  Branches: $($branches.branches.Count)" -ForegroundColor White
Write-Host "  Roles: $($roles.Count)" -ForegroundColor White
Write-Host "  Users: $($users.Count)" -ForegroundColor White

Write-Host "`n✅ Eye Hospital data seeding completed!`n" -ForegroundColor Green
