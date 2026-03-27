-- =====================================================
-- COMPLETE PHASE 1 & 2 DATA SEEDING
-- =====================================================
-- Hospital Portal - Execute All Missing Data Seeds
-- Database: hospitalportal @ Azure PostgreSQL 17.6
-- Date: January 23, 2026
-- 
-- This script executes all Phase 1 & 2 data seeding in order:
-- 1. Test Users (30 users across all roles)
-- 2. Sample Clinical Data (100 patients, 200 appointments, etc.)
-- 3. Additional Tenants (5 multi-tenant examples)
-- 4. Medical Specialties (40 departments)
--
-- PREREQUISITES:
-- - 01_employment_tables.sql executed
-- - 02_seed_78_roles.sql executed
-- - 03_seed_role_permissions.sql executed
-- - EF Core migrations applied (96 tables exist)
-- =====================================================

\echo '============================================'
\echo 'PHASE 1 & 2 DATA SEEDING'
\echo 'Hospital Portal - Complete Sample Data'
\echo 'Date: January 23, 2026'
\echo '============================================'
\echo ''

-- =====================================================
-- STEP 1: SEED 30 TEST USERS
-- =====================================================
\echo '▶️  STEP 1/4: Seeding 30 Test Users...'
\i migrations/04_seed_test_users.sql
\echo '✅ Test users seeded'
\echo ''

-- =====================================================
-- STEP 2: SEED SAMPLE CLINICAL DATA
-- =====================================================
\echo '▶️  STEP 2/4: Seeding Sample Clinical Data...'
\echo '   - 100 Patients'
\echo '   - 200 Appointments'
\echo '   - 50 Prescriptions'
\echo '   - 30 Lab Orders'
\echo '   - 20 Imaging Studies'
\echo '   - 15 Surgical Schedules'
\i migrations/05_sample_clinical_data.sql
\echo '✅ Clinical data seeded'
\echo ''

-- =====================================================
-- STEP 3: SEED ADDITIONAL TENANTS
-- =====================================================
\echo '▶️  STEP 3/4: Seeding Additional Tenants...'
\echo '   - Small Clinic (CareFirst - 1 branch, 25 users)'
\echo '   - Large Network (Apollo - 5 branches, 500 users)'
\echo '   - Specialized Hospital (Eye Institute - 3 branches)'
\echo '   - Academic Center (Medical College - 2 branches)'
\echo '   - Rural Facility (Community Center - 1 branch)'
\i migrations/15_additional_tenants.sql
\echo '✅ Additional tenants seeded'
\echo ''

-- =====================================================
-- STEP 4: SEED MEDICAL SPECIALTIES
-- =====================================================
\echo '▶️  STEP 4/4: Seeding Medical Specialties...'
\echo '   - 8 Eye Care Specialties'
\echo '   - 10 General Medical Specialties'
\echo '   - 5 Surgical Specialties'
\echo '   - 12 Diagnostic & Support Departments'
\echo '   - 5 Administrative Departments'
\i migrations/16_medical_specialties.sql
\echo '✅ Medical specialties seeded'
\echo ''

-- =====================================================
-- FINAL VALIDATION
-- =====================================================
\echo '============================================'
\echo 'VALIDATION SUMMARY'
\echo '============================================'

-- Count test users
SELECT 
    COUNT(*) AS total_users,
    COUNT(DISTINCT tenant_id) AS total_tenants
FROM "AspNetUsers"
WHERE deleted_at IS NULL;

-- Count patients
SELECT COUNT(*) AS total_patients
FROM patient
WHERE deleted_at IS NULL;

-- Count appointments
SELECT COUNT(*) AS total_appointments
FROM appointment
WHERE deleted_at IS NULL;

-- Count departments
SELECT COUNT(*) AS total_departments
FROM department
WHERE deleted_at IS NULL;

-- Count branches
SELECT 
    COUNT(*) AS total_branches,
    SUM(total_beds) AS total_bed_capacity,
    SUM(occupied_beds) AS total_occupied
FROM branch
WHERE deleted_at IS NULL;

\echo ''
\echo '============================================'
\echo '✅ PHASE 1 & 2 DATA SEEDING COMPLETE'
\echo '============================================'
\echo ''
\echo 'Next Steps:'
\echo '  1. Run validation: psql ... -f test_database_compliance.sql'
\echo '  2. Verify user count: SELECT COUNT(*) FROM "AspNetUsers";'
\echo '  3. Check tenant distribution: SELECT tenant_id, COUNT(*) FROM patient GROUP BY tenant_id;'
\echo ''
