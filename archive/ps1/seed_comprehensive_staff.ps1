# Comprehensive Eye Hospital Staff Seeding Script
# Creates 60+ users across all roles and departments

param(
    [string]$ApiUrl = "http://localhost:5073/api",
    [string]$AdminEmail = "admin@hospital.com",
    [string]$AdminPassword = "Admin@123456",
    [string]$TenantId = "11111111-1111-1111-1111-111111111111"
)

Write-Host "`n╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   EYE HOSPITAL COMPREHENSIVE STAFF SEEDING               ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

# Login and get token
Write-Host "`n[1/4] Authenticating..." -ForegroundColor Yellow
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
    Write-Host "✓ Authenticated as $AdminEmail" -ForegroundColor Green
} catch {
    Write-Host "✗ Authentication failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Fetch departments and roles for mapping
Write-Host "`n[2/4] Fetching departments and roles..." -ForegroundColor Yellow
$departments = Invoke-RestMethod -Uri "$ApiUrl/departments" -Method Get -Headers $headers
$roles = Invoke-RestMethod -Uri "$ApiUrl/roles" -Method Get -Headers $headers
$branches = Invoke-RestMethod -Uri "$ApiUrl/branches" -Method Get -Headers $headers

Write-Host "✓ Loaded $($departments.Count) departments, $($roles.Count) roles, $($branches.branches.Count) branches" -ForegroundColor Green

# Helper function to find department by name
function Get-DepartmentId {
    param([string]$Name)
    $dept = $departments | Where-Object { $_.departmentName -eq $Name } | Select-Object -First 1
    return $dept.id
}

# Helper function to find role by name
function Get-RoleId {
    param([string]$Name)
    $role = $roles | Where-Object { $_.name -eq $Name } | Select-Object -First 1
    return $role.id
}

# Helper function to find branch by name pattern
function Get-BranchId {
    param([string]$Pattern)
    $branch = $branches.branches | Where-Object { $_.name -like "*$Pattern*" } | Select-Object -First 1
    return $branch.id
}

# Comprehensive staff list with role and department mapping
Write-Host "`n[3/4] Creating 60 eye hospital staff users..." -ForegroundColor Yellow

$staff = @(
    # OPHTHALMOLOGISTS (10) - Eye Surgeons and Physicians
    @{FirstName="Rajesh";LastName="Kumar";Email="rajesh.kumar@hospital.com";Role="Ophthalmologist";Dept="Cataract Surgery";Branch="Sankara";Specialty="Cataract Surgeon"},
    @{FirstName="Priya";LastName="Sharma";Email="priya.sharma@hospital.com";Role="Ophthalmologist";Dept="Cataract Surgery";Branch="Aravind";Specialty="Cataract Surgeon"},
    @{FirstName="Vikram";LastName="Reddy";Email="vikram.reddy@hospital.com";Role="Ophthalmologist";Dept="Retina and Vitreous";Branch="LVPEI";Specialty="Retina Specialist"},
    @{FirstName="Anjali";LastName="Menon";Email="anjali.menon@hospital.com";Role="Ophthalmologist";Dept="Retina and Vitreous";Branch="Sankara";Specialty="Retina Specialist"},
    @{FirstName="Suresh";LastName="Babu";Email="suresh.babu@hospital.com";Role="Ophthalmologist";Dept="Glaucoma Services";Branch="Aravind";Specialty="Glaucoma Specialist"},
    @{FirstName="Deepa";LastName="Krishnan";Email="deepa.krishnan@hospital.com";Role="Ophthalmologist";Dept="Glaucoma Services";Branch="LVPEI";Specialty="Glaucoma Specialist"},
    @{FirstName="Arun";LastName="Nair";Email="arun.nair@hospital.com";Role="Ophthalmologist";Dept="Cornea Services";Branch="Sankara";Specialty="Cornea Specialist"},
    @{FirstName="Lakshmi";LastName="Iyer";Email="lakshmi.iyer@hospital.com";Role="Ophthalmologist";Dept="Pediatric Ophthalmology";Branch="Aravind";Specialty="Pediatric Eye Specialist"},
    @{FirstName="Karthik";LastName="Rao";Email="karthik.rao@hospital.com";Role="Ophthalmologist";Dept="Oculoplasty";Branch="LVPEI";Specialty="Oculoplastic Surgeon"},
    @{FirstName="Meera";LastName="Patel";Email="meera.patel@hospital.com";Role="Ophthalmologist";Dept="Neuro-Ophthalmology";Branch="Sankara";Specialty="Neuro-Ophthalmologist"},
    
    # OPTOMETRISTS (8) - Vision Care Specialists
    @{FirstName="Ravi";LastName="Varma";Email="ravi.varma@hospital.com";Role="Optometrist";Dept="Contact Lens Clinic";Branch="Aravind";Specialty="Contact Lens Specialist"},
    @{FirstName="Sneha";LastName="Pillai";Email="sneha.pillai@hospital.com";Role="Optometrist";Dept="Contact Lens Clinic";Branch="LVPEI";Specialty="Contact Lens Specialist"},
    @{FirstName="Naveen";LastName="Kumar";Email="naveen.kumar@hospital.com";Role="Optometrist";Dept="General OPD";Branch="Sankara";Specialty="Refraction Specialist"},
    @{FirstName="Divya";LastName="Menon";Email="divya.menon@hospital.com";Role="Optometrist";Dept="General OPD";Branch="Aravind";Specialty="Refraction Specialist"},
    @{FirstName="Arjun";LastName="Nair";Email="arjun.nair@hospital.com";Role="Optometrist";Dept="General OPD";Branch="LVPEI";Specialty="Refraction Specialist"},
    @{FirstName="Kavya";LastName="Reddy";Email="kavya.reddy@hospital.com";Role="Optometrist";Dept="General OPD";Branch="Sankara";Specialty="Refraction Specialist"},
    @{FirstName="Mohan";LastName="Das";Email="mohan.das@hospital.com";Role="Optometrist";Dept="Low Vision Clinic";Branch="Aravind";Specialty="Low Vision Specialist"},
    @{FirstName="Sunita";LastName="Rao";Email="sunita.rao@hospital.com";Role="Optometrist";Dept="Low Vision Clinic";Branch="LVPEI";Specialty="Low Vision Specialist"},
    
    # CLINICAL STAFF (12) - Nurses, Ward Managers, OT Staff
    @{FirstName="Anitha";LastName="Kumar";Email="anitha.kumar@hospital.com";Role="Ophthalmic Nurse";Dept="Operation Theatre";Branch="Sankara";Specialty="OT Nurse"},
    @{FirstName="Radha";LastName="Krishnan";Email="radha.krishnan@hospital.com";Role="Ophthalmic Nurse";Dept="Operation Theatre";Branch="Aravind";Specialty="OT Nurse"},
    @{FirstName="Suma";LastName="Nair";Email="suma.nair@hospital.com";Role="Ophthalmic Nurse";Dept="Wards IPD";Branch="LVPEI";Specialty="Ward Nurse"},
    @{FirstName="Rekha";LastName="Pillai";Email="rekha.pillai@hospital.com";Role="Ophthalmic Nurse";Dept="Wards IPD";Branch="Sankara";Specialty="Ward Nurse"},
    @{FirstName="Malini";LastName="Iyer";Email="malini.iyer@hospital.com";Role="Ophthalmic Nurse";Dept="Emergency Casualty";Branch="Aravind";Specialty="Emergency Nurse"},
    @{FirstName="Vani";LastName="Reddy";Email="vani.reddy@hospital.com";Role="Ophthalmic Nurse";Dept="General OPD";Branch="LVPEI";Specialty="Clinic Nurse"},
    @{FirstName="Savitri";LastName="Menon";Email="savitri.menon@hospital.com";Role="Ward Manager";Dept="Wards IPD";Branch="Sankara";Specialty="Ward Supervisor"},
    @{FirstName="Kamala";LastName="Rao";Email="kamala.rao@hospital.com";Role="Ward Manager";Dept="Wards IPD";Branch="Aravind";Specialty="Ward Supervisor"},
    @{FirstName="Ganesh";LastName="Babu";Email="ganesh.babu@hospital.com";Role="OT Manager";Dept="Operation Theatre";Branch="LVPEI";Specialty="OT Supervisor"},
    @{FirstName="Srinivas";LastName="Reddy";Email="srinivas.reddy@hospital.com";Role="OT Manager";Dept="Operation Theatre";Branch="Sankara";Specialty="OT Supervisor"},
    @{FirstName="Krishna";LastName="Murthy";Email="krishna.murthy@hospital.com";Role="Doctor";Dept="Emergency Casualty";Branch="Aravind";Specialty="Emergency Physician"},
    @{FirstName="Ramesh";LastName="Kumar";Email="ramesh.kumar@hospital.com";Role="Doctor";Dept="General OPD";Branch="LVPEI";Specialty="General Practitioner"},
    
    # DIAGNOSTIC STAFF (10) - Lab, Imaging, Pharmacy, Optical
    @{FirstName="Venkat";LastName="Rao";Email="venkat.rao@hospital.com";Role="Lab Technician";Dept="Laboratory";Branch="Sankara";Specialty="Clinical Pathology"},
    @{FirstName="Santosh";LastName="Kumar";Email="santosh.kumar@hospital.com";Role="Lab Technician";Dept="Laboratory";Branch="Aravind";Specialty="Microbiology"},
    @{FirstName="Madhavi";LastName="Reddy";Email="madhavi.reddy@hospital.com";Role="Lab Technician";Dept="Laboratory";Branch="LVPEI";Specialty="Biochemistry"},
    @{FirstName="Vinod";LastName="Nair";Email="vinod.nair@hospital.com";Role="Imaging Technician";Dept="Eye Imaging Center";Branch="Sankara";Specialty="OCT Specialist"},
    @{FirstName="Prasad";LastName="Menon";Email="prasad.menon@hospital.com";Role="Imaging Technician";Dept="Eye Imaging Center";Branch="Aravind";Specialty="Fundus Photography"},
    @{FirstName="Nisha";LastName="Pillai";Email="nisha.pillai@hospital.com";Role="Imaging Technician";Dept="Eye Imaging Center";Branch="LVPEI";Specialty="Perimetry Specialist"},
    @{FirstName="Rajesh";LastName="Iyer";Email="rajesh.iyer@hospital.com";Role="Pharmacist";Dept="Pharmacy";Branch="Sankara";Specialty="Clinical Pharmacist"},
    @{FirstName="Gayatri";LastName="Rao";Email="gayatri.rao@hospital.com";Role="Pharmacist";Dept="Pharmacy";Branch="Aravind";Specialty="Clinical Pharmacist"},
    @{FirstName="Manoj";LastName="Kumar";Email="manoj.kumar@hospital.com";Role="Optician";Dept="Optical Shop";Branch="LVPEI";Specialty="Dispensing Optician"},
    @{FirstName="Seema";LastName="Reddy";Email="seema.reddy@hospital.com";Role="Sales Optician";Dept="Optical Shop";Branch="Sankara";Specialty="Optical Sales"},
    
    # ADMINISTRATIVE STAFF (15)
    @{FirstName="Padma";LastName="Lakshmi";Email="padma.lakshmi@hospital.com";Role="Receptionist";Dept="Front Office";Branch="Sankara";Specialty="Front Desk"},
    @{FirstName="Shalini";LastName="Nair";Email="shalini.nair@hospital.com";Role="Receptionist";Dept="Front Office";Branch="Aravind";Specialty="Front Desk"},
    @{FirstName="Revathi";LastName="Kumar";Email="revathi.kumar@hospital.com";Role="Receptionist";Dept="Front Office";Branch="LVPEI";Specialty="Front Desk"},
    @{FirstName="Bhavani";LastName="Reddy";Email="bhavani.reddy@hospital.com";Role="Registration Staff";Dept="Registration Billing";Branch="Sankara";Specialty="Patient Registration"},
    @{FirstName="Vasudha";LastName="Menon";Email="vasudha.menon@hospital.com";Role="Billing Staff";Dept="Registration Billing";Branch="Aravind";Specialty="Medical Billing"},
    @{FirstName="Anuradha";LastName="Rao";Email="anuradha.rao@hospital.com";Role="Billing Staff";Dept="Registration Billing";Branch="LVPEI";Specialty="Medical Billing"},
    @{FirstName="Subramanian";LastName="Iyer";Email="subramanian.iyer@hospital.com";Role="Accountant";Dept="Finance";Branch="Sankara";Specialty="Financial Accountant"},
    @{FirstName="Sridhar";LastName="Pillai";Email="sridhar.pillai@hospital.com";Role="Insurance Coordinator";Dept="Insurance TPA";Branch="Aravind";Specialty="Insurance Processing"},
    @{FirstName="Parvathi";LastName="Kumar";Email="parvathi.kumar@hospital.com";Role="MRD Staff";Dept="Medical Records";Branch="LVPEI";Specialty="Medical Records"},
    @{FirstName="Ramya";LastName="Reddy";Email="ramya.reddy@hospital.com";Role="MRD Staff";Dept="Medical Records";Branch="Sankara";Specialty="Medical Records"},
    @{FirstName="Krishnamurthy";LastName="Rao";Email="krishnamurthy.rao@hospital.com";Role="Admin Officer";Dept="Administration";Branch="Aravind";Specialty="Administration"},
    @{FirstName="Lakshman";LastName="Nair";Email="lakshman.nair@hospital.com";Role="HR Manager";Dept="Human Resources";Branch="LVPEI";Specialty="Human Resources"},
    @{FirstName="Narayanan";LastName="Pillai";Email="narayanan.pillai@hospital.com";Role="Finance Manager";Dept="Finance";Branch="Sankara";Specialty="Finance"},
    @{FirstName="Balaji";LastName="Kumar";Email="balaji.kumar@hospital.com";Role="IT Officer";Dept="IT HIS Support";Branch="Aravind";Specialty="IT Systems"},
    @{FirstName="Selvam";LastName="Reddy";Email="selvam.reddy@hospital.com";Role="Counselor";Dept="Front Office";Branch="LVPEI";Specialty="Patient Counseling"},
    
    # SUPPORT STAFF (5)
    @{FirstName="Murugan";LastName="Selvan";Email="murugan.selvan@hospital.com";Role="Maintenance Supervisor";Dept="Maintenance";Branch="Sankara";Specialty="Facility Maintenance"},
    @{FirstName="Senthil";LastName="Kumar";Email="senthil.kumar@hospital.com";Role="Biomedical Engineer";Dept="Maintenance";Branch="Aravind";Specialty="Medical Equipment"},
    @{FirstName="Raju";LastName="Naidu";Email="raju.naidu@hospital.com";Role="Security Officer";Dept="Security";Branch="LVPEI";Specialty="Security"},
    @{FirstName="Kuppusamy";LastName="Pillai";Email="kuppusamy.pillai@hospital.com";Role="Security Officer";Dept="Security";Branch="Sankara";Specialty="Security"},
    @{FirstName="Mangalam";LastName="Devi";Email="mangalam.devi@hospital.com";Role="Housekeeping Staff";Dept="Housekeeping";Branch="Aravind";Specialty="Housekeeping"},
    
    # REGULATORY STAFF (5)
    @{FirstName="Gopalakrishnan";LastName="Iyer";Email="gopalakrishnan.iyer@hospital.com";Role="Quality Manager";Dept="Quality NABH";Branch="Sankara";Specialty="Quality Assurance"},
    @{FirstName="Venkatesh";LastName="Rao";Email="venkatesh.rao@hospital.com";Role="Compliance Officer";Dept="Quality NABH";Branch="Aravind";Specialty="Compliance"},
    @{FirstName="Saraswathi";LastName="Menon";Email="saraswathi.menon@hospital.com";Role="Grievance Officer";Dept="Grievance PR";Branch="LVPEI";Specialty="Patient Relations"},
    @{FirstName="Murali";LastName="Nair";Email="murali.nair@hospital.com";Role="Outreach Coordinator";Dept="Community Outreach";Branch="Sankara";Specialty="Community Outreach"},
    @{FirstName="Bhaskar";LastName="Reddy";Email="bhaskar.reddy@hospital.com";Role="Research Fellow";Dept="Research Education";Branch="Aravind";Specialty="Clinical Research"}
)

$successCount = 0
$failCount = 0

foreach ($user in $staff) {
    $userBody = @{
        email = $user.Email
        password = "Hospital@123"  # Default password for all staff
        firstName = $user.FirstName
        lastName = $user.LastName
        tenantId = $TenantId
        mustChangePassword = $true
    } | ConvertTo-Json
    
    try {
        # Use POST /api/users for creating users; /auth/register is not available in demo backend
        $response = Invoke-RestMethod -Uri "$ApiUrl/users" -Method Post -Headers $headers -Body $userBody
        $createdUserId = $response.id
        Write-Host "  ✓ $($user.FirstName) $($user.LastName) ($($user.Role) - $($user.Dept)) - Registered (id: $createdUserId)" -ForegroundColor Green
        # After creating user, map role, branch, and department
        # Resolve roleId
        $roleObj = $roles | Where-Object { $_.name -eq $user.Role } | Select-Object -First 1
        $branchObj = $branches.branches | Where-Object { $_.name -like "*$($user.Branch)*" } | Select-Object -First 1
        $deptObj = $departments | Where-Object { $_.departmentName -eq $user.Dept } | Select-Object -First 1

        if ($roleObj) {
            $assignBody = @{ roleId = $roleObj.id }
            if ($branchObj) { $assignBody.branchId = $branchObj.id }
            $assignJson = $assignBody | ConvertTo-Json
            try {
                Invoke-RestMethod -Uri "$ApiUrl/users/$createdUserId/roles" -Method Post -Headers $headers -Body $assignJson -ContentType "application/json"
                Write-Host "    ▶ Assigned role: $($roleObj.name)" -ForegroundColor Green
            } catch {
                Write-Host "    ⚠ Role assign failed: $($_.Exception.Message)" -ForegroundColor Yellow
            }
        } else {
            Write-Host "    ⚠ Role not found: $($user.Role)" -ForegroundColor Yellow
        }

        # Assign department (primary)
        if ($deptObj) {
            $deptAssign = @(@{
                DepartmentId = $deptObj.id
                DepartmentName = $deptObj.departmentName
                IsPrimary = $true
                AccessLevel = "Full"
            }) | ConvertTo-Json
            try {
                Invoke-RestMethod -Uri "$ApiUrl/users/$createdUserId/departments" -Method Post -Headers $headers -Body $deptAssign -ContentType "application/json"
                Write-Host "    ▶ Assigned department: $($deptObj.departmentName)" -ForegroundColor Green
            } catch {
                Write-Host "    ⚠ Department assign failed: $($_.Exception.Message)" -ForegroundColor Yellow
            }
        }
        $successCount++
    } catch {
        $errorMsg = $_.Exception.Message
        if ($errorMsg -like "*already exists*" -or $errorMsg -like "*duplicate*") {
            Write-Host "  ⊙ $($user.FirstName) $($user.LastName) (already exists)" -ForegroundColor Yellow
        } else {
            Write-Host "  ✗ $($user.FirstName) $($user.LastName) - $errorMsg" -ForegroundColor Red
            $failCount++
        }
    }
}

Write-Host "`n[4/4] Summary" -ForegroundColor Yellow
Write-Host "✓ Created: $successCount users" -ForegroundColor Green
if ($failCount -gt 0) {
    Write-Host "✗ Failed: $failCount users" -ForegroundColor Red
}

Write-Host "`n╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   STAFF SEEDING COMPLETE!                                ║" -ForegroundColor Cyan
Write-Host "║   Next: Implement user-role and user-department mappings ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host "`nDefault password for all staff: Hospital@123" -ForegroundColor Yellow
Write-Host "All users must change password on first login.`n" -ForegroundColor Yellow
