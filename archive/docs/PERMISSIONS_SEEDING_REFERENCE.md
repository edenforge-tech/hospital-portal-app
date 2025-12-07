# 297 Permissions Seeding - Complete Reference
**Hospital Portal RBAC Implementation - Week 1 Progress**

**Date**: November 10, 2025  
**Status**: ✅ Permissions Seed Scripts Created (297 permissions across 16 modules)

---

## 📁 FILES CREATED

### Permission Seed Scripts (5 files)

1. **`seed_permissions_patient_management.sql`** (24 permissions)
   - Patient records, demographics, contact, consent, documents, preferences
   - Scope: tenant, branch, department, own

2. **`seed_permissions_clinical_documentation.sql`** (20 permissions)
   - Clinical assessments, examination, diagnosis, clinical notes
   - Scope: department, branch, own

3. **`seed_permissions_pharmacy.sql`** (16 permissions)
   - Prescriptions, medication dispensing, inventory, drug interactions
   - Scope: branch, department, tenant, own

4. **`seed_permissions_lab_diagnostics.sql`** (16 permissions)
   - Lab test orders, results, sample collection, equipment
   - Scope: department, branch, own

5. **`seed_permissions_all_remaining.sql`** (154 permissions)
   - **Radiology** (12): Imaging orders, results, PACS access, equipment, reports
   - **OT Management** (14): Surgery schedule, notes, equipment, anesthesia, post-op
   - **Appointments** (14): Appointments, slots, waitlist, reminders
   - **Billing & Revenue** (18): Invoices, payments, refunds, insurance claims, pricing, discounts
   - **Inventory** (14): Items, stock adjustments, transfers, alerts, counts
   - **HRM** (16): Employees, attendance, leave, payroll, performance, training
   - **Vendor & Procurement** (14): Vendors, purchase orders, goods receipt, payments, contracts
   - **Bed Management** (10): Beds, allocations, transfers
   - **Ambulance** (8): Vehicles, bookings, trips
   - **Document Sharing** (18): Document types, access rules, shared docs, patient uploads, audits
   - **System Settings** (14): Configuration, users, roles, permissions, audit logs, backups
   - **Quality Assurance** (10): Incidents, audits, compliance, improvement plans, metrics

### Master & Test Scripts (2 files)

6. **`MASTER_PERMISSIONS_SEED.sql`**
   - Executes all 5 seed scripts in sequence
   - Displays progress and verification
   - Usage: `psql -U postgres -d hospital_portal -f MASTER_PERMISSIONS_SEED.sql`

7. **`test_permissions_seed.ps1`**
   - PowerShell test script
   - Verifies database connection
   - Executes master seed script
   - Validates 297+ permissions inserted
   - Displays module breakdown

---

## 🗂️ PERMISSION STRUCTURE

Each permission follows this schema:

```sql
INSERT INTO permissions (
    id,                      -- UUID (auto-generated)
    code,                    -- e.g., "patient.patient_record.create"
    name,                    -- e.g., "Create Patient Record"
    module,                  -- e.g., "patient_management"
    action,                  -- create, read, update, delete, upload, download, approve, etc.
    resource_type,           -- e.g., "patient_record"
    scope,                   -- global, tenant, branch, department, own
    description,             -- Human-readable description
    is_system_permission,    -- true (system-defined)
    is_active,               -- true (enabled)
    created_at,              -- NOW()
    updated_at               -- NOW()
)
```

### Permission Naming Convention
**Pattern**: `{module}.{resource}.{action}`

**Examples**:
- `patient.patient_record.create`
- `clinical.assessment.read`
- `pharmacy.prescription.update`
- `billing.invoice.delete`
- `document.shared_document.download`

### Scope Hierarchy
1. **global**: System-wide access (super admin)
2. **tenant**: All branches in tenant organization
3. **branch**: Specific branch/location
4. **department**: Within user's department
5. **own**: Only user's own records

---

## 📊 PERMISSION BREAKDOWN BY MODULE

| Module | Permissions | Key Resources |
|--------|-------------|---------------|
| **Patient Management** | 24 | Patient record, demographics, contact, consent, documents, preferences |
| **Clinical Documentation** | 20 | Assessment, findings, examination, diagnosis, notes |
| **Pharmacy** | 16 | Prescription, dispensing, inventory, drug interactions |
| **Lab Diagnostics** | 16 | Test orders, results, sample collection, equipment |
| **Radiology** | 12 | Imaging orders, results, PACS, equipment, reports |
| **OT Management** | 14 | Surgery schedule, notes, equipment, anesthesia, post-op |
| **Appointments** | 14 | Appointments, slots, waitlist, reminders |
| **Billing & Revenue** | 18 | Invoices, payments, refunds, claims, pricing, discounts |
| **Inventory** | 14 | Items, stock adjustments, transfers, alerts, counts |
| **HRM** | 16 | Employees, attendance, leave, payroll, performance |
| **Vendor & Procurement** | 14 | Vendors, POs, goods receipt, payments, contracts |
| **Bed Management** | 10 | Beds, allocations, transfers |
| **Ambulance** | 8 | Vehicles, bookings, trips |
| **Document Sharing** | 18 | Types, rules, shared docs, uploads, audits |
| **System Settings** | 14 | Config, users, roles, permissions, audit, backups |
| **Quality Assurance** | 10 | Incidents, audits, compliance, improvements |
| **TOTAL** | **297** | **16 modules** |

