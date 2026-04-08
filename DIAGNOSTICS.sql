-- =====================================================
-- HOSPITAL PORTAL - DIAGNOSTICS.sql
-- Consolidated diagnostic, debug, and verification queries
-- Merged from 36 individual check/debug/verify scripts
-- Last updated: 2026-03-28
-- =====================================================
-- HOW TO USE: Run individual sections as needed in psql
--   or Azure Data Studio. Each section is self-contained.
-- TENANT ID (test tenant): 155fe198-6ae5-4a01-9254-ead5b427247e
-- =====================================================

-- =====================================================
-- SECTION 1: USERS & AUTH
-- =====================================================

-- 1.1 List users (basic)
SELECT email, user_name FROM users LIMIT 20;

-- 1.2 Admin/system users via AspNet roles
SELECT u.email, u.user_name
FROM users u
JOIN "AspNetUserRoles" ur ON ur."UserId" = u.id
JOIN "AspNetRoles" r ON r."Id" = ur."RoleId"
WHERE r."Name" ILIKE '%admin%' OR r."Name" ILIKE '%system%'
LIMIT 10;

-- 1.3 System admin users (case-insensitive name/email search)
SELECT u.email, u.user_name, u."FirstName", u."LastName", u.tenant_id
FROM users u
WHERE u."FirstName" ILIKE '%system%' OR u."LastName" ILIKE '%admin%'
   OR u.email ILIKE '%system%' OR u.email ILIKE '%portal%' OR u.email ILIKE '%admin%'
LIMIT 10;

-- 1.4 Users per tenant
SELECT t.name, t.id, COUNT(u.id) as user_count
FROM tenant t
LEFT JOIN users u ON u.tenant_id = t.id
WHERE t.deleted_at IS NULL
GROUP BY t.id, t.name
ORDER BY user_count DESC;

-- 1.5 Tenant overview + surgery types distribution
SELECT 'tenants' AS tbl, id, name FROM tenant WHERE deleted_at IS NULL;
SELECT 'surgery_types_tenant_dist' AS tbl, tenant_id, COUNT(*) FROM surgery_types WHERE deleted_at IS NULL AND is_active = TRUE GROUP BY tenant_id;
SELECT 'admin_user_tenant' AS tbl, email, tenant_id FROM users WHERE email = 'admin@test.com';

-- 1.6 Sarah Johnson debug (specific user lookup)
SELECT
    u."FirstName",
    u."LastName",
    u."UserStatus",
    u.email,
    u."DeletedAt",
    r.name as role,
    r."NormalizedName"
FROM users u
JOIN app_user_roles ur ON u.id = ur.user_id
JOIN app_roles r ON ur.role_id = r.id
WHERE u.tenant_id = '155fe198-6ae5-4a01-9254-ead5b427247e'
  AND u."FirstName" ILIKE '%sarah%';

-- 1.7 Active doctors query (what backend uses)
SELECT
    u.id,
    u."FirstName",
    u."LastName",
    u."UserStatus",
    u."DeletedAt",
    r.name as role_name
FROM users u
JOIN app_user_roles ur ON u.id = ur.user_id
JOIN app_roles r ON ur.role_id = r.id
WHERE u.tenant_id = '155fe198-6ae5-4a01-9254-ead5b427247e'
  AND u."DeletedAt" IS NULL
  AND u."UserStatus" = 'active'
  AND r.name LIKE '%Doctor%';


-- =====================================================
-- SECTION 2: PATIENTS & BRANCHES
-- =====================================================

-- 2.1 Active patients list
SELECT
    id, full_name, mrn, phone_number, email,
    date_of_birth, gender, status, created_at
FROM patient
WHERE deleted_at IS NULL AND status = 'active'
ORDER BY created_at DESC
LIMIT 20;

-- 2.2 Patient count
SELECT COUNT(*) as total_active_patients
FROM patient
WHERE deleted_at IS NULL AND status = 'active';

-- 2.3 Patient table schema
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'patient'
ORDER BY ordinal_position;

-- 2.4 Patient branch assignment (example: lookup by name)
SELECT
    id,
    COALESCE(first_name, '') || ' ' || COALESCE(last_name, '') as full_name,
    medical_record_number, branch_id, status
FROM patient
WHERE tenant_id = '155fe198-6ae5-4a01-9254-ead5b427247e'
    AND deleted_at IS NULL
ORDER BY created_at DESC
LIMIT 10;

-- 2.5 Branch list for tenant
SELECT id, name FROM branch WHERE tenant_id = '155fe198-6ae5-4a01-9254-ead5b427247e';

