# Phase 1 & 2 Data Seeding - Quick Execution Guide

**Status:** All migrations created ✅ | Ready to execute 📄

---

## ⚡ Quick Start (5 minutes)

Execute all Phase 1 & 2 data seeding with one command:

```powershell
.\seed_phase1_2_data.ps1
```

This will seed:
- ✓ 30 test users across all 78 roles
- ✓ 100 patients with realistic eye conditions
- ✓ 200 appointments (past/present/future)
- ✓ 50 prescriptions, 30 lab orders, 20 imaging studies
- ✓ 5 additional tenants (multi-tenant examples)
- ✓ 40 medical specialty departments

---

## 📋 What Gets Seeded

### 1. Test Users (30 total)
- **5 Executive:** Super Admin, Hospital Owner, CEO, CMO, CFO
- **8 Clinical:** Ophthalmologists, Surgeons (Cataract, Retina, Glaucoma)
- **4 Optometry:** Chief Optometrist, 2 Optometrists, 1 Assistant
- **3 Nursing:** Head Nurse, 2 Staff Nurses
- **5 Admin:** HR Manager, Front Desk, Medical Records, Billing, Receptionist
- **3 Support:** Housekeeping, Security, IT Support
- **2 External:** Visiting Consultant, External Auditor

**Default Password:** `Test@123456` (all users)

### 2. Sample Clinical Data
- **100 Patients** with eye conditions (cataract, glaucoma, diabetic retinopathy, dry eye, etc.)
- **200 Appointments** (150 completed, 20 today, 30 upcoming)
- **50 Prescriptions** (Latanoprost, Timolol, Prednisolone eye drops)
- **30 Lab Orders** (Blood sugar, OCT scans, Visual field tests)
- **20 Imaging Studies** (Fundus photos, OCT images, Ultrasound)
- **15 Surgical Schedules** (Cataract surgery, Retina surgery, LASIK)

### 3. Additional Tenants (5 types)
- **Small Clinic:** CareFirst (1 branch, 15 beds, 25 users)
- **Large Network:** Apollo Healthcare (5 branches, 630 beds, 500 users)
- **Specialized:** Eye Institute (3 branches, 250 beds)
- **Academic:** Medical College (2 branches, teaching programs)
- **Rural:** Community Center (1 branch, 10 beds)

### 4. Medical Specialties (40 departments)
- **8 Eye Specialties:** Ophthalmology, Retina, Cornea, Glaucoma, Pediatric, Oculoplasty, Neuro-Ophth, Optometry
- **10 General Medical:** Cardiology, Neurology, Orthopedics, ENT, Gastro, Pulmonology, Nephrology, Endocrinology, Oncology, Dermatology
- **5 Surgical:** General Surgery, Cardiac, Neurosurgery, Plastic, Urology
- **12 Diagnostic & Support:** Radiology, Pathology, ICU, Emergency, OT, Anesthesia, Pharmacy, etc.
- **5 Administrative:** Admissions, Medical Records, Billing, IT, Quality Assurance

---

## 🔧 Prerequisites

Before running the seeding script, ensure:

1. **EF Core Migrations Applied**
   ```powershell
   cd microservices\auth-service\AuthService
   dotnet ef database update
   ```

2. **Base Migrations Executed (01-03)**
   - ✅ 01_employment_tables.sql (employment types, employee table)
   - ✅ 02_seed_78_roles.sql (78 roles across 18 categories)
   - ✅ 03_seed_role_permissions.sql (297 permissions mapped)

3. **PostgreSQL Client Installed**
   ```powershell
   psql --version  # Should show PostgreSQL 12+
   ```

4. **Database Connection**
   - Host: hospitalportal-db-server.postgres.database.azure.com
   - Database: hospitalportal
   - User: postgres
   - Port: 5432

---

## 📝 Execution Options

### Option 1: PowerShell Script (Recommended)

```powershell
# Interactive with confirmation
.\seed_phase1_2_data.ps1

# Skip confirmation prompt
.\seed_phase1_2_data.ps1 -SkipConfirmation

# Custom database connection
.\seed_phase1_2_data.ps1 -DatabaseHost "custom-host.com" -DatabaseName "mydb"
```

**Features:**
- ✓ Interactive password prompt (secure)
- ✓ Confirmation before execution
- ✓ Progress indicators
- ✓ Automatic validation summary
- ✓ Error handling with troubleshooting tips

### Option 2: SQL File (Direct)

```bash
# Execute consolidated SQL file
psql -h hospitalportal-db-server.postgres.database.azure.com \
     -U postgres \
     -d hospitalportal \
     -f SEED_PHASE1_2_DATA.sql
```

### Option 3: Individual Migrations (Manual)

```bash
# Execute each migration separately
psql ... -f migrations/04_seed_test_users.sql
psql ... -f migrations/05_sample_clinical_data.sql
psql ... -f migrations/15_additional_tenants.sql
psql ... -f migrations/16_medical_specialties.sql
```

---

## ✅ Verification After Seeding