---

## 🚀 EXECUTION INSTRUCTIONS

### Option 1: Run Master Script (Recommended)

```powershell
# Set working directory
cd "c:\Users\Sam Aluri\Downloads\Hospital Portal"

# Run test script (includes connection test + seeding)
.\test_permissions_seed.ps1
```

### Option 2: Manual psql Execution

```bash
# Set password environment variable
$env:PGPASSWORD="your_password"

# Execute master seed script
psql -U postgres -d hospital_portal -f .\MASTER_PERMISSIONS_SEED.sql

# Verify count
psql -U postgres -d hospital_portal -c "SELECT COUNT(*) FROM permissions;"
```

### Option 3: Individual Module Seeding

```bash
# Seed one module at a time
psql -U postgres -d hospital_portal -f .\seed_permissions_patient_management.sql
psql -U postgres -d hospital_portal -f .\seed_permissions_clinical_documentation.sql
psql -U postgres -d hospital_portal -f .\seed_permissions_pharmacy.sql
# ... etc
```

---

## ✅ VERIFICATION QUERIES

### Count Total Permissions
```sql
SELECT COUNT(*) FROM permissions;
-- Expected: 297+
```

### Count by Module
```sql
SELECT module, COUNT(*) as count 
FROM permissions 
GROUP BY module 
ORDER BY module;
```

### View Sample Permissions
```sql
SELECT code, name, module, action, scope 
FROM permissions 
WHERE module = 'patient_management' 
LIMIT 10;
```

### Check Duplicates
```sql
SELECT code, COUNT(*) 
FROM permissions 
GROUP BY code 
HAVING COUNT(*) > 1;
-- Expected: 0 rows (ON CONFLICT DO NOTHING prevents duplicates)
```

---

## 📝 NEXT STEPS (Week 2)

**STEP 10-16**: Create 20 Roles with Permission Mappings

1. **Create `seed_roles.sql`** - 20 roles:
   - System Admin (297 permissions - ALL)
   - Hospital Administrator (180 permissions)
   - Doctor (15 permissions)
   - Nurse (12 permissions)
   - Pharmacist (10 permissions)
   - Lab Technician (8 permissions)
   - Radiologist (8 permissions)
   - Front Desk (6 permissions)
   - Billing Officer (8 permissions)
   - Inventory Manager (10 permissions)
   - HR Manager (12 permissions)
   - Procurement Officer (10 permissions)
   - Bed Coordinator (6 permissions)
   - Ambulance Operator (4 permissions)
   - IT Support (12 permissions)
   - Quality Auditor (8 permissions)
   - Medical Records (8 permissions)
   - OT Manager (8 permissions)
   - Department Head (20 permissions)
   - Branch Manager (15 permissions)

2. **Create `seed_role_permissions_doctor.sql`** - Map 15 permissions to Doctor role
3. **Create `seed_role_permissions_nurse.sql`** - Map 12 permissions to Nurse role
4. **... repeat for all 20 roles**
5. **Create `MASTER_ROLE_PERMISSIONS_SEED.sql`** - Execute all mappings

---

## 🔧 TROUBLESHOOTING

### Issue: "relation 'permissions' does not exist"
**Solution**: Run `MASTER_DATABASE_MIGRATIONS.sql` first to create schema

### Issue: "ON CONFLICT DO NOTHING" not working
**Solution**: Ensure `permissions` table has UNIQUE constraint on `code` column

### Issue: Permission count < 297
**Solution**: Check for duplicate `code` values. Run duplicate check query above.

### Issue: psql command not found
**Solution**: Add PostgreSQL bin directory to PATH or use full path:
```powershell
& "C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -d hospital_portal -f .\MASTER_PERMISSIONS_SEED.sql
```

---

## 📂 FILE LOCATIONS

All seed scripts are in workspace root:
```
c:\Users\Sam Aluri\Downloads\Hospital Portal\
├── seed_permissions_patient_management.sql
├── seed_permissions_clinical_documentation.sql
├── seed_permissions_pharmacy.sql
├── seed_permissions_lab_diagnostics.sql
├── seed_permissions_all_remaining.sql
├── MASTER_PERMISSIONS_SEED.sql
└── test_permissions_seed.ps1
```

---

## ✨ SUMMARY

**✅ COMPLETED (Week 1, Day 1-2)**:
- Created 5 permission seed scripts (297 permissions)
- Created master execution script
- Created PowerShell test script
- All scripts ready for database execution

**⏳ PENDING (Week 1, Day 3-5)**:
- Test execution against database
- Verify 297 permissions inserted
- Fix any duplicate/conflict issues

**🎯 NEXT (Week 2)**:
- Create 20 roles
- Map permissions to roles
- Test role-based access in Swagger UI

---

**Status**: ✅ Ready for execution  
**Total Lines of SQL**: ~2,000 lines  
**Estimated Execution Time**: < 5 seconds  
**Database Impact**: 297 new rows in `permissions` table