-- 2.6 User-branch assignment (Sarah Johnson)
SELECT
    u."FirstName", u."LastName",
    ur.branch_id, b.name as branch_name
FROM users u
JOIN app_user_roles ur ON u.id = ur.user_id
LEFT JOIN branch b ON ur.branch_id = b.id
WHERE u.email = 'sarah.johnson@hospital.com'
  AND u.tenant_id = '155fe198-6ae5-4a01-9254-ead5b427247e';

-- 2.7 All active users with their branches
SELECT
    u."FirstName" || ' ' || u."LastName" as full_name,
    u.email,
    r.name as role,
    b.name as branch_name,
    ur.branch_id
FROM users u
JOIN app_user_roles ur ON u.id = ur.user_id
JOIN app_roles r ON ur.role_id = r.id
LEFT JOIN branch b ON ur.branch_id = b.id
WHERE u.tenant_id = '155fe198-6ae5-4a01-9254-ead5b427247e'
    AND u."UserStatus" = 'active'
    AND u."DeletedAt" IS NULL
ORDER BY u.email
LIMIT 20;

-- 2.8 Quick user-branch view
SELECT
    u.email, ur.branch_id, b.name as branch_name
FROM users u
JOIN app_user_roles ur ON u.id = ur.user_id
LEFT JOIN branch b ON ur.branch_id = b.id
WHERE u.tenant_id = '155fe198-6ae5-4a01-9254-ead5b427247e'
    AND u."UserStatus" = 'active'
    AND u."DeletedAt" IS NULL
LIMIT 10;


-- =====================================================
-- SECTION 3: DOCTORS
-- =====================================================

-- 3.1 Doctor roles in AspNetRoles
SELECT r."Id", r."Name", r."NormalizedName"
FROM "AspNetRoles" r
WHERE r."NormalizedName" LIKE '%DOCTOR%'
   OR r."NormalizedName" LIKE '%OPHTHAL%'
   OR r."NormalizedName" LIKE '%SURGEON%';

-- 3.2 Users with doctor roles (AspNet path)
SELECT
    u."Id", u."FirstName", u."LastName",
    u."Email", u."UserStatus", u."Specialization", u."LicenseNumber",
    r."Name" as role_name
FROM "AspNetUsers" u
JOIN "AspNetUserRoles" ur ON u."Id" = ur."UserId"
JOIN "AspNetRoles" r ON ur."RoleId" = r."Id"
WHERE u."TenantId" = '155fe198-6ae5-4a01-9254-ead5b427247e'
  AND (r."NormalizedName" LIKE '%DOCTOR%'
    OR r."NormalizedName" LIKE '%OPHTHAL%'
    OR r."NormalizedName" LIKE '%SURGEON%')
  AND u."DeletedAt" IS NULL
  AND u."UserStatus" = 'active';

-- 3.3 Doctor count by role
SELECT
    r."Name" as role_name,
    COUNT(DISTINCT u."Id") as doctor_count
FROM "AspNetRoles" r
LEFT JOIN "AspNetUserRoles" ur ON r."Id" = ur."RoleId"
LEFT JOIN "AspNetUsers" u ON ur."UserId" = u."Id"
    AND u."TenantId" = '155fe198-6ae5-4a01-9254-ead5b427247e'
    AND u."UserStatus" = 'active'
    AND u."DeletedAt" IS NULL
WHERE r."NormalizedName" LIKE '%DOCTOR%'
   OR r."NormalizedName" LIKE '%OPHTHAL%'
   OR r."NormalizedName" LIKE '%SURGEON%'
GROUP BY r."Name"
ORDER BY doctor_count DESC;

-- 3.4 Doctors table with fees
SELECT
    d.id as doctor_id,
    u."FirstName" || ' ' || u."LastName" as doctor_name,
    d.specialization, d.consultation_fee, d.follow_up_consultation_fee,
    d.branch_id, b.name as branch_name
FROM doctors d
JOIN users u ON d.user_id = u.id
LEFT JOIN branch b ON d.branch_id = b.id
WHERE d.tenant_id = '155fe198-6ae5-4a01-9254-ead5b427247e'
    AND u."UserStatus" = 'active'
    AND u."DeletedAt" IS NULL;

-- 3.5 Consultation fees table
SELECT
    cf.id, cf.doctor_id, cf.branch_id, cf.specialty,
    cf.consultation_fee, cf.follow_up_fee, cf.effective_from, cf.is_active
FROM consultation_fees cf
WHERE cf.tenant_id = '155fe198-6ae5-4a01-9254-ead5b427247e'
    AND cf.is_active = true
LIMIT 10;

