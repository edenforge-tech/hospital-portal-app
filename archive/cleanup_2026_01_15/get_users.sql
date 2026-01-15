SELECT id, email, "UserType", "FirstName", "LastName" 
FROM users 
WHERE email LIKE '%test.com' OR "UserType" IN ('Doctor', 'Nurse') 
ORDER BY email
LIMIT 10;
