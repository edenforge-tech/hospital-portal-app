# Quick Seed Script - Run after backend is running
$ApiUrl = "http://localhost:5073/api"
$TenantId = "11111111-1111-1111-1111-111111111111"

Write-Host "`n=== APOLLO HOSPITAL DATA SEEDING ===`n" -ForegroundColor Cyan

# Login
$lr = Invoke-RestMethod -Uri "$ApiUrl/auth/login" -Method Post -Body '{"email":"admin@hospital.com","password":"Admin@123456","tenantId":"11111111-1111-1111-1111-111111111111"}' -ContentType "application/json"
$h = @{ "Authorization" = "Bearer $($lr.accessToken)"; "X-Tenant-ID" = $TenantId; "Content-Type" = "application/json" }

# Seed Departments (8 departments)
Write-Host "[1/4] Departments: " -ForegroundColor Yellow -NoNewline
$depts = @(
    '{"name":"Ophthalmology","deptCode":"OPHTHAL","description":"Eye care services","isActive":true}',
    '{"name":"Cardiology","deptCode":"CARDIO","description":"Heart care services","isActive":true}',
    '{"name":"Orthopedics","deptCode":"ORTHO","description":"Bone and joint care","isActive":true}',
    '{"name":"Pediatrics","deptCode":"PEDIA","description":"Child healthcare","isActive":true}',
    '{"name":"Emergency","deptCode":"EMERG","description":"24x7 Emergency care","isActive":true}',
    '{"name":"Radiology","deptCode":"RADIO","description":"Medical imaging","isActive":true}',
    '{"name":"Laboratory","deptCode":"LAB","description":"Clinical lab services","isActive":true}',
    '{"name":"Pharmacy","deptCode":"PHARM","description":"Medication management","isActive":true}'
)
$count = 0
foreach ($d in $depts) { try { Invoke-RestMethod -Uri "$ApiUrl/departments" -Method Post -Body $d -Headers $h | Out-Null ; $count++ } catch {} }
Write-Host "$count created" -ForegroundColor Green

# Seed Organizations (3 organizations)
Write-Host "[2/4] Organizations: " -ForegroundColor Yellow -NoNewline
$orgs = @(
    '{"name":"Apollo Hospitals HQ","orgCode":"APL-HQ","orgType":"Corporate","city":"Chennai","state":"Tamil Nadu","country":"India","email":"hq@apollo.com","isActive":true}',
    '{"name":"Apollo Chennai","orgCode":"APL-CHN","orgType":"Hospital","city":"Chennai","state":"Tamil Nadu","country":"India","email":"chennai@apollo.com","isActive":true}',
    '{"name":"Apollo Mumbai","orgCode":"APL-MUM","orgType":"Hospital","city":"Mumbai","state":"Maharashtra","country":"India","email":"mumbai@apollo.com","isActive":true}'
)
$count = 0
foreach ($o in $orgs) { try { Invoke-RestMethod -Uri "$ApiUrl/organizations" -Method Post -Body $o -Headers $h | Out-Null ; $count++ } catch {} }
Write-Host "$count created" -ForegroundColor Green

# Seed Branches (3 branches)
Write-Host "[3/4] Branches: " -ForegroundColor Yellow -NoNewline
$branches = @(
    '{"name":"Apollo Main Hospital - Chennai","branchCode":"APL-CHN-M","city":"Chennai","state":"Tamil Nadu","country":"India","phone":"+91-44-28296000","email":"chennai.main@apollo.com","isActive":true}',
    '{"name":"Apollo Clinic - Nungambakkam","branchCode":"APL-CHN-N","city":"Chennai","state":"Tamil Nadu","country":"India","phone":"+91-44-42424242","email":"nungambakkam@apollo.com","isActive":true}',
    '{"name":"Apollo Hospital - Mumbai","branchCode":"APL-MUM-M","city":"Mumbai","state":"Maharashtra","country":"India","phone":"+91-22-43434343","email":"mumbai@apollo.com","isActive":true}'
)
$count = 0
foreach ($b in $branches) { try { Invoke-RestMethod -Uri "$ApiUrl/branches" -Method Post -Body $b -Headers $h | Out-Null ; $count++ } catch {} }
Write-Host "$count created" -ForegroundColor Green

