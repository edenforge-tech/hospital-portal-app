# Project-Level Cleanup Plan - February 2026

**Date**: February 1, 2026  
**Purpose**: Clean and organize project root before Phase 1 implementation  
**Target**: Keep only essential active files, archive old/duplicate documentation

---

## 📋 Essential Files to KEEP at Root Level

### **Core Documentation (3 files)**
1. ✅ **README.md** - Main project documentation
2. ✅ **IMPLEMENTATION_GAP_ANALYSIS.md** - Current implementation status & phased roadmap
3. ✅ **IMPLEMENTATION_ROADMAP_QUICK_REFERENCE.md** - Quick reference guide

### **Active Implementation Docs (5 files)**
4. ✅ **COMPLETE_40_MODULE_STRUCTURE.md** - 41-module complete specifications (340KB)
5. ✅ **OPD_FLOW_FINAL_SPECIFICATION.md** - OPD workflow specification (73KB)
6. ✅ **QUICK_START_TESTING.md** - Testing guide (57KB)
7. ✅ **PHASE5_TECHNICAL_DEBT_BACKLOG.md** - Known technical debt items
8. ✅ **TEST_CREDENTIALS.md** - Login credentials for testing

### **Essential Configuration Files**
- ✅ `Hospital Portal.sln` - Solution file
- ✅ `package.json` - Root package configuration
- ✅ `pnpm-lock.yaml` - Dependency lock file
- ✅ `pnpm-workspace.yaml` - Workspace configuration
- ✅ `turbo.json` - Turbo monorepo configuration
- ✅ `.gitignore` - Git ignore rules

### **Active Database Files (Keep at root for quick access)**
- ✅ `MASTER_DATABASE_MIGRATIONS.sql` - Consolidated migrations
- ✅ `MASTER_PERMISSIONS_SEED.sql` - Permission seeding
- ✅ `test_database_compliance.sql` - Compliance validation

**Total Essential Files**: ~15-20 files

---

## 🗑️ Files to ARCHIVE (Move to archive/docs/)

### **Category 1: Duplicate Implementation Status Docs (45 files)**
These files track progress but are now superseded by IMPLEMENTATION_GAP_ANALYSIS.md

**Phase Implementation Status (30 files)**:
- PHASE1_OPD_WORKFLOW_IMPLEMENTATION_COMPLETE.md → Superseded
- PHASE1A_COMPLETE_100_PERCENT.md → Superseded
- PHASE1A_IMPLEMENTATION_STATUS.md → Superseded
- PHASE1A_1C_IMPLEMENTATION_STATUS.md → Superseded
- PHASE1B_COMPLETE_100_PERCENT.md → Superseded
- PHASE1B_IMPLEMENTATION_COMPLETE_JAN27.md → Superseded
- PHASE1C_ADVANCED_IMAGING_COMPLETE.md → Superseded
- PHASE1_2_ACTUAL_STATUS.md → Superseded
- PHASE1_2_CROSSCHECK_COMPLETE.md → Superseded
- PHASE1_DEPLOYMENT_GUIDE.md → Superseded
- PHASE1_REQUIREMENTS_CROSSCHECK.md → Superseded
- PHASE2_100_PERCENT_COMPLETE.md → Superseded
- PHASE2_API_TESTING_GUIDE.md → Superseded
- PHASE2_BACKEND_COMPLETE.md → Superseded
- PHASE2_BACKEND_IMPLEMENTATION_COMPLETE.md → Superseded
- PHASE2_BACKEND_IMPLEMENTATION_SUMMARY.md → Superseded
- PHASE2_COMPLETE_100_PERCENT.md → Superseded
- PHASE2_DATABASE_MIGRATIONS_COMPLETE.md → Superseded
- PHASE2_EXECUTION_SUMMARY.md → Superseded
- PHASE2_IDENTITY_DOCUMENTS_COMPLETE.md → Superseded
- PHASE2_IMPLEMENTATION_PLAN.md → Superseded
- PHASE2_IMPLEMENTATION_PROGRESS.md → Superseded
- PHASE2_IMPLEMENTATION_STARTED.md → Superseded
- PHASE2_MIGRATIONS_COMPLETE.md → Superseded
- PHASE2_TO_PHASE3_TRANSITION.md → Superseded
- PHASE3_API_INTEGRATION_COMPLETE.md → Superseded
- PHASE3_CLINICAL_WORKFLOWS_PLAN.md → Superseded
- PHASE3_COMPLETE_IMPLEMENTATION_GUIDE.md → Superseded
- PHASE3_CROSS_CHECK_ANALYSIS.md → Superseded
- PHASE3_FINAL_STATUS.md → Superseded
- PHASE3_GUARDIAN_COMPLETE.md → Superseded
- PHASE3_IMPLEMENTATION_COMPLETE.md → Superseded
- PHASE3_IMPLEMENTATION_STATUS.md → Superseded
- PHASE3_TESTING_EXECUTION.md → Superseded
- PHASE3_TESTING_MANUAL_GUIDE.md → Superseded
- PHASE3_TESTING_READY.md → Superseded
- PHASE_1B_ARCHITECTURE_PLAN.md → Superseded

