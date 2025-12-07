# Department Assignment Implementation Complete

**Date**: November 11, 2025  
**Status**: SQL Generation Complete - Ready for Database Execution

---

## ✅ COMPLETED WORK

### 1. API Endpoints Created

**File**: `microservices/auth-service/AuthService/Controllers/UsersController.cs`

**New Endpoints**:
- `POST /api/users/{userId}/departments` - Assign departments to a user
- `GET /api/users/{userId}/departments` - Get user's department assignments

**Changes**:
- Injected `IUserService` into UsersController
- Added bulk department assignment endpoint with full audit trail
- Backend rebuilt successfully (530 warnings, 0 errors)

### 2. SQL Generation Complete

**Generated File**: `insert_department_mappings.sql`

**Contents**:
- 70 INSERT statements into `user_department_access` table
- All records include:
  - Unique UUID for each mapping
  - Tenant ID for multi-tenancy
  - User ID, Department ID, Role ID (from CSV)
  - `is_primary = true` (each user has 1 primary department)
  - `access_level = 'Full'`
  - `status = 'active'`
  - Timestamps: `valid_from`, `assigned_on`, `created_at`, `updated_at`
  - Audit fields: `assigned_by`, `created_by`, `updated_by` (System Administrator)

**Example INSERT**:
```sql
INSERT INTO user_department_access (
    id, tenant_id, user_id, department_id, role_id,
    is_primary, access_level, status,
    valid_from, assigned_on, assigned_by,
    created_at, created_by, updated_at, updated_by
) VALUES (
    '43e5cd99-db8b-473b-b0df-f628b3339050',
    '11111111-1111-1111-1111-111111111111',
    '019a6f1e-80e3-7067-a15a-69bb065055eb',  -- Vikram Reddy
    'e154c960-1b28-42c2-92c0-fae09afe53dd',  -- Cataract Surgery
    '019a6f08-605b-77d2-98ed-a4dc19b15431',  -- Ophthalmologist role
    true,  -- is_primary
    'Full',  -- access_level
    'active',
    NOW(), NOW(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4',
    NOW(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4',
    NOW(), 'fc6b9fc9-2b6d-4166-b844-471d5dc47aa4'
);
```

### 3. Department Distribution Summary

From `user_department_mappings.csv`:

| Department | Staff Count | Roles |
|------------|-------------|-------|
| **Cataract Surgery** | 21 | Ophthalmologists (10), Nurses (6), OT/Ward Managers (5) |
| **Optical Shop** | 22 | Admin, Finance, HR, IT, Pharmacy, Security, Front Office |
| **Eye Imaging Center** | 12 | Optometrists (8), Imaging Techs (3), Biomedical (1) |
| **Pediatric Ophthalmology** | 11 | Doctors (4), Nurses (2), Receptionist (3), Counselor (2) |
| **Laboratory** | 3 | Lab Technicians (3) |
| **Neuro-Ophthalmology** | 1 | Research Fellow (1) |

**Total**: 70 users mapped across 6 active departments (out of 13 available)

---

## 📊 CURRENT STATE

### Data Inventory

| Entity | Count | Status |
|--------|-------|--------|
| Organizations | 3 | ✅ Complete |
| Branches | 6 | ✅ Complete |
| Departments | 13 | ⚠️ Need 20 more (33 total planned) |
| Sub-Departments | 0 | ❌ Not created |
| Roles | 50 (31 in use) | ✅ Complete |
| Users | 70 | ✅ Complete |
| User→Role | 71 assignments | ✅ Complete (persisted) |
| User→Department | 70 mappings | ⏳ **SQL ready, not executed** |
| User→Branch | 0 | ❌ Not started |

---

## 📝 NEXT STEPS

### STEP 6: Execute SQL in Database ⏳

**File**: `insert_department_mappings.sql`

**Execution Options**:

**Option A: Azure Data Studio**
1. Open Azure Data Studio
2. Connect to `hospitalportal` database
3. Open `insert_department_mappings.sql`
4. Execute (F5)

**Option B: psql Command Line**
```bash
psql -h <azure-host> -U <username> -d hospitalportal -f insert_department_mappings.sql
```

**Option C: PostgreSQL Client (pgAdmin)**
1. Connect to database
2. Open Query Tool
3. Load `insert_department_mappings.sql`
4. Execute

**Expected Result**:
```
SET
BEGIN
INSERT 0 1
INSERT 0 1
... (70 times)
COMMIT
```

**Verification Query** (included in SQL file):
```sql
SELECT 
    u.user_name,
    u.first_name || ' ' || u.last_name as full_name,
    d.department_name,
    r.name as role_name,
    uda.access_level,
    uda.is_primary,
    uda.status
FROM user_department_access uda
INNER JOIN "AspNetUsers" u ON uda.user_id = u."Id"
INNER JOIN department d ON uda.department_id = d.id
INNER JOIN "AspNetRoles" r ON uda.role_id = r."Id"
WHERE uda.tenant_id = '11111111-1111-1111-1111-111111111111'
    AND uda.deleted_at IS NULL
ORDER BY d.department_name, u.first_name;
```

