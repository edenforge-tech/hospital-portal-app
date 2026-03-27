SELECT u.email, u.user_name, u.first_name, u.last_name
FROM users u
WHERE u.first_name ILIKE '%system%' OR u.last_name ILIKE '%admin%' 
   OR u.email ILIKE '%system%' OR u.email ILIKE '%portal%'
LIMIT 10;