**Feature Implementation Tracking (15 files)**:
- ALL_TODOS_IMPLEMENTATION_COMPLETE.md → Superseded
- APPOINTMENT_CALENDAR_IMPLEMENTATION_COMPLETE.md → Superseded
- APPOINTMENTS_100_PERCENT_IMPLEMENTATION_STATUS.md → Superseded
- AUDIT_LOGS_ENHANCEMENT_COMPLETE.md → Superseded
- BRANCH_CAPACITY_IMPLEMENTATION.md → Superseded
- BULK_OPS_LICENSE_MIGRATION_COMPLETE.md → Superseded
- DAY3_PART2_ACCESSIBILITY_COMPLETE.md → Superseded
- DAY3_WORKFLOW_ENFORCEMENT_COMPLETE.md → Superseded
- DAY4_ADVANCED_FEATURES_PROGRESS.md → Superseded
- DAY4_ITEMIZED_BILLING_COMPLETE.md → Superseded
- DAY5_BILL_LOCKING_COMPLETE.md → Superseded
- DAY10_END_TO_END_TESTING_GUIDE.md → Superseded
- FEATURES_COMPLETE_100_PERCENT.md → Superseded
- FINAL_ENHANCEMENTS_COMPLETE.md → Superseded
- IMPLEMENTATION_100_PERCENT_COMPLETE.md → Superseded
- IMPLEMENTATION_COMPLETE.md → Superseded
- IMPLEMENTATION_COMPLETE_PHASE1.md → Superseded
- MODULE7_NEURO_IMPLEMENTATION_COMPLETE.md → Superseded
- PATIENT_PHOTO_PHASE7_IMPLEMENTATION.md → Superseded
- PHASE7_PHOTO_ENHANCEMENTS.md → Superseded
- PERMISSION_SYSTEM_COMPLETE.md → Superseded

---

### **Category 2: Specific Feature Analysis Docs (20 files)**
**Admin Feature Tracking**:
- ADMIN_GAP_CLOSING_FINAL_STATUS.md → Keep (has technical debt info)
- ADMIN_MANAGEMENT_CROSS_CHECK.md → Archive
- ROLE_HIERARCHY_BACKEND_COMPLETE.md → Archive
- TASK3_ROLE_HIERARCHY_FRONTEND_COMPLETE.md → Archive
- TASK4_DEPARTMENT_HIERARCHY_FRONTEND_COMPLETE.md → Archive
- TASKS5-6_CUSTOM_PERMISSION_CREATION_COMPLETE.md → Archive
- TASK7_DOCUMENT_SHARING_BLOCKED.md → Archive
- TASK9_SYSTEM_SETTINGS_BLOCKED.md → Archive
- TASK10_AUDIT_ANALYTICS_COMPLETE.md → Archive
- WEEK11-12_DEPARTMENTS_HIERARCHY_FRONTEND_COMPLETE.md → Archive
- WEEK13_SETTINGS_TESTING_TOOLS_FRONTEND_COMPLETE.md → Archive

