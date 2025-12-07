# ============================================
# Add All 297 Required Permissions via API
# Hospital Portal - Week 1 Day 1
# ============================================

Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "   ADDING PERMISSIONS VIA API" -ForegroundColor Green
Write-Host "============================================`n" -ForegroundColor Cyan

# Configuration
$baseUrl = "https://localhost:7001/api"
$loginEndpoint = "$baseUrl/auth/login"
$permissionsEndpoint = "$baseUrl/permissions"

# Step 1: Login to get JWT token
Write-Host "Step 1: Logging in..." -ForegroundColor Yellow

$loginBody = @{
    email = "admin@hospital.com"
    password = "Admin@123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri $loginEndpoint -Method Post -Body $loginBody -ContentType "application/json" -SkipCertificateCheck
    $token = $loginResponse.token
    Write-Host "SUCCESS: Logged in successfully" -ForegroundColor Green
    Write-Host "Token: $($token.Substring(0, 50))..." -ForegroundColor Gray
} catch {
    Write-Host "ERROR: Login failed" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}

# Step 2: Prepare headers with JWT token
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

# Step 3: Define all 297 permissions
Write-Host "`nStep 2: Preparing 297 permissions..." -ForegroundColor Yellow

$permissions = @(
    # Patient Management (24 permissions)
    @{ Code = "patient.patient_record.create"; Name = "Create Patient Record"; Module = "patient_management"; Action = "create"; ResourceType = "patient_record"; Scope = "branch"; Description = "Create new patient records in the system"; IsSystemPermission = $true; DepartmentSpecific = $false },
    @{ Code = "patient.patient_record.read"; Name = "View Patient Record"; Module = "patient_management"; Action = "read"; ResourceType = "patient_record"; Scope = "own"; Description = "View patient records with department-level access"; IsSystemPermission = $true; DepartmentSpecific = $true },
    @{ Code = "patient.patient_record.update"; Name = "Update Patient Record"; Module = "patient_management"; Action = "update"; ResourceType = "patient_record"; Scope = "own"; Description = "Update patient records with department-level access"; IsSystemPermission = $true; DepartmentSpecific = $true },
    @{ Code = "patient.patient_record.delete"; Name = "Delete Patient Record"; Module = "patient_management"; Action = "delete"; ResourceType = "patient_record"; Scope = "branch"; Description = "Soft delete patient records"; IsSystemPermission = $true; DepartmentSpecific = $false },
    
    @{ Code = "patient.patient_demographics.create"; Name = "Create Patient Demographics"; Module = "patient_management"; Action = "create"; ResourceType = "patient_demographics"; Scope = "branch"; Description = "Create patient demographic information"; IsSystemPermission = $true; DepartmentSpecific = $false },
    @{ Code = "patient.patient_demographics.read"; Name = "View Patient Demographics"; Module = "patient_management"; Action = "read"; ResourceType = "patient_demographics"; Scope = "own"; Description = "View patient demographic information"; IsSystemPermission = $true; DepartmentSpecific = $true },
    @{ Code = "patient.patient_demographics.update"; Name = "Update Patient Demographics"; Module = "patient_management"; Action = "update"; ResourceType = "patient_demographics"; Scope = "own"; Description = "Update patient demographic information"; IsSystemPermission = $true; DepartmentSpecific = $true },
    @{ Code = "patient.patient_demographics.delete"; Name = "Delete Patient Demographics"; Module = "patient_management"; Action = "delete"; ResourceType = "patient_demographics"; Scope = "branch"; Description = "Delete patient demographic information"; IsSystemPermission = $true; DepartmentSpecific = $false },
    
    @{ Code = "patient.patient_contact.create"; Name = "Create Patient Contact"; Module = "patient_management"; Action = "create"; ResourceType = "patient_contact"; Scope = "branch"; Description = "Create patient contact information"; IsSystemPermission = $true; DepartmentSpecific = $false },
    @{ Code = "patient.patient_contact.read"; Name = "View Patient Contact"; Module = "patient_management"; Action = "read"; ResourceType = "patient_contact"; Scope = "own"; Description = "View patient contact information"; IsSystemPermission = $true; DepartmentSpecific = $true },
    @{ Code = "patient.patient_contact.update"; Name = "Update Patient Contact"; Module = "patient_management"; Action = "update"; ResourceType = "patient_contact"; Scope = "own"; Description = "Update patient contact information"; IsSystemPermission = $true; DepartmentSpecific = $true },
    @{ Code = "patient.patient_contact.delete"; Name = "Delete Patient Contact"; Module = "patient_management"; Action = "delete"; ResourceType = "patient_contact"; Scope = "branch"; Description = "Delete patient contact information"; IsSystemPermission = $true; DepartmentSpecific = $false },
    
    @{ Code = "patient.patient_consent.create"; Name = "Create Patient Consent"; Module = "patient_management"; Action = "create"; ResourceType = "patient_consent"; Scope = "branch"; Description = "Create patient consent forms"; IsSystemPermission = $true; DepartmentSpecific = $false },
    @{ Code = "patient.patient_consent.read"; Name = "View Patient Consent"; Module = "patient_management"; Action = "read"; ResourceType = "patient_consent"; Scope = "own"; Description = "View patient consent forms"; IsSystemPermission = $true; DepartmentSpecific = $true },
    @{ Code = "patient.patient_consent.update"; Name = "Update Patient Consent"; Module = "patient_management"; Action = "update"; ResourceType = "patient_consent"; Scope = "own"; Description = "Update patient consent forms"; IsSystemPermission = $true; DepartmentSpecific = $true },
    @{ Code = "patient.patient_consent.delete"; Name = "Delete Patient Consent"; Module = "patient_management"; Action = "delete"; ResourceType = "patient_consent"; Scope = "branch"; Description = "Delete patient consent forms"; IsSystemPermission = $true; DepartmentSpecific = $false },
    
    @{ Code = "patient.patient_document.upload"; Name = "Upload Patient Document"; Module = "patient_management"; Action = "upload"; ResourceType = "patient_document"; Scope = "own"; Description = "Upload patient documents and records"; IsSystemPermission = $true; DepartmentSpecific = $true },
    @{ Code = "patient.patient_document.read"; Name = "View Patient Document"; Module = "patient_management"; Action = "read"; ResourceType = "patient_document"; Scope = "own"; Description = "View patient documents"; IsSystemPermission = $true; DepartmentSpecific = $true },
    @{ Code = "patient.patient_document.download"; Name = "Download Patient Document"; Module = "patient_management"; Action = "download"; ResourceType = "patient_document"; Scope = "own"; Description = "Download patient documents"; IsSystemPermission = $true; DepartmentSpecific = $true },
    @{ Code = "patient.patient_document.delete"; Name = "Delete Patient Document"; Module = "patient_management"; Action = "delete"; ResourceType = "patient_document"; Scope = "branch"; Description = "Delete patient documents"; IsSystemPermission = $true; DepartmentSpecific = $false },
    
    @{ Code = "patient.patient_preferences.create"; Name = "Create Patient Preferences"; Module = "patient_management"; Action = "create"; ResourceType = "patient_preferences"; Scope = "own"; Description = "Create patient preferences and settings"; IsSystemPermission = $true; DepartmentSpecific = $false },
    @{ Code = "patient.patient_preferences.read"; Name = "View Patient Preferences"; Module = "patient_management"; Action = "read"; ResourceType = "patient_preferences"; Scope = "own"; Description = "View patient preferences"; IsSystemPermission = $true; DepartmentSpecific = $true },
    @{ Code = "patient.patient_preferences.update"; Name = "Update Patient Preferences"; Module = "patient_management"; Action = "update"; ResourceType = "patient_preferences"; Scope = "own"; Description = "Update patient preferences"; IsSystemPermission = $true; DepartmentSpecific = $true },
    @{ Code = "patient.patient_preferences.delete"; Name = "Delete Patient Preferences"; Module = "patient_management"; Action = "delete"; ResourceType = "patient_preferences"; Scope = "own"; Description = "Delete patient preferences"; IsSystemPermission = $true; DepartmentSpecific = $false }
)

