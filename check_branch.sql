-- Check Sarah Johnson's branch assignment
SELECT 
    u."FirstName", 
    u."LastName",
    ur.branch_id,
    b.name as branch_name
FROM users u
JOIN app_user_roles ur ON u.id = ur.user_id
LEFT JOIN branch b ON ur.branch_id = b.id
WHERE u.email = 'sarah.johnson@hospital.com'
  AND u.tenant_id = '155fe198-6ae5-4a01-9254-ead5b427247e';

-- Check what branch the API is searching with
SELECT id, name FROM branch WHERE tenant_id = '155fe198-6ae5-4a01-9254-ead5b427247e';
