# Hospital Portal - File Cleanup Plan

## Analysis Summary

### Root Directory Issues
- **75 SQL files** - Most are one-time migrations, fixes, or duplicates
- **30+ PowerShell scripts** - Many duplicates or obsolete
- **80+ Markdown files** - Significant overlap and outdated docs
- **3 HTML files** - TOTP test files (should be in archive)
- **1 JSON file** - users_list.json (should be deleted)
- **2 C# apps** - FixTenantStatusApp, UpdateDatabaseApp (should be deleted)

### Files to KEEP (Essential)

#### Core Configuration
- `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`, `turbo.json`
- `.gitignore`
- `Hospital Portal.sln`
- `README.md` (main documentation)

#### Master SQL Files (KEEP - Already Consolidated)
- `MASTER_DATABASE_MIGRATIONS.sql` - Consolidated all migrations
- `MASTER_PERMISSIONS_SEED.sql` - Consolidated all permission seeds
- `test_database_compliance.sql` - Database validation tests

#### Master PowerShell (KEEP)
- `consolidated/run_all.ps1` - Master script for all operations

#### Essential Documentation (KEEP)
- `README.md` - Main project guide
- `.github/copilot-instructions.md` - AI agent reference
- `consolidated/MASTER_DOCS.md` - Consolidated documentation
- `CLEANUP_COMPLETE.md` - Cleanup summary (this will be updated)
- `TEST_CREDENTIALS.md` - Login credentials

### Files to DELETE

#### SQL Files to Delete (68 files)
**Reason: All migrated to MASTER_DATABASE_MIGRATIONS.sql or obsolete**

**Migration/Schema Changes (obsolete - already in MASTER):**
- add_audit_log_timestamps.sql
- add_body_column_to_notification_logs.sql
- add_compliance_flags_to_audit_log.sql
- add_cost_usd_column.sql
- add_counsellor_role_and_users.sql
- add_device_session_emergency_tables.sql ← NEW, but should be in migrations
- add_missing_organization_fields.sql
- add_tenant_type_column.sql
- add_user_phone_numbers.sql
- add_website_column_to_branch.sql

**One-Time Fixes (obsolete):**
- cleanup_tenants.sql
- clear_rate_limit_again.sql
- clear_rate_limit_for_sam.sql
- delete_extra_tenants.sql
- delete_extra_tenants_fixed.sql
- delete_tenants_final.sql
- drop_audit_trigger.sql
- fix_admin_user_and_add_all_branches.sql
- fix_all_user_status.sql
- fix_audit_log_schema.sql
- fix_department_access_trigger.sql
- fix_notification_logs_complete.sql
- fix_permissions_audit_trigger.sql
- fix_receptionist6_status.sql
- fix_receptionist_mfa_and_permissions.sql
- fix_roles_and_trigger.sql
- fix_tenant_status.sql
- fix_user_activation.sql
- fix_user_branches_backfill.sql
- recreate_notification_logs_final.sql
- reset_user_activation_status.sql
- set_initial_user_status.sql
- update_data_direct.sql
- update_organization_data.sql
- update_permissions_tenant.sql
- update_permissions_tenant_id.sql
- update_real_data.sql
- update_status_fields.sql

**Duplicate Dashboard Permissions:**
- create_dashboard_permissions.sql
- create_dashboard_permissions_final.sql
- create_dashboard_permissions_fixed.sql
- create_notification_logs_table.sql
- create_system_settings_table.sql

**Duplicate Seed Files:**
- seed_all_roles_users.sql
- seed_comprehensive_users.sql
- seed_comprehensive_users_complete.sql
- seed_comprehensive_users_complete_fixed.sql
- seed_dashboard_data.sql
- seed_dashboard_data_corrected.sql
- seed_dashboard_final.sql
- seed_dashboard_minimal.sql
- seed_device_session_emergency_data.sql ← NEW, but already executed
- seed_device_session_perms.sql
- seed_permissions_device_session_fixed.sql
- seed_permissions_device_session_management.sql
- seed_permissions_simple.sql
- seed_sample_data_simple.sql ← NEW, but already executed
- seed_users_comprehensive_v2.sql
- seed_users_final.sql

**Check/Query Files (ad-hoc):**
- assign_device_session_to_admin.sql
- BACKEND_API_REQUIREMENTS.sql
- check_branch_org_data.sql
- check_dashboard_permissions.sql
- check_department_access_schema.sql
- check_mfa_columns.sql
- check_receptionist6.sql
- check_receptionist6_mfa_detailed.sql
- check_receptionist_mfa.sql
- check_receptionist_permissions.sql
- check_user_data.sql
- check_user_mfa_settings.sql
- check_user_status.sql
- get_modules_and_departments.sql
- get_users.sql

#### PowerShell Scripts to Delete (25+ files)
**Reason: Consolidated into consolidated/run_all.ps1**