-- 3.6 Find doctor-related tables
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
    AND (table_name LIKE '%doctor%' OR table_name LIKE '%consult%' OR table_name LIKE '%fee%')
ORDER BY table_name;


-- =====================================================
-- SECTION 4: OT & SURGERY
-- =====================================================

-- 4.1 Admin user + branch check (for OT auth debugging)
SELECT u.id as user_id, u.tenant_id, u."BranchId" as branch_id, ar."Name" as role
FROM users u
JOIN "AspNetUserRoles" aur ON aur."UserId" = u.id
JOIN "AspNetRoles" ar ON ar."Id" = aur."RoleId"
WHERE ar."Name" ILIKE '%admin%'
LIMIT 5;

-- 4.2 OT permission assignment check (AspNet path)
SELECT p.name as permission, ar."Name" as role
FROM app_permissions p
JOIN app_role_permissions rp ON p.id = rp.permission_id
JOIN "AspNetRoles" ar ON ar."Id"::uuid = rp.role_id
WHERE p.name = 'ot.schedules.view'
LIMIT 10;

-- 4.3 OT schedules for current week
SELECT id, status, scheduled_date, tenant_id, "BranchId" as branch_id
FROM ot_schedules
WHERE status IN ('Booked','Confirmed')
  AND scheduled_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
LIMIT 20;

-- 4.4 Alternative OT admin query (app_roles path)
SELECT u.id, u.tenant_id, u.branch_id
FROM users u
INNER JOIN app_user_roles aur ON aur.user_id = u.id
INNER JOIN app_roles ar ON ar.id = aur.role_id
WHERE ar.name ILIKE '%admin%'
LIMIT 5;

-- 4.5 OT schedules (app_roles path)
SELECT id, status, scheduled_date, tenant_id, branch_id
FROM ot_schedules
WHERE status IN ('Booked','Confirmed')
  AND scheduled_date::date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
ORDER BY scheduled_date
LIMIT 10;

-- 4.6 OT permissions (check column naming)
SELECT id, "Name", "Code" FROM permissions WHERE "Name" ILIKE '%ot%' OR "Code" ILIKE '%ot%' ORDER BY "Name";
SELECT id, "Name" FROM permissions LIMIT 5;

-- 4.7 Surgery types for tenant
SELECT
    id, surgery_name, surgery_category, default_price,
    is_active, deleted_at, tenant_id
FROM surgery_types
WHERE tenant_id = '155fe198-6ae5-4a01-9254-ead5b427247e'
    AND deleted_at IS NULL
ORDER BY display_order, surgery_name
LIMIT 20;

-- 4.8 Surgery type counts
SELECT
    COUNT(*) as total_count,
    COUNT(CASE WHEN is_active = true THEN 1 END) as active_count,
    COUNT(CASE WHEN deleted_at IS NOT NULL THEN 1 END) as deleted_count
FROM surgery_types
WHERE tenant_id = '155fe198-6ae5-4a01-9254-ead5b427247e';

-- 4.9 Surgery types table columns
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'surgery_types' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4.10 Cataract surgeries for tenant
SELECT surgery_code, surgery_name, surgery_category, requires_iol, default_price
FROM surgery_types
WHERE tenant_id = '155fe198-6ae5-4a01-9254-ead5b427247e'
  AND deleted_at IS NULL AND is_active = TRUE
  AND surgery_category = 'Cataract'
ORDER BY display_order;

-- 4.11 Find surgery-related tables
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public' AND table_name LIKE '%surgery%'
ORDER BY table_name;

-- 4.12 surgery_category constraint
SELECT conname, pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'surgery_types'::regclass AND conname LIKE '%category%';


-- =====================================================
-- SECTION 5: CONSULTATIONS & BILLING
-- =====================================================

-- 5.1 Active consultation charges
SELECT
    id, branch_id, department_id, specialty, doctor_user_id,
    consultation_fee, follow_up_fee, emergency_consultation_fee,
    is_active, effective_from
FROM consultation_charges
WHERE tenant_id = '155fe198-6ae5-4a01-9254-ead5b427247e'
    AND is_active = true
ORDER BY created_at DESC
LIMIT 10;

-- 5.2 Consultation charges count
SELECT COUNT(*) as total_consultation_charges
FROM consultation_charges
WHERE tenant_id = '155fe198-6ae5-4a01-9254-ead5b427247e';

-- 5.3 Consultation charges by doctor
SELECT
    cc.id,
    u."FirstName" || ' ' || u."LastName" as doctor_name,
    cc.specialty, cc.consultation_fee, cc.follow_up_fee, cc.is_active