**Patient & OPD Workflow Analysis**:
- OPD_FLOW_GAP_ANALYSIS.md → Archive (superseded by OPD_FLOW_FINAL_SPECIFICATION.md)
- OPD_FLOW_IMPLEMENTATION_STATUS.md → Archive
- OPD_IMPLEMENTATION_STATUS_JAN30_2026.md → Archive
- OPD_PRD_CROSSCHECK_COMPLETE.md → Archive
- PATIENT_REGISTRATION_ACTION_PLAN.md → Archive
- PATIENT_REGISTRATION_CROSSCHECK_JAN30_2026.md → Archive
- PATIENT_REGISTRATION_GAP_ANALYSIS.md → Archive
- PATIENT_REGISTRATION_IMPLEMENTATION_STATUS.md → Archive
- PATIENT_REGISTRATION_QUICK_SUMMARY.md → Archive
- VISIT_QUEUE_IMPLEMENTATION_GUIDE.md → Archive

---

### **Category 3: Frontend Implementation Docs (10 files)**
- FE_IMPLEMENTATION_CROSSCHECK.md → Archive
- FE_IMPLEMENTATION_PLAN.md → Archive
- FE_IMPLEMENTATION_PROGRESS.md → Archive
- FE_SEQUENTIAL_IMPLEMENTATION_PLAN.md → Archive
- FRONTEND_GAPS_FIXED_JAN30_2026.md → Archive
- SIDEBAR_BEFORE_AFTER_COMPARISON.md → Archive
- SIDEBAR_REORGANIZATION_PLAN.md → Archive (recent but specific UI task)
- UI_DAY1_PROGRESS.md → Archive
- UI_DAY2_PROGRESS.md → Archive
- UI_DAY3_PROGRESS.md → Archive
- UI_FIXES_COMPLETE.md → Archive
- UI_TESTING_CHECKLIST.md → Archive
- UI_TRANSFORMATION_IMPLEMENTATION_PLAN.md → Archive

---

### **Category 4: Testing & Validation Docs (8 files)**
- ACCESSIBILITY_TESTING_GUIDE.md → Archive
- COMPREHENSIVE_IMPLEMENTATION_CROSSCHECK.md → Archive
- CROSS_CHECK_COMPLETE.md → Archive
- DAY3_DATABASE_MIGRATION_RESULTS.md → Archive
- IMPLEMENTATION_SESSION_SUMMARY.md → Archive
- IMPLEMENTATION_STATUS_CROSSCHECK.md → Archive
- IMPLEMENTATION_STATUS_UPDATE.md → Archive
- IMPLEMENTATION_STATUS_WEEK1-4.md → Archive
- IMPLEMENTATION_SUMMARY_VISUAL.md → Archive
- INTEGRATION_TEST_REPORT.md → Archive
- SESSION_PROGRESS_TRACKING.md → Archive
- TESTING_GUIDE.md → Archive
- TESTING_GUIDE_AUDIT_LOGS.md → Archive
- WEEK3_FEATURES_TESTING_GUIDE.md → Archive

---

### **Category 5: Database & Backend Docs (5 files)**
- BACKEND_FOLLOWUP_IMPLEMENTATION_GUIDE.md → Archive
- DEPARTMENTS_COUNT_INVESTIGATION.md → Archive
- EMPLOYEE_MANAGEMENT_ANALYSIS.md → Archive
- EYE_HOSPITAL_DATABASE_ANALYSIS.md → Archive (66KB - detailed DB analysis, keep for reference)
- EYE_HOSPITAL_IMPLEMENTATION_PLAN.md → Archive (229KB - large historical plan)
- SEEDING_EXECUTION_GUIDE.md → Archive
- SEQUENTIAL_IMPLEMENTATION_PLAN.md → Archive

---

### **Category 6: Old Cleanup Docs (2 files)**
- CLEANUP_COMPLETE.md → Archive (cleanup from Jan 15, 2026)

---

## 🗂️ SQL Files to ARCHIVE (Move to database_migrations/)

### **Ad-hoc SQL Scripts (35+ files)**
All standalone SQL files should move to `database_migrations/` folder:

**Permission & Role Scripts**:
- add_appointments_related_permissions.sql
- add_license_permissions.sql
- add_license_perms_final.sql
- add_license_perms_simple.sql
- add_role_hierarchy.sql
- add_view_permissions.sql
- check_admin_has_permission.sql
- check_admin_permissions.sql
- check_admin_perms.sql
- check_aspnet_roles.sql
- check_role_definition.sql
- check_roles.sql
- complete_permission_mappings.sql
- create_appointment_perms.sql
- final_permission_mapping.sql
- fix_admin_permissions.sql
- fix_admin_permissions_final.sql
- fix_appointment_permissions.sql
- grant_all_permissions_to_admin.sql
- map_final_5_roles.sql
- temp_add_admin_permissions.sql
- temp_add_roles.sql
- temp_check_permissions.sql
- temp_find_admin.sql
- temp_map_permissions.sql
- temp_map_permissions_corrected.sql
- temp_perms_correct_tenant.sql
- temp_query.sql
- temp_seed_permissions.sql
- test_permission.sql
- verify_perms.sql
- verify_role_permissions.sql