- add_phones.ps1
- drop_trigger.ps1
- execute_migration.ps1
- fix_tenant_api.ps1
- quick_start_azure_email.ps1
- run_add_phone_numbers.ps1
- run_cleanup_tenants.ps1
- run_database_migrations.ps1
- run_fix_department_trigger.ps1
- run_migration.ps1
- run_update_real_data.ps1
- setup_azure_email.ps1
- test_dashboard_api.ps1
- test_integration.ps1
- test_integration_complete.ps1
- test_integration_fixed.ps1
- test_simple.ps1
- test_totp.ps1
- test_totp_code.ps1
- test_totp_server.ps1

#### Markdown Documentation to Delete (60+ files)
**Reason: Consolidated into README.md and consolidated/MASTER_DOCS.md**

- 100_PERCENT_DATABASE_INTEGRATION_ACHIEVED.md
- ADMIN_MODULES_DATABASE_INTEGRATION_AUDIT.md
- ADVANCED_ACCESS_MANAGEMENT_FEATURES.md
- API_QUICK_REFERENCE.md
- AZURE_EMAIL_MIGRATION_GUIDE.md
- AZURE_EMAIL_MIGRATION_SUMMARY.md
- AZURE_EMAIL_SETUP_GUIDE.md
- BACKEND_IMPLEMENTATION_SUMMARY.md
- DEVICE_SESSION_INTEGRATION_COMPLETE.md
- HIPAA_COMPLIANCE_IMPLEMENTATION.md
- IMPLEMENTATION_GUIDE_PHASE1.md
- IMPLEMENTATION_STATUS.md
- INTEGRATION_SUCCESS.md
- INTEGRATION_TEST_RESULTS.md
- LOGIN_BUG_FIX_SUMMARY.md
- MFA_AND_RBAC_FIX_SUMMARY.md
- MIGRATION_REQUIRED.md
- MULTI_BRANCH_ACTIVATION_RESET_IMPLEMENTATION.md
- PASSWORD_RESET_IMPLEMENTATION.md
- PERMISSIONS_ARCHITECTURE_GUIDE.md
- PERMISSIONS_FINAL_STATUS.md
- PERMISSIONS_IMPLEMENTATION_STATUS.md
- PHASE1_FRONTEND_IMPLEMENTATION_SUMMARY.md
- ROLES_VS_DEPARTMENTS_GUIDE.md
- ROLE_BASED_DASHBOARD_IMPLEMENTATION.md
- ROLE_MANAGEMENT_IMPROVEMENTS.md
- STATUS_LIFECYCLE_IMPLEMENTATION_SUMMARY.md
- TOTP_MFA_IMPLEMENTATION_COMPLETE.md
- UI_REDESIGN_COMPARISON.md
- UI_REDESIGN_SUMMARY.md
- UNIFIED_PERMISSIONS_MANAGEMENT_DESIGN.md
- USER_ACCESS_TAB_GUIDE.md
- USER_LIFECYCLE_GAP_ANALYSIS.md
- USER_MANAGEMENT_UX_DESIGN.md
- USER_STATUS_LIFECYCLE_IMPLEMENTATION.md

#### Other Files to Delete
- FixTenantStatus.csx - C# script (obsolete)
- FixTenantStatusApp/ - Entire C# project (obsolete)
- UpdateDatabaseApp/ - Entire C# project (obsolete)
- totp_qr_code.html - Test file
- totp_qr_code_fresh.html - Test file
- users_list.json - Temporary export
- test_department_assignment.js - Test file

### Files to MOVE to Archive

#### SQL Files to Archive (for reference)
- database_migrations/ folder - Old migration structure (replaced by MASTER)

## Cleanup Actions

### Phase 1: Move to Archive
1. Move all "delete" files to `archive/cleanup_2026_01_15/`
2. Keep archive/manifest.txt updated

### Phase 2: Update Documentation
1. Update CLEANUP_COMPLETE.md with new status
2. Update README.md to remove references to deleted files

### Phase 3: Final Structure
```
Hospital Portal/
├── .github/
├── apps/
├── archive/
│   └── cleanup_2026_01_15/ ← All obsolete files moved here
├── consolidated/
│   ├── MASTER_DOCS.md
│   └── run_all.ps1
├── database_migrations/ ← Move to archive
├── microservices/
├── packages/
├── CLEANUP_COMPLETE.md
├── MASTER_DATABASE_MIGRATIONS.sql
├── MASTER_PERMISSIONS_SEED.sql
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── README.md
├── test_database_compliance.sql
├── TEST_CREDENTIALS.md
└── turbo.json
```

## Expected Results
- Root directory: **15 files** (down from 150+)
- Cleaner, more maintainable structure
- All obsolete files preserved in archive
- Single source of truth for docs and SQL
