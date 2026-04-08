-- Check logged-in user's branch assignment
-- Assuming you're logged in as sarah.johnson@hospital.com from earlier tests
SELECT 
    u."FirstName",
    u."LastName",
    u.email,
    ur.branch_id,
    b.name as branch_name
FROM users u
LEFT JOIN app_user_roles ur ON u.id = ur.user_id
LEFT JOIN branch b ON ur.branch_id = b.id
WHERE u.tenant_id = '155fe198-6ae5-4a01-9254-ead5b427247e'
    AND u."UserStatus" = 'active'
    AND u."DeletedAt" IS NULL
    AND (u.email LIKE '%admin%' OR u."FirstName" ILIKE '%sarah%')
ORDER BY u.email;

-- Or show all active users with their branches
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
LIMIT 10;
