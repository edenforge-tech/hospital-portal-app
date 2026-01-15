-- =====================================================
-- CLEANUP: Keep only India Eye Hospital Network
-- =====================================================
-- Delete all tenants except INDIA_EYE_NET
-- This will CASCADE delete all related data (users, branches, etc.)
-- =====================================================

BEGIN;

-- Show current tenants before deletion
SELECT 'BEFORE DELETE - All Tenants:' as info;
SELECT id, name, tenant_code, status FROM tenant ORDER BY name;

-- Delete all tenants that are NOT India Eye Hospital Network
DELETE FROM tenant
WHERE tenant_code != 'INDIA_EYE_NET' 
   OR (tenant_code IS NULL AND name != 'India Eye Hospital Network');

-- Show remaining tenant after deletion
SELECT 'AFTER DELETE - Remaining Tenant:' as info;
SELECT id, name, tenant_code, status, max_users FROM tenant;

COMMIT;

SELECT 'Cleanup completed! Only India Eye Hospital Network remains.' as result;
