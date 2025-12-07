# ========================================
# Complete Hospital Data Seeding Script
# ========================================
# Seeds realistic data for Apollo Hospital Portal
# Run after backend starts with demo mode enabled

param(
    [string]$ApiUrl = "http://localhost:5073/api",
    [string]$AdminEmail = "admin@hospital.com",
    [string]$AdminPassword = "Admin@123456",
    [string]$TenantId = "11111111-1111-1111-1111-111111111111",
    [switch]$RunStaffSeed = $false
)

Write-Host "`n" -NoNewline
Write-Host "╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                                                           ║" -ForegroundColor Cyan
Write-Host "║        APOLLO HOSPITAL PORTAL - DATA SEEDING              ║" -ForegroundColor Cyan
Write-Host "║                                                           ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# ========================================
# Step 1: Authentication
# ========================================
Write-Host "[1/6] 🔐 Authenticating..." -ForegroundColor Yellow
$loginBody = @{
    email = $AdminEmail
    password = $AdminPassword
    tenantId = $TenantId
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$ApiUrl/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    $token = $loginResponse.accessToken
    $headers = @{
        "Authorization" = "Bearer $token"
        "X-Tenant-ID" = $TenantId
        "Content-Type" = "application/json"
    }
    Write-Host "      ✓ Authentication successful" -ForegroundColor Green
} catch {
    Write-Host "      ✗ Authentication failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# ========================================
# Step 2: Create Roles
# ========================================
Write-Host "`n[2/6] 👥 Creating Roles..." -ForegroundColor Yellow
$rolesData = @(
    @{ name = "Super Admin"; description = "Full system access with all permissions"; isActive = $true },
    @{ name = "Hospital Admin"; description = "Hospital-wide administrative access"; isActive = $true },
    @{ name = "Senior Doctor"; description = "Senior medical practitioner with full patient access"; isActive = $true },
    @{ name = "Junior Doctor"; description = "Junior medical practitioner with supervised access"; isActive = $true },
    @{ name = "Ophthalmologist"; description = "Eye specialist doctor"; isActive = $true },
    @{ name = "Cardiologist"; description = "Heart specialist doctor"; isActive = $true },
    @{ name = "Senior Nurse"; description = "Senior nursing staff with administrative duties"; isActive = $true },
    @{ name = "Staff Nurse"; description = "General nursing staff"; isActive = $true },
    @{ name = "Receptionist"; description = "Front desk and appointment management"; isActive = $true },
    @{ name = "Lab Technician"; description = "Laboratory testing and analysis"; isActive = $true },
    @{ name = "Pharmacist"; description = "Medication dispensing and management"; isActive = $true },
    @{ name = "Billing Officer"; description = "Financial and billing operations"; isActive = $true }
)

$createdRoles = @()
foreach ($role in $rolesData) {
    try {
        $body = $role | ConvertTo-Json
        $result = Invoke-RestMethod -Uri "$ApiUrl/roles" -Method Post -Body $body -Headers $headers
        $createdRoles += $result
        Write-Host "      ✓ $($role.name)" -ForegroundColor Green
    } catch {
        Write-Host "      - $($role.name) (may exist)" -ForegroundColor DarkGray
    }
}

# ========================================
# Step 3: Create Organizations
# ========================================
Write-Host "`n[3/6] 🏢 Creating Organizations..." -ForegroundColor Yellow
$organizationsData = @(
    @{
        name = "Apollo Hospitals Enterprise Ltd"
        orgCode = "APOLLO-HQ"
        orgType = "Corporate Headquarters"
        address = "19, Bishop Gardens, Raja Annamalaipuram"
        city = "Chennai"
        state = "Tamil Nadu"
        country = "India"
        postalCode = "600028"
        phone = "+91-44-28296000"
        email = "corporate@apollohospitals.com"
        website = "https://www.apollohospitals.com"
        gstin = "33AABCA0000A1Z5"
        panNumber = "AABCA0000A"
        licenseNumber = "TN-HQ-2024-001"
        description = "Leading integrated healthcare services provider in Asia"
        isActive = $true
    },
    @{
        name = "Apollo Hospitals - Chennai"
        orgCode = "APOLLO-CHN"
        orgType = "Hospital"
        address = "21, Greams Lane, Off Greams Road"
        city = "Chennai"
        state = "Tamil Nadu"
        country = "India"
        postalCode = "600006"
        phone = "+91-44-28296000"
        email = "chennai@apollohospitals.com"
        website = "https://www.apollohospitals.com/chennai"
        gstin = "33AABCA0000A1Z6"
        panNumber = "AABCA0000B"
        licenseNumber = "TN-CHN-2024-001"
        description = "Flagship hospital with 500+ beds, multi-specialty care"
        isActive = $true
    },
    @{
        name = "Apollo Specialty Hospitals - Mumbai"
        orgCode = "APOLLO-MUM"
        orgType = "Hospital"
        address = "Tardeo Road, Mumbai Central"
        city = "Mumbai"
        state = "Maharashtra"
        country = "India"
        postalCode = "400034"
        phone = "+91-22-43434343"
        email = "mumbai@apollohospitals.com"
        website = "https://www.apollohospitals.com/mumbai"
        gstin = "27AABCA0000A1Z7"
        panNumber = "AABCA0000C"
        licenseNumber = "MH-MUM-2024-002"
        description = "300-bed multi-specialty hospital"
        isActive = $true
    }
)

$createdOrganizations = @()
foreach ($org in $organizationsData) {
    try {
        $body = $org | ConvertTo-Json
        $result = Invoke-RestMethod -Uri "$ApiUrl/organizations" -Method Post -Body $body -Headers $headers
        $createdOrganizations += $result
        Write-Host "      ✓ $($org.name)" -ForegroundColor Green
    } catch {
        Write-Host "      - $($org.name) (error: $($_.Exception.Message.Substring(0, [Math]::Min(50, $_.Exception.Message.Length))))" -ForegroundColor DarkGray
    }
}

# ========================================
# Step 4: Create Branches
# ========================================
Write-Host "`n[4/6] 🏥 Creating Branches..." -ForegroundColor Yellow
$branchesData = @(
    @{
        name = "Apollo Main Hospital - Chennai"
        branchCode = "APL-CHN-MAIN"
        branchType = "Main Hospital"
        address = "21, Greams Lane, Off Greams Road"
        city = "Chennai"
        state = "Tamil Nadu"
        country = "India"
        postalCode = "600006"
        phone = "+91-44-28296000"
        email = "chennai.main@apollohospitals.com"
        bedCapacity = 550
        icuBeds = 45
        emergencyBeds = 30
        isMainBranch = $true
        isActive = $true
        operatingHours = "24x7 Emergency Services"
        hipaaCompliant = $true
        nabhAccredited = $true
        jciAccredited = $true
        description = "Flagship 550-bed tertiary care hospital"
    },
    @{
        name = "Apollo Clinic - Nungambakkam"
        branchCode = "APL-CHN-NUN"
        branchType = "Clinic"
        address = "123, Nungambakkam High Road"
        city = "Chennai"
        state = "Tamil Nadu"
        country = "India"
        postalCode = "600034"
        phone = "+91-44-42424242"
        email = "nungambakkam@apolloclinics.com"
        bedCapacity = 0
        icuBeds = 0
        emergencyBeds = 0
        isMainBranch = $false
        isActive = $true
        operatingHours = "Mon-Sat: 8 AM - 8 PM, Sun: 9 AM - 5 PM"
        hipaaCompliant = $true
        nabhAccredited = $false
        jciAccredited = $false
        description = "Outpatient consultation and diagnostics"
    },
    @{
        name = "Apollo Hospitals - Greams Road"
        branchCode = "APL-CHN-GRM"
        branchType = "Hospital"
        address = "Greams Road"
        city = "Chennai"
        state = "Tamil Nadu"
        country = "India"
        postalCode = "600006"
        phone = "+91-44-28296000"
        email = "greams@apollohospitals.com"
        bedCapacity = 200
        icuBeds = 20
        emergencyBeds = 15
        isMainBranch = $false
        isActive = $true
        operatingHours = "24x7 Emergency Services"
        hipaaCompliant = $true
        nabhAccredited = $true
        jciAccredited = $false
        description = "200-bed multi-specialty hospital"
    },
    @{
        name = "Apollo Specialty Hospital - Mumbai"
        branchCode = "APL-MUM-MAIN"
        branchType = "Hospital"
        address = "Tardeo Road, Mumbai Central"
        city = "Mumbai"
        state = "Maharashtra"
        country = "India"
        postalCode = "400034"
        phone = "+91-22-43434343"
        email = "mumbai@apollohospitals.com"
        bedCapacity = 300
        icuBeds = 28
        emergencyBeds = 20
        isMainBranch = $true
        isActive = $true
        operatingHours = "24x7 Emergency Services"
        hipaaCompliant = $true
        nabhAccredited = $true
        jciAccredited = $true
        description = "300-bed cardiac and orthopedic center of excellence"
    },
    @{
        name = "Apollo Clinic - Andheri"
        branchCode = "APL-MUM-AND"
        branchType = "Clinic"
        address = "Andheri West, Mumbai"
        city = "Mumbai"
        state = "Maharashtra"
        country = "India"
        postalCode = "400053"
        phone = "+91-22-66666666"
        email = "andheri@apolloclinics.com"
        bedCapacity = 0
        icuBeds = 0
        emergencyBeds = 0
        isMainBranch = $false
        isActive = $true
        operatingHours = "Mon-Sat: 8 AM - 9 PM, Sun: 10 AM - 6 PM"
        hipaaCompliant = $true
        nabhAccredited = $false
        jciAccredited = $false
        description = "Family health clinic with diagnostics"
    }
)

$createdBranches = @()
foreach ($branch in $branchesData) {
    try {
        $body = $branch | ConvertTo-Json
        $result = Invoke-RestMethod -Uri "$ApiUrl/branches" -Method Post -Body $body -Headers $headers
        $createdBranches += $result
        Write-Host "      ✓ $($branch.name)" -ForegroundColor Green
    } catch {
        Write-Host "      - $($branch.name) (error)" -ForegroundColor DarkGray
    }
}

# ========================================
# Step 5: Create Departments
# ========================================
Write-Host "`n[5/6] 🏥 Creating Departments..." -ForegroundColor Yellow
$departmentsData = @(
    @{
        name = "Ophthalmology"
        deptCode = "OPHTHAL"
        description = "Comprehensive eye care - Cataract, Glaucoma, Retina, Cornea"
        departmentType = "Clinical"
        headOfDepartment = "Dr. Rajesh Kumar"
        contactEmail = "ophthal@apollohospitals.com"
        contactPhone = "+91-44-28296001"
        bedCount = 40
        isActive = $true
        isEmergencyDept = $false
    },
    @{
        name = "Cardiology"
        deptCode = "CARDIO"
        description = "Complete cardiac care - Interventional cardiology, Cardiac surgery"
        departmentType = "Clinical"
        headOfDepartment = "Dr. Sanjay Mehta"
        contactEmail = "cardio@apollohospitals.com"
        contactPhone = "+91-44-28296002"
        bedCount = 80
        isActive = $true
        isEmergencyDept = $true
    },
    @{
        name = "Orthopedics"
        deptCode = "ORTHO"
        description = "Bone, joint and spine care - Joint replacement, Sports medicine"
        departmentType = "Clinical"
        headOfDepartment = "Dr. Vikram Singh"
        contactEmail = "ortho@apollohospitals.com"
        contactPhone = "+91-44-28296003"
        bedCount = 60
        isActive = $true
        isEmergencyDept = $false
    },
    @{
        name = "Pediatrics"
        deptCode = "PEDIA"
        description = "Child healthcare - Neonatology, Pediatric surgery"
        departmentType = "Clinical"
        headOfDepartment = "Dr. Priya Sharma"
        contactEmail = "pedia@apollohospitals.com"
        contactPhone = "+91-44-28296004"
        bedCount = 50
        isActive = $true
        isEmergencyDept = $true
    },
    @{
        name = "Emergency Medicine"
        deptCode = "EMERG"
        description = "24x7 Emergency and trauma care"
        departmentType = "Emergency"
        headOfDepartment = "Dr. Amit Patel"
        contactEmail = "emergency@apollohospitals.com"
        contactPhone = "+91-44-28296100"
        bedCount = 30
        isActive = $true
        isEmergencyDept = $true
    },
    @{
        name = "Radiology"
        deptCode = "RADIO"
        description = "Medical imaging - CT, MRI, X-Ray, Ultrasound"
        departmentType = "Diagnostic"
        headOfDepartment = "Dr. Kavita Reddy"
        contactEmail = "radiology@apollohospitals.com"
        contactPhone = "+91-44-28296005"
        bedCount = 0
        isActive = $true
        isEmergencyDept = $false
    },
    @{
        name = "Laboratory Services"
        deptCode = "LAB"
        description = "Clinical laboratory and pathology services"
        departmentType = "Diagnostic"
        headOfDepartment = "Dr. Suresh Iyer"
        contactEmail = "lab@apollohospitals.com"
        contactPhone = "+91-44-28296006"
        bedCount = 0
        isActive = $true
        isEmergencyDept = $false
    },
    @{
        name = "Pharmacy"
        deptCode = "PHARM"
        description = "In-house pharmacy and medication management"
        departmentType = "Support"
        headOfDepartment = "Mrs. Lakshmi Devi"
        contactEmail = "pharmacy@apollohospitals.com"
        contactPhone = "+91-44-28296007"
        bedCount = 0
        isActive = $true
        isEmergencyDept = $false
    },
    @{
        name = "Neurology"
        deptCode = "NEURO"
        description = "Brain and nervous system disorders"
        departmentType = "Clinical"
        headOfDepartment = "Dr. Ramesh Kumar"
        contactEmail = "neuro@apollohospitals.com"
        contactPhone = "+91-44-28296008"
        bedCount = 45
        isActive = $true
        isEmergencyDept = $true
    },
    @{
        name = "Oncology"
        deptCode = "ONCO"
        description = "Cancer diagnosis and treatment"
        departmentType = "Clinical"
        headOfDepartment = "Dr. Anita Desai"
        contactEmail = "oncology@apollohospitals.com"
        contactPhone = "+91-44-28296009"
        bedCount = 70
        isActive = $true
        isEmergencyDept = $false
    }
)

$createdDepartments = @()
foreach ($dept in $departmentsData) {
    try {
        $body = $dept | ConvertTo-Json
        $result = Invoke-RestMethod -Uri "$ApiUrl/departments" -Method Post -Body $body -Headers $headers
        $createdDepartments += $result
        Write-Host "      ✓ $($dept.name)" -ForegroundColor Green
    } catch {
        Write-Host "      - $($dept.name) (error)" -ForegroundColor DarkGray
    }
}

# ========================================
# Step 6: Create Users
# ========================================
Write-Host "`n[6/6] 👤 Creating Users..." -ForegroundColor Yellow
$usersData = @(
    @{
        userName = "dr.rajesh.kumar@apollohospitals.com"
        email = "dr.rajesh.kumar@apollohospitals.com"
        password = "Doctor@123456"
        firstName = "Rajesh"
        lastName = "Kumar"
        phoneNumber = "+91-98400-11111"
        userType = "Doctor"
        designation = "Senior Ophthalmologist"
        specialization = "Cataract and Glaucoma"
        licenseNumber = "MCI-12345"
        isActive = $true
        mustChangePassword = $false
    },
    @{
        userName = "dr.sanjay.mehta@apollohospitals.com"
        email = "dr.sanjay.mehta@apollohospitals.com"
        password = "Doctor@123456"
        firstName = "Sanjay"
        lastName = "Mehta"
        phoneNumber = "+91-98400-22222"
        userType = "Doctor"
        designation = "Consultant Cardiologist"
        specialization = "Interventional Cardiology"
        licenseNumber = "MCI-12346"
        isActive = $true
        mustChangePassword = $false
    },
    @{
        userName = "dr.priya.sharma@apollohospitals.com"
        email = "dr.priya.sharma@apollohospitals.com"
        password = "Doctor@123456"
        firstName = "Priya"
        lastName = "Sharma"
        phoneNumber = "+91-98400-33333"
        userType = "Doctor"
        designation = "Pediatrician"
        specialization = "Child Health"
        licenseNumber = "MCI-12347"
        isActive = $true
        mustChangePassword = $false
    },
    @{
        userName = "dr.vikram.singh@apollohospitals.com"
        email = "dr.vikram.singh@apollohospitals.com"
        password = "Doctor@123456"
        firstName = "Vikram"
        lastName = "Singh"
        phoneNumber = "+91-98400-44444"
        userType = "Doctor"
        designation = "Orthopedic Surgeon"
        specialization = "Joint Replacement"
        licenseNumber = "MCI-12348"
        isActive = $true
        mustChangePassword = $false
    },
    @{
        userName = "nurse.anjali@apollohospitals.com"
        email = "nurse.anjali@apollohospitals.com"
        password = "Nurse@123456"
        firstName = "Anjali"
        lastName = "Verma"
        phoneNumber = "+91-98400-55555"
        userType = "Nurse"
        designation = "Senior Staff Nurse"
        licenseNumber = "INC-45678"
        isActive = $true
        mustChangePassword = $false
    },
    @{
        userName = "nurse.meera@apollohospitals.com"
        email = "nurse.meera@apollohospitals.com"
        password = "Nurse@123456"
        firstName = "Meera"
        lastName = "Nair"
        phoneNumber = "+91-98400-66666"
        userType = "Nurse"
        designation = "Staff Nurse"
        licenseNumber = "INC-45679"
        isActive = $true
        mustChangePassword = $false
    },
    @{
        userName = "reception.suresh@apollohospitals.com"
        email = "reception.suresh@apollohospitals.com"
        password = "Staff@123456"
        firstName = "Suresh"
        lastName = "Iyer"
        phoneNumber = "+91-98400-77777"
        userType = "Administrative"
        designation = "Senior Receptionist"
        isActive = $true
        mustChangePassword = $false
    },
    @{
        userName = "lab.tech.ravi@apollohospitals.com"
        email = "lab.tech.ravi@apollohospitals.com"
        password = "Staff@123456"
        firstName = "Ravi"
        lastName = "Kumar"
        phoneNumber = "+91-98400-88888"
        userType = "Technician"
        designation = "Senior Lab Technician"
        licenseNumber = "LAB-67890"
        isActive = $true
        mustChangePassword = $false
    },
    @{
        userName = "pharma.lakshmi@apollohospitals.com"
        email = "pharma.lakshmi@apollohospitals.com"
        password = "Staff@123456"
        firstName = "Lakshmi"
        lastName = "Devi"
        phoneNumber = "+91-98400-99999"
        userType = "Pharmacist"
        designation = "Chief Pharmacist"
        licenseNumber = "PHARM-11111"
        isActive = $true
        mustChangePassword = $false
    },
    @{
        userName = "billing.ramesh@apollohospitals.com"
        email = "billing.ramesh@apollohospitals.com"
        password = "Staff@123456"
        firstName = "Ramesh"
        lastName = "Reddy"
        phoneNumber = "+91-98400-10101"
        userType = "Administrative"
        designation = "Billing Officer"
        isActive = $true
        mustChangePassword = $false
    }
)

$createdUsers = @()
foreach ($user in $usersData) {
    try {
        $body = $user | ConvertTo-Json
        $result = Invoke-RestMethod -Uri "$ApiUrl/users" -Method Post -Body $body -Headers $headers
        $createdUsers += $result
        Write-Host "      ✓ $($user.firstName) $($user.lastName) - $($user.userType)" -ForegroundColor Green
    } catch {
        Write-Host "      - $($user.email) (may exist)" -ForegroundColor DarkGray
    }
}

# Optional: Seed comprehensive staff
if ($RunStaffSeed) {
    Write-Host "`n[Optional] 🌱 Running comprehensive staff seeding..." -ForegroundColor Yellow
    $seedScript = Join-Path -Path (Get-Location) -ChildPath "seed_comprehensive_staff.ps1"
    if (Test-Path $seedScript) {
        try {
            & $seedScript -ApiUrl $ApiUrl -AdminEmail $AdminEmail -AdminPassword $AdminPassword -TenantId $TenantId
            Write-Host "  ✓ seed_comprehensive_staff completed" -ForegroundColor Green
        } catch {
            Write-Host "  ⚠ seed_comprehensive_staff failed: $($_.Exception.Message)" -ForegroundColor Yellow
        }
    } else {
        Write-Host "  ⚠ seed_comprehensive_staff.ps1 not found in folder: $(Get-Location)" -ForegroundColor Yellow
    }
}

# ========================================
# Verification Summary
# ========================================
Write-Host "`n" -NoNewline
Write-Host "╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                   SEEDING COMPLETE                        ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

Write-Host "📊 Data Summary:" -ForegroundColor Cyan
Write-Host ""

try {
    $users = Invoke-RestMethod -Uri "$ApiUrl/users" -Method Get -Headers $headers
    Write-Host "   Users:         $($users.Count) users" -ForegroundColor White
} catch { Write-Host "   Users:         Error fetching" -ForegroundColor Red }

try {
    $tenants = Invoke-RestMethod -Uri "$ApiUrl/tenants" -Method Get -Headers $headers
    Write-Host "   Tenants:       $($tenants.Count) tenants" -ForegroundColor White
} catch { Write-Host "   Tenants:       Error fetching" -ForegroundColor Red }

try {
    $roles = Invoke-RestMethod -Uri "$ApiUrl/roles" -Method Get -Headers $headers
    Write-Host "   Roles:         $($roles.Count) roles" -ForegroundColor White
} catch { Write-Host "   Roles:         Error fetching" -ForegroundColor Red }

try {
    $orgs = Invoke-RestMethod -Uri "$ApiUrl/organizations" -Method Get -Headers $headers
    Write-Host "   Organizations: $($orgs.Count) organizations" -ForegroundColor White
} catch { Write-Host "   Organizations: Error fetching" -ForegroundColor Red }

try {
    $branches = Invoke-RestMethod -Uri "$ApiUrl/branches" -Method Get -Headers $headers
    Write-Host "   Branches:      $($branches.Count) branches" -ForegroundColor White
} catch { Write-Host "   Branches:      Error fetching" -ForegroundColor Red }

try {
    $depts = Invoke-RestMethod -Uri "$ApiUrl/departments" -Method Get -Headers $headers
    Write-Host "   Departments:   $($depts.Count) departments" -ForegroundColor White
} catch { Write-Host "   Departments:   Error fetching" -ForegroundColor Red }

Write-Host ""
Write-Host "🌐 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Logout and login again in your browser" -ForegroundColor White
Write-Host "   2. Navigate to Admin Management pages" -ForegroundColor White
Write-Host "   3. All seeded data should now be visible" -ForegroundColor White
Write-Host ""
Write-Host "✨ Happy Testing! ✨" -ForegroundColor Yellow
Write-Host ""