FROM consultation_charges cc
JOIN users u ON cc.doctor_user_id = u.id
WHERE cc.tenant_id = '155fe198-6ae5-4a01-9254-ead5b427247e';

-- 5.4 Consultation charges schema
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'consultation_charges' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 5.5 charge_type constraint check
SELECT conname, pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'consultation_charges'::regclass AND conname LIKE '%charge_type%';

-- 5.6 Verify consultation charges (via doctor_id join)
SELECT
    u."FirstName" || ' ' || u."LastName" as doctor_name,
    cc.specialty, cc.consultation_fee, cc.follow_up_fee, cc.is_active
FROM consultation_charges cc
JOIN users u ON cc.doctor_id = u.id
WHERE cc.tenant_id = '155fe198-6ae5-4a01-9254-ead5b427247e'
    AND cc.is_active = true
ORDER BY u."FirstName";


-- =====================================================
-- SECTION 6: COLUMNS & SCHEMA INSPECTION
-- =====================================================

-- 6.1 users table columns
SELECT column_name FROM information_schema.columns WHERE table_name = 'users' ORDER BY ordinal_position;

-- 6.2 permissions + role_permission columns
SELECT column_name FROM information_schema.columns WHERE table_name = 'permissions' ORDER BY ordinal_position;
SELECT column_name FROM information_schema.columns WHERE table_name = 'role_permission' ORDER BY ordinal_position;

-- 6.3 Users with BranchId (check column name variant)
SELECT id, tenant_id, "BranchId" as branch_id FROM users LIMIT 10;

-- 6.4 counseling_sessions columns
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'counseling_sessions' ORDER BY ordinal_position;

-- 6.5 OT finalize schedule with counseling sessions
SELECT ofs.id as ot_id, ofs.counselling_session_id, ofs.status as ot_status
FROM ot_finalize_schedule ofs
WHERE ofs.patient_name ILIKE '%Rajesh%Kumar%' LIMIT 3;

-- 6.6 Role/permission table names
SELECT tablename FROM pg_tables
WHERE schemaname = 'public'
  AND (tablename ILIKE '%user%role%' OR tablename ILIKE '%role%' OR tablename ILIKE '%permission%')
ORDER BY tablename;


-- =====================================================
-- SECTION 7: PERMISSIONS
-- =====================================================

-- 7.1 OT permission existence
SELECT id, "Name", "Code", "Module" FROM permissions WHERE "Name" = 'ot.schedules.view';

-- 7.2 Roles with OT permission (role_permission path)
SELECT rp."RoleId", rp."PermissionId"
FROM role_permission rp
JOIN permissions p ON p.id = rp."PermissionId"
WHERE p."Name" = 'ot.schedules.view'
LIMIT 10;

-- 7.3 Admin/doctor roles via app_roles
SELECT id, name FROM app_roles
WHERE name ILIKE '%admin%' OR name ILIKE '%sysadmin%' OR name ILIKE '%doctor%'
LIMIT 10;

-- 7.4 app_user_roles inspection
SELECT user_id, role_id FROM app_user_roles LIMIT 10;

-- 7.5 OT permission (alternative column check)
SELECT id, "Name" FROM permissions WHERE "Name" = 'ot.schedules.view';

-- 7.6 Roles with OT permission (app_roles path)
SELECT rp.role_id, p.name
FROM role_permission rp
JOIN permissions p ON p.id = rp.permission_id
WHERE p.name = 'ot.schedules.view'
LIMIT 10;


-- =====================================================
-- SECTION 8: DATABASE COMPLIANCE TESTS
-- (Full automated test suite — run all or by section)
-- =====================================================

-- Test 8.1: Soft Delete Column Coverage
DO $$
DECLARE
    missing_tables TEXT[];
    total_tables INT;
    tables_with_soft_delete INT;
BEGIN
    SELECT COUNT(*) INTO total_tables
    FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename NOT LIKE 'AspNet%'
    AND tablename NOT LIKE '__EF%';

    SELECT COUNT(DISTINCT table_name) INTO tables_with_soft_delete
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND column_name IN ('deleted_at', 'deleted_by')
    AND table_name NOT LIKE 'AspNet%'
    AND table_name NOT LIKE '__EF%';

    SELECT ARRAY_AGG(tablename) INTO missing_tables
    FROM pg_tables pt
    WHERE schemaname = 'public'
    AND tablename NOT LIKE 'AspNet%'
    AND tablename NOT LIKE '__EF%'
    AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = pt.tablename AND column_name = 'deleted_at'
    );

    RAISE NOTICE 'TEST 8.1 - Soft Delete Coverage: % / % tables (%%%)',
        tables_with_soft_delete, total_tables,
        ROUND((tables_with_soft_delete::NUMERIC / total_tables * 100), 2);

    IF missing_tables IS NOT NULL THEN
        RAISE NOTICE '  Missing: %', array_to_string(missing_tables, ', ');
    END IF;

    IF tables_with_soft_delete >= (total_tables * 0.95) THEN
        RAISE NOTICE '  PASSED: 95%+ coverage';
    ELSE
        RAISE WARNING '  FAILED: Coverage below 95%%';
    END IF;
