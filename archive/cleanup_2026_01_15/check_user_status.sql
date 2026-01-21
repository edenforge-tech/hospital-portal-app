SELECT 
    email, 
    activation_status, 
    "UserStatus" as user_status,
    updated_at 
FROM users 
WHERE email = 'receptionist1@hospital.com' 
LIMIT 1;