**Database Migration Scripts**:
- 08_hipaa_preset_roles.sql
- add_bill_locking.sql
- add_bill_locking_fixed.sql
- add_opd_bill_items_table.sql
- add_phase2_diagnostic_tables.sql
- add_phase2_diagnostic_tables_fixed.sql
- add_phase2_remaining_tables.sql
- day3_database_enhancements.sql
- day3_database_enhancements_corrected.sql
- find_orphan_department.sql
- fix_audit_trigger.sql
- fix_license_tenant.sql
- fix_license_tenant_ids.sql
- fix_role_hierarchy_view.sql
- opd_visit_billing_migration.sql
- phase1_critical_gates_migration.sql
- phase3_database_migrations.sql
- Phase2_FollowUp_Tables.sql
- Phase3_Prescriptions_Tables.sql
- role_hierarchy_templates_migration.sql

**Seed Data Scripts**:
- MASTER_DATA_COMPLETE_SEED.sql
- master_eye_hospital_seed_data.sql
- seed_employees_fixed.sql
- seed_employees_simple.sql
- SEED_PHASE1_2_DATA.sql
- seed_phase1_final.sql
- seed_phase1_fixed.sql
- seed_phase1_test_data.sql
- seed_quick.sql
- seed_test_patients.sql
- seed_today_appointments.sql

---

## 🗂️ PowerShell Scripts to ARCHIVE (Move to database_migrations/)

**Database & Seeding Scripts (8 files)**:
- apply_patient_phase1.ps1
- execute_phase1_migration.ps1
- run_phase1_seed.ps1
- seed_phase1_2_data.ps1
- seed_phase1_simple.ps1
- test_api.ps1
- test_phase3_database.ps1

---

## 📁 Proposed Final Structure

```
Hospital Portal/
├── README.md ⭐
├── IMPLEMENTATION_GAP_ANALYSIS.md ⭐
├── IMPLEMENTATION_ROADMAP_QUICK_REFERENCE.md ⭐
├── COMPLETE_40_MODULE_STRUCTURE.md
├── OPD_FLOW_FINAL_SPECIFICATION.md
├── QUICK_START_TESTING.md
├── PHASE5_TECHNICAL_DEBT_BACKLOG.md
├── TEST_CREDENTIALS.md
│
├── MASTER_DATABASE_MIGRATIONS.sql
├── MASTER_PERMISSIONS_SEED.sql
├── test_database_compliance.sql
│
├── Hospital Portal.sln
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── turbo.json
├── .gitignore
│
├── .github/
│   └── copilot-instructions.md
│
├── apps/
│   └── hospital-portal-web/
│
├── microservices/
│   └── auth-service/
│
├── database_migrations/ ⭐ ALL SQL FILES HERE
│   ├── permissions/
│   │   ├── add_appointments_related_permissions.sql
│   │   ├── add_license_permissions.sql
│   │   └── [30+ permission scripts]
│   ├── schema/
│   │   ├── 08_hipaa_preset_roles.sql
│   │   ├── add_phase2_diagnostic_tables_fixed.sql
│   │   └── [20+ schema migration scripts]
│   ├── seed_data/
│   │   ├── MASTER_DATA_COMPLETE_SEED.sql
│   │   ├── seed_phase1_final.sql
│   │   └── [10+ seed scripts]
│   └── scripts/
│       ├── apply_patient_phase1.ps1
│       ├── run_phase1_seed.ps1
│       └── [5+ PowerShell scripts]
│
├── consolidated/
│   └── run_all.ps1
│
└── archive/
    ├── docs/ ⭐ ALL OLD .MD FILES HERE
    │   ├── phase1/
    │   │   ├── PHASE1A_COMPLETE_100_PERCENT.md
    │   │   └── [30+ Phase 1 docs]
    │   ├── phase2/
    │   │   ├── PHASE2_100_PERCENT_COMPLETE.md
    │   │   └── [20+ Phase 2 docs]
    │   ├── phase3/
    │   │   ├── PHASE3_IMPLEMENTATION_COMPLETE.md
    │   │   └── [15+ Phase 3 docs]
    │   ├── frontend/
    │   │   ├── FE_IMPLEMENTATION_PLAN.md
    │   │   └── [10+ frontend docs]
    │   ├── opd_workflow/
    │   │   ├── OPD_FLOW_GAP_ANALYSIS.md
    │   │   └── [10+ OPD analysis docs]
    │   ├── patient_registration/
    │   │   ├── PATIENT_REGISTRATION_GAP_ANALYSIS.md
    │   │   └── [5+ patient reg docs]
    │   ├── testing/
    │   │   ├── TESTING_GUIDE.md
    │   │   └── [10+ testing docs]
    │   └── admin_features/
    │       ├── ADMIN_MANAGEMENT_CROSS_CHECK.md
    │       └── [10+ admin feature docs]
    └── cleanup_history/
        └── CLEANUP_COMPLETE.md (Jan 15, 2026)
```