Run these queries to verify data was seeded correctly:

```sql
-- Test Users (Expected: 30+)
SELECT COUNT(*) AS total_users,
       COUNT(DISTINCT tenant_id) AS total_tenants
FROM "AspNetUsers"
WHERE deleted_at IS NULL;

-- Patients (Expected: 100+)
SELECT COUNT(*) AS total_patients
FROM patient
WHERE deleted_at IS NULL;

-- Appointments (Expected: 200+)
SELECT COUNT(*) AS total_appointments,
       SUM(CASE WHEN appointment_date < CURRENT_DATE THEN 1 ELSE 0 END) AS past,
       SUM(CASE WHEN appointment_date = CURRENT_DATE THEN 1 ELSE 0 END) AS today,
       SUM(CASE WHEN appointment_date > CURRENT_DATE THEN 1 ELSE 0 END) AS upcoming
FROM appointment
WHERE deleted_at IS NULL;

-- Tenants (Expected: 6+)
SELECT COUNT(*) AS total_tenants,
       SUM(total_branches) AS total_branches
FROM tenant
WHERE status = 'active';

-- Departments (Expected: 40+)
SELECT COUNT(*) AS total_departments,
       COUNT(DISTINCT department_category) AS categories
FROM department
WHERE deleted_at IS NULL;

-- Branches with Capacity (Expected: 10+ branches, 1000+ beds)
SELECT COUNT(*) AS total_branches,
       SUM(total_beds) AS total_bed_capacity,
       SUM(occupied_beds) AS total_occupied,
       ROUND(100.0 * SUM(occupied_beds) / NULLIF(SUM(total_beds), 0), 1) AS occupancy_rate
FROM branch
WHERE deleted_at IS NULL;
```

---

## 🧪 Test After Seeding

1. **Login with Test User**
   ```
   URL: http://localhost:3000/auth/login
   Username: superadmin@hospitalportal.com
   Password: Test@123456
   ```

2. **Verify Data in UI**
   - Navigate to Patients → Should see 100+ patients
   - Navigate to Appointments → Should see 200+ appointments
   - Navigate to Departments → Should see 40 departments
   - Navigate to Branches → Should see 10+ branches with capacity data

3. **Check Multi-Tenant Isolation**
   - Login as different tenant user
   - Verify they only see their tenant's data
   - Verify RLS is enforcing tenant isolation

4. **Run Compliance Tests**
   ```powershell
   .\run_tests.ps1
   ```

---

## ⚠️ Troubleshooting

### Error: "psql: command not found"
```powershell
# Install PostgreSQL client
# Windows: Download from https://www.postgresql.org/download/windows/
# Then add to PATH: C:\Program Files\PostgreSQL\16\bin
```

### Error: "password authentication failed"
```powershell
# Verify credentials:
psql -h hospitalportal-db-server.postgres.database.azure.com \
     -U postgres \
     -d hospitalportal \
     -c "SELECT version();"
```

### Error: "relation does not exist"
```powershell
# Ensure base migrations executed:
cd microservices\auth-service\AuthService
dotnet ef database update

# Then execute 01-03 migrations:
psql ... -f migrations/01_employment_tables.sql
psql ... -f migrations/02_seed_78_roles.sql
psql ... -f migrations/03_seed_role_permissions.sql
```

### Error: "duplicate key value violates unique constraint"
```sql
-- Data already seeded. Check existing data:
SELECT COUNT(*) FROM "AspNetUsers";
SELECT COUNT(*) FROM patient;
SELECT COUNT(*) FROM tenant;

-- If needed, clear and re-seed (CAUTION: Deletes all data):
-- TRUNCATE TABLE patient CASCADE;
-- TRUNCATE TABLE appointment CASCADE;
-- etc.
```

---

## 📊 Expected Output

After successful execution, you should see:

```
============================================
VALIDATION SUMMARY
============================================

 total_users | total_tenants
-------------+---------------
          35 |             6
(1 row)

 total_patients
----------------
            120
(1 row)

 total_appointments
--------------------
                215
(1 row)

 total_departments
-------------------
                 42
(1 row)

 total_branches | total_bed_capacity | total_occupied
----------------+--------------------+----------------
             12 |               1285 |            978
(1 row)

============================================
✅ PHASE 1 & 2 DATA SEEDING COMPLETE
============================================
```

---

## 🎉 Next Steps

After seeding is complete:

1. **Start Backend**
   ```powershell
   cd microservices\auth-service\AuthService
   dotnet run
   ```

2. **Start Frontend**
   ```powershell
   cd apps\hospital-portal-web
   pnpm dev
   ```

3. **Access Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5073
   - Swagger: http://localhost:5073/swagger

4. **Run Tests**
   ```powershell
   # Unit tests
   cd AuthService.Tests
   dotnet test

   # E2E tests
   cd tests
   pnpm test
   ```

---

**Document Created:** January 23, 2026  
**Script Version:** 1.0  
**Estimated Execution Time:** 3-5 minutes
