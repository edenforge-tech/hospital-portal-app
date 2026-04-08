# Week 1 Test Data Creation Log
**Date**: February 23, 2026  
**Session**: Day 1 - User & Patient Creation  
**Status**: ✅ COMPLETE

---

## Admin Token
✅ Obtained and saved to `$global:adminToken`  
**Tenant ID**: 155fe198-6ae5-4a01-9254-ead5b427247e

---

## Test Users

### User 1: Counselor - Sarah Miller
**Status**: ✅ Created  
**Email**: sarah.miller@hospital.com  
**Password**: Counselor@12345  
**ID**: 019c88f8-a202-70ec-b486-d0ff3290f04c  
**Designation**: Senior Counselor  
**Employee ID**: COUNS001

### User 2: Doctor - John Smith  
**Status**: ✅ Created  
**Email**: john.smith@hospital.com  
**Password**: Doctor@12345  
**ID**: 019c88f8-da19-773e-89ac-6a61f3aad5a8  
**Designation**: Senior Ophthalmologist  
**Specialization**: Ophthalmology  
**License**: MED12345  
**Employee ID**: DOC001

### User 3: Doctor - Emily Chen
**Status**: ✅ Created  
**Email**: emily.chen@hospital.com  
**Password**: Doctor@12345  
**ID**: 019c88f8-dbea-78cc-b963-d3f325ab320b  
**Designation**: Ophthalmologist  
**Specialization**: Ophthalmology  
**License**: MED67890  
**Employee ID**: DOC002

### User 4: Payment Officer - Michael Johnson
**Status**: ✅ Created  
**Email**: michael.johnson@hospital.com  
**Password**: Payment@12345  
**ID**: 019c88f8-dd6e-7f89-bc07-6e1d4d165bb1  
**Designation**: Payment Officer  
**Employee ID**: PAY001

### User 5: Admin (Existing)
**Status**: ✅ Verified  
**Email**: admin@test.com  
**Password**: Admin123!  
**ID**: dddddddd-dddd-dddd-dddd-dddddddddddd

---

## Test Patients

### Patient 1: Rajesh Kumar
**Status**: ✅ Created  
**MRN**: MRN-2026-02-458C7  
**ID**: 5a4ca192-8060-4672-b212-cc1e7e8cc081  
**Gender**: Male  
**Age**: 45  
**DOB**: March 15, 1980  
**Phone**: +919845012345  
**Email**: rajesh.kumar@gmail.com  
**Blood Group**: O+  
**Chronic Conditions**: Type 2 Diabetes  
**Current Medications**: Metformin 500mg

### Patient 2: Priya Sharma
**Status**: ✅ Created  
**MRN**: MRN-2026-02-38A92  
**ID**: 910c6329-1de6-4dd1-9c37-dc0d44b332eb  
**Gender**: Female  
**Age**: 32  
**DOB**: July 22, 1993  
**Phone**: +919845067890  
**Email**: priya.sharma@gmail.com  
**Blood Group**: A+  
**Marital Status**: Single  
**Occupation**: Teacher

### Patient 3: Amit Patel
**Status**: ✅ Created  
**MRN**: MRN-2026-02-54567  
**ID**: f2fd249b-8e6c-4d16-83de-0e074c3935c6  
**Gender**: Male  
**Age**: 58  
**DOB**: November 8, 1967  
**Phone**: +919845098765  
**Email**: amit.patel@gmail.com  
**Blood Group**: B+  
**Chronic Conditions**: Hypertension  
**Current Medications**: Amlodipine 5mg

### Patient 4: Sunita Reddy
**Status**: ✅ Created  
**MRN**: MRN-2026-02-78F79  
**ID**: 47dfc88c-4b88-4706-bbd1-e4928c200634  
**Gender**: Female  
**Age**: 28  
**DOB**: April 30, 1997  
**Phone**: +919845054321  
**Email**: sunita.reddy@gmail.com  
**Blood Group**: AB+  
**Marital Status**: Single  
**Occupation**: Software Developer

### Patient 5: Vijay Singh
**Status**: ✅ Created  
**MRN**: MRN-2026-02-DDC95  
**ID**: 7bd2c369-a123-4693-810e-14aff9f850fb  
**Gender**: Male  
**Age**: 67  
**DOB**: September 12, 1958  
**Phone**: +919845087654  
**Email**: vijay.singh@gmail.com  
**Blood Group**: O-  
**Chronic Conditions**: Arthritis, High Cholesterol  
**Current Medications**: Atorvastatin 10mg, Ibuprofen 400mg

---

## Bugs Fixed During Creation

### Bug #1: ActivationStatus Constraint Violation
**Issue**: Database constraint expected lowercase "active" but code had capitalized "Active"  
**File**: `Models/Identity/AppUser.cs`  
**Fix**: Changed default from `"Active"` to `"active"`  
**Status**: ✅ Fixed

### Bug #2: UserStatus Constraint Violation
**Issue**: Multiple files had capitalized status values (Active, Inactive, Suspended) vs lowercase constraint  
**Files Fixed**:
- `Models/Identity/AppUser.cs` - Changed "PendingFirstLogin" → "pending_activation"
- `Program.cs` - Changed "Active" → "active"
- `Controllers/UsersController.cs` - Changed "Active"/"Inactive" → "active"/"inactive"
- `Services/UserService.cs` - Changed "Suspended"/"Active" → "inactive"/"active"  
**Status**: ✅ Fixed

### Bug #3: LINQ Translation Error in Duplicate Detection
**Issue**: EF Core couldn't translate `matches.Any(m => m.Id == p.Id)` to SQL  
**File**: `Services/PatientDuplicateDetectionService.cs`  
**Fix**: Extract matched IDs first using `.Select().ToList()`, then use `Contains()` instead of `Any()`  
**Lines Fixed**: 151, 190, 230  
**Status**: ✅ Fixed

---

## Quick Reference Commands

```powershell
# Get admin token (if needed)
$loginResponse = Invoke-RestMethod -Uri "http://localhost:5073/api/auth/login" -Method Post -Headers @{"Content-Type"="application/json"} -Body '{"email":"admin@test.com","password":"Admin123!","tenantId":"155fe198-6ae5-4a01-9254-ead5b427247e"}'
$global:adminToken = $loginResponse.accessToken

# Set up auth headers
$authHeaders = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer $global:adminToken"
    "X-Tenant-ID" = "155fe198-6ae5-4a01-9254-ead5b427247e"
}
```