---

## 📊 Cleanup Summary

| Category | Files to Archive | Files to Keep |
|----------|-----------------|---------------|
| Documentation (MD) | ~100 files | 8 files |
| SQL Scripts | ~60 files | 3 files (at root) |
| PowerShell Scripts | ~8 files | 0 files (at root) |
| Configuration | 0 files | 6 files |
| **TOTAL** | **~168 files** | **~17 files** |

**Result**: Clean root directory with only essential active files

---

## ✅ Cleanup Actions

### Step 1: Create Archive Subdirectories
```powershell
New-Item -Path "archive/docs/phase1" -ItemType Directory -Force
New-Item -Path "archive/docs/phase2" -ItemType Directory -Force
New-Item -Path "archive/docs/phase3" -ItemType Directory -Force
New-Item -Path "archive/docs/frontend" -ItemType Directory -Force
New-Item -Path "archive/docs/opd_workflow" -ItemType Directory -Force
New-Item -Path "archive/docs/patient_registration" -ItemType Directory -Force
New-Item -Path "archive/docs/testing" -ItemType Directory -Force
New-Item -Path "archive/docs/admin_features" -ItemType Directory -Force
New-Item -Path "archive/cleanup_history" -ItemType Directory -Force
```

### Step 2: Move Phase Implementation Docs
```powershell
Move-Item -Path "PHASE1*.md" -Destination "archive/docs/phase1/" -Force
Move-Item -Path "PHASE2*.md" -Destination "archive/docs/phase2/" -Force
Move-Item -Path "PHASE3*.md" -Destination "archive/docs/phase3/" -Force
```

### Step 3: Move Feature-Specific Docs
```powershell
# Frontend docs
Move-Item -Path "FE_*.md" -Destination "archive/docs/frontend/" -Force
Move-Item -Path "UI_*.md" -Destination "archive/docs/frontend/" -Force
Move-Item -Path "SIDEBAR*.md" -Destination "archive/docs/frontend/" -Force

# OPD workflow docs (except OPD_FLOW_FINAL_SPECIFICATION.md)
Move-Item -Path "OPD_FLOW_GAP_ANALYSIS.md" -Destination "archive/docs/opd_workflow/" -Force
Move-Item -Path "OPD_FLOW_IMPLEMENTATION_STATUS.md" -Destination "archive/docs/opd_workflow/" -Force
Move-Item -Path "OPD_IMPLEMENTATION*.md" -Destination "archive/docs/opd_workflow/" -Force
Move-Item -Path "OPD_PRD*.md" -Destination "archive/docs/opd_workflow/" -Force
Move-Item -Path "VISIT_QUEUE*.md" -Destination "archive/docs/opd_workflow/" -Force

# Patient registration docs
Move-Item -Path "PATIENT_REGISTRATION*.md" -Destination "archive/docs/patient_registration/" -Force
Move-Item -Path "PATIENT_PHOTO*.md" -Destination "archive/docs/patient_registration/" -Force

# Testing docs
Move-Item -Path "*TESTING*.md" -Destination "archive/docs/testing/" -Exclude "QUICK_START_TESTING.md" -Force
Move-Item -Path "INTEGRATION_TEST*.md" -Destination "archive/docs/testing/" -Force

# Admin feature docs
Move-Item -Path "ADMIN_MANAGEMENT*.md" -Destination "archive/docs/admin_features/" -Force
Move-Item -Path "TASK*.md" -Destination "archive/docs/admin_features/" -Force
Move-Item -Path "WEEK*.md" -Destination "archive/docs/admin_features/" -Force
Move-Item -Path "ROLE_HIERARCHY*.md" -Destination "archive/docs/admin_features/" -Force
```