# Seed Users (6 users)
Write-Host "[4/4] Users: " -ForegroundColor Yellow -NoNewline
$users = @(
    '{"userName":"dr.rajesh@apollo.com","email":"dr.rajesh@apollo.com","password":"Doctor@123456","firstName":"Rajesh","lastName":"Kumar","phoneNumber":"+91-98400-11111","userType":"Doctor","isActive":true,"mustChangePassword":false}',
    '{"userName":"dr.priya@apollo.com","email":"dr.priya@apollo.com","password":"Doctor@123456","firstName":"Priya","lastName":"Sharma","phoneNumber":"+91-98400-22222","userType":"Doctor","isActive":true,"mustChangePassword":false}',
    '{"userName":"dr.vikram@apollo.com","email":"dr.vikram@apollo.com","password":"Doctor@123456","firstName":"Vikram","lastName":"Singh","phoneNumber":"+91-98400-33333","userType":"Doctor","isActive":true,"mustChangePassword":false}',
    '{"userName":"nurse.anjali@apollo.com","email":"nurse.anjali@apollo.com","password":"Nurse@123456","firstName":"Anjali","lastName":"Verma","phoneNumber":"+91-98400-44444","userType":"Nurse","isActive":true,"mustChangePassword":false}',
    '{"userName":"reception.suresh@apollo.com","email":"reception.suresh@apollo.com","password":"Staff@123456","firstName":"Suresh","lastName":"Iyer","phoneNumber":"+91-98400-55555","userType":"Administrative","isActive":true,"mustChangePassword":false}',
    '{"userName":"pharma.lakshmi@apollo.com","email":"pharma.lakshmi@apollo.com","password":"Staff@123456","firstName":"Lakshmi","lastName":"Devi","phoneNumber":"+91-98400-66666","userType":"Pharmacist","isActive":true,"mustChangePassword":false}'
)
$count = 0
foreach ($u in $users) { try { Invoke-RestMethod -Uri "$ApiUrl/users" -Method Post -Body $u -Headers $h | Out-Null ; $count++ } catch {} }
Write-Host "$count created" -ForegroundColor Green

# Final counts
Write-Host "`n📊 FINAL DATA COUNTS:" -ForegroundColor Cyan
$users = Invoke-RestMethod -Uri "$ApiUrl/users" -Method Get -Headers $h
$tenants = Invoke-RestMethod -Uri "$ApiUrl/tenants" -Method Get -Headers $h
$roles = Invoke-RestMethod -Uri "$ApiUrl/roles" -Method Get -Headers $h
$orgs = Invoke-RestMethod -Uri "$ApiUrl/organizations" -Method Get -Headers $h
$branches = Invoke-RestMethod -Uri "$ApiUrl/branches" -Method Get -Headers $h
$depts = Invoke-RestMethod -Uri "$ApiUrl/departments" -Method Get -Headers $h

Write-Host "   Users:         $($users.Count)" -ForegroundColor White
Write-Host "   Tenants:       $($tenants.Count)" -ForegroundColor White
Write-Host "   Roles:         $($roles.Count)" -ForegroundColor White
Write-Host "   Organizations: $($orgs.Count)" -ForegroundColor White
Write-Host "   Branches:      $($branches.Count)" -ForegroundColor White
Write-Host "   Departments:   $($depts.Count)" -ForegroundColor White

Write-Host "`nSeeding complete! Now refresh your browser and check admin pages." -ForegroundColor Green
Write-Host ""

# Optional: run full seeder if present (this runs the complete dataset and optionally staff)
$fullScript = Join-Path -Path (Get-Location) -ChildPath "seed_complete_hospital_data.ps1"
if (Test-Path $fullScript) {
    Write-Host "\nℹ️  Found seed_complete_hospital_data.ps1, running full seeder (includes staff seed)" -ForegroundColor Cyan
    try {
        & $fullScript -ApiUrl $ApiUrl -AdminEmail "admin@hospital.com" -AdminPassword "Admin@123456" -TenantId $TenantId -RunStaffSeed $true
    } catch {
        Write-Host "⚠ Full seeder failed: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}
