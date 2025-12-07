-- ============================================
-- MASTER PERMISSIONS SEED SCRIPT
-- Hospital Portal - Complete RBAC Implementation
-- Created: November 10, 2025
-- Total: 297 Granular Permissions across 16 Modules
-- ============================================
-- 
-- USAGE:
--   psql -U postgres -d hospital_portal -f MASTER_PERMISSIONS_SEED.sql
-- 
-- OR from PowerShell:
--   $env:PGPASSWORD="your_password"; psql -U postgres -d hospital_portal -f .\MASTER_PERMISSIONS_SEED.sql
--
-- ============================================

\echo '============================================'
\echo 'HOSPITAL PORTAL - PERMISSIONS SEEDING'
\echo '============================================'
\echo ''
\echo 'Starting permissions seeding process...'
\echo ''

-- Module 1: Patient Management (24 permissions)
\echo '→ Seeding Patient Management permissions (24)...'
\i seed_permissions_patient_management.sql

-- Module 2: Clinical Documentation (20 permissions)
\echo '→ Seeding Clinical Documentation permissions (20)...'
\i seed_permissions_clinical_documentation.sql

-- Module 3: Pharmacy (16 permissions)
\echo '→ Seeding Pharmacy permissions (16)...'
\i seed_permissions_pharmacy.sql

-- Module 4: Lab Diagnostics (16 permissions)
\echo '→ Seeding Lab Diagnostics permissions (16)...'
\i seed_permissions_lab_diagnostics.sql

-- Modules 5-16: All Remaining (154 permissions)
-- Radiology (12), OT Management (14), Appointments (14), Billing (18),
-- Inventory (14), HRM (16), Vendor/Procurement (14), Bed Management (10),
-- Ambulance (8), Document Sharing (18), System Settings (14), Quality (10)
\echo '→ Seeding remaining 12 modules (154 permissions)...'
\i seed_permissions_all_remaining.sql

\echo ''
\echo '============================================'
\echo 'FINAL VERIFICATION'
\echo '============================================'

-- Count permissions by module
SELECT 
    module,
    COUNT(*) as permission_count,
    COUNT(CASE WHEN is_active = true THEN 1 END) as active_count
FROM permissions
GROUP BY module
ORDER BY module;

-- Overall summary
SELECT 
    COUNT(*) as total_permissions,
    COUNT(DISTINCT module) as total_modules,
    COUNT(CASE WHEN is_system_permission = true THEN 1 END) as system_permissions,
    COUNT(CASE WHEN is_active = true THEN 1 END) as active_permissions
FROM permissions;

\echo ''
\echo '============================================'
\echo '✓ PERMISSIONS SEEDING COMPLETE'
\echo '============================================'
\echo ''
\echo 'Next Steps:'
\echo '1. Create 20 roles: Run seed_roles.sql'
\echo '2. Map permissions to roles: Run seed_role_permissions_*.sql'
\echo '3. Verify: SELECT COUNT(*) FROM permissions; (Should be 297+)'
\echo ''
\echo '============================================'