### Step 4: Move SQL Scripts to database_migrations/
```powershell
New-Item -Path "database_migrations/permissions" -ItemType Directory -Force
New-Item -Path "database_migrations/schema" -ItemType Directory -Force
New-Item -Path "database_migrations/seed_data" -ItemType Directory -Force
New-Item -Path "database_migrations/scripts" -ItemType Directory -Force

# Move permission scripts
Move-Item -Path "*permission*.sql" -Destination "database_migrations/permissions/" -Force
Move-Item -Path "*perms*.sql" -Destination "database_migrations/permissions/" -Force
Move-Item -Path "grant_*.sql" -Destination "database_migrations/permissions/" -Force
Move-Item -Path "check_*.sql" -Destination "database_migrations/permissions/" -Force
Move-Item -Path "verify_*.sql" -Destination "database_migrations/permissions/" -Force
Move-Item -Path "map_*.sql" -Destination "database_migrations/permissions/" -Force
Move-Item -Path "temp_*.sql" -Destination "database_migrations/permissions/" -Force

# Move schema migration scripts
Move-Item -Path "add_*.sql" -Destination "database_migrations/schema/" -Force
Move-Item -Path "fix_*.sql" -Destination "database_migrations/schema/" -Force
Move-Item -Path "phase*.sql" -Destination "database_migrations/schema/" -Force
Move-Item -Path "*migration*.sql" -Destination "database_migrations/schema/" -Force
Move-Item -Path "08_*.sql" -Destination "database_migrations/schema/" -Force
Move-Item -Path "day3_*.sql" -Destination "database_migrations/schema/" -Force

# Move seed data scripts
Move-Item -Path "seed_*.sql" -Destination "database_migrations/seed_data/" -Force
Move-Item -Path "SEED_*.sql" -Destination "database_migrations/seed_data/" -Force
Move-Item -Path "master_*.sql" -Destination "database_migrations/seed_data/" -Force
Move-Item -Path "MASTER_DATA*.sql" -Destination "database_migrations/seed_data/" -Force

# Move PowerShell scripts
Move-Item -Path "*.ps1" -Destination "database_migrations/scripts/" -Exclude "run_all.ps1" -Force
```

### Step 5: Move Remaining Docs
```powershell
# Implementation tracking docs
Move-Item -Path "IMPLEMENTATION_*.md" -Destination "archive/docs/" -Exclude "IMPLEMENTATION_GAP_ANALYSIS.md","IMPLEMENTATION_ROADMAP_QUICK_REFERENCE.md" -Force
Move-Item -Path "COMPLETE_IMPLEMENTATION*.md" -Destination "archive/docs/" -Force
Move-Item -Path "COMPREHENSIVE*.md" -Destination "archive/docs/" -Force
Move-Item -Path "CROSS_CHECK*.md" -Destination "archive/docs/" -Force
Move-Item -Path "SESSION*.md" -Destination "archive/docs/" -Force
Move-Item -Path "SEQUENTIAL*.md" -Destination "archive/docs/" -Force

# Feature completion docs
Move-Item -Path "*_COMPLETE*.md" -Destination "archive/docs/" -Exclude "COMPLETE_40_MODULE_STRUCTURE.md" -Force
Move-Item -Path "ALL_TODOS*.md" -Destination "archive/docs/" -Force
Move-Item -Path "APPOINTMENT_CALENDAR*.md" -Destination "archive/docs/" -Force
Move-Item -Path "AUDIT_LOGS*.md" -Destination "archive/docs/" -Force
Move-Item -Path "BRANCH_CAPACITY*.md" -Destination "archive/docs/" -Force
Move-Item -Path "BULK_OPS*.md" -Destination "archive/docs/" -Force
Move-Item -Path "DAY*.md" -Destination "archive/docs/" -Force
Move-Item -Path "FEATURES_*.md" -Destination "archive/docs/" -Force
Move-Item -Path "FINAL_*.md" -Destination "archive/docs/" -Force
Move-Item -Path "MODULE*.md" -Destination "archive/docs/" -Force
Move-Item -Path "PERMISSION_*.md" -Destination "archive/docs/" -Force

# Misc docs
Move-Item -Path "ACCESSIBILITY*.md" -Destination "archive/docs/" -Force
Move-Item -Path "BACKEND_*.md" -Destination "archive/docs/" -Force
Move-Item -Path "DEPARTMENTS_*.md" -Destination "archive/docs/" -Force
Move-Item -Path "EMPLOYEE_*.md" -Destination "archive/docs/" -Force
Move-Item -Path "EYE_HOSPITAL*.md" -Destination "archive/docs/" -Force
Move-Item -Path "SEEDING*.md" -Destination "archive/docs/" -Force

# Cleanup history
Move-Item -Path "CLEANUP_COMPLETE.md" -Destination "archive/cleanup_history/" -Force
```

