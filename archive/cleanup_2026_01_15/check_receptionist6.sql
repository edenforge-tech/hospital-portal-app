SELECT 
    email,
    "UserStatus" as user_status,
    activation_status,
    email_verified,
    password_hash IS NOT NULL as has_password,
    "MustChangePasswordOnLogin" as must_change_password,
    must_reset_password
FROM users 
WHERE email IN ('receptionist6@hospital.com', 'aluriswamidass@gmail.com')
ORDER BY email;
