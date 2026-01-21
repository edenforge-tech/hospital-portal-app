# Hospital Portal - Automated Cleanup Script
# Created: January 15, 2026
# Purpose: Remove obsolete files and organize project structure

param(
    [switch]$DryRun = $false,  # Preview changes without executing
    [switch]$Execute = $false   # Actually perform the cleanup
)

$rootPath = "c:\Users\Sam Aluri\Downloads\Hospital Portal"
$archivePath = Join-Path $rootPath "archive\cleanup_2026_01_15"

# Ensure we're in the correct directory
Set-Location $rootPath

if (-not $DryRun -and -not $Execute) {
    Write-Host "ERROR: Must specify either -DryRun or -Execute" -ForegroundColor Red
    Write-Host "Usage:" -ForegroundColor Yellow
    Write-Host "  .\cleanup_project.ps1 -DryRun    # Preview changes" -ForegroundColor Yellow
    Write-Host "  .\cleanup_project.ps1 -Execute   # Execute cleanup" -ForegroundColor Yellow
    exit 1
}

# Create archive directory
if ($Execute -and -not (Test-Path $archivePath)) {
    New-Item -ItemType Directory -Path $archivePath -Force | Out-Null
    Write-Host "OK Created archive directory: $archivePath" -ForegroundColor Green
}

# Files to delete (will be moved to archive)
$filesToDelete = @(
    # SQL Migration Files (obsolete)
    "add_audit_log_timestamps.sql",
    "add_body_column_to_notification_logs.sql",
    "add_compliance_flags_to_audit_log.sql",
    "add_cost_usd_column.sql",
    "add_counsellor_role_and_users.sql",
    "add_device_session_emergency_tables.sql",
    "add_missing_organization_fields.sql",
    "add_tenant_type_column.sql",
    "add_user_phone_numbers.sql",
    "add_website_column_to_branch.sql",
    
    # One-Time Fixes
    "cleanup_tenants.sql",
    "clear_rate_limit_again.sql",
    "clear_rate_limit_for_sam.sql",
    "delete_extra_tenants.sql",
    "delete_extra_tenants_fixed.sql",
    "delete_tenants_final.sql",
    "drop_audit_trigger.sql",
    "fix_admin_user_and_add_all_branches.sql",
    "fix_all_user_status.sql",
    "fix_audit_log_schema.sql",
    "fix_department_access_trigger.sql",
    "fix_notification_logs_complete.sql",
    "fix_permissions_audit_trigger.sql",
    "fix_receptionist6_status.sql",
    "fix_receptionist_mfa_and_permissions.sql",
    "fix_roles_and_trigger.sql",
    "fix_tenant_status.sql",
    "fix_user_activation.sql",
    "fix_user_branches_backfill.sql",
    "recreate_notification_logs_final.sql",
    "reset_user_activation_status.sql",
    "set_initial_user_status.sql",
    "update_data_direct.sql",
    "update_organization_data.sql",
    "update_permissions_tenant.sql",
    "update_permissions_tenant_id.sql",
    "update_real_data.sql",
    "update_status_fields.sql",
    
    # Duplicate Permissions
    "create_dashboard_permissions.sql",
    "create_dashboard_permissions_final.sql",
    "create_dashboard_permissions_fixed.sql",
    "create_notification_logs_table.sql",
    "create_system_settings_table.sql",
    
    # Duplicate Seeds
    "seed_all_roles_users.sql",
    "seed_comprehensive_users.sql",
    "seed_comprehensive_users_complete.sql",
    "seed_comprehensive_users_complete_fixed.sql",
    "seed_dashboard_data.sql",
    "seed_dashboard_data_corrected.sql",
    "seed_dashboard_final.sql",
    "seed_dashboard_minimal.sql",
    "seed_device_session_emergency_data.sql",
    "seed_device_session_perms.sql",
    "seed_permissions_device_session_fixed.sql",
    "seed_permissions_device_session_management.sql",
    "seed_permissions_simple.sql",
    "seed_sample_data_simple.sql",
    "seed_users_comprehensive_v2.sql",
    "seed_users_final.sql",
    
    # Check/Query Files
    "assign_device_session_to_admin.sql",
    "BACKEND_API_REQUIREMENTS.sql",
    "check_branch_org_data.sql",
    "check_dashboard_permissions.sql",
    "check_department_access_schema.sql",
    "check_mfa_columns.sql",
    "check_receptionist6.sql",
    "check_receptionist6_mfa_detailed.sql",
    "check_receptionist_mfa.sql",
    "check_receptionist_permissions.sql",
    "check_user_data.sql",
    "check_user_mfa_settings.sql",
    "check_user_status.sql",
    "get_modules_and_departments.sql",
    "get_users.sql",
    
    # PowerShell Scripts
    "add_phones.ps1",
    "drop_trigger.ps1",
    "execute_migration.ps1",
    "fix_tenant_api.ps1",
    "quick_start_azure_email.ps1",
    "run_add_phone_numbers.ps1",
    "run_cleanup_tenants.ps1",
    "run_database_migrations.ps1",
    "run_fix_department_trigger.ps1",
    "run_migration.ps1",
    "run_update_real_data.ps1",
    "setup_azure_email.ps1",
    "test_dashboard_api.ps1",
    "test_integration.ps1",
    "test_integration_complete.ps1",
    "test_integration_fixed.ps1",
    "test_simple.ps1",
    "test_totp.ps1",
    "test_totp_code.ps1",
    "test_totp_server.ps1",
    
    # Markdown Documentation
    "100_PERCENT_DATABASE_INTEGRATION_ACHIEVED.md",
    "ADMIN_MODULES_DATABASE_INTEGRATION_AUDIT.md",
    "ADVANCED_ACCESS_MANAGEMENT_FEATURES.md",
    "API_QUICK_REFERENCE.md",
    "AZURE_EMAIL_MIGRATION_GUIDE.md",
    "AZURE_EMAIL_MIGRATION_SUMMARY.md",
    "AZURE_EMAIL_SETUP_GUIDE.md",
    "BACKEND_IMPLEMENTATION_SUMMARY.md",
    "DEVICE_SESSION_INTEGRATION_COMPLETE.md",
    "HIPAA_COMPLIANCE_IMPLEMENTATION.md",
    "IMPLEMENTATION_GUIDE_PHASE1.md",
    "IMPLEMENTATION_STATUS.md",
    "INTEGRATION_SUCCESS.md",
    "INTEGRATION_TEST_RESULTS.md",
    "LOGIN_BUG_FIX_SUMMARY.md",
    "MFA_AND_RBAC_FIX_SUMMARY.md",
    "MIGRATION_REQUIRED.md",
    "MULTI_BRANCH_ACTIVATION_RESET_IMPLEMENTATION.md",
    "PASSWORD_RESET_IMPLEMENTATION.md",
    "PERMISSIONS_ARCHITECTURE_GUIDE.md",
    "PERMISSIONS_FINAL_STATUS.md",
    "PERMISSIONS_IMPLEMENTATION_STATUS.md",
    "PHASE1_FRONTEND_IMPLEMENTATION_SUMMARY.md",
    "ROLES_VS_DEPARTMENTS_GUIDE.md",
    "ROLE_BASED_DASHBOARD_IMPLEMENTATION.md",
    "ROLE_MANAGEMENT_IMPROVEMENTS.md",
    "STATUS_LIFECYCLE_IMPLEMENTATION_SUMMARY.md",
    "TOTP_MFA_IMPLEMENTATION_COMPLETE.md",
    "UI_REDESIGN_COMPARISON.md",
    "UI_REDESIGN_SUMMARY.md",
    "UNIFIED_PERMISSIONS_MANAGEMENT_DESIGN.md",
    "USER_ACCESS_TAB_GUIDE.md",
    "USER_LIFECYCLE_GAP_ANALYSIS.md",
    "USER_MANAGEMENT_UX_DESIGN.md",
    "USER_STATUS_LIFECYCLE_IMPLEMENTATION.md",
    
    # Other Files
    "FixTenantStatus.csx",
    "totp_qr_code.html",
    "totp_qr_code_fresh.html",
    "users_list.json",
    "test_department_assignment.js"
)