---

## 🎯 Validation Checklist

After cleanup, root directory should contain ONLY:

### Documentation (8 files)
- [ ] README.md
- [ ] IMPLEMENTATION_GAP_ANALYSIS.md
- [ ] IMPLEMENTATION_ROADMAP_QUICK_REFERENCE.md
- [ ] COMPLETE_40_MODULE_STRUCTURE.md
- [ ] OPD_FLOW_FINAL_SPECIFICATION.md
- [ ] QUICK_START_TESTING.md
- [ ] PHASE5_TECHNICAL_DEBT_BACKLOG.md
- [ ] TEST_CREDENTIALS.md

### Database (3 files)
- [ ] MASTER_DATABASE_MIGRATIONS.sql
- [ ] MASTER_PERMISSIONS_SEED.sql
- [ ] test_database_compliance.sql

### Configuration (6 files)
- [ ] Hospital Portal.sln
- [ ] package.json
- [ ] pnpm-lock.yaml
- [ ] pnpm-workspace.yaml
- [ ] turbo.json
- [ ] .gitignore

### Directories
- [ ] .github/
- [ ] apps/
- [ ] microservices/
- [ ] database_migrations/ (organized with subdirectories)
- [ ] consolidated/
- [ ] archive/ (organized with subdirectories)

**Total**: ~17 files + 6 directories

---

## 📝 Post-Cleanup Documentation Update

Update README.md to reflect new structure:

```markdown
## 📂 Project Structure (Clean & Organized ✅)

Hospital Portal/
├── README.md                          ⭐ Main documentation
├── IMPLEMENTATION_GAP_ANALYSIS.md     📊 Current status & phased roadmap
├── IMPLEMENTATION_ROADMAP_QUICK_REFERENCE.md  🚀 Quick reference
├── COMPLETE_40_MODULE_STRUCTURE.md    📚 41-module specifications
├── OPD_FLOW_FINAL_SPECIFICATION.md    👨‍⚕️ OPD workflow specification
├── QUICK_START_TESTING.md             🧪 Testing guide
├── PHASE5_TECHNICAL_DEBT_BACKLOG.md   ⚠️ Technical debt items
├── TEST_CREDENTIALS.md                🔑 Login credentials
│
├── MASTER_DATABASE_MIGRATIONS.sql     🗄️ Consolidated migrations
├── MASTER_PERMISSIONS_SEED.sql        🔐 Permission seeding
├── test_database_compliance.sql       ✅ Compliance validation
│
├── apps/hospital-portal-web/          # Frontend (Next.js)
├── microservices/auth-service/        # Backend (.NET 8.0)
├── database_migrations/               # All SQL & PowerShell scripts
│   ├── permissions/                   # Permission scripts
│   ├── schema/                        # Schema migrations
│   ├── seed_data/                     # Seed data scripts
│   └── scripts/                       # PowerShell scripts
├── consolidated/                      # Unified runner
└── archive/                           # Historical documentation
    ├── docs/                          # Archived .md files
    └── cleanup_history/               # Previous cleanup records
```

---

**Cleanup Status**: Ready for execution  
**Estimated Time**: 15-20 minutes  
**Risk**: Low (moving to archive, not deleting)
