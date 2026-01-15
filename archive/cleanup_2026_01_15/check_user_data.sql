-- Check user data with status and branch
SELECT 
    u.email,
    u."UserStatus",
    u."FirstName",
    u."LastName",
    r.name as role_name,
    b.name as branch_name,
    aur.branch_id
FROM users u
LEFT JOIN app_user_roles aur ON u.id = aur.user_id
LEFT JOIN app_roles r ON aur.role_id = r.id
LEFT JOIN branch b ON aur.branch_id = b.id
WHERE u.tenant_id = '11111111-1111-1111-1111-111111111111'
ORDER BY u."UserStatus", r.name
LIMIT 10;

-- Check all available roles
SELECT name, "RoleCode" FROM app_roles WHERE tenant_id = '11111111-1111-1111-1111-111111111111' ORDER BY name;
