-- Fix doctor UserStatus from 'active' to 'Active'
UPDATE users 
SET "UserStatus" = 'Active' 
WHERE email IN (
    'james.anderson@hospital.com', 
    'sarah.johnson@hospital.com', 
    'rajesh.kumar@hospital.com', 
    'maria.garcia@hospital.com', 
    'jennifer.taylor@hospital.com'
) 
AND tenant_id = '155fe198-6ae5-4a01-9254-ead5b427247e';

-- Verify the update
SELECT "FirstName", "LastName", email, "UserStatus" 
FROM users 
WHERE email IN (
    'james.anderson@hospital.com', 
    'sarah.johnson@hospital.com', 
    'rajesh.kumar@hospital.com', 
    'maria.garcia@hospital.com', 
    'jennifer.taylor@hospital.com'
)
AND tenant_id = '155fe198-6ae5-4a01-9254-ead5b427247e';
