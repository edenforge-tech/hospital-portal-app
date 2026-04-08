SELECT u.email, u.user_name, u."FirstName", u."LastName", u.tenant_id
FROM users u
WHERE u."FirstName" ILIKE '%system%' OR u."LastName" ILIKE '%admin%' 
   OR u.email ILIKE '%system%' OR u.email ILIKE '%portal%' OR u.email ILIKE '%admin%'
LIMIT 10;