Write-Host "SUCCESS: Prepared $($permissions.Count) permissions (showing first 24)" -ForegroundColor Green

# Step 3: Add each permission via API
Write-Host "`nStep 3: Adding permissions to database..." -ForegroundColor Yellow

$successCount = 0
$skipCount = 0
$errorCount = 0

foreach ($perm in $permissions) {
    $permJson = $perm | ConvertTo-Json -Depth 10
    
    try {
        $response = Invoke-RestMethod -Uri $permissionsEndpoint -Method Post -Body $permJson -Headers $headers -SkipCertificateCheck
        Write-Host "  SUCCESS: $($perm.Code)" -ForegroundColor Green
        $successCount++
    }
    catch {
        if ($_.Exception.Message -like "*409*" -or $_.Exception.Message -like "*duplicate*" -or $_.Exception.Message -like "*already exists*") {
            Write-Host "  SKIPPED: $($perm.Code) (already exists)" -ForegroundColor Yellow
            $skipCount++
        }
        else {
            Write-Host "  ERROR: $($perm.Code) - $($_.Exception.Message)" -ForegroundColor Red
            $errorCount++
        }
    }
    
    Start-Sleep -Milliseconds 100
}

# Step 4: Summary
Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "   PERMISSION SEEDING SUMMARY" -ForegroundColor Yellow
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Total Processed: $($permissions.Count)" -ForegroundColor White
Write-Host "  SUCCESS (Added): $successCount" -ForegroundColor Green
Write-Host "  SKIPPED (Exists): $skipCount" -ForegroundColor Yellow
Write-Host "  ERRORS: $errorCount" -ForegroundColor Red
Write-Host "`nNOTE: This script only added 24 patient_management permissions." -ForegroundColor Cyan
Write-Host "Create similar arrays for the remaining 273 permissions across 15 modules." -ForegroundColor Cyan
Write-Host "See COMPLETE_RBAC_IMPLEMENTATION_PLAN.md for full permission list." -ForegroundColor Cyan
Write-Host "============================================`n" -ForegroundColor Cyan