END $$;

-- Test 8.2: RLS Coverage
DO $$
DECLARE
    total_tables INT;
    rls_enabled_tables INT;
    coverage NUMERIC;
BEGIN
    SELECT COUNT(*) INTO total_tables
    FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename NOT LIKE 'AspNet%'
    AND tablename NOT LIKE '__EF%';

    SELECT COUNT(*) INTO rls_enabled_tables
    FROM pg_tables pt
    JOIN pg_class pc ON pt.tablename = pc.relname
    JOIN pg_namespace pn ON pc.relnamespace = pn.oid AND pn.nspname = pt.schemaname
    WHERE pt.schemaname = 'public'
    AND pt.tablename NOT LIKE 'AspNet%'
    AND pt.tablename NOT LIKE '__EF%'
    AND pc.relrowsecurity = true;

    coverage := ROUND((rls_enabled_tables::NUMERIC / total_tables * 100), 2);

    RAISE NOTICE 'TEST 8.2 - RLS Coverage: % / % tables (%%%)', rls_enabled_tables, total_tables, coverage;

    IF coverage >= 95 THEN
        RAISE NOTICE '  PASSED: 95%+ RLS coverage';
    ELSE
        RAISE WARNING '  FAILED: Coverage below 95%%';
    END IF;
END $$;

-- Test 8.3: Tables without RLS (identify gaps)
SELECT 'Missing RLS' as test_name, tablename, 'No RLS enabled' as issue
FROM pg_tables pt
JOIN pg_class pc ON pt.tablename = pc.relname
JOIN pg_namespace pn ON pc.relnamespace = pn.oid AND pn.nspname = pt.schemaname
WHERE pt.schemaname = 'public'
AND pt.tablename NOT LIKE 'AspNet%'
AND pt.tablename NOT LIKE '__EF%'
AND pc.relrowsecurity = false
ORDER BY tablename;

-- Test 8.4: RLS Tenant Isolation Policies count
SELECT COUNT(*) as tenant_isolation_policies
FROM pg_policies
WHERE schemaname = 'public' AND policyname LIKE '%tenant_isolation%';

-- Test 8.5: Audit user column coverage
SELECT
    COUNT(DISTINCT CASE WHEN column_name = 'created_by' THEN table_name END) as tables_with_created_by,
    COUNT(DISTINCT CASE WHEN column_name = 'updated_by' THEN table_name END) as tables_with_updated_by
FROM information_schema.columns
WHERE table_schema = 'public'
AND column_name IN ('created_by', 'updated_by')
AND table_name NOT LIKE 'AspNet%';

-- Test 8.6: Audit triggers on critical tables
SELECT
    pc.relname as table_name,
    COUNT(pt.oid) as audit_trigger_count
FROM pg_class pc
LEFT JOIN pg_trigger pt ON pt.tgrelid = pc.oid
LEFT JOIN pg_proc pp ON pt.tgfoid = pp.oid AND pp.proname = 'audit_changes_comprehensive'
WHERE pc.relname IN (
    'appointment', 'prescription', 'clinical_note', 'lab_order',
    'imaging_study', 'encounter', 'consent', 'medication', 'patient',
    'invoice', 'payment', 'insurance_claim', 'users', 'roles', 'permissions'
)
GROUP BY pc.relname
ORDER BY audit_trigger_count DESC, pc.relname;

-- Test 8.7: Overall compliance summary
SELECT
    (SELECT COUNT(DISTINCT table_name) FROM information_schema.columns WHERE table_schema='public' AND column_name='deleted_at' AND table_name NOT LIKE 'AspNet%') as soft_delete_tables,
    (SELECT COUNT(*) FROM pg_tables WHERE schemaname='public' AND tablename NOT LIKE 'AspNet%' AND tablename NOT LIKE '__EF%') as total_tables,
    (SELECT COUNT(*) FROM pg_policies WHERE schemaname='public' AND policyname LIKE '%tenant_isolation%') as rls_policies,
    (SELECT COUNT(*) FROM pg_trigger pt JOIN pg_proc pp ON pt.tgfoid = pp.oid WHERE pp.proname = 'audit_changes_comprehensive') as audit_triggers;