---

### STEP 7: Create Sub-Department Hierarchy

**Goal**: Add 20 sub-departments under existing 13 departments

**Proposed Structure**:
```
Laboratory
├── Clinical Pathology
├── Microbiology
└── Biochemistry

Eye Imaging Center
├── OCT Services
├── Fundus Photography
├── B-Scan Ultrasound
└── Perimetry

Optical Shop
├── OP Optical
└── Frame Gallery

Cataract Surgery
├── Main OT
├── Pre-Recovery
├── Post-Recovery
└── Sterilization

(Additional sub-departments for other parent departments)
```

**SQL Changes Needed**:
- `parent_department_id` column already exists in `department` table
- Create 20 new department records with `parent_department_id` set

---

### STEP 8: Branch Assignments

**Goal**: Distribute 70 staff across 6 branches

**Available Branches**:
1. Sankara Nethralaya - Chennai Main
2. Sankara Nethralaya - Chennai Nungambakkam
3. Aravind Eye Hospital - Madurai
4. Aravind Eye Hospital - Pondicherry
5. LVPEI - Hyderabad Banjara Hills
6. LVPEI - Hyderabad Kallam Anji Reddy

**Distribution Plan**: ~12 staff per branch

**Implementation**:
- Check if `user_branch` or `branch_user_access` table exists
- If not, create junction table
- Assign each user to 1 primary branch

---

### STEP 9: Frontend Updates

**Required Changes**:

**A. `/admin/users` Page**
- Display: roles, primary department, branch assignment
- Add filters: by role, by department, by branch
- Add bulk actions: assign role, assign department, assign branch

**B. `/admin/departments` Page**
- Show actual staff count (from `user_department_access`)
- Display department hierarchy (parent/sub-departments)
- Show department head if assigned
- List staff assigned to each department

**C. `/admin/roles` Page**
- Show count of users assigned to each role
- Display list of users with that role
- Add bulk role management actions

**D. Dashboard Widget Updates**
- Update staff count to show actual assigned staff
- Add department distribution chart
- Add role distribution chart

---

## 🔧 TECHNICAL NOTES

### Backend API Issues Encountered

**Problem**: Backend not responding on port 5072 during bulk assignment script execution

**Root Cause**: Process started but not listening on HTTP port (possible startup error)

**Workaround**: Generated SQL script for direct database insertion instead of using API

**Future Fix Needed**:
- Check terminal output where `dotnet run` was executed
- Verify `appsettings.json` configuration
- Ensure no port conflicts
- Check application logs for startup errors

### Alternative Approach Used

Instead of API-based bulk assignment:
1. ✅ Created API endpoints (ready for future use)
2. ✅ Generated SQL INSERT statements from CSV
3. ⏳ Execute SQL directly in database (more reliable)

**Benefits**:
- Bypasses API/network issues
- Transactional (all-or-nothing with BEGIN/COMMIT)
- Faster for bulk operations
- Can be version-controlled and re-run if needed

---

## 📁 FILES CREATED

### Scripts
1. `assign_departments_bulk.ps1` - PowerShell script for API-based assignment (created but not used)
2. `generate_department_sql.ps1` - SQL generation script (executed)
3. `insert_department_mappings.sql` - **70 INSERT statements** ✅ **READY TO EXECUTE**
4. `user_department_mappings.csv` - Source data (70 mappings)

### Documentation
1. This file - Implementation summary

### Backend Changes
1. `Controllers/UsersController.cs` - Added department assignment endpoints

---

## ✅ SUCCESS CRITERIA

### Completed
- [x] API endpoints created for department assignment
- [x] SQL script generated with all 70 mappings
- [x] Mappings include proper tenant isolation
- [x] Audit trail fields populated
- [x] Transaction wrapped (BEGIN/COMMIT)
- [x] Verification queries included

### Pending Execution
- [ ] Execute `insert_department_mappings.sql` in PostgreSQL
- [ ] Verify 70 records inserted successfully
- [ ] Check staff counts per department
- [ ] Test API endpoints with assigned departments

---

## 🎯 IMMEDIATE ACTION REQUIRED

**Execute this command in Azure Data Studio or psql**:

```sql
\i C:\Users\Sam Aluri\Downloads\Hospital Portal\insert_department_mappings.sql
```

**Expected Output**:
```
Total user-department mappings: 70
```

After execution, proceed to Step 7 (Sub-Departments) and Step 8 (Branches).

---

**Last Updated**: November 11, 2025  
**Status**: Ready for database execution