# Directories to delete
$directoriesToDelete = @(
    "FixTenantStatusApp",
    "UpdateDatabaseApp",
    "database_migrations"
)

# Summary counters
$moved = 0
$notFound = 0
$errors = 0

Write-Host "`n========================================" -ForegroundColor Cyan
if ($DryRun) {
    Write-Host "DRY RUN MODE - No files will be modified" -ForegroundColor Yellow
} else {
    Write-Host "EXECUTING CLEANUP - Files will be moved to archive" -ForegroundColor Green
}
Write-Host "========================================`n" -ForegroundColor Cyan

# Process files
Write-Host "Processing $($filesToDelete.Count) files..." -ForegroundColor Cyan
foreach ($file in $filesToDelete) {
    $filePath = Join-Path $rootPath $file
    
    if (Test-Path $filePath) {
        if ($Execute) {
            try {
                Move-Item -Path $filePath -Destination $archivePath -Force
                Write-Host "OK Moved: $file" -ForegroundColor Green
                $moved++
            } catch {
                Write-Host "X Error moving $file : $_" -ForegroundColor Red
                $errors++
            }
        } else {
            Write-Host "> Would move: $file" -ForegroundColor Yellow
            $moved++
        }
    } else {
        Write-Host "- Not found: $file" -ForegroundColor DarkGray
        $notFound++
    }
}

# Process directories
Write-Host "`nProcessing $($directoriesToDelete.Count) directories..." -ForegroundColor Cyan
foreach ($dir in $directoriesToDelete) {
    $dirPath = Join-Path $rootPath $dir
    
    if (Test-Path $dirPath) {
        if ($Execute) {
            try {
                Move-Item -Path $dirPath -Destination $archivePath -Force -Recurse
                Write-Host "OK Moved directory: $dir" -ForegroundColor Green
                $moved++
            } catch {
                Write-Host "X Error moving directory $dir : $_" -ForegroundColor Red
                $errors++
            }
        } else {
            Write-Host "> Would move directory: $dir" -ForegroundColor Yellow
            $moved++
        }
    } else {
        Write-Host "- Directory not found: $dir" -ForegroundColor DarkGray
        $notFound++
    }
}

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "CLEANUP SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Files/Directories processed: $moved" -ForegroundColor Green
Write-Host "Not found (already deleted): $notFound" -ForegroundColor Yellow
Write-Host "Errors: $errors" -ForegroundColor $(if ($errors -gt 0) { "Red" } else { "Green" })

if ($DryRun) {
    Write-Host "`nTo execute the cleanup, run:" -ForegroundColor Yellow
    Write-Host "  .\cleanup_project.ps1 -Execute" -ForegroundColor Cyan
}

if ($Execute) {
    Write-Host "`nOK Cleanup completed successfully!" -ForegroundColor Green
    Write-Host "All files moved to: $archivePath" -ForegroundColor Green
}

Write-Host "========================================`n" -ForegroundColor Cyan
