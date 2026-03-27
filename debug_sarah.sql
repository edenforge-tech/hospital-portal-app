-- Check Sarah Johnson's record
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

-- Check what the backend query would match
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
  AND r.name LIKE '%Doctor%'
  AND u."FirstName" ILIKE '%sarah%';
