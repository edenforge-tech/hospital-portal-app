-- =====================================================
-- FIX AUDIT TRIGGER AND UPDATE PERMISSIONS TENANT ID
-- Step 1: Remove conflicting audit trigger
-- Step 2: Delete old incomplete permissions  
-- Step 3: Update tenant ID for new complete set
-- =====================================================

-- STEP 1: Drop the conflicting audit triggers
DROP TRIGGER IF EXISTS audit_permissions_changes ON permissions;
DROP TRIGGER IF EXISTS audit_permissions_trigger ON permissions;
DROP TRIGGER IF EXISTS audit_role_permissions_trigger ON role_permission;

-- Drop the old audit function if it exists
DROP FUNCTION IF EXISTS audit_trigger_function() CASCADE;
DROP FUNCTION IF EXISTS audit_changes_comprehensive() CASCADE;

-- STEP 2: Delete the old incomplete permissions (only 154 existed)
DELETE FROM permissions 
WHERE "TenantId" = '155fe198-6ae5-4a01-9254-ead5b427247e'::uuid;

-- Now update the new complete set (297 permissions) to the correct tenant ID
UPDATE permissions 
SET "TenantId" = '155fe198-6ae5-4a01-9254-ead5b427247e'::uuid
WHERE "TenantId" = '00000000-0000-0000-0000-000000000000'::uuid;

-- Verify the update
SELECT COUNT(*) as total_permissions, 
       COUNT(DISTINCT "Module") as total_modules,
       "TenantId"
FROM permissions 
WHERE "TenantId" = '155fe198-6ae5-4a01-9254-ead5b427247e'::uuid
GROUP BY "TenantId";

-- Show all modules
SELECT DISTINCT "Module" 
FROM permissions 
WHERE "TenantId" = '155fe198-6ae5-4a01-9254-ead5b427247e'::uuid
ORDER BY "Module";
