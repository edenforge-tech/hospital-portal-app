-- =====================================================
-- VERIFY TESTING ENVIRONMENT READINESS
-- =====================================================
-- Run this query to check if your environment is ready for testing
-- =====================================================

-- Check 1: Tenants exist?
SELECT '✓ Tenants Ready' as status, COUNT(*) as count 
FROM tenant 
WHERE tenant_code IN ('USA_HEALTH_HOSP', 'INDIA_EYE_NET', 'UAE_MED_CENTER');

-- Check 2: Roles exist?
SELECT '✓ Roles Ready' as status, COUNT(*) as count 
FROM roles 
WHERE name LIKE '%USA Healthcare%';

-- Check 3: Permissions exist?
SELECT '✓ Permissions Ready' as status, COUNT(*) as count 
FROM permission;

-- Check 4: Role-Permission mappings exist?
SELECT '✓ Role-Permissions Ready' as status, COUNT(*) as count 
FROM role_permission;

-- Check 5: Test users exist?
SELECT '✓ Test Users Status' as status, COUNT(*) as count,
       CASE 
           WHEN COUNT(*) = 0 THEN '⚠️  Need to run create_test_users_for_testing.sql'
           WHEN COUNT(*) = 5 THEN '✅ All 5 test users ready'
           ELSE '⚠️  Incomplete, re-run create_test_users_for_testing.sql'
       END as message
FROM users 
WHERE user_name IN (
    'admin@test.com',
    'doctor@test.com',
    'nurse@test.com',
    'receptionist@test.com',
    'labtech@test.com'
);

-- Detailed test users view
SELECT 
    '✓ Test Users Details' as status,
    u.user_name as email,
    u.first_name || ' ' || u.last_name as full_name,
    r.name as role,
    u.user_status as status,
    u.email_confirmed,
    t.name as tenant,
    t.id as tenant_id
FROM users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
LEFT JOIN roles r ON ur.role_id = r.id
LEFT JOIN tenant t ON u.tenant_id = t.id
WHERE u.user_name IN (
    'admin@test.com',
    'doctor@test.com',
    'nurse@test.com',
    'receptionist@test.com',
    'labtech@test.com'
)
ORDER BY 
    CASE r.name 
        WHEN 'System Admin - USA Healthcare Hospital' THEN 1
        WHEN 'Doctor - USA Healthcare Hospital' THEN 2
        WHEN 'Nurse - USA Healthcare Hospital' THEN 3
        WHEN 'Receptionist - USA Healthcare Hospital' THEN 4
        WHEN 'Technician - USA Healthcare Hospital' THEN 5
        ELSE 6
    END;

-- Get TenantId for API testing
SELECT 
    '🔑 USE THIS TENANT ID' as note,
    id as tenant_id,
    name as tenant_name,
    tenant_code
FROM tenant 
WHERE tenant_code = 'USA_HEALTH_HOSP';

-- Summary
SELECT 
    '📊 ENVIRONMENT READINESS SUMMARY' as summary,
    (SELECT COUNT(*) FROM tenant WHERE tenant_code = 'USA_HEALTH_HOSP') as tenants,
    (SELECT COUNT(*) FROM roles WHERE name LIKE '%USA Healthcare%') as roles,
    (SELECT COUNT(*) FROM permission) as permissions,
    (SELECT COUNT(*) FROM role_permission) as role_permission_mappings,
    (SELECT COUNT(*) FROM users WHERE user_name IN ('admin@test.com','doctor@test.com','nurse@test.com','receptionist@test.com','labtech@test.com')) as test_users,
    CASE 
        WHEN (SELECT COUNT(*) FROM users WHERE user_name IN ('admin@test.com','doctor@test.com','nurse@test.com','receptionist@test.com','labtech@test.com')) = 5 
        THEN '✅ READY TO START TESTING'
        ELSE '⚠️  RUN create_test_users_for_testing.sql FIRST'
    END as status;
