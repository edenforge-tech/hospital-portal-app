-- =====================================================
-- CLEANUP: Keep only India Eye Hospital Network
-- Comprehensive approach with all triggers disabled
-- =====================================================

SET session_replication_role = replica;

BEGIN;

-- Show current tenants
SELECT '=== BEFORE DELETE ===' as step;
SELECT id, name, tenant_code, status FROM tenant ORDER BY name;

-- Delete all tenants EXCEPT the first India Eye Hospital Network
DELETE FROM tenant
WHERE id != '155fe198-6ae5-4a01-9254-ead5b427247e';

-- Show remaining tenant
SELECT '=== AFTER DELETE ===' as step;
SELECT id, name, tenant_code, status, max_users,
       (SELECT COUNT(*) FROM users WHERE tenant_id = tenant.id) as user_count
FROM tenant;

COMMIT;

SET session_replication_role = DEFAULT;

SELECT '✓ SUCCESS: Cleanup completed! Only 1 tenant remains.' as result;
