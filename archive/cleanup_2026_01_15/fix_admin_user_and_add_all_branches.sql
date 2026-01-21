-- =====================================================
-- FIX ADMIN USER AND ADD USERS FOR ALL BRANCHES
-- =====================================================

-- 1. Fix admin user to show proper name
UPDATE users 
SET 
    "FirstName" = 'System',
    "LastName" = 'Administrator',
    user_name = 'admin@test.com',
    "UpdatedAt" = NOW()
WHERE email = 'admin@test.com' 
AND tenant_id = '155fe198-6ae5-4a01-9254-ead5b427247e';

-- 2. Delete all existing seeded users (keep admin only)
DELETE FROM user_department_access 
WHERE user_id IN (
    SELECT id FROM users 
    WHERE tenant_id = '155fe198-6ae5-4a01-9254-ead5b427247e' 
    AND email NOT LIKE 'admin%'
);

DELETE FROM app_user_roles 
WHERE user_id IN (
    SELECT id FROM users 
    WHERE tenant_id = '155fe198-6ae5-4a01-9254-ead5b427247e' 
    AND email NOT LIKE 'admin%'
);

DELETE FROM users 
WHERE tenant_id = '155fe198-6ae5-4a01-9254-ead5b427247e' 
AND email NOT LIKE 'admin%';

SELECT 'Admin user fixed and old users cleaned up' as status;
