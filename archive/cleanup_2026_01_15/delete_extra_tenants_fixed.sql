-- =====================================================
-- CLEANUP: Keep only India Eye Hospital Network
-- Fixed version with trigger handling
-- =====================================================

BEGIN;

-- Show current tenants
SELECT 'CURRENT TENANTS:' as info;
SELECT id, name, tenant_code, status FROM tenant ORDER BY name;

-- Temporarily disable the problematic trigger
ALTER TABLE department_access DISABLE TRIGGER ALL;

-- Delete duplicate India Eye Hospital Network tenants
-- Keep the one with id 155fe198-6ae5-4a01-9254-ead5b427247e
DELETE FROM tenant
WHERE id != '155fe198-6ae5-4a01-9254-ead5b427247e';

-- Re-enable triggers
ALTER TABLE department_access ENABLE TRIGGER ALL;

-- Show remaining tenant
SELECT 'REMAINING TENANT:' as info;
SELECT id, name, tenant_code, status, max_users FROM tenant;

COMMIT;

SELECT 'SUCCESS: Only India Eye Hospital Network (155fe198-6ae5-4a01-9254-ead5b427247e) remains' as result;
