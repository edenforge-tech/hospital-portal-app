-- Quick check: Show active users and their branches
SELECT 
    u.email,
    ur.branch_id,
    b.name as branch_name
FROM users u
JOIN app_user_roles ur ON u.id = ur.user_id
LEFT JOIN branch b ON ur.branch_id = b.id  
WHERE u.tenant_id = '155fe198-6ae5-4a01-9254-ead5b427247e'
    AND u."UserStatus" = 'active'
    AND u."DeletedAt" IS NULL
LIMIT 5;
